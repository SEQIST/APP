import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
const getLayoutedElements = (nodes, edges) => {
  dagreGraph.setGraph({ rankdir: 'TB' }); // Top-to-Bottom

  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: 150, height: 70 }); // Erhöhe die Höhe, um Platz für den Eigentümer zu schaffen
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
        y: dagreGraph.node(node.id).y - 35, // Anpassen für erhöhte Höhe
      },
    })),
    edges,
  };
};

const ProcessFlow = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5001/api/process-groups').then(r => r.json()), // Prozessgruppen hinzufügen
      fetch('http://localhost:5001/api/processes').then(r => r.json()),
      fetch('http://localhost:5001/api/activities').then(r => r.json()),
    ])
      .then(([processGroups, processes, activities]) => {
        console.log('Fetched process groups:', processGroups);
        console.log('Fetched processes:', processes);
        console.log('Fetched activities:', activities);

        // Baue Knoten für Prozessgruppen, Prozesse und Aktivitäten
        const groupNodes = processGroups.map((group, index) => ({
          id: `group-${group._id}`,
          data: { label: `${group.name} (Abk.: ${group.abbreviation || 'Keine'})` },
          position: { x: 0, y: index * 100 }, // Temporäre Position, wird layouted
          draggable: true,
          style: { 
            width: 150, 
            height: 50, 
            background: '#ffbb33', // Gelb für Prozessgruppen
            border: '1px solid #777', 
            borderRadius: 5, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          },
        }));

        const processNodes = processes.map((proc, index) => ({
          id: proc._id,
          data: { 
            label: (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center', padding: 5 }}>{proc.name}</div>
                <div style={{ textAlign: 'right', padding: 5, fontSize: '0.8em', color: '#666' }}>
                  {proc.owner ? proc.owner.name || 'Kein Eigentümer' : 'Kein Eigentümer'}
                </div>
              </div>
            ),
          },
          position: { x: 0, y: (processGroups.length + index) * 100 }, // Temporäre Position, wird layouted
          draggable: true,
          style: { 
            width: 150, 
            height: 70, // Erhöhe die Höhe, um Platz für den Eigentümer zu schaffen
            background: '#f0f0f0', // Grau für Prozesse
            border: '1px solid #333', 
            borderRadius: 5, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          },
        }));

        const activityNodes = activities.map((activity, index) => ({
          id: activity._id,
          data: { label: `${activity.name}\n(Arbeitsprodukt: ${activity.workProduct?.name || 'Kein Arbeitsprodukt'})` },
          position: { x: 0, y: (processGroups.length + processes.length + index) * 100 }, // Temporäre Position
          draggable: true,
          style: { 
            width: 150, 
            height: 70, 
            background: '#e0e0e0', // Hellgrau für Aktivitäten
            border: '1px solid #333', 
            borderRadius: 5, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            whiteSpace: 'pre-wrap' 
          },
        }));

        // Baue Kanten (Prozessgruppe -> Prozess, Prozess -> Prozess, Prozess -> Aktivität)
        const groupToProcessEdges = processes
          .filter(proc => proc.processGroup)
          .map(proc => ({
            id: `e${proc.processGroup._id || proc.processGroup}-process-${proc._id}`,
            source: `group-${proc.processGroup._id || proc.processGroup}`,
            target: proc._id,
            type: 'step', // Eckige Pfeile (90°)
            style: { stroke: '#ffbb33', strokeWidth: 2 }, // Gelb für Prozessgruppe->Prozess-Pfeile
          }));

        const processEdges = processes
          .filter(proc => proc.isJuniorTo)
          .map(proc => ({
            id: `e${proc.isJuniorTo._id || proc.isJuniorTo}-${proc._id}`,
            source: proc.isJuniorTo._id || proc.isJuniorTo,
            target: proc._id,
            type: 'step', // Eckige Pfeile
            style: { stroke: '#333', strokeWidth: 2 },
          }));

        const activityEdges = activities.map(activity => ({
          id: `e${activity.process._id || activity.process}-${activity._id}`,
          source: activity.process._id || activity.process,
          target: activity._id,
          type: 'step', // Eckige Pfeile
          style: { stroke: '#333', strokeWidth: 2 },
        }));

        const allNodes = [...groupNodes, ...processNodes, ...activityNodes];
        const allEdges = [...groupToProcessEdges, ...processEdges, ...activityEdges];

        // Layout anwenden
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(allNodes, allEdges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      })
      .catch(error => console.error('Error fetching process groups, processes, and activities:', error));
  }, []);

  return (
    <div><h1>Organisationsview</h1>
    <div style={{ width: '100%', height: '600px', border: '1px solid red' }}>
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
      </div>
    </div>
  );
};

export default ProcessFlow;