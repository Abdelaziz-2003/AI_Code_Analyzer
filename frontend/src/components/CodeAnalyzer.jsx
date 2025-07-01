import React, { useState, useEffect, useRef } from 'react';
import { analyzeCode } from '../services/analysisApi';
import ChatMessage from './ChatMessage';
import axios from 'axios';
import '../styles/CodeAnalyzer.css';

const chatHistoryCache = new Map();


export default function CodeAnalyzer({ chatId }) {
  const [code, setCode] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const maxHeight = 300;
  const initialHeight = 40;


  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      // Positionnement direct sans animation
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };


  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && code.trim() && !loading) {
        e.preventDefault();
        handleAnalyze();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [code, loading]);

 
  useEffect(() => {
    const fetchHistory = async () => {
      if (!chatId || chatId === currentChatId || isLoadingHistory) {
        console.log(`🔄 Optimisation: Évitement rechargement chat ${chatId} (actuel: ${currentChatId})`);
        return;
      }

      console.log(`� Initialisation session d'analyse - Chat Enterprise #${chatId}`);
      setIsLoadingHistory(true);
      setCurrentChatId(chatId);

      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('⚠️ Authentification enterprise requise');
        setIsLoadingHistory(false);
        return;
      }

      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/chat/${chatId}/history/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setHistory(res.data);
        console.log(`✅ Session Enterprise #${chatId} initialisée - ${res.data.length} interactions chargées`);

        // Positionnement direct au dernier message après chargement de l'historique
        scrollToBottom();
      } catch (error) {
        console.error(`❌ Échec d'initialisation session #${chatId}:`, error);
        setHistory([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [chatId]);

  useEffect(() => {
    if (chatId !== currentChatId) {
      setCode(''); 
      if (textareaRef.current) {
        textareaRef.current.style.height = `${initialHeight}px`;
      }
    }
  }, [chatId, currentChatId]);

  useEffect(() => {
    if (history.length > 0 && !isLoadingHistory) {
      scrollToBottom();
    }
  }, [history, isLoadingHistory]);

  // Effet pour positionner directement au dernier message à chaque changement d'historique
  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleAnalyze = async () => {
    if (!code.trim()) return;

    setHistory(prev => [...prev, { sender: 'user', text: code }]);
    setLoading(true);

    scrollToBottom(); // Affichage direct

    setCode('');
    if (textareaRef.current) {
      textareaRef.current.style.height = `${initialHeight}px`;
    }

    setHistory(prev => [...prev, { sender: 'bot', result: { language_detected: '...', gpt_suggestion: 'Analyse en cours...' } }]);

    scrollToBottom(); // Affichage direct

    try {
      const result = await analyzeCode(chatId, code);
      setHistory(prev => {
        const withoutLoading = prev.filter(msg => msg.result?.gpt_suggestion !== 'Analyse en cours...');
        return [...withoutLoading, { sender: 'bot', result }];
      });

      scrollToBottom(); // Affichage direct
    } catch (error) {
      console.error("Erreur d'analyse :", error);
      setHistory(prev => [...prev, { sender: 'bot', error: 'Erreur serveur' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setCode(e.target.value);
    const el = textareaRef.current;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px';
  };

  return (
    <div className="analyzer-wrapper">
      <div className="messages-container" ref={messagesContainerRef}>
        {isLoadingHistory ? (
          <div className="loading-history">
            <div className="loading-spinner-large"></div>
            <p>Chargement de l'historique du chat #{chatId}...</p>
          </div>
        ) : history.length > 0 ? (
          <div className="messages-list">
            {history.map((msg, index) => (
              <ChatMessage key={`${chatId}-${index}`} sender={msg.sender} {...msg} />
            ))}
            <div className="scroll-anchor" />
          </div>
        ) : (
          <div className="empty-history">
            <div className="empty-icon">💬</div>
            <h3>Nouveau Chat #{chatId}</h3>
            <p>Aucun message dans ce chat. Commencez par analyser votre code !</p>
          </div>
        )}
      </div>

      <div className="input-section">


        <div className="input-group">
          <label className="input-label" htmlFor="code-editor">
            <span className="label-icon">⚡</span>
            Code Source à Analyser
          </label>
          
        </div>

        <textarea
          id="code-editor"
          ref={textareaRef}
          className="code-input"
          rows={1}
          style={{
            overflowY: 'auto',
            resize: 'auto',
            maxHeight: `${maxHeight}px`,
            height: `${initialHeight}px`,
          }}
          value={code}
          onChange={handleInputChange}
        />

        <div className="action-bar">


          <button
            type="button"
            className={`submit-button ${loading ? 'loading' : ''} ${!code.trim() ? 'disabled' : ''}`}
            onClick={handleAnalyze}
            disabled={loading || !code.trim()}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                <span className="button-text">Analyse en cours...</span>
              </>
            ) : (
              <>
                <span className="button-icon">🚀</span>
                <span className="button-text">Analyser le Code</span>
                <span className="button-hint">Ctrl+Enter</span>
              </>
            )}
          </button>
        </div>
      </div>

      <footer className="footer-company">
        <div className="footer-content">
          <div className="company-brand">
            <span className="brand-icon"></span>
            <span className="brand-name">DXC Technology</span>
            <span className="brand-badge">Enterprise AI</span>
          </div>
          <p className="company-tagline">
            Solutions d'Excellence en Intelligence Artificielle • Innovation & Performance • © 2025
          </p>

        </div>
      </footer>
    </div>
  );
}
