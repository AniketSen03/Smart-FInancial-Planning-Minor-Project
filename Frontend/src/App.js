import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Routes, Route } from "react-router-dom";
import SignIn from './components/SignIn';
import AppInner from './components/AppInner';


export default function App() {
  return (

    <Routes>

    <Route
        path="/"
        element={<ThemeProvider>
      <AppInner />
    </ThemeProvider>
    }
    />


    <Route
        path="/signin"
        element={
          <>
            <SignIn />
          </>
        }
      />


</Routes>
    
  );
}
