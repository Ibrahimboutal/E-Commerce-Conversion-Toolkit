import { useState, useEffect } from 'react';
import { Split, Trophy, ArrowRight, BarChart, Rocket, Play, StopCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProGuard from './ProGuard';
import { toast } from 'react-hot-toast';

export default function ABTestManager() {
    const [variantA, setVariantA] = useState('');
    const [variantB, setVariantB] = useState('');
    const [testName, setTestName] = useState('');
    const [simulating, setSimulating] = useState(false);
    const [launching, setLaunching] = useState(false);
    const [result, setResult] = useState<{ winner: 'A' | 'B'; confidence: number; lift: number } | null>(null);
    const [activeTests, setActiveTests] = useState<any[]>([]);

    useEffect(() => {
        loadActiveTests();
    }, []);

    const loadActiveTests = async () => {
        const { data: store } = await supabase.from('stores').select('id').maybeSingle();
        if (store) {
            const { data } = await supabase
                .from('ab_tests')
                .select('*')
                .eq('store_id', store.id)
                .order('created_at', { ascending: false });
            if (data) setActiveTests(data);
        }
    };

    const runSimulation = async () => {
        if (!variantA || !variantB) return;
        setSimulating(true);
        setResult(null);

        try {
            const { data, error } = await supabase.functions.invoke('predict-ab-test', {
                body: { variantA, variantB }
            });

            if (data) {
                setResult({
                    winner: data.winner,
                    confidence: data.confidence,
                    lift: data.lift
                });
                toast.success('Simulation complete!');
            }
        } catch (error) {
            console.error('Simulation error:', error);
            toast.error('Simulation failed. Using demo data.');
            setResult({ winner: Math.random() > 0.5 ? 'A' : 'B', confidence: 85, lift: 24 });
        } finally {
            setSimulating(false);
        }
    };

    const launchLiveTest = async () => {
        if (!variantA || !variantB || !testName) {
            toast.error('Please fill in test name and both variants');
            return;
        }

        setLaunching(true);
        try {
            const { data: store } = await supabase.from('stores').select('id').single();
            if (!store) throw new Error('Store not found');

            const { error } = await supabase.from('ab_tests').insert({
                store_id: store.id,
                name: testName,
                variant_a_subject: variantA,
                variant_b_subject: variantB,
                status: 'active'
            });

            if (error) throw error;

            toast.success('Live A/B test launched!');
            setVariantA('');
            setVariantB('');
            setTestName('');
            loadActiveTests();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLaunching(false);
        }
    };

    return (
        <ProGuard
            title="A/B Test Manager"
            description="Predict the winner of your subject lines OR launch a real live test on your store."
        >
            <div className="max-w-6xl mx-auto space-y-12">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                            <Split className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">A/B Test Manager</h2>
                            <p className="text-slate-600 dark:text-slate-400">Optimize your open rates with AI predictions and live testing.</p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Test Name</label>
                                <input
                                    type="text"
                                    value={testName}
                                    onChange={(e) => setTestName(e.target.value)}
                                    placeholder="e.g. Holiday Sale Campaign"
                                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                        <span className="bg-slate-100 dark:bg-slate-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">A</span>
                                        Variant A
                                    </h3>
                                    <input
                                        type="text"
                                        value={variantA}
                                        onChange={(e) => setVariantA(e.target.value)}
                                        placeholder="e.g. You forgot something!"
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                        <span className="bg-slate-100 dark:bg-slate-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">B</span>
                                        Variant B
                                    </h3>
                                    <input
                                        type="text"
                                        value={variantB}
                                        onChange={(e) => setVariantB(e.target.value)}
                                        placeholder="e.g. Come back and save 10%"
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={runSimulation}
                                disabled={simulating || !variantA || !variantB}
                                className="flex-1 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-bold py-3 rounded-lg shadow-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                <BarChart className="w-5 h-5" />
                                Run AI Simulation
                            </button>
                            <button
                                onClick={launchLiveTest}
                                disabled={launching || !variantA || !variantB || !testName}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Rocket className="w-5 h-5" />
                                {launching ? 'Launching...' : 'Launch Live Test'}
                            </button>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 p-8">
                            {!result && !simulating && (
                                <div className="text-center text-slate-400">
                                    <BarChart className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>Simulation results will appear here</p>
                                </div>
                            )}
                            {result && !simulating && (
                                <div className="w-full space-y-6 text-center">
                                    <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-full inline-flex items-center gap-2 font-bold text-sm mx-auto">
                                        <Trophy className="w-4 h-4" /> Winner Predicted: Variant {result.winner}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
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

                    <div className="space-y-6">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Play className="w-4 h-4 text-emerald-500" /> Active Tests
                        </h3>
                        <div className="space-y-4">
                            {activeTests.length === 0 ? (
                                <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                    <p className="text-sm text-slate-500">No active tests yet</p>
                                </div>
                            ) : (
                                activeTests.map(test => (
                                    <div key={test.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-semibold text-slate-900 dark:text-white">{test.name}</h4>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${test.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {test.status}
                                            </span>
                                        </div>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between text-slate-500">
                                                <span>A: {test.variant_a_subject.substring(0, 30)}...</span>
                                                <span className="font-medium text-slate-900 dark:text-white">50%</span>
                                            </div>
                                            <div className="flex justify-between text-slate-500">
                                                <span>B: {test.variant_b_subject.substring(0, 30)}...</span>
                                                <span className="font-medium text-slate-900 dark:text-white">50%</span>
                                            </div>
                                        </div>
                                        {test.status === 'active' && (
                                            <button
                                                onClick={async () => {
                                                    await supabase.from('ab_tests').update({ status: 'completed' }).eq('id', test.id);
                                                    loadActiveTests();
                                                    toast.success('Test stopped');
                                                }}
                                                className="w-full flex items-center justify-center gap-2 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-100 dark:border-red-900/30 font-medium"
                                            >
                                                <StopCircle className="w-3 h-3" /> Stop Test
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProGuard>
    );
}
