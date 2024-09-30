'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw, ChevronLeft, ChevronRight, Info, User, Trophy } from "lucide-react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import LoginSignup from './LoginSignup'
import Leaderboard from './Leaderboard'
import Profile from './Profile'
import About from './About'

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
    spotify_id?: string;
  };
}

interface DailyCrosswordProps {
  initialCrosswords: CrosswordData[];
}

declare global {
  interface Window {
    onSpotifyIframeApiReady: (api: any) => void;
  }
}

export default function DailyCrossword({ initialCrosswords }: DailyCrosswordProps) {
  const [crosswords, setCrosswords] = useState<CrosswordData[]>(initialCrosswords)
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0)
  const [userGrid, setUserGrid] = useState<string[][]>([])
  const [attempts, setAttempts] = useState(0)
  const [message, setMessage] = useState('')
  const [isCorrect, setIsCorrect] = useState(false)
  const [hasPressedPast, setHasPressedPast] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [embedController, setEmbedController] = useState<any>(null)
  const spotifyEmbedRef = useRef<HTMLDivElement>(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    checkUser()
    if (crosswords.length > 0) {
      const todayIndex = crosswords.findIndex(puzzle => 
        new Date(puzzle.date).toDateString() === new Date().toDateString()
      )
      setCurrentPuzzleIndex(todayIndex !== -1 ? todayIndex : 0)
      initializeUserGrid(crosswords[todayIndex !== -1 ? todayIndex : 0])
    }
    loadSpotifyScript()
  }, [])

  useEffect(() => {
    if (user && crosswords.length > 0) {
      loadPuzzleAttempts(crosswords[currentPuzzleIndex].id)
    }
  }, [user, currentPuzzleIndex])

  useEffect(() => {
    window.onSpotifyIframeApiReady = (IFrameAPI: any) => {
      const element = spotifyEmbedRef.current
      const options = {
        width: '100%',
        height: '80',
        uri: `spotify:track:${crosswords[currentPuzzleIndex].song?.spotify_id}`
      }
      const callback = (EmbedController: any) => {
        setEmbedController(EmbedController)
      }
      if (element) {
        IFrameAPI.createController(element, options, callback)
      }
    }
  }, [currentPuzzleIndex])

  const loadSpotifyScript = () => {
    const script = document.createElement('script')
    script.src = 'https://open.spotify.com/embed/iframe-api/v1'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const initializeUserGrid = (puzzle: CrosswordData) => {
    setUserGrid(puzzle.grid.map(row => row.map(() => '')))
    setAttempts(0)
    setIsCorrect(false)
    setMessage('')
  }

  const loadPuzzleAttempts = async (puzzleId: number) => {
    if (!user) return

    const { data, error } = await supabase
      .from('puzzle_attempts')
      .select('attempts, solved')
      .eq('user_id', user.id)
      .eq('puzzle_id', puzzleId)
      .single()

    if (error) {
      console.error('Error loading puzzle attempts:', error)
      return
    }

    if (data) {
      setAttempts(data.attempts)
      setIsCorrect(data.solved)
    } else {
      setAttempts(0)
      setIsCorrect(false)
    }
  }

  const updatePuzzleAttempts = async (puzzleId: number, newAttempts: number, solved: boolean) => {
    if (!user) return

    const { data, error } = await supabase
      .from('puzzle_attempts')
      .upsert({
        user_id: user.id,
        puzzle_id: puzzleId,
        attempts: newAttempts,
        solved: solved
      }, {
        onConflict: 'user_id,puzzle_id'
      })

    if (error) {
      console.error('Error updating puzzle attempts:', error)
    }
  }

  const handleInputChange = (rowIndex: number, colIndex: number, value: string) => {
    const newGrid = [...userGrid]
    newGrid[rowIndex][colIndex] = value.toUpperCase()
    setUserGrid(newGrid)
  }

  const updateLeaderboard = async (userId: string, displayName: string, solved: boolean) => {
    const { data, error } = await supabase
      .from('leaderboard')
      .upsert(
        { 
          user_id: userId, 
          display_name: displayName, 
          puzzles_solved: solved ? 1 : 0,
          puzzles_attempted: 1
        },
        { 
          onConflict: 'user_id',
          count: 'exact'
        }
      )

    if (error) {
      console.error('Error updating leaderboard:', error)
    }
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
        
        await updateLeaderboard(user.id, user.user_metadata.display_name || user.email, true)
        await updatePuzzleAttempts(currentPuzzle.id, newAttempts, true)
      } else {
        setMessage(`Attempt ${newAttempts} submitted. You have ${10 - newAttempts} attempts left.`)
        await updatePuzzleAttempts(currentPuzzle.id, newAttempts, false)
        if (newAttempts === 1) {
          await updateLeaderboard(user.id, user.user_metadata.display_name || user.email, false)
        }
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setShowLogin(false)
    setShowProfile(false)
  }

  const handleTitleClick = () => {
    setShowLogin(false)
    setShowLeaderboard(false)
    setShowProfile(false)
    setShowAbout(false)
  }

  if (crosswords.length === 0) {
    return <div className="flex justify-center items-center h-screen">No puzzles available</div>
  }

  const currentPuzzle = crosswords[currentPuzzleIndex]
  const isOutOfAttempts = attempts >= 10
  const isCurrentDate = new Date(currentPuzzle.date).toDateString() === new Date().toDateString()

  return (
    <div className="max-w-md mx-auto px-2 py-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-4">
          <h1 
            className="text-3xl font-bold cursor-pointer" 
            onClick={handleTitleClick}
          >
            Stronger Together
          </h1>
          <h2 className="text-xl">Unity and Cooperation</h2>
        </div>
        {showLogin ? (
          <LoginSignup onLogin={checkUser} />
        ) : showLeaderboard ? (
          <Leaderboard />
        ) : showProfile ? (
          <Profile onClose={() => setShowProfile(false)} onLogout={handleLogout} />
        ) : showAbout ? (
          <About onClose={() => setShowAbout(false)} />
        ) : (
          <div className={`${isOutOfAttempts ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="relative mb-2">
              <h1 className="text-lg font-bold">{currentPuzzle.title}</h1>
              <p className="text-sm text-gray-600">{currentPuzzle.theme}</p>
              <div className="absolute top-0 right-0 z-10 flex items-center">
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
            {currentPuzzle.song && currentPuzzle.song.spotify_id && (
              <div ref={spotifyEmbedRef} className="mb-4"></div>
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
                            value={userGrid[rowIndex]?.[colIndex]?.toUpperCase() || ''}
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
          <span>{new Date(currentPuzzle.date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
          <Button
            variant="link"
            size="sm"
            onClick={() => setShowLeaderboard(true)}
            className="p-0 h-auto text-[10px]"
            aria-label="Leaderboard"
          >
            <Trophy className="h-3 w-3 mr-1" />
            Leader
          </Button>
          <Button
            variant="link"
            size="sm"
            onClick={user ? () => setShowProfile(true) : () => setShowLogin(true)}
            className="p-0 h-auto text-[10px]"
            aria-label={user ? "Profile" : "Sign in / Sign up"}
          >
            <User className="h-3 w-3 mr-1" />
            {user ? user.user_metadata.display_name || 'Profile' : 'Sign in'}
          </Button>
          <Button
            variant="link"
            size="sm"
            onClick={() => setShowAbout(true)}
            className="p-0 h-auto text-[10px]"
            aria-label="About"
          >
            <Info className="h-3 w-3" />
          </Button>
          {hasPressedPast && !isCurrentDate && (
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