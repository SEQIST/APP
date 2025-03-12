import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const ProjectDetails = ({ releases, events, addRelease, updateRelease, addEvent, updateEvent }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const projectReleases = releases.filter(r => r.project && r.project.toString() === id);
  const [editMode, setEditMode] = useState(false);
  const [projectData, setProjectData] = useState({
    name: '',
    plannedStartDate: '',
    plannedFinishDate: '',
    budgetPlanned: '',
  });
  const [newReleaseName, setNewReleaseName] = useState('');
  const [editReleaseModal, setEditReleaseModal] = useState(null);
  const [newEventModal, setNewEventModal] = useState(null);
  const [editEventModal, setEditEventModal] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        console.log('Lade Projekt mit ID:', id); // Debugging
        const response = await fetch(`http://localhost:5001/api/projects/${id}`);
        console.log('API-Antwort-Status:', response.status); // Debugging
        if (!response.ok) {
          throw new Error(`Fehler beim Laden des Projekts: ${response.status}`);
        }
        const data = await response.json();
        console.log('Geladenes Projekt:', data); // Debugging
        setProject(data);
        setProjectData({
          name: data.name || '',
          plannedStartDate: data.plannedStartDate || '',
          plannedFinishDate: data.plannedFinishDate || '',
          budgetPlanned: data.budgetPlanned || '',
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching project:', error.message);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProject = async () => {
    try {
      console.log('Aktualisiere Projekt:', projectData); // Debugging
      const response = await fetch(`http://localhost:5001/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });
      if (!response.ok) throw new Error(`Fehler beim Aktualisieren: ${response.status}`);
      const updatedProject = await response.json();
      setProject(updatedProject);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating project:', error.message);
      setError(error.message);
    }
  };

  const handleAddRelease = () => {
    if (newReleaseName) {
      const newRelease = {
        name: newReleaseName,
        plannedStartDate: null,
        plannedEndDate: null,
        version: { major: 1, minor: 0 },
        project: id,
      };
      addRelease(newRelease);
      setNewReleaseName('');
    }
  };

  const handleEditRelease = (release) => {
    setEditReleaseModal({
      _id: release._id,
      name: release.name,
      plannedStartDate: release.plannedStartDate ? release.plannedStartDate.split('T')[0] : '',
      plannedEndDate: release.plannedEndDate ? release.plannedEndDate.split('T')[0] : '',
      version: { ...release.version },
    });
  };

  const handleSaveEditedRelease = () => {
    if (editReleaseModal) {
      updateRelease(editReleaseModal._id, editReleaseModal);
      setEditReleaseModal(null);
    }
  };

  const handleAddEvent = (releaseId) => {
    setNewEventModal({ releaseId, name: '', startDate: '', knownItems: 0, unknownItems: 0 });
  };

  const handleSaveNewEvent = () => {
    if (newEventModal) {
      const newEvent = {
        name: newEventModal.name,
        startDate: newEventModal.startDate || null,
        workProduct: null,
        knownItems: Number(newEventModal.knownItems) || 0,
        unknownItems: Number(newEventModal.unknownItems) || 0,
        release: newEventModal.releaseId,
      };
      addEvent(newEvent);
      setNewEventModal(null);
    }
  };

  const handleEditEvent = (event) => {
    setEditEventModal({
      _id: event._id,
      name: event.name,
      startDate: event.startDate ? event.startDate.split('T')[0] : '',
      knownItems: event.knownItems || 0,
      unknownItems: event.unknownItems || 0,
    });
  };

  const handleSaveEditedEvent = () => {
    if (editEventModal) {
      const updatedEvent = {
        ...editEventModal,
        startDate: editEventModal.startDate || null,
        knownItems: Number(editEventModal.knownItems) || 0,
        unknownItems: Number(editEventModal.unknownItems) || 0,
      };
      updateEvent(editEventModal._id, updatedEvent);
      setEditEventModal(null);
    }
  };

  if (loading) return <Typography>Lade Projekt...</Typography>;
  if (error) return <Typography>Fehler: {error}</Typography>;
  if (!project) return <Typography>Projekt nicht gefunden</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Projekt: {project.name}</Typography>
      {editMode ? (
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Name"
            name="name"
            value={projectData.name}
            onChange={handleChange}
            sx={{ mr: 2, mb: 2 }}
          />
          <TextField
            label="Planned Start Date"
            name="plannedStartDate"
            type="date"
            value={projectData.plannedStartDate || ''}
            onChange={handleChange}
            sx={{ mr: 2, mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Planned Finish Date"
            name="plannedFinishDate"
            type="date"
            value={projectData.plannedFinishDate || ''}
            onChange={handleChange}
            sx={{ mr: 2, mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Budget Planned"
            name="budgetPlanned"
            type="number"
            value={projectData.budgetPlanned || ''}
            onChange={handleChange}
            sx={{ mr: 2, mb: 2 }}
          />
          <Button variant="contained" onClick={handleSaveProject} sx={{ mr: 2 }}>
            Speichern
          </Button>
          <Button variant="outlined" onClick={() => setEditMode(false)}>
            Abbrechen
          </Button>
        </Box>
      ) : (
        <Box sx={{ mb: 2 }}>
          <Typography>Name: {project.name}</Typography>
          <Typography>Planned Start Date: {project.plannedStartDate || 'Nicht angegeben'}</Typography>
          <Typography>Planned Finish Date: {project.plannedFinishDate || 'Nicht angegeben'}</Typography>
          <Typography>Budget Planned: {project.budgetPlanned || 'Nicht angegeben'}</Typography>
          <Button variant="contained" onClick={() => setEditMode(true)} sx={{ mt: 2 }}>
            Bearbeiten
          </Button>
        </Box>
      )}

      <Typography variant="h5" gutterBottom>Releases</Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Neuer Release"
          value={newReleaseName}
          onChange={(e) => setNewReleaseName(e.target.value)}
          sx={{ mr: 2 }}
        />
        <Button variant="contained" onClick={handleAddRelease}>Hinzufügen</Button>
      </Box>
      {projectReleases.map((release) => (
        <Box key={release._id} sx={{ mb: 4 }}>
          <Typography variant="h6">{release.name}</Typography>
          <Table sx={{ mb: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Planned Start Date</TableCell>
                <TableCell>Planned End Date</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{release.name}</TableCell>
                <TableCell>{release.plannedStartDate || 'Nicht angegeben'}</TableCell>
                <TableCell>{release.plannedEndDate || 'Nicht angegeben'}</TableCell>
                <TableCell>{`${release.version.major}.${release.version.minor}`}</TableCell>
                <TableCell>
                  <Button variant="outlined" onClick={() => handleEditRelease(release)}>
                    Bearbeiten
                  </Button>
                  <Button variant="contained" onClick={() => handleAddEvent(release._id)} sx={{ ml: 1 }}>
                    Event hinzufügen
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Typography variant="subtitle1" sx={{ ml: 2 }}>Events</Typography>
          <Table sx={{ ml: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Work Product</TableCell>
                <TableCell>Known Items</TableCell>
                <TableCell>Unknown Items</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events
                .filter(event => event.release && event.release.toString() === release._id)
                .map(event => (
                  <TableRow key={event._id}>
                    <TableCell>{event.name}</TableCell>
                    <TableCell>{event.startDate || 'Nicht angegeben'}</TableCell>
                    <TableCell>{event.workProduct?.name || 'Nicht angegeben'}</TableCell>
                    <TableCell>{event.knownItems || 0}</TableCell>
                    <TableCell>{event.unknownItems || 0}</TableCell>
                    <TableCell>
                      <Button variant="outlined" onClick={() => handleEditEvent(event)}>
                        Bearbeiten
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Box>
      ))}

      {/* Modal für Release-Bearbeitung */}
      <Dialog open={!!editReleaseModal} onClose={() => setEditReleaseModal(null)}>
        <DialogTitle>Release bearbeiten</DialogTitle>
        <DialogContent>
          {editReleaseModal && (
            <>
              <TextField
                label="Name"
                value={editReleaseModal.name}
                onChange={(e) => setEditReleaseModal(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Planned Start Date"
                type="date"
                value={editReleaseModal.plannedStartDate}
                onChange={(e) => setEditReleaseModal(prev => ({ ...prev, plannedStartDate: e.target.value }))}
                fullWidth
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Planned End Date"
                type="date"
                value={editReleaseModal.plannedEndDate}
                onChange={(e) => setEditReleaseModal(prev => ({ ...prev, plannedEndDate: e.target.value }))}
                fullWidth
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Version Major"
                type="number"
                value={editReleaseModal.version.major}
                onChange={(e) => setEditReleaseModal(prev => ({ ...prev, version: { ...prev.version, major: Number(e.target.value) } }))}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Version Minor"
                type="number"
                value={editReleaseModal.version.minor}
                onChange={(e) => setEditReleaseModal(prev => ({ ...prev, version: { ...prev.version, minor: Number(e.target.value) } }))}
                fullWidth
                sx={{ mb: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditReleaseModal(null)}>Abbrechen</Button>
          <Button onClick={handleSaveEditedRelease} variant="contained">Speichern</Button>
        </DialogActions>
      </Dialog>

      {/* Modal für neues Event */}
      <Dialog open={!!newEventModal} onClose={() => setNewEventModal(null)}>
        <DialogTitle>Neues Event hinzufügen</DialogTitle>
        <DialogContent>
          {newEventModal && (
            <>
              <TextField
                label="Name"
                value={newEventModal.name}
                onChange={(e) => setNewEventModal(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Start Date"
                type="date"
                value={newEventModal.startDate}
                onChange={(e) => setNewEventModal(prev => ({ ...prev, startDate: e.target.value }))}
                fullWidth
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Known Items"
                type="number"
                value={newEventModal.knownItems}
                onChange={(e) => setNewEventModal(prev => ({ ...prev, knownItems: e.target.value }))}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Unknown Items"
                type="number"
                value={newEventModal.unknownItems}
                onChange={(e) => setNewEventModal(prev => ({ ...prev, unknownItems: e.target.value }))}
                fullWidth
                sx={{ mb: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewEventModal(null)}>Abbrechen</Button>
          <Button onClick={handleSaveNewEvent} variant="contained">Hinzufügen</Button>
        </DialogActions>
      </Dialog>

      {/* Modal für Event-Bearbeitung */}
      <Dialog open={!!editEventModal} onClose={() => setEditEventModal(null)}>
        <DialogTitle>Event bearbeiten</DialogTitle>
        <DialogContent>
          {editEventModal && (
            <>
              <TextField
                label="Name"
                value={editEventModal.name}
                onChange={(e) => setEditEventModal(prev => ({ ...prev, name: e.target.value }))}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Start Date"
                type="date"
                value={editEventModal.startDate}
                onChange={(e) => setEditEventModal(prev => ({ ...prev, startDate: e.target.value }))}
                fullWidth
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Known Items"
                type="number"
                value={editEventModal.knownItems}
                onChange={(e) => setEditEventModal(prev => ({ ...prev, knownItems: e.target.value }))}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Unknown Items"
                type="number"
                value={editEventModal.unknownItems}
                onChange={(e) => setEditEventModal(prev => ({ ...prev, unknownItems: e.target.value }))}
                fullWidth
                sx={{ mb: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditEventModal(null)}>Abbrechen</Button>
          <Button onClick={handleSaveEditedEvent} variant="contained">Speichern</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetails;