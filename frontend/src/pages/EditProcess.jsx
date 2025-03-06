import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const EditProcesses = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // ID des Prozesses aus der URL (für Bearbeitung)
  const [searchParams] = useSearchParams(); // URL-Parameter auslesen
  const processId = searchParams.get('processId'); // Prozess-ID für neue/zu bearbeitende Prozesse

  const [process, setProcess] = useState({
    name: '',
    description: '',
    processGroup: '', // String (ObjectId) für Prozessgruppe
    owner: '', // String (ObjectId) für Eigentümer
    versionMajor: 1,
    versionMinor: 0,
  });
  const [processGroups, setProcessGroups] = useState([]);
  const [roles, setRoles] = useState([]); // Zustand für Rollen hinzufügen
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Prozessgruppen und Rollen laden
        const [groupsResponse, rolesResponse, processResponse] = await Promise.all([
          fetch('http://localhost:5001/api/process-groups').then(r => r.json()),
          fetch('http://localhost:5001/api/roles').then(r => r.json()),
          id ? fetch(`http://localhost:5001/api/processes/${id}`).then(r => r.json()) : Promise.resolve(null),
        ]);

        setProcessGroups(groupsResponse || []);
        setRoles(rolesResponse || []);

        if (processResponse) {
          // Stelle sicher, dass processGroup und owner als Strings (ObjectIds) extrahiert werden
          setProcess({
            ...processResponse,
            processGroup: processResponse.processGroup?._id?.toString() || processResponse.processGroup?.toString() || '',
            owner: processResponse.owner?._id?.toString() || processResponse.owner?.toString() || '',
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Sicherstellen, dass nur Strings (ObjectIds) akzeptiert werden
    setProcess(prev => ({
      ...prev,
      [name]: value === '' ? '' : value.toString(), // Konvertiere in String, wenn nicht leer
    }));
  };

  const handleSave = () => {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:5001/api/processes/${id}` : 'http://localhost:5001/api/processes';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...process,
        versionMinor: id ? (process.versionMinor + 1) : 0, // Inkrementiere Minor-Version bei Updates
      }),
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log('Gespeicherter Prozess:', data);
        navigate('/edit-processes'); // Zurück zur Prozessliste
      })
      .catch(error => {
        console.error('Fehler beim Speichern:', error);
        setError(error.message);
      });
  };

  if (loading) return <Typography>Lade Prozess...</Typography>;
  if (error) return <Typography>Fehler: {error}</Typography>;

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4">{id ? 'Prozess bearbeiten' : 'Neuen Prozess erstellen'}</Typography>
      <TextField
        label="Name"
        name="name"
        value={process.name}
        onChange={handleChange}
        fullWidth
        required
        sx={{ mt: 2 }}
      />
      <TextField
        label="Beschreibung"
        name="description"
        value={process.description}
        onChange={handleChange}
        fullWidth
        multiline
        rows={4}
        sx={{ mt: 2 }}
      />
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Prozessgruppe</InputLabel>
        <Select
          name="processGroup"
          value={process.processGroup}
          onChange={handleChange}
        >
          <MenuItem value="">Keine</MenuItem>
          {processGroups.map(group => (
            <MenuItem key={group._id} value={group._id.toString()}>{group.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Eigentümer (Rolle)</InputLabel>
        <Select
          name="owner"
          value={process.owner}
          onChange={handleChange}
        >
          <MenuItem value="">Kein Eigentümer</MenuItem>
          {roles.map(role => (
            <MenuItem key={role._id} value={role._id.toString()}>{role.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" onClick={handleSave}>Speichern</Button>
        <Button variant="outlined" onClick={() => navigate('/edit-processes')} sx={{ ml: 2 }}>Zurück</Button>
      </Box>
    </Box>
  );
};

export default EditProcesses;