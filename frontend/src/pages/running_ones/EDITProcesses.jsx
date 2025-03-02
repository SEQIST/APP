import React, { useState, useEffect, useCallback } from 'react'; // useCallback hinzugefügt
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, Grid } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Stil für ReactQuill
import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Initiale Nodes und Edges für den leeren Canvas
const initialNodes = [];
const initialEdges = [];

const EditProcess = () => {
  const { id } = useParams(); // Hole die Prozess-ID aus der URL (oder "new" für einen neuen Prozess)
  const navigate = useNavigate();

  const [process, setProcess] = useState({ 
    name: '', 
    abbreviation: '', 
    processPurpose: '', 
    processGroup: '', 
    owner: '' // Als String für die _id
  });
  const [processGroups, setProcessGroups] = useState([]);
  const [roles, setRoles] = useState([]); // Zustand für Rollen
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [activities, setActivities] = useState([]); // Zustand für Aktivitäten
  const [newActivity, setNewActivity] = useState({ name: '', description: '', executedBy: '', triggeredBy: '', result: '', multiplicator: 1, workMode: '', timeIfKnown: '', timeIfNew: '', versionMajor: 1, versionMinor: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      id !== 'new' ? fetch(`http://localhost:5001/api/processes/${id}`).then(r => {
        if (!r.ok) {
          if (r.status === 404) throw new Error('Prozess nicht gefunden');
          throw new Error(`HTTP-Fehler! Status: ${r.status} - ${r.statusText}`);
        }
        return r.json();
      }) : Promise.resolve(null),
      fetch('http://localhost:5001/api/process-groups').then(r => {
        if (!r.ok) throw new Error(`HTTP-Fehler! Status: ${r.status} - ${r.statusText}`);
        return r.json();
      }),
      fetch('http://localhost:5001/api/roles').then(r => {
        if (!r.ok) throw new Error(`HTTP-Fehler! Status: ${r.status} - ${r.statusText}`);
        return r.json();
      }),
      fetch('http://localhost:5001/api/activities').then(r => {
        if (!r.ok) throw new Error(`HTTP-Fehler! Status: ${r.status} - ${r.statusText}`);
        return r.json();
      }),
    ])
      .then(([processData, groups, rolesData, activitiesData]) => {
        if (processData && !processData.error) {
          setProcess({
            name: processData.name || '',
            abbreviation: processData.abbreviation || '',
            processPurpose: processData.processPurpose || '',
            processGroup: processData.processGroup?._id?.toString() || '',
            owner: processData.owner?._id?.toString() || ''
          });
        } else {
          setProcess({ name: '', abbreviation: '', processPurpose: '', processGroup: '', owner: '' });
        }
        setProcessGroups(groups || []);
        setRoles(rolesData || []);
        setActivities(activitiesData || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Fehler beim Laden der Daten:', error);
        setError(error.message);
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProcess({ ...process, [name]: value });
  };

  const handleQuillChange = (value) => {
    setProcess({ ...process, processPurpose: value });
  };

  const handleSave = () => {
    const method = id === 'new' ? 'POST' : 'PUT';
    const url = id === 'new' ? 'http://localhost:5001/api/processes' : `http://localhost:5001/api/processes/${id.toString()}`;
    
    const cleanedProcess = {
      name: process.name || '',
      abbreviation: process.abbreviation || '',
      processPurpose: process.processPurpose || '',
      processGroup: process.processGroup || null,
      owner: process.owner || null
    };

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanedProcess),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error(`HTTP-Fehler! Status: ${response.status} - ${errorData.error || response.statusText}`);
          });
        }
        return response.json();
      })
      .then(data => {
        fetchData(); // Lade die Daten neu, um sicherzustellen, dass die Änderungen angezeigt werden
        navigate('/processes'); // Zurück zur Prozess-Liste nach dem Speichern
      })
      .catch(error => {
        console.error('Fehler beim Speichern des Prozesses:', error);
        setError(error.message);
      });
  };

  const onNodesChange = useCallback( // useCallback korrekt verwendet
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback( // useCallback korrekt verwendet
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const handleAddActivity = () => {
    fetch('http://localhost:5001/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newActivity,
        process: id, // Verknüpfe die Aktivität mit dem aktuellen Prozess
        versionMinor: newActivity.versionMinor + 1 // Inkrementiere Minor-Version bei jedem Speichern
      }),
    })
      .then(response => response.json())
      .then(data => {
        setActivities([...activities, data]);
        setNewActivity({ name: '', description: '', executedBy: '', triggeredBy: '', result: '', multiplicator: 1, workMode: '', timeIfKnown: '', timeIfNew: '', versionMajor: 1, versionMinor: 0 });
      })
      .catch(error => console.error('Error adding activity:', error));
  };

  if (loading) return <Typography>Lade Prozess...</Typography>;
  if (error) return <Typography>Fehler: {error}</Typography>;

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>{id === 'new' ? 'Neuer Prozess' : 'Prozess bearbeiten'}</Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={4}>
          <TextField
            label="Name"
            name="name"
            value={process.name}
            onChange={handleChange}
            variant="outlined"
            size="small"
            sx={{ mr: 2, fontSize: '0.8em' }} // Kleinere Schrift
          />
        </Grid>
        <Grid item xs={2}>
          <TextField
            label="Abkürzung"
            name="abbreviation"
            value={process.abbreviation}
            onChange={handleChange}
            variant="outlined"
            size="small"
            sx={{ fontSize: '0.8em' }} // Kleinere Schrift
          />
        </Grid>
        <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: '0.7em', color: '#666' }}>
          <Typography sx={{ mr: 2 }}>
            Gruppe: {processGroups.find(g => g._id.toString() === process.processGroup)?.name || 'Keine'}
          </Typography>
          <Typography>
            Eigentümer: {roles.find(r => r._id.toString() === process.owner)?.name || 'Kein Eigentümer'}
          </Typography>
        </Grid>
      </Grid>
      <Box sx={{ mt: 2 }}>
        <ReactQuill
          value={process.processPurpose}
          onChange={handleQuillChange}
          modules={{ toolbar: [
            [{ 'header': '1'}, {'header': '2'}], // Überschriften
            ['bold', 'italic', 'underline'], // Fettschrift, Kursiv, Unterstrich
            ['blockquote', 'code-block'], // Zitate, Code
            [{ 'list': 'ordered'}, { 'list': 'bullet' }], // Nummerierte und ungeordnete Listen
            ['link', 'image'] // Links, Bilder
          ]}}
          formats={['header', 'bold', 'italic', 'underline', 'blockquote', 'code-block', 'list', 'bullet', 'link', 'image']}
          placeholder="Prozesszweck eingeben..."
          style={{ marginBottom: 20, fontSize: '0.9em' }} // Kleinere Schrift
        />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" onClick={handleSave} sx={{ mt: 2 }}>
          Prozess speichern
        </Button>
      </Box>

      {/* Canvas für den Flow mit Aktivitäten darunter */}
      <Box sx={{ mt: 4, height: '400px', width: '100%', border: '1px solid #ccc' }}> {/* Breite und Höhe explizit festlegen */}
        <Typography variant="h6" gutterBottom>Prozessfluss (Aktivitäten)</Typography>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background color="#aaa" gap={16} />
          <Controls />
        </ReactFlow>
      </Box>

      {/* Sidebar rechts für Aktivitäten hinzufügen */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ width: '70%' }}></Box> {/* Platz für den Hauptinhalt */}
        <Box sx={{ width: '30%', padding: 2, borderLeft: '1px solid #ccc' }}>
          <Typography variant="h6" gutterBottom>Aktivitäten hinzufügen</Typography>
          <TextField
            label="Name"
            value={newActivity.name}
            onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
            variant="outlined"
            size="small"
            sx={{ mr: 2, mb: 2, width: '100%', fontSize: '0.8em' }}
          />
          <TextField
            label="Beschreibung"
            value={newActivity.description}
            onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
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
              onChange={(e) => setNewActivity({ ...newActivity, executedBy: e.target.value })}
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
              onChange={(e) => setNewActivity({ ...newActivity, result: e.target.value })}
              size="small"
            >
              <MenuItem value="">Keine</MenuItem>
              {activities.filter(a => a.result).map(a => (
                <MenuItem key={a._id} value={a.result}>{a.result.name || 'Unbenannt'}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Multiplikator"
            type="number"
            value={newActivity.multiplicator}
            onChange={(e) => setNewActivity({ ...newActivity, multiplicator: Number(e.target.value) })}
            variant="outlined"
            size="small"
            sx={{ mr: 2, mb: 2, width: '100%', fontSize: '0.8em' }}
          />
          <TextField
            label="Work Mode"
            value={newActivity.workMode}
            onChange={(e) => setNewActivity({ ...newActivity, workMode: e.target.value })}
            variant="outlined"
            size="small"
            sx={{ mr: 2, mb: 2, width: '100%', fontSize: '0.8em' }}
          />
          <TextField
            label="Zeit (bekannt)"
            value={newActivity.timeIfKnown}
            onChange={(e) => setNewActivity({ ...newActivity, timeIfKnown: e.target.value })}
            variant="outlined"
            size="small"
            sx={{ mr: 2, mb: 2, width: '100%', fontSize: '0.8em' }}
          />
          <TextField
            label="Zeit (geschätzt)"
            value={newActivity.timeIfNew}
            onChange={(e) => setNewActivity({ ...newActivity, timeIfNew: e.target.value })}
            variant="outlined"
            size="small"
            sx={{ mr: 2, mb: 2, width: '100%', fontSize: '0.8em' }}
          />
          <Button variant="contained" onClick={handleAddActivity} sx={{ mt: 2, width: '100%' }}>
            Aktivität hinzufügen
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EditProcess;