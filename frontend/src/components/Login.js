import React from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  Paper,
  Link,
  Alert,
} from "@mui/material";
import FaceIcon from "@mui/icons-material/Face";
import { Navigate, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { UserContext } from "../UserContext";
function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const userContext = useContext(UserContext);

  async function Login(e) {
    e.preventDefault();
    if (username === "" || password === "") {
      setUsername("");
      setPassword("");
      setError("Invalid username or password");
      return;
    }
    const res = await fetch(`${window.REACT_APP_API_URL}/api/user/loginAdmin`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });
    const data = await res.json();
    if (data.token !== undefined) {
      userContext.setUserContext(data);
      navigate("/");
    } else {
      
      setUsername("");
      setPassword("");
      setError("Invalid username or password");
      if (res.status === 403) {
        setError("User is not an admin or username is not authorized by ORV API");
      }
    }
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: "auto", mt: 6 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Login
      </Typography>
      <Box component="form" noValidate autoComplete="off" onSubmit={Login}>
        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <Alert severity="error">{error}</Alert>}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          type="submit"
        >
          Login
        </Button>
       
        <Typography sx={{ mt: 2 }} align="center">
          {"Don't have an account? "}
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate("/register")}
          >
            Sign up instead
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
}

export default Login;
