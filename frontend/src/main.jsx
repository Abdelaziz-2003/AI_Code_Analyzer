import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './router'; // <-- c'est là qu'on appelle le vrai router

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);