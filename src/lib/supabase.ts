import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('crosswords')
      .select('id, title')
      .limit(1)

    if (error) throw error

    console.log('Supabase connection test:', data)
    return data
  } catch (error) {
    console.error('Supabase connection test failed:', error)
    return null
  }
}