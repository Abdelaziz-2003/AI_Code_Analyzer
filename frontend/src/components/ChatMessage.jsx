import React, { useState, useEffect } from 'react';
import '../styles/ChatMessage.css';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function ChatMessage({ sender, text, result, error }) {
  const isUser = sender === 'user';
  const [copied, setCopied] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(
    document.documentElement.getAttribute('data-theme') || 'dark'
  );

  // Écouter les changements de thème en temps réel
  useEffect(() => {
    const handleThemeChange = () => {
      const newTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      setCurrentTheme(newTheme);
    };

    // Observer les changements d'attributs sur l'élément html
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          handleThemeChange();
        }
      });
    });

    // Commencer à observer
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    // Nettoyage
    return () => observer.disconnect();
  }, []);

  // Style de code qui se met à jour automatiquement
  const codeStyle = currentTheme === 'dark' ? vscDarkPlus : vs;

  // Détection automatique du langage de programmation
  const detectLanguage = (code) => {
    if (!code) return 'text';
    
    const codeLines = code.trim().toLowerCase();
    
    // Détection Java
    if (codeLines.includes('public class') || 
        codeLines.includes('public static void main') ||
        codeLines.includes('import java.') ||
        codeLines.includes('package ') ||
        codeLines.includes('system.out.println')) {
      return 'java';
    }
    
    // Détection C++
    if (codeLines.includes('#include') ||
        codeLines.includes('std::') ||
        codeLines.includes('cout <<') ||
        codeLines.includes('cin >>') ||
        codeLines.includes('using namespace std') ||
        codeLines.includes('int main()')) {
      return 'cpp';
    }
    
    // Détection Python
    if (codeLines.includes('def ') ||
        codeLines.includes('import ') ||
        codeLines.includes('from ') ||
        codeLines.includes('print(') ||
        codeLines.includes('if __name__') ||
        codeLines.includes('class ') && codeLines.includes(':')) {
      return 'python';
    }
    
    // Détection JavaScript
    if (codeLines.includes('function ') ||
        codeLines.includes('const ') ||
        codeLines.includes('let ') ||
        codeLines.includes('var ') ||
        codeLines.includes('console.log') ||
        codeLines.includes('=>')) {
      return 'javascript';
    }
    
    // Par défaut, retourner Python
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const renderFormattedSuggestion = (content) => {
    if (!content) return null;

    const parts = content.split(/```(.*?)```/gs);

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const code = part.trim();
        const firstLine = code.split('\n')[0];
        const language = firstLine.match(/^\w+$/) ? firstLine : 'python';
        const codeBody = firstLine === language ? code.split('\n').slice(1).join('\n') : code;

        return (
          <div key={index} className="code-block-container" style={{ width: '100%' }}>
            <div className="code-language-tag">{language.toUpperCase()}</div>
            <div className="copy-button-container">
              <button onClick={() => copyToClipboard(codeBody)} className="copy-button">
                {copied ? '✨ Copié' : '📋 Copier'}
              </button>
            </div>
            <SyntaxHighlighter
              language={language}
              style={codeStyle}
              wrapLines
              showLineNumbers
              key={`ai-code-${index}-${currentTheme}`} // Force re-render lors du changement de thème
            >
              {codeBody}
            </SyntaxHighlighter>
          </div>
        );
      } else {
        return part.split('\n\n').map((paragraph, i) => (
          <p key={`${index}-${i}`} className="ai-paragraph">{paragraph}</p>
        ));
      }
    });
  };

  return (
    <div className={`chat-bubble ${isUser ? 'sent' : 'received'}`} style={{ width: '100%' }}>
      <div className="bubble-content" style={{ maxWidth: '100%' }}>
        {isUser && text && (
          <div className="msg-wrapper">
            <div className="msg-label">
              <div className="ai-icon">💻</div>
              Code Soumis à l'Expertise IA
            </div>
          
            <div className="code-block-container">
              <div className="code-language-tag">
                {detectLanguage(text).toUpperCase()}
              </div>
              <div className="copy-button-container">
                <button onClick={() => copyToClipboard(text)} className="copy-button">
                  {copied ? '✨ Copié' : '📋 Copier'}
                </button>
              </div>
              <SyntaxHighlighter 
                language={detectLanguage(text)} 
                style={codeStyle} 
                wrapLines 
                showLineNumbers
                key={`user-code-${currentTheme}`} // Force re-render lors du changement de thème
              >
                {text}
              </SyntaxHighlighter>
            </div>
            <div className="timestamp">
              Transmis à l'Intelligence Artificielle • {new Date().toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        )}

        {!isUser && result && (
          <div className="msg-wrapper">
            <div className="msg-label">
              <div className="ai-icon">🚀</div>
              Assistant IA - Optimisation Complète
            </div>
            <div className="msg-info">
              <div className="status-indicator">
                🎯 {result.language_detected} • Analysé avec Succès
              </div>
            </div>
            {renderFormattedSuggestion(result.gpt_suggestion)}
          </div>
        )}

        {!isUser && result?.gpt_explanation && (
          <div className="ai-explanation">
            <hr className="separator" />
            <div className="explanation-label">
              <div className="ai-icon">🧠</div>
              Expertise Technique Approfondie
            </div>
            <div className="explanation-text">
              {result.gpt_explanation}
            </div>
          </div>
        )}

        {error && (
          <div className="error-msg">
            ⚠️ Analyse Interrompue : {error}
          </div>
        )}
      </div>
    </div>
  );
}
