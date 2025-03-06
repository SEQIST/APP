import React from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { Add } from '@mui/icons-material';

const ActivitySidebar = ({ roles, activities, workProducts, onAddActivity }) => {
  const [newActivity, setNewActivity] = React.useState({
    name: '',
    description: '',
    executedBy: '',
    result: '',
    abbreviation: '',
    multiplicator: 1,
    workMode: '0',
    timeIfKnown: '',
    timeIfNew: '',
    versionMajor: 1,
    versionMinor: 0,
  });

  const handleAdd = () => {
    onAddActivity(newActivity);
    setNewActivity({
      name: '',
      description: '',
      executedBy: '',
      result: '',
      abbreviation: '',
      multiplicator: 1,
      workMode: '0',
      timeIfKnown: '',
      timeIfNew: '',
      versionMajor: 1,
      versionMinor: 0,
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontSize: '0.9rem' }}>
        Aktivitäten hinzufügen
      </Typography>
      <List>
        <ListItem>
          <TextField
            label="Name"
            value={newActivity.name}
            onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
            fullWidth
            size="small"
            sx={{ mb: 1, fontSize: '0.9rem' }}
          />
        </ListItem>
        <ListItem>
          <TextField
            label="Beschreibung"
            value={newActivity.description}
            onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
            fullWidth
            size="small"
            sx={{ mb: 1, fontSize: '0.9rem' }}
          />
        </ListItem>
        <ListItem>
          <FormControl fullWidth sx={{ mb: 1 }}>
            <InputLabel>Ausgeführt von (Rolle)</InputLabel>
            <Select
              value={newActivity.executedBy}
              onChange={(e) => setNewActivity({ ...newActivity, executedBy: e.target.value })}
              size="small"
              sx={{ fontSize: '0.9rem' }}
            >
              <MenuItem value="">Keine</MenuItem>
              {roles.map(role => (
                <MenuItem key={role._id} value={role._id} sx={{ fontSize: '0.9rem' }}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </ListItem>
        <ListItem>
          <FormControl fullWidth sx={{ mb: 1 }}>
            <InputLabel>Ergebnis (Work Product)</InputLabel>
            <Select
              value={newActivity.result}
              onChange={(e) => setNewActivity({ ...newActivity, result: e.target.value })}
              size="small"
              sx={{ fontSize: '0.9rem' }}
            >
              <MenuItem value="">Keine</MenuItem>
              {workProducts.map(product => (
                <MenuItem key={product._id} value={product._id} sx={{ fontSize: '0.9rem' }}>
                  {product.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </ListItem>
        <ListItem>
          <TextField
            label="Abkürzung"
            value={newActivity.abbreviation}
            onChange={(e) => setNewActivity({ ...newActivity, abbreviation: e.target.value })}
            fullWidth
            size="small"
            sx={{ mb: 1, fontSize: '0.9rem' }}
          />
        </ListItem>
        <ListItem>
          <TextField
            label="Multiplikator"
            type="number"
            value={newActivity.multiplicator}
            onChange={(e) => setNewActivity({ ...newActivity, multiplicator: Number(e.target.value) })}
            fullWidth
            size="small"
            sx={{ mb: 1, fontSize: '0.9rem' }}
          />
        </ListItem>
        <ListItem>
          <FormControl fullWidth sx={{ mb: 1 }}>
            <InputLabel>Work Mode</InputLabel>
            <Select
              value={newActivity.workMode}
              onChange={(e) => setNewActivity({ ...newActivity, workMode: e.target.value })}
              size="small"
              sx={{ fontSize: '0.9rem' }}
            >
              <MenuItem value="0" sx={{ fontSize: '0.9rem' }}>Einer</MenuItem>
              <MenuItem value="1" sx={{ fontSize: '0.9rem' }}>Jeder</MenuItem>
            </Select>
          </FormControl>
        </ListItem>
        <ListItem>
          <TextField
            label="Zeit (bekannt)"
            value={newActivity.timeIfKnown}
            onChange={(e) => setNewActivity({ ...newActivity, timeIfKnown: e.target.value })}
            fullWidth
            size="small"
            sx={{ mb: 1, fontSize: '0.9rem' }}
          />
        </ListItem>
        <ListItem>
          <TextField
            label="Zeit (geschätzt)"
            value={newActivity.timeIfNew}
            onChange={(e) => setNewActivity({ ...newActivity, timeIfNew: e.target.value })}
            fullWidth
            size="small"
            sx={{ mb: 1, fontSize: '0.9rem' }}
          />
        </ListItem>
        <ListItem>
          <Button variant="contained" onClick={handleAdd} startIcon={<Add />} size="small" sx={{ fontSize: '0.9rem' }}>
            Aktivität hinzufügen
          </Button>
        </ListItem>
      </List>
    </Box>
  );
};

export default ActivitySidebar;