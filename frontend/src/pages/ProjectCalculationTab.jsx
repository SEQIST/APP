// src/pages/ProjectCalculationTab.jsx

import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { calculateProject } from '../utils/projectCalculation';

export const ProjectCalculationTab = ({ activities, simulationData, setCalculatedActivities }) => {
  const [roles, setRoles] = useState({});
  const [calculatedActivities, setLocalCalculatedActivities] = useState([]);

  useEffect(() => {
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
      } catch (error) {
        console.error('Fehler beim Laden der Rollen:', error);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    try {
      const result = calculateProject(activities, simulationData);
      const mappedActivities = result.map(activity => {
        const start = new Date(activity.start);
        const end = new Date(activity.end);
        console.log('Raw start:', activity.start, 'Converted start:', start);
        console.log('Raw end:', activity.end, 'Converted end:', end);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.error('Invalid date for activity:', activity);
          return null; // Überspringe ungültige Aktivitäten
        }

        return {
          ...activity,
          roleName: roles[activity.role] || (activity.role === 'unknown' ? 'Nicht besetzt (Risiko)' : activity.role),
          start: start,
          end: end,
        };
      }).filter(activity => activity !== null);
      console.log('Calculated Activities in ProjectCalculationTab:', mappedActivities);
      setLocalCalculatedActivities(mappedActivities);
      setCalculatedActivities(mappedActivities);
    } catch (error) {
      console.error('Fehler bei der Berechnung:', error);
    }
  }, [activities, roles, simulationData, setCalculatedActivities]);

  const totalDays = calculatedActivities.reduce((sum, activity) => sum + (activity.duration || 0), 0);
  const totalKnownHours = calculatedActivities.reduce((sum, activity) => sum + (activity.knownDuration || 0), 0);
  const totalEstimatedHours = calculatedActivities.reduce((sum, activity) => sum + (activity.estimatedDuration || 0), 0);
  const totalHours = totalKnownHours + totalEstimatedHours;
  const totalCost = calculatedActivities.reduce((sum, activity) => sum + (activity.cost || 0), 0);

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
          <TableRow>
            <TableCell colSpan={3}><strong>Gesamt</strong></TableCell>
            <TableCell><strong>{totalDays.toFixed(2)}</strong></TableCell>
            <TableCell><strong>{totalKnownHours.toFixed(2)}</strong></TableCell>
            <TableCell><strong>{totalEstimatedHours.toFixed(2)}</strong></TableCell>
            <TableCell></TableCell>
            <TableCell><strong>{totalCost.toFixed(2)}</strong></TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );
};