// Meals Page

'use client'

import { useState, ChangeEvent, use, useEffect } from 'react'
import api from '@/lib/api'
import { AiResponse, Meal } from '@/types/types'
import { toast } from 'react-toastify'

const Meals = () => {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [meals, setMeals] = useState<Meal[]>([])

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await api.get<Meal[]>('/meals')
        setMeals(res.data)
      } catch (err: any) {
        console.error(err)
        toast.error('Failed to fetch meals')
      }
    }
    fetchMeals()
  }, [])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) return toast.error('No file selected')
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('image', file)

      // Send file to AI endpoint
      const res = await api.post<AiResponse>('/ai/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Save meal
      const savedMeal = await api.post<Meal>('/meals', res.data)
      console.log('Saved meal:', savedMeal.data)

      setMeals(prev => [savedMeal.data, ...prev])
      toast.success(`Meal logged: ${res.data.name}`)
      setFile(null)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'AI upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='mx-auto max-w-md p-4'>
      <h1 className='mb-4 text-2xl font-bold'>Log Meal</h1>
      <input type='file' accept='image/*' onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading} className='btn mt-2'>
        {loading ? 'Uploading...' : 'Upload & Detect Meal'}
      </button>

      <div className='mt-6 space-y-4'>
        {meals.length === 0 && <p>No meals logged yet.</p>}

        {meals.map(meal => (
          <div key={meal.id} className='rounded border p-4 shadow'>
            <h2 className='text-lg font-semibold'>{meal.name}</h2>
            <p>Calories: {meal.calories}</p>
            <p>
              Protein: {meal.protein}g | Carbs: {meal.carbs}g | Fat: {meal.fat}g
            </p>
            {meal.imageUrl && (
              <img
                src={meal.imageUrl}
                alt={meal.name}
                className='mt-2 h-32 w-32 rounded object-cover'
              />
            )}
            <p className='text-sm text-gray-500'>
              Logged at: {new Date(meal.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Meals
