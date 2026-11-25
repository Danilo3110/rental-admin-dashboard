import { Link as RouterLink } from 'react-router';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PageHeader from '../components/PageHeader.jsx';

export default function NotFoundPage() {
  return (
    <Box sx={{ py: 6, textAlign: 'center' }}>
      <PageHeader title="Page not found" />
      <Typography sx={{ color: 'text.secondary', mb: 3 }}>
        The page you are looking for does not exist.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Back to overview
      </Button>
    </Box>
  );
}
