import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Link } from 'wouter';
import { ArrowLeft, Mail, Lock } from 'lucide-react';

export default function Login() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Placeholder para integração futura com sistema de autenticação
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert('Sistema de autenticação será integrado em breve.');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-2xl font-bold text-primary">LeanLia</span>
              </Button>
            </Link>
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <div className="text-3xl font-bold text-primary">LIA</div>
              </div>
              <CardTitle className="text-2xl">{t.login.title}</CardTitle>
              <CardDescription>{t.login.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.login.email}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.login.password}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <a href="#" className="text-primary hover:underline">
                    {t.login.forgotPassword}
                  </a>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? '...' : t.login.button}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>{t.login.noAccount}</p>
                <Link href="/#contact">
                  <Button variant="link" className="mt-2">
                    {t.nav.contact}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6 bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm text-center text-muted-foreground">
                Esta é uma página de login de demonstração. O sistema de autenticação completo será integrado posteriormente conforme suas necessidades específicas.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

