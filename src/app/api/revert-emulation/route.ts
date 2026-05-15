import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.set('iq_emulate', '', {
    path: '/',
    sameSite: 'strict',
    maxAge: 0,
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
  })
  return res
}
