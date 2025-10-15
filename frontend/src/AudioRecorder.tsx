import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic, faPlay, faPause, faMicrophone, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { faApple } from '@fortawesome/free-brands-svg-icons';

const AudioRecorder: React.FC = () => {
  console.log('Le composant AudioRecorder est monté');
  const [isRecording, setIsRecording] = useState(false);
  const [songInfo, setSongInfo] = useState<{
    title: string;
    artist: string;
    album: string;
    cover?: string;
    previewUrl?: string;
    appleMusicLink?: string;
    spotifyLink?: string;
  } | null>(null);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false); // État pour savoir si l'audio est en lecture
  const [progress, setProgress] = useState(0); // État pour la progression de l'audio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
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
        audioChunksRef.current = [];

        setIsProcessing(true);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(',')[1];
          console.log('Données audio envoyées au backend (Base64, 50 premiers caractères) :', base64Audio?.slice(0, 50));
          try {
            const response = await axios.post('https://ckelson-back.vercel.app/api/audd-identify', {
              audio: base64Audio,
            });
            console.log('Données reçues du backend :', response.data.data);
            const { title, artist, album, cover = null, previewUrl = null, appleMusicLink = null, spotifyLink = null } = response.data.data || {};
            if (title && artist && album) {
              setSongInfo({ title, artist, album, cover, previewUrl, appleMusicLink, spotifyLink });
              console.log('Informations sur la chanson :', { title, artist, album, cover, previewUrl, appleMusicLink, spotifyLink });
              setErrorMessage(null);
            } else {
              setSongInfo(null);
              console.log('Aucune chanson identifiée');
              setErrorMessage('Aucun son trouvé 😢');
            }
          } catch (error) {
            if (typeof error === 'object' && error !== null) {
              const err = error as { response?: { data?: any }, message?: string };
              console.error('Erreur lors de l\'envoi au backend :', err.response?.data || err.message);
            } else {
              console.error('Erreur lors de l\'envoi au backend :', error);
            }
            setSongInfo(null);
            setErrorMessage('Une erreur est survenue 😢');
          } finally {
            setIsProcessing(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);

      setTimeout(() => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, 10000);
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

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      setProgress((currentTime / duration) * 100);
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const seekTime = (parseFloat(event.target.value) / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
      setProgress(parseFloat(event.target.value));
    }
  };

  const fetchLyrics = async () => {
  if (songInfo) {
    try {
      const response = await axios.get('http://localhost:5000/api/lyrics', {
        params: {
          title: songInfo.title,
          artist: songInfo.artist,
        },
      });
      setLyrics(response.data.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des paroles :', error);
      setLyrics('Paroles non disponibles.');
    }
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
      {isRecording && <div className="animation">
        <FontAwesomeIcon icon={faMicrophone} style={{ marginRight: '8px' }} /> Enregistrement en cours...</div>}
      {isProcessing && <div className="animation">
        <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} /> Traitement en cours...</div>}
      {songInfo && (
        <div className="song-info">
          {songInfo.cover ? (
            <img
              src={songInfo.cover}
              alt={`Cover de l'album ${songInfo.album}`}
              style={{ width: '200px', height: '200px', objectFit: 'cover' }}
            />
          ) : (
            <p>Aucune couverture disponible</p>
          )}
          <p><strong>{songInfo.title}</strong></p>
          <p>{songInfo.artist}</p>

          {songInfo.previewUrl && (
            <div className="audio-player">
              <audio
                ref={audioRef}
                src={songInfo.previewUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)} // Arrêter l'état de lecture lorsque l'audio se termine
              />
              <div className="player-controls">
                <button className="play-pause-button" onClick={handlePlayPause}>
                  <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
                </button>
                <input
                  type="range"
                  className="progress-bar"
                  value={progress}
                  onChange={handleSeek}
                  min="0"
                  max="100"
                />
              </div>
            </div>
          )}
          {songInfo.appleMusicLink && (
            <button
                className="platform-button apple-music-button"
                onClick={() => window.open(songInfo.appleMusicLink, '_blank')}
            >
              <FontAwesomeIcon icon={faApple} style={{ marginRight: '8px' }} />
              Écouter sur Apple Music
            </button>
            )}
            {songInfo.spotifyLink && (
            <button
                className="platform-button spotify-button"
                onClick={() => window.open(songInfo.spotifyLink, '_blank')}
            >
              <FontAwesomeIcon icon={faSpotify} style={{ marginRight: '8px' }} />
                Écouter sur Spotify
            </button>
            )}
          {/* <button className="share-button" onClick={generateShareLink}>
            Partager
          </button> */}
        </div>
      )}

      {songInfo && (
        <button className="lyrics-button" style={{ marginTop: '12px' }} onClick={fetchLyrics}>
          <FontAwesomeIcon icon={faMusic} style={{ marginRight: '8px' }} />
            Afficher les paroles
        </button>
        )}

        {lyrics && (
  <div className="lyrics-container">
    <h3 className="lyrics-title">Paroles :</h3>
    <div className="lyrics-content">
      {lyrics.split('\n').map((line, index) => (
        <p key={index}>{line}</p>
      ))}
    </div>
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