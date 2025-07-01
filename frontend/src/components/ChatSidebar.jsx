import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ChatSidebar.css';
import { Menu, X, Trash2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChatSidebar({ currentChatId, setCurrentChatId, navigateToChat, onNewChat }) {
  const [chats, setChats] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const navigate = useNavigate();

  const authHeaders = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  /**
   * Fonction pour rafraîchir la liste des chats
   */
  const refreshChats = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/chats/', {
        headers: authHeaders()
      });
      setChats(response.data);
    } catch (err) {
      console.error("Erreur lors du rafraîchissement des chats", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
      refreshChats();
    }

    // Écouter l'événement de création de chat pour rafraîchir la liste
    const handleChatCreated = (event) => {
      console.log('🔄 Chat créé détecté, rafraîchissement de la sidebar...');
      refreshChats();
    };

    window.addEventListener('chatCreated', handleChatCreated);

    // Nettoyage de l'event listener
    return () => {
      window.removeEventListener('chatCreated', handleChatCreated);
    };
  }, []);

  /**
   * Navigation intelligente vers un chat avec scroll automatique
   */
  const handleChatNavigation = (chatId) => {
    if (chatId === currentChatId || isNavigating) return;
    
    setIsNavigating(true);
    
    if (navigateToChat) {
      navigateToChat(chatId);
    } else {
      setCurrentChatId(chatId);
    }
    
    // Désactiver l'état de navigation après un délai
    setTimeout(() => {
      setIsNavigating(false);
    }, 1000);
  };

  const createChat = async () => {
    if (isCreatingChat) return; // Éviter les créations multiples
    
    setIsCreatingChat(true);
    
    if (onNewChat) {
      // Utiliser la fonction fournie par App.jsx (recommandé)
      try {
        await onNewChat();
        console.log('✅ Chat créé via App.jsx');
      } catch (error) {
        console.error('❌ Erreur lors de la création via App.jsx:', error);
        alert('Erreur lors de la création du chat. Veuillez réessayer.');
      }
      setIsCreatingChat(false);
      return;
    }

    // Fallback vers l'ancienne méthode si onNewChat n'est pas fournie
    try {
      console.log('🚀 Création d\'un nouveau chat via ChatSidebar...');
      
      // Vérifier le token d'authentification
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('❌ Token d\'authentification manquant');
        alert('Erreur : Authentification requise. Veuillez vous reconnecter.');
        return;
      }

      // Calculer le numéro de la prochaine discussion
      const existingNumbers = chats
        .map(c => parseInt(c.title?.split(' ')[1]))
        .filter(n => !isNaN(n));
      const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

      // Essayer d'abord l'URL avec localhost
      let response;
      try {
        response = await axios.post('http://localhost:8000/api/chats/create/', {
          title: `Discussion ${nextNumber}`
        }, {
          headers: authHeaders(),
          timeout: 10000 // 10 secondes de timeout
        });
      } catch (firstError) {
        console.warn('⚠️ Échec avec localhost:8000, essai avec 127.0.0.1:8000...');
        
        // Essayer avec 127.0.0.1 si localhost échoue
        response = await axios.post('http://127.0.0.1:8000/api/chats/create/', {
          title: `Discussion ${nextNumber}`
        }, {
          headers: authHeaders(),
          timeout: 10000
        });
      }

      console.log('✅ Réponse du serveur:', response.data);

      // Vérifier la structure de la réponse
      if (!response.data) {
        throw new Error('Réponse vide du serveur');
      }

      const newChat = response.data;
      const chatId = newChat.chat_id || newChat.id;
      
      if (!chatId) {
        console.error('❌ ID de chat manquant dans la réponse:', newChat);
        throw new Error('ID de chat manquant dans la réponse du serveur');
      }

      // Ajouter le nouveau chat à la liste
      setChats(prevChats => [newChat, ...prevChats]);
      
      console.log(`✅ Chat créé avec succès - ID: ${chatId}`);
      
      // Naviguer vers le nouveau chat
      handleChatNavigation(chatId);
      
    } catch (err) {
      console.error('❌ Erreur détaillée lors de la création du chat:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          headers: err.config?.headers
        }
      });
      
      // Messages d'erreur spécifiques selon le type d'erreur
      if (err.response) {
        // Erreur de réponse du serveur
        const status = err.response.status;
        const message = err.response.data?.detail || err.response.data?.message || 'Erreur serveur';
        
        switch (status) {
          case 400:
            alert(`Erreur de requête: ${message}`);
            break;
          case 401:
            alert('Session expirée. Veuillez vous reconnecter.');
            handleLogout();
            break;
          case 403:
            alert('Accès interdit. Vérifiez vos permissions.');
            break;
          case 404:
            alert('Service non trouvé. Vérifiez que le serveur est démarré.');
            break;
          case 500:
            alert('Erreur interne du serveur. Réessayez dans quelques instants.');
            break;
          default:
            alert(`Erreur ${status}: ${message}`);
        }
      } else if (err.request) {
        // Erreur de réseau
        console.error('❌ Erreur de réseau:', err.request);
        alert('Erreur de connexion: Vérifiez que le serveur est démarré sur le port 8000.');
      } else {
        // Autre erreur
        alert(`Erreur: ${err.message}`);
      }
    } finally {
      setIsCreatingChat(false);
    }
  };

  const deleteChat = async (chatIdToDelete) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/chat/${chatIdToDelete}/delete/`, {
        headers: authHeaders()
      });
      setChats(prev => prev.filter(chat => chat.id !== chatIdToDelete));
      if (chatIdToDelete === currentChatId) {
        setCurrentChatId(null);
        localStorage.removeItem('currentChatId'); 
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du chat', error);
    }
  };

  /**
   * Supprimer toutes les discussions avec confirmation
   */
  const deleteAllChats = async () => {
    if (chats.length === 0) {
      alert('Aucune discussion à supprimer.');
      return;
    }

    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer toutes les ${chats.length} discussions ? Cette action est irréversible.`
    );

    if (!confirmDelete) return;

    try {
      console.log('🗑️ Suppression de toutes les discussions...');
      
      // Supprimer toutes les discussions en parallèle
      const deletePromises = chats.map(chat =>
        axios.delete(`http://127.0.0.1:8000/api/chat/${chat.id}/delete/`, {
          headers: authHeaders()
        }).catch(error => {
          console.error(`Erreur lors de la suppression du chat ${chat.id}:`, error);
          return { error: true, chatId: chat.id };
        })
      );

      const results = await Promise.all(deletePromises);
      
      // Vérifier s'il y a eu des erreurs
      const errors = results.filter(result => result?.error);
      
      if (errors.length > 0) {
        console.warn(`⚠️ ${errors.length} discussions n'ont pas pu être supprimées`);
        alert(`${chats.length - errors.length} discussions supprimées avec succès.\n${errors.length} erreurs rencontrées.`);
      } else {
        console.log('✅ Toutes les discussions ont été supprimées avec succès');
        alert('Toutes les discussions ont été supprimées avec succès.');
      }

      // Vider la liste des chats et réinitialiser le chat courant
      setChats([]);
      setCurrentChatId(null);
      localStorage.removeItem('currentChatId');
      
    } catch (error) {
      console.error('❌ Erreur lors de la suppression en masse:', error);
      alert('Erreur lors de la suppression des discussions. Veuillez réessayer.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentChatId'); 
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <div className={`sidebar-container ${isSidebarOpen ? '' : 'collapsed'}`}>
      <div className="sidebar-toggle">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="toggle-icon">
          {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {isSidebarOpen && (
        <div className="sidebar">
          <div className="chat-controls">
            <button 
              onClick={createChat} 
              className={`new-chat-btn ${isCreatingChat ? 'creating' : ''}`}
              disabled={isCreatingChat}
              title={isCreatingChat ? 'Création en cours...' : 'Créer une nouvelle discussion'}
            >
              <span className="btn-icon">
                {isCreatingChat ? '⏳' : '✨'}
              </span>
              <span className="btn-text">
                {isCreatingChat ? 'Création...' : 'Nouvelle discussion'}
              </span>
            </button>
            
            {chats.length > 0 && (
              <button 
                onClick={deleteAllChats} 
                className="delete-all-btn"
                title={`Supprimer toutes les discussions (${chats.length})`}
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>

          <div className="chat-list-scroll">
            <div className="chat-list">
              {chats.map(chat => (
                <div key={chat.id} className="chat-item">
                  <button
                    onClick={() => handleChatNavigation(chat.id)}
                    className={`chat-btn ${currentChatId === chat.id ? 'active' : ''} ${isNavigating ? 'navigating' : ''}`}
                    disabled={isNavigating}
                    title={`Naviguer vers ${chat.title}`}
                  >
                    <span className="chat-icon">💬</span>
                    <span className="chat-title">{chat.title}</span>
                    {isNavigating && currentChatId === chat.id && (
                      <span className="navigation-indicator">⏳</span>
                    )}
                  </button>
                  <button onClick={() => deleteChat(chat.id)} className="delete-chat-btn" title="Supprimer la session">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {isAuthenticated && (
            <div className="logout-container">
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={18} /> 
                <span>Se Déconnecter</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
