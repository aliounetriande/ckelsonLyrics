# Projet Ckelson

Un projet full-stack avec Node.js (backend) et React avec TypeScript (frontend).

## Structure du projet

```
Ckelson/
├── backend/          # API Node.js avec Express
│   ├── index.js      # Point d'entrée du serveur
│   ├── package.json  # Dépendances backend
│   ├── .env          # Variables d'environnement
│   └── .gitignore    # Fichiers à ignorer pour Git
├── frontend/         # Application React avec TypeScript
│   ├── src/          # Code source React
│   ├── public/       # Fichiers statiques
│   ├── package.json  # Dépendances frontend
│   └── ...           # Autres fichiers React
└── README.md         # Ce fichier
```

## Technologies utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **CORS** - Middleware pour les requêtes cross-origin
- **dotenv** - Gestion des variables d'environnement
- **Nodemon** - Rechargement automatique en développement

### Frontend
- **React** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Axios** - Client HTTP pour les requêtes API
- **Create React App** - Outils de développement

## Installation et démarrage

### Prérequis
- Node.js (version 14 ou supérieure)
- npm ou yarn

### Backend

1. Naviguer vers le dossier backend :
```bash
cd backend
```

2. Installer les dépendances :
```bash
npm install
```

3. Démarrer le serveur de développement :
```bash
npm run dev
```

Le serveur sera accessible sur `http://localhost:5000`

### Frontend

1. Naviguer vers le dossier frontend :
```bash
cd frontend
```

2. Installer les dépendances :
```bash
npm install
```

3. Démarrer l'application React :
```bash
npm start
```

L'application sera accessible sur `http://localhost:3000`

## Scripts disponibles

### Backend
- `npm start` - Démarre le serveur en mode production
- `npm run dev` - Démarre le serveur en mode développement avec nodemon

### Frontend
- `npm start` - Démarre l'application en mode développement
- `npm run build` - Construit l'application pour la production
- `npm test` - Lance les tests
- `npm run eject` - Éjecte la configuration (irréversible)

## API Endpoints

### Backend (http://localhost:5000)

- `GET /` - Message de bienvenue
- `GET /api/health` - Vérification de la santé du serveur
- `GET /api/hello` - Message de test depuis l'API

## Développement

1. Démarrez d'abord le backend sur le port 5000
2. Puis démarrez le frontend sur le port 3000
3. Le frontend communique avec le backend via les requêtes HTTP

## Variables d'environnement

Créez un fichier `.env` dans le dossier backend avec :
```
PORT=5000
NODE_ENV=development
```

## Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Push vers la branche
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence ISC.