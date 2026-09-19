import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { mobile, password } = await request.json();

    if (!mobile || !password) {
      return NextResponse.json({ error: 'Mobile and password required' }, { status: 400 });
    }

    const { data: member, error } = await supabase
      .from('members')
      .select('*')
      .eq('mobile', mobile)
      .single();

    if (error || !member) {
      return NextResponse.json({ error: 'Invalid mobile or password' }, { status: 401 });
    }

    if (member.status === 'pending') {
      return NextResponse.json({ error: 'Your registration is pending admin approval' }, { status: 403 });
    }

    if (member.status === 'rejected') {
      return NextResponse.json({ error: 'Your registration was rejected. Contact admin.' }, { status: 403 });
    }

    if (member.status === 'inactive') {
      return NextResponse.json({ error: 'Your account is inactive. Contact admin.' }, { status: 403 });
    }

    const passwordMatch = await bcrypt.compare(password, member.password_hash);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid mobile or password' }, { status: 401 });
    }

    const user = {
      id: member.id,
      member_code: member.member_code,
      full_name: member.full_name,
      mobile: member.mobile,
      role: member.role,
      status: member.status,
      joining_date: member.joining_date,
    };

    return NextResponse.json({ user });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}