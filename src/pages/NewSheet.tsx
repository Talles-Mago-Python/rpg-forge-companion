import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CharacterSheet, SheetTemplate, TemplateAttribute } from '@/types/rpg';
import { getTemplates, getSheets, saveSheet } from '@/lib/storage';
import { calculateDerivedStats } from '@/lib/formula';
import { ArrowLeft, Save, ScrollText } from 'lucide-react';

const generateId = () => crypto.randomUUID();

const NewSheet: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<SheetTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<SheetTemplate | null>(null);
  const [sheetName, setSheetName] = useState('');
  const [attributes, setAttributes] = useState<TemplateAttribute[]>([]);

  useEffect(() => {
    setTemplates(getTemplates());
  }, []);

  const selectTemplate = (template: SheetTemplate) => {
    setSelectedTemplate(template);
    // Deep copy attributes from template
    setAttributes(JSON.parse(JSON.stringify(template.attributes)));
  };

  const updateAttrValue = (attrId: string, value: string) => {
    setAttributes(attributes.map((a) => (a.id === attrId ? { ...a, value } : a)));
  };

  const updateSubFieldValue = (attrId: string, subId: string, value: string) => {
    setAttributes(
      attributes.map((a) =>
        a.id === attrId
          ? {
              ...a,
              subFields: a.subFields.map((s) => (s.id === subId ? { ...s, value } : s)),
            }
          : a
      )
    );
  };

  const derivedResults = selectedTemplate
    ? calculateDerivedStats(selectedTemplate.derivedStats, attributes)
    : {};

  const handleSave = () => {
    if (!sheetName.trim() || !selectedTemplate) return;
    const now = new Date().toISOString();
    const sheet: CharacterSheet = {
      id: generateId(),
      user_id: user?.id || '',
      template_id: selectedTemplate.id,
      name: sheetName.trim(),
      attributes,
      derivedStats: selectedTemplate.derivedStats,
      created_at: now,
      updated_at: now,
    };
    saveSheet(sheet);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-display gold-text">Nova Ficha</h1>
      </div>

      <div className="space-y-6 animate-fade-in">
        {!selectedTemplate ? (
          /* Template Selection */
          <div className="space-y-3">
            <h2 className="font-display text-lg text-foreground">Escolha um Template</h2>
            {templates.map((t) => (
              <div
                key={t.id}
                className="bg-card rpg-border rounded-lg p-4 cursor-pointer hover:card-glow transition-shadow"
                onClick={() => selectTemplate(t)}
              >
                <div className="flex items-center gap-3">
                  <ScrollText className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-display text-foreground">{t.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t.attributes.length} atributos · {t.derivedStats.length} status
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Sheet Creation Form */
          <>
            <div className="bg-card rpg-border rounded-lg p-4 space-y-4">
              <div className="space-y-2">
                <Label>Nome do Personagem</Label>
                <Input
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  placeholder="Ex: Gandalf, Arthas..."
                  className="bg-secondary border-border"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Template: {selectedTemplate.name}
                <button
                  className="text-primary ml-2 underline"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Trocar
                </button>
              </p>
            </div>

            {/* Attributes */}
            <div className="bg-card rpg-border rounded-lg p-4 space-y-4">
              <h2 className="font-display text-lg gold-text">Atributos</h2>
              {attributes.map((attr) => (
                <div key={attr.id} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Label className="min-w-[120px] text-foreground">{attr.name || 'Atributo'}</Label>
                    {attr.fieldType === 'boolean' ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={attr.value === 'true'}
                          onChange={(e) =>
                            updateAttrValue(attr.id, e.target.checked ? 'true' : 'false')
                          }
                          className="w-5 h-5 accent-primary"
                        />
                        <span className="text-sm text-muted-foreground">
                          {attr.value === 'true' ? 'Sim' : 'Não'}
                        </span>
                      </label>
                    ) : (
                      <Input
                        type={attr.fieldType === 'number' ? 'number' : 'text'}
                        value={attr.value}
                        onChange={(e) => updateAttrValue(attr.id, e.target.value)}
                        className="bg-secondary border-border"
                      />
                    )}
                  </div>
                  {attr.subFields.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-3 ml-6">
                      <div className="w-px h-4 bg-primary/30" />
                      <Label className="min-w-[100px] text-muted-foreground text-sm">
                        {sub.name || 'Sub-campo'}
                      </Label>
                      <Input
                        value={sub.value}
                        onChange={(e) => updateSubFieldValue(attr.id, sub.id, e.target.value)}
                        className="bg-secondary border-border"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Derived Stats */}
            {selectedTemplate.derivedStats.length > 0 && (
              <div className="bg-card rpg-border rounded-lg p-4 space-y-3">
                <h2 className="font-display text-lg gold-text">Status Derivados</h2>
                {selectedTemplate.derivedStats.map((stat) => (
                  <div
                    key={stat.id}
                    className="flex items-center justify-between bg-secondary/50 rounded-lg p-3"
                  >
                    <span className="text-foreground font-medium">{stat.name}</span>
                    <span className="font-mono text-primary text-lg font-bold">
                      {derivedResults[stat.id] ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="gold"
              className="w-full"
              onClick={handleSave}
              disabled={!sheetName.trim()}
            >
              <Save className="w-4 h-4" /> Criar Ficha
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default NewSheet;
