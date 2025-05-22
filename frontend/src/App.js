import React from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import Login from './components/Login';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Register from './components/Register';
import Logout from './components/Logout';
import { UserContext } from './UserContext';
import { useState } from 'react';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

  
function App() {

const [user, setUser] = useState(localStorage.user ? JSON.parse(localStorage.user) : null);
  const updateUserData = (userInfo) => {
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUser(userInfo);
  }

  return (
    <BrowserRouter>
     <UserContext.Provider value={{
        user: user,
        setUserContext: updateUserData
      }}>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Routes>
            <Route path="/" exact element={<Box sx={{ textAlign: 'center', mt: 4 }}>Welcome to the App</Box>} />
            <Route path="/login" exact element={<Login />}></Route>
            <Route path="/register" element={<Register />}></Route>
            <Route path="/logout" element={<Logout />}></Route>
            
          </Routes>
    </ThemeProvider>
    </UserContext.Provider>
    </BrowserRouter>
  );
}

export default App;
