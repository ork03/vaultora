import { useState } from "react";
import {
  Button,
  Paper,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { generatePassword } from "../../passwordGenerator";
export default function PasswordGenerator() {
  const [l, setL] = useState(20),
    [v, setV] = useState(() => generatePassword(20));
  return (
    <Paper sx={{ m: { xs: 2, md: 5 }, p: 3, maxWidth: 700 }}>
      <Stack spacing={2}>
        <Typography variant="h5">Password generator</Typography>
        <Typography>Length: {l}</Typography>
        <Slider min={12} max={64} value={l} onChange={(_, x) => setL(x)} />
        <TextField value={v} InputProps={{ readOnly: true }} />
        <Button variant="contained" onClick={() => setV(generatePassword(l))}>
          Generate
        </Button>
      </Stack>
    </Paper>
  );
}
