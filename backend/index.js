const express = require('express');
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

// Vérification des variables d'environnement
if (!process.env.ACR_HOST || !process.env.ACR_ACCESS_KEY || !process.env.ACR_SECRET_KEY) {
  console.error('Erreur : Les variables d\'environnement ACR_HOST, ACR_ACCESS_KEY ou ACR_SECRET_KEY ne sont pas définies.');
  process.exit(1);
}

// Routes de base
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API Ckelson!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Le serveur fonctionne correctement' });
});

// Route pour identifier une chanson
app.post('/api/identify', async (req, res) => {
  try {
    const { audio } = req.body; // Supposons que l'audio est envoyé en base64

    if (!audio) {
      console.log('Aucun fichier audio fourni');
      return res.status(400).json({ error: 'Aucun fichier audio fourni' });
    }

    console.log('Données audio reçues (Base64, 50 premiers caractères) :', audio.slice(0, 50));

    // Préparer les données pour ACRCloud
    const host = process.env.ACR_HOST;
    const accessKey = process.env.ACR_ACCESS_KEY;
    const secretKey = process.env.ACR_SECRET_KEY;
    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `POST\n/v1/identify\n${accessKey}\n${timestamp}`;
    const signature = crypto
      .createHmac('sha1', secretKey)
      .update(stringToSign)
      .digest('base64');

    console.log('Signature générée :', signature);

    // Construire le formulaire avec FormData
    const form = new FormData();
    const audioBuffer = Buffer.from(audio, 'base64');
    form.append('sample', audioBuffer, {
      filename: 'audio_sample.wav', // Nom du fichier (optionnel)
      contentType: 'audio/wav', // Type MIME
    });
    form.append('access_key', accessKey);
    form.append('data_type', 'audio');
    form.append('signature', signature);
    form.append('sample_bytes', audioBuffer.length);
    form.append('timestamp', timestamp);

    console.log('Paramètres envoyés à ACRCloud :', {
      access_key: accessKey,
      data_type: 'audio',
      signature: signature,
      sample_bytes: audioBuffer.length,
      timestamp: timestamp,
    });

    // Envoyer la requête à ACRCloud
    const response = await axios.post(`https://${host}/v1/identify`, form, {
      headers: form.getHeaders(),
    });

    console.log('Réponse de l\'API ACRCloud :', response.data);

    // Retourner les résultats
    res.json({
      message: 'Chanson identifiée avec succès!',
      data: response.data,
    });
  } catch (error) {
    console.error('Erreur lors de l\'identification de la chanson :', error.response?.data || error.message);
    res.status(500).json({
      error: 'Erreur lors de l\'identification de la chanson',
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