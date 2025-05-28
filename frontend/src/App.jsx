import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CodeAnalyzer from './components/CodeAnalyzer';
import ChatSidebar from './components/ChatSidebar';
import './styles/theme.css';

export default function App() {
  const [currentChatId, setCurrentChatId] = useState(null);
  const [user, setUser] = useState(null);

useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const accessFromUrl = params.get('access');
  const refreshFromUrl = params.get('refresh');

  if (accessFromUrl && refreshFromUrl) {
    localStorage.setItem('access_token', accessFromUrl);
    localStorage.setItem('refresh_token', refreshFromUrl);

    // Nettoyer l’URL
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  const fetchUser = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await axios.get('http://localhost:8000/api/user/me/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUser(response.data);
    } catch (error) {
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/'; // token invalide → login
    }
  };

  fetchUser();
}, []);


  return (
    <div className="app-container">
      <ChatSidebar currentChatId={currentChatId} setCurrentChatId={setCurrentChatId} />

      <div className="main-content">
        <header className="topbar">
          <div className="header-left">
            <h1 className="app-title">AI Code Chat</h1>
            <ThemeToggle />
          </div>
          <div className="header-right">
            {user ? (
              <p className="user-greeting">Bonjour, {user.first_name} {user.last_name}</p>
            ) : (
              <p className="user-greeting">Bonjour, invité</p>
            )}
          </div>
        </header>

        <main className="content-area">
          {currentChatId ? (
            <CodeAnalyzer chatId={currentChatId} />
          ) : (
            <div className="placeholder-text">Sélectionnez ou créez une discussion</div>
          )}
        </main>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="theme-toggle">
      {theme === 'dark' ? '☀️ Mode clair' : '🌙 Mode sombre'}
    </button>
  );
}
