import { getSimulatedTime } from '../lib/timeSimulation';

export function formatDateTime(dateTimeString) {
  const date = new Date(dateTimeString);
  const options = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  return date.toLocaleString('en-US', options);
}

export function formatTime(dateTimeString) {
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function formatDate(dateTimeString) {
  const date = new Date(dateTimeString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

export function isToday(dateTimeString) {
  const date = new Date(dateTimeString);
  const today = getSimulatedTime();
  return date.toDateString() === today.toDateString();
}

export function isTomorrow(dateTimeString) {
  const date = new Date(dateTimeString);
  const tomorrow = new Date(getSimulatedTime());
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
}

export function isPast(dateTimeString) {
  return new Date(dateTimeString) < getSimulatedTime();
}

export function getDayLabel(dateTimeString) {
  if (isToday(dateTimeString)) return 'Today';
  if (isTomorrow(dateTimeString)) return 'Tomorrow';
  return formatDate(dateTimeString);
}