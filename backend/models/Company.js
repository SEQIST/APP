const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  street: { type: String, required: true },
  number: { type: String, required: true },
  zip: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String, required: true },
  workHoursDay: { type: Number, max: 24, default: 8 },
  approvedHolidayDays: { type: Number, max: 45, default: 30 },
  publicHolidaysYear: { type: Number, max: 30, default: 12 },
  avgSickDaysYear: { type: Number, max: 30, default: 10 },
  workdaysWeek: { type: Number, max: 7, default: 5 },
  maxLoad: { type: Number, max: 100, default: 85 }, // In Prozent
}, {
  // Virtuelle Felder für Berechnungen
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Berechnete Felder
companySchema.virtual('workdaysYear').get(function () {
  return (365 / 7 * this.workdaysWeek) - this.avgSickDaysYear - this.approvedHolidayDays - this.publicHolidaysYear;
});

companySchema.virtual('workdaysMonth').get(function () {
  return this.workdaysYear / 12;
});

companySchema.virtual('workHoursYear').get(function () {
  return this.workdaysYear * this.workHoursDay;
});

companySchema.virtual('workHoursYearMaxLoad').get(function () {
  return this.workHoursYear * (this.maxLoad / 100);
});

companySchema.virtual('workHoursDayMaxLoad').get(function () {
  return this.workHoursYearMaxLoad / 365;
});

companySchema.virtual('workHoursWorkday').get(function () {
  return this.workHoursYearMaxLoad / this.workdaysYear;
});

companySchema.virtual('workHoursMonth').get(function () {
  return this.workdaysMonth * this.workHoursWorkday;
});

module.exports = mongoose.model('Company', companySchema);