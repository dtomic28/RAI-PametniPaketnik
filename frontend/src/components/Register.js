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
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function Register(e) {
    e.preventDefault();
    if (username === "" || password === "" || email === "") {
      setUsername("");
      setPassword("");
      setEmail("");
      setError("Registration failed");
      return;
    }
    setError("");
    const res = await fetch(`${window.REACT_APP_API_URL}/api/user/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        username: username,
        password: password,
      }),
    });

    const data = await res.json();
    if (data._id !== undefined) {
      window.location.href = "/login";
    } else {
      setUsername("");
      setPassword("");
      setEmail("");
      setError("Registration failed");
    }
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: "auto", mt: 6 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Sign Up
      </Typography>
      <Box component="form" noValidate autoComplete="off" onSubmit={Register}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
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
          Sign Up
        </Button>
        <Divider sx={{ my: 2 }}>OR</Divider>
        <Button
          variant="outlined"
          startIcon={<FaceIcon />}
          fullWidth
          sx={{ mt: 1 }}
        >
          FaceID
        </Button>
        <Typography sx={{ mt: 2 }} align="center">
          {"Already have an account? "}
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate("/login")}
          >
            Log in instead
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
}

export default Register;
