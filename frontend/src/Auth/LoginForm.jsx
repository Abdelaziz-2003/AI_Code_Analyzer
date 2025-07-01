import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth/LoginForm.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import codingImage from '../assets/coding.JPG';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <div
      className="login-page"
      style={{
        backgroundImage: `url(${codingImage})`,
        backgroundSize: '1300px 400px',
        backgroundPosition: '500px 100px',
        backgroundRepeat: 'no-repeat'
      }}
    >

      <div id="radius-shape-1"></div>
      <div id="radius-shape-2"></div>
      <div className="login-content">
        <div className="login-info">
          <h1>Transformez votre code<br /><span>avec l'IA de nouvelle génération</span></h1>
          <p>Découvrez une expérience de développement révolutionnaire. Analysez, optimisez et sécurisez votre code grâce à notre intelligence artificielle avancée.</p>
        </div>

        <div className="login-form">
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Votre adresse e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="8"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
              </button>
            </div>
            <button type="submit">Accéder à ma plateforme</button>
          </form>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <p className="signup-link">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/reset-password'); }}>
              Mot de passe oublié ? Récupérez-le ici
            </a>
          </p>

          <p className="signup-link">
            Nouveau sur notre plateforme ? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>Créer un compte gratuitement</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;