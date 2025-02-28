import { Chart } from 'react-google-charts';

const GanttProject = () => {
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

  return (
    <Chart
      chartType="Gantt"
      width="100%"
      height="400px"
      data={data}
    />
  );
};

export default GanttProject;