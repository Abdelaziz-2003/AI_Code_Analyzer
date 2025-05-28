import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/Auth/LoginForm.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    try {
      const response = await axios.post('http://localhost:8000/api/login/', {
        email,
        password,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      navigate('/app');
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setErrorMessage('Email ou mot de passe incorrect.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8000/accounts/google/login/';
  };

  return (
    <div className="login-page">
      <div id="radius-shape-1"></div>
      <div id="radius-shape-2"></div>
      <div className="login-content">
        <div className="login-info">
          <h1>Propulsez votre projet<br /><span>avec l'intelligence artificielle</span></h1>
          <p>Connectez-vous pour analyser, améliorer et sécuriser votre code en temps réel.</p>
        </div>

        <div className="login-form">
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Adresse e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="8"
            />
            <button type="submit">SE CONNECTER</button>
          </form>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <p>ou connectez-vous avec :</p>
          <div className="social-icons">
            <i
              className="fab fa-google"
              onClick={handleGoogleLogin}
              style={{ cursor: 'pointer' }}
              title="Connexion avec Google"
            ></i>
            <i className="fab fa-windows microsoft" title="Bientôt disponible"></i>
            <i className="fab fa-apple apple" title="Bientôt disponible"></i>
          </div>

          <p className="signup-link">
            Pas encore de compte ? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>S'inscrire</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
