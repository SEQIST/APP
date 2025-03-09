// src/pages/EditProcess.jsx

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
  const [workProducts, setWorkProducts] = useState([]);
  const [simulationData, setSimulationData] = useState({ workProducts: [{ name: 'Start WP For Process Test', known: 10, unknown: 10 }] });
  const [calculatedActivities, setCalculatedActivities] = useState([]); // Neuer State für berechnete Aktivitäten
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const processResponse = await fetch(`http://localhost:5001/api/processes/${id}`);
        if (!processResponse.ok) throw new Error(`Fehler beim Laden des Prozesses: ${await processResponse.text()}`);
        const processData = await processResponse.json();

        const activitiesResponse = await fetch(`http://localhost:5001/api/activities?process=${id}`);
        if (!activitiesResponse.ok) throw new Error(`Fehler beim Laden der Aktivitäten: ${await activitiesResponse.text()}`);
        const activitiesData = await activitiesResponse.json();

        const dummyWorkProducts = [
          { _id: '67c979f9befee17e3650ef0f', name: 'TestProdukt' },
          { _id: '67cab06e61d4d5c076820446', name: 'Work Produkt 11' },
          { _id: '67cab06e61d4d5c076820440', name: 'Work Produkt 15' },
          { _id: '67cab06e61d4d5c07682044e', name: 'Start WP For Process Test' },
          { _id: '67cab06e61d4d5c076820450', name: 'Work Produkt 99' },
          { _id: '67cab06e61d4d5c076820452', name: 'Work Produkt 100' },
        ];

        const filteredActivities = activitiesData.filter(a => a.process === id || (a.process && a.process._id === id));

        setProcess(processData);
        setActivities(filteredActivities);
        setWorkProducts(dummyWorkProducts);
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) return <Typography>Lade Prozess...</Typography>;
  if (error) return <Typography>Fehler: {error}</Typography>;
  if (!process) return <Typography>Prozess nicht gefunden</Typography>;

  console.log('Calculated Activities in EditProcess:', calculatedActivities); // Debugging-Log

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
      {tabValue === 1 && (
        <ProcessSimulationTab
          simulationData={simulationData}
          setSimulationData={setSimulationData}
          activities={activities}
          workProducts={workProducts}
        />
      )}
      {tabValue === 2 && (
        <GanttTab activities={calculatedActivities} /> // Berechnete Aktivitäten verwenden
      )}
      {tabValue === 3 && (
        <ProjectCalculationTab
          activities={activities}
          simulationData={simulationData}
          setCalculatedActivities={setCalculatedActivities} // Callback für berechnete Aktivitäten
        />
      )}
    </Box>
  );
};

export default EditProcess;