import React, { useState, useEffect } from 'react';
import { List, ListItem, TextField, Button, Box, Typography, IconButton, Modal, FormControl, InputLabel, Select, MenuItem, Badge } from '@mui/material';
import { Edit, Delete, FlashOn } from '@mui/icons-material';
import ActivityForm from './ActivityForm';
import TriggerForm from './TriggerForm';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [workProducts, setWorkProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('name'); // Standard-Sortierung nach Name

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5001/api/activities').then(r => r.json()),
      fetch('http://localhost:5001/api/processes').then(r => r.json()),
      fetch('http://localhost:5001/api/workproducts').then(r => r.json()),
    ])
      .then(([activitiesData, processesData, workProductsData]) => {
        setActivities(activitiesData || []);
        setProcesses(processesData || []);
        setWorkProducts(workProductsData || []);
      })
      .catch(error => console.error('Fehler beim Laden der Daten:', error));
  }, []);

  const handleOpenActivityModal = (activityId = null) => {
    setSelectedActivityId(activityId);
    setOpenActivityModal(true);
  };

  const handleOpenTriggerModal = (activityId) => {
    setSelectedActivityId(activityId);
    setOpenTriggerModal(true);
  };

  const handleCloseActivityModal = () => {
    setOpenActivityModal(false);
    setSelectedActivityId(null);
    refreshActivities();
  };

  const handleCloseTriggerModal = () => {
    setOpenTriggerModal(false);
    setSelectedActivityId(null);
    refreshActivities();
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:5001/api/activities/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        setActivities(activities.filter(activity => activity._id !== id));
      })
      .catch(error => console.error('Fehler beim Löschen der Aktivität:', error));
  };

  const refreshActivities = () => {
    fetch('http://localhost:5001/api/activities')
      .then(r => r.json())
      .then(data => setActivities(data || []))
      .catch(error => console.error('Fehler beim Aktualisieren der Aktivitäten:', error));
  };

  // Filter- und Sortierlogik
  const filteredAndSortedActivities = activities
    .filter(activity => 
      activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.abbreviation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (processes.find(p => p._id === (activity.process?._id || activity.process))?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (workProducts.find(wp => wp._id === (activity.result?._id || activity.result))?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'abbreviation':
          return a.abbreviation.localeCompare(b.abbreviation);
        case 'process':
          const processA = processes.find(p => p._id === (a.process?._id || a.process))?.name || '';
          const processB = processes.find(p => p._id === (b.process?._id || b.process))?.name || '';
          return processA.localeCompare(processB);
        case 'result':
          const resultA = workProducts.find(wp => wp._id === (a.result?._id || a.result))?.name || '';
          const resultB = workProducts.find(wp => wp._id === (b.result?._id || b.result))?.name || '';
          return resultA.localeCompare(resultB);
        default:
          return 0;
      }
    });

  const [openActivityModal, setOpenActivityModal] = useState(false);
  const [openTriggerModal, setOpenTriggerModal] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState(null);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>Aktivitäten</Typography>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <TextField
          label="Suche"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mr: 2, width: 300 }}
          placeholder="Nach Name, Abkürzung, Prozess oder Work Product suchen"
        />
        <FormControl sx={{ width: 200 }}>
          <InputLabel>Sortieren nach</InputLabel>
          <Select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            label="Sortieren nach"
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="abbreviation">Abkürzung</MenuItem>
            <MenuItem value="process">Prozess</MenuItem>
            <MenuItem value="result">Work Product</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={() => handleOpenActivityModal()} sx={{ ml: 2 }}>
          Neue Aktivität
        </Button>
      </Box>
      <List>
        {filteredAndSortedActivities.length > 0 ? (
          filteredAndSortedActivities.map(activity => (
            <ListItem key={activity._id}>
              <IconButton onClick={() => handleOpenTriggerModal(activity._id)} sx={{ mr: 4 }}>
                <Badge badgeContent={activity.trigger?.workProducts?.length || 0} color="primary">
                  <FlashOn sx={{ color: activity.trigger?.workProducts?.length > 0 ? 'green' : 'grey' }} />
                </Badge>
              </IconButton>
              <Typography sx={{ mr: 2, width: 150 }}>{activity.name}</Typography>
              <Typography sx={{ mr: 2, width: 150 }}>{activity.abbreviation}</Typography>
              <Typography sx={{ mr: 2, width: 200 }}>
                {processes.find(p => p._id === (activity.process?._id || activity.process))?.name || 'Keiner'}
              </Typography>
              <Typography sx={{ mr: 2, width: 200 }}>
                {workProducts.find(wp => wp._id === (activity.result?._id || activity.result))?.name || 'Keins'}
              </Typography>
              <IconButton onClick={() => handleOpenActivityModal(activity._id)}><Edit /></IconButton>
              <IconButton onClick={() => handleDelete(activity._id)}><Delete /></IconButton>
            </ListItem>
          ))
        ) : (
          <Typography>Keine Aktivitäten gefunden</Typography>
        )}
      </List>

      <Modal open={openActivityModal} onClose={handleCloseActivityModal}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, minWidth: 400 }}>
          <ActivityForm activityId={selectedActivityId} onClose={handleCloseActivityModal} activities={activities} />
        </Box>
      </Modal>

      <Modal open={openTriggerModal} onClose={handleCloseTriggerModal}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, minWidth: 400 }}>
          <TriggerForm activityId={selectedActivityId} onClose={handleCloseTriggerModal} activities={activities} workProducts={workProducts} />
        </Box>
      </Modal>
    </Box>
  );
};

export default Activities;