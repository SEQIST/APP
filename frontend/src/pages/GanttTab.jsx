// src/pages/GanttTab.jsx

import React, { useState, useMemo } from 'react';
import { Gantt } from 'gantt-task-react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import 'gantt-task-react/dist/index.css';

const GanttTab = ({ activities }) => {
  const [viewMode, setViewMode] = useState('Month');

  // Konvertiere calculatedActivities in das Format von gantt-task-react
  const tasks = activities.map((activity) => ({
    start: new Date(activity.start),
    end: new Date(activity.end),
    name: activity.name,
    id: activity.id,
    type: 'task',
    progress: 0,
    styles: { progressColor: '#ffbb54', progressSelectedColor: '#ff9e0d' },
  }));

  // Berechne den frühesten Startzeitpunkt aus den Daten
  const earliestStart = useMemo(() => {
    if (tasks.length === 0) return new Date(2025, 0, 1); // Default: 01.01.2025
    return new Date(Math.min(...tasks.map((task) => task.start.getTime())));
  }, [tasks]);

  // Setze den Startzeitpunkt auf 2025
  const displayStartDate = earliestStart < new Date(2025, 0, 1) ? new Date(2025, 0, 1) : earliestStart;

  console.log('Tasks prepared for Gantt:', tasks);
  console.log('Earliest Start Date:', earliestStart);
  console.log('Display Start Date:', displayStartDate);

  return (
    <Box sx={{ p: 2, height: '500px', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Gantt-Diagramm (Live-Daten aus Projektberechnung)
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Zeitskala</InputLabel>
          <Select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
            <MenuItem value="Day">Tage</MenuItem>
            <MenuItem value="Week">Wochen</MenuItem>
            <MenuItem value="Month">Monate</MenuItem>
            <MenuItem value="Year">Jahre</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {activities.length > 0 ? (
        <div style={{ width: '100%', minWidth: '1000px', height: '400px' }}>
          <Gantt
            tasks={tasks}
            viewMode={viewMode}
            columnWidth={viewMode === 'Year' ? 300 : 200}
            listCellWidth="200px"
            barCornerRadius={5}
            barFill={60}
            barProgressColor="#ff9e0d"
            barProgressSelectedColor="#ffbb54"
            barBackgroundColor="#ccc"
            barBackgroundSelectedColor="#999"
            preStepsCount={0}
            viewDate={displayStartDate}
          />
        </div>
      ) : (
        <Typography>Keine berechneten Aktivitäten vorhanden. Bitte überprüfe die Projektberechnung.</Typography>
      )}
    </Box>
  );
};

export default GanttTab;