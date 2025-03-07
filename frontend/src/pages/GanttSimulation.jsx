import React from 'react';
import { Chart } from 'react-google-charts';

const GanttSimulation = () => {
  // Statische Daten für das Gantt-Diagramm
  const data = [
    [
      { type: 'string', label: 'Task ID' },
      { type: 'string', label: 'Task Name' },
      { type: 'string', label: 'Resource' },
      { type: 'date', label: 'Start Date' },
      { type: 'date', label: 'End Date' },
      { type: 'number', label: 'Duration' },
      { type: 'number', label: 'Percent Complete' },
      { type: 'string', label: 'Dependencies' },
    ],
    [
      'task1',
      'Projektplanung',
      'Prozess 1',
      new Date(2025, 2, 1), // Start: 1. März 2025
      new Date(2025, 2, 5), // Ende: 5. März 2025
      null,
      100,
      null,
    ],
    [
      'task2',
      'Entwicklung',
      'Prozess 1',
      new Date(2025, 2, 6), // Start: 6. März 2025
      new Date(2025, 2, 15), // Ende: 15. März 2025
      null,
      50,
      'task1',
    ],
    [
      'task3',
      'Testen',
      'Prozess 2',
      new Date(2025, 2, 16), // Start: 16. März 2025
      new Date(2025, 2, 20), // Ende: 20. März 2025
      null,
      25,
      'task2',
    ],
    [
      'task4',
      'Bereitstellung',
      'Prozess 2',
      new Date(2025, 2, 21), // Start: 21. März 2025
      new Date(2025, 2, 25), // Ende: 25. März 2025
      null,
      0,
      'task3',
    ],
  ];

  // Optionen für das Gantt-Diagramm
  const options = {
    height: 400,
    gantt: {
      trackHeight: 30,
      labelStyle: {
        fontName: 'Arial',
        fontSize: 12,
        color: '#757575',
      },
      barCornerRadius: 5,
      barHeight: 20,
      criticalPathEnabled: true,
      criticalPathStyle: {
        stroke: '#ff0000',
        strokeWidth: 2,
      },
    },
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>GanttSimulation</h1>
      <Chart
        chartType="Gantt"
        width="100%"
        height="400px"
        data={data}
        options={options}
        loader={<div>Lade Diagramm...</div>}
      />
    </div>
  );
};

export default GanttSimulation;