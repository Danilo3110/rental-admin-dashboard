import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import LightModeRounded from '@mui/icons-material/LightModeRounded';
import MenuRounded from '@mui/icons-material/MenuRounded';
import NotificationsRounded from '@mui/icons-material/NotificationsRounded';
import { selectPendingCount, TODAY } from '../../store/selectors.js';
import { toggleMode } from '../../store/uiSlice.js';
import { formatToday, formatTodayShort } from '../../utils/format.js';

export default function TopBar({ showMenuButton, onMenuClick }) {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.ui.mode);
  const pending = useSelector(selectPendingCount);
  const modeLabel = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: (theme) => alpha(theme.palette.background.default, 0.85),
        backdropFilter: 'blur(10px)',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ gap: 1, minHeight: { xs: 64 } }}>
        {showMenuButton && (
          <IconButton edge="start" onClick={onMenuClick} aria-label="Open navigation">
            <MenuRounded />
          </IconButton>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              {formatToday(TODAY)}
            </Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
              {formatTodayShort(TODAY)}
            </Box>
          </Typography>
        </Box>

        <Tooltip title={modeLabel}>
          <IconButton onClick={() => dispatch(toggleMode())} aria-label={modeLabel}>
            {mode === 'dark' ? <LightModeRounded /> : <DarkModeRounded />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Pending reservations">
          <IconButton
            component={Link}
            to="/reservations?status=pending"
            aria-label={`${pending} pending reservations`}
          >
            <Badge badgeContent={pending} color="warning" max={99}>
              <NotificationsRounded />
            </Badge>
          </IconButton>
        </Tooltip>
        <Tooltip title="Milan Pavlović · Owner">
          <Avatar
            sx={{
              width: 36,
              height: 36,
              ml: 0.5,
              bgcolor: 'secondary.main',
              color: 'secondary.contrastText',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            MP
          </Avatar>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
