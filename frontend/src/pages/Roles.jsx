import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableRow, 
  TextField, Button, Select, MenuItem, FormControl, 
  InputLabel, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, Typography, Box 
} from '@mui/material';
import { Delete, Add, AccessTime } from '@mui/icons-material';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [company, setCompany] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newRole, setNewRole] = useState({ 
    name: '', 
    abbreviation: '', 
    description: '', 
    department: '', 
    paymentType: 'yearly', 
    paymentValue: '' 
  });
  const [newTask, setNewTask] = useState({ 
    role: '', 
    name: '', 
    frequency: 1, 
    rhythm: 'daily', 
    duration: 0, 
    unit: 'minutes' 
  });
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch('http://localhost:5001/api/roles').then(r => {
        if (!r.ok) throw new Error(`HTTP-Fehler! Status: ${r.status} - ${r.statusText}`);
        return r.json();
      }),
      fetch('http://localhost:5001/api/departments').then(r => {
        if (!r.ok) throw new Error(`HTTP-Fehler! Status: ${r.status} - ${r.statusText}`);
        return r.json();
      }),
      fetch('http://localhost:5001/api/company').then(r => {
        if (!r.ok) throw new Error(`HTTP-Fehler! Status: ${r.status} - ${r.statusText}`);
        return r.json();
      }),
      fetch('http://localhost:5001/api/recurring-tasks').then(r => {
        if (!r.ok) throw new Error(`HTTP-Fehler! Status: ${r.status} - ${r.statusText}`);
        return r.json();
      }),
    ])
      .then(([rolesData, depts, comp, tasksData]) => {
        setRoles(rolesData || []);
        setDepartments(depts || []);
        setCompany(comp || null);
        setTasks(tasksData || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Fehler beim Laden der Daten:', error);
        setError(error.message);
        setRoles([]);
        setDepartments([]);
        setCompany(null);
        setTasks([]);
        setLoading(false);
      });
  }, []);

  const calculateTaskHoursPerYear = (task) => {
    const freq = task.frequency;
    let durationInHours = task.duration;
    switch (task.unit) {
      case 'minutes': durationInHours /= 60; break;
      case 'days': durationInHours *= (company?.workHoursDay || 8); break;
      default: break;
    }
    let totalHours;
    const workdaysYear = company?.workdaysYear || 207.71;
    switch (task.rhythm) {
      case 'hourly': totalHours = freq * 365 * durationInHours; break;
      case 'daily': totalHours = freq * workdaysYear * durationInHours; break;
      case 'weekly': totalHours = freq * (workdaysYear / (company?.workdaysWeek || 5)) * durationInHours; break;
      case 'monthly': totalHours = freq * 12 * durationInHours; break;
      case 'yearly': totalHours = freq * durationInHours; break;
      default: totalHours = 0;
    }
    return totalHours;
  };

  const calculateRoleHours = (role) => {
    const roleTasks = tasks.filter(t => t.role._id === role._id);
    const totalTaskHoursPerYear = roleTasks.reduce((sum, task) => sum + calculateTaskHoursPerYear(task), 0);
    const workHoursDayMaxLoad = company?.workHoursDayMaxLoad || 6.8;
    const workdaysYear = company?.workdaysYear || 207.71;
    const dailyTaskHours = totalTaskHoursPerYear / 365;
    const availableDailyHours = workHoursDayMaxLoad - dailyTaskHours;
    const formattedWorkHoursDayMaxLoad = workHoursDayMaxLoad.toFixed(3);
    const formattedAvailableDailyHours = availableDailyHours.toFixed(3);
    return { workHoursDayMaxLoad: formattedWorkHoursDayMaxLoad, availableDailyHours: formattedAvailableDailyHours };
  };

  const handleAddRole = () => {
    fetch('http://localhost:5001/api/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newRole, company: company?._id }),
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status} - ${response.statusText}`);
        return response.json();
      })
      .then(data => {
        setRoles([...roles, data]);
        setNewRole({ name: '', abbreviation: '', description: '', department: '', paymentType: 'yearly', paymentValue: '' });
      })
      .catch(error => console.error('Fehler beim Hinzufügen der Rolle:', error));
  };

  const handleEditRole = (id, updatedRole) => {
    fetch(`http://localhost:5001/api/roles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updatedRole, company: company?._id }),
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status} - ${response.statusText}`);
        return response.json();
      })
      .then(data => {
        setRoles(roles.map(r => (r._id === id ? data : r)));
      })
      .catch(error => console.error('Fehler beim Bearbeiten der Rolle:', error));
  };

  const handleDeleteRole = (id) => {
    fetch(`http://localhost:5001/api/roles/${id}`, { method: 'DELETE' })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${r.status} - ${r.statusText}`);
        setRoles(roles.filter(r => r._id !== id));
      })
      .catch(error => console.error('Fehler beim Löschen der Rolle:', error));
  };

  const handleAddTask = () => {
    fetch('http://localhost:5001/api/recurring-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newTask, role: selectedRoleId }),
    })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status} - ${response.statusText}`);
        return response.json();
      })
      .then(data => {
        setTasks([...tasks, data]);
        setNewTask({ role: selectedRoleId, name: '', frequency: 1, rhythm: 'daily', duration: 0, unit: 'minutes' });
      })
      .catch(error => console.error('Fehler beim Hinzufügen der Tätigkeit:', error));
  };

  const handleDeleteTask = (taskId) => {
    fetch(`http://localhost:5001/api/recurring-tasks/${taskId}`, { method: 'DELETE' })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status} - ${response.statusText}`);
        setTasks(tasks.filter(t => t._id !== taskId));
      })
      .catch(error => console.error('Fehler beim Löschen der Tätigkeit:', error));
  };

  const handleOpenTaskDialog = (roleId) => {
    setSelectedRoleId(roleId);
    setNewTask({ role: roleId, name: '', frequency: 1, rhythm: 'daily', duration: 0, unit: 'minutes' });
    setOpenTaskDialog(true);
  };

  // Prüfen, ob repetitive Loads existieren
  const hasRepetitiveLoad = (roleId) => tasks.filter(t => t.role._id === roleId).length > 0;

  if (loading) return <Typography sx={{ fontSize: '0.75rem' }}>Lade Rollen...</Typography>;
  if (error) return <Typography sx={{ fontSize: '0.75rem' }}>Fehler: {error}</Typography>;

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontSize: '0.75rem' }}>Rollen</Typography>
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'nowrap', alignItems: 'center', gap: 0.5 }}>
        <TextField 
          label="Name" 
          value={newRole.name} 
          onChange={(e) => setNewRole({ ...newRole, name: e.target.value })} 
          sx={{ mr: 0.5, width: 120, fontSize: '0.75rem' }} 
        />
        <TextField 
          label="Abkürzung" 
          value={newRole.abbreviation} 
          onChange={(e) => setNewRole({ ...newRole, abbreviation: e.target.value })} 
          sx={{ mr: 0.5, width: 80, fontSize: '0.75rem' }} 
        />
        <TextField 
          label="Beschreibung" 
          value={newRole.description} 
          onChange={(e) => setNewRole({ ...newRole, description: e.target.value })} 
          sx={{ mr: 0.5, width: 150, fontSize: '0.6rem' }} 
        />
        <FormControl sx={{ mr: 0.5, width: 120, fontSize: '0.75rem' }}>
          <InputLabel sx={{ fontSize: '0.75rem' }}>Abteilung</InputLabel>
          <Select 
            value={newRole.department} 
            onChange={(e) => setNewRole({ ...newRole, department: e.target.value })} 
            sx={{ fontSize: '0.75rem' }}
          >
            <MenuItem value="" sx={{ fontSize: '0.75rem' }}>Keine</MenuItem>
            {departments.map(dept => (
              <MenuItem key={dept._id} value={dept._id} sx={{ fontSize: '0.75rem' }}>{dept.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 0.5 }}>
          <FormControl sx={{ width: 100, fontSize: '0.75rem' }}>
            <InputLabel sx={{ fontSize: '0.75rem' }}>Zahlungstyp</InputLabel>
            <Select 
              value={newRole.paymentType} 
              onChange={(e) => setNewRole({ ...newRole, paymentType: e.target.value })} 
              sx={{ fontSize: '0.75rem' }}
            >
              <MenuItem value="yearly" sx={{ fontSize: '0.75rem' }}>Jährlich</MenuItem>
              <MenuItem value="hourly" sx={{ fontSize: '0.75rem' }}>Stündlich</MenuItem>
            </Select>
          </FormControl>
          <TextField 
            label={newRole.paymentType === 'yearly' ? 'Jahresgehalt' : 'Stundensatz'} 
            type="number" 
            value={newRole.paymentValue} 
            onChange={(e) => setNewRole({ ...newRole, paymentValue: e.target.value })} 
            sx={{ ml: 0.5, width: 120, fontSize: '0.75rem' }} 
          />
        </Box>
        <Button variant="contained" onClick={handleAddRole} sx={{ fontSize: '0.75rem' }}>
          Hinzufügen
        </Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontSize: '0.75rem' }}>Name</TableCell>
            <TableCell sx={{ fontSize: '0.75rem' }}>Abkürzung</TableCell>
            <TableCell sx={{ fontSize: '0.75rem' }}>Beschreibung</TableCell>
            <TableCell sx={{ fontSize: '0.75rem' }}>Abteilung</TableCell>
            <TableCell sx={{ fontSize: '0.75rem' }}>Zahlung</TableCell>
            <TableCell sx={{ fontSize: '0.75rem' }}>Std/Tag (Max Load)</TableCell>
            <TableCell sx={{ fontSize: '0.75rem' }}>Std/Tag (Verfügbar)</TableCell>
            <TableCell sx={{ fontSize: '0.75rem' }}>Aktionen</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {roles.map(role => {
            const { workHoursDayMaxLoad, availableDailyHours } = calculateRoleHours(role);
            const hasLoad = hasRepetitiveLoad(role._id);
            return (
              <TableRow key={role._id}>
                <TableCell>
                  <TextField 
                    value={role.name || ''} 
                    onChange={(e) => handleEditRole(role._id, { ...role, name: e.target.value })} 
                    size="small" 
                    sx={{ fontSize: '0.75rem' }} 
                  />
                </TableCell>
                <TableCell>
                  <TextField 
                    value={role.abbreviation || ''} 
                    onChange={(e) => handleEditRole(role._id, { ...role, abbreviation: e.target.value })} 
                    size="small" 
                    sx={{ fontSize: '0.75rem' }} 
                  />
                </TableCell>
                <TableCell>
                  <TextField 
                    value={role.description || ''} 
                    onChange={(e) => handleEditRole(role._id, { ...role, description: e.target.value })} 
                    size="small" 
                    sx={{ fontSize: '0.6rem' }} 
                  />
                </TableCell>
                <TableCell>
                  <FormControl fullWidth>
                    <Select 
                      value={role.department?._id || role.department || ''} 
                      onChange={(e) => handleEditRole(role._id, { ...role, department: e.target.value || null })} 
                      size="small" 
                      sx={{ fontSize: '0.75rem' }}
                    >
                      <MenuItem value="" sx={{ fontSize: '0.75rem' }}>Keine</MenuItem>
                      {departments.map(dept => (
                        <MenuItem key={dept._id} value={dept._id} sx={{ fontSize: '0.75rem' }}>{dept.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormControl sx={{ width: 100, fontSize: '0.75rem' }}>
                      <InputLabel sx={{ fontSize: '0.75rem' }}>Zahlungstyp</InputLabel>
                      <Select 
                        value={role.paymentType || 'yearly'} 
                        onChange={(e) => handleEditRole(role._id, { ...role, paymentType: e.target.value })} 
                        size="small" 
                        sx={{ fontSize: '0.75rem' }}
                      >
                        <MenuItem value="yearly" sx={{ fontSize: '0.75rem' }}>Jährlich</MenuItem>
                        <MenuItem value="hourly" sx={{ fontSize: '0.75rem' }}>Stündlich</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField 
                      value={role.paymentValue || ''} 
                      onChange={(e) => handleEditRole(role._id, { ...role, paymentValue: e.target.value })} 
                      type="number" 
                      size="small" 
                      sx={{ ml: 0.5, width: 120, fontSize: '0.75rem' }} 
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: '0.75rem' }}>{workHoursDayMaxLoad}</Typography> {/* Kein TextField mehr */}
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: '0.75rem' }}>{availableDailyHours}</Typography> {/* Entspricht der Darstellung */}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton 
                      onClick={() => handleOpenTaskDialog(role._id)} 
                      sx={{ fontSize: '0.75rem', color: hasLoad ? 'green' : 'inherit' }} 
                    >
                      <AccessTime />
                      {hasLoad && (
                        <Typography sx={{ fontSize: '0.75rem', ml: 0.5 }}>
                          {tasks.filter(t => t.role._id === role._id).length}
                        </Typography>
                      )}
                    </IconButton>
                    <IconButton onClick={() => handleDeleteRole(role._id)} sx={{ fontSize: '0.75rem' }}><Delete /></IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)}>
        <DialogTitle sx={{ fontSize: '0.75rem' }}>Wiederkehrende Tätigkeiten für Rolle</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'nowrap', alignItems: 'center', gap: 0.5 }}>
            <TextField 
              label="Name" 
              value={newTask.name} 
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })} 
              sx={{ mr: 0.5, mt: 2, width: 120, fontSize: '0.75rem' }} 
            />
            <TextField 
              label="Wie oft" 
              type="number" 
              value={newTask.frequency} 
              onChange={(e) => setNewTask({ ...newTask, frequency: parseInt(e.target.value, 10) || 1 })} 
              sx={{ mr: 0.5, mt: 2, width: 80, fontSize: '0.75rem' }} 
            />
            <FormControl sx={{ mr: 0.5, mt: 2, width: 120, fontSize: '0.75rem' }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Rhythmus</InputLabel>
              <Select 
                value={newTask.rhythm} 
                onChange={(e) => setNewTask({ ...newTask, rhythm: e.target.value })} 
                sx={{ fontSize: '0.75rem' }}
              >
                <MenuItem value="hourly" sx={{ fontSize: '0.75rem' }}>Stündlich</MenuItem>
                <MenuItem value="daily" sx={{ fontSize: '0.75rem' }}>Täglich</MenuItem>
                <MenuItem value="weekly" sx={{ fontSize: '0.75rem' }}>Wöchentlich</MenuItem>
                <MenuItem value="monthly" sx={{ fontSize: '0.75rem' }}>Monatlich</MenuItem>
                <MenuItem value="yearly" sx={{ fontSize: '0.75rem' }}>Jährlich</MenuItem>
              </Select>
            </FormControl>
            <TextField 
              label="Dauer" 
              type="number" 
              value={newTask.duration} 
              onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value, 10) || 0 })} 
              sx={{ mr: 0.5, mt: 2, width: 80, fontSize: '0.75rem' }} 
            />
            <FormControl sx={{ mt: 2, width: 120, fontSize: '0.75rem' }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Einheit</InputLabel>
              <Select 
                value={newTask.unit} 
                onChange={(e) => setNewTask({ ...newTask, unit: e.target.value })} 
                sx={{ fontSize: '0.75rem' }}
              >
                <MenuItem value="minutes" sx={{ fontSize: '0.75rem' }}>Minuten</MenuItem>
                <MenuItem value="hours" sx={{ fontSize: '0.75rem' }}>Stunden</MenuItem>
                <MenuItem value="days" sx={{ fontSize: '0.75rem' }}>Tage</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Button variant="contained" onClick={handleAddTask} sx={{ mt: 2, fontSize: '0.75rem' }}>
            Tätigkeit hinzufügen
          </Button>
          <Table sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '0.75rem' }}>Name</TableCell>
                <TableCell sx={{ fontSize: '0.75rem' }}>Wie oft</TableCell>
                <TableCell sx={{ fontSize: '0.75rem' }}>Rhythmus</TableCell>
                <TableCell sx={{ fontSize: '0.75rem' }}>Dauer</TableCell>
                <TableCell sx={{ fontSize: '0.75rem' }}>Einheit</TableCell>
                <TableCell sx={{ fontSize: '0.75rem' }}>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.filter(t => t.role._id === selectedRoleId).map(task => (
                <TableRow key={task._id}>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{task.name || 'Unbenannt'}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{task.frequency || 1}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{task.rhythm || 'daily'}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{task.duration || 0}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>{task.unit || 'minutes'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDeleteTask(task._id)} sx={{ fontSize: '0.75rem' }}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)} sx={{ fontSize: '0.75rem' }}>Schließen</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Roles;