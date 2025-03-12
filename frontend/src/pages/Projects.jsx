import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Starte Laden von Projekten...');
    fetch('http://localhost:5001/api/projects')
      .then(response => {
        if (!response.ok) throw new Error(`Fehler beim Laden: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log('Geladene Projekte:', data);
        setProjects(Array.isArray(data) ? data : []);
      })
      .catch(error => console.error('Error fetching projects:', error));
  }, []);

  const handleAddProject = () => {
    if (newProjectName) {
      const newProject = { name: newProjectName, customer: null }; // Vereinfacht, später Kunden hinzufügen
      console.log('Versuche, Projekt hinzuzufügen:', newProject);
      fetch('http://localhost:5001/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      })
        .then(response => {
          if (!response.ok) throw new Error(`Fehler beim Hinzufügen: ${response.status}`);
          return response.json();
        })
        .then(data => {
          console.log('Erfolgreich hinzugefügt:', data);
          setProjects([...projects, data]);
          setNewProjectName('');
        })
        .catch(error => console.error('Error adding project:', error));
    } else {
      console.error('Kein Projektname eingegeben');
    }
  };

  const handleDeleteProject = (projectId) => {
    console.log('Versuche, Projekt zu löschen mit ID:', projectId);
    fetch(`http://localhost:5001/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(response => {
        if (!response.ok) throw new Error(`Fehler beim Löschen: ${response.status}`);
        return response.json();
      })
      .then(() => {
        console.log('Projekt erfolgreich gelöscht');
        setProjects(projects.filter(project => project._id !== projectId));
      })
      .catch(error => console.error('Error deleting project:', error));
  };

  const handleEdit = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  console.log('Rendering Projects mit projects:', projects);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Projekte</Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Neues Projekt"
          value={newProjectName}
          onChange={(e) => {
            console.log('Textfeld geändert, projects:', projects);
            setNewProjectName(e.target.value);
          }}
          sx={{ mr: 2 }}
        />
        <Button variant="contained" onClick={handleAddProject}>Hinzufügen</Button>
      </Box>
      {Array.isArray(projects) ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project._id}>
                <TableCell>{project.name}</TableCell>
                <TableCell>
                  <Button variant="outlined" onClick={() => handleEdit(project._id)} sx={{ mr: 1 }}>
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteProject(project._id)}
                    startIcon={<DeleteIcon />}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography>Keine Projekte verfügbar oder laden...</Typography>
      )}
    </Box>
  );
};

export default Projects;