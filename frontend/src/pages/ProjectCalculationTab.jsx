// src/pages/ProjectCalculationTab.jsx

import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { calculateProject } from '../utils/projectCalculation';

export const ProjectCalculationTab = ({ activities }) => {
  const [roles, setRoles] = useState({});

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

  const calculatedActivities = calculateProject(activities).map(activity => ({
    ...activity,
    roleName: roles[activity.role] || (activity.role === 'unknown' ? 'Nicht besetzt (Risiko)' : activity.role),
  }));

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
              <TableCell>{activity.end.toLocaleDateString()}</TableCell>
              <TableCell>{activity.cost.toFixed(2)}</TableCell>
              <TableCell>{activity.hasStartConflict ? 'Ja' : 'Nein'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Typography variant="h6" sx={{ mt: 2 }}>Gantt-Diagramm (wird später hinzugefügt)</Typography>
      <div id="gantt_chart" style={{ width: '100%', height: '400px' }} />
    </Box>
  );
};