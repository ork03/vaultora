import { useState } from "react";
import {
  Alert,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import { validateAccountPassword } from "./authValidation";
import PasswordStrength from "../../components/security/PasswordStrength";
export default function RegisterPage({ onLogin }) {
  const { register } = useAuth();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    const v = validateAccountPassword(password);
    if (v) return setError(v);
    setBusy(true);
    try {
      await register({ email, password });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={800}>
        Create account
      </Typography>
      <Stack component="form" spacing={2} mt={3} onSubmit={submit}>
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Account password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <PasswordStrength value={password} />
        {error && <Alert severity="error">{error}</Alert>}
        <Button type="submit" variant="contained" disabled={busy}>
          {busy ? "Creating…" : "Create account"}
        </Button>
        <Button onClick={onLogin}>Back to sign in</Button>
      </Stack>
    </Paper>
  );
}
