import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ActivityForm = ({ activityId, onClose, activities }) => {
  const [activity, setActivity] = useState({
    name: '',
    description: '',
    abbreviation: '',
    process: '',
    executedBy: '',
    result: null,
    multiplicator: 1,
    workMode: '0',
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
            executedBy: activityResponse.executedBy || '',
            result: activityResponse.result?._id || activityResponse.result || null,
            multiplicator: Number(activityResponse.multiplicator) || 1,
            workMode: activityResponse.workMode || '0',
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
      executedBy: activity.executedBy || '67c96682591e42d1eaca08b1',
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
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>{activityId ? 'Aktivität bearbeiten' : 'Neue Aktivität erstellen'}</Typography>

      <TextField
        label="Name"
        value={activity.name}
        onChange={(e) => handleChange('name', e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <Typography variant="subtitle1">Beschreibung</Typography>
      <Box sx={{ mb: 2 }}>
        <ReactQuill
          value={activity.description}
          onChange={(value) => handleChange('description', value)}
          modules={{ toolbar: [['bold', 'italic', 'underline'], ['link']] }}
          formats={['bold', 'italic', 'underline', 'link']}
          style={{ minHeight: '120px' }} // Mindestens 4 Zeilen (~120px)
        />
      </Box>
      <TextField
        label="Abkürzung"
        value={activity.abbreviation}
        onChange={(e) => handleChange('abbreviation', e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth sx={{ mb: 2 }} required>
        <InputLabel>Prozess</InputLabel>
        <Select
          value={activity.process || ''}
          onChange={(e) => handleChange('process', e.target.value)}
          label="Prozess"
        >
          {processes.map(process => (
            <MenuItem key={process._id} value={process._id}>{process.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Work Product produziert</InputLabel>
        <Select
          value={activity.result || ''}
          onChange={(e) => handleChange('result', e.target.value || null)}
          label="Work Product produziert"
        >
          <MenuItem value="">Keins</MenuItem>
          {availableWorkProducts.map(wp => (
            <MenuItem key={wp._id} value={wp._id}>{wp.name}</MenuItem>
          ))}
          {activity.result && !availableWorkProducts.some(wp => wp._id === activity.result) && (
            <MenuItem value={activity.result}>
              {workProducts.find(wp => wp._id === activity.result)?.name || 'Unbekannt'}
            </MenuItem>
          )}
        </Select>
      </FormControl>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">Icon / Bild (optional)</Typography>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {activity.icon && <img src={activity.icon} alt="Icon" style={{ maxWidth: 100, marginTop: 10 }} />}
      </Box>

      <Box sx={{ mt: 2 }}>
        <Button variant="contained" onClick={handleSave} sx={{ mr: 2 }}>Speichern</Button>
        <Button variant="outlined" onClick={onClose}>Abbrechen</Button>
      </Box>
    </Box>
  );
};

export default ActivityForm;