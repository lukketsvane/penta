'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from '@supabase/supabase-js'
import HCaptcha from '@hcaptcha/react-hcaptcha'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface LoginSignupProps {
  onClose: () => void
  onLogin: () => void
}

export default function LoginSignup({ onClose, onLogin }: LoginSignupProps) {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')

  const handleSignUp = async () => {
    if (!captchaToken) {
      setError('Please complete the captcha')
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        captchaToken
      }
    })
    if (error) setError(error.message)
    else {
      setError('Signup successful! Please check your email to confirm your account.')
    }
  }

  const handleLogin = async () => {
    if (!captchaToken) {
      setError('Please complete the captcha')
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        captchaToken
      }
    })
    if (error) setError(error.message)
    else {
      onLogin()
      onClose()
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <HCaptcha
                sitekey="4b8ed62e-a786-4ff8-8b3e-12523b6a3758"
                onVerify={(token) => setCaptchaToken(token)}
              />
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <HCaptcha
                sitekey="4b8ed62e-a786-4ff8-8b3e-12523b6a3758"
                onVerify={(token) => setCaptchaToken(token)}
              />
              <Button type="submit" className="w-full">Sign Up</Button>
            </form>
          </TabsContent>
        </Tabs>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </CardContent>
    </Card>
  )
}