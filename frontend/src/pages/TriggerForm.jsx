import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, IconButton, List, ListItem, Checkbox, TextField } from '@mui/material';
import { Delete } from '@mui/icons-material';

const TriggerForm = ({ activityId, onClose, activities, workProducts }) => {
  const [trigger, setTrigger] = useState({ workProducts: [], determiningFactorId: null });
  const [currentActivity, setCurrentActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTriggerData = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/activities/${activityId}`);
        if (!response.ok) throw new Error('Aktivität nicht gefunden');
        const data = await response.json();
        setCurrentActivity(data);
        setTrigger({
          workProducts: data.trigger?.workProducts?.map(wp => ({
            _id: wp._id?._id || wp._id,
            completionPercentage: wp.completionPercentage || 0,
            isDeterminingFactor: wp.isDeterminingFactor || false,
          })) || [],
          determiningFactorId: data.trigger?.determiningFactorId || null,
        });
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Trigger-Daten:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    if (activityId) fetchTriggerData();
  }, [activityId]);

  const getAvailableWorkProducts = () => {
    const currentResultId = currentActivity?.result?._id || currentActivity?.result;

    // Nur das Work Product ausschließen, das diese Aktivität als Ergebnis produziert
    return workProducts.filter(wp => {
      const wpId = wp._id.toString();
      return wpId !== currentResultId?.toString();
    });
  };

  const handleAddWorkProduct = (workProductId) => {
    const existingWorkProduct = trigger.workProducts.find(wp => wp._id.toString() === workProductId.toString());
    if (!existingWorkProduct) {
      const newWorkProduct = {
        _id: workProductId,
        completionPercentage: 0,
        isDeterminingFactor: !trigger.determiningFactorId,
      };
      const updatedWorkProducts = [...trigger.workProducts, newWorkProduct];
      setTrigger({
        ...trigger,
        workProducts: updatedWorkProducts,
        determiningFactorId: trigger.determiningFactorId || workProductId,
      });
    }
  };

  const handleUpdateCompletion = (workProductId, percentage) => {
    const updatedWorkProducts = trigger.workProducts.map(wp =>
      wp._id.toString() === workProductId.toString()
        ? { ...wp, completionPercentage: Math.min(100, Math.max(0, Number(percentage))) }
        : wp
    );
    setTrigger({ ...trigger, workProducts: updatedWorkProducts });
  };

  const handleSetDeterminingFactor = (workProductId) => {
    const updatedWorkProducts = trigger.workProducts.map(wp => ({
      ...wp,
      isDeterminingFactor: wp._id.toString() === workProductId.toString(),
    }));
    setTrigger({
      ...trigger,
      workProducts: updatedWorkProducts,
      determiningFactorId: workProductId,
    });
  };

  const handleRemoveWorkProduct = (workProductId) => {
    const updatedWorkProducts = trigger.workProducts.filter(wp => wp._id.toString() !== workProductId.toString());
    let newDeterminingFactorId = trigger.determiningFactorId;
    if (trigger.determiningFactorId?.toString() === workProductId.toString()) {
      newDeterminingFactorId = updatedWorkProducts.length > 0 ? updatedWorkProducts[0]._id : null;
      if (newDeterminingFactorId) {
        updatedWorkProducts[0].isDeterminingFactor = true;
      }
    }
    setTrigger({
      ...trigger,
      workProducts: updatedWorkProducts,
      determiningFactorId: newDeterminingFactorId,
    });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/activities/${activityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP-Fehler! Status: ${response.status} - ${errorData.error || 'Unbekannter Fehler'}`);
      }
      onClose();
    } catch (error) {
      console.error('Fehler beim Speichern der Trigger:', error);
      setError(error.message);
    }
  };

  if (loading) return <Typography>Lade Trigger...</Typography>;
  if (error) return <Typography>Fehler: {error}</Typography>;

  const availableWorkProducts = getAvailableWorkProducts();

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>Trigger bearbeiten</Typography>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Work Product hinzufügen</InputLabel>
        <Select
          value=""
          onChange={(e) => handleAddWorkProduct(e.target.value)}
          label="Work Product hinzufügen"
        >
          <MenuItem value="">Keins</MenuItem>
          {availableWorkProducts
            .filter(wp => !trigger.workProducts.some(tp => tp._id.toString() === wp._id.toString()))
            .map(wp => (
              <MenuItem key={wp._id} value={wp._id}>{wp.name}</MenuItem>
            ))}
        </Select>
      </FormControl>
      <List>
        {trigger.workProducts.map(wp => (
          <ListItem key={wp._id.toString()} sx={{ alignItems: 'center' }}>
            <Typography sx={{ mr: 2, minWidth: 150 }}>
              {workProducts.find(w => w._id.toString() === wp._id.toString())?.name || 'Unbekannt'}
            </Typography>
            <TextField
              type="number"
              label="Fertigstellungsgrad (%)"
              value={wp.completionPercentage}
              onChange={(e) => handleUpdateCompletion(wp._id, e.target.value)}
              sx={{ mr: 2, width: 100 }}
              inputProps={{ min: 0, max: 100 }}
            />
            <Checkbox
              checked={wp.isDeterminingFactor}
              onChange={() => handleSetDeterminingFactor(wp._id)}
            />
            <Typography sx={{ mr: 2 }}>Bestimmender Faktor</Typography>
            <IconButton onClick={() => handleRemoveWorkProduct(wp._id)}>
              <Delete />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" onClick={handleSave} sx={{ mr: 2 }}>Speichern</Button>
        <Button variant="outlined" onClick={onClose}>Abbrechen</Button>
      </Box>
    </Box>
  );
};

export default TriggerForm;