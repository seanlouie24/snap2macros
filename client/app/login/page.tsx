// Login Page
'use client'
import { useState } from 'react'
import api from '@/lib/api'
import axios from 'axios'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      alert('Logged in!')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Login failed')
      } else {
        alert('An unexpected error occurred')
      }
    }
  }

  return (
    <div className='mx-auto max-w-md rounded-xl bg-white p-6 shadow-md'>
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
      </form>
    </div>
  )
}
