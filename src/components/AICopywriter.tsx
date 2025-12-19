import { useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw, Wand2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProGuard from './ProGuard';

export default function AICopywriter() {
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState<'urgent' | 'friendly' | 'curious'>('friendly');
    const [generated, setGenerated] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    const generateLines = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('generate-copy', {
                body: { topic, tone }
            });

            if (error) throw error;
            if (data?.lines) {
                setGenerated(data.lines);
            }
        } catch (error: any) {
            console.error('Error generating copy:', error);
            // Fallback for demo if function fails/not deployed
            setGenerated([
                `Error: ${error?.message || 'Failed to generate content'}`,
                "Make sure the Edge Function is deployed",
            ]);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <ProGuard
            title="AI Copywriter"
            description="Unlock AI-powered subject line generation to boost your open rates by up to 45%."
        >
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                        <Wand2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">AI Subject Line Generator</h2>
                        <p className="text-slate-600 dark:text-slate-400">Generate high-converting email subject lines in seconds.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    What did they leave behind?
                                </label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g. Summer Dress, Running Shoes"
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Desired Tone
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['urgent', 'friendly', 'curious'] as const).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setTone(t)}
                                            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${tone === t
                                                ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300 ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-slate-800'
                                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {t.charAt(0).toUpperCase() + t.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={generateLines}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-purple-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Generate Ideas
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700 min-h-[300px]">
                            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                                Generated Results
                            </h3>

                            {generated.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-4">
                                    <Sparkles className="w-12 h-12 mb-3 opacity-20" />
                                    <p>Enter a topic and specific tone to generate catchy subject lines.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {generated.map((line, i) => (
                                        <div
                                            key={i}
                                            className="group flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                                        >
                                            <p className="text-slate-800 dark:text-slate-200 font-medium">{line}</p>
                                            <button
                                                onClick={() => copyToClipboard(line)}
                                                className="p-2 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                                title="Copy to clipboard"
                                            >
                                                {copied === line ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProGuard>
    );
}
