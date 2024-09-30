import { Metadata } from 'next'
import DailyCrossword from '@/components/DailyCrossword'

export const metadata: Metadata = {
  title: 'Daily Crossword Puzzle',
  description: 'Challenge yourself with our daily crossword puzzle. New themes and clues every day!',
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">Daily Crossword</h1>
        <DailyCrossword />
      </div>
    </main>
  )
}