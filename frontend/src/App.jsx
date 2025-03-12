import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Projects from './pages/Projects';
// import Project from './pages/Project';
import GanttProject from './pages/GanttProject';
import Customers from './pages/Customers';
import ProcessGroups from './pages/ProcessGroups';
import Processes from './pages/Processes';
import ProcessFlow from './pages/ProcessFlow';
import GanttSimulation from './pages/GanttSimulation';
import Activities from './pages/Activities';
import WorkProducts from './pages/WorkProducts';
import Queries from './pages/Queries';
import Settings from './pages/Settings';
import Organization from './pages/Organization';
import Departments from './pages/Departments';
import Roles from './pages/Roles';
import Locations from './pages/Locations';
import DepartmentsFlow from './pages/DepartmentsFlow';
import ErrorBoundary from './components/ErrorBoundary';
import EditProcess from './pages/EditProcess';
import CreateProcess from './pages/CreateProcess';
import TriggerList from './pages/TriggerList';
import TriggerPage from './pages/TriggerPage';
import TriggerForm from './pages/TriggerForm';
import TriggerEdit from './pages/TriggerEdit';
import ActivityForm from './pages/ActivityForm';

import ProjectDetails from './pages/ProjectDetails';

// Wrapper-Komponente für ActivityForm in Routen
const ActivityFormWrapper = ({ activities }) => {
  const navigate = useNavigate();
  const { activityId } = useParams();

  const handleSave = (updatedActivity) => {
    console.log('Aktivität gespeichert:', updatedActivity);
    navigate('/activities');
  };

  const handleClose = () => {
    navigate('/activities');
  };

  return (
    <ActivityForm 
      activityId={activityId}
      onSave={handleSave}
      onClose={handleClose}
      activities={activities}
    />
  );
};

const App = () => {
  const [releases, setReleases] = useState([]);
  const [events, setEvents] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Starte Datenabruf...');
        const [
          releasesResponse,
          eventsResponse,
          triggersResponse,
          activitiesResponse,
        ] = await Promise.all([
          fetch('http://localhost:5001/api/releases'),
          fetch('http://localhost:5001/api/events'),
          fetch('http://localhost:5001/api/triggers'),
          fetch('http://localhost:5001/api/activities'),
        ]);
        console.log('Antworten erhalten:', { 
          releasesResponse: releasesResponse.status, 
          eventsResponse: eventsResponse.status, 
          triggersResponse: triggersResponse.status, 
          activitiesResponse: activitiesResponse.status 
        });
        if (!releasesResponse.ok) throw new Error('Fehler beim Laden der Releases');
        if (!eventsResponse.ok) throw new Error('Fehler beim Laden der Events');
        if (!triggersResponse.ok) throw new Error('Fehler beim Laden der Trigger');
        if (!activitiesResponse.ok) throw new Error('Fehler beim Laden der Aktivitäten');

        const releasesData = await releasesResponse.json();
        const eventsData = await eventsResponse.json();
        const triggersData = await triggersResponse.json();
        const activitiesData = await activitiesResponse.json();

        setReleases(Array.isArray(releasesData) ? releasesData : []);
        setEvents(Array.isArray(eventsData) ? eventsData : []);
        setTriggers(Array.isArray(triggersData) ? triggersData : []);
        setActivities(Array.isArray(activitiesData) ? activitiesData : []);
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addTrigger = async (newTrigger) => {
    try {
      const response = await fetch('http://localhost:5001/api/triggers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTrigger),
      });
      if (!response.ok) throw new Error(`Serverfehler: ${response.status} ${response.statusText}`);
      const data = await response.json();
      setTriggers((prevTriggers) => [...prevTriggers, data]);
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Trigger:', error);
      setError(error.message);
    }
  };

  const updateTrigger = async (triggerId, updatedTrigger) => {
    try {
      const response = await fetch(`http://localhost:5001/api/triggers/${triggerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTrigger),
      });
      if (!response.ok) throw new Error(`Serverfehler: ${response.status} ${response.statusText}`);
      const data = await response.json();
      setTriggers((prevTriggers) =>
        prevTriggers.map((t) => (t._id === triggerId ? data : t))
      );
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Triggers:', error);
      setError(error.message);
    }
  };

  const addRelease = async (newRelease) => {
    try {
      const response = await fetch('http://localhost:5001/api/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRelease),
      });
      if (!response.ok) throw new Error(`Serverfehler: ${response.status} ${response.statusText}`);
      const data = await response.json();
      setReleases((prevReleases) => [...prevReleases, data]);
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Release:', error);
      setError(error.message);
    }
  };

  const updateRelease = async (releaseId, updatedRelease) => {
    try {
      const response = await fetch(`http://localhost:5001/api/releases/${releaseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRelease),
      });
      if (!response.ok) throw new Error(`Serverfehler: ${response.status} ${response.statusText}`);
      const data = await response.json();
      setReleases((prevReleases) =>
        prevReleases.map((r) => (r._id === releaseId ? data : r))
      );
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Release:', error);
      setError(error.message);
    }
  };

  const addEvent = async (newEvent) => {
    try {
      const response = await fetch('http://localhost:5001/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });
      if (!response.ok) throw new Error(`Serverfehler: ${response.status} ${response.statusText}`);
      const data = await response.json();
      setEvents((prevEvents) => [...prevEvents, data]);
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Events:', error);
      setError(error.message);
    }
  };

  const updateEvent = async (eventId, updatedEvent) => {
    try {
      const response = await fetch(`http://localhost:5001/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });
      if (!response.ok) throw new Error(`Serverfehler: ${response.status} ${response.statusText}`);
      const data = await response.json();
      setEvents((prevEvents) =>
        prevEvents.map((e) => (e._id === eventId ? data : e))
      );
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Events:', error);
      setError(error.message);
    }
  };

  if (loading) return <div>Lade Daten...</div>;
  if (error) return <div>Fehler: {error}</div>;

  return (
    <Router>
      <ErrorBoundary>
        <div style={{ display: 'flex' }}>
          <Sidebar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
 
              <Route path="/gantt-project" element={<GanttProject />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/process-groups" element={<ProcessGroups />} />
              <Route path="/processes" element={<Processes />} />
              <Route path="/process-flow" element={<ProcessFlow />} />
              <Route path="/triggers" element={<TriggerPage />} />
              <Route path="/trigger-list" element={<TriggerList />} />
              <Route path="/triggers/new" element={<TriggerForm addTrigger={addTrigger} />} />
              <Route path="/triggers/edit/:triggerId" element={<TriggerEdit updateTrigger={updateTrigger} />} />
              <Route path="/gantt-simulation" element={<GanttSimulation />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/activities/new" element={<ActivityFormWrapper activities={activities} />} />
              <Route path="/activities/edit/:activityId" element={<ActivityFormWrapper activities={activities} />} />
              <Route path="/work-products" element={<WorkProducts />} />
              <Route path="/queries" element={<Queries />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/organization" element={<Organization />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/departments-flow" element={<DepartmentsFlow />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/edit-processes/:id" element={<EditProcess />} />
              <Route path="/edit-processes/new" element={<EditProcess />} />
              <Route path="/create-process" element={<CreateProcess />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetails releases={releases} events={events} addRelease={addRelease} updateRelease={updateRelease} addEvent={addEvent} updateEvent={updateEvent} />} />
            </Routes>
          </main>
        </div>
      </ErrorBoundary>
    </Router>
  );
};

export default App;