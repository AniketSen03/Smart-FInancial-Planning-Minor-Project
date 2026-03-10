import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from './components/SignIn';
import AppInner from './components/AppInner';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <Routes>
      <Route path="/signin" element={
        isLoggedIn ? <Navigate to="/" replace /> : <SignIn onLogin={handleLogin} />
      } />
      <Route path="/" element={
        isLoggedIn
          ? <ThemeProvider><AppInner /></ThemeProvider>
          : <Navigate to="/signin" replace />
      } />
    </Routes>
  );
}