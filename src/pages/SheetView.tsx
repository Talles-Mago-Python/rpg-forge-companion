import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CharacterSheet, TemplateAttribute } from '@/types/rpg';
import { getSheets, saveSheet } from '@/lib/storage';
import { calculateDerivedStats } from '@/lib/formula';
import { ArrowLeft, Save } from 'lucide-react';

const SheetView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sheet, setSheet] = useState<CharacterSheet | null>(null);

  useEffect(() => {
    const sheets = getSheets();
    const found = sheets.find((s) => s.id === id);
    if (found) {
      setSheet(found);
    }
  }, [id]);

  if (!sheet) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Ficha não encontrada.
      </div>
    );
  }

  const updateAttrValue = (attrId: string, value: string) => {
    const updated = {
      ...sheet,
      attributes: sheet.attributes.map((a) => (a.id === attrId ? { ...a, value } : a)),
    };
    setSheet(updated);
    saveSheet(updated);
  };

  const updateSubFieldValue = (attrId: string, subId: string, value: string) => {
    const updated = {
      ...sheet,
      attributes: sheet.attributes.map((a) =>
        a.id === attrId
          ? { ...a, subFields: a.subFields.map((s) => (s.id === subId ? { ...s, value } : s)) }
          : a
      ),
    };
    setSheet(updated);
    saveSheet(updated);
  };

  const derivedResults = calculateDerivedStats(sheet.derivedStats, sheet.attributes);

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6 animate-fade-in">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-display gold-text">{sheet.name}</h1>
      </div>

      <div className="space-y-6 animate-fade-in">
        {/* Derived Stats (prominent at top) */}
        {sheet.derivedStats.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {sheet.derivedStats.map((stat) => (
              <div
                key={stat.id}
                className="bg-card rpg-border rounded-lg p-4 text-center card-glow"
              >
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  {stat.name}
                </p>
                <p className="text-2xl font-display gold-text font-bold">
                  {derivedResults[stat.id] ?? '—'}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Attributes */}
        <div className="bg-card rpg-border rounded-lg p-4 space-y-4">
          <h2 className="font-display text-lg gold-text">Atributos</h2>
          {sheet.attributes.map((attr) => (
            <div key={attr.id} className="space-y-2">
              <div className="flex items-center gap-3">
                <Label className="min-w-[120px] text-foreground font-medium">
                  {attr.name || 'Atributo'}
                </Label>
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
      </div>
    </div>
  );
};

export default SheetView;
