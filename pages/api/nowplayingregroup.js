export default async function handler(req, res) {
  // 1. Callback OAuth : Spotify renvoie ?code=...
  if (req.query.code) {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: req.query.code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URL,
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET,
    });

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const data = await response.json();

    // Pour test : affiche les tokens
    return res.status(200).json(data);
  }

  // 2. Afficher la musique en cours via ?access_token=...
  if (req.query.access_token) {
    const access_token = req.query.access_token;
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (response.status === 204) {
      return res.status(200).json({ is_playing: false });
    }
    const data = await response.json();
    return res.status(200).json({
      is_playing: data.is_playing,
      track: data.item?.name,
      artist: data.item?.artists?.map(a => a.name).join(', '),
      album: data.item?.album?.name,
      album_image: data.item?.album?.images?.[0]?.url,
      progress_ms: data.progress_ms,
      duration_ms: data.item?.duration_ms
    });
  }

  // 3. Sinon, démarrer le login OAuth (redirection vers Spotify)
  const scope = 'user-read-currently-playing user-read-playback-state';
  const queryParams = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URL,
  });
  res.redirect('https://accounts.spotify.com/authorize?' + queryParams.toString());
}
