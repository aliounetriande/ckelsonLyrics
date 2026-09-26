const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const FormData = require('form-data');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware pour augmenter la limite de taille des requêtes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware
app.use(cors());



// Routes de base
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API Ckelson!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Le serveur fonctionne correctement' });
});

// Route pour identifier une chanson avec AudD
app.post('/api/audd-identify', async (req, res) => {
  try {
    console.log('Requête reçue avec les données :', req.body);

    const { audio, mimeType = 'audio/webm' } = req.body;

    if (!audio) {
      console.log('Aucun fichier audio fourni');
      return res.status(400).json({ error: 'Aucun fichier audio fourni' });
    }

    const normalizedMimeType = mimeType.includes('wav')
      ? 'audio/wav'
      : mimeType.includes('webm')
        ? 'audio/webm'
        : mimeType.includes('mp4')
          ? 'audio/mp4'
          : 'audio/mpeg';

    let extension = 'mp3';

    if (normalizedMimeType.includes('wav')) extension = 'wav';
    else if (normalizedMimeType.includes('webm')) extension = 'webm';
    else if (normalizedMimeType.includes('mp4')) extension = 'mp4';

    console.log('Données audio reçues (Base64, 50 premiers caractères) :', audio.slice(0, 50));

    const audioBuffer = Buffer.from(audio, 'base64');

    const form = new FormData();
    form.append('file', audioBuffer, {
      filename: `audio_sample.${extension}`,
      contentType: normalizedMimeType,
    });

    form.append('api_token', process.env.AUDD_API_TOKEN);
    form.append('return', 'apple_music,spotify');

    console.log('Envoi des données à AudD...');

    const response = await axios.post(process.env.AUDD_API_URL, form, {
      headers: form.getHeaders(),
    });

    console.log('Réponse de l\'API AudD :', JSON.stringify(response.data, null, 2));

    if (response.data.status === 'success' && response.data.result) {
      const result = response.data.result;

      const cover =
        result.apple_music?.artwork?.url?.replace('{w}x{h}', '500x500') ||
        result.spotify?.album?.images?.[0]?.url ||
        'https://via.placeholder.com/500?text=No+Cover';

      const previewUrl =
        result.apple_music?.previews?.[0]?.url ||
        result.spotify?.preview_url ||
        null;

      const appleMusicLink = result.apple_music?.url || null;
      const spotifyLink = result.spotify?.external_urls?.spotify || null;

      return res.json({
        message: 'Chanson identifiée avec succès!',
        data: {
          title: result.title,
          artist: result.artist,
          album: result.album,
          cover,
          previewUrl,
          appleMusicLink,
          spotifyLink,
        },
      });
    }

    return res.status(404).json({
      message: 'Aucune chanson identifiée.',
      data: response.data,
    });
  } catch (error) {
    console.error('Erreur lors de l\'identification de la chanson avec AudD :', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Erreur lors de l\'identification de la chanson avec AudD',
      details: error.response?.data || error.message,
    });
  }
});

// Route pour récupérer les paroles d'une chanson
app.get('/api/lyrics', async (req, res) => {
  try {
    const { title, artist } = req.query;

    if (!title || !artist) {
      return res.status(400).json({ error: 'Titre et artiste requis' });
    }

    // Appeler l'API Lyrics.ovh
    const response = await axios.get(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
    );

    const lyrics = response.data.lyrics;

    if (!lyrics) {
      return res.status(404).json({ error: 'Paroles non trouvées' });
    }

    res.json({
      message: 'Paroles récupérées avec succès!',
      data: lyrics,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paroles :', error.message);
    res.status(500).json({ error: 'Erreur lors de la récupération des paroles' });
  }
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Une erreur est survenue!' });
});

// Route 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = app;
module.exports.handler = serverless(app);