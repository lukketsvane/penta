'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"
import { supabase } from '@/lib/supabase'

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
  grid: CrosswordCell[][];
  solution: string[][];
  across_clues: CrosswordClue[];
  down_clues: CrosswordClue[];
  song: {
    title: string;
    artist: string;
  };
}

export default function DailyCrossword() {
  const [crosswords, setCrosswords] = useState<CrosswordData[]>([])
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0)
  const [userGrid, setUserGrid] = useState<string[][]>([])
  const [attempts, setAttempts] = useState(0)
  const [message, setMessage] = useState('')
  const [isCorrect, setIsCorrect] = useState(false)
  const [hasPressedPast, setHasPressedPast] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCrosswords()
  }, [])

  const fetchCrosswords = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('crosswords')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching crosswords:', error)
    } else {
      setCrosswords(data || [])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (crosswords.length > 0) {
      const currentPuzzle = crosswords[currentPuzzleIndex]
      const storedAttempts = localStorage.getItem(`crosswordAttempts_${currentPuzzle.id}`)
      if (storedAttempts) {
        setAttempts(parseInt(storedAttempts, 10))
      } else {
        setAttempts(0)
      }
      setUserGrid(currentPuzzle.grid.map(row => row.map(() => '')))
      setIsCorrect(false)
      setMessage('')
    }
  }, [currentPuzzleIndex, crosswords])

  const handleInputChange = (rowIndex: number, colIndex: number, value: string) => {
    const newGrid = [...userGrid]
    newGrid[rowIndex][colIndex] = value.toUpperCase()
    setUserGrid(newGrid)
  }

  const handleSubmit = () => {
    if (crosswords.length === 0) return

    const currentPuzzle = crosswords[currentPuzzleIndex]
    if (attempts < 10) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      localStorage.setItem(`crosswordAttempts_${currentPuzzle.id}`, newAttempts.toString())

      const isSubmissionCorrect = userGrid.every((row, i) =>
        row.every((cell, j) => cell === currentPuzzle.solution[i][j] || currentPuzzle.grid[i][j].isBlocked)
      )

      if (isSubmissionCorrect) {
        setIsCorrect(true)
        setMessage("Congratulations! You've solved the crossword!")
      } else {
        setMessage(`Attempt ${newAttempts} submitted. You have ${10 - newAttempts} attempts left.`)
      }
    } else {
      setMessage("Sorry, you're out of attempts. Try another puzzle or come back tomorrow!")
    }
  }

  const handleReset = () => {
    if (crosswords.length === 0) return

    const currentPuzzle = crosswords[currentPuzzleIndex]
    setUserGrid(currentPuzzle.grid.map(row => row.map(() => '')))
    setMessage('')
    setAttempts(0)
    setIsCorrect(false)
    localStorage.removeItem(`crosswordAttempts_${currentPuzzle.id}`)
  }

  const handlePast = () => {
    setCurrentPuzzleIndex((prevIndex) => (prevIndex + 1) % crosswords.length)
    setHasPressedPast(true)
  }

  const handleNext = () => {
    setCurrentPuzzleIndex((prevIndex) => (prevIndex - 1 + crosswords.length) % crosswords.length)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (crosswords.length === 0) {
    return <div>No puzzles available</div>
  }

  const currentPuzzle = crosswords[currentPuzzleIndex]
  const isOutOfAttempts = attempts >= 10

  return (
    <div className="max-w-md mx-auto px-2 py-4">
      <div className={`${isOutOfAttempts ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="relative mb-2">
          <h1 className="text-lg font-bold">{currentPuzzle.title}</h1>
          <div className="absolute top-0 right-0 z-10 flex items-center">
            <p className="text-xs mr-2">{currentPuzzle.song.title} - {currentPuzzle.song.artist}</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="text-primary hover:text-primary-foreground p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
      <footer className="mt-4 text-center">
        <p className="text-[10px] mb-1">made by @kondensjasjonskjerner with &lt;3 by @lukketsvane</p>
        <div className="flex justify-between items-center text-[10px] border-t border-gray-200 pt-1">
          <Button
            variant="link"
            size="sm"
            onClick={handlePast}
            className="p-0 h-auto text-[10px]"
          >
            Past
          </Button>
          <span>{new Date(currentPuzzle.date).toISOString().split('T')[0]}</span>
          <Button
            variant="link"
            size="sm"
            onClick={() => {/* Implement about functionality */}}
            className="p-0 h-auto text-[10px]"
          >
            About
          </Button>
          {hasPressedPast && (
            <Button
              variant="link"
              size="sm"
              onClick={handleNext}
              className="p-0 h-auto text-[10px]"
            >
              Next
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}