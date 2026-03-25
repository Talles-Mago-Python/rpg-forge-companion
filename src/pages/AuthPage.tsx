import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Sword } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          navigate('/dashboard');
        }
      } else {
        if (!displayName.trim()) {
          setError('Nome de exibição é obrigatório');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, displayName);
        if (error) {
          setError(error.message);
        } else {
          navigate('/dashboard');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gold-gradient mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display gold-text">RPG Companion</h1>
          <p className="text-muted-foreground mt-2">Seu companheiro de aventuras</p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-lg p-6 rpg-border card-glow">
          <div className="flex gap-2 mb-6">
            <Button
              variant={isLogin ? 'gold' : 'secondary'}
              className="flex-1"
              onClick={() => setIsLogin(true)}
              type="button"
            >
              Entrar
            </Button>
            <Button
              variant={!isLogin ? 'gold' : 'secondary'}
              className="flex-1"
              onClick={() => setIsLogin(false)}
              type="button"
            >
              Criar Conta
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Nome de Aventureiro</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Seu nome de herói..."
                  className="bg-secondary border-border"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aventureiro@rpg.com"
                required
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="bg-secondary border-border"
              />
            </div>

            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}

            <Button type="submit" variant="gold" className="w-full" disabled={loading}>
              <Sword className="w-4 h-4" />
              {loading ? 'Carregando...' : isLogin ? 'Entrar na Aventura' : 'Iniciar Jornada'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
