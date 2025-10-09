import React, { useState, useEffect } from 'react';
import AudioRecorder from './AudioRecorder';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un délai de chargement
    const timer = setTimeout(() => setLoading(false), 3000); // 3 secondes
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Générer les étoiles filantes
    const starsContainer = document.querySelector('.stars-container');
    if (starsContainer) {
      for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.top = `${Math.random() * 100}vh`;
        star.style.left = `${Math.random() * 100}vw`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        starsContainer.appendChild(star);
      }
    }
  }, []);

  return (
    <div className="app">
      <div className="stars-container"></div> {/* Conteneur pour les étoiles */}
      <header>
        <img src="/logo.png" alt="Ckelson Logo" className="logo" />
        <h1>Ckelson ?</h1>
        <p>Identifiez vos chansons et <br /> trouvez leurs paroles !</p>
      </header>
      <main>
        <AudioRecorder />
      </main>
    </div>
  );
}

export default App;