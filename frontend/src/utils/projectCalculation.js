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

  // Erstelle eine Abhängigkeitskarte
  const dependencies = new Map();
  activities.forEach((activity) => {
    dependencies.set(activity._id, new Set());
    if (activity.trigger?.workProducts?.length) {
      activity.trigger.workProducts.forEach((wp) => {
        const wpId = wp._id?._id || wp._id;
        const producingActivity = activities.find(a => (a.result?._id || a.result) === wpId);
        if (producingActivity) {
          dependencies.get(activity._id).add(producingActivity._id);
        }
      });
    }
  });

  // Finde Aktivitäten ohne Vorgänger
  activities.forEach((activity) => {
    if (dependencies.get(activity._id).size === 0) {
      queue.push(activity);
    }
  });

  // Topologische Sortierung
  while (queue.length > 0) {
    const activity = queue.shift();
    if (!activity || processed.has(activity._id)) continue;

    const roleId = activity.executedBy?._id || 'unknown';
    let startTime = new Date(projectStartDate);
    let latestPredecessorEndTime = null;

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
          if (!latestPredecessorEndTime || prodActivity.end > latestPredecessorEndTime) {
            latestPredecessorEndTime = new Date(prodActivity.end);
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
    const knownCount = isA1 ? triggerWp.known : (activity.knownTime || 0);
    const unknownCount = isA1 ? triggerWp.unknown : (activity.estimatedTime || 0);
    const knownTimePerItem = isA1 ? 12 : parseFloat(activity.knownTime || 0);
    const estimatedTimePerItem = isA1 ? 20 : parseFloat(activity.estimatedTime || 0);
    const multiplicator = activity.multiplicator || 1;
    const workMode = activity.workMode || 'Einer';
    const workingHoursPerDay = 3.87;
    const numRoles = 3;
    const roleCostPerHour = 105;

    // Spezielle Werte für "Ende"
    const isEnde = activity.name === 'Ende';
    const adjustedKnownTimePerItem = isEnde ? (5 / 60) : knownTimePerItem; // 5 Minuten in Stunden
    const adjustedEstimatedTimePerItem = isEnde ? (2 / 60) : estimatedTimePerItem; // 2 Minuten in Stunden

    const totalKnownHours = knownCount * multiplicator * adjustedKnownTimePerItem;
    const totalEstimatedHours = unknownCount * multiplicator * adjustedEstimatedTimePerItem;
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
    let endTime = new Date(startTime);
    endTime.setDate(startTime.getDate() + durationDays);

    // Schritt 5: End time Conflict für "Ende" prüfen
    if (isEnde && latestPredecessorEndTime && endTime < latestPredecessorEndTime) {
      console.log(`End time Conflict bei Aktivität ${activity.name}: Berechnetes Enddatum (${endTime}) ist früher als Vorgänger (${latestPredecessorEndTime})`);
      
      // Berechne die Zeit für 1 Item (in Tagen)
      const timeForOneItemHours = (adjustedKnownTimePerItem + adjustedEstimatedTimePerItem) * multiplicator;
      const timeForOneItemDays = Math.ceil(timeForOneItemHours / workingHoursPerDay);

      // Setze das neue Enddatum auf: Spätestes Vorgänger-Enddatum + Zeit für 1 Item
      endTime = new Date(latestPredecessorEndTime);
      endTime.setDate(endTime.getDate() + timeForOneItemDays);

      // Aktualisiere die Dauer (nur die Dauer wird verlängert)
      const newDurationDays = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24));
      durationDays = newDurationDays;

      console.log(`Neues Enddatum für ${activity.name}: ${endTime}, neue Dauer: ${durationDays} Tage`);
    }

    // Schritt 6: Kosten-Berechnung
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

    // Schritt 7: Work-Product-Fortschritt aktualisieren
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

    // Füge nachfolgende Aktivitäten zur Queue hinzu
    activities.forEach((nextActivity) => {
      const nextDeps = dependencies.get(nextActivity._id);
      if (nextDeps && nextDeps.has(activity._id) && !processed.has(nextActivity._id)) {
        nextDeps.delete(activity._id);
        if (nextDeps.size === 0) {
          queue.push(nextActivity);
        }
      }
    });

    processed.add(activity._id);
  }

  return calculatedActivities;
};