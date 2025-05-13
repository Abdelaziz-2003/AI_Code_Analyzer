import React, { useState, useEffect, useRef } from 'react';
import { analyzeCode } from '../services/analysisApi';
import ChatMessage from './ChatMessage';
import axios from 'axios';
import '../styles/CodeAnalyzer.css';

export default function CodeAnalyzer({ chatId }) {
  const [code, setCode] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);
  const maxHeight = 300;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/chat/${chatId}/history/`);
        setHistory(res.data);
      } catch (error) {
        console.error("Erreur de chargement de l'historique :", error);
      }
    };
    if (chatId) fetchHistory();
  }, [chatId]);

  const handleAnalyze = async () => {
    if (!code.trim()) return;

    setHistory(prev => [...prev, { sender: 'user', text: code }]);
    setLoading(true);

    try {
      const result = await analyzeCode(chatId, code);
      setHistory(prev => [...prev, { sender: 'bot', result }]);
    } catch {
      setHistory(prev => [...prev, { sender: 'bot', error: 'Erreur serveur' }]);
    } finally {
      setCode('');
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
      <div className="messages-container">
        {history.map((msg, index) => (
          <ChatMessage key={index} sender={msg.sender} {...msg} />
        ))}
      </div>
      <div className="input-section">
        <label className="input-label">Entrée de code :</label>
        <textarea
          ref={textareaRef}
          className="code-input"
          rows={1}
          style={{ overflowY: 'auto', maxHeight: `${maxHeight}px`, resize: 'none' }}
          placeholder="Collez ou écrivez votre code ici..."
          value={code}
          onChange={handleInputChange}
        />
        <div className="submit-button-container">
          <button
            className="submit-button"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? 'Analyse en cours...' : 'Analyser'}
          </button>
        </div>
      </div>
    </div>
  );
}
