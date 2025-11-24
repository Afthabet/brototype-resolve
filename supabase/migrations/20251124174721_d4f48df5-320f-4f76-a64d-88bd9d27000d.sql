-- Fix RLS policies for admin access

-- Drop and recreate the complaints SELECT policy to ensure it works
DROP POLICY IF EXISTS "Students can view own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admins can view all complaints" ON public.complaints;
DROP POLICY IF EXISTS "Staff can view all complaints" ON public.complaints;

-- Create a comprehensive SELECT policy that definitely works for admin/staff
CREATE POLICY "Users can view complaints based on role"
ON public.complaints
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'staff')
  )
);

-- Ensure profiles are viewable by authenticated users
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);