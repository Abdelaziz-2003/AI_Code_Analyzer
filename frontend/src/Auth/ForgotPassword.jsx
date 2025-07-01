import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth/ForgotPassword.css';
import codingImage from '../assets/coding.JPG';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Timer
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Démarre le compte à rebours quand step === 2
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [step, timer]);

  const requestResetCode = async () => {
    try {
      await axios.post('http://localhost:8000/api/password-reset/code/', { email });
      setStep(2);
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      setError("Email non trouvé ou erreur serveur.");
    }
  };

  const confirmResetCode = async () => {
    try {
      await axios.post('http://localhost:8000/api/password-reset/confirm/', {
        email,
        code,
        new_password: newPassword
      });
      navigate('/');
    } catch (err) {
      setError("Code invalide ou expiré.");
    }
  };

  return (
    <div
      className="reset-password-page"
      style={{
        backgroundImage: `url(${codingImage})`,
        backgroundSize: '1300px 400px',
        backgroundPosition: '500px 100px',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div id="radius-shape-1"></div>
      <div id="radius-shape-2"></div>

      <div className="reset-password-content">
        <div className="reset-password-info">
          <h2>
            Récupérez votre accès<br />
            <span>en quelques étapes simples</span>
          </h2>
          <p>
            Saisissez votre adresse e-mail pour recevoir un code de sécurité, puis créez un nouveau mot de passe robuste pour protéger votre compte.
          </p>
        </div>

        <div className="reset-password-form">
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); requestResetCode(); }}>
              <input
                type="email"
                placeholder="Votre adresse e-mail professionnelle"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">Recevoir le code de récupération</button>
            </form>
          )}

          {step === 2 && (
            <>
              <form onSubmit={(e) => { e.preventDefault(); confirmResetCode(); }}>
                <input
                  type="text"
                  placeholder="Code de sécurité reçu par e-mail"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Créez votre nouveau mot de passe"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                <button type="submit">Confirmer le nouveau mot de passe</button>
              </form>

              {timer > 0 && (
                <p className="timer-message">
                  Nouveau code disponible dans <strong>{timer}s</strong>
                </p>
              )}

              {canResend && (
                <p style={{ marginTop: '15px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={requestResetCode}
                    className="resend-code-btn"
                  >
                    Renvoyer le code de sécurité
                  </button>
                </p>
              )}
            </>
          )}

          {error && <p className="error-message">{error}</p>}

          <div className="back-to-login">
            <p>
              Vous vous souvenez de votre mot de passe ?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                Retour à la connexion
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
