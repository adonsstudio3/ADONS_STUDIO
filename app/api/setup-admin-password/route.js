import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const adminEmail = 'adonsstudio3@gmail.com';
    const adminPassword = 'admin123'; // Temporary password
    
    console.log('Setting up admin password for:', adminEmail);
    
    // First, get the user ID
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }
    
    const adminUser = users.users.find(user => user.email === adminEmail);
    if (!adminUser) {
      throw new Error(`Admin user ${adminEmail} not found`);
    }
    
    console.log('Found admin user:', adminUser.id);
    
    // Update the user's password
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      adminUser.id,
      {
        password: adminPassword
      }
    );
    
    if (updateError) {
      throw new Error(`Failed to update password: ${updateError.message}`);
    }
    
    console.log('Password updated successfully');
    
    return Response.json({
      success: true,
      message: 'Admin password set successfully',
      email: adminEmail,
      password: adminPassword,
      userId: adminUser.id,
      note: 'You can now use this password to change it via the admin interface'
    });
    
  } catch (error) {
    console.error('Setup password error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}