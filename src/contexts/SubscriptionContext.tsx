import { createContext, useContext, useState, ReactNode } from 'react';

type SubscriptionContextType = {
    isPro: boolean;
    isCheckoutOpen: boolean;
    openCheckout: () => void;
    closeCheckout: () => void;
    completeCheckout: () => void;
    downgradeToFree: () => void;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    const [isPro, setIsPro] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const openCheckout = () => setIsCheckoutOpen(true);
    const closeCheckout = () => setIsCheckoutOpen(false);

    const completeCheckout = () => {
        setIsPro(true);
        setIsCheckoutOpen(false);
    };

    const downgradeToFree = () => {
        setIsPro(false);
    };

    return (
        <SubscriptionContext.Provider value={{
            isPro,
            isCheckoutOpen,
            openCheckout,
            closeCheckout,
            completeCheckout,
            downgradeToFree
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
