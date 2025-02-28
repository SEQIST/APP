import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, TextField, Button, IconButton } from '@mui/material';
import { Edit, Delete, ArrowUpward, ArrowDownward } from '@mui/icons-material';

const WorkProducts = () => {
  const [workProducts, setWorkProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    fetch('http://localhost:5001/api/workproducts')
      .then(response => response.json())
      .then(data => setWorkProducts(data))
      .catch(error => console.error('Error fetching work products:', error));
  }, []);

  const filteredProducts = workProducts.filter(wp =>
    wp.name.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    const order = sortDirection === 'asc' ? 1 : -1;
    return order * a[sortField].localeCompare(b[sortField]);
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAdd = () => {
    fetch('http://localhost:5001/api/workproducts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, description: newDescription }),
    })
      .then(response => response.json())
      .then(data => {
        setWorkProducts([...workProducts, data]);
        setNewName('');
        setNewDescription('');
      })
      .catch(error => console.error('Error adding work product:', error));
  };

  const handleEdit = (id, updatedWp) => {
    fetch(`http://localhost:5001/api/workproducts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedWp),
    })
      .then(response => response.json())
      .then(data => {
        setWorkProducts(workProducts.map(wp => (wp._id === id ? data : wp)));
      })
      .catch(error => console.error('Error editing work product:', error));
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:5001/api/workproducts/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        setWorkProducts(workProducts.filter(wp => wp._id !== id));
      })
      .catch(error => console.error('Error deleting work product:', error));
  };

  return (
    <div style={{ padding: 20 }}>
      <TextField
        label="Suche"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        style={{ marginBottom: 20 }}
      />
      <TextField
        label="Name"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        style={{ marginBottom: 20, marginRight: 10 }}
      />
      <TextField
        label="Beschreibung"
        value={newDescription}
        onChange={(e) => setNewDescription(e.target.value)}
        style={{ marginBottom: 20, marginRight: 10 }}
      />
      <Button onClick={handleAdd} variant="contained" style={{ marginBottom: 20 }}>
        Hinzufügen
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              Name
              <IconButton onClick={() => handleSort('name')}>
                {sortField === 'name' && sortDirection === 'asc' ? <ArrowUpward /> : <ArrowDownward />}
              </IconButton>
            </TableCell>
            <TableCell>
              Beschreibung
              <IconButton onClick={() => handleSort('description')}>
                {sortField === 'description' && sortDirection === 'asc' ? <ArrowUpward /> : <ArrowDownward />}
              </IconButton>
            </TableCell>
            <TableCell>Aktionen</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredProducts.map(wp => (
            <TableRow key={wp._id}>
              <TableCell>
                <TextField
                  value={wp.name}
                  onChange={(e) => handleEdit(wp._id, { ...wp, name: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={wp.description}
                  onChange={(e) => handleEdit(wp._id, { ...wp, description: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleDelete(wp._id)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WorkProducts;