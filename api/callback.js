import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { code } = req.query;

  try {
    // Vérifie si le code est présent
    if (!code) {
      const scope = 'user-read-currently-playing user-read-playback-state';
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URL,
      });

      return res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
    }

    // Étape 2 : échange le code contre un token
    const basicAuth = Buffer.from(
      process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
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
        redirect_uri: process.env.SPOTIFY_REDIRECT_URL,
      }),
    });

    const data = await tokenRes.json();

    // Si une erreur survient pendant l'échange du code, on la logge
    if (data.error) {
      console.error('Erreur de Spotify :', data.error_description);
      return res.status(500).json({ error: data.error_description });
    }

    // Renvoi les tokens si tout se passe bien
    return res.status(200).json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    });
  } catch (error) {
    // Attrape les erreurs générales
    console.error('Erreur générale :', error.message);
    return res.status(500).json({ error: 'Une erreur est survenue' });
  }
}
