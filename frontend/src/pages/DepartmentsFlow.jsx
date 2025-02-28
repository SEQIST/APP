import { useState, useEffect, useCallback } from 'react';
import { ReactFlow, Background, Controls, applyNodeChanges } from '@xyflow/react';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';

// Dagre Graph für Layout
const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
const getLayoutedElements = (nodes, edges) => {
  dagreGraph.setGraph({ rankdir: 'TB' }); // Top-to-Bottom

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
        x: dagreGraph.node(node.id).x - 75, // Zentrieren
        y: dagreGraph.node(node.id).y - 25,
      },
    })),
    edges,
  };
};

const DepartmentsFlow = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  useEffect(() => {
    fetch('http://localhost:5001/api/departments')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched departments:', data);

        // Baue Knoten
        const newNodes = data.map(dept => ({
          id: dept._id,
          data: { label: dept.name },
          position: { x: 0, y: 0 }, // Wird später layouted
          draggable: true, // Verschiebbar
          style: { 
            width: 150, 
            height: 50, 
            background: '#f0f0f0', 
            border: '1px solid #333', 
            borderRadius: 5, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          },
        }));

        // Baue Kanten (nur Senior zu Junior)
        const newEdges = data
          .filter(dept => dept.isJuniorTo) // Nur Abteilungen mit übergeordneter Abteilung
          .map(dept => ({
            id: `e${dept.isJuniorTo}-${dept._id}`,
            source: dept.isJuniorTo._id || dept.isJuniorTo, // Senior
            target: dept._id, // Junior
            type: 'step', // Eckige Pfeile
            style: { stroke: '#333', strokeWidth: 2 },
          }));

        // Layout anwenden
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      })
      .catch(error => console.error('Error fetching departments:', error));
  }, []);

  return (
    <div style={{ width: '100%', height: '500px', border: '1px solid red' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        fitView
      >
        <Background color="#aaa" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default DepartmentsFlow;