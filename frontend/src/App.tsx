import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface ApiResponse {
  message: string;
  status?: string;
}

function App() {
  const [backendMessage, setBackendMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const API_BASE_URL = 'http://localhost:5000';

  const fetchFromBackend = async (endpoint: string) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.get<ApiResponse>(`${API_BASE_URL}${endpoint}`);
      setBackendMessage(response.data.message);
    } catch (err) {
      setError('Erreur lors de la connexion au backend. Assurez-vous que le serveur est démarré.');
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Test de connexion au démarrage
    fetchFromBackend('/');
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Projet Ckelson</h1>
        <div style={{ margin: '20px 0' }}>
          <h2>Frontend React + Backend Node.js</h2>
          
          {isLoading && <p>Chargement...</p>}
          
          {error && (
            <div style={{ color: 'red', margin: '10px 0' }}>
              <p>{error}</p>
            </div>
          )}
          
          {backendMessage && (
            <div style={{ 
              background: '#f0f0f0', 
              padding: '15px', 
              borderRadius: '5px',
              margin: '15px 0',
              color: '#333'
            }}>
              <strong>Message du backend:</strong>
              <p>{backendMessage}</p>
            </div>
          )}
          
          <div style={{ margin: '20px 0' }}>
            <button 
              onClick={() => fetchFromBackend('/')}
              style={{
                margin: '5px',
                padding: '10px 15px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Tester la connexion principale
            </button>
            
            <button 
              onClick={() => fetchFromBackend('/api/hello')}
              style={{
                margin: '5px',
                padding: '10px 15px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Tester l'API Hello
            </button>
            
            <button 
              onClick={() => fetchFromBackend('/api/health')}
              style={{
                margin: '5px',
                padding: '10px 15px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Vérifier la santé du serveur
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
