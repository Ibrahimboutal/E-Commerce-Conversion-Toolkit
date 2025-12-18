import { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { motion } from 'framer-motion';

type ProGuardProps = {
    children: ReactNode;
    title?: string;
    description?: string;
};

export default function ProGuard({
    children,
    title = "Pro Feature Locked",
    description = "Upgrade to Pro to access this advanced feature."
}: ProGuardProps) {
    const { isPro, upgradeToPro } = useSubscription();

    if (isPro) {
        return <>{children}</>;
    }

    return (
        <div className="relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="blur-sm pointer-events-none select-none opacity-50 p-4">
                {children}
            </div>

            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-[2px]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 text-center max-w-sm mx-4"
                >
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">{description}</p>
                    <button
                        onClick={upgradeToPro}
                        className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-500/20"
                    >
                        Upgrade to Pro
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
