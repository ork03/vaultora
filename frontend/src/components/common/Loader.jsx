import { CircularProgress, Box } from '@mui/material';

export default function Loader() {
  return (
    <Box minHeight="100vh" sx={{ display: 'grid', placeItems: 'center' }}>
      <CircularProgress />
    </Box>
  );
}
