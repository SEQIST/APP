import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ActivityList = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activitiesData, triggersData] = await Promise.all([
          fetch('http://localhost:5001/api/activities').then(r => r.json()),
          fetch('http://localhost:5001/api/triggers').then(r => r.json())
        ]);
        setActivities(activitiesData || []);
        setTriggers(triggersData || []);
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAdd = () => {
    navigate('/activities/new');
  };

  const handleEdit = (activityId) => {
    navigate(`/activities/edit?activityId=${activityId}`);
  };

  const handleTriggerChange = (activityId, triggerId) => {
    fetch(`http://localhost:5001/api/activities/${activityId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ triggeredBy: triggerId })
    })
      .then(response => {
        if (!response.ok) throw new Error('Fehler beim Aktualisieren');
        setActivities(prev => prev.map(activity => 
          activity._id === activityId ? { ...activity, triggeredBy: triggerId } : activity
        ));
      })
      .catch(error => console.error(error));
  };

  if (loading) return <Typography>Lade Aktivitäten...</Typography>;
  if (error) return <Typography>Fehler: {error}</Typography>;

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>Aktivitäten Liste</Typography>
      <Button variant="contained" onClick={handleAdd}>Neue Aktivität hinzufügen</Button>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Ausgelöst durch (Trigger)</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.map(activity => (
              <TableRow key={activity._id}>
                <TableCell>{activity.name}</TableCell>
                <TableCell>
                  <FormControl fullWidth>
                    <Select
                      value={activity.triggeredBy || ''}
                      onChange={(e) => handleTriggerChange(activity._id, e.target.value)}
                    >
                      <MenuItem value="">Kein Trigger</MenuItem>
                      {triggers.map(trigger => (
                        <MenuItem key={trigger._id} value={trigger._id}>{trigger.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleEdit(activity._id)}>Bearbeiten</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ActivityList;