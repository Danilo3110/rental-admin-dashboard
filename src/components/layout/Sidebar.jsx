import { useSelector } from 'react-redux';
import { NavLink } from 'react-router';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import DashboardRounded from '@mui/icons-material/DashboardRounded';
import EventNoteRounded from '@mui/icons-material/EventNoteRounded';
import ForestRounded from '@mui/icons-material/ForestRounded';
import HomeWorkRounded from '@mui/icons-material/HomeWorkRounded';
import { selectPendingCount } from '../../store/selectors.js';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: DashboardRounded, end: true },
  { to: '/reservations', label: 'Reservations', icon: EventNoteRounded, showPending: true },
  { to: '/properties', label: 'Properties', icon: HomeWorkRounded },
];

function SidebarContent({ onNavigate }) {
  const pending = useSelector(selectPendingCount);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 2.5, height: 64 }}>
        <Box
          sx={{
            display: 'grid',
            placeItems: 'center',
            width: 36,
            height: 36,
            borderRadius: 2.5,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <ForestRounded fontSize="small" />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, lineHeight: 1.2 }}>Breza Admin</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Holiday rentals
          </Typography>
        </Box>
      </Box>

      <List component="nav" aria-label="Main navigation" sx={{ px: 1.5, py: 1 }}>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end, showPending }) => (
          <ListItemButton
            key={to}
            component={NavLink}
            to={to}
            end={end}
            onClick={onNavigate}
            sx={{
              mb: 0.5,
              borderRadius: 2.5,
              '&.active': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                color: 'primary.main',
                '& .MuiListItemIcon-root': { color: 'primary.main' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Icon />
            </ListItemIcon>
            <ListItemText
              primary={label}
              slotProps={{ primary: { sx: { fontWeight: 600, fontSize: '0.95rem' } } }}
            />
            {showPending && pending > 0 && (
              <Chip
                size="small"
                label={pending}
                color="warning"
                aria-label={`${pending} pending`}
              />
            )}
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ mt: 'auto', p: 2.5 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          }}
        >
          <Typography variant="subtitle2">Demo project</Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
            Fictional data generated in the browser. Changes reset when you reload the page.
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: 'text.secondary' }}>
          Design &amp; development: Danilo Lukić
        </Typography>
      </Box>
    </Box>
  );
}

export default function Sidebar({ width, permanent, open, onClose }) {
  const paperStyles = { width, boxSizing: 'border-box', borderRight: 1, borderColor: 'divider' };

  if (permanent) {
    return (
      <Drawer variant="permanent" sx={{ width, flexShrink: 0, '& .MuiDrawer-paper': paperStyles }}>
        <SidebarContent />
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      sx={{ '& .MuiDrawer-paper': paperStyles }}
    >
      <SidebarContent onNavigate={onClose} />
    </Drawer>
  );
}
