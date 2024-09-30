'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface LeaderboardEntry {
  display_name: string
  puzzles_solved: number
  puzzles_attempted: number
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('leaderboard')
        .select('display_name, puzzles_solved, puzzles_attempted')
        .order('puzzles_solved', { ascending: false })
        .order('puzzles_attempted', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching leaderboard:', error)
      } else {
        setLeaderboard(data || [])
      }
      setIsLoading(false)
    }

    fetchLeaderboard()
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center">Loading leaderboard...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Solved</TableHead>
                <TableHead className="text-right">Attempted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{entry.display_name}</TableCell>
                  <TableCell className="text-right">{entry.puzzles_solved}</TableCell>
                  <TableCell className="text-right">{entry.puzzles_attempted}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}