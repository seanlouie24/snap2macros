// Signup page

'use client'

import React, { useState } from 'react'
import api from '@/lib/api'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      alert('Please enter email and password')
      return
    }

    try {
      const res = await api.post('/auth/signup', { email, password })
      localStorage.setItem('token', res.data.token)
      router.push('/dashboard')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Signup failed')
      } else {
        alert('An unexpected error occurred')
      }
    }
  }

  return (
    <div className='mx-auto max-w-md rounded-xl bg-white p-6 shadow-md'>
      <h1 className='mb-4 text-2xl font-semibold'>Signup</h1>
      <form onSubmit={handleSignup} className='flex flex-col gap-4'>
        <input
          type='email'
          placeholder='Email'
          className='rounded border p-2'
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type='password'
          placeholder='Password'
          className='rounded border p-2'
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type='submit' className='rounded bg-blue-500 py-2 text-white'>
          Signup
        </button>

        <p className='mt-4 text-center'>
          Already a User?
          <Link href='/login'>
            <button className='ml-2 text-blue-500 underline'>Login</button>
          </Link>
        </p>
      </form>
    </div>
  )
}
