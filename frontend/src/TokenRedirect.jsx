import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TokenRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get('access');
    const refresh = params.get('refresh');

    if (access && refresh) {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // Nettoyer l'URL
      window.history.replaceState({}, document.title, '/app');
      navigate('/app');
    } else {
      navigate('/');
    }
  }, [navigate]);

  return null;
}
