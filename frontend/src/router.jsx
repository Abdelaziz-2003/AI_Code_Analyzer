import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Auth/LoginForm';
import ResetPassword from './Auth/ForgotPassword';
import Signup from './Auth/RegistrationForm';
import UpdateProfile from './Auth/UpdateProfile';
import App from './App';
import PrivateRoute from './PrivateRoute';
import OAuth2RedirectHandler from './Auth/OAuth2RedirectHandler'; 

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
        <Route path="/oauth2-redirect" element={<OAuth2RedirectHandler />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/app" element={
          <PrivateRoute>
            <App />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}
