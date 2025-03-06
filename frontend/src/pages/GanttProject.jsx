import React, { useEffect, useState } from 'react'; // Füge useEffect und useState hinzu für bessere Kontrolle
import { Chart } from 'react-google-charts';

const GanttProject = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Lade Google Charts explizit, um Version-Konflikte zu vermeiden
    const loadGoogleCharts = () => {
      if (window.google && window.google.charts) {
        window.google.charts.load('current', { packages: ['gantt'] });
        window.google.charts.setOnLoadCallback(() => setIsLoaded(true));
      } else {
        console.error('Google Charts konnte nicht geladen werden.');
        setIsLoaded(true); // Fallback, um Rendering zu ermöglichen
      }
    };

    loadGoogleCharts();
  }, []);

  const columns = [
    { type: 'string', label: 'Task ID' },
    { type: 'string', label: 'Task Name' },
    { type: 'date', label: 'Start Date' },    // Explizit als 'date'
    { type: 'date', label: 'End Date' },      // Explizit als 'date'
    { type: 'number', label: 'Duration' },
    { type: 'number', label: 'Percent Complete' },
    { type: 'string', label: 'Dependencies' },
  ];

  const rows = [
    ['1', 'Task 1', new Date('2025-03-01'), new Date('2025-03-06'), null, 100, null],
    ['2', 'Task 2', new Date('2025-03-06'), new Date('2025-03-09'), null, 100, null],
  ];

  const data = [columns, ...rows];

  const options = {
    height: 400,
    gantt: {
      defaultStartDateMillis: new Date('2025-03-01').getTime(),
    },
  };

  if (!isLoaded) return <div>Lade Gantt-Diagramm...</div>; // Lade-Indikator

  return (
    <div>
      <h1>Gantt des Projektes</h1>
      <Chart
        chartType="Gantt"
        width="100%"
        height="400px"
        data={data}
        options={options}
      />
    </div>
  );
};

export default GanttProject;