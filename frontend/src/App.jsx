import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Project from './pages/Project';
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

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <div style={{ display: 'flex' }}>
          <Sidebar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/project" element={<Project />} />
              <Route path="/gantt-project" element={<GanttProject />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/process-groups" element={<ProcessGroups />} />
              <Route path="/processes" element={<Processes />} />
              <Route path="/process-flow" element={<ProcessFlow />} />
              <Route path="triggers" element={<TriggerPage />}/>
              <Route path="triggers-list" element={<TriggerList />}/>
              <Route path="/gantt-simulation" element={<GanttSimulation />} />
              <Route path="/activities" element={<Activities />} />
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
            </Routes>
          </main>
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;