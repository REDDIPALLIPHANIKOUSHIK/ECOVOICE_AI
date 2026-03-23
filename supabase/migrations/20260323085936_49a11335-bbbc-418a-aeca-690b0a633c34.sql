
CREATE TABLE public.recycling_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item TEXT NOT NULL DEFAULT 'Unknown',
  category TEXT NOT NULL DEFAULT 'Landfill',
  material TEXT NOT NULL DEFAULT 'Unknown',
  confidence NUMERIC NOT NULL DEFAULT 0,
  contamination TEXT NOT NULL DEFAULT 'Medium',
  disposal TEXT NOT NULL DEFAULT 'Check local guidelines.',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  city TEXT,
  state TEXT,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.recycling_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON public.recycling_history
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous selects" ON public.recycling_history
  FOR SELECT TO anon USING (true);
