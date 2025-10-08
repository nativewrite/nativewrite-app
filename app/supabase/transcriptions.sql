-- Create transcriptions table for storing transcription history
CREATE TABLE IF NOT EXISTS transcriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source_type TEXT NOT NULL CHECK (source_type IN ('upload', 'record', 'url')),
  detected_language TEXT NOT NULL DEFAULT 'auto',
  transcript_text TEXT NOT NULL,
  translation_text TEXT,
  target_language TEXT,
  audio_url TEXT,
  tts_url TEXT,
  duration_seconds INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS transcriptions_user_id_idx ON transcriptions(user_id);
CREATE INDEX IF NOT EXISTS transcriptions_created_at_idx ON transcriptions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view only their own transcriptions
CREATE POLICY "Users can view their own transcriptions"
  ON transcriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own transcriptions
CREATE POLICY "Users can insert their own transcriptions"
  ON transcriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own transcriptions
CREATE POLICY "Users can update their own transcriptions"
  ON transcriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own transcriptions
CREATE POLICY "Users can delete their own transcriptions"
  ON transcriptions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_transcriptions_updated_at
  BEFORE UPDATE ON transcriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

