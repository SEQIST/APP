// src/components/Sidebar.jsx
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Home, Work, People, Settings, Business, Group, LocationOn } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Projekt', icon: <Work />, path: '/project' },
    { text: 'Gantt des Projektes', icon: <Work />, path: '/gantt-project' },
    { text: 'Kunden', icon: <People />, path: '/customers' },
    { text: 'Prozessgruppen', icon: <Group />, path: '/process-groups' },
    { text: 'Prozesse', icon: <Work />, path: '/processes' },
    { text: 'Flow der Prozesse', icon: <Work />, path: '/process-flow' },
    { text: 'Gantt der Simulation', icon: <Work />, path: '/gantt-simulation' },
    { text: 'Aktivitäten', icon: <Work />, path: '/activities' },
    { text: 'Arbeitsprodukte', icon: <Work />, path: '/work-products' },
    { text: 'Abfragen', icon: <Work />, path: '/queries' },
    { text: 'Einstellungen', icon: <Settings />, path: '/settings' },
    { text: 'Organisation', icon: <Business />, path: '/organization' },
    { text: 'Abteilungen', icon: <Group />, path: '/departments' },
    { text: 'Rollen', icon: <Group />, path: '/roles' },
    { text: 'Standorte', icon: <LocationOn />, path: '/locations' },
  ];

  return (
    <Drawer variant="permanent" anchor="left">
      <List>
        {menuItems.map((item) => (
          <ListItem button key={item.text} component={Link} to={item.path}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;