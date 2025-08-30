// Login Page
'use client'
import { useState } from 'react'
import apiPublic from '@/lib/apiPublic'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      alert('Please enter email and password')
      return
    }

    try {
      const res = await apiPublic.post('/auth/login', { email, password })

      if (res.data?.token) {
        localStorage.setItem('jwt', res.data.token)
      }
      router.push('/dashboard')
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed'

      console.error(msg)
      alert(msg)
    }
  }

  return (
    <div className='mx-auto max-w-md rounded-xl bg-white p-6 shadow-md'>
      <h1 className='mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-center text-5xl font-extrabold text-transparent drop-shadow-lg'>
        Snap2Macros
      </h1>

      <h1 className='mb-4 text-2xl font-semibold'>Login</h1>
      <form onSubmit={handleLogin} className='flex flex-col gap-4'>
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
          Login
        </button>

        <p className='mt-4 text-center'>
          New User?
          <Link href='/signup'>
            <button className='ml-2 text-blue-500 underline'>Sign up</button>
          </Link>
        </p>
      </form>
    </div>
  )
}
