'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw, ChevronLeft, ChevronRight, Info, User, Trophy } from "lucide-react"
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import LoginSignup from './LoginSignup'
import Leaderboard from './Leaderboard'

interface CrosswordCell {
  value: string;
  number?: number;
  isBlocked: boolean;
}

interface CrosswordClue {
  number: number;
  clue: string;
}

interface CrosswordData {
  id: number;
  date: string;
  title: string;
  theme: string;
  grid: CrosswordCell[][];
  solution: string[][];
  across_clues: CrosswordClue[];
  down_clues: CrosswordClue[];
  song?: {
    title: string;
    artist: string;
  };
  theme_image_url?: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function DailyCrossword() {
  const [crosswords, setCrosswords] = useState<CrosswordData[]>([])
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0)
  const [userGrid, setUserGrid] = useState<string[][]>([])
  const [attempts, setAttempts] = useState(0)
  const [message, setMessage] = useState('')
  const [isCorrect, setIsCorrect] = useState(false)
  const [hasPressedPast, setHasPressedPast] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [spotifyTrackId, setSpotifyTrackId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchCrosswords()
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchCrosswords = async () => {
    setIsLoading(true)
    setError(null)
    try {
      console.log('Fetching crosswords...')
      const { data, error } = await supabase
        .from('crosswords')
        .select('*')
        .order('date', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Fetched data:', data)

      if (data && data.length > 0) {
        const parsedCrosswords = data.map(crossword => {
          try {
            return {
              ...crossword,
              grid: typeof crossword.grid === 'string' ? JSON.parse(crossword.grid) : crossword.grid,
              solution: typeof crossword.solution === 'string' ? JSON.parse(crossword.solution) : crossword.solution,
              across_clues: typeof crossword.across_clues === 'string' ? JSON.parse(crossword.across_clues) : crossword.across_clues,
              down_clues: typeof crossword.down_clues === 'string' ? JSON.parse(crossword.down_clues) : crossword.down_clues,
              song: crossword.song && typeof crossword.song === 'string' ? JSON.parse(crossword.song) : crossword.song
            }
          } catch (parseError) {
            console.error('Error parsing crossword data:', parseError, crossword)
            return null
          }
        }).filter(Boolean) as CrosswordData[]

        console.log('Parsed crosswords:', parsedCrosswords)
        
        if (parsedCrosswords.length > 0) {
          setCrosswords(parsedCrosswords)
          initializeUserGrid(parsedCrosswords[0])
        } else {
          setError('No valid puzzles available after parsing.')
        }
      } else {
        setError('No puzzles available in the database.')
      }
    } catch (err) {
      console.error('Error fetching crosswords:', err)
      setError('Failed to load crosswords. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const initializeUserGrid = (puzzle: CrosswordData) => {
    setUserGrid(puzzle.grid.map(row => row.map(() => '')))
    setAttempts(0)
    setIsCorrect(false)
    setMessage('')
    if (puzzle.song) {
      fetchSpotifyTrackId(puzzle.song.title, puzzle.song.artist)
    } else {
      setSpotifyTrackId(null)
    }
  }

  const fetchSpotifyTrackId = async (title: string, artist: string) => {
    try {
      const response = await fetch('/api/spotify-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, artist }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch Spotify track')
      }

      const data = await response.json()
      setSpotifyTrackId(data.trackId)
    } catch (error) {
      console.error('Error fetching Spotify track:', error)
      setSpotifyTrackId(null)
    }
  }

  const handleInputChange = (rowIndex: number, colIndex: number, value: string) => {
    const newGrid = [...userGrid]
    newGrid[rowIndex][colIndex] = value.toUpperCase()
    setUserGrid(newGrid)
  }

  const handleSubmit = async () => {
    if (crosswords.length === 0 || !user) return

    const currentPuzzle = crosswords[currentPuzzleIndex]
    if (attempts < 10) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      const isSubmissionCorrect = userGrid.every((row, i) =>
        row.every((cell, j) => cell === currentPuzzle.solution[i][j] || currentPuzzle.grid[i][j].isBlocked)
      )

      if (isSubmissionCorrect) {
        setIsCorrect(true)
        setMessage("Congratulations! You've solved the crossword!")
        
        // Update leaderboard
        const { data, error } = await supabase
          .from('leaderboard')
          .upsert({ 
            user_id: user.id, 
            username: user.user_metadata.username,
            puzzles_solved: 1 
          }, { 
            onConflict: 'user_id',
            count: 'puzzles_solved'
          })

        if (error) console.error('Error updating leaderboard:', error)
      } else {
        setMessage(`Attempt ${newAttempts} submitted. You have ${10 - newAttempts} attempts left.`)
      }
    } else {
      setMessage("Sorry, you're out of attempts. Try another puzzle!")
    }
  }

  const handleReset = () => {
    if (crosswords.length === 0) return
    initializeUserGrid(crosswords[currentPuzzleIndex])
  }

  const handlePast = () => {
    const newIndex = (currentPuzzleIndex + 1) % crosswords.length
    setCurrentPuzzleIndex(newIndex)
    initializeUserGrid(crosswords[newIndex])
    setHasPressedPast(true)
  }

  const handleNext = () => {
    const newIndex = (currentPuzzleIndex - 1 + crosswords.length) % crosswords.length
    setCurrentPuzzleIndex(newIndex)
    initializeUserGrid(crosswords[newIndex])
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-xl font-bold mb-4">{error}</p>
        <Button onClick={fetchCrosswords}>Retry</Button>
      </div>
    )
  }

  if (crosswords.length === 0) {
    return <div className="flex justify-center items-center h-screen">No puzzles available</div>
  }

  const currentPuzzle = crosswords[currentPuzzleIndex]
  const isOutOfAttempts = attempts >= 10

  return (
    <div className="max-w-md mx-auto px-2 py-4">
      <div className="w-full max-w-md mx-auto">
        {showLogin ? (
          <LoginSignup onClose={() => setShowLogin(false)} onLogin={checkUser} />
        ) : showLeaderboard ? (
          <Leaderboard onClose={() => setShowLeaderboard(false)} />
        ) : (
          <div className={`${isOutOfAttempts ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="relative mb-2">
              <h1 className="text-lg font-bold">{currentPuzzle.title}</h1>
              <p className="text-sm text-gray-600">{currentPuzzle.theme}</p>
              <div className="absolute top-0 right-0 z-10 flex items-center">
                {currentPuzzle.song && (
                  <p className="text-xs mr-2">{currentPuzzle.song.title} - {currentPuzzle.song.artist}</p>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="text-primary hover:text-primary-foreground p-0"
                  aria-label="Reset puzzle"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {spotifyTrackId && (
              <div className="mb-4">
                <iframe
                  src={`https://open.spotify.com/embed/track/${spotifyTrackId}`}
                  width="100%"
                  height="80"
                  frameBorder="0"
                  allowTransparency={true}
                  allow="encrypted-media"
                ></iframe>
              </div>
            )}
            {currentPuzzle.theme_image_url && (
              <div className="mb-4">
                <Image
                  src={currentPuzzle.theme_image_url}
                  alt={`Theme image for ${currentPuzzle.title}`}
                  width={300}
                  height={200}
                  layout="responsive"
                />
              </div>
            )}
            <Card className={`mb-2 ${isCorrect ? 'animate-rainbow' : ''}`}>
              <CardContent className="p-0">
                <div className="grid grid-cols-5 gap-0 border border-primary aspect-square">
                  {currentPuzzle.grid.map((row, rowIndex) => (
                    row.map((cell, colIndex) => (
                      <div key={`${rowIndex}-${colIndex}`} className="relative border border-primary aspect-square">
                        {cell.number && (
                          <span className="absolute top-0 left-0 text-[6px] p-0.5">{cell.number}</span>
                        )}
                        {cell.isBlocked ? (
                          <div className={`w-full h-full bg-primary ${isCorrect ? 'animate-rainbow' : ''}`}></div>
                        ) : (
                          <Input
                            type="text"
                            maxLength={1}
                            className="w-full h-full text-center text-xs font-bold border-0 rounded-none focus:ring-0 p-0"
                            value={userGrid[rowIndex]?.[colIndex] || ''}
                            onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                            disabled={isOutOfAttempts}
                            aria-label={`Row ${rowIndex + 1}, Column ${colIndex + 1}`}
                          />
                        )}
                      </div>
                    ))
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <h2 className="text-xs font-semibold mb-1">Across</h2>
                <ul className="space-y-0">
                  {currentPuzzle.across_clues.map((clue) => (
                    <li key={`across-${clue.number}`} className="text-[8px] leading-tight">{clue.number}. {clue.clue}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-xs font-semibold mb-1">Down</h2>
                <ul className="space-y-0">
                  {currentPuzzle.down_clues.map((clue) => (
                    <li key={`down-${clue.number}`} className="text-[8px] leading-tight">{clue.number}. {clue.clue}</li>
                  ))}
                </ul>
              </div>
            </div>
            <Card className={`mt-2 ${isOutOfAttempts ? 'opacity-100' : ''}`}>
              <CardContent className="p-2">
                <Button onClick={handleSubmit} disabled={isOutOfAttempts} className="w-full mb-1 text-xs py-1">
                  Submit
                </Button>
                {message && (
                  <p className="text-center text-xs">{message}</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <footer className="mt-4 text-center">
        <p className="text-[10px] mb-1">made by @kondensjasjonskjerner with &lt;3 by @lukketsvane</p>
        <div className="flex justify-between items-center text-[10px] border-t border-gray-200 pt-1">
          <Button
            variant="link"
            size="sm"
            onClick={handlePast}
            className="p-0 h-auto text-[10px]"
            aria-label="Previous puzzle"
          >
            <ChevronLeft className="h-3 w-3 mr-1" />
            Past
          </Button>
          <span>{new Date(currentPuzzle.date).toISOString().split('T')[0]}</span>
          <Button
            variant="link"
            size="sm"
            onClick={() => setShowLeaderboard(true)}
            className="p-0 h-auto text-[10px]"
            aria-label="Leaderboard"
          >
            <Trophy className="h-3 w-3 mr-1" />
            Leaderboard
          </Button>
          <Button
            variant="link"
            size="sm"
            onClick={() => setShowLogin(true)}
            className="p-0 h-auto text-[10px]"
            aria-label="Login"
          >
            <User className="h-3 w-3 mr-1" />
            {user ? 'Profile' : 'Login'}
          </Button>
          <Button
            variant="link"
            size="sm"
            onClick={() => {/* Implement about functionality */}}
            className="p-0 h-auto text-[10px]"
            aria-label="About"
          >
            <Info className="h-3 w-3 mr-1" />
            About
          </Button>
          {hasPressedPast && (
            <Button
              variant="link"
              size="sm"
              onClick={handleNext}
              className="p-0 h-auto text-[10px]"
              aria-label="Next puzzle"
            >
              Next
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}