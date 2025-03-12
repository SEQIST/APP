import React, { useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  Handle,
} from '@xyflow/react';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';
import { Box, Typography } from '@mui/material';
import { Person, Inventory, AccessTime, Expand, Compress } from '@mui/icons-material';

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
const getLayoutedElements = (nodes, edges, savedPositions) => {
  dagreGraph.setGraph({ rankdir: 'TB' });

  nodes.forEach((node) => {
    const savedPos = savedPositions[node.id] || { x: 0, y: 0 };
    dagreGraph.setNode(node.id, { width: 200, height: 120 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map((node) => ({
      ...node,
      position: savedPositions[node.id] || {
        x: dagreGraph.node(node.id).x - 100,
        y: dagreGraph.node(node.id).y - 60,
      }, // Priorisiere gespeicherte Positionen
    })),
    edges,
  };
};

const CustomNode = ({ data }) => {
  console.log('CustomNode data:', data); // Debugging

  return (
    <Box
      sx={{
        width: 200,
        height: 120,
        border: '1px solid #333',
        borderRadius: 2,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 1,
        position: 'relative',
      }}
    >
      <Handle
        type="target"
        position="left" // Ankommende Pfeile links (270°)
        style={{ background: '#555', borderRadius: '50%' }}
      />
      <Handle
        type="source"
        position="right" // Abgehende Pfeile rechts (90°)
        style={{ background: '#555', borderRadius: '50%' }}
      />
      <Typography variant="subtitle1" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
        {data.label}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Person sx={{ fontSize: 16, mr: 0.5 }} />
          <Typography variant="body2">{data.executedByName || 'Unbekannt'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Inventory sx={{ fontSize: 16, mr: 0.5 }} />
          <Typography variant="body2">{data.resultName || 'Keins'}</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccessTime sx={{ fontSize: 16, color: 'green', mr: 0.5 }} />
          <Typography variant="body2">{data.knownTime || 0}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccessTime sx={{ fontSize: 16, color: 'red', mr: 0.5 }} />
          <Typography variant="body2">{data.estimatedTime || 0}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {data.compressor === 'multiply' ? (
            <Expand sx={{ fontSize: 16, mr: 0.5 }} />
          ) : (
            <Compress sx={{ fontSize: 16, mr: 0.5 }} />
          )}
          <Typography variant="body2">{data.multiplicator || 1}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

const nodeTypes = { custom: CustomNode };

const ProcessFlowintern = ({ activities, onNodeClick }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Funktion zum Laden der gespeicherten Positionen
  const loadSavedPositions = () => {
    const savedPositions = localStorage.getItem('nodePositions');
    console.log('Geladene Positionen aus localStorage:', savedPositions); // Debugging
    return savedPositions ? JSON.parse(savedPositions) : {};
  };

  // Funktion zum Speichern der Positionen
  const savePositions = (updatedNodes) => {
    const positions = {};
    updatedNodes.forEach((node) => {
      if (node.position) {
        positions[node.id] = node.position;
      }
    });
    console.log('Speichere Positionen:', positions); // Debugging
    try {
      localStorage.setItem('nodePositions', JSON.stringify(positions));
    } catch (e) {
      console.error('Fehler beim Speichern in localStorage:', e); // Fehlercatching
    }
  };

  useEffect(() => {
    if (activities.length > 0) {
      const savedPositions = loadSavedPositions();
      const activityNodes = activities.map((activity) => ({
        id: activity._id,
        type: 'custom',
        data: {
          label: activity.name,
          executedByName: activity.executedBy?.name || 'Unbekannt',
          resultName: activity.result?.name || 'Keins',
          resultId: activity.result?._id || activity.result,
          knownTime: activity.knownTime || 0,
          estimatedTime: activity.estimatedTime || 0,
          multiplicator: activity.multiplicator || 1,
          compressor: activity.compressor || 'multiply',
        },
        position: savedPositions[activity._id] || { x: 0, y: 0 }, // Verwende gespeicherte Position oder Standard
        draggable: true,
      }));

      const activityEdges = [];
      let edgeIdCounter = 0;

      activities.forEach((sourceActivity) => {
        const sourceResultId = sourceActivity.result?._id || sourceActivity.result;
        if (!sourceResultId) return;

        activities.forEach((targetActivity) => {
          if (sourceActivity._id === targetActivity._id) return;

          const hasTrigger = targetActivity.trigger?.workProducts?.some((wp) => {
            const wpId = wp._id?._id ? wp._id._id.toString() : wp._id.toString();
            return wpId === sourceResultId.toString();
          });

          if (hasTrigger) {
            activityEdges.push({
              id: `e${edgeIdCounter++}`,
              source: sourceActivity._id,
              target: targetActivity._id,
              type: 'step',
              markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#333' },
              sourcePosition: 'right',  // Abgehende Pfeile auf 90° (rechts)
              targetPosition: 'left',   // Ankommende Pfeile auf 270° (links)
              style: { stroke: '#333', strokeWidth: 2 },
            });
          }
        });
      });

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(activityNodes, activityEdges, savedPositions);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
  }, [activities]);

  // Speichere Positionen, wenn sich Knoten ändern
  const onNodesChangeHandler = (changes) => {
    console.log('Knotenänderungen erkannt:', changes); // Debugging
    const updatedNodes = applyNodeChanges(changes, nodes);
    if (changes.some((change) => change.type === 'position')) {
      console.log('Positionsänderung erkannt, speichere...');
      savePositions(updatedNodes);
    }
    setNodes(updatedNodes);
  };

  return (
    <Box sx={{ height: 600, border: '1px solid #ccc' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeHandler} // Aktualisierte Handler für Speicherung
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        style={{ width: '100%', height: '100%' }}
        fitView
      >
        <Background color="#aaa" gap={16} />
        <Controls />
      </ReactFlow>
    </Box>
  );
};

export default ProcessFlowintern;