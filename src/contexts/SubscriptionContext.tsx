import { createContext, useContext, useState, ReactNode } from 'react';

type SubscriptionContextType = {
    isPro: boolean;
    upgradeToPro: () => void;
    downgradeToFree: () => void;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    // In a real app, this would check against the database/Stripe
    const [isPro, setIsPro] = useState(false);

    const upgradeToPro = () => {
        setIsPro(true);
        // Simulate API call
        console.log('Upgraded to Pro');
    };

    const downgradeToFree = () => {
        setIsPro(false);
        console.log('Downgraded to Free');
    };

    return (
        <SubscriptionContext.Provider value={{ isPro, upgradeToPro, downgradeToFree }}>
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
