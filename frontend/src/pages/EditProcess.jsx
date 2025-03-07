import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography,
  Box,
  TextField,
  Button,
} from '@mui/material';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from '@xyflow/react';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';
import { Person, Inventory } from '@mui/icons-material';

// Dagre Graph für Layout
const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
const getLayoutedElements = (nodes, edges) => {
  dagreGraph.setGraph({ rankdir: 'TB' });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map((node) => ({
      ...node,
      position: {
        x: dagreGraph.node(node.id).x - 100,
        y: dagreGraph.node(node.id).y - 50,
      },
    })),
    edges,
  };
};

// Benutzerdefinierter Knoten-Typ
const CustomNode = ({ data }) => {
  return (
    <Box
      sx={{
        width: 200,
        height: 100,
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
      {/* Target und Source Handles */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0 }}>
        <div type="target" style={{ background: 'transparent', border: 'none' }} />
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0 }}>
        <div type="source" style={{ background: 'transparent', border: 'none' }} />
      </div>

      {/* Name der Aktivität (oben) */}
      <Typography variant="subtitle1" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
        {data.label}
      </Typography>

      {/* Responsible und Work Product (unten, nebeneinander) */}
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
    </Box>
  );
};

const EditProcess = () => {
  const { id } = useParams();
  const [process, setProcess] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const fetchProcess = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/processes/${id}`);
        if (!response.ok) {
          throw new Error('Fehler beim Laden des Prozesses');
        }
        const data = await response.json();
        setProcess(data);

        const activitiesResponse = await fetch(`http://localhost:5001/api/activities?process=${id}`);
        if (!activitiesResponse.ok) {
          throw new Error('Fehler beim Laden der Aktivitäten');
        }
        const activitiesData = await activitiesResponse.json();
        const filteredActivities = activitiesData.filter(
          (activity) => activity.process === id || activity.process?._id === id
        );
        setActivities(filteredActivities);

        setLoading(false);
      } catch (error) {
        console.error('Fehler:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchProcess();
  }, [id]);

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/processes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(process),
      });
      if (!response.ok) {
        throw new Error('Fehler beim Speichern des Prozesses');
      }
      const updatedProcess = await response.json();
      setProcess(updatedProcess);
      alert('Prozess erfolgreich aktualisiert');
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    if (activities.length > 0) {
      // Baue Knoten für Aktivitäten
      const activityNodes = activities.map((activity) => ({
        id: activity._id,
        type: 'custom',
        data: {
          label: activity.name,
          executedByName: activity.executedBy?.name || 'Unbekannt',
          resultName: activity.result?.name || 'Keins',
          resultId: activity.result?._id || activity.result, // Speichere die ID für Kanten
        },
        position: { x: 0, y: 0 },
        draggable: true,
      }));

      // Baue Kanten: Vom Work Product (result) zur Aktivität mit passendem Trigger
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
              source: sourceActivity._id, // Quelle: Aktivität, die das Work Product produziert
              target: targetActivity._id, // Ziel: Aktivität, die das Work Product als Trigger hat
              type: 'step',
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
                color: '#333',
              },
              style: { stroke: '#333', strokeWidth: 2 },
            });
          }
        });
      });

      // Layout anwenden
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(activityNodes, activityEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
  }, [activities]);

  if (loading) return <Typography>Lade Prozess...</Typography>;
  if (error) return <Typography>Fehler: {error}</Typography>;
  if (!process) return <Typography>Prozess nicht gefunden</Typography>;

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Prozess bearbeiten: {process.name}
      </Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Name"
          value={process.name || ''}
          onChange={(e) => setProcess({ ...process, name: e.target.value })}
          sx={{ mr: 2, mb: 2 }}
        />
        <TextField
          label="Abkürzung"
          value={process.abbreviation || ''}
          onChange={(e) => setProcess({ ...process, abbreviation: e.target.value })}
          sx={{ mr: 2, mb: 2 }}
        />
        <TextField
          label="Prozessgruppe"
          value={process.processGroup?.name || 'Keine Prozessgruppe'}
          disabled
          sx={{ mr: 2, mb: 2 }}
        />
        <TextField
          label="Eigentümer"
          value={process.owner?.name || 'Kein Eigentümer'}
          disabled
          sx={{ mr: 2, mb: 2 }}
        />
        <Button variant="contained" onClick={handleSave}>
          Speichern
        </Button>
      </Box>
      <Box sx={{ height: 600, border: '1px solid #ccc' }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={{ custom: CustomNode }}
            style={{ width: '100%', height: '100%' }}
            fitView
            defaultEdgeOptions={{
              type: 'step',
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
                color: '#333',
              },
              style: { stroke: '#333', strokeWidth: 2 },
            }}
          >
            <Background color="#aaa" gap={16} />
            <Controls />
          </ReactFlow>
        </ReactFlowProvider>
      </Box>
    </Box>
  );
};

export default EditProcess;