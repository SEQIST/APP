// src/pages/ProjectCalculationTab.jsx

import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { calculateProject } from '../utils/projectCalculation';

export const ProjectCalculationTab = ({ activities, simulationData }) => {
  const [roles, setRoles] = useState({});
  const [calculatedActivities, setCalculatedActivities] = useState([]);

  useEffect(() => {
    console.log('Lade Rollen...');
    const fetchRoles = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/roles');
        if (!response.ok) throw new Error('Fehler beim Laden der Rollen');
        const rolesData = await response.json();
        const roleMap = rolesData.reduce((acc, role) => {
          acc[role._id] = role.name;
          return acc;
        }, {});
        setRoles(roleMap);
        console.log('Rollen geladen:', roleMap);
      } catch (error) {
        console.error('Fehler beim Laden der Rollen:', error);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    console.log('Berechne Aktivitäten mit neuen Simulation-Daten...', simulationData);
    try {
      const result = calculateProject(activities, simulationData);
      const mappedActivities = result.map(activity => ({
        ...activity,
        roleName: roles[activity.role] || (activity.role === 'unknown' ? 'Nicht besetzt (Risiko)' : activity.role),
      }));
      setCalculatedActivities(mappedActivities);
      console.log('Berechnete Aktivitäten:', mappedActivities);
    } catch (error) {
      console.error('Fehler bei der Berechnung:', error);
    }
  }, [activities, roles, simulationData]); // Reagiert auf Änderungen von simulationData

  return (
    <Box>
      <Typography variant="h6">Projektberechnung</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Aktivität</TableCell>
            <TableCell>Start-Datum</TableCell>
            <TableCell>Rolle</TableCell>
            <TableCell>Dauer (Tage)</TableCell>
            <TableCell>Dauer Bekannt (Stunden)</TableCell>
            <TableCell>Dauer Unbekannt (Stunden)</TableCell>
            <TableCell>End-Datum</TableCell>
            <TableCell>Kosten (€)</TableCell>
            <TableCell>Start-Konflikt</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {calculatedActivities.map((activity) => (
            <TableRow key={activity.id}>
              <TableCell>{activity.name}</TableCell>
              <TableCell>{activity.start.toLocaleDateString()}</TableCell>
              <TableCell>{activity.roleName}</TableCell>
              <TableCell>{activity.duration}</TableCell>
              <TableCell>{activity.knownDuration.toFixed(2)}</TableCell>
              <TableCell>{activity.estimatedDuration.toFixed(2)}</TableCell>
              <TableCell>{activity.end.toLocaleDateString()}</TableCell>
              <TableCell>{activity.cost.toFixed(2)}</TableCell>
              <TableCell>{activity.hasStartConflict ? 'Ja' : 'Nein'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Typography variant="h6" sx={{ mt: 2 }}>Gantt-Diagramm (vorübergehend deaktiviert)</Typography>
      <div id="gantt_chart" style={{ width: '100%', height: '400px' }} />
    </Box>
  );
};