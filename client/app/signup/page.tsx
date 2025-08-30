// Signup page

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import apiPublic from '@/lib/apiPublic'

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
      const res = await apiPublic.post('/auth/signup', { email, password })

      if (res.status === 201 || res.status === 200) {
        alert('Signup successful!')
        router.push('/dashboard')
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || 'Something went wrong'

      console.error(msg)
      alert(msg)
    }
  }

  return (
    <div className='mx-auto max-w-md rounded-xl bg-white p-6 shadow-md'>
      <h1 className='mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-center text-5xl font-extrabold text-transparent drop-shadow-lg'>
        Snap2Macros
      </h1>
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
