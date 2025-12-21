import { useEffect, useState } from 'react';
import { supabase, Store } from '../lib/supabase';
import { Save, Copy, Check, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function StoreSettings() {
  const [store, setStore] = useState<Store | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    platform: 'custom',
    cart_reminder_enabled: true,
    cart_reminder_delay_hours: 1,
    cart_reminder_template_id: '',
  });

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
        setFormData({
          name: storeData.name,
          platform: storeData.platform,
          cart_reminder_enabled: storeData.cart_reminder_enabled,
          cart_reminder_delay_hours: storeData.cart_reminder_delay_hours,
          cart_reminder_template_id: storeData.cart_reminder_template_id || '',
        });
      }

      // Fetch templates
      const { data: templateData } = await supabase
        .from('email_templates')
        .select('id, name')
        .eq('template_type', 'cart_reminder');

      if (templateData) {
        setTemplates(templateData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        ...formData,
        cart_reminder_template_id: formData.cart_reminder_template_id || null,
        updated_at: new Date().toISOString(),
      };

      if (store) {
        await supabase
          .from('stores')
          .update(updateData)
          .eq('id', store.id);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('stores')
            .insert({
              ...updateData,
              user_id: user.id,
            });
        }
      }

      await loadData();
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving store:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const webhookUrl = store
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook-handler`
    : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Store Settings</h2>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Store Information</h3>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Store Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="platform" className="block text-sm font-medium text-slate-700 mb-1">
              E-Commerce Platform
            </label>
            <select
              id="platform"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="shopify">Shopify</option>
              <option value="woocommerce">WooCommerce</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Cart Reminder Settings</h3>

          <div className="flex items-center gap-3">
            <input
              id="reminder_enabled"
              type="checkbox"
              checked={formData.cart_reminder_enabled}
              onChange={(e) => setFormData({ ...formData, cart_reminder_enabled: e.target.checked })}
              className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="reminder_enabled" className="text-sm font-medium text-slate-700">
              Enable automatic cart reminder emails
            </label>
          </div>

          <div>
            <label htmlFor="delay_hours" className="block text-sm font-medium text-slate-700 mb-1">
              Send reminder after (hours)
            </label>
            <input
              id="delay_hours"
              type="number"
              min="1"
              max="72"
              value={formData.cart_reminder_delay_hours}
              onChange={(e) => setFormData({ ...formData, cart_reminder_delay_hours: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="template" className="block text-sm font-medium text-slate-700 mb-1">
              Email Template
            </label>
            <select
              id="template"
              value={formData.cart_reminder_template_id}
              onChange={(e) => setFormData({ ...formData, cart_reminder_template_id: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Default Premium Template</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Select an AI-generated template or use our high-converting base design.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>

      {store && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Webhook Integration</h3>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-900 mb-2">
                  Configure your e-commerce platform to send webhooks to this URL:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded border border-blue-300 text-sm font-mono text-slate-900 break-all">
                    {webhookUrl}
                  </code>
                  <button
                    onClick={() => copyToClipboard(webhookUrl)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Webhook Secret
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-slate-100 px-3 py-2 rounded border border-slate-300 text-sm font-mono text-slate-900">
                {store.webhook_secret}
              </code>
              <button
                onClick={() => copyToClipboard(store.webhook_secret)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Use this secret to verify webhook requests from your platform
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-slate-900">Integration Instructions</h4>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const testPayload = {
                      event_type: 'cart.abandoned',
                      store_id: store.id,
                      data: {
                        customer_email: 'test@example.com',
                        customer_name: 'Test Customer',
                        cart_token: 'test_token_' + Date.now(),
                        total_price: 99.99,
                        currency: 'USD',
                        items: [{ product_id: '1', product_name: 'Test Product', quantity: 1, price: 99.99 }]
                      }
                    };

                    const response = await fetch(webhookUrl, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'X-Webhook-Secret': store.webhook_secret
                      },
                      body: JSON.stringify(testPayload)
                    });

                    if (response.ok) {
                      toast.success('Connection successful! Test data received.');
                    } else {
                      const err = await response.json();
                      toast.error(`Connection failed: ${err.error || 'Unknown error'}`);
                    }
                  } catch (error) {
                    toast.error('Failed to connect to webhook handler');
                  }
                }}
                className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-semibold"
              >
                Test Connection
              </button>
            </div>
            <ol className="text-sm text-slate-700 space-y-2 list-decimal list-inside">
              <li>Copy the webhook URL above</li>
              <li>In your e-commerce platform, navigate to webhook settings</li>
              <li>Create a new webhook for abandoned cart events</li>
              <li>Paste the webhook URL and secret</li>
              <li>Enable the webhook and test the connection</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
