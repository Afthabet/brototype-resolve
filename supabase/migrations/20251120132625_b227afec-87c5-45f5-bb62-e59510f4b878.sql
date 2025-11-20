-- Fix RLS policy for user_roles to allow users to insert their own role during signup
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Users can insert their own role" ON user_roles;

-- Allow users to view their own role
CREATE POLICY "Users can view their own role"
  ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own role during signup
CREATE POLICY "Users can insert their own role"
  ON user_roles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);