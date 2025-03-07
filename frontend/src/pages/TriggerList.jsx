import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const TriggerList = () => {
  const navigate = useNavigate();
  const [triggers, setTriggers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [triggersData, activitiesData] = await Promise.all([
          fetch('http://localhost:5001/api/triggers').then(r => r.json()),
          fetch('http://localhost:5001/api/activities').then(r => r.json())
        ]);
        console.log('Geladene Triggers:', triggersData); // Debugging
        setTriggers(Array.isArray(triggersData) ? triggersData : []);
        setActivities(Array.isArray(activitiesData) ? activitiesData : []);
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEdit = (triggerId) => {
    console.log('Navigiere zu Trigger-ID:', triggerId); // Debugging
    navigate(`/triggers/edit/${triggerId}`);
  };

  const handleAdd = () => {
    navigate('/triggers/new');
  };

  if (loading) return <Typography>Lade Trigger...</Typography>;
  if (error) return <Typography>Fehler: {error}</Typography>;

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>Trigger Liste</Typography>
      <Button variant="contained" onClick={handleAdd}>Neuen Trigger hinzufügen</Button>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Arbeitsprodukte</TableCell>
              <TableCell>Zeit-Trigger</TableCell>
              <TableCell>Arbeitslast</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(triggers) && triggers.length > 0 ? (
              triggers.map(trigger => (
                <TableRow key={trigger._id}>
                  <TableCell>
                    {trigger.workProducts.map(wp => wp.workProduct?.name || wp.workProduct).join(', ')}
                  </TableCell>
                  <TableCell>
                    {trigger.timeTrigger.value} {trigger.timeTrigger.unit}{trigger.timeTrigger.repetition ? ` (${trigger.timeTrigger.repetition})` : ''}
                  </TableCell>
                  <TableCell>
                    {trigger.workloadLoad?.name || trigger.workloadLoad}
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleEdit(trigger._id)}>Bearbeiten</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4}>Keine Trigger verfügbar</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TriggerList;