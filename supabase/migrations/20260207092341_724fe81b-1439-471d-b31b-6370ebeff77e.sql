-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for basketball move videos
CREATE TABLE public.basketball_move_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  move_id TEXT NOT NULL UNIQUE,
  video_url TEXT NOT NULL,
  video_type TEXT NOT NULL CHECK (video_type IN ('youtube', 'file')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.basketball_move_videos ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read move videos (public content)
CREATE POLICY "Anyone can view basketball move videos"
ON public.basketball_move_videos
FOR SELECT
USING (true);

-- Allow anyone to manage basketball move videos
CREATE POLICY "Anyone can insert basketball move videos"
ON public.basketball_move_videos
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update basketball move videos"
ON public.basketball_move_videos
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete basketball move videos"
ON public.basketball_move_videos
FOR DELETE
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_basketball_move_videos_updated_at
BEFORE UPDATE ON public.basketball_move_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();