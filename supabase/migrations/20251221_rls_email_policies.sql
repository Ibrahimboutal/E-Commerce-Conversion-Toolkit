-- RLS Policies for email_logs and email_templates
-- Ensure stores can only access their own logs and templates

-- Enable RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Email Logs Policies
CREATE POLICY "Users can view their store's email logs"
  ON email_logs FOR SELECT
  USING (
    cart_id IN (
      SELECT id FROM abandoned_carts 
      WHERE store_id IN (
        SELECT id FROM stores WHERE user_id = auth.uid()
      )
    )
  );

-- Email Templates Policies
CREATE POLICY "Users can view their own store templates"
  ON email_templates FOR SELECT
  USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own store templates"
  ON email_templates FOR INSERT
  WITH CHECK (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own store templates"
  ON email_templates FOR UPDATE
  USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own store templates"
  ON email_templates FOR DELETE
  USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );
