import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, CheckCircle2, Clock, MousePointer2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

type EmailLog = {
    id: string;
    email: string;
    subject: string;
    sent_at: string;
    opened: boolean;
    clicked: boolean;
    cart_id: string;
};

export default function EmailLogs() {
    const [logs, setLogs] = useState<EmailLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const { data, error } = await supabase
                .from('email_logs')
                .select('*')
                .order('sent_at', { ascending: false });

            if (error) throw error;
            setLogs(data || []);
        } catch (error) {
            console.error('Error fetching email logs:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Email Recovery Logs</h2>
                    <p className="text-slate-500 dark:text-slate-400">Track the performance of your automated recovery emails.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Open Rate</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                {logs.length > 0 ? Math.round((logs.filter(l => l.opened).length / logs.length) * 100) : 0}%
                            </p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                            <MousePointer2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Click Rate</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">
                                {logs.length > 0 ? Math.round((logs.filter(l => l.clicked).length / logs.length) * 100) : 0}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recipient</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sent At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        <Mail className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                        <p>No recovery emails sent yet.</p>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log, i) => (
                                    <motion.tr
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={log.id}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900 dark:text-white">{log.email}</span>
                                                <span className="text-xs text-slate-400">ID: {log.cart_id.slice(0, 8)}...</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {log.subject}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <StatusBadge active={true} icon={CheckCircle2} label="Sent" color="emerald" />
                                                <StatusBadge active={log.opened} icon={Eye} label="Opened" color="blue" />
                                                <StatusBadge active={log.clicked} icon={MousePointer2} label="Clicked" color="purple" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 opacity-40" />
                                                {format(new Date(log.sent_at), 'MMM d, h:mm a')}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ active, icon: Icon, label, color }: { active: boolean; icon: any; label: string; color: string }) {
    if (!active) {
        return (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 uppercase tracking-tighter">
                {label}
            </span>
        );
    }

    const colors: Record<string, string> = {
        emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
        blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
    };

    return (
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${colors[color]} uppercase tracking-tighter`}>
            <Icon className="w-2.5 h-2.5" />
            {label}
        </span>
    );
}
