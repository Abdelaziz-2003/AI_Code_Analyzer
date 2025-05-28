import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Auth/LoginForm';
import Signup from './Auth/RegistrationForm';
import UpdateProfile from './Auth/UpdateProfile';
import App from './App';
import PrivateRoute from './PrivateRoute';
import TokenRedirect from './TokenRedirect'; 

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
        <Route path="/oauth2-redirect" element={<TokenRedirect />} /> 
        <Route path="/app" element={
          <PrivateRoute>
            <App />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}
