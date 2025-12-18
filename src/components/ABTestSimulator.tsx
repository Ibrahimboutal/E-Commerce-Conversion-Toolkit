import { useState } from 'react';
import { Split, Trophy, ArrowRight, BarChart } from 'lucide-react';
import ProGuard from './ProGuard';

export default function ABTestSimulator() {
    const [variantA, setVariantA] = useState('');
    const [variantB, setVariantB] = useState('');
    const [simulating, setSimulating] = useState(false);
    const [result, setResult] = useState<{ winner: 'A' | 'B'; confidence: number; lift: number } | null>(null);

    const runSimulation = () => {
        if (!variantA || !variantB) return;

        setSimulating(true);
        setResult(null);

        // Simulate network/processing delay
        setTimeout(() => {
            const winner = Math.random() > 0.5 ? 'A' : 'B';
            const confidence = Math.floor(Math.random() * (99 - 80) + 80);
            const lift = Math.floor(Math.random() * (45 - 12) + 12);

            setResult({ winner, confidence, lift });
            setSimulating(false);
        }, 2000);
    };

    return (
        <ProGuard
            title="A/B Test Simulator"
            description="Predict the winner of your subject lines before you send using our predictive AI model."
        >
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                        <Split className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">A/B Test Simulator</h2>
                        <p className="text-slate-600 dark:text-slate-400">Optimize your open rates by testing variants before sending.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="bg-slate-100 dark:bg-slate-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">A</span>
                                Variant A
                            </h3>
                            <input
                                type="text"
                                value={variantA}
                                onChange={(e) => setVariantA(e.target.value)}
                                placeholder="e.g. You forgot something!"
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="bg-slate-100 dark:bg-slate-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">B</span>
                                Variant B
                            </h3>
                            <input
                                type="text"
                                value={variantB}
                                onChange={(e) => setVariantB(e.target.value)}
                                placeholder="e.g. Come back and save 10%"
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            onClick={runSimulation}
                            disabled={simulating || !variantA || !variantB}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {simulating ? (
                                <>
                                    <BarChart className="w-5 h-5 animate-bounce" />
                                    Simulating Results...
                                </>
                            ) : (
                                <>
                                    <ArrowRight className="w-5 h-5" />
                                    Run Simulation
                                </>
                            )}
                        </button>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center justify-center text-center">
                        {!result && !simulating && (
                            <div className="text-slate-400 max-w-xs">
                                <Split className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p>Enter two subject lines to see which one our AI predicts will perform better.</p>
                            </div>
                        )}

                        {result && !simulating && (
                            <div className="w-full space-y-6 animate-in fade-in zoom-in duration-500">
                                <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-full inline-flex items-center gap-2 font-bold text-sm mx-auto">
                                    <Trophy className="w-4 h-4" />
                                    Winner Predicted
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                        Winning Variant
                                    </h3>
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border-2 border-green-500 shadow-xl">
                                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                                            {result.winner === 'A' ? variantA : variantB}
                                        </p>
                                        <div className="mt-2 text-xs font-bold text-green-600">
                                            Variant {result.winner}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 w-full">
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Confidence</div>
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{result.confidence}%</div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Proj. Lift</div>
                                        <div className="text-2xl font-bold text-green-600">+{result.lift}%</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProGuard>
    );
}
