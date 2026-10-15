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
  if (!changes) return '';
  const oldVal = changes.old_quantity ?? changes.quantity?.old;
  const newVal = changes.new_quantity ?? changes.quantity?.new;
  if (oldVal == null || newVal == null) return '';
  const diff = newVal - oldVal;
  const sign = diff > 0 ? '+' : '';
  return `Quantity changed from ${oldVal} to ${newVal} (${sign}${diff})`;
}

export function formatActivityDescription(activity) {
  const user = activity.profiles?.display_name || 'Unknown';
  const name = activity.entity_name || 'an item';

  switch (activity.action) {
    case 'product_created':
      return `${user} added a new product "${name}" with quantity ${activity.changes?.quantity || 0}`;
    case 'product_updated': {
      const parts = [];
      if (activity.changes) {
        for (const [field, value] of Object.entries(activity.changes)) {
          if (value.old !== undefined && value.new !== undefined) {
            const label = field.replace(/_/g, ' ');
            parts.push(`${label} from "${value.old}" to "${value.new}"`);
          }
        }
      }
      return parts.length > 0
        ? `${user} updated "${name}" — changed ${parts.join(', ')}`
        : `${user} updated "${name}"`;
    }
    case 'quantity_changed': {
      const oldQ = activity.changes?.old_quantity ?? activity.changes?.quantity?.old;
      const newQ = activity.changes?.new_quantity ?? activity.changes?.quantity?.new;
      if (oldQ != null && newQ != null) {
        return `${user} changed quantity of "${name}" from ${oldQ} to ${newQ}`;
      }
      return `${user} changed quantity of "${name}"`;
    }
    case 'product_deleted':
      return `${user} deleted product "${name}"`;
    case 'category_created':
      return `${user} created category "${name}"`;
    case 'category_updated': {
      const oldName = activity.changes?.name?.old;
      const newName = activity.changes?.name?.new;
      if (oldName && newName) {
        return `${user} renamed category "${oldName}" to "${newName}"`;
      }
      return `${user} updated category "${name}"`;
    }
    case 'category_deleted':
      return `${user} deleted category "${name}"`;
    case 'sale_logged': {
      const qty = activity.changes?.quantity || 0;
      const total = activity.changes?.total;
      if (total) {
        return `${user} sold ${qty} unit${qty > 1 ? 's' : ''} of "${name}" for ${formatCurrency(total)}`;
      }
      return `${user} sold ${qty} unit${qty > 1 ? 's' : ''} of "${name}"`;
    }
    default:
      return `${user} performed ${activity.action} on "${name}"`;
  }
}
