/** Consistent confirmation for destructive or irreversible UI actions. */
export function confirmDelete(item = "this item") {
  return window.confirm(`Delete ${item}? This action cannot be undone.`);
}

export function confirmRemove(item = "this item") {
  return window.confirm(`Remove ${item}? Your unsaved changes will be lost.`);
}

export function confirmDiscard(message = "Discard your changes and close?") {
  return window.confirm(message);
}
