import { SheetTemplate, CharacterSheet } from '@/types/rpg';

const TEMPLATES_KEY = 'rpg_templates';
const SHEETS_KEY = 'rpg_sheets';

export function getTemplates(): SheetTemplate[] {
  const data = localStorage.getItem(TEMPLATES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTemplate(template: SheetTemplate): void {
  const templates = getTemplates();
  const idx = templates.findIndex((t) => t.id === template.id);
  if (idx >= 0) {
    templates[idx] = { ...template, updated_at: new Date().toISOString() };
  } else {
    templates.push(template);
  }
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function deleteTemplate(id: string): void {
  const templates = getTemplates().filter((t) => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function getSheets(): CharacterSheet[] {
  const data = localStorage.getItem(SHEETS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveSheet(sheet: CharacterSheet): void {
  const sheets = getSheets();
  const idx = sheets.findIndex((s) => s.id === sheet.id);
  if (idx >= 0) {
    sheets[idx] = { ...sheet, updated_at: new Date().toISOString() };
  } else {
    sheets.push(sheet);
  }
  localStorage.setItem(SHEETS_KEY, JSON.stringify(sheets));
}

export function deleteSheet(id: string): void {
  const sheets = getSheets().filter((s) => s.id !== id);
  localStorage.setItem(SHEETS_KEY, JSON.stringify(sheets));
}
