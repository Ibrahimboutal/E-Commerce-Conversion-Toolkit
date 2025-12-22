import React, { useState, useEffect } from 'react';
import { MessageSquare, Star } from 'lucide-react';

interface SocialProofProps {
    storeId: string;
    settings: {
        position?: 'bottom-left' | 'bottom-right';
        backgroundColor?: string;
        textColor?: string;
        showRecentPurchase?: boolean;
        showReviews?: boolean;
    };
}

export const SocialProof: React.FC<SocialProofProps> = ({ settings }) => {
    const [currentReview, setCurrentReview] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    // Mock data for now - in real implementation this would fetch from Supabase
    const reviews = [
        { name: 'John D.', text: 'Best purchase ever!', rating: 5 },
        { name: 'Sarah M.', text: 'Quality is amazing.', rating: 5 },
        { name: 'Alex K.', text: 'Fast shipping, love it.', rating: 4 },
    ];

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 3000);
        const interval = setInterval(() => {
            setCurrentReview((prev) => (prev + 1) % reviews.length);
        }, 8000);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [reviews.length]);

    if (!isVisible) return null;

    const review = reviews[currentReview];

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            left: settings.position === 'bottom-left' ? '24px' : 'auto',
            right: settings.position === 'bottom-right' ? '24px' : 'auto',
            backgroundColor: settings.backgroundColor || '#ffffff',
            color: settings.textColor || '#000000',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '300px',
            zIndex: 999998,
            transition: 'all 0.5s ease-in-out',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{
                backgroundColor: '#EBF5FF',
                borderRadius: '50%',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <MessageSquare size={20} color="#3B82F6" />
            </div>

            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < review.rating ? '#FBBF24' : 'none'} color="#FBBF24" />
                    ))}
                </div>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px' }}>{review.name}</p>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>{review.text}</p>
            </div>
        </div>
    );
};
