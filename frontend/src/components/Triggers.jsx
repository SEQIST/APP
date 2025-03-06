import React, { useState } from 'react';
import { Box, TextField, FormControl, InputLabel, Select, MenuItem, Button, Typography } from '@mui/material';
import ReactQuill from 'react-quill'; // Für Rich-Text-Beschreibungsfeld

const Triggers = ({ activity, onChange, workProducts, onAddNewWorkProduct, onAddExistingWorkProduct, onRemoveTrigger, onSetWorkloadDetermining }) => {
  const [localActivity, setLocalActivity] = useState(activity); // Lokaler Zustand der Aktivität

  // Änderungen an Textfeldern oder Dropdowns verarbeiten
  const handleChange = (e) => {
    const { name, value } = e.target; // Name und Wert des geänderten Elements
    setLocalActivity({ ...localActivity, [name]: value }); // Lokalen Zustand aktualisieren
    onChange({ ...localActivity, [name]: value }); // Änderung an übergeordnete Komponente weitergeben
  };

  // Rich-Text-Beschreibung ändern
  const handleQuillChange = (value) => {
    setLocalActivity({ ...localActivity, description: value }); // Lokalen Zustand aktualisieren
    onChange({ ...localActivity, description: value }); // Änderung weitergeben
  };

  // Änderungen an einem Trigger (Work Product) verarbeiten
  const handleTriggerChange = (index, field, value) => {
    const newTriggerWorkProducts = [...localActivity.triggerWorkProducts]; // Kopie der Trigger-Liste
    newTriggerWorkProducts[index] = { ...newTriggerWorkProducts[index], [field]: value }; // Änderung an spezifischem Trigger
    setLocalActivity({ ...localActivity, triggerWorkProducts: newTriggerWorkProducts }); // Lokalen Zustand aktualisieren
    onChange({ ...localActivity, triggerWorkProducts: newTriggerWorkProducts }); // Änderung weitergeben
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, border: '1px solid #ccc', p: 2, borderRadius: 1, mb: 2 }}>
      {/* Linker Bereich: Auslösende Work Products */}
      <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1">Triggered by</Typography>
          <Box>
            <Button variant="outlined" onClick={onAddNewWorkProduct} sx={{ mr: 1 }}>
              + NEUES WP HINZUFÜGEN
            </Button>
            <Button variant="outlined" onClick={onAddExistingWorkProduct}>
              + VORHANDENES WP HINZUFÜGEN
            </Button>
          </Box>
        </Box>
        {(localActivity.triggerWorkProducts || []).map((trigger, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px dashed #ccc', p: 1, mb: 1 }}>
            {/* Dropdown für Work Product */}
            <FormControl sx={{ flex: 1, mr: 1 }}>
              <InputLabel>Work Product</InputLabel>
              <Select
                value={trigger.workProductId || ''}
                onChange={(e) => handleTriggerChange(index, 'workProductId', e.target.value)}
                label="Work Product"
                sx={{ height: '56px' }}
              >
                <MenuItem value="">Keine</MenuItem>
                {workProducts.map(product => (
                  <MenuItem key={product._id} value={product._id}>{product.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Textfeld für Fertigstellungsgrad */}
            <TextField
              label="% Fertigstellung"
              value={trigger.completeness}
              onChange={(e) => handleTriggerChange(index, 'completeness', e.target.value)}
              sx={{ flex: 1, mr: 1 }}
              type="number"
              inputProps={{ min: 0, max: 100 }}
            />
            {/* Dropdown für Workload bestimmender Faktor */}
            <FormControl sx={{ flex: 1, mr: 1 }}>
              <InputLabel>Workload bestimmender Faktor</InputLabel>
              <Select
                value={trigger.isWorkloadDetermining ? 'yes' : 'no'}
                onChange={(e) => {
                  if (e.target.value === 'yes') {
                    onSetWorkloadDetermining(index); // Nur diesen Trigger als bestimmend markieren
                  } else {
                    handleTriggerChange(index, 'isWorkloadDetermining', false); // Entfernen der Markierung
                  }
                }}
                label="Workload bestimmender Faktor"
                sx={{ height: '56px' }}
              >
                <MenuItem value="no">Nein</MenuItem>
                <MenuItem value="yes">Ja (X)</MenuItem>
              </Select>
            </FormControl>
            {/* Button zum Entfernen */}
            <Button variant="outlined" color="error" onClick={() => onRemoveTrigger(index)} sx={{ ml: 1 }}>
              -
            </Button>
          </Box>
        ))}
      </Box>

      {/* Mittlerer Bereich: Name und Beschreibung */}
      <Box sx={{ flex: 4, display: 'flex', flexDirection: 'column', gap: 1, bgcolor: '#e0f0f0', p: 1 }}>
        <TextField
          name="name"
          label="Name (einzigartig)"
          value={localActivity.name}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 1 }}
        />
        <ReactQuill
          value={localActivity.description || ''}
          onChange={handleQuillChange}
          modules={{ toolbar: [['bold', 'italic', 'underline', 'list']] }} // Einfache Textformatierung
          formats={['bold', 'italic', 'underline', 'list']}
          style={{ minHeight: '100px', width: '100%' }}
        />
      </Box>

      {/* Rechter Bereich: Ergebnis */}
      <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <FormControl fullWidth sx={{ mb: 1 }}>
          <InputLabel>Ergebnis (Work Product)</InputLabel>
          <Select
            name="result"
            value={localActivity.result || ''}
            onChange={handleChange}
            label="Ergebnis (Work Product)"
            sx={{ height: '56px' }}
          >
            <MenuItem value="">Keine</MenuItem>
            {workProducts.map(product => (
              <MenuItem key={product._id} value={product._id}>{product.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default Triggers;