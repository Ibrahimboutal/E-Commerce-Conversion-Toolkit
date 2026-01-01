import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { AbandonedCart, CartItem } from '../lib/supabase';
import { notify } from '../lib/errorHandling';

export type CartWithItems = AbandonedCart & {
    items: CartItem[];
};

async function fetchAbandonedCarts() {
    const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .maybeSingle();

    if (storeError) throw storeError;
    if (!store) return [];

    const { data, error } = await supabase
        .from('abandoned_carts')
        .select('*, items:cart_items(*)')
        .eq('store_id', store.id)
        .order('abandoned_at', { ascending: false });

    if (error) throw error;

    // Transform the data to match expected type if necessary, 
    // but supabase join returns items as an array property on the cart object
    return data as CartWithItems[];
}

export function useAbandonedCarts() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['abandonedCarts'],
        queryFn: fetchAbandonedCarts,
    });

    const sendReminderMutation = useMutation({
        mutationFn: async (cartId: string) => {
            const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-cart-reminder`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cart_id: cartId }),
            });

            if (!response.ok) {
                throw new Error('Failed to send reminder');
            }
            return cartId;
        },
        onSuccess: () => {
            notify.success('Reminder sent successfully!');
            queryClient.invalidateQueries({ queryKey: ['abandonedCarts'] });
        },
        onError: (error) => {
            notify.error(error);
        },
    });

    const markRecoveredMutation = useMutation({
        mutationFn: async (cartId: string) => {
            const { error } = await supabase
                .from('abandoned_carts')
                .update({ recovered: true, recovered_at: new Date().toISOString() })
                .eq('id', cartId);

            if (error) throw error;
            return cartId;
        },
        onSuccess: () => {
            notify.success('Cart marked as recovered!');
            queryClient.invalidateQueries({ queryKey: ['abandonedCarts'] });
        },
        onError: (error) => {
            notify.error(error);
        },
    });

    return {
        ...query,
        sendReminder: sendReminderMutation.mutate,
        isSendingReminder: sendReminderMutation.isPending,
        sendingReminderId: sendReminderMutation.variables,
        markRecovered: markRecoveredMutation.mutate,
        isMarkingRecovered: markRecoveredMutation.isPending,
    };
}
