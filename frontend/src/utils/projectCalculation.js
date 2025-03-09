// src/utils/projectCalculation.js

/**
 * Berechnet die Projektaktivität mit Startzeiten, Dauern und Kosten basierend auf den Aktivitäten und Simulationsdaten.
 * @param {Array} activities - Array von Aktivitätsobjekten mit knownTime, estimatedTime, multiplicator, workMode, etc.
 * @param {Object} simulationData - Objekt mit workProducts (z. B. { workProducts: [{ name: 'WP1', known: 10, unknown: 10 }] }).
 * @param {Date} projectStartDate - Startdatum des Projekts (Standard: aktuelles Datum).
 * @returns {Array} - Array von berechneten Aktivitäten mit Start, Ende, Dauer, Kosten, etc.
 */
export const calculateProject = (activities, simulationData, projectStartDate = new Date()) => {
  if (!activities || activities.length === 0) {
    throw new Error('Keine Aktivitäten vorhanden.');
  }

  const roleAvailability = {}; // Speichert die Endzeiten der Aktivitäten pro Rolle
  const calculatedActivities = []; // Ergebnisarray für die berechneten Aktivitäten
  const workProductProgress = {}; // Speichert den Fortschritt der Work-Products

  const activityMap = activities.reduce((map, activity) => {
    map[activity._id] = activity;
    return map;
  }, {});

  const processed = new Set(); // Verfolgt bereits verarbeitete Aktivitäten
  const queue = [...activities]; // Starte mit allen Aktivitäten

  while (queue.length > 0) {
    const activity = queue.shift();
    if (!activity || processed.has(activity._id)) continue;

    const roleId = activity.executedBy?._id || 'unknown';
    let startTime = new Date(projectStartDate);

    // Schritt 1: Trigger-Bedingungen prüfen
    if (activity.trigger?.workProducts?.length) {
      let latestStartTime = startTime;
      for (const wp of activity.trigger.workProducts) {
        const wpId = wp._id?._id || wp._id;
        const requiredCompletion = wp.completionPercentage || 100;

        const producingActivity = activities.find(a => (a.result?._id || a.result) === wpId);
        if (producingActivity && calculatedActivities.find(a => a.id === producingActivity._id)) {
          const prodActivity = calculatedActivities.find(a => a.id === producingActivity._id);
          const durationDays = prodActivity.duration;
          const daysToCompletion = (requiredCompletion / 100) * durationDays;
          const completionDate = new Date(prodActivity.start);
          completionDate.setDate(completionDate.getDate() + daysToCompletion);

          console.log(`Aktivität ${activity.name}: WP ${wpId} benötigt ${requiredCompletion}%, erreicht am ${completionDate}`);
          if (completionDate > latestStartTime) {
            latestStartTime = completionDate;
          }
        }
      }
      startTime = latestStartTime > startTime ? latestStartTime : startTime;
      console.log(`Startzeit für ${activity.name} auf ${startTime} gesetzt (Trigger)`);
    }

    // Schritt 2: Rollenverfügbarkeit prüfen
    if (roleAvailability[roleId]) {
      const lastEndTime = roleAvailability[roleId].sort((a, b) => b.endTime - a.endTime)[0]?.endTime;
      if (lastEndTime && lastEndTime > startTime) {
        startTime = new Date(lastEndTime);
        console.log(`Startzeit-Konflikt für Rolle ${roleId}, verschoben auf ${startTime}`);
      }
    }

    // Schritt 3: Dauer-Berechnung
    const isA1 = activity.name === 'Aktivität 1'; // Spezieller Fall für A1
    const triggerWp = simulationData.workProducts.find(wp => wp.name === (isA1 ? 'Start WP For Process Test' : activity.trigger?.workProducts[0]?.name)) || { known: 0, unknown: 0 };
    const knownCount = isA1 ? triggerWp.known : (activity.knownTime || 0); // Nutze Simulation für A1
    const unknownCount = isA1 ? triggerWp.unknown : (activity.estimatedTime || 0); // Nutze Simulation für A1
    const knownTimePerItem = isA1 ? 12 : parseFloat(activity.knownTime || 0); // 12 Stunden für A1
    const estimatedTimePerItem = isA1 ? 20 : parseFloat(activity.estimatedTime || 0); // 20 Stunden für A1
    const multiplicator = activity.multiplicator || 1;
    const workMode = activity.workMode || 'Einer';
    const workingHoursPerDay = 3.87;
    const numRoles = 3;
    const roleCostPerHour = 105;

    const totalKnownHours = knownCount * multiplicator * knownTimePerItem;
    const totalEstimatedHours = unknownCount * multiplicator * estimatedTimePerItem;
    const totalHours = totalKnownHours + totalEstimatedHours;

    let durationDays;
    switch (workMode) {
      case 'Einer':
        durationDays = totalHours / workingHoursPerDay;
        break;
      case 'Jeder':
        durationDays = totalHours / workingHoursPerDay;
        break;
      case 'Geteilt':
        durationDays = totalHours / (workingHoursPerDay * numRoles);
        break;
      default:
        durationDays = totalHours / workingHoursPerDay;
    }
    durationDays = Math.ceil(durationDays);

    // Schritt 4: Endzeit-Berechnung
    const endTime = new Date(startTime);
    endTime.setDate(startTime.getDate() + durationDays);

    // Schritt 5: Kosten-Berechnung
    let cost;
    switch (workMode) {
      case 'Einer':
        cost = totalHours * roleCostPerHour;
        break;
      case 'Jeder':
        cost = totalHours * roleCostPerHour * numRoles;
        break;
      case 'Geteilt':
        cost = totalHours * roleCostPerHour;
        break;
      default:
        cost = totalHours * roleCostPerHour;
    }

    // Schritt 6: Work-Product-Fortschritt aktualisieren
    const wpId = activity.result?._id || activity.result;
    if (wpId) {
      workProductProgress[wpId] = { start: startTime, duration: durationDays };
    }

    calculatedActivities.push({
      id: activity._id,
      name: activity.name,
      start: startTime,
      end: endTime,
      role: roleId,
      duration: durationDays,
      knownDuration: totalKnownHours,
      estimatedDuration: totalEstimatedHours,
      cost,
      hasStartConflict: !!roleAvailability[roleId],
    });

    roleAvailability[roleId] = roleAvailability[roleId] || [];
    roleAvailability[roleId].push({ endTime });

    processed.add(activity._id);
  }

  return calculatedActivities;
};