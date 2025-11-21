-- Drop the foreign key if it exists (just in case)
ALTER TABLE public.complaints
DROP CONSTRAINT IF EXISTS complaints_user_id_fkey;

-- Add foreign key relationship between complaints.user_id and profiles.id
ALTER TABLE public.complaints
ADD CONSTRAINT complaints_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Also add foreign key for assigned_staff_id
ALTER TABLE public.complaints
DROP CONSTRAINT IF EXISTS complaints_assigned_staff_id_fkey;

ALTER TABLE public.complaints
ADD CONSTRAINT complaints_assigned_staff_id_fkey
FOREIGN KEY (assigned_staff_id) REFERENCES public.profiles(id) ON DELETE SET NULL;