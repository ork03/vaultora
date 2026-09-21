import { Box } from "@mui/material";
import Navbar from "./Navbar";
export default function AppLayout({ email, onLock, onLogout, children }) {
  return (
    <Box minHeight="100vh">
      <Navbar email={email} onLock={onLock} onLogout={onLogout} />
      <Box component="main">{children}</Box>
    </Box>
  );
}
