import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';

const ActivityForm = () => {
  const navigate = useNavigate();
  const [activity, setActivity] = useState({ name: '', description: '', trigger: '' });
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Trigger-Optionen von der API abrufen
  useEffect(() => {
    fetch('http://localhost:5001/api/triggers')
      .then(response => response.json())
      .then(data => {
        setTriggers(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Fehler beim Laden der Trigger:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // Änderungen im Formular verarbeiten
  const handleChange = (e) => {
    const { name, value } = e.target;
    setActivity(prev => ({ ...prev, [name]: value }));
  };

  // Aktivität speichern
  const handleSave = () => {
    const url = 'http://localhost:5001/api/activities';
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity)
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        navigate('/activities');
      })
      .catch(error => {
        console.error('Fehler beim Speichern:', error);
        setError(error.message);
      });
  };

  if (loading) return <Typography>Lade Formular...</Typography>;
  if (error) return <Typography>Fehler: {error}</Typography>;

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4">Neue Aktivität erstellen</Typography>

      {/* Einzelnes Auswahlfeld für den Trigger */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Triggered by</InputLabel>
        <Select
          name="trigger"
          value={activity.trigger}
          onChange={handleChange}
        >
          <MenuItem value="">Kein Trigger</MenuItem>
          {triggers.map(trigger => (
            <MenuItem key={trigger._id} value={trigger._id}>
              {trigger.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Weitere Felder */}
      <TextField
        label="Name (eindeutig)"
        name="name"
        value={activity.name}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mt: 2 }}
      />
      <TextField
        label="Beschreibung"
        name="description"
        value={activity.description}
        onChange={handleChange}
        fullWidth
        multiline
        rows={4}
        sx={{ mt: 2 }}
      />

      {/* Buttons */}
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" onClick={handleSave}>Speichern</Button>
        <Button variant="outlined" onClick={() => navigate('/activities')} sx={{ ml: 2 }}>Zurück</Button>
      </Box>
    </Box>
  );
};

export default ActivityForm;