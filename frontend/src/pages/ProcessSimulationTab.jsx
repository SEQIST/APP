// src/pages/ProcessSimulationTab.jsx

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, TextField } from '@mui/material';

const ProcessSimulationTab = ({ simulationData, setSimulationData, activities, workProducts }) => {
  const [editIndex, setEditIndex] = useState(null);
  const [editedValues, setEditedValues] = useState({ known: '', unknown: '' });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newWorkProduct, setNewWorkProduct] = useState(null);
  const [availableWorkProducts, setAvailableWorkProducts] = useState([]);

  useEffect(() => {
    // Nutze die vollständige Work-Product-Liste
    if (workProducts) {
      const wpList = workProducts.map(wp => ({
        name: wp._id,
        label: wp.name,
      }));
      setAvailableWorkProducts(wpList);
      console.log('Verfügbare Work Products:', wpList);
    }
  }, [workProducts]);

  const handleEdit = (index) => {
    setEditIndex(index);
    const wp = simulationData.workProducts[index];
    setEditedValues({ known: wp.known || '', unknown: wp.unknown || '' });
  };

  const handleSave = (index) => {
    const updatedWorkProducts = [...simulationData.workProducts];
    updatedWorkProducts[index] = { ...updatedWorkProducts[index], known: parseInt(editedValues.known), unknown: parseInt(editedValues.unknown) };
    setSimulationData({ ...simulationData, workProducts: updatedWorkProducts });
    setEditIndex(null);
    console.log('Aktualisierte Simulationsdaten:', { ...simulationData, workProducts: updatedWorkProducts });
  };

  const handleDelete = (index) => {
    const updatedWorkProducts = [...simulationData.workProducts];
    updatedWorkProducts.splice(index, 1); // Entfernt das Work Product an der angegebenen Position
    setSimulationData({ ...simulationData, workProducts: updatedWorkProducts });
    console.log('Work Product gelöscht, aktualisierte Simulationsdaten:', { ...simulationData, workProducts: updatedWorkProducts });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedValues({ ...editedValues, [name]: value });
  };

  const handleAddDialogOpen = () => {
    setAddDialogOpen(true);
  };

  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
    setNewWorkProduct(null);
    setEditedValues({ known: '', unknown: '' });
  };

  const handleAddWorkProduct = () => {
    if (newWorkProduct && editedValues.known !== '' && editedValues.unknown !== '') {
      const newWp = { name: newWorkProduct.label, known: parseInt(editedValues.known), unknown: parseInt(editedValues.unknown) };
      setSimulationData({ ...simulationData, workProducts: [...simulationData.workProducts, newWp] });
      handleAddDialogClose();
      console.log('Neues Work Product hinzugefügt:', newWp);
    }
  };

  const handleNewWorkProductChange = (event, newValue) => {
    setNewWorkProduct(newValue);
  };

  return (
    <Box>
      <Typography variant="h6">Simulation</Typography>
      <Button variant="contained" onClick={handleAddDialogOpen} sx={{ mb: 2 }}>
        HINZUFÜGEN
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Work Product</TableCell>
            <TableCell>Bekannt</TableCell>
            <TableCell>Unbekannt</TableCell>
            <TableCell>Aktionen</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {simulationData.workProducts.map((wp, index) => (
            <TableRow key={index}>
              <TableCell>{wp.name}</TableCell>
              <TableCell>
                {editIndex === index ? (
                  <TextField
                    name="known"
                    value={editedValues.known}
                    onChange={handleChange}
                    type="number"
                    size="small"
                  />
                ) : (
                  wp.known || 0
                )}
              </TableCell>
              <TableCell>
                {editIndex === index ? (
                  <TextField
                    name="unknown"
                    value={editedValues.unknown}
                    onChange={handleChange}
                    type="number"
                    size="small"
                  />
                ) : (
                  wp.unknown || 0
                )}
              </TableCell>
              <TableCell>
                {editIndex === index ? (
                  <Button variant="contained" onClick={() => handleSave(index)} size="small">
                    SPEICHERN
                  </Button>
                ) : (
                  <>
                    <Button variant="outlined" onClick={() => handleEdit(index)} size="small" sx={{ mr: 1 }}>
                      EDIT
                    </Button>
                    <Button variant="outlined" color="error" onClick={() => handleDelete(index)} size="small">
                      DELETE
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Popup für Hinzufügen */}
      <Dialog open={addDialogOpen} onClose={handleAddDialogClose}>
        <DialogTitle>Neues Work Product hinzufügen</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={availableWorkProducts}
            getOptionLabel={(option) => option.label}
            value={newWorkProduct}
            onChange={handleNewWorkProductChange}
            renderInput={(params) => <TextField {...params} label="Work Product auswählen" variant="outlined" />}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            name="known"
            label="Bekannt"
            value={editedValues.known}
            onChange={handleChange}
            type="number"
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            name="unknown"
            label="Unbekannt"
            value={editedValues.unknown}
            onChange={handleChange}
            type="number"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose}>ABBRECHEN</Button>
          <Button onClick={handleAddWorkProduct} variant="contained">
            HINZUFÜGEN
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProcessSimulationTab;