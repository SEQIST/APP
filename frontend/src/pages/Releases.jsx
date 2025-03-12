import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, TextField } from '@mui/material'; // TextField importieren

const Releases = ({ releases, addRelease }) => {
  const [newReleaseName, setNewReleaseName] = React.useState('');

  const handleAddRelease = () => {
    if (newReleaseName) {
      const newRelease = {
        name: newReleaseName,
        plannedStartDate: null,
        plannedEndDate: null,
        version: { major: 1, minor: 0 },
      };
      addRelease(newRelease);
      setNewReleaseName('');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Releases</Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Neuer Release"
          value={newReleaseName}
          onChange={(e) => setNewReleaseName(e.target.value)}
          sx={{ mr: 2 }}
        />
        <Button variant="contained" onClick={handleAddRelease}>Hinzufügen</Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Planned Start Date</TableCell>
            <TableCell>Planned End Date</TableCell>
            <TableCell>Version</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {releases.map((release, index) => (
            <TableRow key={index}>
              <TableCell>{release.name}</TableCell>
              <TableCell>{release.plannedStartDate || 'Nicht angegeben'}</TableCell>
              <TableCell>{release.plannedEndDate || 'Nicht angegeben'}</TableCell>
              <TableCell>{`${release.version.major}.${release.version.minor}`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default Releases;