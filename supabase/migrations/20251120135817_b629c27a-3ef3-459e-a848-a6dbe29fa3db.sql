-- Make complaint_id nullable so the trigger can set it
ALTER TABLE public.complaints 
ALTER COLUMN complaint_id DROP NOT NULL;

-- Update the trigger to handle NULL complaint_id
CREATE OR REPLACE FUNCTION public.set_complaint_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.complaint_id IS NULL OR NEW.complaint_id = '' THEN
    NEW.complaint_id := public.generate_complaint_id();
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS set_complaint_id_trigger ON public.complaints;
CREATE TRIGGER set_complaint_id_trigger
  BEFORE INSERT ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.set_complaint_id();