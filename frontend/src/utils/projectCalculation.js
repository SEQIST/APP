// src/utils/projectCalculation.js

export const calculateProject = (activities, projectStartDate = new Date()) => {
  const roleAvailability = {};
  const calculatedActivities = [];

  activities.forEach((activity, index) => {
    const roleId = activity.executedBy?._id || 'unknown';
    let startTime = projectStartDate;

    // Startzeit-Konflikt
    if (roleAvailability[roleId]) {
      const lastEndTime = roleAvailability[roleId].sort((a, b) => b.endTime - a.endTime)[0]?.endTime;
      if (lastEndTime && lastEndTime > startTime) {
        startTime = new Date(lastEndTime);
        console.log(`Startzeit-Konflikt für Rolle ${roleId}, verschoben auf ${startTime}`);
      }
    }

    // Dauer-Berechnung
    const workloadFactor = 1;
    const numWorkProducts = activity.trigger?.workProducts?.length || 1;
    const time = parseFloat(activity.knownTime || activity.estimatedTime || 0);
    const numRoles = 1;
    const workModeFactor = activity.workMode === 'Parallel' ? 0.5 : 1;
    const workingHoursPerDay = 8;

    const durationHours = (workloadFactor * activity.multiplicator * numWorkProducts * time * numRoles * workModeFactor) / workingHoursPerDay;
    const durationDays = Math.ceil(durationHours / workingHoursPerDay);

    // Endzeit-Berechnung
    const endTime = new Date(startTime);
    endTime.setDate(startTime.getDate() + durationDays);

    // Kosten-Berechnung
    const roleCostPerHour = 50;
    const cost = durationHours * roleCostPerHour;

    calculatedActivities.push({
      id: activity._id,
      name: activity.name,
      start: startTime,
      end: endTime,
      role: roleId,
      duration: durationDays,
      cost,
      hasStartConflict: !!roleAvailability[roleId],
    });

    roleAvailability[roleId] = roleAvailability[roleId] || [];
    roleAvailability[roleId].push({ endTime });
  });

  return calculatedActivities;
};