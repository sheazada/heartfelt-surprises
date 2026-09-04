CREATE TABLE public.birthday_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_name TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  birthday_date DATE,
  age INTEGER,
  relationship TEXT,
  intro_message TEXT NOT NULL,
  letter TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'romantic',
  music_enabled BOOLEAN NOT NULL DEFAULT true,
  music_track TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.birthday_reasons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  birthday_page_id UUID NOT NULL REFERENCES public.birthday_pages(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.birthday_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  birthday_page_id UUID NOT NULL REFERENCES public.birthday_pages(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  caption TEXT,
  memory TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_birthday_reasons_page ON public.birthday_reasons(birthday_page_id);
CREATE INDEX idx_birthday_photos_page ON public.birthday_photos(birthday_page_id);

GRANT SELECT, INSERT ON public.birthday_pages TO anon, authenticated;
GRANT SELECT, INSERT ON public.birthday_reasons TO anon, authenticated;
GRANT SELECT, INSERT ON public.birthday_photos TO anon, authenticated;
GRANT ALL ON public.birthday_pages TO service_role;
GRANT ALL ON public.birthday_reasons TO service_role;
GRANT ALL ON public.birthday_photos TO service_role;

ALTER TABLE public.birthday_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthday_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthday_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read birthday pages" ON public.birthday_pages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can create birthday pages" ON public.birthday_pages FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can read reasons" ON public.birthday_reasons FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can create reasons" ON public.birthday_reasons FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can read photos" ON public.birthday_photos FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can create photos" ON public.birthday_photos FOR INSERT TO anon, authenticated WITH CHECK (true);