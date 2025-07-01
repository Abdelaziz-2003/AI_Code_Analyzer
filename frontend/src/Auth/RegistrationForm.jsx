import React, { useState, useEffect } from 'react';
import '../styles/Auth/RegistrationForm.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import codingImage from '../assets/coding.JPG';

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
  const [showPassword, setShowPassword] = useState(false);

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
      const response = await axios.post('http://localhost:8000/api/signup/code/', { 
        email: email.trim() 
      }, {
        headers: { 
          'Content-Type': 'application/json' 
        },
      });
      console.log('Code envoyé avec succès:', response.data);
      setStep(2);
      setTimer(60); // 1 minute
    } catch (error) {
      console.error('Erreur complète:', error);
      console.error('Réponse de l\'erreur:', error.response?.data);
      console.error('Status de l\'erreur:', error.response?.status);
      
      if (error.response?.data) {
        // Afficher le message d'erreur spécifique du serveur
        const errorMsg = typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
        setErrorMessage(`Erreur: ${errorMsg}`);
      } else {
        setErrorMessage("Erreur lors de l'envoi du code. Vérifiez votre email et votre connexion.");
      }
    }
  };

  const handleVerifyAndCreate = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const response = await axios.post('http://localhost:8000/api/signup/verify/', {
        email: email.trim(),
        code: code.trim(),
        password: password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      }, {
        headers: { 
          'Content-Type': 'application/json' 
        },
      });
      console.log('Compte créé avec succès:', response.data);
      navigate('/');
    } catch (error) {
      console.error('Erreur complète:', error);
      console.error('Réponse de l\'erreur:', error.response?.data);
      console.error('Status de l\'erreur:', error.response?.status);
      
      if (error.response?.data) {
        const errorMsg = typeof error.response.data === 'string' 
          ? error.response.data 
          : error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
        setErrorMessage(`Erreur: ${errorMsg}`);
      } else {
        setErrorMessage("Échec de la création du compte. Vérifiez les informations saisies.");
      }
    }
  };


  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div
          className="signup-page"
          style={{
            backgroundImage: `url(${codingImage})`,
            backgroundSize: '1300px 400px',
            backgroundPosition: '500px 100px',
            backgroundRepeat: 'no-repeat'
          }}
        >
    
      <div id="radius-shape-1"></div>
      <div id="radius-shape-2"></div>
      <div className="signup-content">
        <div className="signup-info">
          <h1>Rejoignez l'avenir du développement<br /><span>avec notre IA révolutionnaire</span></h1>
          <p>
            Créez votre compte et découvrez une nouvelle façon de coder. Analysez, optimisez et sécurisez vos projets grâce à l'intelligence artificielle de pointe.
          </p>
        </div>

        <div className="signup-form">
          {step === 1 && (
            <form onSubmit={handleSendCode}>
              <input
                type="email"
                placeholder="Votre adresse e-mail professionnelle"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                title="Veuillez entrer une adresse email valide"
              />
              <button type="submit" disabled={timer > 0}>
                {timer > 0 ? `Nouveau code dans ${formatTime(timer)}` : 'Recevoir le code de vérification'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyAndCreate}>
              <input
                type="text"
                placeholder="Code de vérification reçu par email"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Votre prénom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Votre nom de famille"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Créez un mot de passe sécurisé"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                </button>
              </div>
              <button type="submit">Créer mon compte gratuitement</button>
              {timer === 0 && (
                <button type="button" onClick={handleSendCode} style={{ marginTop: '10px' }}>
                  Renvoyer le code de vérification
                </button>
              )}
              {timer > 0 && (
                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                  Nouveau code disponible dans {formatTime(timer)}
                </p>
              )}
            </form>
          )}

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <p className="login-link">
            Vous possédez déjà un compte ?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
              Connectez-vous ici
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;