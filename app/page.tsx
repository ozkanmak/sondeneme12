import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  BookOpen, Brain, Users, Sparkles, Target, Gamepad2,
  BarChart3, Shield, ArrowRight, Star, CheckCircle2,
  GraduationCap, Heart, Puzzle, ChevronRight
} from 'lucide-react'

export default async function HomePage() {
  let user = null
  try {
    user = await getCurrentUser()
  } catch {
    // DATABASE_URL tanimli degilse sessizce devam et
  }

  if (user) {
    if (user.role === 'student') redirect('/student')
    else if (user.role === 'teacher') redirect('/teacher')
    else if (user.role === 'admin') redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">EduPlay</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Ozellikler</a>
              <a href="#games" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Oyunlar</a>
              <a href="#how" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Nasil Calisir</a>
              <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Istatistikler</a>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Giris Yap</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/login">Hemen Basla</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-20 -left-40 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-pink-500/5 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              AI Destekli Ozel Egitim Platformu
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground tracking-tight leading-tight text-balance mb-6">
              Her Cocuk
              <span className="text-primary"> Ogrenir,</span>
              <br />
              Her Cocuk
              <span className="text-accent"> Basarir</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty leading-relaxed">
              Disleksi, diskalkuli, DEHB ve disgrafya teshisi almis cocuklar icin
              oyun tabanli, kisisellestirilmis ogrenme deneyimi. Yapay zeka ile
              her ogrencinin potansiyelini ortaya cikarin.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button asChild size="lg" className="text-base px-8 h-12 rounded-xl gap-2">
                <Link href="/login">
                  Platformu Kesfet
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8 h-12 rounded-xl gap-2">
                <Link href="#how">
                  Nasil Calisir?
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>25+ Egitici Oyun</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>4 Farkli Ogrenme Guclugu</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>AI Analiz Sistemi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Ozellikler</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
              Ogrenmeyi Kolaylastiran Araclar
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-pretty">
              Her ogrencinin ihtiyacina yonelik, bilimsel temelli ve teknoloji destekli cozumler
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: "Kisisellestirilmis Ogrenme",
                desc: "Her ogrencinin seviyesine ve ogrenme stiline gore otomatik zorluk ayarlama.",
                color: "bg-primary/10 text-primary"
              },
              {
                icon: Brain,
                title: "AI Destekli Analiz",
                desc: "OpenAI teknolojisiyle ogrenci gelisimini analiz edin, oneriler alin.",
                color: "bg-pink-500/10 text-pink-500"
              },
              {
                icon: Gamepad2,
                title: "25+ Egitici Oyun",
                desc: "Disleksi, diskalkuli, DEHB ve disgrafya icin ozel tasarlanmis oyunlar.",
                color: "bg-emerald-500/10 text-emerald-500"
              },
              {
                icon: BarChart3,
                title: "Detayli Raporlama",
                desc: "Ogretmenler icin gercek zamanli ilerleme takibi ve performans raporlari.",
                color: "bg-amber-500/10 text-amber-500"
              },
              {
                icon: Star,
                title: "Rozet ve Basari Sistemi",
                desc: "Ogrencileri motive eden 28 farkli rozet ve seviye sistemi.",
                color: "bg-orange-500/10 text-orange-500"
              },
              {
                icon: Shield,
                title: "Guvenli Ortam",
                desc: "Cocuklar icin guvenli, reklamsiz ve veli/ogretmen denetimli platform.",
                color: "bg-primary/10 text-primary"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section id="games" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Oyun Kutuphanesi</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
              Her Ogrenme Guclugune Ozel Oyunlar
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Disleksi",
                count: "8 Oyun",
                desc: "Harf tanima, ses eslestirme, kelime olusturma",
                icon: BookOpen,
                gradient: "from-blue-500 to-indigo-600",
                games: ["Harf Dedektifi", "Ses Avcisi", "Kelime Insaati", "Hizli Kelime"]
              },
              {
                title: "Diskalkuli",
                count: "7 Oyun",
                desc: "Sayi tanima, toplama, cikarma, carpim, kesirler",
                icon: Puzzle,
                gradient: "from-emerald-500 to-teal-600",
                games: ["Sayi Blogu", "Toplama Parkuru", "Carpim Tablosu", "Kesir Ustasi"]
              },
              {
                title: "DEHB",
                count: "6 Oyun",
                desc: "Dikkat, odak, sira takibi, ritim",
                icon: Sparkles,
                gradient: "from-orange-500 to-amber-600",
                games: ["Renk Patlamasi", "Simon Der Ki", "Odak Tuneli", "Ritim Ustasi"]
              },
              {
                title: "Disgrafya",
                count: "4 Oyun",
                desc: "Harf cizimi, kelime yazimi, el yazisi",
                icon: GraduationCap,
                gradient: "from-pink-500 to-rose-600",
                games: ["Harf Cizimi", "Kelime Dizgini", "El Yazisi Atolyesi"]
              }
            ].map((cat, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className={`bg-gradient-to-br ${cat.gradient} p-6 text-white`}>
                  <cat.icon className="w-10 h-10 mb-3 opacity-90" />
                  <h3 className="text-xl font-bold">{cat.title}</h3>
                  <p className="text-white/80 text-sm mt-1">{cat.count}</p>
                </div>
                <div className="p-5">
                  <p className="text-muted-foreground text-sm mb-4">{cat.desc}</p>
                  <ul className="space-y-2">
                    {cat.games.map((game, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {game}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Nasil Calisir</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
              3 Basit Adimda Baslayin
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Hesap Olusturun",
                desc: "Ogretmen veya ogrenci olarak kaydolun. Ogrenme guclugu profilini belirleyin.",
                icon: Users
              },
              {
                step: "02",
                title: "Oyunlari Oynatin",
                desc: "Ogrenciye uygun oyunlari secin veya sistemin otomatik onerdigi oyunlari oynatin.",
                icon: Gamepad2
              },
              {
                step: "03",
                title: "Gelisimi Takip Edin",
                desc: "AI destekli raporlarla ogrencinin gelisimini izleyin ve kisisel oneriler alin.",
                icon: BarChart3
              }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-card rounded-2xl p-8 border border-border h-full">
                  <span className="text-6xl font-black text-primary/10 absolute top-4 right-6">{item.step}</span>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-card rounded-3xl border border-border p-10 sm:p-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
                Rakamlarla EduPlay
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { value: "25+", label: "Egitici Oyun", icon: Gamepad2 },
                { value: "4", label: "Ogrenme Guclugu", icon: Heart },
                { value: "28", label: "Basari Rozeti", icon: Star },
                { value: "AI", label: "Akilli Analiz", icon: Brain },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Kimler Icin</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
              Herkes Icin Bir Yer Var
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Ogrenciler",
                desc: "Eglenceli oyunlarla ogren, rozetler kazan, seviye atla. Her dogru cevap seni bir adim ileriye tasir.",
                features: ["Kisisel oyun onerileri", "Basari rozet sistemi", "Seviye atlama", "Alkis sesleri"],
                icon: GraduationCap,
                accent: "border-primary/30"
              },
              {
                title: "Ogretmenler",
                desc: "Ogrencilerinizin gelisimini yakindan takip edin. AI destekli analizlerle kisiye ozel oneriler alin.",
                features: ["Ogrenci takip paneli", "AI analiz raporu", "Gorev atama sistemi", "Detayli istatistikler"],
                icon: Users,
                accent: "border-emerald-500/30"
              },
              {
                title: "Aileler",
                desc: "Cocugunuzun ogrenme yolculugunu guvenle takip edin. Ilerleme raporlarini inceleyin.",
                features: ["Guvenli platform", "Ilerleme raporlari", "Reklamsiz ortam", "Kolay erisim"],
                icon: Heart,
                accent: "border-orange-500/30"
              }
            ].map((role, i) => (
              <div key={i} className={`bg-card rounded-2xl p-8 border ${role.accent} hover:shadow-lg transition-all duration-300`}>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <role.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{role.title}</h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{role.desc}</p>
                <ul className="space-y-3">
                  {role.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-primary rounded-3xl p-12 sm:p-16 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-white/5 blur-2xl" />
            </div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4 text-balance">
                Ogrenme Yolculuguna Baslayin
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto text-pretty">
                Her cocuk benzersizdir. EduPlay ile her ogrencinin kendi hizinda,
                kendi yontemleriyle ogrenme firsati yakalayin.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" variant="secondary" className="text-base px-8 h-12 rounded-xl gap-2">
                  <Link href="/login">
                    Hemen Basla
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">EduPlay</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Ozel egitim ogrencileri icin AI destekli ogrenme platformu
            </p>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Ozellikler</a>
              <a href="#games" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Oyunlar</a>
              <Link href="/login" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">Giris Yap</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
