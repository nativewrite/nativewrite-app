-- Create nativegpt_sessions table for storing chat conversations
CREATE TABLE IF NOT EXISTS nativegpt_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  transcription_id UUID REFERENCES transcriptions(id) ON DELETE SET NULL,
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  messages JSONB DEFAULT '[]'::jsonb,
  model TEXT DEFAULT 'gpt-4o-mini'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS nativegpt_sessions_user_id_idx ON nativegpt_sessions(user_id);
CREATE INDEX IF NOT EXISTS nativegpt_sessions_transcription_id_idx ON nativegpt_sessions(transcription_id);
CREATE INDEX IF NOT EXISTS nativegpt_sessions_created_at_idx ON nativegpt_sessions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE nativegpt_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own chat sessions"
  ON nativegpt_sessions
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can insert their own chat sessions"
  ON nativegpt_sessions
  FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can update their own chat sessions"
  ON nativegpt_sessions
  FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can delete their own chat sessions"
  ON nativegpt_sessions
  FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'email');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_nativegpt_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_nativegpt_sessions_updated_at
  BEFORE UPDATE ON nativegpt_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_nativegpt_sessions_updated_at();

-- Add comments for documentation
COMMENT ON TABLE nativegpt_sessions IS 'Stores NativeGPT chat conversations';
COMMENT ON COLUMN nativegpt_sessions.user_id IS 'User email from auth session';
COMMENT ON COLUMN nativegpt_sessions.transcription_id IS 'Optional link to a specific transcription';
COMMENT ON COLUMN nativegpt_sessions.messages IS 'Array of chat messages in OpenAI format';
COMMENT ON COLUMN nativegpt_sessions.model IS 'AI model used for the chat';

