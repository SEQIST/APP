import { useState, useEffect, useCallback } from 'react';
import { ReactFlow, Background, Controls, applyNodeChanges, Handle } from '@xyflow/react';
import dagre from 'dagre';
import { Typography } from '@mui/material';
import '@xyflow/react/dist/style.css';

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
const getLayoutedElements = (nodes, edges) => {
  dagreGraph.setGraph({ rankdir: 'TB' });

  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: 150, height: 50 });
  });

  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map(node => ({
      ...node,
      position: {
        x: dagreGraph.node(node.id).x - 75,
        y: dagreGraph.node(node.id).y - 25,
      },
    })),
    edges,
  };
};

// Benutzerdefinierter Node-Typ mit Handles
const EditableNode = ({ data, id }) => {
  const [label, setLabel] = useState(data.label);
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (event) => {
    setLabel(event.target.value);
  };

  const handleBlur = async () => {
    setIsEditing(false);
    if (label !== data.label) { // Nur bei Änderung speichern
      try {
        const response = await fetch(`http://localhost:5001/api/departments/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: label }),
        });
        if (!response.ok) throw new Error('Fehler beim Speichern in die Datenbank');
        data.onLabelChange(id, label); // Zustand nur bei Erfolg aktualisieren
      } catch (error) {
        console.error('Fehler beim Speichern:', error);
        setLabel(data.label); // Zurücksetzen bei Fehler
      }
    }
  };

  return (
    <div
      style={{
        width: 150,
        height: 50,
        background: '#f0f0f0',
        border: '1px solid #333',
        borderRadius: 5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Handle type="target" position="top" style={{ background: '#555' }} />
      {isEditing ? (
        <input
          value={label}
          onChange={handleChange}
          onBlur={handleBlur}
          autoFocus
          style={{ width: '90%', textAlign: 'center' }}
        />
      ) : (
        <span onDoubleClick={() => setIsEditing(true)}>{label}</span>
      )}
      <Handle type="source" position="bottom" style={{ background: '#555' }} />
    </div>
  );
};

const DepartmentsFlow = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const handleLabelChange = useCallback((id, newLabel) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, label: newLabel } } : node
      )
    );
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/departments');
        if (!response.ok) throw new Error(`Fehler beim Laden der Abteilungen: ${response.status}`);
        const data = await response.json();
        console.log('Fetched departments:', data);

        if (!Array.isArray(data) || data.length === 0) {
          setNodes([]);
          setEdges([]);
          setLoading(false);
          return;
        }

        const newNodes = data.map(dept => ({
          id: dept._id,
          type: 'editable',
          data: { label: dept.name, onLabelChange: handleLabelChange },
          position: { x: 0, y: 0 },
          draggable: true,
        }));

        const newEdges = data
          .filter(dept => dept.isJuniorTo)
          .map(dept => {
            const edge = {
              id: `e${dept.isJuniorTo._id || dept.isJuniorTo}-${dept._id}`,
              source: dept.isJuniorTo._id || dept.isJuniorTo,
              target: dept._id,
              type: 'step',
              style: { stroke: '#333', strokeWidth: 2 },
            };
            console.log('Edge created:', edge);
            return edge;
          });

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);
        console.log('Layouted nodes:', layoutedNodes);
        console.log('Layouted edges:', layoutedEdges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchDepartments();
  }, [handleLabelChange]);

  if (loading) return <Typography>Lade Abteilungen...</Typography>;
  if (error) return <Typography>Fehler: {error}</Typography>;
  if (nodes.length === 0) return <Typography>Keine Abteilungen vorhanden</Typography>;

  return (
    <div style={{ width: '100%', height: '500px', border: '1px solid red' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        nodeTypes={{ editable: EditableNode }}
        fitView
      >
        <Background color="#aaa" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default DepartmentsFlow;