import React, { useState } from 'react';
import '../styles/ChatMessage.css';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function ChatMessage({ sender, text, result, error }) {
  const isUser = sender === 'user';
  const theme = document.documentElement.getAttribute('data-theme');
  const codeStyle = theme === 'dark' ? vscDarkPlus : vs;
  const [copied, setCopied] = useState(false);

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
            <div className="copy-button-container">
              <button onClick={() => copyToClipboard(codeBody)} className="copy-button">
                {copied ? '✔ Copié' : '📋 Copier'}
              </button>
            </div>
            <SyntaxHighlighter
              language={language}
              style={codeStyle}
              wrapLines
              showLineNumbers
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
            <div className="msg-label">💻 Code Entré</div>
            <div className="code-block-container">
              <div className="copy-button-container">
                <button onClick={() => copyToClipboard(text)} className="copy-button">
                  {copied ? '✔ Copié' : '📋 Copier'}
                </button>
              </div>
              <SyntaxHighlighter language="python" style={codeStyle} wrapLines showLineNumbers>
                {text}
              </SyntaxHighlighter>
            </div>
          </div>
        )}

        {!isUser && result && (
          <div className="msg-wrapper">
            <div className="msg-label">🤖 Résultat Corrigé</div>
            {renderFormattedSuggestion(result.gpt_suggestion)}
            <div className="msg-info">
              <p><strong>Langage détecté :</strong> {result.language_detected}</p>
              <p><strong>Vulnérabilités détectées :</strong> {result.semgrep_findings?.length || 0}</p>
            </div>
          </div>
        )}

        {!isUser && result?.gpt_explanation && (
          <div className="ai-explanation">
            <hr className="separator" />
            <p className="explanation-label">💡 Explication IA :</p>
            <p className="explanation-text">{result.gpt_explanation}</p>
          </div>
        )}

        {error && (
          <div className="error-msg">❌ {error}</div>
        )}
      </div>
    </div>
  );
}
