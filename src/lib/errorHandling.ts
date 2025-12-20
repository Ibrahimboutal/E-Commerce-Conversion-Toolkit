import { PostgrestError } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

/**
 * Error handling utilities for consistent error management
 */

export class AppError extends Error {
    constructor(
        message: string,
        public code?: string,
        public statusCode?: number
    ) {
        super(message);
        this.name = 'AppError';
    }
}

/**
 * Parse Supabase PostgreSQL errors into user-friendly messages
 */
export function parseSupabaseError(error: PostgrestError): string {
    const errorMap: Record<string, string> = {
        '23505': 'This record already exists',
        '23503': 'Cannot delete this record as it is referenced by other data',
        '23502': 'Required field is missing',
        '22P02': 'Invalid data format',
        '42501': 'You do not have permission to perform this action',
        'PGRST116': 'No rows found',
    };

    // Check for specific error codes
    if (error.code && errorMap[error.code]) {
        return errorMap[error.code];
    }

    // Check for constraint violations
    if (error.message.includes('duplicate key')) {
        return 'This record already exists';
    }

    if (error.message.includes('foreign key')) {
        return 'Cannot perform this action due to related data';
    }

    if (error.message.includes('violates check constraint')) {
        return 'Invalid data provided';
    }

    // Return a generic message for unknown errors
    return error.message || 'An unexpected error occurred';
}

/**
 * Parse authentication errors into user-friendly messages
 */
export function parseAuthError(error: any): string {
    const message = error.message?.toLowerCase() || '';

    if (message.includes('invalid login credentials')) {
        return 'Invalid email or password';
    }

    if (message.includes('email not confirmed')) {
        return 'Please confirm your email address before signing in';
    }

    if (message.includes('user already registered')) {
        return 'An account with this email already exists';
    }

    if (message.includes('password should be at least')) {
        return 'Password must be at least 6 characters long';
    }

    if (message.includes('invalid email')) {
        return 'Please enter a valid email address';
    }

    if (message.includes('signups not allowed')) {
        return 'New signups are currently disabled';
    }

    if (message.includes('email rate limit')) {
        return 'Too many attempts. Please try again later';
    }

    return error.message || 'Authentication failed';
}

/**
 * Parse network errors
 */
export function parseNetworkError(error: any): string {
    if (!navigator.onLine) {
        return 'No internet connection. Please check your network and try again';
    }

    if (error.message?.includes('fetch')) {
        return 'Unable to connect to the server. Please try again';
    }

    if (error.message?.includes('timeout')) {
        return 'Request timed out. Please try again';
    }

    return 'Network error occurred. Please try again';
}

/**
 * Generic error parser that routes to specific parsers
 */
export function parseError(error: any): string {
    // Check error type and route to appropriate parser
    if (error?.code?.startsWith('PGRST') || error?.code?.match(/^\d+$/)) {
        return parseSupabaseError(error);
    }

    if (error?.message?.includes('auth') || error?.status === 401) {
        return parseAuthError(error);
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
        return parseNetworkError(error);
    }

    // Default to error message or generic message
    return error?.message || 'An unexpected error occurred';
}

/**
 * Toast notification wrapper with error handling
 */
export const notify = {
    success: (message: string) => {
        toast.success(message, {
            duration: 3000,
            position: 'top-right',
        });
    },

    error: (error: any) => {
        const message = parseError(error);
        toast.error(message, {
            duration: 5000,
            position: 'top-right',
        });
    },

    info: (message: string) => {
        toast(message, {
            duration: 3000,
            position: 'top-right',
            icon: 'ℹ️',
        });
    },

    loading: (message: string) => {
        return toast.loading(message, {
            position: 'top-right',
        });
    },

    promise: async <T,>(
        promise: Promise<T>,
        {
            loading,
            success,
            error,
        }: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: any) => string);
        }
    ) => {
        return toast.promise(
            promise,
            {
                loading,
                success,
                error: (err) => {
                    const errorMessage = typeof error === 'function' ? error(err) : error;
                    return parseError(err) || errorMessage;
                },
            },
            {
                position: 'top-right',
            }
        );
    },
};

/**
 * Async error boundary wrapper
 */
export async function withErrorHandling<T>(
    fn: () => Promise<T>,
    errorMessage = 'An error occurred'
): Promise<T | null> {
    try {
        return await fn();
    } catch (error) {
        console.error(errorMessage, error);
        notify.error(error);
        return null;
    }
}

/**
 * Log error to console in development
 */
export function logError(context: string, error: any) {
    if (import.meta.env.DEV) {
        console.group(`🚨 Error in ${context}`);
        console.error(error);
        console.groupEnd();
    }
}
