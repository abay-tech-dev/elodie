import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { code } = req.query;
  console.log("Code reçu : ", code);  // Ajoute un log pour voir le code

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
  console.log("Réponse de Spotify : ", data);  // Ajoute un log pour la réponse

  if (data.error) {
    return res.status(500).json({ error: data.error_description });
  }

  // ✅ Tu obtiens les tokens ici
  return res.status(200).json({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
  });
}
