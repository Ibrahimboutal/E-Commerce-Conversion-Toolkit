-- Create ab_tests table
CREATE TABLE IF NOT EXISTS ab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    variant_a_subject TEXT NOT NULL,
    variant_b_subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for ab_tests
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stores can manage their own A/B tests"
    ON ab_tests
    FOR ALL
    TO authenticated
    USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

-- Create ab_test_events table
CREATE TABLE IF NOT EXISTS ab_test_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
    variant TEXT NOT NULL CHECK (variant IN ('A', 'B')),
    event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'open', 'click')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for ab_test_events
ALTER TABLE ab_test_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stores can read their own A/B test events"
    ON ab_test_events
    FOR SELECT
    TO authenticated
    USING (test_id IN (SELECT id FROM ab_tests WHERE store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())));
