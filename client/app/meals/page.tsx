// Meals Page

'use client'

import { useState, ChangeEvent, useEffect } from 'react'
import api from '@/lib/api'
import { Meal, AiResponse } from '@/types/types'
import { toast } from 'react-toastify'

const Meals = () => {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [meals, setMeals] = useState<Meal[]>([])

  // Fetch meals for the logged-in user
  const fetchMeals = async () => {
    try {
      const res = await api.get<Meal[]>('/meals')
      setMeals(res.data.filter(meal => meal.calories > 0))
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to fetch meals')
    }
  }

  useEffect(() => {
    fetchMeals()
  }, [])

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])

      // Revoke previous preview URL if exists
      if (previewUrl) URL.revokeObjectURL(previewUrl)

      const url = URL.createObjectURL(e.target.files[0])
      setPreviewUrl(url)
    }
  }

  // Upload image to AI endpoint and update state
  const handleUpload = async () => {
    if (!file) return toast.error('No file selected')
    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('image', file)

      // Upload image & detect meal via AI
      const aiResponse = await api.post<AiResponse>('/ai/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const newMeal = aiResponse.data.meal

      // Update frontend state
      setMeals(prev => [newMeal, ...prev])

      toast.success(`Meal logged: ${newMeal.name}`)

      // Clear file & revoke preview URL
      setFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    } catch (err: any) {
      // Updated to match backend 'error' field
      toast.error(err.response?.data?.error || 'AI upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='mx-auto max-w-md p-4'>
      <h1 className='mb-6 text-center text-3xl font-bold'>Log Meal</h1>

      {/* File input + Upload */}
      <div className='mb-6 flex flex-col items-center gap-4 rounded-lg border bg-white p-4 shadow-sm'>
        {previewUrl && (
          <img
            src={previewUrl}
            alt='Preview'
            className='h-32 w-32 rounded border object-cover'
          />
        )}

        <input
          type='file'
          accept='image/*'
          onChange={handleFileChange}
          className='block w-full text-sm text-gray-600 file:mr-4 file:rounded-full file:border-0 file:bg-blue-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-600'
        />

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className={`w-full rounded-lg px-4 py-2 font-semibold text-white transition ${loading || !file ? 'cursor-not-allowed bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? 'Uploading...' : 'Upload & Detect Meal'}
        </button>
      </div>

      {/* Meals list */}
      <div className='space-y-4'>
        {meals.length === 0 && (
          <p className='text-center text-gray-500'>No meals logged yet.</p>
        )}

        {meals.map(meal => (
          <div
            key={meal.id}
            className='flex flex-col items-start rounded-lg border bg-white p-4 shadow transition hover:shadow-md'
          >
            <div className='flex w-full items-center justify-between'>
              <h2 className='text-lg font-semibold'>{meal.name}</h2>
              <span className='text-sm text-gray-500'>
                {new Date(meal.createdAt).toLocaleString()}
              </span>
            </div>
            <p className='mt-1'>
              Calories: {meal.calories} | Protein: {meal.protein}g | Carbs:{' '}
              {meal.carbs}g | Fat: {meal.fat}g
            </p>
            {meal.imageUrl && (
              <img
                src={meal.imageUrl}
                alt={meal.name}
                className='mt-2 h-32 w-32 rounded border object-cover'
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Meals
