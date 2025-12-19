import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, Store } from '../lib/supabase';
import { useAuth } from './AuthContext';

type SubscriptionContextType = {
    isPro: boolean;
    store: Store | null;
    isCheckoutOpen: boolean;
    loading: boolean;
    openCheckout: () => void;
    closeCheckout: () => void;
    checkSubscription: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [store, setStore] = useState<Store | null>(null);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkSubscription = async () => {
        if (!user) return;

        try {
            const { data } = await supabase
                .from('stores')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (data) {
                setStore(data);
            }
        } catch (error) {
            console.error('Error fetching subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkSubscription();

        // Subscribe to changes
        const subscription = supabase
            .channel('public:stores')
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'stores', filter: user ? `user_id=eq.${user.id}` : undefined },
                (payload) => {
                    setStore(payload.new as Store);
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [user]);

    const isPro = store?.subscription_tier === 'pro' && store?.subscription_status === 'active';

    const openCheckout = () => setIsCheckoutOpen(true);
    const closeCheckout = () => setIsCheckoutOpen(false);

    return (
        <SubscriptionContext.Provider value={{
            isPro,
            store,
            isCheckoutOpen,
            loading,
            openCheckout,
            closeCheckout,
            checkSubscription
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
}
