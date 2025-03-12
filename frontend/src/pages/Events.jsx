import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';

const Events = ({ events, addEvent }) => {
  const [newEventName, setNewEventName] = React.useState('');

  const handleAddEvent = () => {
    if (newEventName) {
      const newEvent = {
        name: newEventName,
        startDate: null, // Später optional
        workProduct: null, // Später auswählbar
        knownItems: 0,
        unknownItems: 0,
      };
      addEvent(newEvent);
      setNewEventName('');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Events</Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Neues Event"
          value={newEventName}
          onChange={(e) => setNewEventName(e.target.value)}
          sx={{ mr: 2 }}
        />
        <Button variant="contained" onClick={handleAddEvent}>Hinzufügen</Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>Work Product</TableCell>
            <TableCell>Known Items</TableCell>
            <TableCell>Unknown Items</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {events.map((event, index) => (
            <TableRow key={index}>
              <TableCell>{event.name}</TableCell>
              <TableCell>{event.startDate || 'Nicht angegeben'}</TableCell>
              <TableCell>{event.workProduct?.name || 'Nicht angegeben'}</TableCell>
              <TableCell>{event.knownItems || 0}</TableCell>
              <TableCell>{event.unknownItems || 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default Events;