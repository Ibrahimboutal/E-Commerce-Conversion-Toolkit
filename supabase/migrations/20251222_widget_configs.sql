-- Create widget_configs table
CREATE TABLE IF NOT EXISTS widget_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('popup', 'social_proof')),
    settings JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE widget_configs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow stores to manage their own widgets
CREATE POLICY "Stores can manage their own widgets"
    ON widget_configs
    FOR ALL
    TO authenticated
    USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

-- Policy: Allow public read access based on store_id (for the embed script)
CREATE POLICY "Public can read active widget configs"
    ON widget_configs
    FOR SELECT
    TO public
    USING (is_active = true);

-- Add updated_at trigger
CREATE TRIGGER update_widget_configs_updated_at
    BEFORE UPDATE ON widget_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
