import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuth(true);
    }
    setChecking(false); // attendre que le check soit fait
  }, []);

  if (checking) return null; // éviter un flash de redirection

  return isAuth ? children : <Navigate to="/" />;
}
