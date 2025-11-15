import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DemoAccount {
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'staff' | 'student';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const demoAccounts: DemoAccount[] = [
      {
        email: 'student@brototype.com',
        password: 'Demo@123',
        fullName: 'Demo Student',
        role: 'student'
      },
      {
        email: 'staff@brototype.com',
        password: 'Demo@123',
        fullName: 'Demo Staff',
        role: 'staff'
      },
      {
        email: 'admin@brototype.com',
        password: 'Demo@123',
        fullName: 'Demo Admin',
        role: 'admin'
      }
    ];

    const results = [];

    for (const account of demoAccounts) {
      console.log(`Creating account for ${account.email}...`);
      
      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
      const userExists = existingUser?.users.some(u => u.email === account.email);

      if (userExists) {
        console.log(`User ${account.email} already exists, skipping...`);
        results.push({ email: account.email, status: 'already_exists' });
        continue;
      }

      // Create user using admin API
      const { data: newUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          full_name: account.fullName
        }
      });

      if (signUpError) {
        console.error(`Error creating user ${account.email}:`, signUpError);
        results.push({ email: account.email, status: 'error', error: signUpError.message });
        continue;
      }

      if (!newUser.user) {
        console.error(`No user returned for ${account.email}`);
        results.push({ email: account.email, status: 'error', error: 'No user returned' });
        continue;
      }

      console.log(`User ${account.email} created successfully`);

      // Assign role
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: newUser.user.id,
          role: account.role
        });

      if (roleError) {
        console.error(`Error assigning role to ${account.email}:`, roleError);
        results.push({ 
          email: account.email, 
          status: 'user_created_role_error', 
          error: roleError.message 
        });
        continue;
      }

      console.log(`Role ${account.role} assigned to ${account.email}`);
      results.push({ 
        email: account.email, 
        role: account.role,
        status: 'success' 
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Demo accounts setup completed',
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in setup-demo-accounts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
