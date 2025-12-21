-- Add cart_reminder_template_id to stores to allow choosing a specific template
ALTER TABLE stores ADD COLUMN cart_reminder_template_id uuid REFERENCES email_templates(id);

-- Add comment for clarity
COMMENT ON COLUMN stores.cart_reminder_template_id IS 'Specific template to use for abandoned cart reminders';
