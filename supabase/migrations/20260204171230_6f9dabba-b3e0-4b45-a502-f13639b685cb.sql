-- Add session support to coach_chat_messages
ALTER TABLE public.coach_chat_messages 
ADD COLUMN session_id uuid NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN session_title text DEFAULT 'שיחה חדשה';

-- Create index for faster session queries
CREATE INDEX idx_coach_chat_session ON public.coach_chat_messages(session_id, created_at);