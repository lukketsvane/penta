'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface LeaderboardProps {
  onClose: () => void
}

interface LeaderboardEntry {
  username: string
  puzzles_solved: number
}

export default function Leaderboard({ onClose }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('username, puzzles_solved')
      .order('puzzles_solved', { ascending: false })
      .limit(10)

    if (error) console.error('Error fetching leaderboard:', error)
    else setLeaderboard(data)
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="font-semibold">Username</div>
          <div className="font-semibold text-right">Puzzles Solved</div>
          {leaderboard.map((entry, index) => (
            <>
              <div key={`name-${index}`}>{entry.username}</div>
              <div key={`score-${index}`} className="text-right">{entry.puzzles_solved}</div>
            </>
          ))}
        </div>
        <Button onClick={onClose} className="w-full">Close</Button>
      </CardContent>
    </Card>
  )
}