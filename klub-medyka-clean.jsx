import { useState } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg:       "#F8F7F5",
  surface:  "#FFFFFF",
  border:   "#ECEAE6",
  muted:    "#A09D98",
  label:    "#6B6965",
  body:     "#2D2B29",
  accent:   "#1A56DB",
  accentBg: "#EEF2FF",
  warn:     "#B45309",
  warnBg:   "#FFFBEB",
  green:    "#059669",
  greenBg:  "#ECFDF5",
  red:      "#DC2626",
};

const T = {
  h1:    { fontSize: 28, fontWeight: 700, color: C.body, margin: 0, letterSpacing: "-0.04em", lineHeight: 1.15 },
  h2:    { fontSize: 20, fontWeight: 700, color: C.body, margin: 0, letterSpacing: "-0.03em" },
  h3:    { fontSize: 14, fontWeight: 600, color: C.body, margin: 0, letterSpacing: "-0.01em" },
  small: { fontSize: 12, color: C.muted, margin: 0 },
  label: { fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: "0.05em", textTransform: "uppercase" },
};

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

// Packages with per-item pricing
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

// One-time purchases catalog
const PURCHASE_CATALOG = [
  {
    id: "devices", label: "Sprzęt i elektronika",
    items: [
      { id: "iphone15", name: "iPhone 15 Pro",       price: "5 299 zł",       sub: "Apple · raty 0%",                    tag: "Raty 0%"   },
      { id: "ipad",     name: "iPad Pro M4",          price: "4 799 zł",       sub: "Apple · raty 0%",                    tag: "Raty 0%"   },
      { id: "macbook",  name: "MacBook Air M3",       price: "6 499 zł",       sub: "Apple · idealny do gabinetu",        tag: null        },
      { id: "sony",     name: "Słuchawki Sony XM5",   price: "1 099 zł",       sub: "Sony · na dyżury i do nauki",        tag: "Bestseller"},
    ],
  },
  {
    id: "cars", label: "Samochody",
    items: [
      { id: "alior",   name: "Leasing — Alior",       price: "od 1 800 zł/mies.", sub: "Alior Leasing · wynajem długoterminowy", tag: "Wynajem"   },
      { id: "vehis",   name: "VEHIS",                 price: "wycena online",      sub: "Wirtualny salon · zamów bez wychodzenia",tag: "Online"    },
      { id: "mooveno", name: "Mooveno",               price: "od 2 900 zł/mies.", sub: "Elastyczny wynajem od 1 miesiąca",       tag: "Elastyczny"},
    ],
  },
  {
    id: "diets", label: "Catering i diety",
    items: [
      { id: "maczfit", name: "Maczfit",         price: "od 79 zł/dzień",  sub: "Catering dietetyczny · −15% dla lekarzy", tag: "−15%"},
      { id: "dietly",  name: "Dietly",          price: "od 65 zł/dzień",  sub: "Konfigurowalny jadłospis",                tag: null  },
      { id: "szama",   name: "Szama z dostawą", price: "od 49 zł/dzień",  sub: "Lokalna kuchnia domowa · dostawa",         tag: null  },
    ],
  },
];

const MY_PURCHASES = [
  { id: "p1", name: "MacBook Air M3",   cat: "Elektronika", date: "12 sty 2026", price: "6 499 zł", status: "delivered" },
  { id: "p2", name: "Maczfit — 20 dni", cat: "Dieta",       date: "1 lut 2026",  price: "1 580 zł", status: "active"    },
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
  { id: "o2", name: "NNW Lekarza",      reason: "Brak ochrony NNW",  price: "od 29 zł/mies.",  discount: "⚠ Pilne"       },
  { id: "o3", name: "Tax Legal Beauty", reason: "Rezydentura + JDG", price: "od 299 zł/mies.", discount: "−20%"           },
  { id: "o4", name: "Autenti",          reason: "Kilka kontraktów",  price: "od 29 zł/mies.",  discount: "3 mies. gratis" },
];

const NAV_SECTIONS = [
  {
    items: [
      { id: "overview",    label: "Panel główny" },
      { id: "purchases",   label: "Zakupy"       },
      { id: "packages",    label: "Usługi"       },
      { id: "discounts",   label: "Zniżki"       },
    ],
  },
  {
    header: "Finanse",
    items: [
      { id: "insurance",   label: "Ubezpieczenia"               },
      { id: "investments", label: "Inwestycje",    soon: true    },
    ],
  },
  {
    header: "Konto",
    items: [
      { id: "profile", label: "Mój profil", badge: 2 },
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

// ─── SHARED ATOMS ─────────────────────────────────────────────────────────────

function SectionHeader({ title, action, onAction }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: C.body }}>{title}</span>
      {action && (
        <button onClick={onAction} style={{ fontSize: 12, color: C.accent, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          {action}
        </button>
      )}
    </div>
  );
}

function Pill({ children, variant = "default" }) {
  const styles = {
    default:  { color: C.muted,  background: C.bg,       border: `1px solid ${C.border}` },
    green:    { color: C.green,  background: C.greenBg,  border: "none" },
    warn:     { color: C.warn,   background: C.warnBg,   border: "none" },
    accent:   { color: C.accent, background: C.accentBg, border: "none" },
    red:      { color: C.red,    background: "#FEF2F2",   border: "none" },
  };
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap", ...styles[variant] }}>
      {children}
    </span>
  );
}

function StatusPill({ status }) {
  if (status === "trial")     return <Pill variant="warn">Próba</Pill>;
  if (status === "delivered") return <Pill variant="green">Dostarczone</Pill>;
  return                             <Pill variant="green">Aktywna</Pill>;
}

function Btn({ children, variant = "ghost", onClick, style = {} }) {
  const base = { fontSize: 13, fontWeight: 600, borderRadius: 8, padding: "10px 18px", cursor: "pointer", border: "none", fontFamily: "inherit", ...style };
  if (variant === "primary") return <button onClick={onClick} style={{ ...base, background: C.body,   color: "white"                                       }}>{children}</button>;
  if (variant === "accent")  return <button onClick={onClick} style={{ ...base, background: C.accent, color: "white"                                       }}>{children}</button>;
  if (variant === "warn")    return <button onClick={onClick} style={{ ...base, background: "none",   color: C.warn,   border: `1px solid ${C.warn}`       }}>{children}</button>;
  return                            <button onClick={onClick} style={{ ...base, background: "none",   color: C.label,  border: `1px solid ${C.border}`     }}>{children}</button>;
}

function TableHeader({ cols }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: cols, padding: "10px 20px", background: C.bg, borderBottom: `1px solid ${C.border}` }}>
      {/* empty — just for spacing */}
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────

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

const OB_NEEDS = [
  { id: "accounting", label: "Księgowość i podatki" },
  { id: "insurance",  label: "Ubezpieczenia"         },
  { id: "legal",      label: "Pomoc prawna"           },
  { id: "car",        label: "Samochód / leasing"    },
  { id: "tech",       label: "Oprogramowanie EDM"    },
  { id: "lifestyle",  label: "Lifestyle i zdrowie"   },
];

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0); // 0=intro, 1=basic, 2=role, 3=work, 4=needs, 5=done
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", role: null, work: [], needs: [] });

  const set = (k, v)   => setForm(f => ({ ...f, [k]: v }));
  const arr = (k, v)   => setForm(f => ({ ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v] }));

  const canNext =
    step === 1 ? form.firstName.trim() && form.email.trim() :
    step === 2 ? !!form.role : true;

  const TOTAL = 6;
  const progress = step / (TOTAL - 1);

  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: 9,
    border: `1px solid ${C.border}`, background: C.surface,
    fontSize: 14, color: C.body, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Helvetica Neue',sans-serif", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 460 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 44 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: C.body, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 14, color: "white", lineHeight: 1 }}>+</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.body, letterSpacing: "-0.02em" }}>Klub Medyka</span>
        </div>

        {/* Progress */}
        {step > 0 && step < TOTAL - 1 && (
          <div style={{ height: 2, background: C.border, borderRadius: 2, marginBottom: 40 }}>
            <div style={{ height: "100%", width: `${progress * 100}%`, background: C.body, borderRadius: 2, transition: "width 0.3s ease" }} />
          </div>
        )}

        {/* ── STEP 0: Intro ── */}
        {step === 0 && (
          <div>
            <h1 style={{ ...T.h1, fontSize: 32, marginBottom: 14 }}>Witaj w<br/>Klub Medyka.</h1>
            <p style={{ fontSize: 13, color: C.label, lineHeight: 1.75, marginBottom: 32, maxWidth: 380 }}>
              Platforma benefitów dla lekarzy — ubezpieczenia, narzędzia do JDG, leasing, zniżki i doradcy dostępni bezpośrednio.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 36 }}>
              {[
                "Doradca przypisany do Ciebie od razu",
                "Ubezpieczenia OC, NNW, podróżne i życiowe",
                "Narzędzia do działalności — InFakt, Autenti i więcej",
                "Samochody, elektronika, catering dietetyczny",
              ].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: C.label }}>
                  <div style={{ width: 17, height: 17, borderRadius: "50%", background: C.greenBg, border: `1px solid #D1FAE5`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 9, color: C.green, fontWeight: 700 }}>✓</span>
                  </div>
                  {t}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="primary" onClick={() => setStep(1)} style={{ flex: 1, padding: "13px 18px", fontSize: 14 }}>Załóż konto</Btn>
              <Btn variant="ghost" onClick={onComplete} style={{ padding: "13px 18px" }}>Mam już konto</Btn>
            </div>
          </div>
        )}

        {/* ── STEP 1: Basic info ── */}
        {step === 1 && (
          <div>
            <div style={{ ...T.label, marginBottom: 8 }}>Krok 1 z 4</div>
            <h1 style={{ ...T.h1, fontSize: 26, marginBottom: 28 }}>Twoje dane</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { k: "firstName", label: "Imię",     placeholder: "Anna",     type: "text"  },
                  { k: "lastName",  label: "Nazwisko", placeholder: "Kowalska", type: "text"  },
                ].map(f => (
                  <div key={f.k}>
                    <div style={{ ...T.label, marginBottom: 6 }}>{f.label}</div>
                    <input value={form[f.k]} onChange={e => set(f.k, e.target.value)}
                      placeholder={f.placeholder} type={f.type} style={inputStyle} />
                  </div>
                ))}
              </div>
              <div>
                <div style={{ ...T.label, marginBottom: 6 }}>E-mail</div>
                <input value={form.email} onChange={e => set("email", e.target.value)}
                  placeholder="anna@szpital.pl" type="email" style={inputStyle} />
              </div>
              <div>
                <div style={{ ...T.label, marginBottom: 6 }}>Telefon <span style={{ color: C.muted, textTransform: "none", letterSpacing: 0 }}>(opcjonalnie)</span></div>
                <input value={form.phone} onChange={e => set("phone", e.target.value)}
                  placeholder="+48 600 000 000" type="tel" style={inputStyle} />
              </div>
              <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.6, marginTop: 2 }}>
                Kontynuując akceptujesz{" "}
                <span style={{ color: C.accent, cursor: "pointer" }}>regulamin</span> i{" "}
                <span style={{ color: C.accent, cursor: "pointer" }}>politykę prywatności</span>.
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 2: Role ── */}
        {step === 2 && (
          <div>
            <div style={{ ...T.label, marginBottom: 8 }}>Krok 2 z 4</div>
            <h1 style={{ ...T.h1, fontSize: 26, marginBottom: 8 }}>Kim jesteś?</h1>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Dobierzemy doradcę i oferty do Twojego etapu kariery.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {OB_ROLES.map(r => {
                const sel = form.role === r.id;
                return (
                  <button key={r.id} onClick={() => set("role", r.id)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 10, border: `1.5px solid ${sel ? C.body : C.border}`, background: sel ? C.body : C.surface, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                    <span style={{ fontSize: 14, fontWeight: sel ? 600 : 400, color: sel ? "white" : C.body }}>{r.label}</span>
                    <span style={{ fontSize: 12, color: sel ? "rgba(255,255,255,0.55)" : C.muted }}>{r.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 3: Work type ── */}
        {step === 3 && (
          <div>
            <div style={{ ...T.label, marginBottom: 8 }}>Krok 3 z 4</div>
            <h1 style={{ ...T.h1, fontSize: 26, marginBottom: 8 }}>Jak pracujesz?</h1>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Możesz wybrać kilka opcji.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {OB_WORK.map(w => {
                const sel = form.work.includes(w.id);
                return (
                  <button key={w.id} onClick={() => arr("work", w.id)}
                    style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 16px", borderRadius: 10, border: `1.5px solid ${sel ? C.body : C.border}`, background: sel ? C.body : C.surface, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                    <div style={{ width: 17, height: 17, borderRadius: 4, border: `1.5px solid ${sel ? "white" : C.muted}`, background: sel ? "white" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {sel && <span style={{ fontSize: 10, color: C.body, fontWeight: 700 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: sel ? 600 : 400, color: sel ? "white" : C.body }}>{w.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 4: Needs ── */}
        {step === 4 && (
          <div>
            <div style={{ ...T.label, marginBottom: 8 }}>Krok 4 z 4</div>
            <h1 style={{ ...T.h1, fontSize: 26, marginBottom: 8 }}>Czego szukasz?</h1>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Zaczniemy od tego co dla Ciebie najważniejsze.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {OB_NEEDS.map(n => {
                const sel = form.needs.includes(n.id);
                return (
                  <button key={n.id} onClick={() => arr("needs", n.id)}
                    style={{ padding: "14px 16px", borderRadius: 10, border: `1.5px solid ${sel ? C.body : C.border}`, background: sel ? C.body : C.surface, cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}>
                    <span style={{ fontSize: 13, fontWeight: sel ? 600 : 400, color: sel ? "white" : C.body }}>{n.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 5: Done ── */}
        {step === 5 && (
          <div>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: C.greenBg, border: `1px solid #D1FAE5`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 24 }}>✓</div>
            <h1 style={{ ...T.h1, fontSize: 28, marginBottom: 12 }}>
              Konto gotowe,<br/>dr {form.firstName || "Kowalska"}.
            </h1>
            <p style={{ fontSize: 13, color: C.label, lineHeight: 1.75, marginBottom: 28 }}>
              Przypisujemy Ci doradcę — odezwie się w ciągu 24 godzin. Możesz już przeglądać platformę.
            </p>
            {/* Assigned advisor preview */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, marginBottom: 28 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.body, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white", flexShrink: 0 }}>MK</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.body }}>Marta Kowalczyk</div>
                <div style={{ fontSize: 12, color: C.muted }}>Twój doradca ubezpieczeniowy</div>
              </div>
              <Pill variant="green">Dostępna</Pill>
            </div>
            <Btn variant="primary" onClick={onComplete} style={{ width: "100%", padding: "13px 18px", fontSize: 14 }}>
              Przejdź do platformy →
            </Btn>
          </div>
        )}

        {/* Nav buttons */}
        {step > 0 && step < TOTAL - 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32 }}>
            <button onClick={() => setStep(s => s - 1)} style={{ fontSize: 13, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
              ← Wróć
            </button>
            <Btn variant="primary"
              onClick={() => canNext && setStep(s => s + 1)}
              style={{ opacity: canNext ? 1 : 0.38, cursor: canNext ? "pointer" : "default" }}>
              {step === TOTAL - 2 ? "Zakończ" : "Dalej →"}
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
    <aside style={{ width: 220, flexShrink: 0, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 }}>

      {/* Logo + user */}
      <div style={{ padding: "22px 20px 18px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: C.body, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 13, color: "white" }}>+</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.body, letterSpacing: "-0.02em" }}>Klub Medyka</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.body }}>Dr Anna Kowalska</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Rezydent · Kardiologia</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto" }}>
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} style={{ marginBottom: 18 }}>
            {section.header && (
              <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: "0.07em", textTransform: "uppercase", padding: "0 10px", marginBottom: 4 }}>
                {section.header}
              </div>
            )}
            {section.items.map(item => {
              const isActive = active === item.id;
              return (
                <button key={item.id} onClick={() => !item.soon && setActive(item.id)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "8px 10px", borderRadius: 7, background: isActive ? C.accentBg : "transparent", color: isActive ? C.accent : item.soon ? C.muted : C.label, border: "none", cursor: item.soon ? "default" : "pointer", fontSize: 13, fontWeight: isActive ? 600 : 400, textAlign: "left", fontFamily: "inherit" }}>
                  {item.label}
                  {item.badge && !isActive && (
                    <span style={{ width: 17, height: 17, borderRadius: "50%", background: "#FEF3C7", color: "#92400E", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{item.badge}</span>
                  )}
                  {item.soon && (
                    <span style={{ fontSize: 9, color: C.muted, background: C.bg, padding: "1px 7px", borderRadius: 10, border: `1px solid ${C.border}` }}>wkrótce</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Advisor widget — replaces monthly cost */}
      <div style={{ padding: "14px 16px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
          Twój doradca
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.body, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white" }}>
              {MY_ADVISOR.initials}
            </div>
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 9, height: 9, borderRadius: "50%", background: MY_ADVISOR.available ? C.green : C.muted, border: `1.5px solid ${C.surface}` }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.body, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{MY_ADVISOR.name}</div>
            <div style={{ fontSize: 10, color: C.muted }}>Ubezpieczenia</div>
          </div>
        </div>
        <button onClick={() => setCalling(c => !c)}
          style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: calling ? C.greenBg : C.bg, border: `1px solid ${calling ? "#D1FAE5" : C.border}`, color: calling ? C.green : C.body, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}>
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
    <header style={{ position: "sticky", top: 0, zIndex: 10, background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 36px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 13, color: C.muted }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={() => setActive("profile")} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <span style={{ fontSize: 15, color: C.muted }}>🎁</span>
          <span style={{ position: "absolute", top: 2, right: 2, width: 6, height: 6, borderRadius: "50%", background: C.warn, border: `1.5px solid ${C.surface}` }} />
        </button>
        <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <span style={{ fontSize: 15, color: C.muted }}>🔔</span>
        </button>
        <div onClick={() => setActive("profile")} style={{ width: 28, height: 28, borderRadius: "50%", background: C.body, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "white", cursor: "pointer" }}>AK</div>
      </div>
    </header>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────

function Overview({ setActive }) {
  const [ticketClaimed, setTicketClaimed] = useState(false);

  return (
    <div style={{ maxWidth: 800, display: "flex", flexDirection: "column", gap: 40 }}>

      {/* Greeting + cinema ticket */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
        <div>
          <div style={{ ...T.label, marginBottom: 8 }}>LUTY 2026</div>
          <h1 style={{ ...T.h1, fontSize: 30 }}>Dzień dobry,<br />dr Kowalska.</h1>
        </div>
        {/* Ticket */}
        <div style={{ width: 226, flexShrink: 0, borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ ...T.label, marginBottom: 5 }}>Świadczenie miesiąca</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.body }}>2× bilet do kina</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Cinema City · 11 dni</div>
              </div>
              <span style={{ fontSize: 18 }}>🎬</span>
            </div>
          </div>
          <div style={{ margin: "12px 16px", borderTop: "1.5px dashed #ECEAE6", position: "relative" }}>
            <div style={{ position: "absolute", left: -22, top: -7, width: 12, height: 12, borderRadius: "50%", background: C.bg }} />
            <div style={{ position: "absolute", right: -22, top: -7, width: 12, height: 12, borderRadius: "50%", background: C.bg }} />
          </div>
          <div style={{ padding: "0 16px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {ticketClaimed ? (
              <span style={{ fontSize: 11, color: C.green, fontFamily: "monospace" }}>✓ MEDYK-CC-0224</span>
            ) : (
              <>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.body }}>2 × 35 zł</span>
                <Btn variant="primary" onClick={() => setTicketClaimed(true)} style={{ padding: "6px 14px", fontSize: 12 }}>Odbierz</Btn>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div style={{ borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        {ALERTS.map((a, i) => (
          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 18px", background: a.level === "warn" ? C.warnBg : C.surface, borderBottom: i < ALERTS.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.level === "warn" ? C.warn : C.accent, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 13, color: C.body }}>{a.text}</span>
            <button onClick={() => setActive(a.ctaNav)} style={{ fontSize: 12, fontWeight: 600, color: a.level === "warn" ? C.warn : C.accent, background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap", padding: 0, fontFamily: "inherit" }}>
              {a.cta} →
            </button>
          </div>
        ))}
      </div>

      {/* Active services */}
      <div>
        <SectionHeader title="Aktywne usługi" action="Zarządzaj" onAction={() => setActive("packages")} />
        <div style={{ borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          {MY_SUBS.map((s, i) => (
            <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center", padding: "14px 18px", background: C.surface, borderBottom: i < MY_SUBS.length - 1 ? `1px solid ${C.border}` : "none", gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.body }}>{s.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{s.cat}</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.body }}>{s.price} zł/mies.</span>
              <StatusPill status={s.status} />
            </div>
          ))}
          <div style={{ padding: "11px 18px", background: C.bg, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: C.muted }}>Łącznie</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.body }}>297 zł/mies.</span>
          </div>
        </div>
      </div>

      {/* Advisors */}
      <div>
        <SectionHeader title="Twoi doradcy" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {ALL_ADVISORS.map(a => (
            <div key={a.id} style={{ borderRadius: 10, border: `1px solid ${C.border}`, padding: "14px 16px", background: C.surface }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: a.available ? C.body : C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: a.available ? "white" : C.muted, flexShrink: 0 }}>{a.initials}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: a.available ? C.body : C.muted, lineHeight: 1.35 }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{a.role}</div>
                </div>
              </div>
              {a.available
                ? <a href={`tel:${a.phone}`} style={{ fontSize: 12, fontWeight: 600, color: C.accent, textDecoration: "none" }}>{a.phone}</a>
                : <span style={{ fontSize: 12, color: C.muted }}>Niedostępny teraz</span>
              }
            </div>
          ))}
        </div>
      </div>

      {/* Offers */}
      <div>
        <SectionHeader title="Dopasowane dla Ciebie" action="Wszystkie usługi" onAction={() => setActive("packages")} />
        <div style={{ borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          {OFFERS.map((o, i) => (
            <div key={o.id} style={{ display: "flex", alignItems: "center", padding: "13px 18px", background: C.surface, borderBottom: i < OFFERS.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.body }}>{o.name}</span>
                <span style={{ fontSize: 12, color: C.muted, marginLeft: 10 }}>{o.reason}</span>
              </div>
              <span style={{ fontSize: 12, color: C.muted, marginRight: 20 }}>{o.price}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: o.discount.includes("⚠") ? C.warn : C.accent }}>{o.discount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Discounts preview */}
      <div>
        <SectionHeader title="Twoje zniżki" action="Wszystkie" onAction={() => setActive("discounts")} />
        <div style={{ borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          {DISCOUNTS.slice(0, 3).map((d, i) => (
            <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", background: C.surface, borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.body }}>{d.name}</span>
                {d.monthly && <Pill variant="accent">co miesiąc</Pill>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.body }}>{d.discount}</span>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: C.label, background: C.bg, border: `1px dashed ${C.border}`, padding: "3px 9px", borderRadius: 5 }}>{d.code}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PURCHASES VIEW ───────────────────────────────────────────────────────────
// One-time items only: devices, cars, diets

function PurchasesView() {
  const [tab, setTab] = useState("shop");

  return (
    <div style={{ maxWidth: 800, display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <h2 style={{ ...T.h2, marginBottom: 4 }}>Zakupy</h2>
        <p style={{ ...T.small }}>Jednorazowe zakupy dla lekarzy — sprzęt, samochody, catering. Bez subskrypcji.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
        {[{ id: "shop", label: "Katalog" }, { id: "mine", label: "Moje zakupy" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: "10px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? C.body : C.muted, borderBottom: `2px solid ${tab === t.id ? C.body : "transparent"}`, marginBottom: -1, fontFamily: "inherit" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "shop" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {PURCHASE_CATALOG.map(cat => (
            <div key={cat.id}>
              <div style={{ ...T.label, marginBottom: 12 }}>{cat.label}</div>
              <div style={{ borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
                {cat.items.map((item, i) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", padding: "15px 20px", background: C.surface, borderBottom: i < cat.items.length - 1 ? `1px solid ${C.border}` : "none", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: C.body }}>{item.name}</span>
                        {item.tag && <Pill variant="accent">{item.tag}</Pill>}
                      </div>
                      <div style={{ fontSize: 12, color: C.muted }}>{item.sub}</div>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.body, whiteSpace: "nowrap" }}>{item.price}</span>
                    <Btn variant="ghost" style={{ padding: "8px 14px", fontSize: 12, whiteSpace: "nowrap" }}>Sprawdź →</Btn>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "mine" && (
        <div>
          {MY_PURCHASES.length === 0 ? (
            <div style={{ textAlign: "center", padding: "56px 0", color: C.muted }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
              <div style={{ fontSize: 14 }}>Brak zakupów</div>
            </div>
          ) : (
            <div style={{ borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 100px", padding: "10px 20px", background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                {["Produkt", "Kwota", "Data", "Status"].map(h => <span key={h} style={{ ...T.label }}>{h}</span>)}
              </div>
              {MY_PURCHASES.map((p, i) => (
                <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 100px", alignItems: "center", padding: "15px 20px", background: C.surface, borderBottom: i < MY_PURCHASES.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.body }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{p.cat}</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.body }}>{p.price}</span>
                  <span style={{ fontSize: 12, color: C.muted }}>{p.date}</span>
                  <StatusPill status={p.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SERVICES VIEW ────────────────────────────────────────────────────────────
// Packages with per-item checkboxes + strong nudge toward full package

function ServicesView() {
  const [selected, setSelected]   = useState({}); // { [pkgId]: Set<itemId> }
  const [purchased, setPurchased] = useState({}); // { [pkgId]: bool }

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
        <h2 style={{ ...T.h2, marginBottom: 4 }}>Usługi</h2>
        <p style={{ ...T.small }}>Zaznacz co chcesz kupić lub weź cały pakiet — pakiet zawsze wychodzi taniej.</p>
      </div>

      {PACKAGES.map(pkg => {
        const isPurchased  = !!purchased[pkg.id];
        const hasSelection = selCount(pkg) > 0;
        const total        = selTotal(pkg);
        const save         = saving(pkg);
        const nudge        = hasSelection && save > 0 && !isPurchased;
        const allTotal     = allItemsTotal(pkg);

        return (
          <div key={pkg.id} style={{ borderRadius: 12, border: `1px solid ${nudge ? "#FDE68A" : C.border}`, overflow: "hidden", background: C.surface, transition: "border-color 0.2s" }}>

            {/* Package header */}
            <div style={{ padding: "20px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, background: isPurchased ? C.greenBg : C.surface }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ ...T.h3, fontSize: 15, marginBottom: 5 }}>{pkg.label}</h3>
                <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>{pkg.desc}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                {allTotal > pkg.packagePrice && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: C.muted, textDecoration: "line-through" }}>{allTotal} zł osobno</div>
                    <div style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>oszczędzasz {allTotal - pkg.packagePrice} zł/mies.</div>
                  </div>
                )}
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: C.muted }}>Pakiet</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.body, letterSpacing: "-0.03em" }}>
                    {pkg.packagePrice} zł
                    <span style={{ fontSize: 12, fontWeight: 400, color: C.muted }}>/mies.</span>
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
            {pkg.items.map((item, i) => {
              const sel = isPurchased || (selected[pkg.id] || new Set()).has(item.id);
              return (
                <div key={item.id}
                  onClick={() => !isPurchased && toggleItem(pkg.id, item.id)}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 22px", background: sel && !isPurchased ? C.accentBg : "transparent", borderBottom: i < pkg.items.length - 1 ? `1px solid ${C.border}` : "none", cursor: isPurchased ? "default" : "pointer" }}>
                  {/* Checkbox */}
                  <div style={{ width: 17, height: 17, borderRadius: 4, border: `1.5px solid ${isPurchased ? C.green : sel ? C.accent : C.border}`, background: isPurchased ? C.green : sel ? C.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {(sel || isPurchased) && <span style={{ fontSize: 10, color: "white", fontWeight: 700 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: sel ? 600 : 400, color: C.body }}>{item.name}</span>
                    <span style={{ fontSize: 12, color: C.muted, marginLeft: 10 }}>{item.desc}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: item.price > 0 ? C.body : C.muted, whiteSpace: "nowrap" }}>
                    {item.price > 0 ? `${item.price} zł/mies.` : "gratis"}
                  </span>
                </div>
              );
            })}

            {/* Nudge bar — only when items are selected and package saves money */}
            {hasSelection && !isPurchased && (
              <div style={{ padding: "14px 22px", background: nudge ? C.warnBg : C.bg, borderTop: `1px solid ${nudge ? "#FDE68A" : C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div style={{ fontSize: 13, color: C.body }}>
                  {selCount(pkg)} {selCount(pkg) === 1 ? "usługa" : "usługi"} osobno:{" "}
                  <strong>{total} zł/mies.</strong>
                  {nudge && (
                    <span style={{ color: C.warn, marginLeft: 8 }}>
                      Pakiet za {pkg.packagePrice} zł oszczędza Ci <strong>{save} zł miesięcznie</strong>.
                    </span>
                  )}
                  {!nudge && total > 0 && (
                    <span style={{ color: C.muted, marginLeft: 8 }}>Pakiet: {pkg.packagePrice} zł/mies.</span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <Btn variant="ghost" style={{ padding: "8px 14px", fontSize: 12 }}>Kup wybrane</Btn>
                  {nudge && (
                    <Btn variant="accent" onClick={() => buyPackage(pkg.id)} style={{ padding: "8px 18px", fontSize: 12 }}>
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
        <h2 style={{ ...T.h2, marginBottom: 4 }}>Zniżki</h2>
        <p style={{ ...T.small }}>Kody i rabaty dla członków Klub Medyka — do użycia natychmiast.</p>
      </div>
      <div style={{ borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", background: C.surface }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 200px", padding: "10px 20px", background: C.bg, borderBottom: `1px solid ${C.border}` }}>
          {["Partner", "Zniżka", "Kod"].map(h => <span key={h} style={{ ...T.label }}>{h}</span>)}
        </div>
        {DISCOUNTS.map((d, i) => (
          <div key={d.id} style={{ display: "grid", gridTemplateColumns: "1fr 140px 200px", alignItems: "center", padding: "14px 20px", borderBottom: i < DISCOUNTS.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.body }}>{d.name}</span>
              {d.monthly && <Pill variant="accent">co miesiąc</Pill>}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.body }}>{d.discount}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "monospace", fontSize: 12, color: C.label, background: C.bg, border: `1px dashed ${C.border}`, padding: "4px 10px", borderRadius: 6 }}>{d.code}</span>
              <button onClick={() => { setCopied(d.id); setTimeout(() => setCopied(null), 2000); }}
                style={{ fontSize: 12, fontWeight: 600, color: copied === d.id ? C.green : C.accent, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
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
        <h2 style={{ ...T.h2, marginBottom: 4 }}>Ubezpieczenia</h2>
        <p style={{ ...T.small }}>Wybierz → podaj parametry → dołącz polisę → odbierz ofertę od doradcy.</p>
      </div>
      <div style={{ borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", background: C.surface }}>
        {INSURANCE_PRODUCTS.map((ins, i) => {
          const isOpen = expanded === ins.id;
          return (
            <div key={ins.id} style={{ borderBottom: i < INSURANCE_PRODUCTS.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div onClick={() => toggle(ins.id)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", cursor: "pointer", background: isOpen ? C.bg : C.surface }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.body }}>{ins.name}</span>
                    {ins.priority === 1 && <Pill variant="red">Priorytet #1</Pill>}
                    {ins.priority === 2 && <Pill variant="warn">Priorytet #2</Pill>}
                    {ins.owned && <Pill variant="green">Masz</Pill>}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                    {ins.provider || "Dostawca do ustalenia"}
                    {ins.owned && ` · Odnowienie: ${ins.renewal}`}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {ins.showPrices
                    ? <span style={{ fontSize: 14, fontWeight: 700, color: C.body }}>od {ins.priceFrom} zł<span style={{ fontSize: 11, fontWeight: 400, color: C.muted }}>/mies.</span></span>
                    : <span style={{ fontSize: 12, color: C.muted, fontStyle: "italic" }}>{ins.priceEst || "wycena"}</span>
                  }
                </div>
                <span style={{ fontSize: 16, color: C.muted, transform: isOpen ? "rotate(180deg)" : "none", transition: "0.15s" }}>⌄</span>
              </div>
              {isOpen && (
                <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.border}`, background: C.bg }}>
                  <p style={{ fontSize: 13, color: C.label, lineHeight: 1.75, margin: "16px 0 16px" }}>{ins.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, marginBottom: 14 }}>
                    <span style={{ fontSize: 12, color: C.label }}>Dołącz obecną polisę (PDF lub zdjęcie)</span>
                    {uploaded[ins.id]
                      ? <span style={{ fontSize: 12, fontWeight: 600, color: C.green }}>✓ Przesłano</span>
                      : <button onClick={() => setUploaded(u => ({ ...u, [ins.id]: true }))} style={{ fontSize: 12, fontWeight: 600, color: C.accent, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Załącz →</button>
                    }
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn variant="primary" style={{ flex: 1, padding: "10px" }}>{ins.owned ? "Zmień polisę" : "Poproś o ofertę"}</Btn>
                    <Btn variant="ghost" style={{ padding: "10px 16px" }}>Porównaj</Btn>
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
      <h2 style={{ ...T.h2, marginBottom: 4 }}>Inwestycje</h2>
      <p style={{ ...T.small, marginBottom: 32 }}>Produkty inwestycyjne dla lekarzy — wkrótce.</p>
      <div style={{ borderRadius: 10, border: `1.5px dashed ${C.border}`, padding: "56px 40px", textAlign: "center", background: C.surface }}>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.75, maxWidth: 340, margin: "0 auto 24px" }}>
          Przygotowujemy ofertę funduszy, obligacji i kont oszczędnościowych dopasowanych do lekarzy.
        </p>
        <Btn variant="ghost">Powiadom mnie →</Btn>
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
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.body, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "white" }}>AK</div>
        <div>
          <h2 style={{ ...T.h2, fontSize: 18 }}>Dr Anna Kowalska</h2>
          <p style={{ fontSize: 12, color: C.muted, margin: "3px 0 0" }}>Rezydent · Kardiologia · Warszawa</p>
        </div>
      </div>

      <div>
        <SectionHeader title="Świadczenia — Luty 2026" />
        <div style={{ borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden", background: C.surface }}>
          {perks.map((p, i) => (
            <div key={p.id} style={{ borderBottom: i < perks.length - 1 ? `1px solid ${C.border}` : "none", opacity: claimedIds[p.id] ? 0.48 : 1 }}>
              <div style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.body }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{p.brand} · wygasa za {p.expires}</div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.body }}>{p.value}</span>
                </div>
                <div style={{ borderTop: "1.5px dashed #ECEAE6", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
                  <div style={{ position: "absolute", left: -26, top: -7, width: 12, height: 12, borderRadius: "50%", background: C.bg }} />
                  <div style={{ position: "absolute", right: -26, top: -7, width: 12, height: 12, borderRadius: "50%", background: C.bg }} />
                  <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: C.label, letterSpacing: "0.05em" }}>{p.code}</span>
                  {claimedIds[p.id] ? (
                    <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>✓ Odebrano</span>
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => { setCopiedId(p.id); setTimeout(() => setCopiedId(null), 2000); }}
                        style={{ fontSize: 12, fontWeight: 600, color: copiedId === p.id ? C.green : C.accent, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                        {copiedId === p.id ? "✓ Skopiowano" : "Kopiuj"}
                      </button>
                      <Btn variant="primary" onClick={() => setClaimedIds(c => ({ ...c, [p.id]: true }))} style={{ padding: "6px 14px", fontSize: 12 }}>Odbierz</Btn>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>Nowe świadczenia 1. dnia każdego miesiąca.</div>
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

export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [active,    setActive]    = useState("overview");

  if (!onboarded) return <Onboarding onComplete={() => setOnboarded(true)} />;

  const View = VIEWS[active] || Overview;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans','Helvetica Neue',sans-serif", color: C.body }}>
      <Sidebar active={active} setActive={setActive} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopBar active={active} setActive={setActive} />
        <main style={{ flex: 1, padding: "36px 40px 80px", overflowY: "auto" }}>
          <View setActive={setActive} />
        </main>
      </div>
    </div>
  );
}
