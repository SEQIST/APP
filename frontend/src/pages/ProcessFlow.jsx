import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes = [
  { id: '1', data: { label: 'Prozess 1' }, position: { x: 250, y: 5 } },
  { id: '2', data: { label: 'Prozess 2' }, position: { x: 100, y: 100 } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
];

const ProcessFlow = () => {
  return (
    <div style={{ width: '100%', height: '500px', border: '1px solid red' }}>
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default ProcessFlow;