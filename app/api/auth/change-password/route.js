import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { user_id, current_password, new_password } = await request.json();

    if (!user_id || !current_password || !new_password) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    if (new_password.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    // Get current member
    const { data: member } = await supabase
      .from('members')
      .select('password_hash')
      .eq('id', user_id)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const ok = await bcrypt.compare(current_password, member.password_hash);
    if (!ok) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // Hash new password
    const password_hash = await bcrypt.hash(new_password, 10);

    // Update
    const { error } = await supabase
      .from('members')
      .update({ password_hash })
      .eq('id', user_id);

    if (error) {
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Change password error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}