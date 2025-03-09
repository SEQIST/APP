import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Typography } from '@mui/material';
import { Delete } from '@mui/icons-material';

const WorkProductsTab = ({ process, setProcess }) => {
  const [workProducts, setWorkProducts] = useState([]);
  const [newEntry, setNewEntry] = useState({ workProductId: '', known: '', unknown: '' });

  useEffect(() => {
    fetch('http://localhost:5001/api/workproducts')
      .then(r => r.json())
      .then(data => setWorkProducts(data || []));
    setNewEntry({ workProductId: '', known: '', unknown: '' }); // Reset bei Mount
  }, []);

  const handleAdd = () => {
    if (!newEntry.workProductId || (!newEntry.known && !newEntry.unknown)) {
      alert('Mindestens ein Wert (bekannt oder unbekannt) muss angegeben werden.');
      return;
    }
    if ((newEntry.known && Number(newEntry.known) <= 0) || (newEntry.unknown && Number(newEntry.unknown) <= 0)) {
      alert('Werte müssen größer als 0 sein.');
      return;
    }
    const updatedWorkProducts = [
      ...(process.workProducts || []),
      { workProductId: newEntry.workProductId, known: Number(newEntry.known) || 0, unknown: Number(newEntry.unknown) || 0 }
    ];
    setProcess({ ...process, workProducts: updatedWorkProducts });
    setNewEntry({ workProductId: '', known: '', unknown: '' });
  };

  const handleDelete = (index) => {
    const updatedWorkProducts = (process.workProducts || []).filter((_, i) => i !== index);
    setProcess({ ...process, workProducts: updatedWorkProducts });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/processes/${process._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workProducts: process.workProducts }),
      });
      if (!response.ok) throw new Error('Fehler beim Speichern');
      const updatedProcess = await response.json();
      setProcess(updatedProcess);
      alert('Work Products erfolgreich gespeichert');
    } catch (error) {
      console.error('Fehler:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', mb: 2 }}>
        <FormControl sx={{ mr: 1, width: 200 }}>
          <InputLabel>Work Product</InputLabel>
          <Select
            value={newEntry.workProductId}
            onChange={(e) => setNewEntry({ ...newEntry, workProductId: e.target.value })}
            label="Work Product"
          >
            <MenuItem value="">Auswählen</MenuItem>
            {workProducts.map(wp => (
              <MenuItem key={wp._id} value={wp._id}>{wp.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Bekannt"
          type="number"
          value={newEntry.known}
          onChange={(e) => setNewEntry({ ...newEntry, known: e.target.value })}
          sx={{ mr: 1, width: 100 }}
          inputProps={{ min: 0 }}
        />
        <TextField
          label="Unbekannt"
          type="number"
          value={newEntry.unknown}
          onChange={(e) => setNewEntry({ ...newEntry, unknown: e.target.value })}
          sx={{ mr: 1, width: 100 }}
          inputProps={{ min: 0 }}
        />
        <Button variant="contained" onClick={handleAdd}>Hinzufügen</Button>
      </Box>
      {(process.workProducts || []).map((entry, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography sx={{ mr: 2, width: 200 }}>
            {workProducts.find(wp => wp._id === entry.workProductId)?.name || 'Unbekannt'}
          </Typography>
          <Typography sx={{ mr: 2, width: 100 }}>Bekannt: {entry.known}</Typography>
          <Typography sx={{ mr: 2, width: 100 }}>Unbekannt: {entry.unknown}</Typography>
          <IconButton onClick={() => handleDelete(index)}><Delete /></IconButton>
        </Box>
      ))}
      <Button variant="contained" onClick={handleSave}>Speichern</Button>
    </Box>
  );
};

export default WorkProductsTab;