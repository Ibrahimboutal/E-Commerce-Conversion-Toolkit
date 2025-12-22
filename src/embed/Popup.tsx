import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface PopupProps {
    settings: {
        title?: string;
        description?: string;
        buttonText?: string;
        backgroundColor?: string;
        textColor?: string;
        buttonColor?: string;
        buttonTextColor?: string;
    };
}

export const Popup: React.FC<PopupProps> = ({ settings }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasShown, setHasShown] = useState(false);

    useEffect(() => {
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0 && !hasShown) {
                setIsOpen(true);
                setHasShown(true);
            }
        };

        document.addEventListener('mouseleave', handleMouseLeave);
        return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }, [hasShown]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{
                backgroundColor: settings.backgroundColor || '#ffffff',
                color: settings.textColor || '#000000',
                padding: '40px',
                borderRadius: '12px',
                maxWidth: '500px',
                width: '90%',
                position: 'relative',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                textAlign: 'center'
            }}>
                <button
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: 'inherit',
                        opacity: 0.6
                    }}
                >
                    <X size={20} />
                </button>

                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
                    {settings.title || 'Wait! Before you go...'}
                </h2>
                <p style={{ fontSize: '16px', marginBottom: '24px', opacity: 0.9 }}>
                    {settings.description || 'Get 10% off your first order when you sign up for our newsletter!'}
                </p>

                <button style={{
                    backgroundColor: settings.buttonColor || '#000000',
                    color: settings.buttonTextColor || '#ffffff',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'opacity 0.2s'
                }}>
                    {settings.buttonText || 'Claim My Discount'}
                </button>
            </div>
        </div>
    );
};
