import { testSupabaseConnection } from '@/lib/supabase'
import DailyCrossword from '../components/DailyCrossword'

export default async function Home() {
  const testResult = await testSupabaseConnection()

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold mb-8">Daily Crossword</h1>
        {testResult ? (
          <p className="text-green-500">Database connection successful</p>
        ) : (
          <p className="text-red-500">Database connection failed</p>
        )}
      </div>
      <DailyCrossword />
    </main>
  )
}