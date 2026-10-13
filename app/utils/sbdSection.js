// Shape helpers shared by the SBD section add/edit dialogs.

export function blankSbdSection() {
  return {
    title: '',
    type: 'label_value',
    fields: [{ label: '', value: '' }],
    columns: ['Column 1', 'Column 2'],
    rows: [['', '']],
    items: [''],
  };
}

// Hydrate a stored body into a fully-populated editable section so switching
// the type select always has something to show.
export function toEditableSbdSection(body) {
  body = body ?? {};
  return {
    title: body.title ?? '',
    type: body.type ?? 'label_value',
    fields: (body.fields ?? []).length
      ? body.fields.map((f) => ({ label: f.label ?? '', value: f.value ?? '' }))
      : [{ label: '', value: '' }],
    columns: (body.columns ?? []).length ? [...body.columns] : ['Column 1', 'Column 2'],
    rows: (body.rows ?? []).length ? body.rows.map((r) => [...r]) : [['', '']],
    items: (body.items ?? []).length ? [...body.items] : [''],
  };
}

// Reduce the editable section to the body payload for the API (only the keys
// relevant to its type; the backend sanitiser drops blanks).
export function sbdSectionToBody(section) {
  const body = { title: (section.title ?? '').trim(), type: section.type ?? 'label_value' };
  if (section.type === 'table') {
    body.columns = (section.columns ?? []).map((c) => c ?? '');
    body.rows = (section.rows ?? []).map((r) => (r ?? []).map((c) => c ?? ''));
  } else if (section.type === 'list') {
    body.items = (section.items ?? []).map((i) => i ?? '');
  } else {
    body.fields = (section.fields ?? []).map((f) => ({ label: f.label ?? '', value: f.value ?? '' }));
  }
  return body;
}
