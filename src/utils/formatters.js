import { format, formatDistanceToNow } from 'date-fns';

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString) {
  return format(new Date(dateString), 'dd MMM yyyy, hh:mm a');
}

export function formatRelativeTime(dateString) {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

export function formatChangeDescription(action, changes) {
  if (!changes) return '';

  const parts = [];
  for (const [field, value] of Object.entries(changes)) {
    if (field === 'quantity') continue;
    const label = field.replace(/_/g, ' ');
    if (value.old !== undefined && value.new !== undefined) {
      parts.push(`${label}: "${value.old}" → "${value.new}"`);
    }
  }
  return parts.join(', ');
}

export function formatQuantityChange(changes) {
  if (!changes?.quantity) return '';
  const { old: oldVal, new: newVal } = changes.quantity;
  const diff = newVal - oldVal;
  const sign = diff > 0 ? '+' : '';
  return `${oldVal} → ${newVal} (${sign}${diff})`;
}
