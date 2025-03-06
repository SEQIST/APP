import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Processes = () => {
  const [processes, setProcesses] = useState([]);
  const [roles, setRoles] = useState([]); // Zustand für Rollen
  const [processGroups, setProcessGroups] = useState([]); // Zustand für Prozessgruppen
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch('http://localhost:5001/api/processes').then(r => {
        if (!r.ok) {
          if (r.status === 404) throw new Error('Keine Prozesse gefunden');
          throw new Error(`HTTP-Fehler! Status: ${r.status} - ${r.statusText}`);
        }
        return r.json();
      }),
      fetch('http://localhost:5001/api/roles').then(r => {
        if (!r.ok) throw new Error(`HTTP-Fehler! Status: ${r.status} - ${r.statusText}`);
        return r.json();
      }),
      fetch('http://localhost:5001/api/process-groups').then(r => {
        if (!r.ok) throw new Error(`HTTP-Fehler! Status: ${r.status} - ${r.statusText}`);
        return r.json();
      }),
    ])
      .then(([processesData, rolesData, processGroupsData]) => {
        console.log('Processes:', processesData);
        console.log('Roles:', rolesData);
        console.log('Process Groups:', processGroupsData);
        setProcesses(processesData || []);
        setRoles(rolesData || []);
        setProcessGroups(processGroupsData || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Fehler beim Laden der Daten:', error);
        setError(error.message);
        setLoading(false);
      });
  };

  const handleAddProcess = () => {
    navigate('/create-process'); // Neuer Pfad für das Erstellen eines Prozesses
  };

  const handleEditProcess = (processId) => {
    navigate(`/edit-processes/${processId.toString()}`); // Anpassen des Pfads, um mit App.jsx übereinzustimmen
  };

  if (loading) return <Typography>Lade Prozesse...</Typography>;
  if (error) return <Typography>Fehler: {error}</Typography>;

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>Prozesse</Typography>
      <Button variant="contained" onClick={handleAddProcess} startIcon={<Add />} sx={{ mb: 2 }}>
        Prozess hinzufügen
      </Button>
      <List>
        {processes.length === 0 ? (
          <Typography>Keine Prozesse gefunden.</Typography>
        ) : (
          processes.map(process => {
            // Holen Sie sich die verknüpften Daten für owner und processGroup
            // Prüfen Sie, ob owner und processGroup als Objekte mit name oder als String vorliegen
            const ownerObj = process.owner || {};
            const processGroupObj = process.processGroup || {};

            // Extrahieren Sie die IDs und Namen
            const ownerId = ownerObj._id?.toString() || ownerObj.toString() || '';
            const processGroupId = processGroupObj._id?.toString() || processGroupObj.toString() || '';

            // Finden Sie die zugehörigen Namen direkt aus dem Objekt oder über _id
            const owner = ownerObj.name || (roles.find(role => role._id.toString() === ownerId)?.name || 'Kein Eigentümer');
            const processGroup = processGroupObj.name || (processGroups.find(pg => pg._id.toString() === processGroupId)?.name || 'Keine Prozessgruppe');

            // Debugging-Logs für die Analyse
            console.log('Process:', process);
            console.log('Owner Object:', ownerObj);
            console.log('Process Group Object:', processGroupObj);
            console.log('Owner ID:', ownerId);
            console.log('Process Group ID:', processGroupId);
            console.log('Owner:', owner);
            console.log('Process Group:', processGroup);

            return (
              <ListItem
                key={process._id}
                secondaryAction={
                  <IconButton onClick={() => handleEditProcess(process._id.toString())} edge="end">
                    <Edit />
                  </IconButton>
                }
              >
                <ListItemText 
                  primary={process.name || 'Kein Name'} 
                  secondary={`Abk.: ${process.abbreviation || 'Keine'}, Eigentümer: ${owner}, Gruppe: ${processGroup}`} 
                />
              </ListItem>
            );
          })
        )}
      </List>
    </Box>
  );
};

export default Processes;