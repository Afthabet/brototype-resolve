-- Fix function search paths for security by recreating with CASCADE
DROP TRIGGER IF EXISTS set_complaint_id_trigger ON public.complaints;
DROP FUNCTION IF EXISTS public.generate_complaint_id() CASCADE;
DROP FUNCTION IF EXISTS public.set_complaint_id() CASCADE;

-- Recreate generate_complaint_id with proper security
CREATE OR REPLACE FUNCTION public.generate_complaint_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_id INTEGER;
BEGIN
  next_id := nextval('complaint_id_seq');
  RETURN 'CMP-' || LPAD(next_id::TEXT, 4, '0');
END;
$$;

-- Recreate set_complaint_id with proper security
CREATE OR REPLACE FUNCTION public.set_complaint_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.complaint_id IS NULL THEN
    NEW.complaint_id := public.generate_complaint_id();
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER set_complaint_id_trigger
  BEFORE INSERT ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.set_complaint_id();