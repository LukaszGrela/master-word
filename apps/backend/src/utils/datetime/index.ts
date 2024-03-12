export const getStartOfDay = (day = new Date()): Date => {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0, 0);
};
