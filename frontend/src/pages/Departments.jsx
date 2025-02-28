import { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, TextField, Button, Box, Typography, IconButton, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newIsJuniorTo, setNewIsJuniorTo] = useState('');

  useEffect(() => {
    fetch('http://localhost:5001/api/departments')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched departments:', data);
        setDepartments(data);
      })
      .catch(error => console.error('Error fetching departments:', error));
  }, []);

  const buildHierarchy = () => {
    const root = [];
    const map = new Map();

    departments.forEach(dept => {
      map.set(dept._id, { ...dept, children: [] });
    });

    departments.forEach(dept => {
      const mappedDept = map.get(dept._id);
      if (!dept.isJuniorTo) {
        root.push(mappedDept);
      } else {
        const parent = map.get(dept.isJuniorTo._id || dept.isJuniorTo);
        if (parent) {
          parent.children.push(mappedDept);
        } else {
          console.warn(`Parent not found for ${dept.name}:`, dept.isJuniorTo);
          root.push(mappedDept);
        }
      }
    });

    console.log('Hierarchy root:', root);
    return root;
  };

  const handleAdd = () => {
    fetch('http://localhost:5001/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, description: newDescription, isJuniorTo: newIsJuniorTo || null }),
    })
      .then(response => response.json())
      .then(data => {
        setDepartments([...departments, data]);
        setNewName('');
        setNewDescription('');
        setNewIsJuniorTo('');
      })
      .catch(error => console.error('Error adding department:', error));
  };

  const handleEdit = (id, updatedDept) => {
    fetch(`http://localhost:5001/api/departments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedDept),
    })
      .then(response => response.json())
      .then(data => {
        setDepartments(departments.map(dept => (dept._id === id ? data : dept)));
      })
      .catch(error => console.error('Error editing department:', error));
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:5001/api/departments/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        setDepartments(departments.filter(dept => dept._id !== id));
      })
      .catch(error => console.error('Error deleting department:', error));
  };

  const renderDepartment = (dept, level = 0) => (
    <div key={dept._id}>
      <ListItem sx={{ pl: level * 4 }}>
        <TextField
          value={dept.name}
          onChange={(e) => handleEdit(dept._id, { ...dept, name: e.target.value })}
          variant="outlined"
          size="small"
          sx={{ mr: 2, width: 150 }}
        />
        <TextField
          value={dept.description}
          onChange={(e) => handleEdit(dept._id, { ...dept, description: e.target.value })}
          variant="outlined"
          size="small"
          sx={{ mr: 2, width: 200 }}
        />
        <FormControl sx={{ mr: 2, width: 200 }}>
          <InputLabel>Ist untergeordnet zu</InputLabel>
          <Select
            value={dept.isJuniorTo?._id || dept.isJuniorTo || ''}
            onChange={(e) => handleEdit(dept._id, { ...dept, isJuniorTo: e.target.value || null })}
          >
            <MenuItem value="">Keine</MenuItem>
            {departments.filter(d => d._id !== dept._id).map(d => (
              <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <IconButton onClick={() => handleDelete(dept._id)}>
          <Delete />
        </IconButton>
      </ListItem>
      {dept.children.length > 0 && dept.children.map(child => renderDepartment(child, level + 1))}
    </div>
  );

  const hierarchy = buildHierarchy();

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>Abteilungen</Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          sx={{ mr: 2, width: 150 }}
        />
        <TextField
          label="Beschreibung"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          sx={{ mr: 2, width: 200 }}
        />
        <FormControl sx={{ mr: 2, width: 200 }}>
          <InputLabel>Ist untergeordnet zu</InputLabel>
          <Select
            value={newIsJuniorTo}
            onChange={(e) => setNewIsJuniorTo(e.target.value)}
          >
            <MenuItem value="">Keine</MenuItem>
            {departments.map(dept => (
              <MenuItem key={dept._id} value={dept._id}>{dept.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleAdd}>
          Hinzufügen
        </Button>
      </Box>
      <List>
        {hierarchy.length > 0 ? (
          hierarchy.map(dept => renderDepartment(dept))
        ) : (
          <Typography>Keine Abteilungen gefunden</Typography>
        )}
      </List>
    </Box>
  );
};

export default Departments;