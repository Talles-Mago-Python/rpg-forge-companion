import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SheetTemplate, TemplateAttribute, DerivedStat, FieldType, SubField } from '@/types/rpg';
import { getTemplates, saveTemplate } from '@/lib/storage';
import { ArrowLeft, Plus, Trash2, Save, X, ChevronDown } from 'lucide-react';

const generateId = () => crypto.randomUUID();

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'number', label: 'Número' },
  { value: 'text', label: 'Texto' },
  { value: 'boolean', label: 'Sim/Não' },
];

const TemplateEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = id === 'new';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [attributes, setAttributes] = useState<TemplateAttribute[]>([]);
  const [derivedStats, setDerivedStats] = useState<DerivedStat[]>([]);

  useEffect(() => {
    if (!isNew && id) {
      const templates = getTemplates();
      const found = templates.find((t) => t.id === id);
      if (found) {
        setName(found.name);
        setDescription(found.description);
        setAttributes(found.attributes);
        setDerivedStats(found.derivedStats);
      }
    }
  }, [id, isNew]);

  const addAttribute = () => {
    setAttributes([
      ...attributes,
      { id: generateId(), name: '', value: '', fieldType: 'number', subFields: [] },
    ]);
  };

  const updateAttribute = (attrId: string, updates: Partial<TemplateAttribute>) => {
    setAttributes(attributes.map((a) => (a.id === attrId ? { ...a, ...updates } : a)));
  };

  const removeAttribute = (attrId: string) => {
    setAttributes(attributes.filter((a) => a.id !== attrId));
  };

  const addSubField = (attrId: string) => {
    setAttributes(
      attributes.map((a) =>
        a.id === attrId
          ? { ...a, subFields: [...a.subFields, { id: generateId(), name: '', value: '' }] }
          : a
      )
    );
  };

  const updateSubField = (attrId: string, subId: string, updates: Partial<SubField>) => {
    setAttributes(
      attributes.map((a) =>
        a.id === attrId
          ? {
              ...a,
              subFields: a.subFields.map((s) => (s.id === subId ? { ...s, ...updates } : s)),
            }
          : a
      )
    );
  };

  const removeSubField = (attrId: string, subId: string) => {
    setAttributes(
      attributes.map((a) =>
        a.id === attrId
          ? { ...a, subFields: a.subFields.filter((s) => s.id !== subId) }
          : a
      )
    );
  };

  const addDerivedStat = () => {
    setDerivedStats([...derivedStats, { id: generateId(), name: '', formula: '' }]);
  };

  const updateDerivedStat = (statId: string, updates: Partial<DerivedStat>) => {
    setDerivedStats(derivedStats.map((s) => (s.id === statId ? { ...s, ...updates } : s)));
  };

  const removeDerivedStat = (statId: string) => {
    setDerivedStats(derivedStats.filter((s) => s.id !== statId));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const now = new Date().toISOString();
    const template: SheetTemplate = {
      id: isNew ? generateId() : id!,
      user_id: user?.id || '',
      name: name.trim(),
      description: description.trim(),
      attributes,
      derivedStats,
      created_at: isNew ? now : now,
      updated_at: now,
    };
    saveTemplate(template);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-display gold-text">
          {isNew ? 'Novo Template' : 'Editar Template'}
        </h1>
      </div>

      <div className="space-y-6 animate-fade-in">
        {/* Basic Info */}
        <div className="bg-card rpg-border rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <Label>Nome do Template</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: D&D 5e, Ordem Paranormal..."
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição do template..."
              className="bg-secondary border-border"
            />
          </div>
        </div>

        {/* Attributes Section */}
        <div className="bg-card rpg-border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg gold-text">Atributos</h2>
            <Button variant="gold" size="sm" onClick={addAttribute}>
              <Plus className="w-4 h-4" /> Adicionar Campo
            </Button>
          </div>

          {attributes.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-4">
              Adicione atributos como Força, Destreza, Inteligência...
            </p>
          )}

          {attributes.map((attr, idx) => (
            <div key={attr.id} className="bg-secondary/50 rounded-lg p-3 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">#{idx + 1}</span>
                <Input
                  value={attr.name}
                  onChange={(e) => updateAttribute(attr.id, { name: e.target.value })}
                  placeholder="Nome do atributo"
                  className="bg-secondary border-border flex-1"
                />
                <Input
                  value={attr.value}
                  onChange={(e) => updateAttribute(attr.id, { value: e.target.value })}
                  placeholder="Valor"
                  className="bg-secondary border-border w-20"
                />
                {/* Field Type Selector */}
                <div className="relative">
                  <select
                    value={attr.fieldType}
                    onChange={(e) =>
                      updateAttribute(attr.id, { fieldType: e.target.value as FieldType })
                    }
                    className="appearance-none bg-secondary border border-border rounded-md px-2 py-2 pr-7 text-sm text-foreground cursor-pointer"
                  >
                    {FIELD_TYPES.map((ft) => (
                      <option key={ft.value} value={ft.value}>
                        {ft.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-muted-foreground" />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeAttribute(attr.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>

              {/* Sub-fields */}
              {attr.subFields.map((sub) => (
                <div key={sub.id} className="flex items-center gap-2 ml-6">
                  <div className="w-px h-4 bg-primary/30" />
                  <Input
                    value={sub.name}
                    onChange={(e) => updateSubField(attr.id, sub.id, { name: e.target.value })}
                    placeholder="Sub-campo (ex: Modificador)"
                    className="bg-secondary border-border flex-1"
                  />
                  <Input
                    value={sub.value}
                    onChange={(e) => updateSubField(attr.id, sub.id, { value: e.target.value })}
                    placeholder="Valor"
                    className="bg-secondary border-border w-20"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSubField(attr.id, sub.id)}
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => addSubField(attr.id)}
                className="ml-6 text-primary"
              >
                <Plus className="w-3 h-3" /> Sub-campo
              </Button>
            </div>
          ))}
        </div>

        {/* Derived Stats Section */}
        <div className="bg-card rpg-border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg gold-text">Status Derivados</h2>
            <Button variant="gold" size="sm" onClick={addDerivedStat}>
              <Plus className="w-4 h-4" /> Adicionar Status
            </Button>
          </div>

          {derivedStats.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-4">
              Defina status calculados como HP Máximo, Iniciativa...
            </p>
          )}

          {attributes.length > 0 && derivedStats.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Use {'{NomeDoAtributo}'} na fórmula para referenciar atributos.
            </p>
          )}

          {derivedStats.map((stat) => (
            <div key={stat.id} className="bg-secondary/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={stat.name}
                  onChange={(e) => updateDerivedStat(stat.id, { name: e.target.value })}
                  placeholder="Nome do status (ex: HP Máximo)"
                  className="bg-secondary border-border flex-1"
                />
                <Button variant="ghost" size="icon" onClick={() => removeDerivedStat(stat.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              <div className="space-y-1">
                <Input
                  value={stat.formula}
                  onChange={(e) => updateDerivedStat(stat.id, { formula: e.target.value })}
                  placeholder="Fórmula: {Constituição} * 2 + 10"
                  className="bg-secondary border-border font-mono text-sm"
                />
                {attributes.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {attributes
                      .filter((a) => a.name)
                      .map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded hover:bg-primary/30 transition-colors"
                          onClick={() =>
                            updateDerivedStat(stat.id, {
                              formula: stat.formula + `{${a.name}}`,
                            })
                          }
                        >
                          {'{' + a.name + '}'}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <Button variant="gold" className="w-full" onClick={handleSave} disabled={!name.trim()}>
          <Save className="w-4 h-4" /> Salvar Template
        </Button>
      </div>
    </div>
  );
};

export default TemplateEditor;
