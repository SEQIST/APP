import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Compress } from '@mui/icons-material';

const ActivityForm = ({ activityId, onClose, activities }) => {
  const [activity, setActivity] = useState({
    name: '',
    description: '',
    abbreviation: '',
    process: '',
    executedBy: '',
    result: null,
    multiplicator: 1,
    workMode: 'Sequential',
    knownTime: '0',
    estimatedTime: '0',
    timeUnit: 'minutes',
    versionMajor: 1,
    versionMinor: 0,
    icon: null,
  });
  const [roles, setRoles] = useState([]);
  const [workProducts, setWorkProducts] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesData, workProductsData, processesData, activityResponse] = await Promise.all([
          fetch('http://localhost:5001/api/roles').then(r => r.json()),
          fetch('http://localhost:5001/api/workproducts').then(r => r.json()),
          fetch('http://localhost:5001/api/processes').then(r => r.json()),
          activityId ? fetch(`http://localhost:5001/api/activities/${activityId}`).then(r => {
            if (!r.ok) throw new Error('Aktivität nicht gefunden');
            return r.json();
          }) : Promise.resolve(null),
        ]);

        setRoles(rolesData || []);
        setWorkProducts(workProductsData || []);
        setProcesses(processesData || []);

        if (activityResponse) {
          const updatedActivity = {
            name: activityResponse.name || '',
            description: activityResponse.description || '',
            abbreviation: activityResponse.abbreviation || '',
            process: activityResponse.process?._id || activityResponse.process || '',
            executedBy: activityResponse.executedBy?._id || activityResponse.executedBy || '',
            result: activityResponse.result?._id || activityResponse.result || null,
            multiplicator: Number(activityResponse.multiplicator) || 1,
            workMode: activityResponse.workMode || 'Sequential',
            knownTime: String(activityResponse.knownTime) || '0',
            estimatedTime: String(activityResponse.estimatedTime) || '0',
            timeUnit: activityResponse.timeUnit || 'minutes',
            versionMajor: Number(activityResponse.versionMajor) || 1,
            versionMinor: Number(activityResponse.versionMinor) || 0,
            icon: activityResponse.icon || null,
          };
          setActivity(updatedActivity);
        }
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [activityId]);

  const getAvailableWorkProducts = () => {
    const usedWorkProductIds = new Set();
    activities.forEach(act => {
      if (act._id !== activityId) {
        if (act.result) {
          usedWorkProductIds.add((act.result._id || act.result).toString());
        }
        if (act.trigger?.workProducts) {
          act.trigger.workProducts.forEach(wp => {
            usedWorkProductIds.add((wp._id._id || wp._id).toString());
          });
        }
      }
    });
    return workProducts.filter(wp => !usedWorkProductIds.has(wp._id.toString()));
  };

  const handleChange = (field, value) => {
    setActivity(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!activity.name) {
      setError('Name ist erforderlich');
      return;
    }
    if (!activity.description) {
      setError('Beschreibung ist erforderlich');
      return;
    }
    if (!activity.abbreviation) {
      setError('Abkürzung ist erforderlich');
      return;
    }
    if (!activity.process || !/^[0-9a-fA-F]{24}$/.test(activity.process)) {
      setError('Eine gültige Process-ID ist erforderlich.');
      return;
    }

    const method = activityId ? 'PUT' : 'POST';
    const url = activityId ? `http://localhost:5001/api/activities/${activityId}` : 'http://localhost:5001/api/activities';

    const cleanedActivity = {
      name: activity.name,
      description: activity.description,
      abbreviation: activity.abbreviation,
      process: activity.process,
      executedBy: activity.executedBy || null,
      result: activity.result || null,
      multiplicator: Number(activity.multiplicator),
      workMode: activity.workMode,
      knownTime: activity.knownTime,
      estimatedTime: activity.estimatedTime,
      timeUnit: activity.timeUnit,
      versionMajor: Number(activity.versionMajor),
      versionMinor: Number(activity.versionMinor),
      icon: activity.icon,
      trigger: activityId ? undefined : { workProducts: [], determiningFactorId: null },
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedActivity),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP-Fehler! Status: ${response.status} - ${errorData.error || 'Unbekannter Fehler'}`);
      }
      onClose();
    } catch (error) {
      console.error('Fehler beim Speichern der Aktivität:', error);
      setError(error.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setActivity(prev => ({ ...prev, icon: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <Typography>Lade Aktivität...</Typography>;
  if (error) return <Typography>Fehler: {error}</Typography>;

  const availableWorkProducts = getAvailableWorkProducts();

  return (
    <Box
      sx={{
        padding: 2,
        maxHeight: '80vh', // Maximal 80% der Bildschirmhöhe
        overflowY: 'auto', // Scrollbar bei Überschreitung
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem' }}>
        {activityId ? 'Aktivität bearbeiten' : 'Neue Aktivität erstellen'}
      </Typography>

      <TextField
        label="Name"
        value={activity.name}
        onChange={(e) => handleChange('name', e.target.value)}
        fullWidth
        required
        sx={{ mb: 1, '& .MuiInputBase-root': { height: 40, fontSize: '0.9rem' } }}
      />
      <Typography variant="subtitle2" sx={{ fontSize: '0.9rem' }}>Beschreibung</Typography>
      <Box sx={{ mb: 1 }}>
        <ReactQuill
          value={activity.description}
          onChange={(value) => handleChange('description', value)}
          modules={{ toolbar: [['bold', 'italic', 'underline'], ['link']] }}
          formats={['bold', 'italic', 'underline', 'link']}
          style={{ minHeight: '80px', fontSize: '0.9rem' }} // Reduzierte Höhe
        />
      </Box>
      <TextField
        label="Abkürzung"
        value={activity.abbreviation}
        onChange={(e) => handleChange('abbreviation', e.target.value)}
        fullWidth
        required
        sx={{ mb: 1, '& .MuiInputBase-root': { height: 40, fontSize: '0.9rem' } }}
      />
      <FormControl fullWidth sx={{ mb: 1 }}>
        <InputLabel sx={{ fontSize: '0.9rem' }}>Prozess</InputLabel>
        <Select
          value={activity.process || ''}
          onChange={(e) => handleChange('process', e.target.value)}
          label="Prozess"
          sx={{ height: 40, fontSize: '0.9rem' }}
        >
          {processes.map(process => (
            <MenuItem key={process._id} value={process._id} sx={{ fontSize: '0.9rem' }}>{process.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Executed by Role */}
      <FormControl fullWidth sx={{ mb: 1 }}>
        <InputLabel sx={{ fontSize: '0.9rem' }}>Ausgeführt von (Rolle)</InputLabel>
        <Select
          value={activity.executedBy || ''}
          onChange={(e) => handleChange('executedBy', e.target.value)}
          label="Ausgeführt von (Rolle)"
          sx={{ height: 40, fontSize: '0.9rem' }}
        >
          <MenuItem value="" sx={{ fontSize: '0.9rem' }}>Keine Rolle</MenuItem>
          {roles.map(role => (
            <MenuItem key={role._id} value={role._id} sx={{ fontSize: '0.9rem' }}>{role.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Work Product Produced */}
      <FormControl fullWidth sx={{ mb: 1 }}>
        <InputLabel sx={{ fontSize: '0.9rem' }}>Work Product produziert</InputLabel>
        <Select
          value={activity.result || ''}
          onChange={(e) => handleChange('result', e.target.value || null)}
          label="Work Product produziert"
          sx={{ height: 40, fontSize: '0.9rem' }}
        >
          <MenuItem value="" sx={{ fontSize: '0.9rem' }}>Keins</MenuItem>
          {availableWorkProducts.map(wp => (
            <MenuItem key={wp._id} value={wp._id} sx={{ fontSize: '0.9rem' }}>{wp.name}</MenuItem>
          ))}
          {activity.result && !availableWorkProducts.some(wp => wp._id === activity.result) && (
            <MenuItem value={activity.result} sx={{ fontSize: '0.9rem' }}>
              {workProducts.find(wp => wp._id === activity.result)?.name || 'Unbekannt'}
            </MenuItem>
          )}
        </Select>
      </FormControl>

      {/* Multiplicator Compressor */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <FormControl sx={{ mr: 1, width: 180 }}>
          <InputLabel sx={{ fontSize: '0.9rem' }}>Multiplicator Compressor</InputLabel>
          <Select
            value={activity.multiplicator > 1 ? 'compress' : 'none'}
            onChange={(e) => handleChange('multiplicator', e.target.value === 'compress' ? 2 : 1)}
            label="Multiplicator Compressor"
            sx={{ height: 40, fontSize: '0.9rem' }}
            startAdornment={<Compress sx={{ mr: 1, fontSize: '1rem' }} />}
          >
            <MenuItem value="none" sx={{ fontSize: '0.9rem' }}>Mal * </MenuItem>
            <MenuItem value="compress" sx={{ fontSize: '0.9rem' }}>Komprimieren</MenuItem>
          </Select>
        </FormControl>
        <TextField
          type="number"
          label="Wert"
          value={activity.multiplicator}
          onChange={(e) => handleChange('multiplicator', Number(e.target.value))}
          sx={{ width: 80, '& .MuiInputBase-root': { height: 40, fontSize: '0.9rem' } }}
          inputProps={{ min: 1 }}
        />
      </Box>

      {/* Work Mode */}
      <FormControl fullWidth sx={{ mb: 1 }}>
        <InputLabel sx={{ fontSize: '0.9rem' }}>Arbeitsmodus</InputLabel>
        <Select
          value={activity.workMode}
          onChange={(e) => handleChange('workMode', e.target.value)}
          label="Arbeitsmodus"
          sx={{ height: 40, fontSize: '0.9rem' }}
        >
          <MenuItem value="Sequential" sx={{ fontSize: '0.9rem' }}>Sequentiell</MenuItem>
          <MenuItem value="Parallel" sx={{ fontSize: '0.9rem' }}>Parallel</MenuItem>
        </Select>
      </FormControl>

      {/* Time if Known */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <TextField
          type="number"
          label="Bekannte Zeit"
          value={activity.knownTime}
          onChange={(e) => handleChange('knownTime', e.target.value)}
          sx={{ mr: 1, width: 120, '& .MuiInputBase-root': { height: 40, fontSize: '0.9rem' } }}
          inputProps={{ min: 0 }}
        />
        <FormControl sx={{ width: 120 }}>
          <InputLabel sx={{ fontSize: '0.9rem' }}>Einheit</InputLabel>
          <Select
            value={activity.timeUnit}
            onChange={(e) => handleChange('timeUnit', e.target.value)}
            label="Einheit"
            sx={{ height: 40, fontSize: '0.9rem' }}
          >
            <MenuItem value="minutes" sx={{ fontSize: '0.9rem' }}>Minuten</MenuItem>
            <MenuItem value="hours" sx={{ fontSize: '0.9rem' }}>Stunden</MenuItem>
            <MenuItem value="days" sx={{ fontSize: '0.9rem' }}>Tage</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Time if New (Estimated) */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <TextField
          type="number"
          label="Geschätzte Zeit"
          value={activity.estimatedTime}
          onChange={(e) => handleChange('estimatedTime', e.target.value)}
          sx={{ mr: 1, width: 120, '& .MuiInputBase-root': { height: 40, fontSize: '0.9rem' } }}
          inputProps={{ min: 0 }}
        />
        <FormControl sx={{ width: 120 }}>
          <InputLabel sx={{ fontSize: '0.9rem' }}>Einheit</InputLabel>
          <Select
            value={activity.timeUnit}
            onChange={(e) => handleChange('timeUnit', e.target.value)}
            label="Einheit"
            sx={{ height: 40, fontSize: '0.9rem' }}
          >
            <MenuItem value="minutes" sx={{ fontSize: '0.9rem' }}>Minuten</MenuItem>
            <MenuItem value="hours" sx={{ fontSize: '0.9rem' }}>Stunden</MenuItem>
            <MenuItem value="days" sx={{ fontSize: '0.9rem' }}>Tage</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Icon Upload */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontSize: '0.9rem' }}>Icon / Bild (optional)</Typography>
        <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: '0.9rem' }} />
        {activity.icon && <img src={activity.icon} alt="Icon" style={{ maxWidth: 80, marginTop: 5 }} />}
      </Box>

      {/* Buttons */}
      <Box sx={{ mt: 1, position: 'sticky', bottom: 0, bgcolor: 'background.paper', p: 1 }}>
        <Button variant="contained" onClick={handleSave} sx={{ mr: 1, fontSize: '0.9rem', padding: '4px 8px' }}>
          Speichern
        </Button>
        <Button variant="outlined" onClick={onClose} sx={{ fontSize: '0.9rem', padding: '4px 8px' }}>
          Abbrechen
        </Button>
      </Box>
    </Box>
  );
};

export default ActivityForm;