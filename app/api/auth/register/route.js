import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

function generateMemberCode() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SBA-${year}-${random}`;
}

export async function POST(request) {
  try {
    const { full_name, mobile, email, password, address } = await request.json();

    if (!full_name || !mobile || !password) {
      return NextResponse.json({ error: 'Name, mobile, and password are required' }, { status: 400 });
    }

    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json({ error: 'Mobile must be 10 digits' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('members')
      .select('id')
      .eq('mobile', mobile)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'This mobile number is already registered' }, { status: 400 });
    }

    let memberCode = generateMemberCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data: codeCheck } = await supabase
        .from('members')
        .select('id')
        .eq('member_code', memberCode)
        .maybeSingle();
      if (!codeCheck) break;
      memberCode = generateMemberCode();
      attempts++;
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data: newMember, error } = await supabase
      .from('members')
      .insert({
        member_code: memberCode,
        full_name,
        mobile,
        email: email || null,
        password_hash,
        address: address || null,
        role: 'member',
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Registration error:', error);
      return NextResponse.json({ error: 'Registration failed. Try again.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      member_code: newMember.member_code,
      message: 'Registration submitted. Wait for admin approval.',
    });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}