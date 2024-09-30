import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface AboutProps {
  onClose: () => void;
}

export default function About({ onClose }: AboutProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="relative">
        <CardTitle className="text-2xl font-bold text-center">About Penta Crossword</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Features:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Daily 5x5 crossword puzzles</li>
          <li>10 attempts per puzzle</li>
          <li>Leaderboard to compete with other players</li>
          <li>Themed puzzles with Spotify integration</li>
        </ul>
        <p className="mb-4">
          Created by @kondensjasjonskjerner
        </p>
        <p className="text-sm text-gray-500">
          Version 1.0.0
        </p>
      </CardContent>
    </Card>
  )
}