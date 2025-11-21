export const CLASS_TIME_SLOTS = [
  { id: 'slot-08-10', label: 'Ca 1 (08:00 - 10:00)', start: '08:00', end: '10:00' },
  { id: 'slot-10-12', label: 'Ca 2 (10:00 - 12:00)', start: '10:00', end: '12:00' },
  { id: 'slot-12-14', label: 'Ca 3 (12:00 - 14:00)', start: '12:00', end: '14:00' },
  { id: 'slot-14-16', label: 'Ca 4 (14:00 - 16:00)', start: '14:00', end: '16:00' },
  { id: 'slot-16-18', label: 'Ca 5 (16:00 - 18:00)', start: '16:00', end: '18:00' },
  { id: 'slot-18-20', label: 'Ca 6 (18:00 - 20:00)', start: '18:00', end: '20:00' },
];

export const getSlotById = (slotId) => CLASS_TIME_SLOTS.find((slot) => slot.id === slotId);

export const buildSlotDateTime = (date, time) => {
  if (!date || !time) {
    return '';
  }
  return `${date}T${time}`;
};

export const formatSlotForSummary = (slotId) => {
  const slot = getSlotById(slotId);
  return slot ? slot.label : '';
};
