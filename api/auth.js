export default function handler(req, res) {
  const scope = 'user-read-currently-playing user-read-playback-state';
  const queryParams = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
  });

  res.redirect('https://accounts.spotify.com/authorize?' + queryParams.toString());
}
