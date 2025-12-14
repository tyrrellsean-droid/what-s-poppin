-- Create venue categories enum
CREATE TYPE public.venue_category AS ENUM (
  'bars_nightlife',
  'comedy',
  'food_dining',
  'places_to_stay',
  'live_music',
  'events',
  'hidden_gems'
);

-- Create venues table
CREATE TABLE public.venues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category venue_category NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  image_url TEXT,
  is_hidden_gem BOOLEAN DEFAULT false,
  traffic_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create venue visits table for traffic tracking
CREATE TABLE public.venue_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_latitude DECIMAL(10, 8),
  user_longitude DECIMAL(11, 8)
);

-- Enable RLS
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_visits ENABLE ROW LEVEL SECURITY;

-- Venues are publicly readable (anyone can browse)
CREATE POLICY "Venues are publicly readable"
ON public.venues
FOR SELECT
USING (true);

-- Venue visits can be created by anyone (anonymous traffic tracking)
CREATE POLICY "Anyone can log visits"
ON public.venue_visits
FOR INSERT
WITH CHECK (true);

-- Venue visits are readable for aggregate stats
CREATE POLICY "Visits are publicly readable"
ON public.venue_visits
FOR SELECT
USING (true);

-- Create function to update traffic count
CREATE OR REPLACE FUNCTION public.increment_venue_traffic()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.venues
  SET traffic_count = traffic_count + 1,
      updated_at = now()
  WHERE id = NEW.venue_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-increment traffic on visit
CREATE TRIGGER on_venue_visit
  AFTER INSERT ON public.venue_visits
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_venue_traffic();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for venue timestamp updates
CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON public.venues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample venues
INSERT INTO public.venues (name, description, category, latitude, longitude, is_hidden_gem, traffic_count) VALUES
('The Velvet Lounge', 'Upscale cocktail bar with live jazz', 'bars_nightlife', 40.7128, -74.0060, false, 245),
('Laughing Buddha Comedy Club', 'Stand-up comedy every weekend', 'comedy', 40.7580, -73.9855, false, 189),
('Mama Rosa''s Kitchen', 'Authentic Italian family recipes', 'food_dining', 40.7282, -73.7949, false, 312),
('Harbor View Inn', 'Charming waterfront bed & breakfast', 'places_to_stay', 40.6892, -74.0445, false, 156),
('Blue Note Sessions', 'Intimate live music venue', 'live_music', 40.7308, -73.9973, false, 278),
('Summer Street Festival', 'Annual arts and music celebration', 'events', 40.7484, -73.9857, false, 423),
('The Speakeasy', 'Secret bar known only to locals', 'hidden_gems', 40.7200, -74.0000, true, 67),
('Grandma''s Pie Shop', 'Best pie in town - locals only', 'hidden_gems', 40.7350, -73.9900, true, 45);