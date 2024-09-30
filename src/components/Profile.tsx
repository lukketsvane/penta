import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface ProfileProps {
  onClose: () => void;
  onLogout: () => void;
}

export default function Profile({ onClose, onLogout }: ProfileProps) {
  const [user, setUser] = useState<any>(null)
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setDisplayName(user.user_metadata.display_name || '')
      }
      setIsLoading(false)
    }
    getProfile()
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName }
    })

    if (error) {
      setMessage('Error updating profile')
    } else {
      setMessage('Profile updated successfully')
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="relative">
        <CardTitle className="text-2xl font-bold text-center">Profile</CardTitle>
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
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user?.email} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input 
              id="displayName" 
              type="text" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            Update Profile
          </Button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm text-green-600">{message}</p>
        )}
        <Button 
          onClick={onLogout} 
          variant="outline" 
          className="w-full mt-4"
        >
          Log Out
        </Button>
      </CardContent>
    </Card>
  )
}