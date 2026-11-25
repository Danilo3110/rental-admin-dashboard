import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import AddRounded from '@mui/icons-material/AddRounded';
import SearchOffRounded from '@mui/icons-material/SearchOffRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import ErrorState from '../components/ErrorState.jsx';
import GuestAvatar from '../components/GuestAvatar.jsx';
import NewReservationDialog from '../components/NewReservationDialog.jsx';
import PageHeader from '../components/PageHeader.jsx';
import ReservationDrawer from '../components/ReservationDrawer.jsx';
import StatusChip from '../components/StatusChip.jsx';
import {
  CHANNEL_LABELS,
  PROPERTIES,
  PROPERTY_BY_ID,
  STATUS_LABELS,
  STATUSES,
} from '../data/catalog.js';
import { selectAllReservations } from '../store/reservationsSlice.js';
import { selectLoadStatus } from '../store/selectors.js';
import { formatCurrency, formatFullDate, formatNights, formatStay } from '../utils/format.js';
import { filterReservations, sortReservations } from '../utils/reservations.js';

const DEFAULT_SORT = 'checkIn:desc';
const COLUMNS = [
  { id: 'id', label: 'Reservation', sortable: true },
  { id: 'guestName', label: 'Guest', sortable: true },
  { id: 'propertyId', label: 'Property', sortable: true, hideBelow: 'md' },
  { id: 'checkIn', label: 'Stay', sortable: true },
  { id: 'channel', label: 'Channel', sortable: false, hideBelow: 'xl' },
  { id: 'total', label: 'Total', sortable: true, align: 'right' },
  { id: 'status', label: 'Status', sortable: true },
];

const SORT_OPTIONS = [
  { value: 'checkIn:desc', label: 'Check-in: latest first' },
  { value: 'checkIn:asc', label: 'Check-in: earliest first' },
  { value: 'total:desc', label: 'Total: highest first' },
  { value: 'guestName:asc', label: 'Guest: A–Z' },
];

const hideBelow = (breakpoint) =>
  breakpoint ? { display: { xs: 'none', [breakpoint]: 'table-cell' } } : undefined;

/** Phone layout: a list of tappable rows instead of the wide table. */
function ReservationList({ rows, loading, onSelect }) {
  if (loading) {
    return (
      <Box sx={{ px: 2, pb: 2 }}>
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} variant="rounded" height={64} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }
  return (
    <Box
      component="ul"
      sx={{ listStyle: 'none', m: 0, p: 0, borderTop: 1, borderColor: 'divider' }}
    >
      {rows.map((r) => (
        <Box component="li" key={r.id} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <ButtonBase
            onClick={() => onSelect(r.id)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 1.5,
              width: '100%',
              px: 2,
              py: 1.5,
              textAlign: 'left',
            }}
          >
            <GuestAvatar name={r.guestName} size={38} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography noWrap sx={{ fontWeight: 600 }}>
                {r.guestName}
              </Typography>
              <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
                {PROPERTY_BY_ID[r.propertyId].name} · {formatStay(r)}
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', justifyItems: 'end', gap: 0.5 }}>
              <Typography sx={{ fontWeight: 700 }}>{formatCurrency(r.total)}</Typography>
              <StatusChip status={r.status} />
            </Box>
          </ButtonBase>
        </Box>
      ))}
    </Box>
  );
}

export default function ReservationsPage() {
  const all = useSelector(selectAllReservations);
  const loadStatus = useSelector(selectLoadStatus);
  const compact = useMediaQuery((theme) => theme.breakpoints.down('sm'), { noSsr: true });

  // Filters live in the URL (?status=pending&q=ana), so a filtered view can be shared as a link.
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const status = params.get('status') ?? 'all';
  const propertyId = params.get('property') ?? 'all';
  const [sortField, sortDirection] = (params.get('sort') ?? DEFAULT_SORT).split(':');
  const dialogOpen = params.get('new') === '1';

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedId, setSelectedId] = useState(null);

  function setParam(key, value, fallback) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (!value || value === fallback) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );
    setPage(0);
  }

  const searched = useMemo(
    () => filterReservations(all, { query, propertyId }),
    [all, query, propertyId],
  );
  const statusCounts = useMemo(() => {
    const counts = { all: searched.length };
    for (const s of STATUSES) counts[s] = searched.filter((r) => r.status === s).length;
    return counts;
  }, [searched]);
  const rows = useMemo(
    () =>
      sortReservations(filterReservations(searched, { status }), {
        field: sortField,
        direction: sortDirection,
      }),
    [searched, status, sortField, sortDirection],
  );

  const lastPage = Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, lastPage);
  const visibleRows = rows.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  function toggleSort(field) {
    const direction = sortField === field && sortDirection === 'desc' ? 'asc' : 'desc';
    setParam('sort', `${field}:${direction}`, DEFAULT_SORT);
  }

  function clearFilters() {
    setParams({}, { replace: true });
    setPage(0);
  }

  function closeDialog(createdId) {
    setParam('new', null);
    if (createdId) setSelectedId(createdId);
  }

  const loading = loadStatus === 'idle' || loadStatus === 'loading';
  const hasFilters = query || status !== 'all' || propertyId !== 'all';

  return (
    <>
      <PageHeader
        title="Reservations"
        subtitle={
          loading ? 'Loading…' : `${all.length} reservations across ${PROPERTIES.length} properties`
        }
        actions={
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => setParam('new', '1')}
          >
            New reservation
          </Button>
        }
      />

      {loadStatus === 'failed' ? (
        <ErrorState />
      ) : (
        <Card>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              p: 2,
              alignItems: 'center',
            }}
          >
            <TextField
              size="small"
              placeholder="Search guest, email or ID"
              value={query}
              onChange={(event) => setParam('q', event.target.value, '')}
              sx={{ flex: '1 1 240px', maxWidth: { sm: 340 } }}
              slotProps={{
                htmlInput: { 'aria-label': 'Search reservations' },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              size="small"
              select
              value={propertyId}
              onChange={(event) => setParam('property', event.target.value, 'all')}
              sx={{ minWidth: 190 }}
              slotProps={{ htmlInput: { 'aria-label': 'Filter by property' } }}
            >
              <MenuItem value="all">All properties</MenuItem>
              {PROPERTIES.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
            {compact && (
              <TextField
                size="small"
                select
                value={`${sortField}:${sortDirection}`}
                onChange={(event) => setParam('sort', event.target.value, DEFAULT_SORT)}
                sx={{ minWidth: 190 }}
                slotProps={{ htmlInput: { 'aria-label': 'Sort reservations' } }}
              >
                {/* A sort chosen via the table headers may not match any option here. */}
                {(SORT_OPTIONS.some((o) => o.value === `${sortField}:${sortDirection}`)
                  ? SORT_OPTIONS
                  : [
                      ...SORT_OPTIONS,
                      { value: `${sortField}:${sortDirection}`, label: 'Custom sort' },
                    ]
                ).map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
            {hasFilters && (
              <Button size="small" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </Box>

          <Box
            role="group"
            aria-label="Filter by status"
            sx={{ display: 'flex', gap: 1, px: 2, pb: 2, overflowX: 'auto' }}
          >
            {['all', ...STATUSES].map((value) => {
              const selected = status === value;
              return (
                <Chip
                  key={value}
                  label={`${value === 'all' ? 'All' : STATUS_LABELS[value]} · ${statusCounts[value] ?? 0}`}
                  onClick={() => setParam('status', value, 'all')}
                  color={selected ? 'primary' : 'default'}
                  variant={selected ? 'filled' : 'outlined'}
                  aria-pressed={selected}
                />
              );
            })}
          </Box>

          {loading && <LinearProgress aria-label="Loading reservations" />}

          {compact ? (
            <ReservationList rows={visibleRows} loading={loading} onSelect={setSelectedId} />
          ) : (
            <TableContainer>
              <Table size="medium" aria-label="Reservations">
                <TableHead>
                  <TableRow>
                    {COLUMNS.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        sortDirection={sortField === column.id ? sortDirection : false}
                        sx={hideBelow(column.hideBelow)}
                      >
                        {column.sortable ? (
                          <TableSortLabel
                            active={sortField === column.id}
                            direction={sortField === column.id ? sortDirection : 'desc'}
                            onClick={() => toggleSort(column.id)}
                          >
                            {column.label}
                          </TableSortLabel>
                        ) : (
                          column.label
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading
                    ? Array.from({ length: 8 }, (_, index) => (
                        <TableRow key={index}>
                          {COLUMNS.map((column) => (
                            <TableCell key={column.id} sx={hideBelow(column.hideBelow)}>
                              <Skeleton variant="text" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : visibleRows.map((r) => (
                        <TableRow
                          key={r.id}
                          hover
                          selected={r.id === selectedId}
                          onClick={() => setSelectedId(r.id)}
                          sx={{ cursor: 'pointer', '&:last-child td': { borderBottom: 0 } }}
                        >
                          <TableCell>
                            {/* A real button for keyboard and screen reader users. */}
                            <Link
                              component="button"
                              type="button"
                              underline="hover"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedId(r.id);
                              }}
                              sx={{ fontWeight: 600 }}
                            >
                              {r.id}
                            </Link>
                            <Typography
                              variant="caption"
                              sx={{ display: 'block', color: 'text.secondary' }}
                            >
                              {formatFullDate(r.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}
                            >
                              <GuestAvatar name={r.guestName} size={34} />
                              <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                                  {r.guestName}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: 'text.secondary',
                                    display: { xs: 'none', sm: 'block' },
                                  }}
                                >
                                  {r.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={hideBelow('md')}>
                            {PROPERTY_BY_ID[r.propertyId].name}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {formatStay(r)}
                            <Typography
                              variant="caption"
                              sx={{ display: 'block', color: 'text.secondary' }}
                            >
                              {formatNights(r.nights)} · {r.guests}{' '}
                              {r.guests === 1 ? 'guest' : 'guests'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={hideBelow('xl')}>{CHANNEL_LABELS[r.channel]}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {formatCurrency(r.total)}
                          </TableCell>
                          <TableCell>
                            <StatusChip status={r.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!loading && rows.length === 0 && (
            <Box sx={{ py: 6, px: 2, textAlign: 'center' }}>
              <SearchOffRounded sx={{ fontSize: 40, color: 'text.secondary' }} />
              <Typography variant="h6" component="p" sx={{ mt: 1 }}>
                No reservations found
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 2 }}>
                Try a different search or clear the filters.
              </Typography>
              <Button variant="outlined" onClick={clearFilters}>
                Clear filters
              </Button>
            </Box>
          )}

          <TablePagination
            component="div"
            count={rows.length}
            page={currentPage}
            onPageChange={(_, next) => setPage(next)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50]}
            sx={{ borderTop: 1, borderColor: 'divider' }}
          />
        </Card>
      )}

      <ReservationDrawer reservationId={selectedId} onClose={() => setSelectedId(null)} />
      <NewReservationDialog open={dialogOpen} onClose={closeDialog} />
    </>
  );
}
