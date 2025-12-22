import { useState, useEffect } from 'react';
import { Mail, Layout, Type, Palette, Save, Eye, Smartphone, Monitor } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export default function EmailBuilder() {
    const [template, setTemplate] = useState({
        name: 'My Custom Template',
        subject: 'You left something behind!',
        headline: 'Wait, don\'t leave yet!',
        body: 'We noticed you left some items in your cart. We saved them for you, but they might sell out soon!',
        buttonText: 'Complete My Purchase',
        primaryColor: '#10b981',
        backgroundColor: '#f8fafc'
    });
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data: store } = await supabase.from('stores').select('id').single();
            if (!store) throw new Error('Store not found');

            // Generate HTML
            const html = `
                <div style="background-color: ${template.backgroundColor}; padding: 40px; font-family: sans-serif;">
                    <div style="background-color: white; max-width: 600px; margin: 0 auto; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
                        <div style="padding: 40px; text-align: center;">
                            <h1 style="color: #0f172a; margin-bottom: 20px;">${template.headline}</h1>
                            <p style="color: #64748b; line-height: 1.6; margin-bottom: 30px;">Hi {{customer_name}}, ${template.body}</p>
                            <div style="border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 20px 0; margin-bottom: 30px;">
                                {{items_html}}
                            </div>
                            <a href="{{cart_url}}" style="background-color: ${template.primaryColor}; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                                ${template.buttonText}
                            </a>
                        </div>
                    </div>
                </div>
            `;

            const { data, error } = await supabase.from('email_templates').upsert({
                store_id: store.id,
                name: template.name,
                subject: template.subject,
                body: html
            }).select().single();

            if (error) throw error;

            // Update store to use this template
            await supabase.from('stores').update({ cart_reminder_template_id: data.id }).eq('id', store.id);

            toast.success('Template saved and activated!');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl">
                        <Layout className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Email Visual Builder</h2>
                        <p className="text-slate-600 dark:text-slate-400">Design beautiful recovery emails that match your brand.</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save & Activate'}
                </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Editor Content */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-sm">
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Type className="w-4 h-4 text-blue-500" /> Content Settings
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Template Name</label>
                                <input
                                    type="text"
                                    value={template.name}
                                    onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Subject</label>
                                <input
                                    type="text"
                                    value={template.subject}
                                    onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Headline</label>
                                <input
                                    type="text"
                                    value={template.headline}
                                    onChange={(e) => setTemplate({ ...template, headline: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Body Text</label>
                                <textarea
                                    value={template.body}
                                    rows={4}
                                    onChange={(e) => setTemplate({ ...template, body: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Button Text</label>
                                <input
                                    type="text"
                                    value={template.buttonText}
                                    onChange={(e) => setTemplate({ ...template, buttonText: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-top border-slate-100 dark:border-slate-700">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Palette className="w-4 h-4 text-emerald-500" /> Branding
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Primary Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={template.primaryColor}
                                            onChange={(e) => setTemplate({ ...template, primaryColor: e.target.value })}
                                            className="h-10 w-12 rounded border border-slate-300 dark:border-slate-600 bg-transparent"
                                        />
                                        <input
                                            type="text"
                                            value={template.primaryColor}
                                            onChange={(e) => setTemplate({ ...template, primaryColor: e.target.value })}
                                            className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Background</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={template.backgroundColor}
                                            onChange={(e) => setTemplate({ ...template, backgroundColor: e.target.value })}
                                            className="h-10 w-12 rounded border border-slate-300 dark:border-slate-600 bg-transparent"
                                        />
                                        <input
                                            type="text"
                                            value={template.backgroundColor}
                                            onChange={(e) => setTemplate({ ...template, backgroundColor: e.target.value })}
                                            className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Content */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex gap-1">
                            <button
                                onClick={() => setPreviewMode('desktop')}
                                className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-slate-100 dark:bg-slate-700 text-blue-600' : 'text-slate-400'}`}
                            >
                                <Monitor className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPreviewMode('mobile')}
                                className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-slate-100 dark:bg-slate-700 text-blue-600' : 'text-slate-400'}`}
                            >
                                <Smartphone className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
                            <Eye className="w-3 h-3" /> Live Preview
                        </div>
                    </div>

                    <div className={`mx-auto transition-all duration-300 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl bg-white ${previewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-full'}`}>
                        <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-3 space-y-1">
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Subject</div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">{template.subject}</div>
                        </div>
                        <div className="h-[600px] overflow-y-auto" style={{ backgroundColor: template.backgroundColor }}>
                            <div className="p-8">
                                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-100">
                                    <div className="p-8 text-center space-y-6">
                                        <h1 className="text-2xl font-bold text-slate-900" style={{ margin: 0 }}>{template.headline}</h1>
                                        <p className="text-slate-600 leading-relaxed" style={{ margin: 0 }}>
                                            Hi Customer, {template.body}
                                        </p>

                                        <div className="py-6 border-y border-slate-50 space-y-4">
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="w-16 h-16 bg-slate-100 rounded"></div>
                                                <div className="flex-1">
                                                    <div className="h-4 w-32 bg-slate-100 rounded mb-2"></div>
                                                    <div className="h-3 w-16 bg-slate-50 rounded"></div>
                                                </div>
                                                <div className="font-bold text-slate-900">$49.00</div>
                                            </div>
                                        </div>

                                        <button
                                            disabled
                                            className="px-8 py-3 rounded-lg font-bold text-white transition-all"
                                            style={{ backgroundColor: template.primaryColor }}
                                        >
                                            {template.buttonText}
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-8 text-center">
                                    <div className="text-xs text-slate-400">
                                        © 2024 Your Store Name. All rights reserved.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
