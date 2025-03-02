import React, { useState } from 'react';
import { Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel } from '@mui/material';
import { useEffect } from 'react';

const ActivitySidebar = ({ roles, activities, workProducts, onAddActivity }) => {
  const [newActivity, setNewActivity] = useState({ 
    name: '', 
    description: '', 
    executedBy: '', 
    triggeredBy: { workProducts: [], andOr: 'AND', timeTrigger: null, workloadLoad: '' }, 
    result: '', 
    multiplicator: 1, 
    workMode: '0', 
    timeIfKnown: '', 
    timeIfNew: '', 
    versionMajor: 1, 
    versionMinor: 0 
  });
  const [triggers, setTriggers] = useState([]);
  const [selectedWorkProducts, setSelectedWorkProducts] = useState([]);
  const [completeness, setCompleteness] = useState({});
  const [workloadLoad, setWorkloadLoad] = useState('');

  useEffect(() => {
    fetch('http://localhost:5001/api/triggers')
      .then(r => r.json())
      .then(data => setTriggers(data))
      .catch(error => console.error('Fehler beim Laden der Trigger:', error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'triggeredBy') {
      setNewActivity({ ...newActivity, triggeredBy: { ...newActivity.triggeredBy, [name]: value } });
    } else if (name === 'workloadLoad') {
      setNewActivity({ ...newActivity, triggeredBy: { ...newActivity.triggeredBy, workloadLoad: value } });
    } else {
      setNewActivity({ ...newActivity, [name]: value });
    }
  };

  const handleWorkProductChange = (workProductId, checked) => {
    if (checked) {
      setSelectedWorkProducts([...selectedWorkProducts, workProductId]);
    } else {
      setSelectedWorkProducts(selectedWorkProducts.filter(id => id !== workProductId));
    }
    setNewActivity({
      ...newActivity,
      triggeredBy: {
        ...newActivity.triggeredBy,
        workProducts: selectedWorkProducts.map(id => ({ workProduct: id, completeness: completeness[id] || 0 }))
      }
    });
  };

  const handleCompletenessChange = (workProductId, value) => {
    setCompleteness({ ...completeness, [workProductId]: Number(value) });
    setNewActivity({
      ...newActivity,
      triggeredBy: {
        ...newActivity.triggeredBy,
        workProducts: selectedWorkProducts.map(id => ({ workProduct: id, completeness: id === workProductId ? Number(value) : completeness[id] || 0 }))
      }
    });
  };

  const handleAndOrChange = (e) => {
    setNewActivity({ ...newActivity, triggeredBy: { ...newActivity.triggeredBy, andOr: e.target.value } });
  };

  const handleTimeTriggerChange = (field, value) => {
    setNewActivity({
      ...newActivity,
      triggeredBy: {
        ...newActivity.triggeredBy,
        timeTrigger: { ...newActivity.triggeredBy.timeTrigger, [field]: value }
      }
    });
  };

  const handleAdd = () => {
    onAddActivity({
      ...newActivity,
      triggeredBy: {
        workProducts: selectedWorkProducts.map(id => ({ workProduct: id, completeness: completeness[id] || 0 })),
        andOr: newActivity.triggeredBy.andOr,
        timeTrigger: newActivity.triggeredBy.timeTrigger,
        workloadLoad: workloadLoad
      },
      versionMinor: newActivity.versionMinor + 1 // Inkrementiere Minor-Version
    });
    setNewActivity({ 
      name: '', 
      description: '', 
      executedBy: '', 
      triggeredBy: { workProducts: [], andOr: 'AND', timeTrigger: null, workloadLoad: '' }, 
      result: '', 
      multiplicator: 1, 
      workMode: '0', 
      timeIfKnown: '', 
      timeIfNew: '', 
      versionMajor: 1, 
      versionMinor: 0 
    });
    setSelectedWorkProducts([]);
    setCompleteness({});
    setWorkloadLoad('');
  };

  return (
    <Box sx={{ width: '30%', padding: 2, borderLeft: '1px solid #ccc' }}>
      <Typography variant="h6" gutterBottom>Aktivitäten hinzufügen</Typography>
      <TextField
        label="Name"
        value={newActivity.name}
        onChange={(e) => handleChange({ target: { name: 'name', value: e.target.value } })}
        variant="outlined"
        size="small"
        sx={{ mr: 2, mb: 2, width: '100%', fontSize: '0.8em' }}
      />
      <TextField
        label="Beschreibung"
        value={newActivity.description}
        onChange={(e) => handleChange({ target: { name: 'description', value: e.target.value } })}
        variant="outlined"
        size="small"
        multiline
        rows={2}
        sx={{ mr: 2, mb: 2, width: '100%', fontSize: '0.8em' }}
      />
      <FormControl sx={{ mr: 2, mb: 2, width: '100%' }}>
        <InputLabel>Rolle</InputLabel>
        <Select
          value={newActivity.executedBy || ''}
          onChange={(e) => handleChange({ target: { name: 'executedBy', value: e.target.value } })}
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
          value={newActivity.result || ''}
          onChange={(e) => handleChange({ target: { name: 'result', value: e.target.value } })}
          size="small"
        >
          <MenuItem value="">Keine</MenuItem>
          {workProducts.map(wp => (
            <MenuItem key={wp._id} value={wp._id}>{wp.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Multiplikator"
        type="number"
        value={newActivity.multiplicator}
        onChange={(e) => handleChange({ target: { name: 'multiplicator', value: Number(e.target.value) } })}
        variant="outlined"
        size="small"
        sx={{ mr: 2, mb: 2, width: '100%', fontSize: '0.8em' }}
      />
      <FormControl sx={{ mr: 2, mb: 2, width: '100%' }}>
        <InputLabel>Work Mode</InputLabel>
        <Select
          value={newActivity.workMode}
          onChange={(e) => handleChange({ target: { name: 'workMode', value: e.target.value } })}
          size="small"
        >
          <MenuItem value="0">Einer</MenuItem>
          <MenuItem value="1">Jeder</MenuItem>
        </Select>
      </FormControl>
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Trigger konfigurieren</Typography>
      <FormControl sx={{ mr: 2, mb: 2, width: '100%' }}>
        <InputLabel>AND/OR</InputLabel>
        <Select
          value={newActivity.triggeredBy.andOr}
          onChange={handleAndOrChange}
          size="small"
        >
          <MenuItem value="AND">AND</MenuItem>
          <MenuItem value="OR">OR</MenuItem>
        </Select>
      </FormControl>
      {workProducts.map(wp => (
        <Box key={wp._id} sx={{ mb: 2 }}>
          <FormControlLabel
            control={<Checkbox checked={selectedWorkProducts.includes(wp._id)} onChange={(e) => handleWorkProductChange(wp._id, e.target.checked)} />}
            label={wp.name}
          />
          {selectedWorkProducts.includes(wp._id) && (
            <TextField
              label="Fertigstellungsgrad (%)"
              type="number"
              value={completeness[wp._id] || 0}
              onChange={(e) => handleCompletenessChange(wp._id, e.target.value)}
              variant="outlined"
              size="small"
              sx={{ ml: 2, width: '100px' }}
            />
          )}
        </Box>
      ))}
      <FormControl sx={{ mr: 2, mb: 2, width: '100%' }}>
        <InputLabel>Arbeitslast (Work Product)</InputLabel>
        <Select
          value={workloadLoad || ''}
          onChange={(e) => setWorkloadLoad(e.target.value)}
          size="small"
        >
          <MenuItem value="">Keine</MenuItem>
          {workProducts.map(wp => (
            <MenuItem key={wp._id} value={wp._id}>{wp.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Zeittrigger</Typography>
      <TextField
        label="Wert"
        type="number"
        value={newActivity.triggeredBy.timeTrigger?.value || ''}
        onChange={(e) => handleTimeTriggerChange('value', Number(e.target.value))}
        variant="outlined"
        size="small"
        sx={{ mr: 2, mb: 2, width: '100px' }}
      />
      <FormControl sx={{ mr: 2, mb: 2, width: '100%' }}>
        <InputLabel>Einheit</InputLabel>
        <Select
          value={newActivity.triggeredBy.timeTrigger?.unit || ''}
          onChange={(e) => handleTimeTriggerChange('unit', e.target.value)}
          size="small"
        >
          <MenuItem value="sec">Sekunden</MenuItem>
          <MenuItem value="min">Minuten</MenuItem>
          <MenuItem value="hour">Stunden</MenuItem>
          <MenuItem value="day">Tage</MenuItem>
          <MenuItem value="week">Wochen</MenuItem>
          <MenuItem value="month">Monate</MenuItem>
          <MenuItem value="year">Jahre</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Wiederholung"
        value={newActivity.triggeredBy.timeTrigger?.repetition || ''}
        onChange={(e) => handleTimeTriggerChange('repetition', e.target.value)}
        variant="outlined"
        size="small"
        sx={{ mr: 2, mb: 2, width: '100%' }}
        placeholder="z. B. 'every first Monday of every 2nd month'"
      />
      <TextField
        label="Zeit (bekannt)"
        value={newActivity.timeIfKnown}
        onChange={(e) => handleChange({ target: { name: 'timeIfKnown', value: e.target.value } })}
        variant="outlined"
        size="small"
        sx={{ mr: 2, mb: 2, width: '100%', fontSize: '0.8em' }}
      />
      <TextField
        label="Zeit (geschätzt)"
        value={newActivity.timeIfNew}
        onChange={(e) => handleChange({ target: { name: 'timeIfNew', value: e.target.value } })}
        variant="outlined"
        size="small"
        sx={{ mr: 2, mb: 2, width: '100%', fontSize: '0.8em' }}
      />
      <Button variant="contained" onClick={handleAdd} sx={{ mt: 2, width: '100%' }}>
        Aktivität hinzufügen
      </Button>
    </Box>
  );
};

export default ActivitySidebar;