import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from './components/SignIn';
import AppInner from './components/AppInner';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  return (
    <Routes>
      <Route path="/signin" element={<SignIn onLogin={() => setToken(localStorage.getItem('token'))} />} />
      <Route
        path="/"
        element={
          token
            ? <ThemeProvider><AppInner /></ThemeProvider>
            : <Navigate to="/signin" replace />
        }
      />
    </Routes>
  );
}