-- Add new columns for favorites, sharing, and sync mode
ALTER TABLE transcriptions
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS public_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS sync_mode TEXT DEFAULT 'cloud';

-- Create index for public_id lookups
CREATE INDEX IF NOT EXISTS transcriptions_public_id_idx ON transcriptions(public_id) WHERE public_id IS NOT NULL;

-- Create index for favorites
CREATE INDEX IF NOT EXISTS transcriptions_is_favorite_idx ON transcriptions(is_favorite) WHERE is_favorite = true;

-- Update RLS policy to allow public read for shared transcriptions
CREATE POLICY "Public can view shared transcriptions"
  ON transcriptions
  FOR SELECT
  USING (is_public = true AND public_id IS NOT NULL);

-- Add comment for documentation
COMMENT ON COLUMN transcriptions.is_favorite IS 'User can mark transcriptions as favorite';
COMMENT ON COLUMN transcriptions.is_public IS 'Whether the transcription is publicly accessible';
COMMENT ON COLUMN transcriptions.public_id IS 'Unique public identifier for shareable link';
COMMENT ON COLUMN transcriptions.sync_mode IS 'Storage mode: cloud or local';

