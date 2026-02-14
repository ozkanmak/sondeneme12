'use server'

import { sql } from './db'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(email: string, password: string) {
  try {
    const users = await sql`
      SELECT id, email, full_name, role, password_hash
      FROM users 
      WHERE email = ${email}
    `
    
    if (users.length === 0) {
      return { error: 'Geçersiz email veya şifre' }
    }
    
    const user = users[0]
    
    if (user.password_hash !== password) {
      return { error: 'Geçersiz email veya şifre' }
    }
    
    // Set auth cookie
    const cookieStore = await cookies()
    cookieStore.set('user_id', user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })
    
    cookieStore.set('user_role', user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })
    
    return { success: true, role: user.role }
  } catch (error) {
    console.error('[v0] Login error:', error)
    return { error: 'Giriş yapılırken bir hata oluştu' }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('user_id')
  cookieStore.delete('user_role')
  redirect('/login')
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('user_id')?.value
  
  if (!userId) {
    return null
  }
  
  try {
    const users = await sql`
      SELECT u.id, u.email, u.full_name, u.role, u.avatar_url
      FROM users u
      WHERE u.id = ${parseInt(userId)}
    `
    
    if (users.length === 0) {
      return null
    }
    
    return users[0]
  } catch (error) {
    console.error('[v0] Get current user error:', error)
    return null
  }
}
