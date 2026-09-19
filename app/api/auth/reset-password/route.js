import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { member_id, new_password, performed_by } = await request.json();

    if (!member_id || !new_password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (new_password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Verify the performer is an admin
    const { data: performer } = await supabase
      .from('members')
      .select('role')
      .eq('id', performed_by)
      .single();

    if (!performer || !['admin', 'super_admin'].includes(performer.role)) {
      return NextResponse.json({ error: 'Only admins can reset passwords' }, { status: 403 });
    }

    // Hash the new password
    const password_hash = await bcrypt.hash(new_password, 10);

    // Update the member's password
    const { error } = await supabase
      .from('members')
      .update({ password_hash })
      .eq('id', member_id);

    if (error) {
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}