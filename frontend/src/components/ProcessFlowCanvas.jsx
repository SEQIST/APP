import React, { useCallback } from 'react';
import { Box, Typography } from '@mui/material'; // Box-Import hinzugefügt
import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const ProcessFlowCanvas = ({ nodes, edges, onNodesChange, onEdgesChange }) => (
  <Box sx={{ height: '400px', width: '100%', border: '1px solid #ccc' }}>
    <Typography variant="h6" gutterBottom>Prozessfluss (Aktivitäten)</Typography>
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
    >
      <Background color="#aaa" gap={16} />
      <Controls />
    </ReactFlow>
  </Box>
);

export default ProcessFlowCanvas;