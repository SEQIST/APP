import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import ProcessEditor from '../components/ProcessEditor';
import ProcessFlowCanvas from '../components/ProcessFlowCanvas';
import ActivitySidebar from '../components/ActivitySidebar';

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
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [activities, setActivities] = useState([]); // Zustand für Aktivitäten
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workProducts, setWorkProducts] = useState([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  // Füge workProducts zum fetchData hinzu
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
    fetch('http://localhost:5001/api/work-products').then(r => { // Work Products hinzufügen
      if (!r.ok) throw new Error(`HTTP-Fehler! Status: ${r.status} - ${r.statusText}`);
      return r.json();
    }),
  ])
    .then(([processData, groups, rolesData, activitiesData, workProductsData]) => {
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
      setWorkProducts(workProductsData || []); // Work Products speichern
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

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const handleAddActivity = (activityData) => {
    fetch('http://localhost:5001/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...activityData,
        process: id, // Verknüpfe die Aktivität mit dem aktuellen Prozess
        versionMinor: activityData.versionMinor + 1 // Inkrementiere Minor-Version bei jedem Speichern
      }),
    })
      .then(response => response.json())
      .then(data => {
        setActivities([...activities, data]);
      })
      .catch(error => console.error('Error adding activity:', error));
  };

  if (loading) return <Typography>Lade Prozess...</Typography>;
  if (error) return <Typography>Fehler: {error}</Typography>;

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>{id === 'new' ? 'Neuer Prozess' : 'Prozess bearbeiten'}</Typography>
      <ProcessEditor
        process={process}
        processGroups={processGroups}
        roles={roles}
        onChange={handleChange}
        onQuillChange={handleQuillChange}
      />
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" onClick={handleSave} sx={{ mt: 2 }}>
          Prozess speichern
        </Button>
      </Box>
      <ProcessFlowCanvas 
        nodes={nodes} 
        edges={edges} 
        onNodesChange={onNodesChange} 
        onEdgesChange={onEdgesChange} 
      />
     <ActivitySidebar 
      roles={roles} 
      activities={activities} 
      workProducts={workProducts} // Work Products als Prop hinzufügen
      onAddActivity={handleAddActivity} 
    />
    </Box>
  );
};

export default EditProcess;