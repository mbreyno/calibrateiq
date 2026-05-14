import { NextResponse } from 'next/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.calibrateiq.app'

export async function POST() {
  const res = NextResponse.redirect(`${APP_URL}/dashboard`)
  res.cookies.set('iq_emulate', '', {
    path: '/',
    sameSite: 'strict',
    maxAge: 0,
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
  })
  return res
}
