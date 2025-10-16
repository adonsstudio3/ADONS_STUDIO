import { supabaseAdmin } from '@/lib/supabase';

// Simple script to set admin password in Supabase
// This sets up adonsstudio3@gmail.com as an admin user

export async function GET() {
  try {
    const adminEmail = 'adonsstudio3@gmail.com';
    const adminPassword = 'admin123'; // Change this to your preferred password
    
    // Create the admin user in Supabase Auth if it doesn't exist
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true // Auto-confirm the email
    });

    if (authError && !authError.message.includes('already registered')) {
      throw authError;
    }

    const userId = authData?.user?.id;
    
    // Ensure admin_users record exists
    const { data: existingAdmin } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('email', adminEmail)
      .single();

    if (!existingAdmin && userId) {
      const { error: insertError } = await supabaseAdmin
        .from('admin_users')
        .insert([{
          id: userId,
          email: adminEmail,
          full_name: 'Adons Studio Admin',
          role: 'super_admin',
          is_active: true
        }]);

      if (insertError) {
        console.error('Admin user insert error:', insertError);
      }
    }

    return Response.json({
      success: true,
      message: 'Admin user setup complete',
      email: adminEmail,
      note: 'You can now login with this email and the password: admin123'
    });

  } catch (error) {
    console.error('Admin setup error:', error);
    return Response.json({
      success: false,
      error: error.message,
      note: 'Check server logs for details'
    }, { status: 500 });
  }
}