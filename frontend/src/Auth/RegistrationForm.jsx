import React, { useState, useEffect } from 'react';
import '../styles/Auth/RegistrationForm.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [timer, setTimer] = useState(0); // timer en secondes

  // Gestion du compte à rebours
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await axios.post('http://localhost:8000/api/signup/code/', { email });
      setStep(2);
      setTimer(60); // 1 minute
    } catch (error) {
      setErrorMessage("Erreur lors de l'envoi du code. Veuillez vérifier votre email.");
    }
  };

  const handleVerifyAndCreate = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await axios.post('http://localhost:8000/api/signup/verify/', {
        email,
        code,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      navigate('/');
    } catch (error) {
      setErrorMessage("Échec de la création du compte. Vérifiez les informations saisies.");
    }
  };

const handleGoogleSignup = () => {
  window.location.href = "http://localhost:8000/accounts/google/login/?next=http://localhost:5173/update-profile";
};

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="signup-page">
      <div id="radius-shape-1"></div>
      <div id="radius-shape-2"></div>
      <div className="signup-content">
        <div className="signup-info">
          <h1>Inscrivez-vous maintenant<br /><span>et accédez à notre plateforme IA</span></h1>
          <p>
            Analysez, améliorez et sécurisez votre code grâce à notre intelligence artificielle.
          </p>
        </div>

        <div className="signup-form">
          {step === 1 && (
            <form onSubmit={handleSendCode}>
              <input
                type="email"
                placeholder="Adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={timer > 0}>
                {timer > 0 ? `Réessayez dans ${formatTime(timer)}` : 'Envoyer le code'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyAndCreate}>
              <input
                type="text"
                placeholder="Code de vérification"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Prénom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Nom"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <button type="submit">Créer le compte</button>
              {timer === 0 && (
                <button type="button" onClick={handleSendCode} style={{ marginTop: '10px' }}>
                  Renvoyer le code
                </button>
              )}
              {timer > 0 && (
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                  Vous pouvez renvoyer le code dans {formatTime(timer)}
                </p>
              )}
            </form>
          )}

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <p>ou inscrivez-vous avec :</p>
          <div className="social-icons">
            <i className="fab fa-google" onClick={handleGoogleSignup} style={{ cursor: 'pointer' }}></i>
            <i className="fab fa-windows microsoft" title="Bientôt disponible"></i>
            <i className="fab fa-apple apple" title="Bientôt disponible"></i>
          </div>

          <p className="login-link">
            Vous avez déjà un compte ?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
