import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material';
import { Add } from '@mui/icons-material'; // Importiere Add hier
import ProcessFlowCanvas from '../components/ProcessFlowCanvas';

const CreateProcess = () => {
  const navigate = useNavigate();

  const [process, setProcess] = useState({
    name: '',
    abbreviation: '',
    processPurpose: '',
    processGroup: '',
    owner: '',
  });
  const [processGroups, setProcessGroups] = useState([]);
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groups, roles] = await Promise.all([
          fetch('http://localhost:5001/api/process-groups').then(r => r.json()),
          fetch('http://localhost:5001/api/roles').then(r => r.json()),
        ]);

        setProcessGroups(groups || []);
        setRoles(roles || []);
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'abbreviation' && value.length > 10) {
      return; // Begrenze Abkürzung auf 10 Zeichen
    }
    setProcess({ ...process, [name]: value });
  };

  const handleSave = () => {
    const cleanedProcess = {
      name: process.name || '',
      abbreviation: process.abbreviation || '',
      processPurpose: process.processPurpose || '',
      processGroup: process.processGroup && /^[0-9a-fA-F]{24}$/.test(process.processGroup) ? process.processGroup : null,
      owner: process.owner && /^[0-9a-fA-F]{24}$/.test(process.owner) ? process.owner : null,
    };

    fetch('http://localhost:5001/api/processes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanedProcess),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(() => navigate('/processes')) // Vereinfacht, um Warnungen zu vermeiden
      .catch(error => {
        console.error('Fehler beim Erstellen des Prozesses:', error);
        setError(error.message);
      });
  };

  const handleAddActivity = () => {
    navigate('/activities/new?processId=null');
  };

  if (loading) return <Typography>Lade Daten...</Typography>;
  if (error) return <Typography>Fehler: {error}</Typography>;

  return (
    <Box sx={{ 
      padding: 4, 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 2, 
      maxHeight: '80vh', 
      overflowY: 'auto', 
    }} className="process-form">
      <Typography variant="h4" gutterBottom>Neuer Prozess erstellen</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            name="name"
            label="Name"
            value={process.name}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            sx={{ flex: 2, mb: 1 }}
          />
          <TextField
            name="abbreviation"
            label="Abkürzung"
            value={process.abbreviation}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            inputProps={{ maxLength: 10 }}
            sx={{ flex: 1, mb: 1 }}
          />
        </Box>
        <TextField
          name="processPurpose"
          label="Zweck"
          value={process.processPurpose}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          multiline
          rows={4}
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl fullWidth sx={{ flex: 1, mb: 1 }}>
            <InputLabel>Prozessgruppe</InputLabel>
            <Select
              name="processGroup"
              value={process.processGroup || ''}
              onChange={handleChange}
              label="Prozessgruppe"
              sx={{ height: '56px' }}
            >
              <MenuItem value="">Keine</MenuItem>
              {processGroups.map(group => (
                <MenuItem key={group._id} value={group._id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ flex: 1, mb: 1 }}>
            <InputLabel>Eigentümer (Rolle)</InputLabel>
            <Select
              name="owner"
              value={process.owner || ''}
              onChange={handleChange}
              label="Eigentümer (Rolle)"
              sx={{ height: '56px' }}
            >
              <MenuItem value="">Keine</MenuItem>
              {roles.map(role => (
                <MenuItem key={role._id} value={role._id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" onClick={handleSave} sx={{ mt: 2 }}>
          Prozess speichern
        </Button>
        <Button 
          variant="outlined" 
          onClick={handleAddActivity} 
          sx={{ ml: 2, mt: 2 }} 
          startIcon={<Add />}
        >
          Aktivitäten hinzufügen
        </Button>
      </Box>
      <Box sx={{ mt: 2, width: '100%', flex: 1, minHeight: 400, display: 'flex' }}>
        <Box sx={{ flex: 1, minHeight: '100%' }}>
          <ProcessFlowCanvas 
            nodes={[]} // Entferne oder passe an, falls nicht benötigt
            edges={[]} // Entferne oder passe an, falls nicht benötigt
            sx={{ height: '100%' }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default CreateProcess;