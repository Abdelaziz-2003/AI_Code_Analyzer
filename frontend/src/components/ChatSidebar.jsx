// components/ChatSidebar.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ChatSidebar.css';
import { Menu, X, Trash2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ChatSidebar({ currentChatId, setCurrentChatId }) {
  const [chats, setChats] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Fonction utilitaire pour configurer les headers avec le token
  const authHeaders = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Récupération des chats de l'utilisateur connecté
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
      axios.get('http://127.0.0.1:8000/api/chats/', {
        headers: authHeaders()
      })
      .then(res => setChats(res.data))
      .catch(err => {
        console.error("Erreur lors de la récupération des chats", err);
        setIsAuthenticated(false);
      });
    }
  }, []);

  const createChat = async () => {
    const existingNumbers = chats
      .map(c => parseInt(c.title?.split(' ')[1]))
      .filter(n => !isNaN(n));

    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/chats/create/', {
        title: `Discussion ${nextNumber}`
      }, {
        headers: authHeaders()
      });

      setChats([res.data, ...chats]);
      setCurrentChatId(res.data.chat_id);
    } catch (err) {
      console.error("Erreur lors de la création du chat", err);
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
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du chat', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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
          <button onClick={createChat} className="new-chat-btn">
            + Nouvelle discussion
          </button>

          <div className="chat-list-scroll">
            <div className="chat-list">
              {chats.map(chat => (
                <div key={chat.id} className="chat-item">
                  <button
                    onClick={() => setCurrentChatId(chat.id)}
                    className={`chat-btn ${currentChatId === chat.id ? 'active' : ''}`}
                  >
                    {chat.title}
                  </button>
                  <button onClick={() => deleteChat(chat.id)} className="delete-chat-btn" title="Supprimer">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {isAuthenticated && (
            <div className="logout-container">
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={16} /> Déconnexion
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
