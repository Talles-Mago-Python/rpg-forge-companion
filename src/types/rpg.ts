// Types for the RPG Companion app

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
}

export type FieldType = 'text' | 'number' | 'boolean';

export interface SubField {
  id: string;
  name: string;
  value: string;
}

export interface TemplateAttribute {
  id: string;
  name: string;
  value: string;
  fieldType: FieldType;
  subFields: SubField[];
}

export interface DerivedStat {
  id: string;
  name: string;
  formula: string; // e.g., "{Constituição} * 2 + 10"
}

export interface SheetTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string;
  attributes: TemplateAttribute[];
  derivedStats: DerivedStat[];
  created_at: string;
  updated_at: string;
}

export interface CharacterSheet {
  id: string;
  user_id: string;
  template_id: string;
  name: string;
  attributes: TemplateAttribute[];
  derivedStats: DerivedStat[];
  created_at: string;
  updated_at: string;
}

export interface SheetPermission {
  id: string;
  sheet_id: string;
  user_id: string;
  role: 'owner' | 'master' | 'editor' | 'viewer';
}
