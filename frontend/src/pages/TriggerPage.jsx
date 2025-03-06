import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, Radio, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const TriggerPage = () => {
  const navigate = useNavigate();
  const [triggers, setTriggers] = useState([]);
  const [workProducts, setWorkProducts] = useState([]); // Zustand für Work Products
  const [newTrigger, setNewTrigger] = useState({
    workProduct: '', // Work Product als String (ObjectId)
    completionGrade: 0, // Prozentwert für Completion Grade
  });
  const [selectedTrigger, setSelectedTrigger] = useState(''); // Für Radio-Selection
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [triggersResponse, workProductsResponse] = await Promise.all([
          fetch('http://localhost:5001/api/triggers').then(r => r.json()),
          fetch('http://localhost:5001/api/work-products').then(r => r.json()),
        ]);
        setTriggers(triggersResponse || []);
        setWorkProducts(workProductsResponse || []);
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddTrigger = () => {
    fetch('http://localhost:5001/api/triggers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workProduct: newTrigger.workProduct,
        completionGrade: parseInt(newTrigger.completionGrade, 10), // Sicherstellen, dass es eine Zahl ist
      }),
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        setTriggers(prev => [...prev, data]);
        setNewTrigger({ workProduct: '', completionGrade: 0 });
        setSelectedTrigger(''); // Zurücksetzen der Auswahl nach Hinzufügen
      })
      .catch(error => {
        console.error('Fehler beim Hinzufügen:', error);
        setError(error.message);
      });
  };

  const handleSave = () => {
    if (!selectedTrigger) {
      setError('Bitte wählen Sie einen Trigger aus.');
      return;
    }
    // Hier können Sie Logik für das Speichern des ausgewählten Triggers hinzufügen, z. B. eine API-Anfrage
    console.log('Gespeicherter Trigger:', triggers.find(t => t._id === selectedTrigger));
    setError(null); // Zurücksetzen des Fehlers nach erfolgreichem Speichern
  };

  const handleSelectTrigger = (triggerId) => {
    setSelectedTrigger(triggerId);
  };

  if (loading) return <Typography>Lade Trigger...</Typography>;
  if (error) return <Typography>Fehler: {error}</Typography>;

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4">Trigger Verwaltung</Typography>
      
      {/* Formular zum Hinzufügen eines neuen Triggers */}
      <Box sx={{ mt: 2, mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 8, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom>Neuen Trigger hinzufügen</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Work Product</InputLabel>
          <Select
            name="workProduct"
            value={newTrigger.workProduct}
            onChange={(e) => setNewTrigger({ ...newTrigger, workProduct: e.target.value })}
          >
            <MenuItem value="">Kein Work Product</MenuItem>
            {workProducts.map(product => (
              <MenuItem key={product._id} value={product._id.toString()}>{product.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Completion Grade (%)"
          name="completionGrade"
          type="number"
          value={newTrigger.completionGrade}
          onChange={(e) => setNewTrigger({ ...newTrigger, completionGrade: e.target.value })}
          inputProps={{ min: 0, max: 100 }}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={handleAddTrigger}>Hinzufügen</Button>
          <Button variant="contained" onClick={handleSave} sx={{ backgroundColor: '#1976d2', color: '#fff' }}>Sichern</Button>
        </Box>
      </Box>

      {/* Liste der bestehenden Trigger */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Bestehende Trigger</Typography>
        <List>
          {triggers.length === 0 ? (
            <Typography>Keine Trigger gefunden.</Typography>
          ) : (
            triggers.map(trigger => {
              const workProduct = workProducts.find(wp => wp._id.toString() === trigger.workProduct?.toString()) || {};
              return (
                <ListItem
                  key={trigger._id}
                  sx={{
                    borderBottom: '1px solid #ddd',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                  }}
                >
                  <Radio
                    checked={selectedTrigger === trigger._id.toString()}
                    onChange={() => handleSelectTrigger(trigger._id.toString())}
                    value={trigger._id.toString()}
                    name="trigger-selection"
                    sx={{ mr: 2 }}
                  />
                  <ListItemText
                    primary={workProduct.name || 'Kein Work Product'}
                    secondary={`Completion Grade: ${trigger.completionGrade || 0}%`}
                    sx={{ color: '#5d5d5d' }}
                  />
                </ListItem>
              );
            })
          )}
        </List>
      </Box>
    </Box>
  );
};

export default TriggerPage;