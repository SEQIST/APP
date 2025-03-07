import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, RadioGroup, FormControlLabel, Radio, Select, MenuItem, IconButton, Typography } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const TriggerEdit = ({ updateTrigger }) => {
  const { triggerId } = useParams();
  const navigate = useNavigate();
  const [trigger, setTrigger] = useState(null);
  const [workProducts, setWorkProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('TriggerEdit aufgerufen mit ID:', triggerId); // Debugging
    const fetchData = async () => {
      try {
        const [triggerResponse, workProductsResponse] = await Promise.all([
          fetch(`http://localhost:5001/api/triggers/${triggerId}`).then(r => {
            if (!r.ok) throw new Error(`Trigger nicht gefunden (Status: ${r.status})`);
            return r.json();
          }),
          fetch('http://localhost:5001/api/workproducts').then(r => {
            if (!r.ok) throw new Error('WorkProducts nicht gefunden');
            return r.json();
          })
        ]);
        setTrigger(triggerResponse);
        setWorkProducts(workProductsResponse || []);
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [triggerId]);

  const handleWorkProductChange = (index, value) => {
    const newWorkProducts = [...trigger.workProducts];
    newWorkProducts[index].workProduct = value;
    setTrigger({ ...trigger, workProducts: newWorkProducts });
  };

  const handleCompletenessChange = (index, value) => {
    const newWorkProducts = [...trigger.workProducts];
    newWorkProducts[index].completeness = value;
    setTrigger({ ...trigger, workProducts: newWorkProducts });
  };

  const handleAndOrChange = (value) => {
    setTrigger({ ...trigger, andOr: value });
  };

  const handleTimeTriggerUnitChange = (value) => {
    setTrigger({ ...trigger, timeTrigger: { ...trigger.timeTrigger, unit: value } });
  };

  const handleTimeTriggerValueChange = (value) => {
    setTrigger({ ...trigger, timeTrigger: { ...trigger.timeTrigger, value: Number(value) } });
  };

  const handleTimeTriggerRepetitionChange = (value) => {
    setTrigger({ ...trigger, timeTrigger: { ...trigger.timeTrigger, repetition: value } });
  };

  const handleWorkloadLoadChange = (value) => {
    setTrigger({ ...trigger, workloadLoad: value });
  };

  const addNewWorkProduct = () => {
    setTrigger({
      ...trigger,
      workProducts: [...trigger.workProducts, { workProduct: '', completeness: '' }],
    });
  };

  const removeWorkProduct = (index) => {
    const newWorkProducts = trigger.workProducts.filter((_, i) => i !== index);
    setTrigger({ ...trigger, workProducts: newWorkProducts });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      trigger.workProducts.some(wp => !wp.workProduct || !wp.completeness) ||
      !trigger.timeTrigger.value ||
      !trigger.workloadLoad
    ) {
      alert('Bitte fülle alle erforderlichen Felder aus.');
      return;
    }

    updateTrigger(triggerId, trigger);
    navigate('/trigger-list');
  };

  if (loading) return <Typography>Lade Trigger...</Typography>;
  if (error) return <Typography>Fehler: {error}</Typography>;
  if (!trigger) return <Typography>Trigger nicht gefunden</Typography>;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ backgroundColor: '#f5f5f9', borderRadius: 2, padding: 2, maxWidth: 800, margin: '20px auto' }}>
      <Typography variant="h5" sx={{ color: '#4a4a7a', mb: 2 }}>Trigger bearbeiten</Typography>

      <Typography variant="h6">Arbeitsprodukte</Typography>
      {trigger.workProducts.map((wp, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 1, backgroundColor: '#fff', borderRadius: 1 }}>
          <Select
            value={wp.workProduct}
            onChange={(e) => handleWorkProductChange(index, e.target.value)}
            displayEmpty
            fullWidth
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="" disabled>Arbeitsprodukt auswählen</MenuItem>
            {workProducts.map((product) => (
              <MenuItem key={product._id} value={product._id}>{product.name}</MenuItem>
            ))}
          </Select>
          <TextField
            label="Fertigstellungsgrad (%)"
            value={wp.completeness}
            onChange={(e) => handleCompletenessChange(index, e.target.value)}
            type="number"
            inputProps={{ min: 0, max: 100 }}
            fullWidth
            sx={{ minWidth: 150 }}
          />
          {index > 0 && (
            <IconButton onClick={() => removeWorkProduct(index)} color="error">
              <Delete />
            </IconButton>
          )}
        </Box>
      ))}
      <Button onClick={addNewWorkProduct} variant="outlined" startIcon={<Add />} sx={{ mb: 2 }}>
        Arbeitsprodukt hinzufügen
      </Button>

      <Typography variant="h6">Verknüpfung</Typography>
      <RadioGroup row value={trigger.andOr} onChange={(e) => handleAndOrChange(e.target.value)}>
        <FormControlLabel value="AND" control={<Radio />} label="UND" />
        <FormControlLabel value="OR" control={<Radio />} label="ODER" />
      </RadioGroup>

      <Typography variant="h6">Zeit-Trigger</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Wert"
          value={trigger.timeTrigger.value}
          onChange={(e) => handleTimeTriggerValueChange(e.target.value)}
          type="number"
          fullWidth
          sx={{ maxWidth: 150 }}
        />
        <Select
          value={trigger.timeTrigger.unit}
          onChange={(e) => handleTimeTriggerUnitChange(e.target.value)}
          fullWidth
          sx={{ maxWidth: 150 }}
        >
          <MenuItem value="sec">Sekunden</MenuItem>
          <MenuItem value="min">Minuten</MenuItem>
          <MenuItem value="hour">Stunden</MenuItem>
          <MenuItem value="day">Tage</MenuItem>
          <MenuItem value="week">Wochen</MenuItem>
          <MenuItem value="month">Monate</MenuItem>
          <MenuItem value="year">Jahre</MenuItem>
        </Select>
        <TextField
          label="Wiederholung (optional)"
          value={trigger.timeTrigger.repetition}
          onChange={(e) => handleTimeTriggerRepetitionChange(e.target.value)}
          fullWidth
          placeholder="z. B. jeder erste Montag"
        />
      </Box>

      <Typography variant="h6">Arbeitslast bestimmendes Produkt</Typography>
      <Select
        value={trigger.workloadLoad}
        onChange={(e) => handleWorkloadLoadChange(e.target.value)}
        displayEmpty
        fullWidth
        sx={{ mb: 2 }}
      >
        <MenuItem value="" disabled>Arbeitsprodukt auswählen</MenuItem>
        {workProducts.map((product) => (
          <MenuItem key={product._id} value={product._id}>{product.name}</MenuItem>
        ))}
      </Select>

      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
        Speichern
      </Button>
    </Box>
  );
};

export default TriggerEdit;