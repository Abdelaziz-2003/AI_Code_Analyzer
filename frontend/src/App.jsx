import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CodeAnalyzer from './components/CodeAnalyzer';
import ChatSidebar from './components/ChatSidebar';
import './styles/theme.css';


export default function App() {
  const [currentChatId, setCurrentChatId] = useState(null);
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasError, setHasError] = useState(false);

  /**
   * Gestionnaire d'erreurs centralisé avec logging avancé
   */
  const handleError = (error, context = 'Application') => {
    console.error(`❌ Erreur ${context}:`, error);
    const errorMessage = error?.response?.data?.detail || 
                        error?.message || 
                        'Une erreur inattendue s\'est produite';
    setHasError(errorMessage);
  };

  /**
   * Fonction de navigation intelligente pour les chats
   * Synchronise l'état et positionne directement au dernier message
   */
  const navigateToChat = (chatId) => {
    if (chatId && chatId !== currentChatId) {
      console.log(`🔄 Navigation vers chat Enterprise #${chatId}`);
      setCurrentChatId(chatId);
      
      // Positionner directement au bas du conteneur sans animation
      setTimeout(() => {
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100); // Délai réduit pour un affichage plus rapide
    }
  };


  /**
   * Fonction de création de nouveau chat avec gestion d'erreur avancée
   */
  const handleNewChat = async () => {
    try {
      console.log('🚀 Création d\'un nouveau chat depuis App.jsx...');
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('⚠️ Authentification requise pour créer un nouveau chat');
        handleError(new Error('Authentification requise'), 'Création de chat');
        return;
      }

      // Déterminer le numéro de la prochaine discussion
      const existingChats = await fetchExistingChats();
      const existingNumbers = existingChats
        .map(c => parseInt(c.title?.split(' ')[1]))
        .filter(n => !isNaN(n));
      const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

      const authHeaders = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Essayer d'abord localhost, puis 127.0.0.1 en cas d'échec
      let response;
      try {
        response = await axios.post('http://localhost:8000/api/chats/create/', {
          title: `Discussion ${nextNumber}`
        }, {
          headers: authHeaders,
          timeout: 10000
        });
      } catch (firstError) {
        console.warn('⚠️ Échec avec localhost:8000, essai avec 127.0.0.1:8000...');
        response = await axios.post('http://127.0.0.1:8000/api/chats/create/', {
          title: `Discussion ${nextNumber}`
        }, {
          headers: authHeaders,
          timeout: 10000
        });
      }

      if (!response.data) {
        throw new Error('Réponse vide du serveur');
      }

      const newChatId = response.data.chat_id || response.data.id;
      if (!newChatId) {
        throw new Error('ID de chat manquant dans la réponse du serveur');
      }

      console.log(`✅ Nouvelle session créée: #${newChatId}`);
      navigateToChat(newChatId);
      
      // Déclencher un rafraîchissement de la sidebar pour afficher le nouveau chat
      window.dispatchEvent(new CustomEvent('chatCreated', { detail: { chatId: newChatId } }));
      
    } catch (error) {
      console.error('❌ Erreur lors de la création du chat:', error);
      handleError(error, 'Création de chat');
    }
  };

  /**
   * Fonction utilitaire pour récupérer les chats existants
   */
  const fetchExistingChats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return [];

      const response = await axios.get('http://127.0.0.1:8000/api/chats/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data || [];
    } catch (error) {
      console.warn('⚠️ Impossible de récupérer les chats existants:', error);
      return [];
    }
  };

  useEffect(() => {
    // 1. Récupération des tokens depuis l'URL (après redirection OAuth2)
    const params = new URLSearchParams(window.location.search);
    const accessFromUrl = params.get('access');
    const refreshFromUrl = params.get('refresh');

    if (accessFromUrl && refreshFromUrl) {
      localStorage.setItem('access_token', accessFromUrl);
      localStorage.setItem('refresh_token', refreshFromUrl);

      // Nettoyage de l'URL après stockage
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }

    // 2. Restaurer le chat courant depuis localStorage
    const savedChatId = localStorage.getItem('currentChatId');
    if (savedChatId && !isNaN(savedChatId)) {
      console.log(`🔄 Restauration du chat #${savedChatId} depuis localStorage`);
      setCurrentChatId(Number(savedChatId));
    }

    // 3. Récupération des infos utilisateur
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        // Essayer d'abord localhost, puis 127.0.0.1
        let response;
        try {
          response = await axios.get('http://localhost:8000/api/user/me/', {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
          });
        } catch (firstError) {
          console.warn('⚠️ Échec avec localhost, essai avec 127.0.0.1...');
          response = await axios.get('http://127.0.0.1:8000/api/user/me/', {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000
          });
        }
        
        setUser(response.data);
        console.log('✅ Utilisateur authentifié:', response.data);
        
      } catch (error) {
        console.error("⚠️ Erreur lors de la récupération de l'utilisateur :", error);
        
        // Ne supprimer les tokens et rediriger que si c'est vraiment un problème d'authentification
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('🔓 Token invalide, nettoyage de l\'authentification');
          setUser(null);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('currentChatId');
          // Rediriger seulement si le token est vraiment invalide
          window.location.href = '/';
        } else {
          // Pour les autres erreurs (réseau, serveur indisponible, etc.), garder l'état actuel
          console.log('🔄 Erreur temporaire, tentative de continuer sans redirection');
          setHasError(`Connexion au serveur difficile. Certaines fonctionnalités peuvent être limitées.`);
        }
      } finally {
        setIsInitializing(false);
      }
    };

    fetchUser();
  }, []);

  // Sauvegarder le currentChatId dans localStorage à chaque changement
  useEffect(() => {
    if (currentChatId !== null && currentChatId !== undefined) {
      localStorage.setItem('currentChatId', currentChatId.toString());
      console.log(`💾 Chat #${currentChatId} sauvegardé dans localStorage`);
    }
  }, [currentChatId]);

  const resetError = () => setHasError(false);

  if (isInitializing) {
    return <ApplicationLoader />;
  }

  if (hasError) {
    return <ApplicationError error={hasError} onRetry={resetError} />;
  }

  return (
    <div className="app-container">
      <ChatSidebar 
        currentChatId={currentChatId} 
        setCurrentChatId={setCurrentChatId}
        navigateToChat={navigateToChat}
        onNewChat={handleNewChat}
      />

      <div className="main-content">
        <ApplicationHeader user={user} />

        <main className="content-area">
          {currentChatId ? (
            <CodeAnalyzer chatId={currentChatId} />
          ) : (
            <WelcomeSection user={user} onNewChat={handleNewChat} />
          )}
        </main>
      </div>
    </div>
  );
}

/**
 * En-tête principal de l'application avec branding professionnel
 */
function ApplicationHeader({ user }) {
  return (
    <header className="topbar">
      <div className="header-left">
        <div className="brand-section">
          <div className="brand-logo">
            <span className="logo-icon">⚡</span>
            <div className="brand-content">
              <h1 className="app-title">DXC Code Intelligence</h1>
              <span className="app-subtitle">Plateforme d'Analyse IA</span>
            </div>
          </div>
        </div>
        <ProfessionalThemeToggle />
      </div>
      <div className="header-right">
        <UserProfileDisplay user={user} />
      </div>
    </header>
  );
}

/**
 * Affichage professionnel du profil utilisateur
 */
function UserProfileDisplay({ user }) {
  return (
    <div className="user-profile-section">
      <div className="user-avatar">
        {user ? (
          user.first_name?.[0]?.toUpperCase() || '👤'
        ) : (
          '👤'
        )}
      </div>
      <div className="user-details">
        {user ? (
          <>
            <p className="user-greeting">
              Bonjour, <span className="user-name">{user.first_name} {user.last_name}</span>
            </p>
            <span className="connection-status connected">● Connecté</span>
          </>
        ) : (
          <>
            <p className="user-greeting">Bienvenue, <span className="guest-label">Invité</span></p>
            <span className="connection-status demo">● Mode Démonstration</span>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Section d'accueil professionnelle avec présentation des fonctionnalités
 */
function WelcomeSection({ user, onNewChat }) {
  return (
    <div className="professional-welcome">
      <div className="welcome-container">
        <div className="welcome-hero">
          <div className="hero-icon">🚀</div>
          <h2 className="hero-title">
            Intelligence Artificielle pour Développeurs
          </h2>
          <p className="hero-description">
            Optimisez votre code avec notre plateforme d'analyse avancée basée sur l'IA.
            Détectez les problèmes, améliorez les performances et suivez les meilleures pratiques.
          </p>
        </div>
        
        <div className="capabilities-grid">
          <div className="capability-card">
            <div className="capability-icon">🔍</div>
            <h3 className="capability-title">Analyse Intelligente</h3>
            <p className="capability-description">
              Détection automatique des patterns, anti-patterns et opportunités d'optimisation
            </p>
          </div>
          
          <div className="capability-card">
            <div className="capability-icon">⚡</div>
            <h3 className="capability-title">Performance Premium</h3>
            <p className="capability-description">
              Recommandations expertes pour maximiser l'efficacité et la vitesse d'exécution
            </p>
          </div>
          
          <div className="capability-card">
            <div className="capability-icon">🛡️</div>
            <h3 className="capability-title">Sécurité Avancée</h3>
            <p className="capability-description">
              Identification proactive des vulnérabilités et des risques de sécurité
            </p>
          </div>
        </div>
        
        <div className="action-prompt">
          <div className="prompt-content">
            <p className="prompt-message">
              Prêt à commencer ? Sélectionnez une conversation existante ou créez une nouvelle session d'analyse.
            </p>
            <button 
              onClick={onNewChat}
              className="cta-button"
              aria-label="Créer une nouvelle session d'analyse"
            >
              <span className="cta-icon">✨</span>
              <span className="cta-text">Nouvelle Discussion</span>
            </button>
          </div>
          <div className="prompt-hint">
            <span className="hint-icon">💡</span>
            <span className="hint-text">Conseil : Utilisez Ctrl+Enter pour des analyses rapides</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Bouton de basculement de thème avec design professionnel
 */
function ProfessionalThemeToggle() {
  const [theme, setTheme] = useState(() => 
    localStorage.getItem('theme') || 'dark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Transition fluide sans rechargement
    document.documentElement.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    setTimeout(() => {
      document.documentElement.style.transition = '';
    }, 300);
  };

  return (
    <button
      onClick={toggleTheme}
      className="professional-theme-toggle"
      title={`Basculer vers le mode ${theme === 'dark' ? 'clair' : 'sombre'}`}
      aria-label={`Changer pour le thème ${theme === 'dark' ? 'clair' : 'sombre'}`}
    >
      <span className="toggle-icon">
        {theme === 'dark' ? '☀️' : '🌙'}
      </span>
      <span className="toggle-label">
        {theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}
      </span>
    </button>
  );
}

/**
 * Composant de chargement professionnel pendant l'initialisation
 */
function ApplicationLoader() {
  return (
    <div className="application-loader">
      <div className="loader-content">
        <div className="loader-brand">
          <div className="loader-icon">⚡</div>
          <h2 className="loader-title">DXC Code Intelligence</h2>
        </div>
        
        <div className="loader-animation">
          <div className="loader-spinner"></div>
        </div>
        
        <div className="loader-message">
          <p className="loading-text">Initialisation de votre environnement professionnel...</p>
          <div className="loading-steps">
            <span className="step active">● Authentification</span>
            <span className="step">● Chargement du profil</span>
            <span className="step">● Préparation de l'interface</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Composant d'erreur élégant pour les cas d'échec
 */
function ApplicationError({ error, onRetry }) {
  return (
    <div className="application-error">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <h2 className="error-title">Oups ! Un problème est survenu</h2>
        <p className="error-message">
          Nous rencontrons des difficultés techniques. Veuillez réessayer dans quelques instants.
        </p>
        <div className="error-actions">
          <button onClick={onRetry} className="retry-button">
            <span className="button-icon">🔄</span>
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );
}
