// src/pages/ProjectCalculationTab.jsx

import React, { useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Loader } from '@google/charts/loader';
import { calculateProject } from '../utils/projectCalculation';

const ProjectCalculationTab = ({ activities }) => {
  // Google Gantt-Diagramm laden
  useEffect(() => {
    if (activities.length > 0) {
      Loader.load({
        packages: ['gantt'],
        callback: () => {
          const calculatedActivities = calculateProject(activities);
          const data = new window.google.visualization.DataTable();
          data.addColumn('string', 'Task ID');
          data.addColumn('string', 'Task Name');
          data.addColumn('string', 'Resource');
          data.addColumn('date', 'Start Date');
          data.addColumn('date', 'End Date');
          data.addColumn('number', 'Duration');
          data.addColumn('number', 'Percent Complete');
          data.addColumn('string', 'Dependencies');

          const rows = calculatedActivities.map(activity => [
            activity.id,
            activity.name,
            activity.role === 'unknown' ? 'Nicht besetzt (Risiko)' : activity.role,
            activity.start,
            activity.end,
            null, // Duration wird von Google Gantt berechnet
            0, // Percent Complete (Platzhalter)
            null, // Dependencies (Platzhalter)
          ]);

          data.addRows(rows);

          const chart = new window.google.visualization.Gantt(document.getElementById('gantt_chart'));
          chart.draw(data, {
            height: calculatedActivities.length * 50 + 50,
            gantt: {
              criticalPathEnabled: true,
              criticalPathStyle: { stroke: '#e00', strokeWidth: 5 },
              trackHeight: 50,
            },
          });
        },
      });
    }
  }, [activities]);

  const calculatedActivities = calculateProject(activities);

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
              <TableCell>{activity.role === 'unknown' ? 'Nicht besetzt (Risiko)' : activity.role}</TableCell>
              <TableCell>{activity.duration}</TableCell>
              <TableCell>{activity.end.toLocaleDateString()}</TableCell>
              <TableCell>{activity.cost.toFixed(2)}</TableCell>
              <TableCell>{activity.hasStartConflict ? 'Ja' : 'Nein'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Typography variant="h6" sx={{ mt: 2 }}>Gantt-Diagramm</Typography>
      <div id="gantt_chart" style={{ width: '100%', height: '400px' }} />
    </Box>
  );
};

export default ProjectCalculationTab;