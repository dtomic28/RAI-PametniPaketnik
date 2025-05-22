import React from 'react';
import { Box, Button, TextField, Typography, Divider, Paper, Link } from '@mui/material';
import FaceIcon from '@mui/icons-material/Face';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 6 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Login
      </Typography>
      <Box component="form" noValidate autoComplete="off">
        <TextField label="Email" type="email" fullWidth margin="normal" />
        <TextField label="Password" type="password" fullWidth margin="normal" />
        <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Login
        </Button>
        <Divider sx={{ my: 2 }}>OR</Divider>
        <Button variant="outlined" startIcon={<FaceIcon />} fullWidth sx={{ mt: 1 }}>
          FaceID
        </Button>
        <Typography sx={{ mt: 2 }} align="center">
          {"Don't have an account? "}
          <Link component="button" variant="body2" onClick={() => navigate('/register')}>
            Sign up instead
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
};

export default Login;