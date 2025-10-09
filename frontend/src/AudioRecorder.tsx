import React, { useState, useRef } from 'react';
import axios from 'axios';

const AudioRecorder: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [songInfo, setSongInfo] = useState<{ title: string; artist: string; album: string } | null>(null);
  const [lyrics, setLyrics] = useState<string | null>(null); // Paroles de la chanson
  const [isProcessing, setIsProcessing] = useState(false); // Indique si le traitement est en cours
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Message d'erreur
  const [shareLink, setShareLink] = useState<string | null>(null); // Lien de partage
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      // Réinitialiser les anciennes informations et messages
      setSongInfo(null);
      setLyrics(null);
      setErrorMessage(null);
      setShareLink(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        audioChunksRef.current = []; // Réinitialiser les chunks

        // Indiquer que le traitement commence
        setIsProcessing(true);

        // Envoyer l'audio au backend
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(',')[1]; // Extraire la partie Base64
          try {
            const response = await axios.post('http://localhost:5000/api/identify', {
              audio: base64Audio,
            });
            const { title, artist, album } = response.data.data || {}; // Extraire les informations de la chanson
            if (title && artist && album) {
              setSongInfo({ title, artist, album });
              setErrorMessage(null); // Réinitialiser le message d'erreur
            } else {
              setSongInfo(null);
              setErrorMessage('Aucun son trouvé 😢');
            }
          } catch (error) {
            console.error('Erreur lors de l\'envoi au backend :', error);
            setSongInfo(null);
            setErrorMessage('Une erreur est survenue 😢');
          } finally {
            setIsProcessing(false); // Arrêter l'animation
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Arrêter automatiquement l'enregistrement après 10 secondes
      setTimeout(() => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, 10000); // 10 secondes
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement audio :', error);
    }
  };

  const generateShareLink = () => {
    if (songInfo) {
      const link = `https://ckelson.com/share?title=${encodeURIComponent(songInfo.title)}&artist=${encodeURIComponent(songInfo.artist)}&album=${encodeURIComponent(songInfo.album)}&lyrics=${encodeURIComponent(lyrics || '')}`;
      setShareLink(link);
    }
  };

  return (
    <div className="audio-recorder">
      <h2>Enregistrez un extrait audio</h2>
      {!isRecording && !isProcessing && (
        <button className="record-button" onClick={startRecording}>
          Enregistrer
        </button>
      )}
      {isRecording && <div className="animation">🎙️ Enregistrement en cours...</div>}
      {isProcessing && <div className="animation">🔄 Traitement en cours...</div>}
      {songInfo && (
        <div className="song-info">
          <h3>Informations sur la chanson :</h3>
          <p><strong>Titre :</strong> {songInfo.title}</p>
          <p><strong>Artiste :</strong> {songInfo.artist}</p>
          <p><strong>Album :</strong> {songInfo.album}</p>
          <button className="share-button" onClick={generateShareLink}>
            Partager
          </button>
        </div>
      )}
      {shareLink && (
        <div className="share-link">
          <p>Partagez ce lien :</p>
          <a href={shareLink} target="_blank" rel="noopener noreferrer">{shareLink}</a>
        </div>
      )}
      {errorMessage && (
        <div className="error-message">
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;