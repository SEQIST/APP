import React from 'react'; // React explizit importieren
import { useState, useEffect } from 'react';
import { Grid, TextField, Button, Typography, Paper, Divider, Link as RouterLink } from '@mui/material'; // 'Link as RouterLink' korrigiert

const Organization = () => {
  const [company, setCompany] = useState({
    name: '',
    country: '',
    street: '',
    number: '',
    zip: '',
    city: '',
    area: '',
    workHoursDay: 8,
    approvedHolidayDays: 30,
    publicHolidaysYear: 12,
    avgSickDaysYear: 10,
    workdaysWeek: 5,
    maxLoad: 85,
    workdaysYear: 0,
    workdaysMonth: 0,
    workHoursYear: 0,
    workHoursYearMaxLoad: 0,
    workHoursDayMaxLoad: 0,
    workHoursWorkday: 0,
    workHoursMonth: 0,
  });

  useEffect(() => {
    fetch('http://localhost:5001/api/company')
      .then(response => response.json())
      .then(data => setCompany(data))
      .catch(error => console.error('Error fetching company:', error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompany(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    fetch('http://localhost:5001/api/company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(company),
    })
      .then(response => response.json())
      .then(data => setCompany(data))
      .catch(error => console.error('Error saving company:', error));
  };

  return (
    <Paper sx={{ padding: 4, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>Organisation</Typography>
      <Grid container spacing={2}>
        {/* Grunddaten */}
        <Grid item xs={12}>
          <Typography variant="h6">Grunddaten</Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Name"
            name="name"
            value={company.name}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Land"
            name="country"
            value={company.country}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField
            label="Straße"
            name="street"
            value={company.street}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Hausnummer"
            name="number"
            value={company.number}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="PLZ"
            name="zip"
            value={company.zip}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Stadt"
            name="city"
            value={company.city}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Bereich"
            name="area"
            value={company.area}
            onChange={handleChange}
            fullWidth
          />
        </Grid>

        {/* Arbeitszeiten */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2 }}>Arbeitszeiten</Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Arbeitsstunden pro Tag"
            name="workHoursDay"
            type="number"
            value={company.workHoursDay}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Genehmigte Urlaubstage"
            name="approvedHolidayDays"
            type="number"
            value={company.approvedHolidayDays}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Feiertage pro Jahr"
            name="publicHolidaysYear"
            type="number"
            value={company.publicHolidaysYear}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Durchschn. Krankheitstage"
            name="avgSickDaysYear"
            type="number"
            value={company.avgSickDaysYear}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Arbeitstage pro Woche"
            name="workdaysWeek"
            type="number"
            value={company.workdaysWeek}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Maximale Belastung (%)"
            name="maxLoad"
            type="number"
            value={company.maxLoad}
            onChange={handleChange}
            fullWidth
          />
        </Grid>

        {/* Berechnete Felder */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mt: 2 }}>Berechnete Werte</Typography>
          <Divider sx={{ mb: 2 }} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Arbeitstage pro Jahr"
            value={company.workdaysYear.toFixed(2)}
            InputProps={{ readOnly: true }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Arbeitstage pro Monat"
            value={company.workdaysMonth.toFixed(2)}
            InputProps={{ readOnly: true }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Arbeitsstunden pro Jahr"
            value={company.workHoursYear.toFixed(2)}
            InputProps={{ readOnly: true }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Arbeitsstunden pro Jahr (Max Load)"
            value={company.workHoursYearMaxLoad.toFixed(2)}
            InputProps={{ readOnly: true }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Arbeitsstunden pro Tag (Max Load)"
            value={company.workHoursDayMaxLoad.toFixed(2)}
            InputProps={{ readOnly: true }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Arbeitsstunden pro Arbeitstag"
            value={company.workHoursWorkday.toFixed(2)}
            InputProps={{ readOnly: true }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Arbeitsstunden pro Monat"
            value={company.workHoursMonth.toFixed(2)}
            InputProps={{ readOnly: true }}
            fullWidth
          />
        </Grid>
      </Grid>
      <Button variant="contained" onClick={handleSave} sx={{ mt: 4, mr: 2 }}>
        Speichern
      </Button>
      <Button variant="outlined" component={RouterLink} to="/organization/departments-flow" sx={{ mt: 4 }}>
        Abteilungen anzeigen
      </Button>
    </Paper>
  );
};

export default Organization;