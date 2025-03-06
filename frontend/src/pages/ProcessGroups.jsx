import React from 'react'; // Importiere React für JSX und Hooks
import { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, ListItemIcon, TextField, Button, Box, Typography, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Edit, Delete, Add, Folder as FolderIcon, Work as WorkIcon } from '@mui/icons-material'; // Icons hinzufügen

const ProcessGroups = () => {
  const [processGroups, setProcessGroups] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [newGroup, setNewGroup] = useState({ name: '', abbreviation: '', description: '' });
  const [newProcess, setNewProcess] = useState({ name: '', abbreviation: '', description: '', processGroup: '', isJuniorTo: '' });

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5001/api/process-groups').then(r => r.json()),
      fetch('http://localhost:5001/api/processes').then(r => r.json()),
    ])
      .then(([groups, procs]) => {
        // Filtere ungültige (null/undefined) Prozesse aus
        const validProcesses = procs.filter(proc => proc && proc._id);
        setProcessGroups(groups || []);
        setProcesses(validProcesses || []);
      })
      .catch(error => console.error('Error fetching processes:', error));
  }, []);

  const buildHierarchy = () => {
    const root = [];
    const map = new Map();

    // Filtere nur Prozesse mit gültigen IDs und vermeide zirkuläre Verweise
    const validProcesses = processes.filter(proc => proc && proc._id && (proc.isJuniorTo?._id !== proc._id)); // Verhindere Selbstverweis
    validProcesses.forEach(proc => map.set(proc._id, { ...proc, children: [] }));

    // Baue die Hierarchie und vermeide zirkuläre Verweise
    validProcesses.forEach(proc => {
      if (!proc.isJuniorTo) {
        root.push(map.get(proc._id));
      } else {
        const parentId = proc.isJuniorTo?._id || proc.isJuniorTo;
        const parent = map.get(parentId);
        // Prüfe, ob der Elternprozess existiert und kein zirkulärer Verweis entsteht
        if (parent && parentId !== proc._id && !isCircular(parentId, proc._id, map)) {
          parent.children.push(map.get(proc._id));
        }
      }
    });

    return { root, groups: processGroups };
  };

  // Hilfsfunktion, um zirkuläre Verweise zu erkennen
  const isCircular = (parentId, childId, map) => {
    let currentId = parentId;
    const visited = new Set();
    while (currentId) {
      if (visited.has(currentId)) return true;
      visited.add(currentId);
      const current = map.get(currentId);
      if (!current || !current.isJuniorTo) break;
      currentId = current.isJuniorTo?._id || current.isJuniorTo;
      if (currentId === childId) return true;
    }
    return false;
  };

  const handleAddGroup = () => {
    fetch('http://localhost:5001/api/process-groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGroup),
    })
      .then(response => response.json())
      .then(data => {
        setProcessGroups([...processGroups, data]);
        setNewGroup({ name: '', abbreviation: '', description: '' });
      })
      .catch(error => console.error('Error adding process group:', error));
  };

  const handleEditGroup = (id, updatedGroup) => {
    fetch(`http://localhost:5001/api/process-groups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedGroup),
    })
      .then(response => response.json())
      .then(data => setProcessGroups(processGroups.map(g => (g._id === id ? data : g))))
      .catch(error => console.error('Error editing process group:', error));
  };

  const handleDeleteGroup = (id) => {
    fetch(`http://localhost:5001/api/process-groups/${id}`, { method: 'DELETE' })
      .then(() => setProcessGroups(processGroups.filter(g => g._id !== id)))
      .catch(error => console.error('Error deleting process group:', error));
  };

  const handleAddProcess = () => {
    fetch('http://localhost:5001/api/processes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProcess),
    })
      .then(response => response.json())
      .then(data => {
        setProcesses([...processes, data]);
        setNewProcess({ name: '', abbreviation: '', description: '', processGroup: '', isJuniorTo: '' });
      })
      .catch(error => console.error('Error adding process:', error));
  };

  const handleEditProcess = (id, updatedProcess) => {
    fetch(`http://localhost:5001/api/processes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProcess),
    })
      .then(response => response.json())
      .then(data => setProcesses(processes.map(p => (p._id === id ? data : p))))
      .catch(error => console.error('Error editing process:', error));
  };

  const handleDeleteProcess = (id) => {
    fetch(`http://localhost:5001/api/processes/${id}`, { method: 'DELETE' })
      .then(() => setProcesses(processes.filter(p => p._id !== id)))
      .catch(error => console.error('Error deleting process:', error));
  };

  const renderProcess = (proc, level = 0) => (
    <div key={proc._id}>
      <ListItem sx={{ pl: level * 4 }}> {/* Einzug mit pl: level * 4 hinzugefügt */}
        <ListItemIcon>
          <WorkIcon sx={{ color: '#000000' }} /> {/* Blau für Prozesse */}
        </ListItemIcon>
        <TextField
          value={proc.name}
          onChange={(e) => handleEditProcess(proc._id, { ...proc, name: e.target.value })}
          variant="outlined"
          size="small"
          sx={{ mr: 2, width: 150 }}
        />
        <TextField
          value={proc.abbreviation}
          onChange={(e) => handleEditProcess(proc._id, { ...proc, abbreviation: e.target.value })}
          variant="outlined"
          size="small"
          sx={{ mr: 2, width: 100 }}
        />
        <TextField
          value={proc.description}
          onChange={(e) => handleEditProcess(proc._id, { ...proc, description: e.target.value })}
          variant="outlined"
          size="small"
          sx={{ mr: 2, width: 200 }}
        />
        <FormControl sx={{ mr: 2, width: 150 }}>
          <InputLabel>Übergeordnet</InputLabel>
          <Select
            value={proc.isJuniorTo?._id || proc.isJuniorTo || ''}
            onChange={(e) => {
              const value = e.target.value === '' ? null : e.target.value;
              // Verhindere zirkuläre Verweise und Selbstverweis
              if (value && (value === proc._id || isCircular(value, proc._id, new Map(processes.map(p => [p._id, p]))))) {
                return; // Verhindere die Änderung
              }
              handleEditProcess(proc._id, { ...proc, isJuniorTo: value });
            }}
            renderValue={(selected) => {
              const selectedProcess = processes.find(p => p && p._id === selected);
              return selectedProcess ? selectedProcess.name : '';
            }}
          >
            <MenuItem value="">Keine</MenuItem>
            {processes.filter(p => p && p._id !== proc._id && !isCircular(proc._id, p._id, new Map(processes.map(p => [p._id, p])))).map(p => (
              <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <IconButton onClick={() => handleDeleteProcess(proc._id)}>
          <Delete />
        </IconButton>
      </ListItem>
      {proc.children.length > 0 && proc.children.map(child => renderProcess(child, level + 1))}
    </div>
  );

  const { root, groups } = buildHierarchy();

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>Prozessgruppen und Prozesse</Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Name"
          value={newGroup.name}
          onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
          sx={{ mr: 2, width: 150 }}
        />
        <TextField
          label="Abkürzung"
          value={newGroup.abbreviation}
          onChange={(e) => setNewGroup({ ...newGroup, abbreviation: e.target.value })}
          sx={{ mr: 2, width: 100 }}
        />
        <TextField
          label="Beschreibung"
          value={newGroup.description}
          onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
          sx={{ mr: 2, width: 200 }}
        />
        <Button variant="contained" onClick={handleAddGroup}>Hinzufügen</Button>
      </Box>
      {groups.map(group => (
        <div key={group._id}>
          <ListItem sx={{ mb: 2 }}>
            <ListItemIcon>
              <FolderIcon sx={{ color: '#ff6e4a' }} /> {/* Dunkles Rot */}
            </ListItemIcon>
            <TextField
              value={group.name}
              onChange={(e) => handleEditGroup(group._id, { ...group, name: e.target.value })}
              variant="outlined"
              size="small"
              sx={{ mr: 2, width: 150 }}
            />
            <TextField
              value={group.abbreviation}
              onChange={(e) => handleEditGroup(group._id, { ...group, abbreviation: e.target.value })}
              variant="outlined"
              size="small"
              sx={{ mr: 2, width: 100 }}
            />
            <TextField
              value={group.description}
              onChange={(e) => handleEditGroup(group._id, { ...group, description: e.target.value })}
              variant="outlined"
              size="small"
              sx={{ mr: 2, width: 200 }}
            />
            <IconButton onClick={() => handleDeleteGroup(group._id)}>
              <Delete />
            </IconButton>
          </ListItem>
          <List>
            {root.filter(proc => proc && proc.processGroup && proc.processGroup._id === group._id).map(proc => renderProcess(proc))}
          </List>
        </div>
      ))}
      <Box sx={{ mt: 2 }}>
        <TextField
          label="Name"
          value={newProcess.name}
          onChange={(e) => setNewProcess({ ...newProcess, name: e.target.value })}
          sx={{ mr: 2, width: 150 }}
        />
        <TextField
          label="Abkürzung"
          value={newProcess.abbreviation}
          onChange={(e) => setNewProcess({ ...newProcess, abbreviation: e.target.value })}
          sx={{ mr: 2, width: 100 }}
        />
        <TextField
          label="Beschreibung"
          value={newProcess.description}
          onChange={(e) => setNewProcess({ ...newProcess, description: e.target.value })}
          sx={{ mr: 2, width: 200 }}
        />
        <FormControl sx={{ mr: 2, width: 150 }}>
          <InputLabel>Prozessgruppe</InputLabel>
          <Select
            value={newProcess.processGroup || ''}
            onChange={(e) => {
              const value = e.target.value === '' ? null : e.target.value;
              setNewProcess({ ...newProcess, processGroup: value });
            }}
            renderValue={(selected) => {
              const selectedGroup = processGroups.find(g => g && g._id === selected);
              return selectedGroup ? selectedGroup.name : '';
            }}
          >
            <MenuItem value="">Keine</MenuItem>
            {processGroups.filter(g => g && g._id).map(g => (
              <MenuItem key={g._id} value={g._id}>{g.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ mr: 2, width: 150 }}>
          <InputLabel>Übergeordnet</InputLabel>
          <Select
            value={newProcess.isJuniorTo || ''}
            onChange={(e) => {
              const value = e.target.value === '' ? null : e.target.value;
              // Verhindere zirkuläre Verweise und Selbstverweis
              if (value && (value === newProcess._id || isCircular(value, newProcess._id, new Map(processes.map(p => [p._id, p]))))) {
                return; // Verhindere die Änderung
              }
              setNewProcess({ ...newProcess, isJuniorTo: value });
            }}
            renderValue={(selected) => {
              const selectedProcess = processes.find(p => p && p._id === selected);
              return selectedProcess ? selectedProcess.name : '';
            }}
          >
            <MenuItem value="">Keine</MenuItem>
            {processes.filter(p => p && p._id !== newProcess._id && !isCircular(newProcess._id, p._id, new Map(processes.map(p => [p._id, p])))).map(p => (
              <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleAddProcess}>Prozess hinzufügen</Button>
      </Box>
    </Box>
  );
};

export default ProcessGroups;