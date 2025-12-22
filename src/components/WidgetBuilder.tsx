import { useEffect, useState } from 'react';
import { supabase, Store } from '../lib/supabase';
import { Save, MessageSquare, Eye, MousePointer2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function WidgetBuilder() {
    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [configs, setConfigs] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const { data: storeData } = await supabase
                .from('stores')
                .select('*')
                .maybeSingle();

            if (storeData) {
                setStore(storeData);

                const { data: configData } = await supabase
                    .from('widget_configs' as any)
                    .select('*')
                    .eq('store_id', storeData.id);

                if (configData) {
                    setConfigs(configData);
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (type: string, currentStatus: boolean) => {
        if (!store) return;

        try {
            const config = configs.find(c => c.type === type);
            if (config) {
                await supabase
                    .from('widget_configs' as any)
                    .update({ is_active: !currentStatus })
                    .eq('id', config.id);
            } else {
                await supabase
                    .from('widget_configs' as any)
                    .insert({
                        store_id: store.id,
                        type,
                        is_active: true,
                        settings: {}
                    });
            }
            await loadData();
            toast.success(`${type === 'popup' ? 'Popup' : 'Social Proof'} status updated`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleSaveSettings = async (type: string, settings: any) => {
        if (!store) return;
        setSaving(true);

        try {
            const config = configs.find(c => c.type === type);
            if (config) {
                await supabase
                    .from('widget_configs' as any)
                    .update({ settings })
                    .eq('id', config.id);
            } else {
                await supabase
                    .from('widget_configs' as any)
                    .insert({
                        store_id: store.id,
                        type,
                        settings,
                        is_active: true
                    });
            }
            await loadData();
            toast.success('Settings saved');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64 text-slate-500">Loading widgets...</div>;
    }

    const popupConfig = configs.find(c => c.type === 'popup') || { settings: {}, is_active: false };
    const socialProofConfig = configs.find(c => c.type === 'social_proof') || { settings: {}, is_active: false };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">On-Site Widgets</h2>
                    <p className="text-slate-500 dark:text-slate-400">Boost conversion with exit-intent popups and social proof.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Exit Intent Popup */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                                <MousePointer2 className="w-6 h-6 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Exit-Intent Popup</h3>
                        </div>
                        <button
                            onClick={() => handleToggle('popup', popupConfig.is_active)}
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${popupConfig.is_active
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-700'
                                }`}
                        >
                            {popupConfig.is_active ? 'Active' : 'Inactive'}
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Popup Title</label>
                            <input
                                type="text"
                                value={popupConfig.settings.title || ''}
                                onChange={(e) => setConfigs(prev => prev.map(c => c.type === 'popup' ? { ...c, settings: { ...c.settings, title: e.target.value } } : c))}
                                placeholder="Wait! Before you go..."
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                            <textarea
                                value={popupConfig.settings.description || ''}
                                onChange={(e) => setConfigs(prev => prev.map(c => c.type === 'popup' ? { ...c, settings: { ...c.settings, description: e.target.value } } : c))}
                                placeholder="Get 10% off your first order..."
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white h-24"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Background Color</label>
                                <input
                                    type="color"
                                    value={popupConfig.settings.backgroundColor || '#ffffff'}
                                    onChange={(e) => setConfigs(prev => prev.map(c => c.type === 'popup' ? { ...c, settings: { ...c.settings, backgroundColor: e.target.value } } : c))}
                                    className="w-full h-10 p-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Button Color</label>
                                <input
                                    type="color"
                                    value={popupConfig.settings.buttonColor || '#000000'}
                                    onChange={(e) => setConfigs(prev => prev.map(c => c.type === 'popup' ? { ...c, settings: { ...c.settings, buttonColor: e.target.value } } : c))}
                                    className="w-full h-10 p-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => handleSaveSettings('popup', popupConfig.settings)}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        Save Popup Settings
                    </button>
                </div>

                {/* Social Proof */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                                <MessageSquare className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Social Proof Card</h3>
                        </div>
                        <button
                            onClick={() => handleToggle('social_proof', socialProofConfig.is_active)}
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${socialProofConfig.is_active
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-700'
                                }`}
                        >
                            {socialProofConfig.is_active ? 'Active' : 'Inactive'}
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Position</label>
                            <select
                                value={socialProofConfig.settings.position || 'bottom-left'}
                                onChange={(e) => setConfigs(prev => prev.map(c => c.type === 'social_proof' ? { ...c, settings: { ...c.settings, position: e.target.value } } : c))}
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                            >
                                <option value="bottom-left">Bottom Left</option>
                                <option value="bottom-right">Bottom Right</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">BG Color</label>
                                <input
                                    type="color"
                                    value={socialProofConfig.settings.backgroundColor || '#ffffff'}
                                    onChange={(e) => setConfigs(prev => prev.map(c => c.type === 'social_proof' ? { ...c, settings: { ...c.settings, backgroundColor: e.target.value } } : c))}
                                    className="w-full h-10 p-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Text Color</label>
                                <input
                                    type="color"
                                    value={socialProofConfig.settings.textColor || '#000000'}
                                    onChange={(e) => setConfigs(prev => prev.map(c => c.type === 'social_proof' ? { ...c, settings: { ...c.settings, textColor: e.target.value } } : c))}
                                    className="w-full h-10 p-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => handleSaveSettings('social_proof', socialProofConfig.settings)}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        Save Social Proof Settings
                    </button>
                </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="bg-emerald-500 p-2 rounded-lg text-white">
                        <Eye className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Live Preview</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            The widgets will appear on your store according to these settings.
                            Use the "Settings" tab to find your installation code.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
