/**
 * Environment variable validation and type-safe access
 */

interface EnvVars {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
}

class EnvironmentError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'EnvironmentError';
    }
}

/**
 * Validates that all required environment variables are present
 * @throws {EnvironmentError} If any required environment variable is missing
 */
function validateEnv(): EnvVars {
    const requiredVars = [
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY',
    ] as const;

    const missing: string[] = [];
    const env: Partial<EnvVars> = {};

    for (const varName of requiredVars) {
        const value = import.meta.env[varName];

        if (!value || value === '' || value === 'undefined') {
            missing.push(varName);
        } else {
            env[varName] = value;
        }
    }

    if (missing.length > 0) {
        throw new EnvironmentError(
            `Missing required environment variables:\n${missing
                .map((v) => `  - ${v}`)
                .join('\n')}\n\nPlease check your .env file and ensure all required variables are set.`
        );
    }

    return env as EnvVars;
}

/**
 * Validated environment variables
 */
export const env = validateEnv();

/**
 * Check if running in development mode
 */
export const isDevelopment = import.meta.env.DEV;

/**
 * Check if running in production mode
 */
export const isProduction = import.meta.env.PROD;

/**
 * Get the current environment name
 */
export const environmentName = import.meta.env.MODE || 'development';

/**
 * Utility to safely get environment variables with fallback
 */
export function getEnv(key: keyof EnvVars, fallback?: string): string {
    return env[key] || fallback || '';
}
