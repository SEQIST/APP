import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import ProcessDetailsTab from './ProcessDetailsTab';
import ProcessSimulationTab from './ProcessSimulationTab';
import GanttTab from './GanttTab';
import { ProjectCalculationTab } from './ProjectCalculationTab';

const EditProcess = () => {
  const { id } = useParams();
  const [process, setProcess] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchProcess = async () => {
      try {
        console.log('Lade Prozess mit ID:', id);
        const response = await fetch(`http://localhost:5001/api/processes/${id}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Fehler beim Laden des Prozesses: ${errorText}`);
        }
        const data = await response.json();
        setProcess(data);
        const activitiesResponse = await fetch(`http://localhost:5001/api/activities?process=${id}`);
        if (!activitiesResponse.ok) {
          const errorText = await activitiesResponse.text();
          throw new Error(`Fehler beim Laden der Aktivitäten: ${errorText}`);
        }
        const activitiesData = await activitiesResponse.json();
        setActivities(activitiesData.filter(a => a.process === id || a.process?._id === id));
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchProcess();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) return <Typography>Lade Prozess...</Typography>;
  if (error) return <Typography>Fehler: {error}</Typography>;
  if (!process) return <Typography>Prozess nicht gefunden</Typography>;

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Prozess bearbeiten: {process.name}
      </Typography>
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Details" />
        <Tab label="Simulation" />
        <Tab label="Gantt" />
        <Tab label="Projektberechnung" />
      </Tabs>
      {tabValue === 0 && (
        <ProcessDetailsTab
          process={process}
          setProcess={setProcess}
          activities={activities}
          setActivities={setActivities}
        />
      )}
      {tabValue === 1 && <ProcessSimulationTab process={process} setProcess={setProcess} />}
      {tabValue === 2 && <GanttTab process={process} activities={activities} />}
      {tabValue === 3 && <ProjectCalculationTab activities={activities} />}
    </Box>
  );
};

export default EditProcess;