import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "../theme/theme";
import { AuthProvider } from "../context/AuthContext";
import { VaultProvider } from "../context/VaultContext";
export default function Providers({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <VaultProvider>{children}</VaultProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
