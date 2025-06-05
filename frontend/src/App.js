import React from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Tabs, Tab } from '@mui/material';
import Login from './components/Login';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Register from './components/Register';
import Log from './components/Log';
import Logout from './components/Logout';
import Dashboard from './components/Dashboard';
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
            <Route path="/" exact element={<Dashboard/>}/>
            <Route path="/login" exact element={<Login />}></Route>
            <Route path="/register" element={<Register />}></Route>
            <Route path="/logout" element={<Logout />}></Route>
            <Route path="/log" element={<Log/>}></Route>
            
          </Routes>
    </ThemeProvider>
    </UserContext.Provider>
    </BrowserRouter>
  );
 
}

export default App;
