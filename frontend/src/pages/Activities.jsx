import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableHead, TableBody, TableRow, TableCell, TableSortLabel, TextField, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [roles, setRoles] = useState([]); // Für die Rolleninformationen
  const [workProducts, setWorkProducts] = useState([]); // Für Work Products
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [filter, setFilter] = useState('');
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [editedActivity, setEditedActivity] = useState({ name: '', description: '', executedBy: '', result: '', abbreviation: '', multiplicator: 1, workMode: '0', timeIfKnown: '', timeIfNew: '', versionMajor: 1, versionMinor: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [activitiesResponse, rolesResponse, workProductsResponse] = await Promise.all([
        fetch('http://localhost:5001/api/activities'),
        fetch('http://localhost:5001/api/roles'),
        fetch('http://localhost:5001/api/work-products'),
      ]);

      if (!activitiesResponse.ok) {
        throw new Error(`Fehler beim Laden von Aktivitäten: Status ${activitiesResponse.status} - ${await activitiesResponse.text()}`);
      }
      if (!rolesResponse.ok) {
        throw new Error(`Fehler beim Laden von Rollen: Status ${rolesResponse.status} - ${await rolesResponse.text()}`);
      }
      if (!workProductsResponse.ok) {
        throw new Error(`Fehler beim Laden von Work Products: Status ${workProductsResponse.status} - ${await workProductsResponse.text()}`);
      }

      const activitiesData = await activitiesResponse.json();
      const rolesData = await rolesResponse.json();
      const workProductsData = await workProductsResponse.json();

      console.log('Geladene Aktivitäten:', activitiesData);
      console.log('Geladene Rollen:', rolesData);
      console.log('Geladene Work Products:', workProductsData);

      setActivities(activitiesData || []);
      setRoles(rolesData || []);
      setWorkProducts(workProductsData || []);
    } catch (error) {
      console.error('Fehler beim Abrufen der Daten:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleEdit = (activity) => {
    setSelectedActivity(activity);
    setEditedActivity({
      name: activity.name || '',
      description: activity.description || '',
      executedBy: activity.executedBy?._id || activity.executedBy || '',
      result: activity.result?._id || activity.result || '',
      abbreviation: activity.abbreviation || '', // Füge abbreviation hinzu
      multiplicator: activity.multiplicator || 1,
      workMode: activity.workMode || '0',
      timeIfKnown: activity.timeIfKnown || '',
      timeIfNew: activity.timeIfNew || '',
      versionMajor: activity.versionMajor || 1,
      versionMinor: activity.versionMinor || 0
    });
    setOpenEdit(true);
  };

  const handleDelete = (activityId) => {
    fetch(`http://localhost:5001/api/activities/${activityId}`, { method: 'DELETE' })
      .then(response => {
        if (!response.ok) throw new Error(`Fehler beim Löschen: Status ${response.status} - ${response.statusText}`);
        setActivities(activities.filter(a => a._id !== activityId));
      })
      .catch(error => console.error('Fehler beim Löschen der Aktivität:', error));
  };

  const handleSaveEdit = () => {
    fetch(`http://localhost:5001/api/activities/${selectedActivity._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...editedActivity,
        versionMinor: editedActivity.versionMinor + 1 // Inkrementiere Minor-Version
      }),
    })
      .then(response => {
        if (!response.ok) throw new Error(`Fehler beim Bearbeiten: Status ${response.status} - ${response.statusText}`);
        return response.json();
      })
      .then(data => {
        setActivities(activities.map(a => a._id === data._id ? data : a));
        setOpenEdit(false);
        setSelectedActivity(null);
        setEditedActivity({ name: '', description: '', executedBy: '', result: '', abbreviation: '', multiplicator: 1, workMode: '0', timeIfKnown: '', timeIfNew: '', versionMajor: 1, versionMinor: 0 });
      })
      .catch(error => console.error('Fehler beim Bearbeiten der Aktivität:', error));
  };

  const sortedAndFilteredActivities = activities
    .filter(activity => (activity.name || '').toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => {
      if (orderBy === 'executedBy') {
        const roleA = roles.find(r => r._id.toString() === (a.executedBy?._id || a.executedBy));
        const roleB = roles.find(r => r._id.toString() === (b.executedBy?._id || b.executedBy));
        return order === 'asc' ? (roleA?.name || '').localeCompare(roleB?.name || '') : (roleB?.name || '').localeCompare(roleA?.name || '');
      }
      return order === 'asc' ? (a[orderBy] || '').localeCompare(b[orderBy] || '') : (b[orderBy] || '').localeCompare(a[orderBy] || '');
    });

  if (loading) return <Typography>Lade Aktivitäten...</Typography>;
  if (error) return <Typography>Fehler: {error}</Typography>;

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>Aktivitäten</Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Filter (Name)"
          value={filter}
          onChange={handleFilterChange}
          variant="outlined"
          size="small"
          sx={{ mr: 2 }}
        />
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'name'}
                direction={orderBy === 'name' ? order : 'asc'}
                onClick={() => handleRequestSort('name')}
              >
                Name
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'executedBy'}
                direction={orderBy === 'executedBy' ? order : 'asc'}
                onClick={() => handleRequestSort('executedBy')}
              >
                Erstellt von Rolle
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'result'}
                direction={orderBy === 'result' ? order : 'asc'}
                onClick={() => handleRequestSort('result')}
              >
                Ergebnis (Work Product)
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'abbreviation'}
                direction={orderBy === 'abbreviation' ? order : 'asc'}
                onClick={() => handleRequestSort('abbreviation')}
              >
                Abkürzung
              </TableSortLabel>
            </TableCell>
            <TableCell>Aktionen</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedAndFilteredActivities.map(activity => (
            <TableRow key={activity._id}>
              <TableCell>{activity.name || 'Kein Name'}</TableCell>
              <TableCell>{roles.find(r => r._id.toString() === (activity.executedBy?._id || activity.executedBy))?.name || 'Keine Rolle'}</TableCell>
              <TableCell>{workProducts.find(w => w._id.toString() === (activity.result?._id || activity.result))?.name || 'Kein Work Product'}</TableCell>
              <TableCell>{activity.abbreviation || 'Keine Abkürzung'}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleEdit(activity)} aria-label="Bearbeiten">
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(activity._id)} aria-label="Löschen">
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Overlay für Bearbeiten */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Aktivität bearbeiten</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={editedActivity.name}
            onChange={(e) => setEditedActivity({ ...editedActivity, name: e.target.value })}
            variant="outlined"
            size="small"
            sx={{ mr: 2, mb: 2, width: '100%' }}
          />
          <TextField
            label="Beschreibung"
            value={editedActivity.description}
            onChange={(e) => setEditedActivity({ ...editedActivity, description: e.target.value })}
            variant="outlined"
            size="small"
            multiline
            rows={2}
            sx={{ mr: 2, mb: 2, width: '100%' }}
          />
          <FormControl sx={{ mr: 2, mb: 2, width: '100%' }}>
            <InputLabel>Rolle</InputLabel>
            <Select
              value={editedActivity.executedBy || ''}
              onChange={(e) => setEditedActivity({ ...editedActivity, executedBy: e.target.value })}
              size="small"
            >
              <MenuItem value="">Keine</MenuItem>
              {roles.map(role => (
                <MenuItem key={role._id} value={role._id}>{role.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ mr: 2, mb: 2, width: '100%' }}>
            <InputLabel>Ergebnis (Work Product)</InputLabel>
            <Select
              value={editedActivity.result || ''}
              onChange={(e) => setEditedActivity({ ...editedActivity, result: e.target.value })}
              size="small"
            >
              <MenuItem value="">Keine</MenuItem>
              {workProducts.map(wp => (
                <MenuItem key={wp._id} value={wp._id}>{wp.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Abkürzung"
            value={editedActivity.abbreviation}
            onChange={(e) => setEditedActivity({ ...editedActivity, abbreviation: e.target.value })}
            variant="outlined"
            size="small"
            sx={{ mr: 2, mb: 2, width: '100%' }}
          />
          <TextField
            label="Multiplikator"
            type="number"
            value={editedActivity.multiplicator}
            onChange={(e) => setEditedActivity({ ...editedActivity, multiplicator: Number(e.target.value) })}
            variant="outlined"
            size="small"
            sx={{ mr: 2, mb: 2, width: '100%' }}
          />
          <FormControl sx={{ mr: 2, mb: 2, width: '100%' }}>
            <InputLabel>Work Mode</InputLabel>
            <Select
              value={editedActivity.workMode}
              onChange={(e) => setEditedActivity({ ...editedActivity, workMode: e.target.value })}
              size="small"
            >
              <MenuItem value="0">Einer</MenuItem>
              <MenuItem value="1">Jeder</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Zeit (bekannt)"
            value={editedActivity.timeIfKnown}
            onChange={(e) => setEditedActivity({ ...editedActivity, timeIfKnown: e.target.value })}
            variant="outlined"
            size="small"
            sx={{ mr: 2, mb: 2, width: '100%' }}
          />
          <TextField
            label="Zeit (geschätzt)"
            value={editedActivity.timeIfNew}
            onChange={(e) => setEditedActivity({ ...editedActivity, timeIfNew: e.target.value })}
            variant="outlined"
            size="small"
            sx={{ mr: 2, mb: 2, width: '100%' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Abbrechen</Button>
          <Button onClick={handleSaveEdit} variant="contained">Speichern</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Activities;