-- Add Twilio credentials to stores table
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS twilio_account_sid TEXT,
ADD COLUMN IF NOT EXISTS twilio_auth_token TEXT,
ADD COLUMN IF NOT EXISTS twilio_from_number TEXT,
ADD COLUMN IF NOT EXISTS sms_reminder_enabled BOOLEAN DEFAULT false;

-- Add customer phone to abandoned_carts table
ALTER TABLE abandoned_carts
ADD COLUMN IF NOT EXISTS customer_phone TEXT;
