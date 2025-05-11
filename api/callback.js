export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    // Si aucun code, redirige vers Spotify pour l'autorisation
    const scope = 'user-read-currently-playing user-read-playback-state';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    });

    return res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
  }

  try {
    const basicAuth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      }),
    });

    const data = await tokenRes.json();

    if (data.error) {
      console.error("Erreur Spotify :", data.error_description);
      return res.status(500).json({ error: data.error_description });
    }

    // ✅ Si tout est bon, affiche les tokens
    return res.status(200).json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    });
  } catch (err) {
    console.error("Erreur générale :", err.message);
    return res.status(500).json({ error: 'Erreur lors de l’échange du code.' });
  }
}
