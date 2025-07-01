import React, { useState } from 'react';
import ChatMessage from '../components/ChatMessage';

export default function ChatDemo() {
  const [messages] = useState([
    {
      id: 1,
      sender: 'user',
      text: `def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

# Calcul des nombres de Fibonacci
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`,
      timestamp: new Date()
    },
    {
      id: 2,
      sender: 'ai',
      result: {
        language_detected: 'Python',
        gpt_suggestion: `Voici une version optimisée révolutionnaire de votre algorithme Fibonacci, conçue pour des performances exceptionnelles :

\`\`\`python
def fibonacci_optimized(n, memo={}):
    """
    🚀 Algorithme Fibonacci Ultra-Performant
    Utilise la mémorisation avancée pour une efficacité maximale
    
    Args:
        n (int): Position dans la séquence de Fibonacci
        memo (dict): Cache intelligent pour les résultats précédents
    
    Returns:
        int: Le n-ième nombre de Fibonacci calculé de manière optimale
    """
    if n in memo:
        return memo[n]
    
    if n <= 1:
        return n
    
    memo[n] = fibonacci_optimized(n - 1, memo) + fibonacci_optimized(n - 2, memo)
    return memo[n]

# 🌟 Version itérative ultra-efficace
def fibonacci_matrix_power(n):
    """
    Calcul par exponentiation matricielle - O(log n)
    La méthode la plus rapide pour de très grandes valeurs
    """
    if n <= 1:
        return n
    
    def matrix_multiply(A, B):
        return [[A[0][0]*B[0][0] + A[0][1]*B[1][0], A[0][0]*B[0][1] + A[0][1]*B[1][1]],
                [A[1][0]*B[0][0] + A[1][1]*B[1][0], A[1][0]*B[0][1] + A[1][1]*B[1][1]]]
    
    def matrix_power(mat, power):
        if power == 1:
            return mat
        if power % 2 == 0:
            half_pow = matrix_power(mat, power // 2)
            return matrix_multiply(half_pow, half_pow)
        else:
            return matrix_multiply(mat, matrix_power(mat, power - 1))
    
    base_matrix = [[1, 1], [1, 0]]
    result_matrix = matrix_power(base_matrix, n)
    return result_matrix[0][1]

# ✨ Démonstration des performances
print("=== Séquence Fibonacci - Édition Premium ===")
for i in range(15):
    result = fibonacci_optimized(i)
    print(f"F({i:2d}) = {result:4d} ⭐")
`,
        gpt_explanation: "Analyse Technique Approfondie: Votre implementation originale presente une complexite exponentielle O(2^n) qui devient rapidement problematique. Les optimisations proposees transforment votre algorithme en une solution de niveau industriel avec des gains de performance exceptionnels."
      },
      timestamp: new Date()
    }
  ]);

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1400px', 
      margin: '0 auto',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* En-tête Premium */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '3rem 2rem',
        borderRadius: '2rem',
        marginBottom: '2rem',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          animation: 'rotate 20s linear infinite'
        }}></div>
        
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '900', 
          marginBottom: '1rem',
          background: 'linear-gradient(45deg, #ffffff, #f0f9ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          position: 'relative',
          zIndex: 1
        }}>
          🚀 Analyseur de Code IA Premium
        </h1>
        <p style={{ 
          fontSize: '1.3rem', 
          opacity: '0.95',
          fontWeight: '500',
          position: 'relative',
          zIndex: 1
        }}>
          Interface Ultra-Moderne • Expertise Technique Avancée
        </p>
        <div style={{
          marginTop: '1.5rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          position: 'relative',
          zIndex: 1
        }}>
          <span style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '0.5rem 1rem',
            borderRadius: '2rem',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>✨ IA Avancée</span>
          <span style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '0.5rem 1rem',
            borderRadius: '2rem',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>🎯 Analyses Précises</span>
          <span style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '0.5rem 1rem',
            borderRadius: '2rem',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>⚡ Performance Premium</span>
        </div>
      </div>

      {/* Zone de Chat Premium */}
      <div style={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
        borderRadius: '2rem', 
        padding: '2rem',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.08), 0 10px 30px rgba(0, 0, 0, 0.04)',
        border: '1px solid rgba(203, 213, 225, 0.3)',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '2rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            width: '0.5rem',
            height: '0.5rem',
            background: 'white',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></div>
          Système Actif
        </div>

        {messages.map(message => (
          <ChatMessage
            key={message.id}
            sender={message.sender}
            text={message.text}
            result={message.result}
            error={message.error}
          />
        ))}
      </div>
    </div>
  );
}
