import React from 'react'; // Importiere React für JSX
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Home, Work, People, Settings, Business, Group, LocationOn, AccountTree, Hub, QueryBuilder, Schema } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom'; // Füge useLocation hinzu für aktive Navigation



const Sidebar = () => {
  const location = useLocation(); // Hole die aktuelle URL, um aktive Elemente zu markieren

  const menuItems = [
    { text: 'Home', icon: <Home />, path: '/' },
    { text: 'Projekt', icon: <Work />, path: '/project' },
    { text: 'Gantt des Projektes', icon: <Work />, path: '/gantt-project' },
    { text: 'Kunden', icon: <People />, path: '/customers' },
    { text: 'Prozessgruppen', icon: <Group />, path: '/process-groups' },
    { text: 'Prozesse', icon: <AccountTree />, path: '/processes' },
//    { text: 'Prozesse edit', icon: <Work />, path: '/edit-processes' },
    { text: 'Flow der Prozesse', icon: <Work />, path: '/process-flow' },
 //   { text: 'Trigger', icon: <Work />, path: '/trigger-page' },
 //   { text: 'TriggerForm', icon: <Work />, path: '/trigger-form' },
    { text: 'TriggerList', icon: <Work />, path: '/trigger-list' },
    { text: 'Gantt der Simulation', icon: <Work />, path: '/gantt-simulation' },
    { text: 'Aktivitäten', icon: <Work />, path: '/activities' },
    { text: 'Arbeitsprodukte', icon: <Work />, path: '/work-products' },
    { text: 'Abfragen', icon: <QueryBuilder />, path: '/queries' },
    { text: 'Einstellungen', icon: <Settings />, path: '/settings' },
    { text: 'Organisation', icon: <Business />, path: '/organization' },
    { text: 'Flow ansicht', icon: <Hub />, path: '/departments-flow' },
    { text: 'Abteilungen', icon: <Group />, path: '/departments' },
    { text: 'Rollen', icon: <Group />, path: '/roles' },
    { text: 'Standorte', icon: <LocationOn />, path: '/locations' },
  ];

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          top: 64, // Passe dies an, falls du eine AppBar oder Header hast
        },
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path} // Markiere das aktive Element
            disableGutters // Entferne Standard-Padding, falls es Probleme gibt
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.12)',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)', // Hover-Effekt für alle Elemente
              },
              padding: '8px 16px', // Konsistentes Padding
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;