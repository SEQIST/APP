import React, { useState } from 'react';
import { Box, TextField, Button, Drawer } from '@mui/material';
import ProcessFlowintern from './ProcessFlowintern';
import ActivityForm from './ActivityForm';

const ProcessDetailsTab = ({ process, setProcess, activities, setActivities }) => {
  const [selectedActivityId, setSelectedActivityId] = useState(null);

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/processes/${process._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: process.name, abbreviation: process.abbreviation }),
      });
      if (!response.ok) throw new Error('Fehler beim Speichern');
      const updatedProcess = await response.json();
      setProcess(updatedProcess);
      alert('Prozess erfolgreich aktualisiert');
    } catch (error) {
      console.error('Fehler:', error);
    }
  };

  const handleNodeClick = (event, node) => {
    setSelectedActivityId(node.id);
  };

  const handleCloseDrawer = () => {
    setSelectedActivityId(null);
  };

  const handleActivityUpdate = (updatedActivity) => {
    const updatedActivities = activities.map(a =>
      a._id === updatedActivity._id ? updatedActivity : a
    );
    setActivities(updatedActivities);
    handleCloseDrawer();
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Name"
          value={process.name || ''}
          onChange={(e) => setProcess({ ...process, name: e.target.value })}
          sx={{ mr: 2, mb: 2 }}
        />
        <TextField
          label="Abkürzung"
          value={process.abbreviation || ''}
          onChange={(e) => setProcess({ ...process, abbreviation: e.target.value })}
          sx={{ mr: 2, mb: 2 }}
        />
        <TextField
          label="Prozessgruppe"
          value={process.processGroup?.name || 'Keine Prozessgruppe'}
          disabled
          sx={{ mr: 2, mb: 2 }}
        />
        <TextField
          label="Eigentümer"
          value={process.owner?.name || 'Kein Eigentümer'}
          disabled
          sx={{ mr: 2, mb: 2 }}
        />
        <Button variant="contained" onClick={handleSave}>Speichern</Button>
      </Box>
      <ProcessFlowintern activities={activities} onNodeClick={handleNodeClick} />
      <Drawer
        anchor="right"
        open={!!selectedActivityId}
        onClose={handleCloseDrawer}
        sx={{ width: 400, '& .MuiDrawer-paper': { width: 400 } }}
      >
        <Box sx={{ p: 2 }}>
          {selectedActivityId && (
            <ActivityForm
              activityId={selectedActivityId}
              onClose={handleCloseDrawer}
              onSave={handleActivityUpdate} // Hier korrekt übergeben
              activities={activities}
            />
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default ProcessDetailsTab;