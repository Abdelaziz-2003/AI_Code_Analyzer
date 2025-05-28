import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function UpdateProfile() {
  const navigate = useNavigate();
  const location = useLocation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔐 Lire les tokens depuis l'URL (OAuth2)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const access = params.get('access');
    const refresh = params.get('refresh');

    if (access && refresh) {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    }
  }, [location]);

  // 👤 Charger le profil utilisateur
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError("Token d'authentification manquant.");
      setLoading(false);
      return;
    }

    axios.get('http://localhost:8000/api/user/me/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        setFirstName(res.data.first_name || '');
        setLastName(res.data.last_name || '');
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur chargement utilisateur :", err);
        setError("Impossible de charger le profil utilisateur.");
        setLoading(false);
      });
  }, []);

  // 📤 Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');

    try {
      await axios.patch('http://localhost:8000/api/user/update/', {
        first_name: firstName,
        last_name: lastName
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // ✅ Redirige vers /app après enregistrement
      navigate('/app');
    } catch (err) {
      console.error("Erreur mise à jour :", err);
      setError("Erreur lors de la mise à jour du profil.");
    }
  };

  if (loading) return <div style={{ padding: "2rem" }}><p>Chargement...</p></div>;

  return (
    <div className="update-profile-page" style={{ padding: '2rem' }}>
      <h2>Bienvenue ! Complétez votre profil</h2>
      {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} className="update-profile-form" style={{ maxWidth: '400px' }}>
        <input
          type="text"
          placeholder="Prénom"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <input
          type="text"
          placeholder="Nom"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          Enregistrer et continuer
        </button>
      </form>
    </div>
  );
}
