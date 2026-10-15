DROP POLICY IF EXISTS "Anyone can read birthday pages" ON public.birthday_pages;
DROP POLICY IF EXISTS "Anyone can read reasons" ON public.birthday_reasons;
DROP POLICY IF EXISTS "Anyone can read photos" ON public.birthday_photos;
DROP POLICY IF EXISTS "Anyone can create birthday pages" ON public.birthday_pages;
DROP POLICY IF EXISTS "Anyone can create reasons" ON public.birthday_reasons;
DROP POLICY IF EXISTS "Anyone can create photos" ON public.birthday_photos;
REVOKE SELECT ON public.birthday_pages, public.birthday_reasons, public.birthday_photos FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.birthday_page_is_fresh(_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.birthday_pages WHERE id = _id AND created_at > now() - interval '2 hours')
$$;

CREATE POLICY "Create birthday pages with valid content" ON public.birthday_pages FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(recipient_name) BETWEEN 1 AND 100 AND char_length(sender_name) BETWEEN 1 AND 100
  AND char_length(intro_message) <= 1000 AND char_length(letter) <= 5000
  AND (relationship IS NULL OR char_length(relationship) <= 100)
  AND (age IS NULL OR age BETWEEN 0 AND 150)
  AND theme IN ('romantic','dreamy','midnight','celebration')
  AND created_at > now() - interval '5 minutes'
);
CREATE POLICY "Add reasons only to newly created pages" ON public.birthday_reasons FOR INSERT TO anon, authenticated
WITH CHECK (char_length(text) BETWEEN 1 AND 500 AND public.birthday_page_is_fresh(birthday_page_id));
CREATE POLICY "Add photos only to newly created pages" ON public.birthday_photos FOR INSERT TO anon, authenticated
WITH CHECK (public.birthday_page_is_fresh(birthday_page_id) AND storage_path LIKE birthday_page_id::text || '/%');

CREATE OR REPLACE FUNCTION public.get_birthday_page(_id uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'page', to_jsonb(p),
    'reasons', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', r.id, 'text', r.text) ORDER BY r.display_order) FROM public.birthday_reasons r WHERE r.birthday_page_id = p.id), '[]'::jsonb),
    'photos', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', ph.id, 'public_url', ph.public_url, 'caption', ph.caption, 'memory', ph.memory) ORDER BY ph.display_order) FROM public.birthday_photos ph WHERE ph.birthday_page_id = p.id), '[]'::jsonb)
  ) FROM public.birthday_pages p WHERE p.id = _id
$$;
REVOKE ALL ON FUNCTION public.get_birthday_page(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_birthday_page(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.birthday_page_is_fresh(uuid) TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can upload birthday photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read birthday photos" ON storage.objects;
CREATE POLICY "Upload photos only into newly created page folders" ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'birthday-photos'
  AND (storage.foldername(name))[1] ~* '^[0-9a-f-]{36}$'
  AND public.birthday_page_is_fresh(((storage.foldername(name))[1])::uuid));
CREATE POLICY "Link photos only in newly created page folders" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'birthday-photos'
  AND (storage.foldername(name))[1] ~* '^[0-9a-f-]{36}$'
  AND public.birthday_page_is_fresh(((storage.foldername(name))[1])::uuid));