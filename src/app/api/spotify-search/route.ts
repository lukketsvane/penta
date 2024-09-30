import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { title, artist } = req.body

  if (!title || !artist) {
    return res.status(400).json({ error: 'Missing title or artist' })
  }

  try {
    const accessToken = await getSpotifyAccessToken()
    const trackId = await searchSpotifyTrack(accessToken, title, artist)
    res.status(200).json({ trackId })
  } catch (error) {
    console.error('Error searching Spotify track:', error)
    res.status(500).json({ error: 'Failed to search Spotify track' })
  }
}

async function getSpotifyAccessToken(): Promise<string> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  })

  const data = await response.json()
  return data.access_token
}

async function searchSpotifyTrack(accessToken: string, title: string, artist: string): Promise<string | null> {
  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      `track:${title} artist:${artist}`
    )}&type=track&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const data = await response.json()
  return data.tracks.items[0]?.id || null
}