-- Create temp bucket for CSV imports
INSERT INTO storage.buckets (id, name, public) VALUES ('imports', 'imports', false);

-- Allow service role to manage imports
CREATE POLICY "Service role manages imports" ON storage.objects
FOR ALL USING (bucket_id = 'imports') WITH CHECK (bucket_id = 'imports');