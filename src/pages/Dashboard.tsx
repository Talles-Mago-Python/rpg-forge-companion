import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getTemplates, getSheets, deleteTemplate, deleteSheet } from '@/lib/storage';
import { SheetTemplate, CharacterSheet } from '@/types/rpg';
import { Plus, ScrollText, FileText, LogOut, Trash2, Shield, ChevronRight } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<SheetTemplate[]>([]);
  const [sheets, setSheets] = useState<CharacterSheet[]>([]);
  const [activeTab, setActiveTab] = useState<'sheets' | 'templates'>('sheets');

  useEffect(() => {
    setTemplates(getTemplates());
    setSheets(getSheets());
  }, []);

  const handleDeleteTemplate = (id: string) => {
    deleteTemplate(id);
    setTemplates(getTemplates());
  };

  const handleDeleteSheet = (id: string) => {
    deleteSheet(id);
    setSheets(getSheets());
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Aventureiro';

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-display gold-text">RPG Companion</h1>
            <p className="text-sm text-muted-foreground">Olá, {displayName}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={signOut}>
          <LogOut className="w-5 h-5" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'sheets' ? 'gold' : 'secondary'}
          onClick={() => setActiveTab('sheets')}
          className="flex-1"
        >
          <FileText className="w-4 h-4" />
          Fichas ({sheets.length})
        </Button>
        <Button
          variant={activeTab === 'templates' ? 'gold' : 'secondary'}
          onClick={() => setActiveTab('templates')}
          className="flex-1"
        >
          <ScrollText className="w-4 h-4" />
          Templates ({templates.length})
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'templates' && (
        <div className="space-y-3 animate-fade-in">
          <Button variant="gold" className="w-full" onClick={() => navigate('/template/new')}>
            <Plus className="w-4 h-4" /> Novo Template
          </Button>

          {templates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ScrollText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum template criado ainda.</p>
              <p className="text-sm">Crie um template para começar!</p>
            </div>
          ) : (
            templates.map((t) => (
              <div
                key={t.id}
                className="bg-card rpg-border rounded-lg p-4 flex items-center justify-between group hover:card-glow transition-shadow cursor-pointer"
                onClick={() => navigate(`/template/${t.id}`)}
              >
                <div className="flex-1">
                  <h3 className="font-display text-foreground">{t.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t.attributes.length} atributos · {t.derivedStats.length} status
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(t.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'sheets' && (
        <div className="space-y-3 animate-fade-in">
          {templates.length > 0 && (
            <Button variant="gold" className="w-full" onClick={() => navigate('/sheet/new')}>
              <Plus className="w-4 h-4" /> Nova Ficha
            </Button>
          )}

          {sheets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma ficha criada ainda.</p>
              {templates.length === 0 ? (
                <p className="text-sm">Crie um template primeiro!</p>
              ) : (
                <p className="text-sm">Crie uma ficha a partir de um template!</p>
              )}
            </div>
          ) : (
            sheets.map((s) => {
              const template = templates.find((t) => t.id === s.template_id);
              return (
                <div
                  key={s.id}
                  className="bg-card rpg-border rounded-lg p-4 flex items-center justify-between group hover:card-glow transition-shadow cursor-pointer"
                  onClick={() => navigate(`/sheet/${s.id}`)}
                >
                  <div className="flex-1">
                    <h3 className="font-display text-foreground">{s.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Template: {template?.name || 'Desconhecido'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSheet(s.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
