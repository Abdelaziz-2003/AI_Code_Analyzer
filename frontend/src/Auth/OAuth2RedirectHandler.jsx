import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const access = params.get('access');
    const refresh = params.get('refresh');
    const next = params.get('next') || 'app';

    if (access && refresh) {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      navigate(`/${next}`);
    } else {
      navigate('/?error=unauthenticated');
    }
  }, [location, navigate]);

  return <p>Connexion en cours...</p>;
};

export default OAuth2RedirectHandler;
