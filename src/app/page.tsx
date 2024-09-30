import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import DailyCrossword from '@/components/DailyCrossword'

export const dynamic = 'force-dynamic'

async function getCrosswords() {
  const supabase = createServerComponentClient({ cookies })
  const { data, error } = await supabase
    .from('crosswords')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching crosswords:', error)
    throw new Error('Failed to fetch crosswords')
  }

  return data
}

export default async function Home() {
  const crosswordsData = await getCrosswords()

  return <DailyCrossword initialCrosswords={crosswordsData} />
}