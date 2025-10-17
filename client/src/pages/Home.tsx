import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Link } from 'wouter';
import { 
  Menu, 
  X, 
  ChevronRight, 
  Eye, 
  Search, 
  TrendingUp, 
  Lightbulb,
  Users,
  Wrench,
  TrendingDown,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Linkedin
} from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Aqui você pode integrar com seu backend posteriormente
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(t.contact.success);
    setContactForm({ name: '', email: '', phone: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-primary">LeanLia</div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollToSection('home')} className="text-sm font-medium hover:text-primary transition-colors">
                {t.nav.home}
              </button>
              <button onClick={() => scrollToSection('about')} className="text-sm font-medium hover:text-primary transition-colors">
                {t.nav.about}
              </button>
              <button onClick={() => scrollToSection('lia')} className="text-sm font-medium hover:text-primary transition-colors">
                {t.nav.lia}
              </button>
              <button onClick={() => scrollToSection('methodology')} className="text-sm font-medium hover:text-primary transition-colors">
                {t.nav.methodology}
              </button>
              <button onClick={() => scrollToSection('cases')} className="text-sm font-medium hover:text-primary transition-colors">
                {t.nav.cases}
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-sm font-medium hover:text-primary transition-colors">
                {t.nav.contact}
              </button>
              <LanguageSelector />
              <Link href="/login">
                <Button variant="default" size="sm">
                  {t.nav.login}
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <LanguageSelector />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-accent rounded-md"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2 border-t border-border">
              <button onClick={() => scrollToSection('home')} className="block w-full text-left px-4 py-2 hover:bg-accent rounded-md">
                {t.nav.home}
              </button>
              <button onClick={() => scrollToSection('about')} className="block w-full text-left px-4 py-2 hover:bg-accent rounded-md">
                {t.nav.about}
              </button>
              <button onClick={() => scrollToSection('lia')} className="block w-full text-left px-4 py-2 hover:bg-accent rounded-md">
                {t.nav.lia}
              </button>
              <button onClick={() => scrollToSection('methodology')} className="block w-full text-left px-4 py-2 hover:bg-accent rounded-md">
                {t.nav.methodology}
              </button>
              <button onClick={() => scrollToSection('cases')} className="block w-full text-left px-4 py-2 hover:bg-accent rounded-md">
                {t.nav.cases}
              </button>
              <button onClick={() => scrollToSection('contact')} className="block w-full text-left px-4 py-2 hover:bg-accent rounded-md">
                {t.nav.contact}
              </button>
              <Link href="/login">
                <Button variant="default" className="w-full mt-2">
                  {t.nav.login}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-agro-tech.jpg" 
            alt="Agricultural technology" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
        </div>
        
        <div className="container relative z-10 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              {t.hero.title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={() => scrollToSection('lia')} className="gap-2">
                {t.hero.cta1} <ChevronRight className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollToSection('contact')}>
                {t.hero.cta2}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t.about.title}</h2>
          
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-primary">{t.about.whoWeAre}</h3>
              <p className="text-muted-foreground leading-relaxed">{t.about.whoWeAreText}</p>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-semibold mb-2">{t.about.mission}</h4>
                <p className="text-muted-foreground">{t.about.missionText}</p>
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">{t.about.objective}</h4>
                <p className="text-muted-foreground">{t.about.objectiveText}</p>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-center mb-8">{t.about.whyChoose}</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  {t.about.reason1Title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.about.reason1Text}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  {t.about.reason2Title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.about.reason2Text}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  {t.about.reason3Title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.about.reason3Text}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* LIA Section */}
      <section id="lia" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <img src="/ai-dashboard-field.jpg" alt="LIA Dashboard" className="w-full h-full object-cover" />
        </div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t.lia.title}</h2>
            <p className="text-xl text-primary font-semibold mb-6">{t.lia.subtitle}</p>
            <p className="text-lg text-muted-foreground leading-relaxed">{t.lia.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-card/80 backdrop-blur">
              <CardContent className="pt-6">
                <p className="text-lg italic text-foreground">"{t.lia.question1}"</p>
              </CardContent>
            </Card>
            <Card className="bg-card/80 backdrop-blur">
              <CardContent className="pt-6">
                <p className="text-lg italic text-foreground">"{t.lia.question2}"</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                {t.lia.accessButton} <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Four Visions Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.visions.title}</h2>
            <p className="text-xl text-muted-foreground">{t.visions.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t.visions.descriptive}</CardTitle>
                <CardDescription className="text-base font-semibold text-foreground">
                  {t.visions.descriptiveText}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-secondary transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>{t.visions.diagnostic}</CardTitle>
                <CardDescription className="text-base font-semibold text-foreground">
                  {t.visions.diagnosticText}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-accent transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>{t.visions.predictive}</CardTitle>
                <CardDescription className="text-base font-semibold text-foreground">
                  {t.visions.predictiveText}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t.visions.prescriptive}</CardTitle>
                <CardDescription className="text-base font-semibold text-foreground">
                  {t.visions.prescriptiveText}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Methodology TAIA Section */}
      <section id="methodology" className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.methodology.title}</h2>
            <p className="text-xl text-muted-foreground">{t.methodology.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <div>
                    <CardTitle>{t.methodology.phase1Title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.methodology.phase1Text}</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-secondary" />
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <div>
                    <CardTitle>{t.methodology.phase2Title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.methodology.phase2Text}</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-accent" />
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <div>
                    <CardTitle>{t.methodology.phase3Title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.methodology.phase3Text}</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                  <div>
                    <CardTitle>{t.methodology.phase4Title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.methodology.phase4Text}</p>
              </CardContent>
            </Card>
          </div>

          <h3 className="text-2xl font-bold text-center mb-8">{t.methodology.whyWorks}</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.methodology.benefit1Title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.methodology.benefit1Text}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t.methodology.benefit2Title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.methodology.benefit2Text}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t.methodology.benefit3Title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.methodology.benefit3Text}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t.benefits.title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>{t.benefits.benefit1}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle>{t.benefits.benefit2}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Wrench className="h-8 w-8 text-accent" />
                </div>
                <CardTitle>{t.benefits.benefit3}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingDown className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>{t.benefits.benefit4}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Cases Section */}
      <section id="cases" className="py-20">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t.cases.title}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 opacity-5">
                <img src="/agro-machinery.jpg" alt="Machinery" className="w-full h-full object-cover" />
              </div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl">{t.cases.case1Title}</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground mb-4">{t.cases.case1Text}</p>
                <div className="p-4 bg-primary/10 rounded-lg border-l-4 border-primary">
                  <p className="font-semibold text-primary">{t.cases.case1Result}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 opacity-5">
                <img src="/team-collaboration.jpg" alt="Team" className="w-full h-full object-cover" />
              </div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl">{t.cases.case2Title}</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground mb-4">{t.cases.case2Text}</p>
                <div className="p-4 bg-secondary/10 rounded-lg border-l-4 border-secondary">
                  <p className="font-semibold text-secondary">{t.cases.case2Result}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">{t.cta.title}</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">{t.cta.subtitle}</p>
          <Button size="lg" variant="secondary" onClick={() => scrollToSection('contact')} className="gap-2">
            {t.cta.button} <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{t.contact.title}</h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div>
              <h3 className="text-2xl font-bold mb-6">LeanLia</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <a href="mailto:contato@leanlia.com" className="text-muted-foreground hover:text-primary">
                      contato@leanlia.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">WhatsApp</p>
                    <a href="https://wa.me/5511933967595" className="text-muted-foreground hover:text-primary">
                      (11) 93396-7595
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">Endereço</p>
                    <p className="text-muted-foreground">
                      Avenida Pereira Barreto, 1201<br />
                      Sala 24B, Torre Vitória<br />
                      Centro, São Bernardo do Campo, SP
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <a href="https://instagram.com/leanlia" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    <Instagram className="h-6 w-6" />
                  </a>
                  <a href="https://linkedin.com/company/leanlia" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    <Linkedin className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t.contact.name}</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t.contact.email}</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t.contact.phone}</label>
                    <input
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">{t.contact.message}</label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? t.contact.sending : t.contact.send}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t border-border py-12">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">LeanLia</h3>
              <p className="text-muted-foreground">
                {t.footer.about}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t.footer.contact}</h4>
              <div className="space-y-2 text-muted-foreground">
                <p>contato@leanlia.com</p>
                <p>(11) 93396-7595</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t.footer.followUs}</h4>
              <div className="flex gap-4">
                <a href="https://instagram.com/leanlia" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="https://linkedin.com/company/leanlia" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>
              <div className="mt-4">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    {t.nav.login}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-muted-foreground text-sm">
            <p>© 2024 LeanLia. {t.footer.rights}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

