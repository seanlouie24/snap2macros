// MacroCalc page

'use client'

import { useMemo, useState } from 'react'

type Sex = 'male' | 'female'
type Units = 'metric' | 'imperial'
type Activity = 'inactive' | 'light' | 'moderate' | 'active' | 'veryActive'
type Goal = 'lose' | 'maintain' | 'gain'

// Maps an activity level -> to a multiplier used in the TDEE (Total Daily Energy Expenditure) calculation
const ACTIVITY_FACTORS: Record<Activity, number> = {
  inactive: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9
}

// Macro split presets -> % of calories that should come from protein, carbs, fat.
const PRESETS = {
  'Balance (P30 / C45 / F25)': { protein: 30, carbs: 45, fat: 25 },
  'Lower-Carb (P35 / C35 / F20)': { protein: 35, carbs: 35, fat: 30 },
  'Higher-Carb (P25 / C55, F20)': { protein: 25, carbs: 55, fat: 20 }
}

export default function MacroCalcPage() {
  // Placeholders states
  const [units, setUnits] = useState<Units>('imperial')
  const [sex, setSex] = useState<Sex>('male')
  const [age, setAge] = useState<number>(25)

  const [weightLb, setWeightLb] = useState<number>(180)
  const [heightFt, setHeightFt] = useState<number>(5)
  const [heightIn, setHeightIn] = useState<number>(10)

  const [weightKg, setWeightKg] = useState<number>(82)
  const [heightCm, setHeightCm] = useState<number>(178)

  const [activity, setActivity] = useState<Activity>('moderate')
  const [goal, setGoal] = useState<Goal>('maintain')
  const [preset, setPreset] = useState<keyof typeof PRESETS>(
    'Balance (P30 / C45 / F25)'
  )

  // Unit conversions
  const kg = useMemo(() => {
    return units === 'imperial' ? weightLb * 0.45359237 : weightKg
  }, [units, weightLb, weightKg])

  const cm = useMemo(() => {
    if (units === 'imperial') {
      const totalIn = heightFt * 12 + heightIn
      return totalIn * 2.54
    }
    return heightCm
  }, [units, heightFt, heightIn, heightCm])

  // BMR (Basal Metabolic Rate) (Mifflin-St Jeor eq.)
  const bmr = useMemo(() => {
    const base = 10 * kg + 6.25 * cm - 5 * age
    return Math.round(sex === 'male' ? base + 5 : base - 161)
  }, [kg, cm, age, sex])

  // TDEE(total daily energy expenditure) and goal adjustment
  const tdee = useMemo(
    () => Math.round(bmr * ACTIVITY_FACTORS[activity]),
    [bmr, activity]
  )

  const calories = useMemo(() => {
    const delta = goal === 'lose' ? -0.15 : goal === 'gain' ? 0.15 : 0
    return Math.round(tdee * (1 + delta))
  }, [tdee, goal])

  // Macro grams from preset
  const split = PRESETS[preset]
  const proteinGrams = Math.round((calories * (split.protein / 100)) / 4)
  const carbsGrams = Math.round((calories * (split.carbs / 100)) / 4)
  const fatGrams = Math.round((calories * (split.fat / 100)) / 9)

  // Validation Helper
  const invalid =
    !age ||
    age < 10 ||
    age > 100 ||
    kg <= 0 ||
    cm <= 0 ||
    split.protein + split.carbs + split.fat !== 100

  const reset = () => {
    setUnits('imperial')
    setSex('male')
    setAge(25)
    setWeightLb(180)
    setHeightFt(5)
    setHeightIn(10)
    setWeightKg(82)
    setHeightCm(178)
    setActivity('moderate')
    setGoal('maintain')
    setPreset('Balance (P30 / C45 / F25)')
  }

  const exportText = () => {
    const txt = `Macro Calculator
  Units: ${units}
  Sex: ${sex}
  Age: ${age}
  Weight: ${units === 'imperial' ? weightLb + ' lb' : weightKg + ' kg'}
  Height: ${units === 'imperial' ? `${heightFt}ft ${heightIn}in` : heightCm + ' cm'}
  Activity: ${activity}
  Goal: ${goal}
  
  Results:
  BMR: ${bmr} kcal
  TDEE: ${tdee} kcal
  Calories (goal): ${calories} kcal
  Protein: ${proteinGrams} g (${split.protein}%)
  Carbs: ${carbsGrams} g (${split.carbs}%)
  Fat: ${fatGrams} g (${split.fat}%)
  `
    navigator.clipboard?.writeText(txt)
    alert('Results copied to clipboard')
  }
  return (
    <div className='mx-auto max-w-3xl space-y-6 rounded-xl bg-white p-6 shadow-md'>
      <h1 className='text-2xl font-semibold'>Macro Calculator</h1>

      {/* Units */}
      <div className='grid gap-4 sm:grid-cols-3'>
        <div className='col-span-1'>
          <label className='mb-1 block text-sm font-medium'>Units</label>
          <select
            className='w-full rounded border p-2'
            value={units}
            onChange={e => setUnits(e.target.value as Units)}
          >
            <option value='imperial'>Imperial (lb / ft,in)</option>
            <option value='metric'>Metric (kg / cm)</option>
          </select>
        </div>

        {/* Sex */}
        <div>
          <label className='mb-1 block text-sm font-medium'>Sex</label>
          <select
            className='w-full rounded border p-2'
            value={sex}
            onChange={e => setSex(e.target.value as Sex)}
          >
            <option value='male'>Male</option>
            <option value='female'>Female</option>
          </select>
        </div>

        {/* Age */}
        <div>
          <label className='mb-1 block text-sm font-medium'>Age</label>
          <input
            type='number'
            min={10}
            max={100}
            className='w-full rounded border p-2'
            value={age}
            onChange={e => setAge(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Height & Weight */}
      {units === 'imperial' ? (
        <div className='grid gap-4 sm:grid-cols-3'>
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Weight (lb)
            </label>
            <input
              type='number'
              className='w-full rounded border p-2'
              value={weightLb}
              onChange={e => setWeightLb(Number(e.target.value))}
            />
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Height (ft)
            </label>
            <input
              type='number'
              className='w-full rounded border p-2'
              value={heightFt}
              onChange={e => setHeightFt(Number(e.target.value))}
            />
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Height (in)
            </label>
            <input
              type='number'
              className='w-full rounded border p-2'
              value={heightIn}
              onChange={e => setHeightIn(Number(e.target.value))}
            />
          </div>
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2'>
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Weight (kg)
            </label>
            <input
              type='number'
              className='w-full rounded border p-2'
              value={weightKg}
              onChange={e => setWeightKg(Number(e.target.value))}
            />
          </div>
          <div>
            <label className='mb-1 block text-sm font-medium'>
              Height (cm)
            </label>
            <input
              type='number'
              className='w-full rounded border p-2'
              value={heightCm}
              onChange={e => setHeightCm(Number(e.target.value))}
            />
          </div>
        </div>
      )}

      {/* Activity & Goal */}
      <div className='grid gap-4 sm:grid-cols-2'>
        <div>
          <label className='mb-1 block text-sm font-medium'>
            Activity Level
          </label>
          <select
            className='w-full rounded border p-2'
            value={activity}
            onChange={e => setActivity(e.target.value as Activity)}
          >
            <option value='sedentary'>Sedentary (little/no exercise)</option>
            <option value='light'>Light (1–3 days/week)</option>
            <option value='moderate'>Moderate (3–5 days/week)</option>
            <option value='active'>Active (6–7 days/week)</option>
            <option value='veryActive'>
              Very Active (physical job / 2× day)
            </option>
          </select>
        </div>

        <div>
          <label className='mb-1 block text-sm font-medium'>Goal</label>
          <select
            className='w-full rounded border p-2'
            value={goal}
            onChange={e => setGoal(e.target.value as Goal)}
          >
            <option value='lose'>Lose (~15% deficit)</option>
            <option value='maintain'>Maintain</option>
            <option value='gain'>Gain (~15% surplus)</option>
          </select>
        </div>
      </div>

      {/* Macro preset */}
      <div>
        <label className='mb-1 block text-sm font-medium'>Macro Preset</label>
        <select
          className='w-full rounded border p-2'
          value={preset}
          onChange={e => setPreset(e.target.value as keyof typeof PRESETS)}
        >
          {Object.keys(PRESETS).map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      <div className='rounded-xl border bg-gray-50 p-4'>
        <h2 className='mb-2 text-lg font-semibold'>Results</h2>

        {invalid ? (
          <p className='text-sm text-red-600'>
            Check your inputs (age 10–100, positive height/weight). Macro split
            must equal 100%.
          </p>
        ) : (
          <div className='grid gap-4 sm:grid-cols-3'>
            <div className='rounded bg-white p-3 shadow'>
              <div className='text-sm text-gray-500'>BMR</div>
              <div className='text-xl font-bold'>
                {bmr.toLocaleString()} kcal
              </div>
              <div className='text-sm text-gray-600'>
                The calories your body burns at complete rest
              </div>
            </div>

            <div className='rounded bg-white p-3 shadow'>
              <div className='text-sm text-gray-500'>TDEE</div>
              <div className='text-xl font-bold'>
                {tdee.toLocaleString()} kcal
              </div>
              <div className='text-sm text-gray-600'>
                The total you burn per day including activity
              </div>
            </div>

            <div className='rounded bg-white p-3 shadow'>
              <div className='text-sm text-gray-500'>Calories (goal)</div>
              <div className='text-xl font-bold'>
                {calories.toLocaleString()} kcal
              </div>
              <div className='text-sm text-gray-600'>
                Adjusted for your goal
              </div>
            </div>

            {/* Macros */}
            <div className='col-span-3 mt-2 grid gap-4 sm:grid-cols-3'>
              <div className='rounded bg-white p-3 shadow'>
                <div className='text-sm text-gray-500'>Protein</div>
                <div className='text-xl font-bold'>{proteinGrams} g</div>
                <div className='text-sm text-gray-600'>
                  {split.protein}% of calories
                </div>
              </div>

              <div className='rounded bg-white p-3 shadow'>
                <div className='text-sm text-gray-500'>Carbs</div>
                <div className='text-xl font-bold'>{carbsGrams} g</div>
                <div className='text-sm text-gray-600'>
                  {split.carbs}% of calories
                </div>
              </div>

              <div className='rounded bg-white p-3 shadow'>
                <div className='text-sm text-gray-500'>Fat</div>
                <div className='text-xl font-bold'>{fatGrams} g</div>
                <div className='text-sm text-gray-600'>
                  {split.fat}% of calories
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className='flex gap-3'>
        <button
          onClick={reset}
          className='rounded border px-4 py-2 hover:bg-gray-100'
        >
          Reset
        </button>
        <button
          onClick={exportText}
          className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
        >
          Copy results
        </button>
      </div>

      <div className='text-sm text-gray-500'>
        Tip: change macro presets to experiment with different splits. This
        calculator is input-only (does not save).
      </div>
    </div>
  )
}
