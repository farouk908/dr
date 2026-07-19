-- Set up Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('product-media', 'product-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-media' );

CREATE POLICY "Anyone can insert"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'product-media' );

CREATE POLICY "Anyone can update"
ON storage.objects FOR UPDATE
WITH CHECK ( bucket_id = 'product-media' );

CREATE POLICY "Anyone can delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'product-media' );
