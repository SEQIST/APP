import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, Button, Modal, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Add } from '@mui/icons-material';
import Triggers from '../components/Triggers'; // Import der Triggers-Komponente

const ActivityForm = () => {
  const navigate = useNavigate(); // Für die Navigation zwischen Seiten
  const [searchParams] = useSearchParams(); // URL-Parameter auslesen
  const processId = searchParams.get('processId'); // Prozess-ID aus URL
  const activityId = searchParams.get('activityId'); // Aktivitäts-ID aus URL (optional, für Bearbeitung)

  // Zustandsvariablen (State), die die Daten speichern
  const [activities, setActivities] = useState([]); // Liste der Aktivitäten
  const [roles, setRoles] = useState([]); // Liste der Rollen
  const [workProducts, setWorkProducts] = useState([]); // Liste der Work Products
  const [loading, setLoading] = useState(true); // Zeigt an, ob Daten geladen werden
  const [error, setError] = useState(null); // Speichert Fehler, falls etwas schiefgeht
  const [newWorkProductModalOpen, setNewWorkProductModalOpen] = useState(false); // Öffnet Modal für neues WP
  const [addExistingWorkProductOpen, setAddExistingWorkProductOpen] = useState(false); // Öffnet Modal für vorhandenes WP
  const [newWorkProduct, setNewWorkProduct] = useState({ name: '', description: '' }); // Daten für neues WP
  const [existingWorkProduct, setExistingWorkProduct] = useState({ workProductId: '', completeness: 0 }); // Daten für vorhandenes WP

  // Daten laden, wenn die Komponente startet
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Paralleles Laden von Rollen, Work Products und (falls vorhanden) einer Aktivität
        const [rolesData, workProductsData, activitiesData] = await Promise.all([
          fetch('http://localhost:5001/api/roles').then(r => r.json()), // Rollen von API holen
          fetch('http://localhost:5001/api/work-products').then(r => r.json()), // Work Products von API holen
          activityId ? fetch(`http://localhost:5001/api/activities/${activityId}`).then(r => r.json()) : Promise.resolve([]), // Aktivität laden, falls activityId existiert
        ]);

        setRoles(rolesData || []); // Rollen speichern
        setWorkProducts(workProductsData || []); // Work Products speichern
        setActivities(activityId ? [activitiesData] : []); // Aktivität speichern, wenn bearbeitet wird
        setLoading(false); // Laden abgeschlossen
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        setError(error.message); // Fehler speichern
        setLoading(false); // Laden abgeschlossen, auch bei Fehler
      }
    };

    fetchData(); // Funktion ausführen
  }, [activityId]); // Läuft erneut, wenn sich activityId ändert

  // Neue Aktivität zur Liste hinzufügen
  const handleAddActivity = () => {
    setActivities(prevActivities => [
      ...prevActivities, // Alte Aktivitäten beibehalten
      {
        name: '',
        description: '',
        executedBy: '',
        triggerWorkProducts: [{ workProductId: '', completeness: 0, isWorkloadDetermining: false }], // Standard-Trigger
        workMode: '0',
        knownTime: '',
        estimatedTime: '',
        timeUnit: 'minutes',
        multiplicator: 1,
        result: '',
        versionMajor: 1,
        versionMinor: 0,
      },
    ]);
  };

  // Eine Aktivität in der Liste aktualisieren
  const handleActivityChange = (index, updatedActivity) => {
    const newActivities = [...activities]; // Kopie der Aktivitätenliste
    newActivities[index] = updatedActivity; // Aktualisierte Aktivität an Stelle "index" einfügen
    setActivities(newActivities); // Neuen State setzen
  };

  // Aktivitäten speichern (an API senden)
  const handleSave = () => {
    const method = activityId ? 'PUT' : 'POST'; // PUT für Update, POST für Neu
    const url = activityId ? `http://localhost:5001/api/activities/${activityId}` : 'http://localhost:5001/api/activities'; // API-URL

    activities.forEach(async (activity, index) => {
      const cleanedActivity = { // Daten bereinigen, um leere Werte zu vermeiden
        name: activity.name || '',
        description: activity.description || '',
        executedBy: activity.executedBy || null,
        triggerWorkProducts: activity.triggerWorkProducts.map(tp => ({
          workProductId: tp.workProductId || null,
          completeness: tp.completeness || 0,
          isWorkloadDetermining: tp.isWorkloadDetermining || false,
        })),
        workMode: activity.workMode,
        knownTime: activity.knownTime || null,
        estimatedTime: activity.estimatedTime || null,
        timeUnit: activity.timeUnit,
        multiplicator: activity.multiplicator || 1,
        result: activity.result || null,
        process: processId && /^[0-9a-fA-F]{24}$/.test(processId) ? processId : null, // Prozess-ID prüfen
        versionMajor: activity.versionMajor,
        versionMinor: activity.versionMinor,
      };

      try {
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanedActivity), // Daten als JSON senden
        });
        if (!response.ok) {
          throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }
        if (index === activities.length - 1) { // Bei letzter Aktivität zurück navigieren
          navigate(processId ? `/edit-processes/${processId}` : '/processes');
        }
      } catch (error) {
        console.error('Fehler beim Speichern der Aktivität:', error);
        setError(error.message);
      }
    });
  };

  // Neues Work Product hinzufügen
  const handleAddNewWorkProduct = () => {
    fetch('http://localhost:5001/api/work-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWorkProduct), // Neues WP an API senden
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        return response.json(); // Antwort als JSON parsen
      })
      .then(data => {
        setWorkProducts(prevWorkProducts => [...prevWorkProducts, data]); // Neues WP zur Liste hinzufügen
        setActivities(prevActivities => prevActivities.map(activity => ({
          ...activity,
          triggerWorkProducts: [...activity.triggerWorkProducts, { workProductId: data._id, completeness: 0, isWorkloadDetermining: false }], // Neues WP als Trigger hinzufügen
          result: data._id, // Neues WP als Ergebnis setzen
        })));
        setNewWorkProductModalOpen(false); // Modal schließen
        setNewWorkProduct({ name: '', description: '' }); // Formular zurücksetzen
      })
      .catch(error => {
        console.error('Fehler beim Hinzufügen eines neuen Work Products:', error);
        setError(error.message);
      });
  };

  // Vorhandenes Work Product hinzufügen
  const handleAddExistingWorkProduct = () => {
    const { workProductId, completeness } = existingWorkProduct;
    if (!workProductId) return; // Abbrechen, wenn kein WP ausgewählt

    setActivities(prevActivities => prevActivities.map(activity => ({
      ...activity,
      triggerWorkProducts: [...activity.triggerWorkProducts, { workProductId, completeness: completeness || 0, isWorkloadDetermining: false }], // Vorhandenes WP als Trigger hinzufügen
    })));
    setAddExistingWorkProductOpen(false); // Modal schließen
    setExistingWorkProduct({ workProductId: '', completeness: 0 }); // Formular zurücksetzen
  };

  const handleEditWorkProduct = (workProductId) => {
    navigate(`/work-products/edit/${workProductId}`); // Zu WP-Bearbeitungsseite navigieren
  };

  // Lade- oder Fehlerinformation anzeigen
  if (loading) return <Typography>Lade Aktivität...</Typography>;
  if (error) return <Typography>Fehler: {error}</Typography>;

  // Haupt-Rendering der Komponente
  return (
    <Box sx={{ padding: 4, display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '80vh', overflowY: 'auto' }}>
      <Typography variant="h4" gutterBottom>{activityId ? 'Aktivität bearbeiten' : 'Neue Aktivität erstellen'}</Typography>
      {activities.map((activity, index) => (
        <Triggers
          key={index}
          activity={activity} // Aktivität an Triggers-Komponente weitergeben
          onChange={(updatedActivity) => handleActivityChange(index, updatedActivity)} // Änderungen zurückgeben
          workProducts={workProducts} // Liste der Work Products
          onAddNewWorkProduct={() => setNewWorkProductModalOpen(true)} // Modal für neues WP öffnen
          onAddExistingWorkProduct={() => setAddExistingWorkProductOpen(true)} // Modal für vorhandenes WP öffnen
          onEditWorkProduct={handleEditWorkProduct} // WP bearbeiten
          onRemoveTrigger={(triggerIndex) => { // Trigger entfernen
            const newActivities = [...activities];
            newActivities[index].triggerWorkProducts = newActivities[index].triggerWorkProducts.filter((_, i) => i !== triggerIndex);
            setActivities(newActivities);
          }}
          onSetWorkloadDetermining={(triggerIndex) => { // Workload bestimmenden Faktor setzen
            const newActivities = [...activities];
            newActivities[index].triggerWorkProducts.forEach((tp, i) => {
              tp.isWorkloadDetermining = i === triggerIndex; // Nur der ausgewählte Trigger wird "true"
            });
            setActivities(newActivities);
          }}
        />
      ))}
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" onClick={handleAddActivity} startIcon={<Add />}>
          Neue Aktivität hinzufügen
        </Button>
        <Button variant="contained" onClick={handleSave} sx={{ ml: 2 }}>
          Speichern
        </Button>
        <Button variant="outlined" onClick={() => navigate(processId ? `/edit-processes/${processId}` : '/processes')} sx={{ ml: 2 }}>
          Zurück
        </Button>
      </Box>

      {/* Modal für neues Work Product */}
      <Modal open={newWorkProductModalOpen} onClose={() => setNewWorkProductModalOpen(false)}>
        <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 2, maxWidth: 400, mx: 'auto', mt: '20%' }}>
          <Typography variant="h6" gutterBottom>Neues Work Product hinzufügen</Typography>
          <TextField
            label="Work Product Name"
            value={newWorkProduct.name}
            onChange={(e) => setNewWorkProduct({ ...newWorkProduct, name: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Beschreibung"
            value={newWorkProduct.description}
            onChange={(e) => setNewWorkProduct({ ...newWorkProduct, description: e.target.value })}
            fullWidth
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handleAddNewWorkProduct} sx={{ mr: 2 }}>Speichern</Button>
          <Button variant="outlined" onClick={() => setNewWorkProductModalOpen(false)}>Abbrechen</Button>
        </Box>
      </Modal>

      {/* Modal für vorhandenes Work Product */}
      <Modal open={addExistingWorkProductOpen} onClose={() => setAddExistingWorkProductOpen(false)}>
        <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 2, maxWidth: 400, mx: 'auto', mt: '20%' }}>
          <Typography variant="h6" gutterBottom>Vorhandenes Work Product hinzufügen</Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Work Product</InputLabel>
            <Select
              value={existingWorkProduct.workProductId}
              onChange={(e) => setExistingWorkProduct({ ...existingWorkProduct, workProductId: e.target.value })}
              label="Work Product"
              sx={{ height: '56px' }}
            >
              {workProducts.map(product => (
                <MenuItem key={product._id} value={product._id}>{product.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="% Fertigstellung"
            value={existingWorkProduct.completeness}
            onChange={(e) => setExistingWorkProduct({ ...existingWorkProduct, completeness: e.target.value })}
            fullWidth
            type="number"
            inputProps={{ min: 0, max: 100 }}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handleAddExistingWorkProduct} sx={{ mr: 2 }}>Hinzufügen</Button>
          <Button variant="outlined" onClick={() => setAddExistingWorkProductOpen(false)}>Abbrechen</Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default ActivityForm;