import React, { useState, useEffect } from 'react';
import CodeAnalyzer from './components/CodeAnalyzer';
import ChatSidebar from './components/ChatSidebar';
import './styles/theme.css';

export default function App() {
  const [currentChatId, setCurrentChatId] = useState(null);

  return (
    <div className="app-container">
      <ChatSidebar currentChatId={currentChatId} setCurrentChatId={setCurrentChatId} />
      <div className="main-content">
        <header className="topbar">
          <h1 className="app-title">AI Code Chat</h1>
          <ThemeToggle />
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
  const [theme, setTheme] = useState(() => {
    // Charger le thème depuis le localStorage ou utiliser 'dark' par défaut
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    // Appliquer le thème au chargement de la page
    document.documentElement.setAttribute('data-theme', theme);
    // Sauvegarder le thème dans le localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <button onClick={toggleTheme} className="theme-toggle">
      {theme === 'dark' ? '☀️ Mode clair' : '🌙 Mode sombre'}
    </button>
  );
}