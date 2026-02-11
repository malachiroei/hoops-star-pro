-- Create table for AI coach chat history
CREATE TABLE public.coach_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  has_video BOOLEAN DEFAULT FALSE,
  video_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster ordering
CREATE INDEX idx_coach_chat_messages_created_at ON public.coach_chat_messages(created_at);

-- Enable Row Level Security
ALTER TABLE public.coach_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (single user app - Ravid)
CREATE POLICY "Allow all operations on coach chat messages"
ON public.coach_chat_messages
FOR ALL
USING (true)
WITH CHECK (true);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.coach_chat_messages;