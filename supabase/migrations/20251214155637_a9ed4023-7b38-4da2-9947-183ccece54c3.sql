-- Allow authenticated users to insert hidden gem venues
CREATE POLICY "Users can submit hidden gems"
ON public.venues
FOR INSERT
TO authenticated
WITH CHECK (
  category = 'hidden_gems' AND
  is_hidden_gem = true
);

-- Add submitted_by column to track who submitted the venue
ALTER TABLE public.venues
ADD COLUMN submitted_by uuid REFERENCES auth.users(id);

-- Allow users to update their own submissions
CREATE POLICY "Users can update their own submissions"
ON public.venues
FOR UPDATE
TO authenticated
USING (submitted_by = auth.uid())
WITH CHECK (submitted_by = auth.uid());