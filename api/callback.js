export default async function handler(req, res) {
  try {
    // Vérifie si un code est présent dans l'URL
    const { code } = req.query;

    if (!code) {
      return res.status(200).json({
        message: "Aucun code trouvé. Redirection non encore faite depuis Spotify.",
      });
    }

    // Affiche simplement le code reçu sans rien faire d'autre
    return res.status(200).json({
      message: "Code reçu depuis Spotify ✅",
      code,
    });
  } catch (error) {
    console.error("Erreur serveurless:", error.message);
    return res.status(500).json({ error: "Erreur interne." });
  }
}
