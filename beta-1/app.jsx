const { useState } = React;

// ─── DATA ─────────────────────────────────────────────────────────────────────

const MY_ADVISOR = {
  name: "Marta Kowalczyk", role: "Doradca ubezpieczeniowy",
  phone: "+48 600 100 200", initials: "MK", available: true,
};

const ALL_ADVISORS = [
  { id: "a1", name: "Marta Kowalczyk",      role: "Doradca ubezpieczeniowy", phone: "+48 600 100 200", initials: "MK", available: true  },
  { id: "a2", name: "Tomasz Nowak",         role: "Doradca prawny",          phone: "+48 601 200 300", initials: "TN", available: true  },
  { id: "a3", name: "Agnieszka Wiśniewska", role: "Doradca finansowy",       phone: "+48 602 300 400", initials: "AW", available: false },
];

const PACKAGES = [
  {
    id: "entrepreneur", label: "Lekarz Przedsiębiorca", packagePrice: 349,
    desc: "Komplet do prowadzenia praktyki jako JDG.",
    items: [
      { id: "wg",      name: "Wirtualny Gabinet",  price: 79,  desc: "Adres rejestrowy + korespondencja" },
      { id: "infakt",  name: "InFakt",             price: 99,  desc: "Faktury i uproszczona księgowość"  },
      { id: "autenti", name: "Autenti",            price: 29,  desc: "Kwalifikowany podpis elektroniczny"},
      { id: "legal",   name: "Doradztwo prawne",   price: 99,  desc: "Pakiet godzin prawnych co miesiąc" },
      { id: "oc",      name: "OC Lekarskie",       price: 120, desc: "Ubezpieczenie OC zawodowe"        },
      { id: "edm",     name: "E-gabinet EDM",      price: 0,   desc: "Dokumentacja medyczna online"     },
    ],
  },
  {
    id: "driver", label: "Lekarz Kierowca", packagePrice: 129,
    desc: "Dla lekarzy dojeżdżających samochodem służbowym.",
    items: [
      { id: "car_ins", name: "Ubezpieczenie auta", price: 89, desc: "OC + AC w wynegocjowanej stawce" },
      { id: "carwash", name: "Myjnia unlimited",   price: 29, desc: "Unlimited wash w sieci myjni"    },
      { id: "fuel",    name: "Zniżki na paliwo",   price: 0,  desc: "−12 gr/l na stacjach BP"        },
    ],
  },
  {
    id: "travel", label: "Lekarz w Podróży", packagePrice: 49,
    desc: "Roczna ochrona na wyjazdach służbowych i prywatnych.",
    items: [
      { id: "travel_ins", name: "Ubezpieczenie podróżne INTER", price: 49, desc: "Do 500 000 EUR kosztów leczenia" },
    ],
  },
];

const MY_SUBS = [
  { id: 1, name: "InFakt",            cat: "Księgowość",           price: 99,  status: "active", renewal: "15 mar 2026"  },
  { id: 2, name: "Wirtualny Gabinet", cat: "Adres rejestrowy",     price: 49,  status: "active", renewal: "1 kwi 2026"   },
  { id: 3, name: "OC Lekarskie PZU",  cat: "Ubezpieczenie OC",     price: 120, status: "active", renewal: "30 cze 2026"  },
  { id: 4, name: "Autenti",           cat: "Podpis elektroniczny", price: 29,  status: "trial",  renewal: "Próba — 3 dni"},
];

const PURCHASE_CATALOG = [
  {
    id: "devices", label: "Sprzęt i elektronika", color: "#EEF2FF",
    items: [
      { id: "iphone15", brand: "Apple",  model: "iPhone 15 Pro",      desc: "Smartfon · 256 GB · Tytan naturalny",     price: "5 299 zł", priceOld: "5 999 zł", priceNote: "Rata netto", emoji: "📱" },
      { id: "ipad",     brand: "Apple",  model: "iPad Pro M4",        desc: "Tablet · 11\" · idealny do gabinetu",     price: "4 799 zł", priceOld: "5 299 zł", priceNote: "Rata netto", emoji: "📲" },
      { id: "macbook",  brand: "Apple",  model: "MacBook Air M3",     desc: "Laptop · 15\" · 16 GB RAM",               price: "6 499 zł", priceOld: null,        priceNote: "Rata netto", emoji: "💻" },
      { id: "sony",     brand: "Sony",   model: "WH-1000XM5",        desc: "Słuchawki · ANC · na dyżury i do nauki",  price: "1 099 zł", priceOld: "1 499 zł", priceNote: null,         emoji: "🎧" },
      { id: "monitor",  brand: "Dell",   model: "UltraSharp U2724D", desc: "Monitor · 27\" · 4K IPS · USB-C",         price: "2 399 zł", priceOld: null,        priceNote: "Rata netto", emoji: "🖥️" },
    ],
  },
  {
    id: "cars", label: "Samochody", color: "#F0FDF4",
    items: [
      { id: "glc",      brand: "Mercedes-Benz", model: "GLC Coupe 220 d mHEV", desc: "SUV · diesel · wynajem długoterminowy",   price: "2 850 zł/mies.", priceOld: "3 120 zł/mies.", priceNote: "Rata netto", emoji: "🚗" },
      { id: "bmw3",     brand: "BMW",            model: "320i M Sport",          desc: "Sedan · benzyna · leasing 36 mies.",     price: "2 450 zł/mies.", priceOld: null,              priceNote: "Rata netto", emoji: "🏎️" },
      { id: "tesla3",   brand: "Tesla",          model: "Model 3 Long Range",   desc: "Elektryczny · 600 km zasięgu",           price: "2 100 zł/mies.", priceOld: "2 500 zł/mies.", priceNote: "Rata netto", emoji: "⚡" },
      { id: "vehis",    brand: "VEHIS",          model: "Wirtualny salon",       desc: "Konfiguruj i zamów online bez wychodzenia", price: "wycena online",   priceOld: null,              priceNote: null,         emoji: "🛒" },
      { id: "mooveno",  brand: "Mooveno",        model: "Elastyczny wynajem",    desc: "Od 1 miesiąca · różne marki",             price: "od 1 800 zł/mies.", priceOld: null,           priceNote: "Rata netto", emoji: "🔑" },
    ],
  },
];

const MY_PURCHASES = [
  { id: "p1", name: "MacBook Air M3",   cat: "Elektronika", date: "12 sty 2026", price: "6 499 zł", status: "delivered" },
];

const DISCOUNTS = [
  { id: "d1", name: "Cinema City",      discount: "2 bilety/mies.", code: "MEDYK-CC-0224", monthly: true  },
  { id: "d2", name: "Stacja BP",        discount: "−12 gr/l",       code: "BP-MEDYK",      monthly: false },
  { id: "d3", name: "Belvedere Clinic", discount: "−20%",           code: "KLUB20",        monthly: false },
  { id: "d4", name: "WeSub",            discount: "do −50%",        code: "WESUB-KM",      monthly: false },
  { id: "d5", name: "The Collagen Co.", discount: "−100 zł",        code: "COLL100",       monthly: false },
  { id: "d6", name: "Empik Premium",    discount: "−30%",           code: "EMPIK-KM",      monthly: false },
];

const ALERTS = [
  { id: "a1", level: "warn", text: "Próba Autenti kończy się za 3 dni. Zdecyduj czy kontynuować.",           cta: "Zdecyduj",  ctaNav: "packages"  },
  { id: "a2", level: "info", text: "OC Lekarskie odnawia się 30 cze 2026.",                                  cta: "Sprawdź",   ctaNav: "insurance" },
  { id: "a3", level: "warn", text: "Brak ubezpieczenia NNW — jako kontraktowy nie masz ochrony pracodawcy.", cta: "Uzupełnij", ctaNav: "insurance" },
];

const OFFERS = [
  { id: "o1", name: "InFakt",           reason: "Kontrakt B2B",      price: "od 49 zł/mies.",  discount: "−100 zł start" },
  { id: "o2", name: "NNW Lekarza",      reason: "Brak ochrony NNW",  price: "od 29 zł/mies.",  discount: "\u26A0 Pilne"       },
  { id: "o3", name: "Tax Legal Beauty", reason: "Rezydentura + JDG", price: "od 299 zł/mies.", discount: "−20%"           },
  { id: "o4", name: "Autenti",          reason: "Kilka kontraktów",  price: "od 29 zł/mies.",  discount: "3 mies. gratis" },
];

// Lucide-style SVG icons (18×18, stroke-based)
const ICONS = {
  overview: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  purchases: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  packages: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.84Z"/><path d="m2 12 8.58 3.91a2 2 0 0 0 1.66 0L20.76 12"/><path d="m2 17 8.58 3.91a2 2 0 0 0 1.66 0L20.76 17"/></svg>,
  discounts: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
  insurance: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>,
  investments: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  profile: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>,
};

const NAV_SECTIONS = [
  {
    items: [
      { id: "overview",    label: "Panel główny", icon: "overview"  },
      { id: "purchases",   label: "Zakupy",       icon: "purchases" },
      { id: "packages",    label: "Usługi",       icon: "packages"  },
      { id: "discounts",   label: "Zniżki",       icon: "discounts" },
    ],
  },
  {
    header: "Finanse",
    items: [
      { id: "insurance",   label: "Ubezpieczenia", icon: "insurance"               },
      { id: "investments", label: "Inwestycje",    icon: "investments", soon: true  },
    ],
  },
  {
    header: "Konto",
    items: [
      { id: "profile", label: "Mój profil", icon: "profile", badge: 2 },
    ],
  },
];

const INSURANCE_PRODUCTS = [
  { id: "oc",     name: "OC Lekarskie",          priority: 1, owned: true,  provider: "PZU",   showPrices: true,  priceFrom: 69,  renewal: "30 cze 2026", desc: "Odpowiedzialność cywilna za błędy w sztuce lekarskiej. Wymagane prawnie." },
  { id: "income", name: "Utrata dochodu",         priority: 1, owned: false, provider: null,    showPrices: false, priceEst: "~80–350 zł/mies.", desc: "Ochrona przychodu przy chorobie lub wypadku. Stawka indywidualna — doradca wyśle kwestionariusz." },
  { id: "travel", name: "Ubezpieczenie podróżne", priority: 2, owned: false, provider: "INTER", showPrices: true,  priceFrom: 19,  desc: "Roczna polisa — podróże prywatne i konferencje medyczne. Dostępne w pakiecie z OC." },
  { id: "life",   name: "Na życie",               priority: 0, owned: false, provider: null,    showPrices: false, priceEst: "~60–400 zł/mies.", desc: "Ochrona rodziny na wypadek śmierci lub niezdolności do pracy." },
  { id: "other",  name: "Inne",                   priority: 0, owned: false, provider: null,    showPrices: false, desc: "NNW, mieszkanie, auto, OC prywatne — pełna lista wkrótce." },
];

const OB_ROLES = [
  { id: "student",    label: "Student medycyny",   sub: "IV–VI rok" },
  { id: "intern",     label: "Lekarz stażu",        sub: "Po studiach, przed specjalizacją" },
  { id: "resident",   label: "Rezydent",            sub: "W trakcie specjalizacji" },
  { id: "specialist", label: "Specjalista",         sub: "Tytuł specjalisty" },
  { id: "senior",     label: "Senior / KOL",        sub: "Doświadczony specjalista" },
];

const OB_WORK = [
  { id: "nfz",      label: "Etat NFZ / szpital"    },
  { id: "private",  label: "Własna praktyka / JDG" },
  { id: "contract", label: "Kontrakty B2B"          },
  { id: "mixed",    label: "Mix: etat + kontrakt"   },
];

const OB_INTERESTS = [
  { id: "accounting", label: "Księgowość i podatki", icon: "📊" },
  { id: "insurance",  label: "Ubezpieczenia",         icon: "🛡" },
  { id: "legal",      label: "Pomoc prawna",           icon: "⚖️" },
  { id: "car",        label: "Samochód / leasing",    icon: "🚗" },
  { id: "tech",       label: "Oprogramowanie EDM",    icon: "💻" },
  { id: "lifestyle",  label: "Lifestyle i zdrowie",   icon: "🧘" },
];

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function Pill({ children, variant = "default" }) {
  return <span className={`pill pill--${variant}`}>{children}</span>;
}

function StatusPill({ status }) {
  if (status === "trial")     return <Pill variant="warn">Próba</Pill>;
  if (status === "delivered") return <Pill variant="green">Dostarczone</Pill>;
  return                             <Pill variant="green">Aktywna</Pill>;
}

function Btn({ children, variant = "primary", onClick, className = "", disabled = false, style }) {
  return (
    <button
      className={`btn btn--${variant}${disabled ? " btn--disabled" : ""}${className ? " " + className : ""}`}
      onClick={disabled ? undefined : onClick}
      style={style}
    >
      {children}
    </button>
  );
}

function SectionHeader({ title, action, onAction }) {
  return (
    <div className="section-header">
      <span className="section-header__title">{title}</span>
      {action && (
        <button className="section-header__action" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
// Shortened: 4 screens (intro → dane+PWZ → rola+praca → done)

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", pwz: "",
    role: null, work: [],
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleWork = (v) => setForm(f => ({
    ...f, work: f.work.includes(v) ? f.work.filter(x => x !== v) : [...f.work, v],
  }));

  const pwzValid = /^\d{7}$/.test(form.pwz.trim());
  const canNext =
    step === 1 ? form.firstName.trim() && form.email.trim() && pwzValid :
    step === 2 ? !!form.role : true;

  const TOTAL_STEPS = 2;
  const progress = step >= 1 && step <= 2 ? step / TOTAL_STEPS : 0;

  return (
    <div className="onboarding">
      <div className="onboarding__inner">

        {/* Logo */}
        <div className="onboarding__logo">
          <img src="../brand assets/Logo.png" alt="Klub Medyka" />
        </div>

        {/* Progress bar — visible in steps 1–2 */}
        {step >= 1 && step <= 2 && (
          <React.Fragment>
            <div className="onboarding__step-label">Krok {step} z {TOTAL_STEPS}</div>
            <div className="onboarding__progress">
              <div className="onboarding__progress-bar" style={{ width: `${progress * 100}%` }} />
            </div>
          </React.Fragment>
        )}

        {/* ── STEP 0: Intro ── */}
        {step === 0 && (
          <div>
            <h1 className="onboarding__title onboarding__title--lg">
              Witaj w<br/>Klub Medyka.
            </h1>
            <p className="onboarding__subtitle">
              Platforma benefitów dla lekarzy — ubezpieczenia, narzędzia do JDG, leasing, zniżki i doradcy dostępni bezpośrednio.
            </p>
            <div className="onboarding__benefits">
              {[
                "Doradca przypisany do Ciebie od razu",
                "Ubezpieczenia OC, NNW, podróżne i życiowe",
                "Narzędzia do działalności — InFakt, Autenti i więcej",
                "Samochody, elektronika, catering dietetyczny",
              ].map(t => (
                <div key={t} className="onboarding__benefit">
                  <div className="onboarding__benefit-check">✓</div>
                  {t}
                </div>
              ))}
            </div>
            <div className="onboarding__actions">
              <Btn variant="primary" onClick={() => setStep(1)} className="btn--full">Załóż konto</Btn>
              <Btn variant="outline" onClick={onComplete}>Mam już konto</Btn>
            </div>
          </div>
        )}

        {/* ── STEP 1: Dane + PWZ ── */}
        {step === 1 && (
          <div>
            <h1 className="onboarding__title">Twoje dane</h1>
            <div className="onboarding__form">
              <div className="onboarding__form-row">
                <div>
                  <div className="onboarding__field-label">Imię *</div>
                  <input className="input" value={form.firstName} onChange={e => set("firstName", e.target.value)}
                    placeholder="Anna" type="text" />
                </div>
                <div>
                  <div className="onboarding__field-label">Nazwisko</div>
                  <input className="input" value={form.lastName} onChange={e => set("lastName", e.target.value)}
                    placeholder="Kowalska" type="text" />
                </div>
              </div>
              <div>
                <div className="onboarding__field-label">E-mail *</div>
                <input className="input" value={form.email} onChange={e => set("email", e.target.value)}
                  placeholder="anna@szpital.pl" type="email" />
              </div>
              <div>
                <div className="onboarding__field-label">Telefon <span>(opcjonalnie)</span></div>
                <input className="input" value={form.phone} onChange={e => set("phone", e.target.value)}
                  placeholder="+48 600 000 000" type="tel" />
              </div>
              <div>
                <div className="onboarding__field-label">Numer PWZ *</div>
                <input className="input" value={form.pwz} onChange={e => set("pwz", e.target.value.replace(/\D/g, "").slice(0, 7))}
                  placeholder="1234567" type="text" inputMode="numeric" maxLength={7} />
                <div className="text-xs text-muted mt-2" style={{ lineHeight: 1.5 }}>
                  7-cyfrowy numer prawa wykonywania zawodu lekarza
                </div>
              </div>
              <p className="onboarding__legal">
                Kontynuując akceptujesz{" "}
                <a href="#">regulamin</a> i{" "}
                <a href="#">politykę prywatności</a>.
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 2: Kim jesteś + Jak pracujesz (combined) ── */}
        {step === 2 && (
          <div>
            <h1 className="onboarding__title">Kim jesteś?</h1>
            <p className="onboarding__subtitle">Dobierzemy doradcę i oferty do Twojego etapu kariery.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {OB_ROLES.map(r => {
                const sel = form.role === r.id;
                return (
                  <button key={r.id} onClick={() => set("role", r.id)}
                    className={`ob-option${sel ? " ob-option--selected" : ""}`}>
                    <span className="ob-option__label">{r.label}</span>
                    <span className="ob-option__sub">{r.sub}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 32 }}>
              <div className="onboarding__field-label" style={{ marginBottom: 12 }}>Jak pracujesz? <span>(opcjonalnie, można wybrać kilka)</span></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {OB_WORK.map(w => {
                  const sel = form.work.includes(w.id);
                  return (
                    <button key={w.id} onClick={() => toggleWork(w.id)}
                      className={`ob-check${sel ? " ob-check--selected" : ""}`}>
                      <div className="ob-check__box">
                        {sel && "✓"}
                      </div>
                      <span className="ob-check__label">{w.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Done ── */}
        {step === 3 && (
          <div>
            <div className="onboarding__check-icon">✓</div>
            <h1 className="onboarding__title">
              Konto gotowe,<br/>dr {form.firstName || "Kowalska"}.
            </h1>
            <p className="onboarding__subtitle">
              Przypisujemy Ci doradcę — odezwie się w ciągu 24 godzin. Możesz już przeglądać platformę.
            </p>
            <div className="advisor-card">
              <div className="advisor-card__avatar">MK</div>
              <div className="advisor-card__info">
                <div className="advisor-card__name">Marta Kowalczyk</div>
                <div className="advisor-card__role">Twój doradca ubezpieczeniowy</div>
              </div>
              <Pill variant="green">Dostępna</Pill>
            </div>
            <Btn variant="primary" onClick={onComplete} className="btn--full btn--lg">
              Przejdź do platformy →
            </Btn>
          </div>
        )}

        {/* Navigation buttons — steps 1–2 */}
        {step >= 1 && step <= 2 && (
          <div className="onboarding__nav">
            <button className="onboarding__back" onClick={() => setStep(s => s - 1)}>
              ← Wróć
            </button>
            <Btn variant="primary"
              disabled={!canNext}
              onClick={() => canNext && setStep(s => s + 1)}>
              {step === 2 ? "Zakończ" : "Dalej →"}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

function Sidebar({ active, setActive }) {
  const [calling, setCalling] = useState(false);

  return (
    <aside className="sidebar">
      {/* Logo + user */}
      <div className="sidebar__header">
        <div className="sidebar__logo" onClick={() => setActive("overview")} style={{ cursor: "pointer" }}>
          <img src="../brand assets/Logo.png" alt="Klub Medyka" />
        </div>
        <div className="sidebar__user-name">Dr Anna Kowalska</div>
        <div className="sidebar__user-role">Rezydent · Kardiologia</div>
      </div>

      {/* Nav */}
      <nav className="sidebar__nav">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className="sidebar__section">
            {section.header && (
              <div className="sidebar__section-label">{section.header}</div>
            )}
            {section.items.map(item => {
              const isActive = active === item.id;
              const cls = `sidebar__link${isActive ? " sidebar__link--active" : ""}${item.soon ? " sidebar__link--disabled" : ""}`;
              return (
                <button key={item.id} onClick={() => !item.soon && setActive(item.id)} className={cls}>
                  <span className="sidebar__link-left">
                    {item.icon && ICONS[item.icon]}
                    {item.label}
                  </span>
                  {item.badge && !isActive && (
                    <span className="sidebar__badge">{item.badge}</span>
                  )}
                  {item.soon && (
                    <span className="sidebar__soon">wkrótce</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Advisor widget */}
      <div className="sidebar__advisor">
        <div className="sidebar__advisor-label">Twój doradca</div>
        <div className="sidebar__advisor-row">
          <div className="sidebar__advisor-avatar">
            <div className="sidebar__advisor-avatar-circle">{MY_ADVISOR.initials}</div>
            <div className={`sidebar__advisor-status sidebar__advisor-status--${MY_ADVISOR.available ? "online" : "offline"}`} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar__advisor-name">{MY_ADVISOR.name}</div>
            <div className="sidebar__advisor-spec">Ubezpieczenia</div>
          </div>
        </div>
        <button
          onClick={() => setCalling(c => !c)}
          className={`sidebar__advisor-call${calling ? " sidebar__advisor-call--active" : ""}`}>
          {calling ? "📞 Dzwonię…" : `📞 ${MY_ADVISOR.phone}`}
        </button>
      </div>
    </aside>
  );
}

// ─── TOP BAR ──────────────────────────────────────────────────────────────────

function TopBar({ active, setActive }) {
  const label = NAV_SECTIONS.flatMap(s => s.items).find(i => i.id === active)?.label || "";
  return (
    <header className="topbar">
      <span className="topbar__title">{label}</span>
      <div className="topbar__actions">
        <button className="topbar__icon-btn" onClick={() => setActive("profile")}>
          🎁
          <span className="topbar__notification-dot" />
        </button>
        <button className="topbar__icon-btn">🔔</button>
        <div className="topbar__avatar" onClick={() => setActive("profile")}>AK</div>
      </div>
    </header>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────

function Overview({ setActive }) {
  const [ticketClaimed, setTicketClaimed] = useState(false);
  const [interests, setInterests] = useState([]);

  const toggleInterest = (id) => {
    setInterests(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div style={{ maxWidth: 800, display: "flex", flexDirection: "column", gap: 40 }}>

      {/* Greeting + cinema ticket */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
        <div>
          <div className="text-xs font-semibold text-muted" style={{ letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>LUTY 2026</div>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.15, margin: 0 }}>
            Dzień dobry,<br />dr Kowalska.
          </h1>
        </div>
        {/* Ticket */}
        <div className="ticket">
          <div className="ticket__top">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="ticket__label">Świadczenie miesiąca</div>
                <div className="ticket__name">2× bilet do kina</div>
                <div className="ticket__meta">Cinema City · 11 dni</div>
              </div>
              <span style={{ fontSize: 18 }}>🎬</span>
            </div>
          </div>
          <div className="ticket__tear">
            <div className="ticket__notch ticket__notch--left" />
            <div className="ticket__notch ticket__notch--right" />
          </div>
          <div className="ticket__bottom">
            {ticketClaimed ? (
              <span className="text-xs text-green font-mono">✓ MEDYK-CC-0224</span>
            ) : (
              <React.Fragment>
                <span className="font-semibold" style={{ fontSize: 13 }}>2 × 35 zł</span>
                <Btn variant="primary" onClick={() => setTicketClaimed(true)} className="btn--sm">Odbierz</Btn>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="card">
        {ALERTS.map(a => (
          <div key={a.id} className={`alert-row alert-row--${a.level}`}>
            <div className={`alert-dot alert-dot--${a.level}`} />
            <span className="alert-text">{a.text}</span>
            <button className={`alert-cta alert-cta--${a.level}`} onClick={() => setActive(a.ctaNav)}>
              {a.cta} →
            </button>
          </div>
        ))}
      </div>

      {/* Advisors */}
      <div>
        <SectionHeader title="Twoi doradcy" />
        <div className="advisor-grid">
          {ALL_ADVISORS.map(a => (
            <div key={a.id} className="advisor-tile">
              <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: a.available ? "var(--color-fg)" : "var(--color-secondary)",
                  border: a.available ? "none" : "1px solid var(--color-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700,
                  color: a.available ? "white" : "var(--color-muted)",
                  flexShrink: 0,
                }}>{a.initials}</div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: a.available ? "var(--color-fg)" : "var(--color-muted)", lineHeight: 1.35 }}>{a.name}</div>
                  <div className="text-xs text-muted">{a.role}</div>
                </div>
              </div>
              {a.available
                ? <a href={`tel:${a.phone}`} className="text-sm font-semibold text-accent" style={{ textDecoration: "none" }}>{a.phone}</a>
                : <span className="text-sm text-muted">Niedostępny teraz</span>
              }
            </div>
          ))}
        </div>
      </div>

      {/* Co Cię interesuje? — moved from onboarding */}
      <div>
        <SectionHeader title="Co Cię interesuje?" />
        <p className="text-sm text-muted mb-2">Zaznacz tematy, które Cię interesują — dopasujemy oferty.</p>
        <div className="interests">
          {OB_INTERESTS.map(n => (
            <button key={n.id}
              className={`interest-chip${interests.includes(n.id) ? " interest-chip--selected" : ""}`}
              onClick={() => toggleInterest(n.id)}>
              <span style={{ marginRight: 6 }}>{n.icon}</span> {n.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active services */}
      <div>
        <SectionHeader title="Aktywne usługi" action="Zarządzaj" onAction={() => setActive("packages")} />
        <div className="card">
          {MY_SUBS.map(s => (
            <div key={s.id} className="card__row" style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 16 }}>
              <div>
                <div className="font-semibold" style={{ fontSize: 13 }}>{s.name}</div>
                <div className="text-xs text-muted">{s.cat}</div>
              </div>
              <span className="font-semibold" style={{ fontSize: 13 }}>{s.price} zł/mies.</span>
              <StatusPill status={s.status} />
            </div>
          ))}
          <div className="card__footer">
            <span className="text-sm text-muted">Łącznie</span>
            <span className="font-bold" style={{ fontSize: 13 }}>297 zł/mies.</span>
          </div>
        </div>
      </div>

      {/* Offers */}
      <div>
        <SectionHeader title="Dopasowane dla Ciebie" action="Wszystkie usługi" onAction={() => setActive("packages")} />
        <div className="card">
          {OFFERS.map(o => (
            <div key={o.id} className="card__row">
              <div className="flex-1">
                <span className="font-semibold" style={{ fontSize: 13 }}>{o.name}</span>
                <span className="text-sm text-muted" style={{ marginLeft: 10 }}>{o.reason}</span>
              </div>
              <span className="text-sm text-muted" style={{ marginRight: 20 }}>{o.price}</span>
              <span className={`text-sm font-semibold ${o.discount.includes("\u26A0") ? "text-warn" : "text-accent"}`}>{o.discount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Discounts preview */}
      <div>
        <SectionHeader title="Twoje zniżki" action="Wszystkie" onAction={() => setActive("discounts")} />
        <div className="card">
          {DISCOUNTS.slice(0, 3).map(d => (
            <div key={d.id} className="card__row" style={{ justifyContent: "space-between" }}>
              <div className="flex items-center gap-2">
                <span className="font-semibold" style={{ fontSize: 13 }}>{d.name}</span>
                {d.monthly && <Pill variant="accent">co miesiąc</Pill>}
              </div>
              <div className="flex items-center" style={{ gap: 14 }}>
                <span className="font-semibold" style={{ fontSize: 13 }}>{d.discount}</span>
                <span className="font-mono text-xs text-muted" style={{
                  background: "var(--color-bg-subtle)", border: "1px dashed var(--color-border)",
                  padding: "3px 9px", borderRadius: 5,
                }}>{d.code}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PURCHASES VIEW ───────────────────────────────────────────────────────────

function PurchasesView() {
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("shop"); // "shop" or "orders"

  const FILTERS = [
    { id: "all", label: "Wszystko" },
    { id: "devices", label: "Elektronika" },
    { id: "cars", label: "Samochody" },
  ];

  const filteredCatalog = filter === "all"
    ? PURCHASE_CATALOG
    : PURCHASE_CATALOG.filter(cat => cat.id === filter);

  if (view === "orders") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Moje zamówienia</h2>
            <p className="text-sm text-muted">Historia Twoich zakupów.</p>
          </div>
          <button className="section-header__action" onClick={() => setView("shop")}>← Wróć do sklepu</button>
        </div>
        {MY_PURCHASES.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📦</div>
            <div className="empty-state__text">Brak zamówień</div>
          </div>
        ) : (
          <div className="card">
            <div className="table-header" style={{ gridTemplateColumns: "1fr 120px 120px 100px" }}>
              {["Produkt", "Kwota", "Data", "Status"].map(h => <span key={h}>{h}</span>)}
            </div>
            {MY_PURCHASES.map(p => (
              <div key={p.id} className="card__row" style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 100px" }}>
                <div>
                  <div className="font-semibold" style={{ fontSize: 13 }}>{p.name}</div>
                  <div className="text-xs text-muted">{p.cat}</div>
                </div>
                <span className="font-semibold" style={{ fontSize: 13 }}>{p.price}</span>
                <span className="text-sm text-muted">{p.date}</span>
                <StatusPill status={p.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Zakupy</h2>
          <p className="text-sm text-muted">Jednorazowe zakupy dla lekarzy — sprzęt, samochody. Bez subskrypcji.</p>
        </div>
        <button className="section-header__action" onClick={() => setView("orders")}>Moje zamówienia →</button>
      </div>

      {/* Filter pills */}
      <div className="filter-bar">
        {FILTERS.map(f => (
          <button key={f.id}
            className={`filter-pill${filter === f.id ? " filter-pill--active" : ""}`}
            onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Product sections */}
      {filteredCatalog.map(cat => (
        <div key={cat.id} className="product-section">
          <div className="product-section__head">
            <h3 className="font-bold" style={{ fontSize: 16 }}>{cat.label}</h3>
            <button className="section-header__action">Zobacz wszystko →</button>
          </div>
          <div className="product-grid">
            {cat.items.map(item => (
              <div key={item.id} className="product-card">
                <div className="product-card__image" style={{ background: cat.color }}>
                  <span>{item.emoji}</span>
                </div>
                <div className="product-card__body">
                  <div className="product-card__brand">{item.brand} · {item.model}</div>
                  <div className="product-card__desc">{item.desc}</div>
                  <div className="product-card__prices">
                    <span className="product-card__price">{item.price}</span>
                    {item.priceOld && <span className="product-card__price-old">{item.priceOld}</span>}
                  </div>
                  {item.priceNote && <div className="product-card__note">{item.priceNote}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SERVICES VIEW ────────────────────────────────────────────────────────────

function ServicesView() {
  const [selected, setSelected]   = useState({});
  const [purchased, setPurchased] = useState({});

  const toggleItem = (pkgId, itemId) => {
    setSelected(s => {
      const cur = new Set(s[pkgId] || []);
      cur.has(itemId) ? cur.delete(itemId) : cur.add(itemId);
      return { ...s, [pkgId]: cur };
    });
  };

  const getSelected   = (pkg) => pkg.items.filter(i => (selected[pkg.id] || new Set()).has(i.id));
  const selTotal      = (pkg) => getSelected(pkg).reduce((s, i) => s + i.price, 0);
  const selCount      = (pkg) => getSelected(pkg).length;
  const saving        = (pkg) => selTotal(pkg) - pkg.packagePrice;
  const allItemsTotal = (pkg) => pkg.items.reduce((s, i) => s + i.price, 0);

  const buyPackage = (pkgId) => {
    setPurchased(p => ({ ...p, [pkgId]: true }));
    setSelected(s => ({ ...s, [pkgId]: new Set() }));
  };

  return (
    <div style={{ maxWidth: 800, display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Usługi</h2>
        <p className="text-sm text-muted">Zaznacz co chcesz kupić lub weź cały pakiet — pakiet zawsze wychodzi taniej.</p>
      </div>

      {PACKAGES.map(pkg => {
        const isPurchased  = !!purchased[pkg.id];
        const hasSelection = selCount(pkg) > 0;
        const total        = selTotal(pkg);
        const save         = saving(pkg);
        const nudge        = hasSelection && save > 0 && !isPurchased;
        const allTotal     = allItemsTotal(pkg);

        return (
          <div key={pkg.id} className="card" style={{
            borderColor: nudge ? "var(--color-warn-border)" : undefined,
            transition: "border-color 0.2s",
          }}>
            {/* Package header */}
            <div className="card__row" style={{
              padding: "20px 22px",
              display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20,
              background: isPurchased ? "var(--color-green-bg)" : undefined,
            }}>
              <div className="flex-1">
                <div className="font-semibold" style={{ fontSize: 15, marginBottom: 5 }}>{pkg.label}</div>
                <p className="text-sm text-muted" style={{ margin: 0 }}>{pkg.desc}</p>
              </div>
              <div className="flex items-center" style={{ gap: 14, flexShrink: 0 }}>
                {allTotal > pkg.packagePrice && (
                  <div style={{ textAlign: "right" }}>
                    <div className="text-xs text-muted line-through">{allTotal} zł osobno</div>
                    <div className="text-xs text-green font-semibold">oszczędzasz {allTotal - pkg.packagePrice} zł/mies.</div>
                  </div>
                )}
                <div style={{ textAlign: "right" }}>
                  <div className="text-xs text-muted">Pakiet</div>
                  <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.03em" }}>
                    {pkg.packagePrice} zł
                    <span className="text-sm text-muted" style={{ fontWeight: 400 }}>/mies.</span>
                  </div>
                </div>
                {isPurchased ? (
                  <Pill variant="green">✓ Kupiony</Pill>
                ) : (
                  <Btn variant="primary" onClick={() => buyPackage(pkg.id)}>Kup pakiet</Btn>
                )}
              </div>
            </div>

            {/* Per-item checkboxes */}
            {pkg.items.map(item => {
              const sel = isPurchased || (selected[pkg.id] || new Set()).has(item.id);
              const cls = `check-item${sel && !isPurchased ? " check-item--selected" : ""}${isPurchased ? " check-item--purchased" : ""}`;
              const boxCls = `check-item__box${isPurchased ? " check-item__box--purchased" : sel ? " check-item__box--selected" : ""}`;
              return (
                <div key={item.id} onClick={() => !isPurchased && toggleItem(pkg.id, item.id)} className={cls}>
                  <div className={boxCls}>
                    {(sel || isPurchased) && "✓"}
                  </div>
                  <div className="flex-1">
                    <span style={{ fontSize: 13, fontWeight: sel ? 600 : 400 }}>{item.name}</span>
                    <span className="text-sm text-muted" style={{ marginLeft: 10 }}>{item.desc}</span>
                  </div>
                  <span className="nowrap" style={{ fontSize: 13, fontWeight: 500, color: item.price > 0 ? "var(--color-fg)" : "var(--color-muted)" }}>
                    {item.price > 0 ? `${item.price} zł/mies.` : "gratis"}
                  </span>
                </div>
              );
            })}

            {/* Nudge bar */}
            {hasSelection && !isPurchased && (
              <div className={`nudge-bar${nudge ? " nudge-bar--active" : ""}`}>
                <div style={{ fontSize: 13 }}>
                  {selCount(pkg)} {selCount(pkg) === 1 ? "usługa" : "usługi"} osobno:{" "}
                  <strong>{total} zł/mies.</strong>
                  {nudge && (
                    <span className="text-warn" style={{ marginLeft: 8 }}>
                      Pakiet za {pkg.packagePrice} zł oszczędza Ci <strong>{save} zł miesięcznie</strong>.
                    </span>
                  )}
                  {!nudge && total > 0 && (
                    <span className="text-muted" style={{ marginLeft: 8 }}>Pakiet: {pkg.packagePrice} zł/mies.</span>
                  )}
                </div>
                <div className="flex" style={{ gap: 8, flexShrink: 0 }}>
                  <Btn variant="outline" className="btn--sm">Kup wybrane</Btn>
                  {nudge && (
                    <Btn variant="accent" onClick={() => buyPackage(pkg.id)} className="btn--sm">
                      Weź pakiet — oszczędzasz {save} zł →
                    </Btn>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── DISCOUNTS VIEW ───────────────────────────────────────────────────────────

function DiscountsView() {
  const [copied, setCopied] = useState(null);

  return (
    <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Zniżki</h2>
        <p className="text-sm text-muted">Kody i rabaty dla członków Klub Medyka — do użycia natychmiast.</p>
      </div>
      <div className="card">
        <div className="table-header" style={{ gridTemplateColumns: "1fr 140px 200px" }}>
          {["Partner", "Zniżka", "Kod"].map(h => <span key={h}>{h}</span>)}
        </div>
        {DISCOUNTS.map(d => (
          <div key={d.id} className="card__row" style={{ display: "grid", gridTemplateColumns: "1fr 140px 200px" }}>
            <div className="flex items-center gap-2">
              <span className="font-semibold" style={{ fontSize: 13 }}>{d.name}</span>
              {d.monthly && <Pill variant="accent">co miesiąc</Pill>}
            </div>
            <span className="font-semibold" style={{ fontSize: 13 }}>{d.discount}</span>
            <div className="flex items-center" style={{ gap: 10 }}>
              <span className="font-mono text-sm text-muted" style={{
                background: "var(--color-bg-subtle)", border: "1px dashed var(--color-border)",
                padding: "4px 10px", borderRadius: 6,
              }}>{d.code}</span>
              <button onClick={() => { setCopied(d.id); setTimeout(() => setCopied(null), 2000); }}
                className="section-header__action" style={{ fontSize: 12, fontWeight: 600, color: copied === d.id ? "var(--color-green)" : undefined }}>
                {copied === d.id ? "✓ Skopiowano" : "Kopiuj"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── INSURANCE VIEW ───────────────────────────────────────────────────────────

function InsuranceView() {
  const [expanded, setExpanded] = useState(null);
  const [uploaded, setUploaded] = useState({});
  const toggle = id => setExpanded(p => p === id ? null : id);

  return (
    <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Ubezpieczenia</h2>
        <p className="text-sm text-muted">Wybierz → podaj parametry → dołącz polisę → odbierz ofertę od doradcy.</p>
      </div>
      <div className="card">
        {INSURANCE_PRODUCTS.map(ins => {
          const isOpen = expanded === ins.id;
          return (
            <div key={ins.id} className="accordion-item">
              <button onClick={() => toggle(ins.id)}
                className={`accordion-trigger${isOpen ? " accordion-trigger--open" : ""}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2" style={{ flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{ins.name}</span>
                    {ins.priority === 1 && <Pill variant="red">Priorytet #1</Pill>}
                    {ins.priority === 2 && <Pill variant="warn">Priorytet #2</Pill>}
                    {ins.owned && <Pill variant="green">Masz</Pill>}
                  </div>
                  <div className="text-sm text-muted" style={{ marginTop: 3 }}>
                    {ins.provider || "Dostawca do ustalenia"}
                    {ins.owned && ` · Odnowienie: ${ins.renewal}`}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {ins.showPrices
                    ? <span style={{ fontSize: 14, fontWeight: 700 }}>od {ins.priceFrom} zł<span className="text-xs text-muted" style={{ fontWeight: 400 }}>/mies.</span></span>
                    : <span className="text-sm text-muted" style={{ fontStyle: "italic" }}>{ins.priceEst || "wycena"}</span>
                  }
                </div>
                <span className={`accordion-chevron${isOpen ? " accordion-chevron--open" : ""}`}>⌄</span>
              </button>
              {isOpen && (
                <div className="accordion-panel">
                  <p className="text-muted" style={{ fontSize: 13, lineHeight: 1.75, margin: "16px 0" }}>{ins.desc}</p>
                  <div className="flex items-center" style={{
                    justifyContent: "space-between", padding: "12px 16px",
                    borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)",
                    background: "var(--color-bg)", marginBottom: 14,
                  }}>
                    <span className="text-sm text-muted">Dołącz obecną polisę (PDF lub zdjęcie)</span>
                    {uploaded[ins.id]
                      ? <span className="text-sm font-semibold text-green">✓ Przesłano</span>
                      : <button className="section-header__action" style={{ fontSize: 12, fontWeight: 600 }}
                          onClick={() => setUploaded(u => ({ ...u, [ins.id]: true }))}>Załącz →</button>
                    }
                  </div>
                  <div className="flex" style={{ gap: 8 }}>
                    <Btn variant="primary" style={{ flex: 1 }}>{ins.owned ? "Zmień polisę" : "Poproś o ofertę"}</Btn>
                    <Btn variant="outline">Porównaj</Btn>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── INVESTMENTS ──────────────────────────────────────────────────────────────

function InvestmentsView() {
  return (
    <div style={{ maxWidth: 520 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Inwestycje</h2>
      <p className="text-sm text-muted" style={{ marginBottom: 32 }}>Produkty inwestycyjne dla lekarzy — wkrótce.</p>
      <div className="coming-soon">
        <p className="text-muted" style={{ fontSize: 13, lineHeight: 1.75, maxWidth: 340, margin: "0 auto 24px" }}>
          Przygotowujemy ofertę funduszy, obligacji i kont oszczędnościowych dopasowanych do lekarzy.
        </p>
        <Btn variant="outline">Powiadom mnie →</Btn>
      </div>
    </div>
  );
}

// ─── PROFILE VIEW ─────────────────────────────────────────────────────────────

function ProfileView() {
  const [claimedIds, setClaimedIds] = useState({});
  const [copiedId,   setCopiedId]   = useState(null);

  const perks = [
    { id: "cinema",  title: "2× bilet do kina",  brand: "Cinema City", value: "2 × 35 zł", code: "MEDYK-CC-0224", expires: "11 dni" },
    { id: "massage", title: "Voucher na masaż",   brand: "Zdrovit Spa", value: "120 zł",     code: "KLUB-SPA-0224", expires: "11 dni" },
  ];

  return (
    <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 32 }}>
      <div className="flex items-center gap-4">
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: "var(--color-fg)", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 700, color: "white",
        }}>AK</div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Dr Anna Kowalska</h2>
          <p className="text-sm text-muted" style={{ margin: "3px 0 0" }}>Rezydent · Kardiologia · Warszawa</p>
        </div>
      </div>

      <div>
        <SectionHeader title="Świadczenia — Luty 2026" />
        <div className="card">
          {perks.map(p => (
            <div key={p.id} style={{ borderBottom: "1px solid var(--color-border)", opacity: claimedIds[p.id] ? 0.48 : 1 }}>
              <div style={{ padding: "16px 20px" }}>
                <div className="flex" style={{ justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div className="font-semibold" style={{ fontSize: 13 }}>{p.title}</div>
                    <div className="text-xs text-muted mt-2">{p.brand} · wygasa za {p.expires}</div>
                  </div>
                  <span className="font-bold" style={{ fontSize: 14 }}>{p.value}</span>
                </div>
                <div className="ticket__tear" style={{ margin: 0, paddingTop: 12 }}>
                  <div className="ticket__notch ticket__notch--left" style={{ left: -26 }} />
                  <div className="ticket__notch ticket__notch--right" style={{ right: -26 }} />
                  <div className="flex items-center" style={{ justifyContent: "space-between", paddingTop: 12 }}>
                    <span className="font-mono font-bold text-muted" style={{ fontSize: 12, letterSpacing: "0.05em" }}>{p.code}</span>
                    {claimedIds[p.id] ? (
                      <span className="text-sm font-semibold text-green">✓ Odebrano</span>
                    ) : (
                      <div className="flex" style={{ gap: 8 }}>
                        <button onClick={() => { setCopiedId(p.id); setTimeout(() => setCopiedId(null), 2000); }}
                          className="section-header__action" style={{ fontSize: 12, fontWeight: 600, color: copiedId === p.id ? "var(--color-green)" : undefined }}>
                          {copiedId === p.id ? "✓ Skopiowano" : "Kopiuj"}
                        </button>
                        <Btn variant="primary" onClick={() => setClaimedIds(c => ({ ...c, [p.id]: true }))} className="btn--sm">Odbierz</Btn>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-muted mt-2">Nowe świadczenia 1. dnia każdego miesiąca.</div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

const VIEWS = {
  overview:    Overview,
  purchases:   PurchasesView,
  packages:    ServicesView,
  discounts:   DiscountsView,
  insurance:   InsuranceView,
  investments: InvestmentsView,
  profile:     ProfileView,
};

function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [active,    setActive]    = useState("overview");

  if (!onboarded) return <Onboarding onComplete={() => setOnboarded(true)} />;

  const View = VIEWS[active] || Overview;

  return (
    <div className="app-layout">
      <Sidebar active={active} setActive={setActive} />
      <div className="main">
        <TopBar active={active} setActive={setActive} />
        <main className="main__content">
          <View setActive={setActive} />
        </main>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
