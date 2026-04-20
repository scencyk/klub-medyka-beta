import React, { useState, useEffect, useRef, useCallback, useMemo, useId } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useSpring, useTransform, motionValue, useInView } from 'motion/react';
import useMeasure from 'react-use-measure';
import './styles/index.css';

// ─── TEXT ROLL ────────────────────────────────────────────────────────────────

function TextRoll({ children, duration = 0.45, stagger = 0.04, className }) {
  const letters = children.split('');
  return (
    <span className={className} aria-label={children}>
      {letters.map((letter, i) => (
        <span key={i} className="text-roll__char" aria-hidden="true">
          <motion.span
            className="text-roll__enter"
            initial={{ rotateX: 0 }}
            animate={{ rotateX: 90 }}
            transition={{ ease: 'easeIn', duration, delay: i * stagger }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
          <motion.span
            className="text-roll__exit"
            initial={{ rotateX: 90 }}
            animate={{ rotateX: 0 }}
            transition={{ ease: 'easeIn', duration, delay: i * stagger + 0.2 }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
          <span className="text-roll__spacer">
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        </span>
      ))}
    </span>
  );
}

// ─── TEXT SHIMMER WAVE ────────────────────────────────────────────────────────

function TextShimmerWave({ children, duration = 1, spread = 1, zDistance = 6, yDistance = -2, scaleDistance = 1.05, className }) {
  const chars = children.split('');
  return (
    <span className={className} style={{ display: 'inline-block', perspective: 500 }}>
      {chars.map((char, i) => {
        const delay = (i * duration * (1 / spread)) / chars.length;
        return (
          <motion.span
            key={i}
            style={{ display: 'inline-block', whiteSpace: 'pre', transformStyle: 'preserve-3d' }}
            animate={{
              translateZ: [0, zDistance, 0],
              translateY: [0, yDistance, 0],
              scale: [1, scaleDistance, 1],
              color: ['var(--color-muted)', 'var(--color-accent)', 'var(--color-muted)'],
            }}
            transition={{ duration, repeat: Infinity, repeatDelay: chars.length * 0.05 / spread, delay, ease: 'easeInOut' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        );
      })}
    </span>
  );
}

// ─── TEXT EFFECT ──────────────────────────────────────────────────────────────

// ─── TextLoop (motion-primitives) ───
function TextLoop({ children, interval = 3, transition = { duration: 0.3 }, className }) {
  const items = React.Children.toArray(children);
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIdx(c => (c + 1) % items.length), interval * 1000);
    return () => clearInterval(timer);
  }, [items.length, interval]);
  return (
    <span className={className} style={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', verticalAlign: 'bottom' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={idx}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={transition}
          style={{ display: 'inline-block' }}
        >
          {items[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ─── SlidingNumber (motion-primitives) ───
const SLIDING_TRANSITION = { type: 'spring', stiffness: 280, damping: 18, mass: 0.3 };

function SlidingDigit({ value, place }) {
  const valueRoundedToPlace = Math.floor(value / place) % 10;
  const initial = motionValue(valueRoundedToPlace);
  const animatedValue = useSpring(initial, SLIDING_TRANSITION);
  useEffect(() => { animatedValue.set(valueRoundedToPlace); }, [animatedValue, valueRoundedToPlace]);
  return (
    <div style={{ position: 'relative', display: 'inline-block', width: '1ch', overflowX: 'visible', overflowY: 'clip', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
      <div style={{ visibility: 'hidden' }}>0</div>
      {Array.from({ length: 10 }, (_, i) => <SlidingDigitNum key={i} mv={animatedValue} number={i} />)}
    </div>
  );
}

function SlidingDigitNum({ mv, number }) {
  const uniqueId = useId();
  const [ref, bounds] = useMeasure();
  const y = useTransform(mv, (latest) => {
    if (!bounds.height) return 0;
    const placeValue = latest % 10;
    const offset = (10 + number - placeValue) % 10;
    let memo = offset * bounds.height;
    if (offset > 5) memo -= 10 * bounds.height;
    return memo;
  });
  if (!bounds.height) return <span ref={ref} style={{ position: 'absolute', visibility: 'hidden' }}>{number}</span>;
  return (
    <motion.span style={{ y, position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} layoutId={`${uniqueId}-${number}`} transition={SLIDING_TRANSITION} ref={ref}>
      {number}
    </motion.span>
  );
}

function SlidingNumber({ value, decimalSeparator = ',', suffix = '' }) {
  const absValue = Math.abs(value);
  const [intPart, decPart] = absValue.toFixed(2).split('.');
  const intValue = parseInt(intPart, 10);
  const intDigits = intPart.split('');
  const intPlaces = intDigits.map((_, i) => Math.pow(10, intDigits.length - i - 1));
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {value < 0 && '−'}
      {intDigits.map((_, i) => <SlidingDigit key={`i-${intPlaces[i]}`} value={intValue} place={intPlaces[i]} />)}
      {decPart && (
        <>
          <span>{decimalSeparator}</span>
          {decPart.split('').map((_, i) => <SlidingDigit key={`d-${i}`} value={parseInt(decPart, 10)} place={Math.pow(10, decPart.length - i - 1)} />)}
        </>
      )}
      {suffix && <span>{suffix.replace(/^ /, '\u00A0')}</span>}
    </span>
  );
}

function ServiceTooltip({ text }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  const handleEnter = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top });
    setShow(true);
  };
  return (
    <span className="pdp__service-tooltip-wrap" ref={ref} onMouseEnter={handleEnter} onMouseLeave={() => setShow(false)}>
      <svg className="pdp__service-info-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
      {show && createPortal(
        <div className="pdp__service-tooltip" style={{ position: 'fixed', left: pos.x, top: pos.y - 8, transform: 'translate(-50%, -100%)' }}>{text}</div>,
        document.body
      )}
    </span>
  );
}

function PeriodTooltip({ text, children }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  const handleEnter = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top });
    setShow(true);
  };
  return (
    <div ref={ref} onMouseEnter={handleEnter} onMouseLeave={() => setShow(false)} style={{ position: 'relative' }}>
      {children}
      {show && createPortal(
        <div className="pdp__service-tooltip" style={{ position: 'fixed', left: pos.x, top: pos.y - 8, transform: 'translate(-50%, -100%)' }}>{text}</div>,
        document.body
      )}
    </div>
  );
}

function BorderTrail({ size = 60, transition, style, className }) {
  const defaultTransition = { repeat: Infinity, duration: 5, ease: 'linear' };
  return (
    <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0, borderRadius: 'inherit', border: '1px solid transparent', maskClip: 'padding-box, border-box', maskComposite: 'intersect', WebkitMaskComposite: 'source-in', maskImage: 'linear-gradient(transparent,transparent),linear-gradient(#000,#000)', WebkitMaskImage: 'linear-gradient(transparent,transparent),linear-gradient(#000,#000)' }}>
      <motion.div
        className={className}
        style={{ position: 'absolute', width: size, aspectRatio: '1', offsetPath: `rect(0 auto auto 0 round ${size}px)`, background: 'rgb(206, 255, 62)', ...style }}
        animate={{ offsetDistance: ['0%', '100%'] }}
        transition={transition || defaultTransition}
      />
    </div>
  );
}

function TextEffect({ children, per = 'char', preset = 'fade-in-blur', delay = 0, speedReveal = 1, className, as: Tag = 'span' }) {
  const presets = {
    'fade-in-blur': {
      hidden: { opacity: 0, y: 12, filter: 'blur(8px)' },
      visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
    },
    'blur': {
      hidden: { opacity: 0, filter: 'blur(12px)' },
      visible: { opacity: 1, filter: 'blur(0px)' },
    },
    'scale': {
      hidden: { opacity: 0, scale: 0 },
      visible: { opacity: 1, scale: 1 },
    },
    'slide': {
      hidden: { opacity: 0, y: 16 },
      visible: { opacity: 1, y: 0 },
    },
  };
  const itemVariants = presets[preset] || presets['fade-in-blur'];
  const stagger = (per === 'char' ? 0.03 : 0.05) / speedReveal;
  const segments = per === 'char' ? children.split('') : children.split(/(\s+)/);
  const MotionTag = motion[Tag];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {segments.map((seg, i) => (
        per === 'char' ? (
          <motion.span key={i} variants={itemVariants} style={{ display: 'inline-block', whiteSpace: 'pre' }} transition={{ duration: 0.3 }}>
            {seg === ' ' ? '\u00A0' : seg}
          </motion.span>
        ) : (
          <motion.span key={i} style={{ display: 'inline-block', whiteSpace: 'pre' }}>
            {seg.split('').map((ch, ci) => (
              <motion.span key={ci} variants={itemVariants} style={{ display: 'inline-block', whiteSpace: 'pre' }} transition={{ duration: 0.3 }}>
                {ch === ' ' ? '\u00A0' : ch}
              </motion.span>
            ))}
          </motion.span>
        )
      ))}
    </MotionTag>
  );
}

// ─── THEME ───────────────────────────────────────────────────────────────────

function useTheme() {
  const [theme, setThemeState] = useState(() => {
    try { return localStorage.getItem("km-theme") || "light"; } catch { return "light"; }
  });
  useEffect(() => {
    try { localStorage.setItem("km-theme", theme); } catch {}
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  useEffect(() => {
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => document.documentElement.setAttribute("data-theme", "system");
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme]);
  const setTheme = (t) => {
    document.documentElement.classList.add("theme-transitioning");
    setThemeState(t);
    setTimeout(() => document.documentElement.classList.remove("theme-transitioning"), 350);
  };
  return [theme, setTheme];
}

function ThemeToggle({ theme, setTheme }) {
  const modes = [
    { id: "light", label: "Jasny", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> },
    { id: "dark", label: "Ciemny", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg> },
    { id: "system", label: "Auto", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
  ];
  return (
    <div className="theme-toggle">
      {modes.map(m => (
        <button key={m.id} className={`theme-toggle__btn${theme === m.id ? " theme-toggle__btn--active" : ""}`}
          onClick={() => setTheme(m.id)} title={m.label}>{m.icon}</button>
      ))}
    </div>
  );
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────

const PROFILE_KEY = "km-user-profile";
const DEFAULT_PROFILE = { firstName: "", lastName: "", email: "", phone: "", pwz: "", role: null, work: [], interests: [] };

function useProfile() {
  const [profile, setProfileState] = useState(() => {
    try {
      const s = localStorage.getItem(PROFILE_KEY);
      return s ? { ...DEFAULT_PROFILE, ...JSON.parse(s) } : DEFAULT_PROFILE;
    } catch { return DEFAULT_PROFILE; }
  });
  useEffect(() => {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch {}
  }, [profile]);
  const setProfile = (u) => setProfileState(prev => typeof u === "function" ? u(prev) : { ...prev, ...u });
  return [profile, setProfile];
}

const USER_AVATAR = "https://images.unsplash.com/photo-1592621385612-4d7129426394?w=200&h=200&fit=crop&crop=faces";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const ALL_ADVISORS = [
  { id: "a1", name: "Marta Kowalczyk",      role: "Ubezpieczenia praktyki lekarskiej", phone: "+48 600 100 200", initials: "MK", available: true,  photo: "advisors/marta.jpg",     category: "insurance", tags: ["OC lekarskie", "NNW", "Majątkowe", "Praktyka lekarska"] },
  { id: "a2", name: "Tomasz Nowak",         role: "Doradca prawny",                    phone: "+48 601 200 300", initials: "TN", available: true,  photo: "advisors/tomasz.jpg",    category: "legal",    tags: ["Prawo medyczne", "Kontrakty", "Ochrona prawna", "Roszczenia"] },
  { id: "a3", name: "Agnieszka Wiśniewska", role: "Doradca finansowy",                 phone: "+48 602 300 400", initials: "AW", available: false, photo: "advisors/agnieszka.jpg", category: "tax",      tags: ["JDG", "Optymalizacja podatkowa", "Księgowość", "B2B"] },
  { id: "a4", name: "Karolina Zielińska",   role: "Ubezpieczenia na życie",            phone: "+48 603 400 500", initials: "KZ", available: true,  photo: "advisors/karolina.jpg",  category: "life",     tags: ["Na życie", "Zdrowie", "Utrata dochodu", "Rodzina"] },
  { id: "a5", name: "Michał Wójcik",        role: "Doradca kredytowy",                 phone: "+48 604 500 600", initials: "MW", available: true,  photo: "advisors/michal.jpg",    category: "credit",   tags: ["Kredyt hipoteczny", "Leasing", "Finansowanie sprzętu"] },
];

// ─── LEKARZ PRZEDSIĘBIORCA — produkt główny ──────────────────────────────────
// Model: jeden produkt, dwa parametry (Lloyd's suma + inFakt addon).
// Cena dynamiczna, billing monthly / yearly -10%.
const LP_PRODUCT = {
  id: "lp",
  label: "Lekarz Przedsiębiorca",
  tagline: "Jeden abonament. Pełna infrastruktura biznesowa dla lekarza prowadzącego JDG.",
  quote: "Otwierasz działalność — my ogarniamy resztę.",
  basePrice: 349,               // zł/msc, suma Lloyd's 5k, bez inFakt, rozliczenie miesięczne
  annualDiscount: 0.10,         // -10% przy rozliczeniu rocznym
  leaselinkLimit: 87000,        // PWZ-based prelimit (hardcoded)
  lloydOptions: [
    { sum: 5000,  deltaPrice: 0,   label: "5 000 zł / msc",  sub: "w cenie bazowej" },
    { sum: 10000, deltaPrice: 150, label: "10 000 zł / msc", sub: "+ 150 zł / msc" },
    { sum: 15000, deltaPrice: 310, label: "15 000 zł / msc", sub: "+ 310 zł / msc" },
  ],
  infakt: { price: 179, bonus: 1000 },
};

const LP_FEATURES = [
  { id: "lloyds",    name: "Lloyd's — utrata dochodu",                   short: "Lloyd's",             note: "Remedium jako ubezpieczający · rabat 15% · wiek z profilu" },
  { id: "oc",        name: "OC zawodowe Ergo Hestia",                    short: "OC zawodowe",         note: "Klasa automatycznie z NIL · rabat 10%" },
  { id: "wg",        name: "Wirtualny gabinet",                          short: "Wirtualny gabinet",   note: "Adres + tel + email · prywatność w KRS" },
  { id: "autenti",   name: "Autenti — podpis kwalifikowany",             short: "Autenti",             note: "e-Recepta, e-ZLA, umowy" },
  { id: "egabinet",  name: "eGabinet EDM",                               short: "eGabinet EDM",        note: "Pakiet wizyt gratis · 10% zniżka dla klinik" },
  { id: "legal",     name: "Bank odpowiedzi prawnych",                   short: "Bank odp. prawnych",  note: "AI + sygnatura Tymiński · top 50 pytań JDG" },
  { id: "advIns",    name: "Doradcy ubezpieczeniowi + analiza potrzeb",  short: "Doradcy ubezp.",      note: "Dedykowany opiekun · pełna analiza potrzeb",     gratis: true },
  { id: "advLeas",   name: "Doradcy leasingowi",                         short: "Doradcy leas.",       note: "W cenie integracji LeaseLink",                   gratis: true },
  { id: "tax",       name: "Konsultacja podatkowa 15 min/msc",           short: "Konsultacja 15 min",  note: "Tax Legal Beauty · white-label",                 gratis: true },
  { id: "aion",      name: "Konto AION + kreator JDG",                   short: "Konto AION",          note: "Wskazywalne do US/ZUS",                          requiresInfakt: true },
];

// Suma ubezpieczenia Lloyd's → labelka do breakdown row
function lpLloydLabel(sum) { return `Lloyd's utrata dochodu ${sum / 1000}k`; }

// Kalkulacja ceny LP na podstawie stanu subskrypcji.
// Zwraca: { raw, effective, annualTotal, annualSaving }
//   raw          — cena miesięczna bez rabatu rocznego (do ekspozycji "strikethrough")
//   effective    — cena miesięczna do wyświetlenia (po rabacie jeśli billing=rok)
//   annualTotal  — łączna kwota roczna (null przy billing=msc)
//   annualSaving — oszczędność w zł/rok vs miesięczny (0 przy billing=msc)
function calcLPPrice(sub) {
  const opt = LP_PRODUCT.lloydOptions.find(o => o.sum === sub.lloydSum) || LP_PRODUCT.lloydOptions[0];
  const raw = LP_PRODUCT.basePrice + opt.deltaPrice + (sub.infaktAddon ? LP_PRODUCT.infakt.price : 0);
  if (sub.billing === "rok") {
    const annualTotal  = Math.round(raw * 12 * (1 - LP_PRODUCT.annualDiscount));
    const effective    = Math.round(annualTotal / 12);
    const annualSaving = raw * 12 - annualTotal;
    return { raw, effective, annualTotal, annualSaving };
  }
  return { raw, effective: raw, annualTotal: null, annualSaving: 0 };
}

// ─── SERVICES 2 — katalog pojedynczych usług (bottom-up discovery) ───────────
// Model: user przegląda klocki, dodaje do koszyka, w pewnym momencie system
// "odkrywa" mu że wybrane usługi są częścią pakietu LP i oferuje swap.
const SERVICE_CATEGORIES = [
  { id: "all",        label: "Wszystkie" },
  { id: "insurance",  label: "Ubezpieczenia" },
  { id: "accounting", label: "Księgowość i dokumenty" },
  { id: "medical",    label: "Praktyka" },
  { id: "legal",      label: "Prawne i doradcze" },
];

// Solo prices — każda usługa kupowana osobno. LP daje rabat/gratis/bonus.
// Każda usługa ma pełny `landing` z sekcjami: longDesc, partner, valueProps,
// includes, howItWorks, faq. To zasila ServiceDetailView (osobny widok per usługa).
const SERVICE_CATALOG = [
  {
    id: "lloyds", label: "Ubezpieczenie utraty dochodu (Lloyd's)", short: "Lloyd's",
    category: "insurance", icon: "💼",
    soloPrice: 115,
    desc: "Ochrona Twojego przychodu przy chorobie lub wypadku. Remedium pośredniczy.",
    soloFeatures: ["Suma 5 000 zł / mies.", "Wypłata do 24 miesięcy", "Bez karencji medycznej"],
    lpAdvantage: "Rabat 15% + rocznie bez 10% surcharge",
    inLP: true,
    landing: {
      longDesc: "Polisa z syndykatu Lloyd's zapewniająca wypłatę stałego miesięcznego świadczenia, gdy nie możesz pracować z powodu choroby lub wypadku. Remedium jest ubezpieczającym — to pozwala nam wynegocjować warunki niedostępne w retailowej sprzedaży.",
      partner: "Lloyd's · dystrybucja przez Remedium",
      valueProps: [
        { title: "Wypłata bez OL", desc: "Brak okresu oczekiwania na świadczenie" },
        { title: "Do 24 miesięcy", desc: "Długoterminowa ochrona na poważne przypadki" },
        { title: "Wiek z profilu NIL", desc: "Zero pytań medycznych — dane z Twojego profilu" },
      ],
      includes: [
        { title: "Suma 5 000 zł / miesiąc", desc: "Baza — do uptade w pakiecie LP (10k, 15k)" },
        { title: "Wypłata po 14 dniach niezdolności", desc: "Licząc od pierwszego dnia L4" },
        { title: "Brak karencji medycznej", desc: "Ochrona od dnia 1, bez pytań o stan zdrowia" },
        { title: "Pokrycie chorób zawodowych", desc: "Pełna ochrona przy zakażeniu w gabinecie" },
        { title: "Wypadek + choroba", desc: "Obie sytuacje w jednej polisie" },
      ],
      howItWorks: [
        { title: "Wypełniasz mini-formularz", desc: "5 minut — wiek i specjalizacja zaciągane z profilu NIL" },
        { title: "Otrzymujesz ofertę", desc: "Kalkulacja automatyczna, bez konsultantów telefonicznych" },
        { title: "Polisa aktywna w 24h", desc: "Dokumenty w panelu Klubu, podpis przez Autenti" },
        { title: "Zgłaszasz szkodę przez app", desc: "Bezpośrednio z dashboardu — bez dzwonienia" },
      ],
      faq: [
        { q: "Kiedy zaczyna się ochrona?", a: "Następnego dnia roboczego po zapłacie pierwszej składki. Brak karencji medycznej oznacza, że nie musisz czekać 90 dni jak w retail." },
        { q: "Czy mogę zmienić sumę ubezpieczenia?", a: "Tak, w każdym momencie przez panel — upgrade z 5k na 10k lub 15k wchodzi od następnego cyklu rozliczeniowego." },
        { q: "Jakie są wyłączenia?", a: "Standardowe: działania wojenne, umyślne samookaleczenie, nadużycie alkoholu/substancji. Pełna lista w OWU dostępna po kliknięciu 'Dodaj do koszyka'." },
        { q: "Co jeśli dostanę L4 krótsze niż 14 dni?", a: "Polisa nie wypłaca świadczenia. Jest przeznaczona do dłuższych niezdolności do pracy, nie do kilkudniowych zwolnień." },
      ],
    },
  },
  {
    id: "oc", label: "OC zawodowe", short: "OC",
    category: "insurance", icon: "🩺",
    soloPrice: 89,
    desc: "Obowiązkowe OC lekarskie. Klasa zależy od Twojej specjalizacji.",
    soloFeatures: ["Suma 1 000 000 zł", "Roczna polisa", "Ergo Hestia"],
    lpAdvantage: "Klasa auto z NIL, rabat 10% negocjowany",
    inLP: true,
    landing: {
      longDesc: "Obowiązkowe ubezpieczenie odpowiedzialności cywilnej lekarza. Chroni przed roszczeniami pacjentów w przypadku błędów w sztuce lekarskiej. Klasyfikacja ryzyka automatyczna z Twojego profilu NIL — nie musisz zgadywać.",
      partner: "Ergo Hestia · dystrybucja przez Remedium",
      valueProps: [
        { title: "Klasa ryzyka z NIL", desc: "Auto z profilu — bez ankiet" },
        { title: "Suma 1 000 000 zł", desc: "Standard rynkowy + możliwość nadwyżki" },
        { title: "Roczna polisa", desc: "Pokrycie przez 12 miesięcy od zakupu" },
      ],
      includes: [
        { title: "OC obowiązkowe", desc: "Suma 100 000 EUR zgodnie z Rozporządzeniem MF" },
        { title: "OC dobrowolne nadwyżkowe", desc: "Od 1M do 2M zł — opcjonalne rozszerzenie" },
        { title: "Automatyczna klasyfikacja", desc: "Klasa I/II/III z bazy NIL — zero pomyłek" },
        { title: "Rozszerzenia klauzulowe", desc: "Medycyna estetyczna, kary NFZ, HIV/WZW dostępne" },
        { title: "Pomoc prawnika w trakcie sprawy", desc: "Włączony koszt ochrony prawnej" },
      ],
      howItWorks: [
        { title: "Zaciągamy Twoją specjalizację z NIL", desc: "Klasa ryzyka (I, II lub III) wynika z aktu prawnego" },
        { title: "Wybierasz sumę nadwyżkową", desc: "Opcjonalnie — dla lekarzy z praktyką prywatną" },
        { title: "Polisa aktywna w 1 dzień", desc: "Certyfikat w PDF do pokazania w NFZ / klinikach" },
      ],
      faq: [
        { q: "Dla kogo jest OC obowiązkowe?", a: "Dla każdego lekarza wykonującego zawód, bez wyjątku. Praktyka prywatna wymaga dodatkowo dobrowolnego nadwyżkowego." },
        { q: "Co daje wyższa suma nadwyżkowa?", a: "Większa ochrona przy roszczeniach powyżej 100 000 EUR. Dla chirurgów i anestezjologów rekomendujemy 2M zł." },
        { q: "Czy pokrywa medycynę estetyczną?", a: "W standardzie nie — wymaga klauzuli rozszerzającej. Do wykupienia osobno w koszyku." },
      ],
    },
  },
  {
    id: "travel", label: "Ubezpieczenie podróżne INTER", short: "Podróżne",
    category: "insurance", icon: "✈️",
    soloPrice: 49,
    desc: "Roczna ochrona na wyjazdach służbowych i prywatnych. Do 500 000 EUR.",
    soloFeatures: ["Koszty leczenia do 500k EUR", "NNW i bagaż", "Cały świat"],
    inLP: false,
    landing: {
      longDesc: "Roczna polisa podróżna INTER Polska — chroni Cię na wyjazdach prywatnych i na konferencjach medycznych. Koszty leczenia, NNW, bagaż i OC w podróży w jednej polisie.",
      partner: "INTER Polska TU S.A.",
      valueProps: [
        { title: "500 000 EUR", desc: "Suma kosztów leczenia" },
        { title: "Nielimitowana liczba wyjazdów", desc: "Cały rok, cały świat" },
        { title: "Bez franszyz", desc: "Zero udziału własnego" },
      ],
      includes: [
        { title: "Koszty leczenia do 500 000 EUR", desc: "Szpital, ambulatorium, transport sanitarny" },
        { title: "NNW do 50 000 zł", desc: "Śmierć i trwały uszczerbek na zdrowiu" },
        { title: "Bagaż do 3 000 zł", desc: "Kradzież, zagubienie, opóźnienie dostarczenia" },
        { title: "OC w życiu prywatnym", desc: "Suma 100 000 EUR na szkody wyrządzone osobom trzecim" },
        { title: "Assistance 24/7", desc: "Infolinia po polsku, pomoc w organizacji leczenia" },
      ],
      howItWorks: [
        { title: "Jedna polisa na rok", desc: "Bez konieczności kupowania za każdym wyjazdem" },
        { title: "Automatyczna aktywacja", desc: "Polisa obowiązuje od zakupu przez 12 miesięcy" },
        { title: "Zgłoszenie przez INTER app", desc: "Bezpośrednio z podróży, po polsku" },
      ],
      faq: [
        { q: "Czy obejmuje konferencje medyczne?", a: "Tak, wyjazdy służbowe są w pełni objęte ochroną — konferencje, szkolenia, staże zagraniczne." },
        { q: "A sporty ekstremalne?", a: "Standardowo nie — wymaga rozszerzenia. Narty rekreacyjne OK, heliski nie." },
      ],
    },
  },
  {
    id: "infakt", label: "Księgowość inFakt", short: "inFakt",
    category: "accounting", icon: "🧾",
    soloPrice: 199,
    desc: "Pełna księgowość JDG przez inFakt. Faktury, PIT, ZUS, US.",
    soloFeatures: ["Wszystkie deklaracje", "App mobilna", "Wsparcie księgowego"],
    lpAdvantage: "Bonus 1 000 zł za aktywację + 179 zł w pakiecie",
    inLP: true,
    landing: {
      longDesc: "Pełna księgowość dla lekarza JDG — inFakt zajmuje się wszystkim: fakturami, PIT, ZUS, US, VAT, deklaracjami. Aktywacja przez Klub odblokowuje też konto firmowe AION i kreator JDG.",
      partner: "inFakt · oficjalna integracja",
      valueProps: [
        { title: "Wszystkie deklaracje", desc: "PIT, VAT, ZUS, JPK — w cenie" },
        { title: "Księgowy do kontaktu", desc: "Chat, email, telefon — dedykowany opiekun" },
        { title: "App mobilna", desc: "Faktury z telefonu w 30 sekund" },
      ],
      includes: [
        { title: "Księgowość pełna", desc: "Ryczałt, liniowy, skala — wszystkie formy opodatkowania" },
        { title: "Faktury bez limitu", desc: "Wystawianie z aplikacji mobilnej i webowej" },
        { title: "Deklaracje wysyłane automatycznie", desc: "PIT, VAT, JPK-V7 — w terminie, bez Twojej akcji" },
        { title: "Kontakt z księgowym", desc: "Dedykowany opiekun — chat, email, telefon" },
        { title: "Integracja z e-Urzędem Skarbowym", desc: "Zero ręcznego wprowadzania danych z US" },
        { title: "Konto firmowe AION", desc: "Odblokowane po aktywacji inFakt — zero opłat" },
      ],
      howItWorks: [
        { title: "Aktywujesz w 1 dzień", desc: "Pełnomocnictwo dla księgowego + pierwsze logowanie" },
        { title: "Migracja historii jeśli zmieniasz biuro", desc: "inFakt przejmuje rozliczenia z poprzedniego okresu" },
        { title: "Rozliczamy za Ciebie", desc: "Ty tylko wystawiasz faktury, resztę robi inFakt" },
        { title: "Konsultacja przed rozliczeniem", desc: "Raz w roku na życzenie — optymalizacja podatkowa" },
      ],
      faq: [
        { q: "Czy mogę zmienić formę opodatkowania?", a: "Tak, inFakt obsługuje wszystkie: ryczałt ewidencjonowany, podatek liniowy, zasady ogólne (skala). Zmiana raz w roku zgodnie z przepisami." },
        { q: "Co z fakturami sprzed inFakt?", a: "Migracja jest w cenie — przenosimy historię z Twojego poprzedniego biura." },
        { q: "Jak działa bonus 1 000 zł?", a: "Jednorazowy zwrot po 3 miesiącach aktywnej subskrypcji — dostępny tylko przez Klub Medyka w pakiecie LP." },
        { q: "Czy księgowy się zmienia?", a: "Nie — dedykowany opiekun pozostaje Twój przez cały czas trwania umowy." },
      ],
    },
  },
  {
    id: "wg", label: "Wirtualny gabinet (adres rejestrowy)", short: "Wirtualny gabinet",
    category: "accounting", icon: "🏢",
    soloPrice: 79,
    desc: "Adres JDG + korespondencja + telefon + email — prywatność w KRS.",
    soloFeatures: ["Adres rejestrowy", "Skanowanie poczty", "Prywatność w CEIDG"],
    lpAdvantage: "W cenie pakietu (0 zł)",
    inLP: true,
    landing: {
      longDesc: "Adres rejestrowy dla Twojej JDG — nie musisz podawać domowego w CEIDG. Obsługa korespondencji, numer telefonu i email w Twojej domenie. Twoja prywatność i profesjonalizm w jednym.",
      partner: "Remedium — własna usługa",
      valueProps: [
        { title: "Prywatność w CEIDG", desc: "Adres domowy nie trafia do publicznego rejestru" },
        { title: "Obsługa korespondencji", desc: "Skanujemy i wysyłamy do panelu" },
        { title: "Numer firmowy", desc: "Telefon w Twojej domenie medycznej" },
      ],
      includes: [
        { title: "Adres rejestrowy w Warszawie", desc: "Prestiżowa lokalizacja, możliwość spotkań" },
        { title: "Skanowanie poczty przychodzącej", desc: "Każda przesyłka w panelu w 24h od dostarczenia" },
        { title: "Przekazywanie poczty fizycznej", desc: "Raz w miesiącu na wskazany adres (w cenie)" },
        { title: "Numer telefonu", desc: "Dedykowany dla praktyki, przekazanie na komórkę" },
        { title: "Email praktyki", desc: "Format imie.nazwisko@remedium.md" },
      ],
      howItWorks: [
        { title: "Generujemy dokumenty", desc: "Umowa najmu adresu + pełnomocnictwo pocztowe" },
        { title: "Podpisujesz przez Autenti", desc: "Bez wysyłki papierów — 2 kliknięcia" },
        { title: "Zgłaszasz adres w CEIDG", desc: "Mamy gotowy szablon wniosku" },
      ],
      faq: [
        { q: "Czy to legalnie?", a: "Tak — adres wirtualny do rejestracji JDG jest w pełni zgodny z prawem, od lat stosowany przez kancelarie, software house'y i setki branż." },
        { q: "Co z wizytami US / ZUS?", a: "Mogą odwiedzić — mamy recepcję i salkę spotkań. Zawsze Cię wcześniej informujemy." },
        { q: "Czy dostanę potwierdzenie z bankiem?", a: "Tak, umowa najmu adresu jest akceptowana przez banki przy zakładaniu konta firmowego." },
      ],
    },
  },
  {
    id: "autenti", label: "Autenti — podpis kwalifikowany", short: "Autenti",
    category: "accounting", icon: "✍️",
    soloPrice: 29,
    desc: "Podpis kwalifikowany do e-Recept, e-ZLA i umów. Bez tokena USB.",
    soloFeatures: ["Nieograniczone podpisy", "e-Recepta, e-ZLA", "Weryfikacja przez mObywatel"],
    lpAdvantage: "W cenie pakietu (0 zł)",
    inLP: true,
    landing: {
      longDesc: "Podpis kwalifikowany w chmurze — bez tokena USB, bez karty, bez dodatkowego sprzętu. Weryfikacja tożsamości przez mObywatel, zero instalacji. Standard dla e-Recept, e-ZLA, umów i dokumentów firmowych.",
      partner: "Autenti · oficjalna integracja",
      valueProps: [
        { title: "Bez tokena USB", desc: "Podpis z każdego urządzenia przez chmurę" },
        { title: "Nielimitowane podpisy", desc: "Zero opłat per-operacja" },
        { title: "Weryfikacja przez mObywatel", desc: "Aktywacja w 5 minut" },
      ],
      includes: [
        { title: "Podpis kwalifikowany PE", desc: "Pełna moc prawna — zgodny z eIDAS" },
        { title: "Nieograniczone operacje", desc: "Podpisz ile chcesz — nie ma limitu" },
        { title: "e-Recepta i e-ZLA", desc: "Bezpośrednia integracja z Gabinet+ i NFZ" },
        { title: "Podpis umów handlowych", desc: "Kontrakty z klinikami, zleceniobiorcami, pacjentami" },
        { title: "Archiwum dokumentów", desc: "Wszystkie podpisane dokumenty w panelu na 10 lat" },
      ],
      howItWorks: [
        { title: "Weryfikacja tożsamości przez mObywatel", desc: "5 minut przez aplikację państwową" },
        { title: "Aktywacja w panelu Autenti", desc: "Automatyczne założenie konta przez Klub" },
        { title: "Pierwszy podpis", desc: "Przez app Autenti lub bezpośrednio z Gabinet+" },
      ],
      faq: [
        { q: "Czy to wystarczy do e-Recepty?", a: "Tak — Autenti jest oficjalnym dostawcą podpisu kwalifikowanego akceptowanym przez NFZ i CeZ." },
        { q: "Co jeśli zmienię telefon?", a: "Nie dotyczy — podpis jest w chmurze. Logujesz się z każdego urządzenia i telefon służy tylko do 2FA." },
        { q: "Jak długo ważny jest podpis?", a: "Certyfikat odnawia się automatycznie co 12 miesięcy — bez Twojej akcji." },
      ],
    },
  },
  {
    id: "egabinet", label: "eGabinet EDM", short: "eGabinet",
    category: "medical", icon: "🗂️",
    soloPrice: 59,
    desc: "Elektroniczna dokumentacja medyczna zgodna z CeZ. Integracja z NFZ.",
    soloFeatures: ["EDM dla 1 lekarza", "Szablony dokumentów", "Pakiet wizyt (50/msc)"],
    lpAdvantage: "W cenie + 10% zniżki dla klinik",
    inLP: true,
    landing: {
      longDesc: "Elektroniczna dokumentacja medyczna zgodna z wymaganiami Centrum e-Zdrowia (CeZ) oraz NFZ. System gotowy do kontroli, szablony zaadaptowane pod specjalizacje, integracja z e-Receptą i e-Skierowaniem.",
      partner: "eGabinet.pl · oficjalny partner",
      valueProps: [
        { title: "Zgodny z CeZ i NFZ", desc: "Gotowy do kontroli EDM" },
        { title: "Integracja e-Recepta", desc: "Wystawianie z poziomu wizyty" },
        { title: "Szablony per-specjalizacja", desc: "Gotowe formularze gabinetowe" },
      ],
      includes: [
        { title: "Dokumentacja wizyt", desc: "Wywiad, badanie, zalecenia — strukturalnie wg CeZ" },
        { title: "Pakiet 50 wizyt miesięcznie", desc: "Wystarczy dla pojedynczej praktyki gabinetowej" },
        { title: "e-Recepta bezpośrednio z wizyty", desc: "Bez przełączania się między systemami" },
        { title: "e-Skierowania", desc: "Pełna integracja z NFZ" },
        { title: "Eksport EDM na żądanie", desc: "Dla pacjentów, NFZ, lub backup" },
        { title: "Szablony zaadaptowane", desc: "Formularze dla Twojej specjalizacji z bazy eGabinet" },
      ],
      howItWorks: [
        { title: "Aktywujesz konto", desc: "Automatyczne założenie przez Klub, bez osobnego loginu" },
        { title: "Importujesz bazę pacjentów", desc: "CSV, Excel, lub wprowadzenie ręczne" },
        { title: "Prowadzisz wizyty", desc: "Dokumentacja na żywo, e-Recepta w tym samym oknie" },
      ],
      faq: [
        { q: "Co jeśli prowadzę klinikę z kilkoma lekarzami?", a: "Solo eGabinet to 1 lekarz. W pakiecie LP klinika dostaje dodatkowo 10% zniżki per-lekarz — upgrade dostępny w panelu." },
        { q: "Czy integruje się z Moim NFZ?", a: "Tak — e-Recepta, e-ZLA, e-Skierowania wysyłane bezpośrednio." },
        { q: "Co jeśli CeZ zmieni wymagania?", a: "eGabinet aktualizuje się automatycznie — zawsze zgodny z aktualnymi wymaganiami." },
      ],
    },
  },
  {
    id: "tax", label: "Konsultacja podatkowa (15 min/msc)", short: "Konsultacja podatkowa",
    category: "legal", icon: "📊",
    soloPrice: 99,
    desc: "Miesięczna konsultacja z doradcą podatkowym Tax Legal Beauty.",
    soloFeatures: ["15 min / miesiąc", "Doradca white-label TLB", "Rollower do 3 msc"],
    lpAdvantage: "GRATIS w cenie pakietu",
    inLP: true,
    landing: {
      longDesc: "Miesięczna konsultacja z doradcą podatkowym z kancelarii Tax Legal Beauty — dedykowanej branży medycznej. 15 minut na pytania o optymalizację, ZUS, rozliczenia roczne, lub interpretacje podatkowe.",
      partner: "Tax Legal Beauty · white-label dla Remedium",
      valueProps: [
        { title: "Doradca branżowy", desc: "TLB specjalizuje się w lekarzach JDG" },
        { title: "15 min co miesiąc", desc: "Wystarczy na pytanie + konkretną odpowiedź" },
        { title: "Rollower do 3 miesięcy", desc: "Nie wykorzystałeś? Kumuluje się" },
      ],
      includes: [
        { title: "15 minut rozmowy z doradcą", desc: "Slot miesięczny do wykorzystania kiedy chcesz" },
        { title: "Rollower do 3 miesięcy", desc: "Niewykorzystany czas kumuluje się, max 45 min" },
        { title: "Tematy: podatki, ZUS, optymalizacja", desc: "Pełen scope podatkowy lekarza" },
        { title: "Rezerwacja w panelu", desc: "Slot dostępny w 48h, bez telefonów" },
        { title: "Follow-up mailem", desc: "Konkluzje z rozmowy w pisemnej formie" },
      ],
      howItWorks: [
        { title: "Umawiasz rozmowę w panelu", desc: "Wybierasz dogodny slot z kalendarza doradcy" },
        { title: "Przygotowujesz pytania", desc: "Wysyłasz mailem z wyprzedzeniem dla oszczędności czasu" },
        { title: "Rozmowa 15 min", desc: "Video lub telefon, polski lub angielski" },
        { title: "Otrzymujesz pisemne podsumowanie", desc: "W ciągu 24h po rozmowie" },
      ],
      faq: [
        { q: "Czy to prawdziwy doradca podatkowy?", a: "Tak — Tax Legal Beauty to licencjonowana kancelaria doradztwa podatkowego, nie automat." },
        { q: "Co jeśli potrzebuję więcej niż 15 min?", a: "Możesz wykupić dodatkowy czas w panelu — stawka preferencyjna dla członków Klubu." },
        { q: "Czy obejmuje interpretacje indywidualne?", a: "Sam wniosek — nie. Doradca pomoże Ci go sformułować, a złożenie do US to dodatkowa usługa." },
      ],
    },
  },
  {
    id: "legal", label: "Bank odpowiedzi prawnych", short: "Bank odp. prawnych",
    category: "legal", icon: "⚖️",
    soloPrice: 49,
    desc: "AI-based baza odpowiedzi prawnych sygnowana przez kancelarię Tymiński.",
    soloFeatures: ["Top 50 pytań JDG", "Nowe pytania miesięcznie", "Sygnatura kancelarii"],
    lpAdvantage: "W cenie pakietu",
    inLP: true,
    landing: {
      longDesc: "Baza gotowych odpowiedzi na najczęstsze pytania prawne lekarzy prowadzących JDG — roszczenia pacjentów, RODO, umowy z klinikami, spory z NFZ. AI-przeszukiwana, ale każda odpowiedź sygnowana przez kancelarię Tymiński.",
      partner: "Kancelaria Tymiński · content partnership",
      valueProps: [
        { title: "50+ gotowych odpowiedzi", desc: "Top 50 pytań od lekarzy JDG" },
        { title: "Nowe pytania miesięcznie", desc: "Baza rośnie, dostajesz aktualizacje" },
        { title: "Podpisane przez kancelarię", desc: "Nie AI-dump — każda odpowiedź zweryfikowana" },
      ],
      includes: [
        { title: "Baza 50+ pytań i odpowiedzi", desc: "Kategorie: pacjent, klinika, NFZ, RODO, ZUS, skargi" },
        { title: "Wyszukiwarka AI", desc: "Zadajesz pytanie w języku naturalnym" },
        { title: "5 nowych pytań miesięcznie", desc: "Tematy inspirowane realnymi case'ami lekarzy" },
        { title: "Każda odpowiedź podpisana", desc: "Sygnatura kancelarii Tymiński — nie AI-hallucination" },
        { title: "Kontekst + odnośniki do ustaw", desc: "Pełne uzasadnienie prawne, nie tylko odpowiedź" },
      ],
      howItWorks: [
        { title: "Zadajesz pytanie w panelu", desc: "W języku naturalnym — nie musisz znać nomenklatury" },
        { title: "AI znajduje pasujące odpowiedzi", desc: "Rankingowane po podobieństwie" },
        { title: "Czytasz odpowiedź + uzasadnienie", desc: "Jeśli trzeba głębiej — upsell na konsultację z Tymińskim" },
      ],
      faq: [
        { q: "Czy AI może mylić?", a: "Sama baza odpowiedzi nie — każda odpowiedź jest pisana przez prawnika. AI tylko dopasowuje pytanie użytkownika do gotowej odpowiedzi." },
        { q: "Co jeśli mojego pytania nie ma w bazie?", a: "Zgłaszasz je — jeśli pojawi się u 3+ lekarzy, trafia do kolejki tworzenia odpowiedzi. Odpowiedź w 2-4 tygodnie." },
        { q: "Kiedy warto konsultować się bezpośrednio?", a: "Dla unikalnych case'ów, sporów sądowych, negocjacji umów — wtedy bank odpowiedzi nie wystarczy, potrzebna indywidualna konsultacja." },
      ],
    },
  },
  {
    id: "advInsur", label: "Doradca ubezpieczeniowy (per sesja)", short: "Doradca ubezp.",
    category: "legal", icon: "🧑‍💼",
    soloPrice: 150, priceUnit: "zł/sesja",
    desc: "Jednorazowa konsultacja — analiza polis, rekomendacja zakresów.",
    soloFeatures: ["60 min rozmowy", "Analiza dokumentów", "Pisemna rekomendacja"],
    lpAdvantage: "GRATIS + pełna analiza potrzeb + dedykowany opiekun",
    inLP: true,
    landing: {
      longDesc: "Konsultacja z doradcą ubezpieczeniowym specjalizującym się w polisach dla medyków. Przegląda Twoje obecne polisy, wskazuje luki, rekomenduje optymalny zakres. Jednorazowo (solo) lub w LP — gdzie masz dedykowanego opiekuna bez dopłat.",
      partner: "Remedium · wewnętrzny zespół doradców",
      valueProps: [
        { title: "60 min rozmowy", desc: "Video lub telefon, wnikliwa analiza" },
        { title: "Analiza obecnych polis", desc: "Pokazujemy luki w Twojej ochronie" },
        { title: "Pisemna rekomendacja", desc: "Konkretne wnioski mailem w 48h" },
      ],
      includes: [
        { title: "Analiza polis", desc: "OC, Lloyd's, podróżne, na życie — przegląd wszystkiego co masz" },
        { title: "Mapa ryzyk", desc: "Co Cię realnie zagraża jako lekarzowi" },
        { title: "Luki w ochronie", desc: "Wskazujemy konkretne scenariusze bez pokrycia" },
        { title: "Rekomendacja produktowa", desc: "Co kupić, co zrezygnować, co zmodyfikować" },
        { title: "Pisemne podsumowanie", desc: "Dokument PDF do decyzji na spokojnie" },
      ],
      howItWorks: [
        { title: "Rezerwujesz slot w panelu", desc: "Dostępność w 48h od zakupu" },
        { title: "Wysyłasz polisy do analizy", desc: "PDF lub zdjęcia, przez panel" },
        { title: "Rozmowa 60 min", desc: "Omówienie luk i rekomendacji" },
        { title: "Pisemne podsumowanie", desc: "W 48h po rozmowie" },
      ],
      faq: [
        { q: "Czy jesteście niezależni?", a: "Tak — doradcy pracują dla Remedium, nie pojedynczego ubezpieczyciela. Rekomendujemy co obiektywnie najlepsze dla lekarza." },
        { q: "Co z mOCą zamówienia po konsultacji?", a: "Możesz zamówić rekomendowane produkty bezpośrednio przez Klub — to nie jest warunek, ale często wygodniejsze." },
        { q: "Jak to działa w LP?", a: "W pakiecie LP masz tego samego doradcę przypisanego imiennie — bez limitów czasowych, zawsze w cenie." },
      ],
    },
  },
  {
    id: "advLeas", label: "Doradca leasingowy (per sesja)", short: "Doradca leas.",
    category: "legal", icon: "🚗",
    soloPrice: 120, priceUnit: "zł/sesja",
    desc: "Konsultacja z doradcą leasingowym LeaseLink — wybór, kalkulacja.",
    soloFeatures: ["45 min rozmowy", "Kalkulacja wariantów", "Rekomendacja produktu"],
    lpAdvantage: "GRATIS w cenie integracji LeaseLink",
    inLP: true,
    landing: {
      longDesc: "Rozmowa z doradcą leasingowym LeaseLink — pomoże wybrać finansowanie sprzętu medycznego, samochodu, laptopów, elektroniki. Kalkuluje warianty (leasing operacyjny vs finansowy, raty 0%), porównuje koszty. W pakiecie LP zero dopłat.",
      partner: "LeaseLink · dedykowany zespół dla medyków",
      valueProps: [
        { title: "45 min rozmowy", desc: "Wystarcza na 2-3 warianty finansowania" },
        { title: "Kalkulacja wariantów", desc: "Operacyjny vs finansowy vs raty 0%" },
        { title: "Rekomendacja produktu", desc: "Co wybrać do Twojego scenariusza" },
      ],
      includes: [
        { title: "Analiza potrzeb finansowania", desc: "Co chcesz kupić, na jak długo, jaki budżet" },
        { title: "Porównanie 3 wariantów", desc: "Leasing operacyjny, finansowy, raty bankowe" },
        { title: "Kalkulacja kosztów", desc: "Pełny koszt w okresie finansowania + podatki" },
        { title: "Rekomendacja produktu LeaseLink", desc: "Jeśli leasing to najlepsze rozwiązanie" },
        { title: "Pomoc w procedowaniu", desc: "Jeśli decydujesz się — asysta przy dokumentach" },
      ],
      howItWorks: [
        { title: "Określasz co chcesz kupić", desc: "Sprzęt medyczny, auto, laptop, rower — cokolwiek" },
        { title: "Doradca liczy warianty", desc: "3 scenariusze z rozbiciem kosztów" },
        { title: "Wybierasz i procedujesz", desc: "Jeśli LeaseLink — asystujemy przy wniosku" },
      ],
      faq: [
        { q: "Co jeśli raty bankowe są lepsze?", a: "Powiemy wprost — nasza rola to doradztwo, nie sprzedaż LeaseLink za wszelką cenę." },
        { q: "Czy obejmuje sprzęt używany?", a: "Tak — LeaseLink finansuje sprzęt używany dla medyków, szczególnie sprzęt stomatologiczny i diagnostyczny." },
        { q: "Jak działa prelimit LP?", a: "W pakiecie LP masz prelimit 87 000 zł dostępny od dnia 1 — doradca pomaga go efektywnie wykorzystać." },
      ],
    },
  },
  {
    id: "courses", label: "Kursy online (Medu)", short: "Kursy Medu",
    category: "medical", icon: "🎓",
    soloPrice: 69,
    desc: "Platforma kursów medycznych Medu — dostęp do biblioteki szkoleń.",
    soloFeatures: ["Dostęp do 200+ kursów", "Certyfikaty CME", "Aplikacja mobilna"],
    inLP: false,
    landing: {
      longDesc: "Platforma e-learningowa Medu — 200+ kursów medycznych z certyfikatami CME (Continuing Medical Education). Dostęp do biblioteki szkoleń ze wszystkich specjalizacji, mobilna aplikacja, aktualizacje miesięcznie.",
      partner: "Medu · oficjalny partner",
      valueProps: [
        { title: "200+ kursów", desc: "Wszystkie specjalizacje medyczne" },
        { title: "Certyfikaty CME", desc: "Akredytacja wymagana do punktów edukacyjnych" },
        { title: "Aplikacja mobilna", desc: "Nauka w drodze, offline mode" },
      ],
      includes: [
        { title: "Dostęp do 200+ kursów", desc: "Biblioteka rośnie miesięcznie o 5-10 nowych" },
        { title: "Certyfikaty CME po ukończeniu", desc: "Akredytowane punkty edukacyjne" },
        { title: "Aplikacja mobilna", desc: "Offline mode — oglądaj w drodze, synchronizacja po wifi" },
        { title: "Egzaminy sprawdzające", desc: "Po każdym kursie — dla uzyskania certyfikatu" },
        { title: "Konferencje online", desc: "Live'y z ekspertami, pytania do prelegentów" },
      ],
      howItWorks: [
        { title: "Aktywujesz konto Medu", desc: "Automatycznie przez Klub, bez osobnego loginu" },
        { title: "Wybierasz kursy", desc: "Z biblioteki lub wg ścieżek specjalizacyjnych" },
        { title: "Uczysz się + egzamin", desc: "Materiał wideo + test + certyfikat PDF" },
      ],
      faq: [
        { q: "Czy certyfikaty są uznawane przez NIL?", a: "Tak — Medu ma akredytację CME honorowaną przez Naczelną Izbę Lekarską." },
        { q: "Co z kursami premium?", a: "Standardowa subskrypcja to ~170 kursów. 30+ premium (np. z prof. Kowalskim) wymaga dopłaty." },
        { q: "Czy mogę przerywać i wracać?", a: "Tak — każdy kurs zapamiętuje postęp, możesz wracać w dowolnym momencie." },
      ],
    },
  },
];

// LP-exclusives — rzeczy których nie dostaniesz kupując solo.
// Pokazywane w momencie reveal (Level 2) jako dodatkowe argumenty za pakietem.
const LP_EXCLUSIVES = [
  { id: "negotiate", label: "Automatyczne negocjacje cen",      note: "Lloyd's −15% · OC −10% · klasa auto z NIL",                  icon: "📉" },
  { id: "advisor",   label: "Doradca przypisany imiennie",      note: "24/7 imienny opiekun, nie infolinia",                        icon: "👤" },
  { id: "leaselink", label: "Prelimit LeaseLink 87 000 zł",     note: "Od dnia 1 na PWZ · decyzja 30 sek · bez dokumentów",         icon: "💳" },
  { id: "bonus",     label: "Bonus aktywacyjny 1 000 zł",       note: "Jednorazowy bonus za aktywację inFakt",                      icon: "🎁" },
  { id: "aion",      label: "Konto AION firmowe co-branded",    note: "Zero opłat, kreator JDG, karta (wymaga addon inFakt)",       icon: "🏦" },
  { id: "zen",       label: "Karta ZEN co-branded",             note: "Wkrótce (Q3) · cashback, FX, karta w Twoim imieniu",         icon: "💎", comingSoon: true },
  { id: "priority",  label: "Priority support",                 note: "Gorąca linia · SLA 2h · dedykowany ticket",                  icon: "⚡" },
];

const LP_CORE_IDS = new Set(SERVICE_CATALOG.filter(s => s.inLP).map(s => s.id));

// Skrócone benefity LP per usługa — konkretny value prop zamiast generycznego "W LP"
// na kafelku w katalogu.
const LP_SERVICE_PERK_SHORT = {
  lloyds:   "rabat 15%",
  oc:       "rabat 10%",
  infakt:   "179 zł/mies. + 1000 zł bonus",
  wg:       "gratis",
  autenti:  "gratis",
  egabinet: "w cenie",
  tax:      "gratis",
  legal:    "w cenie",
  advInsur: "gratis + opiekun",
  advLeas:  "gratis",
};

// Suma solo-cen wszystkich LP-core usług — baza do kalkulacji savings vs pakiet.
const LP_ALL_SOLO_MONTHLY = SERVICE_CATALOG
  .filter(s => s.inLP)
  .reduce((sum, s) => sum + (s.soloPrice || 0), 0);

// ─── LIFE AREAS (Usługi 3 — ekosystem / gap analysis) ────────────────────────
// Obszary życia lekarza. Każdy ma 3 stany wg pokrycia:
//   covered  — wszystkie usługi w obszarze aktywne (lub obszar pokryty przez LP)
//   partial  — część usług aktywna
//   gap      — żadna usługa nie aktywna
//   soon     — obszar jeszcze nie obsługiwany (tylko placeholder)
//
// coveredByLP = true oznacza że LP automatycznie zapełnia obszar po aktywacji pakietu.
// lpOnly = true oznacza że obszar jest pokrywany wyłącznie przez LP (nie ma solo usług).
const LIFE_AREAS = [
  {
    id: "practice", label: "Praktyka lekarska", icon: "🩺",
    short: "Dokumentacja, podpis, narzędzia pracy",
    desc: "Wszystko czego potrzebujesz żeby przyjąć pacjenta i zachować dokumentację zgodnie z CeZ i NFZ.",
    serviceIds: ["oc", "egabinet", "autenti"],
    coveredByLP: true,
  },
  {
    id: "income", label: "Ochrona dochodu", icon: "💼",
    short: "Gdy nie możesz pracować",
    desc: "Ubezpieczenie przychodu na wypadek choroby, niezdolności lub wypadku — wypłata miesięczna do 24 miesięcy.",
    serviceIds: ["lloyds"],
    coveredByLP: true,
  },
  {
    id: "business", label: "Firma i księgowość", icon: "🏢",
    short: "JDG, rozliczenia, adres, konto",
    desc: "Pełna infrastruktura prowadzenia działalności gospodarczej — księgowość, adres rejestrowy, konto firmowe.",
    serviceIds: ["infakt", "wg"],
    coveredByLP: true,
  },
  {
    id: "advisory", label: "Doradztwo", icon: "🧑‍💼",
    short: "Podatkowe, prawne, ubezpieczeniowe",
    desc: "Dostęp do specjalistów — TLB, kancelaria Tymiński, doradcy Remedium. Konsultacje, analiza polis, odpowiedzi prawne.",
    serviceIds: ["tax", "legal", "advInsur", "advLeas"],
    coveredByLP: true,
  },
  {
    id: "financing", label: "Finansowanie i sprzęt", icon: "💳",
    short: "Leasing, konto firmowe, karta",
    desc: "Prelimit LeaseLink na PWZ (87 000 zł od dnia 1), konto AION, karta ZEN co-branded — dostępne tylko w pakiecie LP.",
    serviceIds: [],
    coveredByLP: true,
    lpOnly: true, // tylko LP
  },
  {
    id: "development", label: "Rozwój zawodowy", icon: "🎓",
    short: "Kursy CME, szkolenia, konferencje",
    desc: "Ciągła edukacja medyczna — kursy akredytowane, certyfikaty CME, biblioteki wiedzy.",
    serviceIds: ["courses"],
    coveredByLP: false,
  },
  {
    id: "travel", label: "Podróże", icon: "✈️",
    short: "Ochrona na wyjazdach",
    desc: "Roczna polisa podróżna — koszty leczenia, NNW, bagaż. Obejmuje konferencje i wyjazdy prywatne.",
    serviceIds: ["travel"],
    coveredByLP: false,
  },
  {
    id: "mobility", label: "Mobilność", icon: "🚗",
    short: "Auto, paliwo, myjnie, opłaty",
    desc: "Wszystko wokół samochodu służbowego — ubezpieczenie OC+AC, zniżki na paliwo, unlimited myjnia, opłaty autostradowe.",
    serviceIds: [],
    coveredByLP: false,
    suggestion: "Dostępny pakiet Lekarz Kierowca (129 zł/msc) w zakładce Usługi",
  },
  {
    id: "life", label: "Życie prywatne", icon: "💗",
    short: "Zdrowie rodziny, emerytura",
    desc: "Ubezpieczenia na życie, zdrowie rodziny, konto emerytalne. Moduł w przygotowaniu.",
    serviceIds: [],
    coveredByLP: false,
    comingSoon: true,
  },
];

// Helper: oblicz pokrycie obszaru na podstawie zbioru aktywnych usług + statusu LP
function computeAreaStatus(area, effectiveActive, lpActive) {
  if (area.comingSoon) return { status: "soon", activeIds: [], totalCount: 0, activeCount: 0 };
  if (area.lpOnly) {
    return {
      status: lpActive ? "covered" : "gap",
      activeIds: [],
      totalCount: 1, // traktujemy jako 1 "usługę" = LP prelimit
      activeCount: lpActive ? 1 : 0,
    };
  }
  const activeIds = area.serviceIds.filter(id => effectiveActive.has(id));
  const total = area.serviceIds.length;
  let status = "gap";
  if (total > 0 && activeIds.length === total) status = "covered";
  else if (activeIds.length > 0) status = "partial";
  return { status, activeIds, totalCount: total, activeCount: activeIds.length };
}

// ─── SECONDARY PACKAGES (strefa C) ───────────────────────────────────────────
const SECONDARY_PACKAGES = [
  {
    id: "driver", label: "Lekarz Kierowca", packagePrice: 129,
    desc: "Dla lekarzy dojeżdżających samochodem służbowym.",
    items: [
      { id: "car_ins", name: "Ubezpieczenie auta", price: 89, desc: "OC + AC w wynegocjowanej stawce" },
      { id: "carwash", name: "Myjnia unlimited",   price: 29, desc: "Unlimited wash w sieci myjni"    },
      { id: "fuel",    name: "Zniżki na paliwo",   price: 0,  desc: "−12 gr/l na stacjach BP"         },
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

const SERVICE_TOOLTIPS = {
  INSURANCE: "Chroni przed upadkiem i zalaniem\nObejmuje kradzież i rabunek\nNaprawa lub wymiana gratis\nBez udziału własnego\nOchrona przed przepięciami",
  OTHER: "Zwrot urządzenia już po 6 miesiącach\nBez opłat za wcześniejsze zakończenie\n14 dni na zgłoszenie rezygnacji\nMożliwość wymiany na inny produkt",
  WARRANTY: "Dłuższa gwarancja producenta\nSerwis door-to-door\nPriorytetowa obsługa zgłoszeń",
};

const PURCHASE_CATALOG = [
  {
    id: "devices", label: "Sprzęt i elektronika", color: "var(--color-secondary)",
    items: [
      { id: "iphone15", brand: "Apple",  model: "iPhone 15 Pro",      desc: "Smartfon · 256 GB · Tytan naturalny",     monthlyNet: 167.83, monthlyGross: 206.43, contractMonths: 12, emoji: "📱", badge: "Nowość",
        sellPrice: 5499, vat: 23, categoryId: "smartphones", productSellType: "PRODUCT_HERO",
        pricing: [
          { numberOfMonths: 12, monthPrice: 167.83 },
          { numberOfMonths: 24, monthPrice: 97.42 },
          { numberOfMonths: 36, monthPrice: 72.15 },
        ],
        additionalServices: [
          { id: 1, name: "Safe Up", serviceType: "INSURANCE", b2bAmount: 12.99, b2cAmount: 15.98, description: "Ochrona przed uszkodzeniem i kradzieżą", tooltip: "Pełna ochrona urządzenia obejmująca:\n• Uszkodzenia mechaniczne (upadek, zalanie)\n• Kradzież z włamaniem i rabunek\n• Przepięcia elektryczne\n• Bezpłatna naprawa lub wymiana\n• Brak udziału własnego", included: true },
          { id: 2, name: "Flex — wcześniejszy zwrot", serviceType: "OTHER", serviceCustomType: "FLEX", b2bAmount: 8.50, b2cAmount: 10.46, description: "Możliwość zwrotu po 6 miesiącach", tooltip: "Elastyczne zakończenie umowy:\n• Zwrot urządzenia po min. 6 miesiącach\n• Bez dodatkowych opłat za wcześniejsze zakończenie\n• 14 dni na zgłoszenie rezygnacji\n• Możliwość wymiany na inny produkt", included: false },
        ],
        photo: "zdjecia-produktow/iphone15-nat-front.jpg",
        images: [
          { url: "zdjecia-produktow/iphone15-nat-front.jpg", label: "Przód" },
          { url: "zdjecia-produktow/iphone15-nat-back.jpg", label: "Tył" },
          { url: "zdjecia-produktow/iphone15-nat-side.jpg", label: "Bok" },
        ],
        fullDesc: "iPhone 15 Pro z chipem A17 Pro. Tytanowa konstrukcja, najlżejszy iPhone Pro w historii. Kamera 48 MP z 5-krotnym zoomem optycznym. Przycisk Czynność do szybkiego dostępu do ulubionych funkcji. USB-C z obsługą USB 3.",
        variants: [
          { group: "Pamięć wbudowana", options: [
            { label: "128 GB", diff: -22, default: false, clientProductId: "iphone15-128" },
            { label: "256 GB", diff: 0, default: true, clientProductId: "iphone15-256" },
            { label: "512 GB", diff: 35, clientProductId: "iphone15-512" },
            { label: "1 TB", diff: 78, clientProductId: "iphone15-1tb" },
          ]},
          { group: "Kolor obudowy", isColor: true, options: [
            { label: "Tytan naturalny", diff: 0, default: true, colorHex: "#F5F0EB" },
            { label: "Tytan niebieski", diff: 0, colorHex: "#C8D4E3" },
            { label: "Tytan biały", diff: 0, colorHex: "#F0F0F0" },
            { label: "Tytan czarny", diff: 0, colorHex: "#3A3A3C" },
          ]},
        ],
        specs: [
          { label: "Wyświetlacz", value: '6,1" Super Retina XDR OLED, 2556×1179' },
          { label: "Procesor", value: "Apple A17 Pro (3 nm)" },
          { label: "Pamięć RAM", value: "8 GB" },
          { label: "Pamięć wewnętrzna", value: "256 GB" },
          { label: "Aparat główny", value: "48 MP + 12 MP + 12 MP" },
          { label: "Aparat przedni", value: "12 MP TrueDepth" },
          { label: "Bateria", value: "3274 mAh, MagSafe, Qi2" },
          { label: "System", value: "iOS 17" },
          { label: "5G", value: "Tak" },
          { label: "Złącze", value: "USB-C (USB 3)" },
          { label: "Waga", value: "187 g" },
        ],
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "ipad",     brand: "Apple",  model: "iPad Pro M4",        desc: "Tablet · 11\" · idealny do gabinetu",     monthlyNet: 152.42, monthlyGross: 187.48, contractMonths: 12, emoji: "📲", badge: "Nowość",
        sellPrice: 4999, vat: 23, categoryId: "tablets", productSellType: "PRODUCT_HERO",
        pricing: [
          { numberOfMonths: 12, monthPrice: 152.42 },
          { numberOfMonths: 24, monthPrice: 88.51 },
          { numberOfMonths: 36, monthPrice: 65.80 },
        ],
        additionalServices: [
          { id: 1, name: "Safe Up", serviceType: "INSURANCE", b2bAmount: 11.49, b2cAmount: 14.13, description: "Ochrona przed uszkodzeniem i kradzieżą", included: true },
          { id: 2, name: "Flex — wcześniejszy zwrot", serviceType: "OTHER", serviceCustomType: "FLEX", b2bAmount: 7.80, b2cAmount: 9.59, description: "Możliwość zwrotu po 6 miesiącach", included: false },
        ],
        photo: "zdjecia-produktow/ipad-czarny-front.jpg",
        images: [
          { url: "zdjecia-produktow/ipad-czarny-front.jpg", label: "Przód" },
          { url: "zdjecia-produktow/ipad-srebrny-front.jpg", label: "Srebrny" },
        ],
        fullDesc: "Najcieńszy produkt Apple w historii. Chip M4 zapewnia ogromną moc w ultrasmukłej obudowie. Ekran Ultra Retina XDR z technologią tandem OLED. Idealny do dokumentacji medycznej, notatek i wideokonferencji.",
        variants: [
          { group: "Przekątna ekranu", options: [
            { label: '11"', diff: 0, default: true },
            { label: '13"', diff: 42 },
          ]},
          { group: "Pamięć wbudowana", options: [
            { label: "256 GB", diff: 0, default: true },
            { label: "512 GB", diff: 28 },
            { label: "1 TB", diff: 65 },
          ]},
          { group: "Kolor", isColor: true, options: [
            { label: "Gwiezdna czerń", diff: 0, default: true, colorHex: "#2C2C2E" },
            { label: "Srebrny", diff: 0, colorHex: "#E8E8ED" },
          ]},
        ],
        specs: [
          { label: "Wyświetlacz", value: '11" Ultra Retina XDR, tandem OLED' },
          { label: "Procesor", value: "Apple M4" },
          { label: "Pamięć RAM", value: "8 GB" },
          { label: "Pamięć wewnętrzna", value: "256 GB" },
          { label: "Aparat", value: "12 MP szerokokątny" },
          { label: "Face ID", value: "Tak" },
          { label: "Złącze", value: "USB-C (Thunderbolt)" },
          { label: "Waga", value: "444 g" },
        ],
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "macbook",  brand: "Apple",  model: "MacBook Air M3",     desc: "Laptop · 15\" · 16 GB RAM",               monthlyNet: 206.25, monthlyGross: 253.69, contractMonths: 12, emoji: "💻",
        sellPrice: 6799, vat: 23, categoryId: "laptops", productSellType: "PRODUCT_HERO",
        pricing: [
          { numberOfMonths: 12, monthPrice: 206.25 },
          { numberOfMonths: 24, monthPrice: 119.73 },
          { numberOfMonths: 36, monthPrice: 88.95 },
        ],
        additionalServices: [
          { id: 1, name: "Safe Up", serviceType: "INSURANCE", b2bAmount: 14.99, b2cAmount: 18.44, description: "Ochrona przed uszkodzeniem i kradzieżą", included: true },
          { id: 2, name: "Flex — wcześniejszy zwrot", serviceType: "OTHER", serviceCustomType: "FLEX", b2bAmount: 9.90, b2cAmount: 12.18, description: "Możliwość zwrotu po 6 miesiącach", included: false },
        ],
        photo: "zdjecia-produktow/macbook-szary-front.jpg",
        images: [
          { url: "zdjecia-produktow/macbook-szary-front.jpg", label: "Północ" },
          { url: "zdjecia-produktow/macbook-srebrny-front.jpg", label: "Srebrny" },
          { url: "zdjecia-produktow/macbook-starlight-front.jpg", label: "Starlight" },
        ],
        fullDesc: "MacBook Air 15 cali z chipem M3. Niesamowicie cienki i lekki, z 18 godzinami pracy na baterii. 16 GB RAM i szybki dysk SSD. Idealny do pracy w gabinecie i na konferencjach.",
        variants: [
          { group: "Przekątna ekranu", options: [
            { label: '13,6"', diff: -32 },
            { label: '15,3"', diff: 0, default: true },
          ]},
          { group: "Pamięć RAM", options: [
            { label: "16 GB", diff: 0, default: true },
            { label: "24 GB", diff: 28 },
          ]},
          { group: "Dysk SSD", options: [
            { label: "256 GB", diff: -20 },
            { label: "512 GB", diff: 0, default: true },
            { label: "1 TB", diff: 28 },
          ]},
          { group: "Kolor", isColor: true, options: [
            { label: "Północ", diff: 0, default: true, colorHex: "#2C3E50" },
            { label: "Księżycowa poświata", diff: 0, colorHex: "#F5F0EB" },
            { label: "Galaktyczny szary", diff: 0, colorHex: "#8E8E93" },
            { label: "Księżycowy błękit", diff: 0, colorHex: "#B8CCE0" },
          ]},
        ],
        specs: [
          { label: "Wyświetlacz", value: '15,3" Liquid Retina, 2880×1864' },
          { label: "Procesor", value: "Apple M3 (8-core CPU, 10-core GPU)" },
          { label: "Pamięć RAM", value: "16 GB" },
          { label: "Dysk SSD", value: "512 GB" },
          { label: "Bateria", value: "Do 18 godz." },
          { label: "Kamera", value: "1080p FaceTime HD" },
          { label: "Złącza", value: "2× USB-C, MagSafe, mini-jack" },
          { label: "Waga", value: "1,51 kg" },
        ],
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "sony",     brand: "Sony",   model: "WH-1000XM5",        desc: "Słuchawki · ANC · na dyżury i do nauki",  monthlyNet: 34.92, monthlyGross: 42.95, contractMonths: 12, emoji: "🎧",
        sellPrice: 1499, vat: 23, categoryId: "audio", productSellType: "PRODUCT_HERO",
        pricing: [
          { numberOfMonths: 12, monthPrice: 34.92 },
          { numberOfMonths: 24, monthPrice: 20.28 },
        ],
        additionalServices: [
          { id: 1, name: "Safe Up", serviceType: "INSURANCE", b2bAmount: 4.99, b2cAmount: 6.14, description: "Ochrona przed uszkodzeniem i kradzieżą", included: true },
        ],
        photo: "zdjecia-produktow/sony-xm5-front.jpg",
        images: [
          { url: "zdjecia-produktow/sony-xm5-front.jpg", label: "Przód" },
          { url: "zdjecia-produktow/sony-xm5-side.jpg", label: "Bok" },
          { url: "zdjecia-produktow/sony-xm5-folded.jpg", label: "Złożone" },
        ],
        fullDesc: "Flagowe słuchawki z wiodącą redukcją szumów. 8 mikrofonów i 2 procesory sterujące ANC. 30 godzin pracy na baterii. Składana, ultralekka konstrukcja. Idealne na długie dyżury.",
        specs: [
          { label: "Typ", value: "Nauszne, bezprzewodowe" },
          { label: "ANC", value: "Tak, adaptacyjne (8 mikrofonów)" },
          { label: "Bateria", value: "30 godz. (ANC włączone)" },
          { label: "Ładowanie", value: "USB-C, 3 min = 3 godz. muzyki" },
          { label: "Bluetooth", value: "5.2, multipoint" },
          { label: "Kodeki", value: "LDAC, AAC, SBC" },
          { label: "Waga", value: "250 g" },
        ],
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "monitor",  brand: "Dell",   model: "UltraSharp U2724D", desc: "Monitor · 27\" · 4K IPS · USB-C",         monthlyNet: 76.25, monthlyGross: 93.79, contractMonths: 12, emoji: "🖥️",
        sellPrice: 2499, vat: 23, categoryId: "monitors", productSellType: "PRODUCT_HERO",
        pricing: [
          { numberOfMonths: 12, monthPrice: 76.25 },
          { numberOfMonths: 24, monthPrice: 44.28 },
          { numberOfMonths: 36, monthPrice: 32.90 },
        ],
        additionalServices: [
          { id: 1, name: "Safe Up", serviceType: "INSURANCE", b2bAmount: 6.99, b2cAmount: 8.60, description: "Ochrona przed uszkodzeniem i kradzieżą", included: true },
        ],
        photo: "zdjecia-produktow/dell-u2724d-front.jpg",
        images: [
          { url: "zdjecia-produktow/dell-u2724d-front.jpg", label: "Przód" },
          { url: "zdjecia-produktow/dell-u2724d-side.jpg", label: "Bok" },
        ],
        fullDesc: "Monitor 4K UHD z matrycą IPS Black. 98% pokrycia DCI-P3. Wbudowany hub USB-C z 90W Power Delivery — jedno złącze do laptopa. Idealny do diagnostyki obrazowej i pracy z dokumentacją.",
        specs: [
          { label: "Przekątna", value: '27"' },
          { label: "Rozdzielczość", value: "3840 × 2160 (4K UHD)" },
          { label: "Matryca", value: "IPS Black" },
          { label: "Pokrycie barw", value: "98% DCI-P3, 100% sRGB" },
          { label: "USB-C PD", value: "90W" },
          { label: "Złącza", value: "USB-C, HDMI, DP, 5× USB-A" },
          { label: "Regulacja", value: "Wysokość, pochylenie, obrót, pivot" },
        ],
        delivery: "Wysyłka w 1–2 dni robocze",
      },
      // ── Produkty ze sklepu klubmedyka.store ──
      { id: "iphone17promax", brand: "Apple", model: "iPhone 17 Pro Max", desc: "Smartfon · 256 GB · Głębinowy błękit", monthlyNet: 181.96, monthlyGross: 223.81, contractMonths: 12, emoji: "📱", badge: "Nowość",
        sellPrice: 5999, vat: 23, categoryId: "smartphones", productSellType: "PRODUCT_HERO",
        pricing: [{ numberOfMonths: 12, monthPrice: 181.96 }, { numberOfMonths: 24, monthPrice: 105.63 }, { numberOfMonths: 36, monthPrice: 78.45 }],
        additionalServices: [{ id: 1, name: "Safe Up", serviceType: "INSURANCE", b2bAmount: 13.99, b2cAmount: 17.21, description: "Ochrona przed uszkodzeniem i kradzieżą", included: true }, { id: 2, name: "Flex — wcześniejszy zwrot", serviceType: "OTHER", serviceCustomType: "FLEX", b2bAmount: 8.50, b2cAmount: 10.46, description: "Możliwość zwrotu po 6 miesiącach", included: false }],
        photo: "https://klubmedyka.store/8275-home_default/apple-iphone-17-pro-max-256gb-glebinowy-blekit.jpg",
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "iphone17pro", brand: "Apple", model: "iPhone 17 Pro", desc: "Smartfon · 256 GB · Kosmiczny pomarańcz", monthlyNet: 167.83, monthlyGross: 206.43, contractMonths: 12, emoji: "📱",
        sellPrice: 5499, vat: 23, categoryId: "smartphones", productSellType: "PRODUCT_HERO",
        pricing: [{ numberOfMonths: 12, monthPrice: 167.83 }, { numberOfMonths: 24, monthPrice: 97.42 }, { numberOfMonths: 36, monthPrice: 72.15 }],
        additionalServices: [{ id: 1, name: "Safe Up", serviceType: "INSURANCE", b2bAmount: 12.99, b2cAmount: 15.98, description: "Ochrona przed uszkodzeniem i kradzieżą", included: true }],
        photo: "https://klubmedyka.store/8231-home_default/apple-iphone-17-pro-256gb-kosmiczny-pomarancz.jpg",
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "iphone17", brand: "Apple", model: "iPhone 17", desc: "Smartfon · 256 GB · Szałwia", monthlyNet: 116.99, monthlyGross: 143.90, contractMonths: 12, emoji: "📱",
        sellPrice: 3799, vat: 23, categoryId: "smartphones", productSellType: "PRODUCT_HERO",
        pricing: [{ numberOfMonths: 12, monthPrice: 116.99 }, { numberOfMonths: 24, monthPrice: 67.92 }, { numberOfMonths: 36, monthPrice: 50.45 }],
        additionalServices: [{ id: 1, name: "Safe Up", serviceType: "INSURANCE", b2bAmount: 8.99, b2cAmount: 11.06, description: "Ochrona przed uszkodzeniem i kradzieżą", included: true }],
        photo: "https://klubmedyka.store/8175-home_default/apple-iphone-17-256gb-szalwia.jpg",
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "galaxy-z-fold7", brand: "Samsung", model: "Galaxy Z Fold7", desc: "Składany · 12/256 GB · Srebrny", monthlyNet: 264.58, monthlyGross: 325.43, contractMonths: 12, emoji: "📱", badge: "Nowość",
        sellPrice: 8699, vat: 23, categoryId: "smartphones", productSellType: "PRODUCT_HERO",
        pricing: [{ numberOfMonths: 12, monthPrice: 264.58 }, { numberOfMonths: 24, monthPrice: 153.58 }, { numberOfMonths: 36, monthPrice: 114.08 }],
        additionalServices: [{ id: 1, name: "Safe Up", serviceType: "INSURANCE", b2bAmount: 18.99, b2cAmount: 23.36, description: "Ochrona przed uszkodzeniem i kradzieżą", included: true }, { id: 2, name: "Flex — wcześniejszy zwrot", serviceType: "OTHER", serviceCustomType: "FLEX", b2bAmount: 12.50, b2cAmount: 15.38, description: "Możliwość zwrotu po 6 miesiącach", included: false }],
        photo: "https://klubmedyka.store/7972-home_default/samsung-galaxy-z-fold7-12-256gb-srebrny.jpg",
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "galaxy-s25-ultra", brand: "Samsung", model: "Galaxy S25 Ultra 5G", desc: "Smartfon · 12/256 GB · Tytan czarny", monthlyNet: 176.20, monthlyGross: 216.73, contractMonths: 12, emoji: "📱",
        sellPrice: 5799, vat: 23, categoryId: "smartphones", productSellType: "PRODUCT_HERO",
        pricing: [{ numberOfMonths: 12, monthPrice: 176.20 }, { numberOfMonths: 24, monthPrice: 102.30 }, { numberOfMonths: 36, monthPrice: 75.98 }],
        additionalServices: [{ id: 1, name: "Safe Up", serviceType: "INSURANCE", b2bAmount: 13.49, b2cAmount: 16.59, description: "Ochrona przed uszkodzeniem i kradzieżą", included: true }],
        photo: "https://klubmedyka.store/6176-home_default/samsung-galaxy-s25-ultra-5g-12256gb-tytan-czarny.jpg",
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "galaxy-z-flip6", brand: "Samsung", model: "Galaxy Z Flip 6 5G", desc: "Składany · 12/256 GB · Miętowy", monthlyNet: 156.22, monthlyGross: 192.15, contractMonths: 12, emoji: "📱",
        sellPrice: 5099, vat: 23, categoryId: "smartphones", productSellType: "PRODUCT_HERO",
        pricing: [{ numberOfMonths: 12, monthPrice: 156.22 }, { numberOfMonths: 24, monthPrice: 90.71 }],
        additionalServices: [{ id: 1, name: "Safe Up", serviceType: "INSURANCE", b2bAmount: 11.99, b2cAmount: 14.75, description: "Ochrona przed uszkodzeniem i kradzieżą", included: true }],
        photo: "https://klubmedyka.store/7257-home_default/samsung-galaxy-z-flip-6-5g-12-256gb-szary.jpg",
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "macbook-pro-m4", brand: "Apple", model: "MacBook Pro 14\" M4", desc: "Laptop · 16 GB RAM · 512 GB SSD", monthlyNet: 236.07, monthlyGross: 290.37, contractMonths: 12, emoji: "💻", badge: "Nowość",
        sellPrice: 7799, vat: 23, categoryId: "laptops", productSellType: "PRODUCT_HERO",
        pricing: [{ numberOfMonths: 12, monthPrice: 236.07 }, { numberOfMonths: 24, monthPrice: 137.05 }, { numberOfMonths: 36, monthPrice: 101.82 }],
        additionalServices: [{ id: 1, name: "Safe Up", serviceType: "INSURANCE", b2bAmount: 16.99, b2cAmount: 20.90, description: "Ochrona przed uszkodzeniem i kradzieżą", included: true }, { id: 2, name: "Flex — wcześniejszy zwrot", serviceType: "OTHER", serviceCustomType: "FLEX", b2bAmount: 11.50, b2cAmount: 14.15, description: "Możliwość zwrotu po 6 miesiącach", included: false }],
        photo: "https://klubmedyka.store/5658-home_default/macbook-pro-14-m4-16gb-ram-512gb-ssd-srebrny.jpg",
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "macbook-pro-16-m4pro", brand: "Apple", model: "MacBook Pro 16\" M4 Pro", desc: "Laptop · 24 GB RAM · 512 GB SSD", monthlyNet: 378.61, monthlyGross: 465.69, contractMonths: 12, emoji: "💻",
        sellPrice: 12499, vat: 23, categoryId: "laptops", productSellType: "PRODUCT_HERO",
        pricing: [{ numberOfMonths: 12, monthPrice: 378.61 }, { numberOfMonths: 24, monthPrice: 219.80 }, { numberOfMonths: 36, monthPrice: 163.29 }],
        additionalServices: [{ id: 1, name: "Safe Up", serviceType: "INSURANCE", b2bAmount: 24.99, b2cAmount: 30.74, description: "Ochrona przed uszkodzeniem i kradzieżą", included: true }, { id: 2, name: "Flex — wcześniejszy zwrot", serviceType: "OTHER", serviceCustomType: "FLEX", b2bAmount: 18.50, b2cAmount: 22.76, description: "Możliwość zwrotu po 6 miesiącach", included: false }],
        photo: "https://klubmedyka.store/5666-home_default/macbook-pro-16-m4-pro-24gb-ram-512gb-ssd-srebrny.jpg",
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "ipad-air-m3", brand: "Apple", model: "iPad Air M3 11\"", desc: "Tablet · 256 GB · Wi-Fi", monthlyNet: 99.23, monthlyGross: 122.05, contractMonths: 12, emoji: "📲",
        sellPrice: 3249, vat: 23, categoryId: "tablets", productSellType: "PRODUCT_HERO",
        pricing: [{ numberOfMonths: 12, monthPrice: 99.23 }, { numberOfMonths: 24, monthPrice: 57.62 }],
        additionalServices: [{ id: 1, name: "Safe Up", serviceType: "INSURANCE", b2bAmount: 7.49, b2cAmount: 9.21, description: "Ochrona przed uszkodzeniem i kradzieżą", included: true }],
        photo: "https://klubmedyka.store/7889-home_default/tablet-apple-ipad-pro-2024-11-m4-256gb-wi-fi-srebrny.jpg",
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "apple-watch-11", brand: "Apple", model: "Watch Series 11", desc: "Smartwatch · GPS · 46 mm · Srebrny", monthlyNet: 63.32, monthlyGross: 77.88, contractMonths: 12, emoji: "⌚",
        sellPrice: 2099, vat: 23, categoryId: "wearables", productSellType: "PRODUCT_HERO",
        pricing: [{ numberOfMonths: 12, monthPrice: 63.32 }, { numberOfMonths: 24, monthPrice: 36.76 }],
        additionalServices: [{ id: 1, name: "Safe Up", serviceType: "INSURANCE", b2bAmount: 5.49, b2cAmount: 6.75, description: "Ochrona przed uszkodzeniem i kradzieżą", included: true }],
        photo: "https://klubmedyka.store/8389-home_default/apple-watch-11-gps-46mm-koperta-z-aluminium-srebrny-pasek-sportowy-ml.jpg",
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "apple-watch-ultra3", brand: "Apple", model: "Watch Ultra 3", desc: "Smartwatch · GPS+Cellular · 49 mm · Tytan", monthlyNet: 111.34, monthlyGross: 136.95, contractMonths: 12, emoji: "⌚", badge: "Premium",
        sellPrice: 3699, vat: 23, categoryId: "wearables", productSellType: "PRODUCT_HERO",
        pricing: [{ numberOfMonths: 12, monthPrice: 111.34 }, { numberOfMonths: 24, monthPrice: 64.63 }],
        additionalServices: [{ id: 1, name: "Safe Up", serviceType: "INSURANCE", b2bAmount: 8.99, b2cAmount: 11.06, description: "Ochrona przed uszkodzeniem i kradzieżą", included: true }],
        photo: "https://klubmedyka.store/8335-home_default/apple-watch-ultra-3-gps-cellular-49mm-koperta-tytanowa-naturalny-opaska-trail-ml.jpg",
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "ps5-digital", brand: "Sony", model: "PlayStation 5 Digital Slim", desc: "Konsola · 1 TB · bez napędu", monthlyNet: 73.57, monthlyGross: 90.49, contractMonths: 12, emoji: "🎮",
        sellPrice: 2399, vat: 23, categoryId: "gaming", productSellType: "PRODUCT_HERO",
        pricing: [{ numberOfMonths: 12, monthPrice: 73.57 }, { numberOfMonths: 24, monthPrice: 42.72 }],
        additionalServices: [{ id: 1, name: "Safe Up", serviceType: "INSURANCE", b2bAmount: 6.49, b2cAmount: 7.98, description: "Ochrona przed uszkodzeniem i kradzieżą", included: true }],
        photo: "https://klubmedyka.store/5874-home_default/konsola-sony-playstation-5-digital-slim-d-chassis-1tb.jpg",
        delivery: "Wysyłka w 1–2 dni robocze",
      },
      { id: "nintendo-switch2", brand: "Nintendo", model: "Switch 2", desc: "Konsola przenośna · nowa generacja", monthlyNet: 70.72, monthlyGross: 86.99, contractMonths: 12, emoji: "🎮", badge: "Nowość",
        sellPrice: 2299, vat: 23, categoryId: "gaming", productSellType: "PRODUCT_HERO",
        pricing: [{ numberOfMonths: 12, monthPrice: 70.72 }, { numberOfMonths: 24, monthPrice: 41.06 }],
        additionalServices: [{ id: 1, name: "Safe Up", serviceType: "INSURANCE", b2bAmount: 5.99, b2cAmount: 7.37, description: "Ochrona przed uszkodzeniem i kradzieżą", included: true }],
        photo: "https://klubmedyka.store/7636-home_default/nintendo-switch-oled-white.jpg",
        delivery: "Wysyłka w 1–2 dni robocze",
      },
      { id: "gopro-hero13", brand: "GoPro", model: "HERO 13 Black", desc: "Kamera sportowa · 5.3K · Wi-Fi", monthlyNet: 55.04, monthlyGross: 67.70, contractMonths: 12, emoji: "📷",
        sellPrice: 1799, vat: 23, categoryId: "cameras", productSellType: "PRODUCT_HERO",
        pricing: [{ numberOfMonths: 12, monthPrice: 55.04 }, { numberOfMonths: 24, monthPrice: 31.95 }],
        additionalServices: [{ id: 1, name: "Safe Up", serviceType: "INSURANCE", b2bAmount: 4.49, b2cAmount: 5.52, description: "Ochrona przed uszkodzeniem i kradzieżą", included: true }],
        photo: "https://klubmedyka.store/7899-home_default/kamera-sportowa-gopro-hero-13-black.jpg",
        delivery: "Wysyłka w 1–2 dni robocze",
      },
      { id: "garmin-fenix8", brand: "Garmin", model: "Fenix 8 47mm AMOLED", desc: "Smartwatch · Szafirowe szkło · Tytanowy", monthlyNet: 142.82, monthlyGross: 175.67, contractMonths: 12, emoji: "⌚",
        sellPrice: 4699, vat: 23, categoryId: "wearables", productSellType: "PRODUCT_HERO",
        pricing: [{ numberOfMonths: 12, monthPrice: 142.82 }, { numberOfMonths: 24, monthPrice: 82.90 }, { numberOfMonths: 36, monthPrice: 61.44 }],
        additionalServices: [
          { id: 1, name: "Safe Up", serviceType: "INSURANCE", b2bAmount: 9.99, b2cAmount: 12.29, description: "Ochrona przed uszkodzeniem i kradzieżą", included: true },
          { id: 2, name: "Flex — wcześniejszy zwrot", serviceType: "OTHER", serviceCustomType: "FLEX", b2bAmount: 7.50, b2cAmount: 9.23, description: "Możliwość zwrotu po 6 miesiącach", included: false },
        ],
        photo: "https://klubmedyka.store/7744-home_default/smartwatch-garmin-fenix-8-43-mm-amoled-srebrny-z-paskiem-silikonowym-w-kolorze-whitestone.jpg",
        delivery: "Wysyłka w 1–2 dni robocze",
      },
      { id: "xiaomi-vacuum-x20", brand: "Xiaomi", model: "Robot Vacuum X20+", desc: "Robot sprzątający · stacja dokująca", monthlyNet: 76.39, monthlyGross: 93.96, contractMonths: 12, emoji: "🤖",
        sellPrice: 2499, vat: 23, categoryId: "home", productSellType: "PRODUCT_HERO",
        pricing: [{ numberOfMonths: 12, monthPrice: 76.39 }, { numberOfMonths: 24, monthPrice: 44.35 }],
        additionalServices: [{ id: 1, name: "Safe Up", serviceType: "INSURANCE", b2bAmount: 5.99, b2cAmount: 7.37, description: "Ochrona przed uszkodzeniem i kradzieżą", included: true }],
        photo: "https://klubmedyka.store/7631-home_default/xiaomi-robot-vacuum-x20-max-czarny.jpg",
        delivery: "Wysyłka w 1–2 dni robocze",
      },
      { id: "macbook-air-m4", brand: "Apple", model: "MacBook Air 15\" M4", desc: "Laptop · 32 GB RAM · 1 TB SSD", monthlyNet: 270.93, monthlyGross: 333.24, contractMonths: 12, emoji: "💻", badge: "Nowość",
        sellPrice: 8999, vat: 23, categoryId: "laptops", productSellType: "PRODUCT_HERO",
        pricing: [{ numberOfMonths: 12, monthPrice: 270.93 }, { numberOfMonths: 24, monthPrice: 157.24 }, { numberOfMonths: 36, monthPrice: 116.52 }],
        additionalServices: [
          { id: 1, name: "Safe Up", serviceType: "INSURANCE", b2bAmount: 14.99, b2cAmount: 18.44, description: "Ochrona przed uszkodzeniem i kradzieżą", included: true },
          { id: 2, name: "Flex — wcześniejszy zwrot", serviceType: "OTHER", serviceCustomType: "FLEX", b2bAmount: 10.50, b2cAmount: 12.92, description: "Możliwość zwrotu po 6 miesiącach", included: false },
        ],
        variants: [
          { group: "Pamięć RAM", options: [
            { label: "16 GB", diff: -35, clientProductId: "macbook-air-m4-16" },
            { label: "32 GB", diff: 0, default: true, clientProductId: "macbook-air-m4-32" },
          ]},
          { group: "Dysk SSD", options: [
            { label: "512 GB", diff: -40, clientProductId: "macbook-air-m4-512" },
            { label: "1 TB", diff: 0, default: true, clientProductId: "macbook-air-m4-1tb" },
            { label: "2 TB", diff: 55, clientProductId: "macbook-air-m4-2tb" },
          ]},
          { group: "Kolor", isColor: true, options: [
            { label: "Srebrny", colorHex: "#C0C0C0", default: true },
            { label: "Gwiezdna szarość", colorHex: "#4A4A4A" },
            { label: "Księżycowa poświata", colorHex: "#F5E6D3" },
            { label: "Północny błękit", colorHex: "#5B7B8F" },
          ]},
        ],
        photo: "https://klubmedyka.store/7952-home_default/apple-macbook-air-15-m4-10-core-cpu-10-core-gpu-32gb-1tb-ssd-2025-srebrny.jpg",
        delivery: "Wysyłka w 1 dzień roboczy",
      },
    ],
  },
  {
    id: "entertainment", label: "Rozrywka", color: "var(--color-secondary)",
    items: [
      { id: "cinema-imax",    brand: "Cinema City",  model: "Seans IMAX",             desc: "IMAX · Dolby Atmos · dowolny film",             price: "39 zł",     priceOld: "52 zł",  priceNote: null, emoji: "🎞️", photo: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=600&h=450&fit=crop", badge: "Premium" },
    ],
  },
];

const CARS_CATALOG = [
  { id: "glc", brand: "Mercedes-Benz", model: "GLC Coupe 220 d mHEV", desc: "SUV · diesel · wynajem długoterminowy", price: "2 850 zł/mies.", priceOld: "3 120 zł/mies.", priceNote: "Rata netto", emoji: "🚗", photo: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=450&fit=crop",
    specs: { fuel: "Diesel mHEV", engine: "2.0 L 4-cyl turbo", power: "197 KM", torque: "440 Nm", transmission: "9G-TRONIC", drive: "4MATIC", acceleration: "8,0 s (0–100)", topSpeed: "217 km/h", consumption: "6,2 L/100 km", co2: "163 g/km", trunk: "491 L", seats: 5, year: 2025, type: "Wynajem d\u0142ugoterminowy", duration: "36 mies.", mileage: "20 000 km/rok" } },
  { id: "bmw3", brand: "BMW", model: "320i M Sport", desc: "Sedan · benzyna · leasing 36 mies.", price: "2 450 zł/mies.", priceOld: null, priceNote: "Rata netto", emoji: "🏎️", photo: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=450&fit=crop",
    specs: { fuel: "Benzyna", engine: "2.0 L 4-cyl turbo", power: "184 KM", torque: "300 Nm", transmission: "Steptronic 8-bieg.", drive: "Tylny (RWD)", acceleration: "7,1 s (0–100)", topSpeed: "235 km/h", consumption: "6,8 L/100 km", co2: "154 g/km", trunk: "480 L", seats: 5, year: 2025, type: "Leasing", duration: "36 mies.", mileage: "30 000 km/rok" } },
  { id: "tesla3", brand: "Tesla", model: "Model 3 Long Range", desc: "Elektryczny · 600 km zasięgu", price: "2 100 zł/mies.", priceOld: "2 500 zł/mies.", priceNote: "Rata netto", emoji: "⚡", photo: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=450&fit=crop",
    specs: { fuel: "Elektryczny", engine: "Dual Motor", power: "366 KM", torque: "493 Nm", transmission: "1-biegowa", drive: "AWD", acceleration: "4,4 s (0–100)", topSpeed: "201 km/h", consumption: "14,4 kWh/100 km", co2: "0 g/km", range: "602 km (WLTP)", trunk: "561 L", seats: 5, year: 2025, type: "Wynajem d\u0142ugoterminowy", duration: "24 mies.", mileage: "25 000 km/rok" } },
  { id: "vehis", brand: "VEHIS", model: "Wirtualny salon", desc: "Konfiguruj i zam\u00f3w online bez wychodzenia", price: "wycena online", priceOld: null, priceNote: null, emoji: "🛒", photo: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=450&fit=crop",
    specs: null },
  { id: "mooveno", brand: "Mooveno", model: "Elastyczny wynajem", desc: "Od 1 miesi\u0105ca \u00b7 r\u00f3\u017cne marki", price: "od 1 800 z\u0142/mies.", priceOld: null, priceNote: "Rata netto", emoji: "🔑", photo: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=450&fit=crop&q=80",
    specs: null },
];

const MY_PURCHASES = [
  { id: "p1", name: "MacBook Air M3",   cat: "Elektronika", date: "12 sty 2026", price: "6 499 zł", status: "delivered" },
];

const DISCOUNT_CATEGORIES = [
  { id: "all",           label: "Wszystko" },
  { id: "finanse",       label: "Finanse" },
  { id: "ubezpieczenia", label: "Ubezpieczenia" },
  { id: "medycyna",      label: "Medycyna" },
  { id: "auto",          label: "Samochody" },
  { id: "sprzet",        label: "Sprzęt" },
  { id: "edukacja",      label: "Edukacja" },
  { id: "podroze",       label: "Podróże" },
  { id: "zdrowie",       label: "Zdrowie" },
  { id: "dom",           label: "Dom i rodzina" },
];

const DISCOUNTS = [
  // ── Finanse ──
  { id: "d1", partner: "inFakt", badge: "-100 zł", category: "finanse",
    title: "Zleć księgowość",
    desc: "Zleć prowadzenie księgowości firmie inFakt, skorzystaj ze 100 zł zniżki na pierwszą płatność, a za każdą następną płać tylko 179 zł.",
    fullDesc: "inFakt – zakładanie firmy i księgowość dla lekarzy. Dedykowany księgowy, pełne wsparcie online i aplikacja zintegrowana z KSeF. Formalności bez stresu, finanse pod kontrolą z rabatem dla Klubu Medyka.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/08/19/11/infakt-grafika-png-68a440e58281d.png",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/08/19/08/infakt-ikona-rgb-png-68a418a59c92f.png",
    url: "https://www.infakt.pl/polecam/partner-brandmed",
    howToUse: ["Wejdź na stronę partnera przez link zniżkowy.", "Wypełnij formularz zgłoszeniowy.", "Poczekaj na ofertę dostosowaną do Twojej działalności."],
  },
  { id: "d11", partner: "Zen", badge: "PRO", category: "finanse",
    title: "Płać w podróży i na co dzień z dodatkową gwarancją!",
    desc: "Płać kartą ZEN i odbieraj do 15% cashbacku każdego dnia.",
    fullDesc: "Płać w podróży i na co dzień bez ukrytych kosztów. Karta ZEN.COM z wielowalutowym kontem, cashbackiem i dodatkowymi 2 latami gwarancji na elektronikę – teraz plan PRO za darmo przez 4 miesiące w Klubie Medyka.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/08/19/12/zen-brandmed-visual-asset-png-68a456bf50b05.png",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/08/19/10/zen-logo-png-68a436d3a78ad.png",
    url: "https://be.zen.com/BRANDMED",
    howToUse: ["Wejdź na stronę partnera przez link zniżkowy.", "Zeskanuj kod QR i pobierz aplikację na telefon.", "Postępuj zgodnie z dalszymi poleceniami."],
  },
  { id: "d15", partner: "Leaselink", badge: "-10%", category: "finanse",
    title: "Sfinansuj dowolny zakup",
    desc: "Leasing i raty o 10% taniej w Klubie Medyka – sfinansuj sprzęt lub usługi od 300 do 100 000 zł już od pierwszego dnia działalności.",
    fullDesc: "Leasing i raty w preferencyjnej ofercie w Klubie Medyka – sfinansuj sprzęt lub usługi od 300 do 100 000 zł już od pierwszego dnia działalności – także dla nowych praktyk lekarskich.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/08/20/11/photo-1-png-68a5900c7352f.png",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/08/19/08/leaselink-png-68a41a9209f41.png",
    url: "http://leaselink.pl/shortH/co/d64333",
    howToUse: ["Wejdź na stronę partnera przez link zniżkowy.", "Uzupełnij formularz wklejając informacje o produkcie.", "Wyślij formularz i poczekaj na ofertę."],
  },
  { id: "d43", partner: "Tax Legal Beauty", badge: "-20%", category: "finanse",
    title: "Kompleksowe wsparcie dla branży Med & Beauty",
    desc: "-20% na kompleksową obsługę prawno-podatkową lekarzy i podmiotów leczniczych.",
    fullDesc: "Tax Legal Beauty — kompleksowa obsługa prawno-podatkowa lekarzy i podmiotów leczniczych. Bezpiecznie, legalnie, bez stresu.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/10/28/11/tlbgrafikakreacyjna-kopia-png-69009657690f6.png",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/10/27/14/tlb-kwadrat-png-68ff78f15a90b.png",
    url: "https://taxlegalbeauty.pl/kontakt/",
    howToUse: ["Wejdź na stronę partnera przez link.", "Zostaw swoje dane kontaktowe.", "W treści wiadomości dodaj hasło \"Klub Medyka\"."],
  },

  // ── Ubezpieczenia ──
  { id: "d34", partner: "Salus", badge: "premium", category: "ubezpieczenia",
    title: "Ubezpieczenia dla medyków",
    desc: "Oferty ubezpieczeń majątkowych, komunikacyjnych i o wiele więcej ze specjalnymi rabatami dla członków Klubu Medyka.",
    fullDesc: "Ubezpieczenia komunikacyjne, majątkowe i działalności gospodarczej. A także polisy na życie i zdrowie, szkolne NNW oraz gwarancje ubezpieczeniowe dla kontraktów.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/10/09/11/salus-grafika3-png-68e781202fe35.png",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/12/05/13/salus-kwadrat-png-6932d701991d7.png",
    url: "https://www.salusfinance.pl/kontakt/",
    howToUse: ["Wejdź na stronę partnera przez link zniżkowy.", "W formularzu kontaktowym uwzględnij, że chcesz skorzystać z oferty dla Klubu Medyka."],
  },
  { id: "d37", partner: "INTER Ubezpieczenia", badge: "premium", category: "ubezpieczenia",
    title: "Pakiet ubezpieczeń zawodowych dla lekarzy",
    desc: "Zawodowa ochrona dla pracujących na praktyce, etacie, umowach cywilnoprawnych. OC obowiązkowe, dobrowolne, ochrona prawna i inne.",
    fullDesc: "Pakiet ubezpieczeń zawodowych INTER Lekarz – kompleksowa ochrona dla lekarzy i dentystów niezależnie od formy zatrudnienia. OC obowiązkowe i dobrowolne, pomoc prawna, psychologiczna i zabezpieczenie w razie ekspozycji zawodowej.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/10/20/14/inter1-obowiazkowe-oc-jpg-68f62f68bddb3.jpg",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/10/17/14/inter-kwadrat-png-68f22fc533d6b.png",
    url: "https://ubezpieczenia.interpolska.pl/lekarz/?utm_source=Remedium&utm_medium=KM&utm_campaign=102025",
  },
  { id: "d36", partner: "INTER Ubezpieczenia", badge: "premium", category: "ubezpieczenia",
    title: "Ubezpieczenie INTER Lekarz po stażu",
    desc: "Ubezpieczenie dla Lekarzy po Stażu – zarówno na umowie o pracę, jak i w praktyce – zyskaj do 30% zniżki!",
    fullDesc: "Ubezpieczenie Lekarz po stażu od INTER Polska — kompleksowa ochrona dla młodych lekarzy i dentystów w pierwszym roku pracy.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/10/22/10/inter4-pomoc-psychologiczna-jpg-68f89bcb9af80.jpg",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/10/17/14/inter-kwadrat-png-68f22fc533d6b.png",
    url: "https://ubezpieczenia.interpolska.pl/lekarz/?spec=lekarz_po_stazu&utm_source=Remedium&utm_medium=KM&utm_campaign=102025",
  },
  { id: "d38", partner: "INTER Ubezpieczenia", badge: "premium", category: "ubezpieczenia",
    title: "Ubezpieczenie INTER Student",
    desc: "Kompleksowa ochrona dla studentów kierunków medycznych. Chroni podczas nauki, praktyk i życia prywatnego.",
    fullDesc: "Studiujesz na kierunku medycznym? To ubezpieczenie chroni Cię w czasie nauki, praktyk studenckich i w życiu prywatnym przed finansowymi skutkami zdarzeń losowych lub nieumyślnie przez Ciebie spowodowanych.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/10/21/10/inter2-dobrowolne-oc-jpg-68f74754e793b.jpg",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/10/17/14/inter-kwadrat-png-68f22fc533d6b.png",
    url: "https://ubezpieczenia.interpolska.pl/student/?utm_source=Remedium&utm_medium=KM&utm_campaign=102025",
  },
  { id: "d39", partner: "INTER Ubezpieczenia", badge: "premium", category: "ubezpieczenia",
    title: "Pakiet ubezpieczeń dla lekarzy stażystów",
    desc: "Ubezpieczenie Lekarz Stażysta – oferta dedykowana lekarzom w trakcie stażu podyplomowego.",
    fullDesc: "Ubezpieczenie INTER Lekarz Stażysta – kompleksowa ochrona dla lekarzy rozpoczynających staż podyplomowy. OC dobrowolne, pomoc prawna 24/7, wsparcie psychologiczne i zabezpieczenie w razie ekspozycji zawodowej na HIV/WZW.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/10/22/09/inter5-hiv-wzw-jpg-68f889738ec74.jpg",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/10/17/14/inter-kwadrat-png-68f22fc533d6b.png",
    url: "https://ubezpieczenia.interpolska.pl/lekarz/?spec=lekarz_stazysta&utm_source=Remedium&utm_medium=KM&utm_campaign=102025",
  },

  // ── Medycyna ──
  { id: "d6", partner: "ESLT Medical", badge: "-20%", category: "medycyna",
    title: "Wyposaż swój gabinet w sprzęt laserowy",
    desc: "Wyposaż swój gabinet w sprzęt laserowy, który zwiększy precyzję i komfort zabiegów z zakresu medycyny estetycznej i nie tylko.",
    fullDesc: "Wyposaż swój gabinet w sprzęt laserowy, który zwiększy precyzję i komfort zabiegów z zakresu medycyny estetycznej i nie tylko. Zyskaj do 20% rabatu na urządzenia ESLT Medical w Klubie Medyka.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/08/19/12/eslt-grafika-jpg-68a44b5a50855.jpg",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/08/18/21/eslt-logo-png-68a37c8454e82.png",
    url: "https://eslt-medical.com/remedium/",
    howToUse: ["Wejdź na stronę partnera przez link zniżkowy.", "Przy składaniu oferty użyj kodu REMEDIUM."],
  },
  { id: "d28", partner: "ESLT Medical", badge: "-82 800 zł", category: "medycyna",
    title: "Laser ELEMENT TL Elemenic",
    desc: "Niezastąpione urządzenie laserowe z 20% rabatem, opieką serwisową i dedykowanymi szkoleniami.",
    fullDesc: "Zastanawiasz się nad kupnem sprzętu laserowego do Twojego gabinetu? Wybraliśmy dla Ciebie niezastąpione urządzenie, dołożyliśmy 20% rabatu, opiekę serwisową i dedykowane szkolenia.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/09/15/14/laser9-png-68c8047f317b9.png",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/08/18/21/eslt-logo-png-68a37c8454e82.png",
    url: "https://eslt-medical.com/remedium/",
    howToUse: ["Wejdź na stronę partnera przez link zniżkowy.", "Przy składaniu oferty użyj kodu REMEDIUM."],
  },
  { id: "d30", partner: "eGabinet", badge: "za darmo", category: "medycyna",
    title: "eGabinet",
    desc: "Aplikacja dla Twojego gabinetu — zautomatyzowane planowanie wizyt. Bezpłatne konto do 100 wizyt/mies. i 10% zniżki dla klinik.",
    fullDesc: "Aplikacja dla Twojego gabinetu — zautomatyzowane planowanie wizyt dla oszczędności czasu i formalności. Bezpłatne konto do 100 wizyt miesięcznie dla praktyk indywidualnych i 10% zniżki na oprogramowanie dla klinik.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/09/15/14/egabinet-png-68c808b52b491.png",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/08/18/21/e-gabinet-logo-v2-png-68a37b655d783.png",
    url: "https://app.egabinet.pl/demo/register?ref=remedium",
    howToUse: ["Wejdź na stronę partnera przez link zniżkowy.", "Uzupełnij formularz i załóż darmowe konto.", "Postępuj zgodnie z dalszymi poleceniami."],
  },
  { id: "d7", partner: "MedWe", badge: "-10%", category: "medycyna",
    title: "Odzież medyczna dla Ciebie",
    desc: "Kup scrubsy lub inną odzież medyczną 10% taniej w MedWe.pl.",
    fullDesc: "W MedWe łączymy nowoczesny design z praktycznymi rozwiązaniami, aby każdy medyk mógł wyglądać profesjonalnie, czuć się komfortowo i działać bez ograniczeń.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/08/19/12/grafika-kreacyjna-medwe-wie-eksza-11-2025-jpg-68a450f43d864.jpg",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/08/21/16/medwe-logo-png-68a72859e5fd5.png",
    needsCode: true,
    howToUse: ["Wygeneruj kod zniżkowy i skopiuj go.", "Wejdź na stronę partnera przez link.", "Po dodaniu produktów przejdź do koszyka i wklej swój kod rabatowy.", "Sfinalizuj zakup."],
  },
  { id: "d9", partner: "MedHero", badge: "-20%", category: "medycyna",
    title: "Wybierz ryciny anatomiczne",
    desc: "Anatomiczne ryciny jako pomoc edukacyjna lub dekoracja gabinetu 20% taniej w MedHero.art.",
    fullDesc: "MedHero.art — plakaty anatomiczne do Twojego gabinetu. Miejsce gdzie sztuka spotyka się z medycyną.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/08/19/12/grafika-kreacyjna-medhero-art-wie-eksza-jpg-68a4520f8eaa4.jpg",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/08/21/16/medhero-logo-png-68a7297c86258.png",
    needsCode: true,
    howToUse: ["Wygeneruj kod zniżkowy i skopiuj go.", "Wejdź na stronę partnera przez link.", "Po dodaniu produktów przejdź do koszyka, wybierz \"Masz kod promocyjny?\" i wklej swój kod rabatowy."],
  },

  // ── Samochody ──
  { id: "d5", partner: "Mooveno", badge: "-26%", category: "auto",
    title: "Obniż wydatki na samochód",
    desc: "Jedna aplikacja — oszczędność na paliwie, myjniach, ładowaniu, parkingach i opłatach za autostrady. Jedna faktura miesięcznie.",
    fullDesc: "Jedna aplikacja — oszczędność na paliwie, myjniach, ładowaniu, parkingach, czy opłatach za autostrady, a za wszystkie opłaty otrzymasz jedną fakturę miesięcznie. Oszczędź kilkaset złotych miesięcznie na rozliczeniach.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/08/19/12/mooveno-grafika-2-png-68a44c2fa6423.png",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/08/19/10/mooveno-logo-png-68a437c1efaae.png",
    url: "https://www.mooveno.pl/brandmed-lp-2",
    howToUse: ["Wejdź na stronę partnera przez link zniżkowy.", "Wybierz ofertę dopasowaną do Twoich potrzeb.", "Wypełnij formularz i postępuj zgodnie z otrzymanymi informacjami."],
  },
  { id: "d26", partner: "Hertz", badge: "-15%", category: "auto",
    title: "Wynajmij samochód w Hertz",
    desc: "Wybierz spośród setek modeli dostępnych w Polsce i za granicą. Zaoszczędź nawet do 15% na wynajmie samochodu.",
    fullDesc: "Hertz — światowy lider wynajmu samochodów. Wybierz spośród setek modeli dostępnych w Polsce i za granicą, rezerwując online lub przez dedykowaną infolinię. Dzięki ofercie dla Klubu Medyka możesz zaoszczędzić nawet do 15% na wynajmie samochodu.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/09/09/14/tlo-1-jpg-68c0234483a6b.jpg",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/09/09/14/hertz-logo-png-68c02177d5773.png",
    needsCode: true,
    howToUse: ["Wejdź na stronę hertz.pl lub zadzwoń pod 22 500 16 20.", "Podaj kod zniżkowy. Kod jest wielorazowego użytku."],
  },
  { id: "d48", partner: "Mercedes", badge: "od 1 199 zł/mies.", category: "auto",
    title: "Mercedes-Benz EQA w Lease&Drive",
    desc: "Oferta niezależna od programu NaszEauto. Bez wpłaty własnej, umowa na 25 m-cy, przebieg 10 000 km.",
    fullDesc: "Mercedes-Benz EQA od 1199 zł netto w Lease&Drive. Oferta niezależna od programu NaszEauto. Bez wpłaty własnej, umowa na 25 miesięcy, przebieg 10 000 km.",
    hero: "https://cdn.remedium.md/image/club_product_group/2026/02/19/13/mb-eqa-1920x1080px-remedium-jpg-6997092625035.jpg",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/09/09/14/mercedes-logo-jpg-68c01abd3bdeb.jpg",
    url: "https://www.mercedes-benz.pl/passengercars/mercedes-benz-cars/car-configurator.html",
  },

  // ── Sprzęt ──
  { id: "d2", partner: "WeSub", badge: "-5%", category: "sprzet",
    title: "Subskrybuj sprzęt",
    desc: "Wybierasz laptop, tablet, smartfon lub sprzęt peryferyjny – nowy lub odnowiony – i subskrybujesz na 12 miesięcy, 5% taniej.",
    fullDesc: "Laptopy, tablety, smartfony w subskrypcji na 12 miesięcy – z fakturą VAT, elastycznie i z pełnym wsparciem. Pracuj na nowoczesnym sprzęcie bez dużych wydatków na start ze specjalną ofertą w Klubie Medyka.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/08/19/11/wesub-grafika-jpg-68a443c40f4b5.jpg",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/08/19/09/wesub-logo-png-68a4230aef2b7.png",
    url: "https://klubmedyka.store/",
    howToUse: ["Wejdź na stronę partnera przez link zniżkowy.", "Dodaj wybrane produkty do koszyka i sfinalizuj zakup."],
  },
  { id: "d40", partner: "WeSub", badge: "-50%", category: "sprzet",
    title: "Odnowiony sprzęt za połowę ceny",
    desc: "Wszystkie sprzęty w kategorii \"Odnowione\" teraz -50% ceny miesięcznej! Tylko dla Klubu Medyka. Kod: KLUB50.",
    fullDesc: "Wszystkie ceny widoczne w kategorii \"odnowione\" po wpisaniu kodu \"KLUB50\" -50%! Subskrybuj i wymieniaj co rok!",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/10/22/11/grafika-we-sub-png-68f8a74016c42.png",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/08/19/09/wesub-logo-png-68a4230aef2b7.png",
    needsCode: true,
    howToUse: ["Wejdź na stronę partnera przez link zniżkowy.", "Dodaj wybrane sprzęty do koszyka.", "Przejdź procedurę przyznania finansowania.", "Kod rabatowy wpisz w płatności RentPay."],
  },

  // ── Edukacja ──
  { id: "d4", partner: "NaMedycyneShop", badge: "-2%", category: "edukacja",
    title: "Ucz się z najlepszych książek",
    desc: "Kup książki i opracowania medyczne 2% taniej w NaMedycyneShop.",
    fullDesc: "Wyposaż się w sprawdzone narzędzia codziennej pracy – od podręczników, przez wygodną odzież medyczną, po plakaty anatomiczne. Skorzystaj z rabatów dostępnych tylko w Klubie Medyka.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/08/19/12/grafika-kreacyjna-namedycyne-shop-wie-eksza-jpg-68a44ddccd689.jpg",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/08/19/08/namedycyneshop-logo-png-68a41eafcf799.png",
    needsCode: true,
    howToUse: ["Wygeneruj kod zniżkowy i skopiuj go.", "Wejdź na stronę partnera przez link.", "Po dodaniu produktów przejdź do koszyka, wybierz \"Masz kod promocyjny?\" i wklej swój kod.", "Sfinalizuj zakup."],
  },
  { id: "d10", partner: "Tutlo", badge: "30h gratis", category: "edukacja",
    title: "Ucz się angielskiego online",
    desc: "3 darmowe lekcje próbne i 30 lekcji gratis na wybrane kursy.",
    fullDesc: "Tutlo – angielski online wtedy, kiedy masz czas. Indywidualne lekcje z lektorami z całego świata, od A1 do C2. 3 lekcje gratis i nawet 500 zł zniżki na kurs w Klubie Medyka.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/08/19/12/tutlo-grafika-jpg-68a4542354840.jpg",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/08/19/10/tutlo-logo-png-68a4359dcb62c.png",
    needsCode: true,
    howToUse: ["Wygeneruj kod zniżkowy.", "Wejdź na stronę partnera przez link.", "Wypełnij formularz na stronie Tutlo, uwzględniając kod rabatowy."],
  },
  { id: "d21", partner: "Medu", badge: "-40%", category: "edukacja",
    title: "Doskonal technikę szycia chirurgicznego",
    desc: "Ćwicz szycie taniej z padami Medu. Specjalna oferta dla medyków -40%.",
    fullDesc: "Rozwijaj praktyczne umiejętności medyczne z Medu. W Klubie Medyka otrzymujesz 40% rabatu na zestawy do nauki szycia chirurgicznego i kursy w aplikacji.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/08/22/13/medu-grafika-1-jpg-68a85af66ae4c.jpg",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/08/21/15/medu-logo2-png-68a72502c9811.png",
    needsCode: true,
    howToUse: ["Wejdź na stronę partnera przez link.", "Po dodaniu produktów przejdź do koszyka i płatności. Wybierz \"Dodaj kod promocyjny\" i wklej swój kod.", "Sfinalizuj zakup."],
  },

  // ── Podróże ──
  { id: "d8", partner: "Soliści", badge: "do -400 zł", category: "podroze",
    title: "Wybierz się w podróż",
    desc: "Ponad 55 kierunków na 6 kontynentach i 10 stylów podróżowania, do 400 zł taniej.",
    fullDesc: "Autentyczne wyprawy w małych grupach, poza utartym szlakiem. Z Solistami zamieniasz marzenia o podróżach w wspomnienia, które zostają na lata.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/08/19/12/grafika-2-png-68a44e1a84f4a.png",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/08/19/08/soli-i-logo-png-68a420ea7c8c4.png",
  },
  { id: "d13", partner: "Taksidi", badge: "-100 zł", category: "podroze",
    title: "Zaplanuj aktywny wypoczynek",
    desc: "Zorganizowane wyjazdy dla każdego stylu podróżowania – PARTY, EXPLORE, czy FAMILY – 100 zł taniej.",
    fullDesc: "Taksidi – zimowe wyjazdy na narty i snowboard do najlepszych kurortów Alp. Wybierz formułę dopasowaną do siebie: imprezową, rodzinną lub spokojną i skorzystaj z kodu rabatowego w Klubie Medyka.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/08/19/13/taksidi-grafika-jpg-68a463e006b18.jpg",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/08/19/09/taksidi-logo-png-68a423ba96a4f.png",
  },
  { id: "d22", partner: "The Boat Trip", badge: "-100 zł", category: "podroze",
    title: "Wypłyń w niezapomniany rejs",
    desc: "Zaoszczędź 100 zł na niezapomniane wakacje na jachcie z The Boat Trip.",
    fullDesc: "Wakacje na jachcie – rejsy w formule Party, Explore, Chill i Adventure. Wyrusz solo lub z ekipą znajomych i ciesz się rabatem 100 zł na dowolną wycieczkę w Klubie Medyka.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/08/22/12/the-boat-trip-grafika-jpg-68a847569719d.jpg",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/09/09/15/theboattrip-logo-png-68c02ac717161.png",
  },
  { id: "d12", partner: "8a", badge: "do -10%", category: "podroze",
    title: "Wyposaż się na szlak",
    desc: "Sprzęt górski i outdoorowy dla każdego. Od odzieży i obuwia po namioty i akcesoria, do 10% taniej.",
    fullDesc: "8a.pl – sprawdzony sprzęt górski i outdoorowy dla każdego poziomu zaawansowania. Od odzieży i obuwia po namioty i akcesoria. Skorzystaj ze specjalnej oferty w Klubie Medyka.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/08/19/13/8a-grafika-jpg-68a4632cef705.jpg",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/08/18/21/8a-logo-png-68a3788909673.png",
    needsCode: true,
    howToUse: ["Wygeneruj kod zniżkowy i skopiuj go.", "Wejdź na stronę partnera przez link.", "Po dodaniu produktów przejdź do koszyka, wybierz \"Zastosuj kod rabatowy\", wklej go i naciśnij \"Zastosuj zniżkę\"."],
  },

  // ── Zdrowie ──
  { id: "d24", partner: "Belvedere", badge: "do -12%", category: "zdrowie",
    title: "Zamów najlepszą dietę",
    desc: "Prywatny Kucharz by Belvedere – pięciogwiazdkowy catering dietetyczny dla wymagających. Odbierz rabat -12%.",
    fullDesc: "Prywatny Kucharz by Belvedere – pięciogwiazdkowy catering dietetyczny dla wymagających. Wybierz program i odbierz rabat w Klubie Medyka.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/10/03/13/kucharz-png-68dfba07b2161.png",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/09/04/15/belvedere-catering-logo-png-68b98e9e1d73c.png",
    howToUse: ["Wejdź na stronę partnera przez link zniżkowy.", "Wybierz dietę dostosowaną do Ciebie.", "Postępuj zgodnie z dalszymi poleceniami."],
  },
  { id: "d32", partner: "BEKETO CATERING", badge: "-200 zł", category: "zdrowie",
    title: "BE KETO catering",
    desc: "Voucher na dietę keto na 200 zł od 14 dni.",
    fullDesc: "BeKeto Catering to profesjonalny catering ketogeniczny dostarczany do ponad 4 100 miejscowości w Polsce. Oferuje aż 6 wariantów diet dostosowanych kalorrycznie – smacznie, wygodnie i zgodnie z zasadami keto.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/10/28/12/be-keto-png-6900a3ad524f6.png",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/10/08/14/beketo-catering-kwadrat-png-68e6600164ace.png",
  },
  { id: "d33", partner: "BEKETO", badge: "-100 zł", category: "zdrowie",
    title: "BE KETO — sklep keto",
    desc: "Voucher 100 zł na zakupy powyżej 500 zł w sklepie internetowym.",
    fullDesc: "BeKeto to sklep i marka dedykowana diecie ketogenicznej i low-carb, oferujący oleje MCT, keto przekąski, posiłki w proszku i suplementy — wszystko bez cukru i gotowe do codziennego stosowania.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/10/08/15/beketo-grafika-png-68e669144dcd7.png",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/10/08/15/beketo-kwadrat-png-68e667f71e3df.png",
  },
  { id: "d35", partner: "The Collagen Company", badge: "-100 zł", category: "zdrowie",
    title: "Produkty kolagenowe",
    desc: "Zadbaj o siebie z wysokiej jakości produktami z kolagenem. W Klubie Medyka aż 100 zł taniej!",
    fullDesc: "Kup produkty z kolagenem ze specjalnymi promocjami w Klubie Medyka!",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/10/16/14/tcc-grafika2-png-68f0dfec31f0f.png",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/10/16/14/tcc-kwadrat-png-68f0df95a0d9d.png",
  },

  // ── Dom i rodzina ──
  { id: "d16", partner: "AskHenry", badge: "do -20%", category: "dom",
    title: "Oddeleguj zadania",
    desc: "Twój osobisty asystent na 10h lub więcej, do 20% taniej. Oddeleguj zakupy, sprawy urzędowe, reklamacje i wiele więcej.",
    fullDesc: "Twój osobisty asystent. Oddeleguj zakupy, sprawy urzędowe, reklamacje, research i wiele więcej.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/08/22/12/askhenry-grafika-jpg-68a842a5eb9d7.jpg",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/08/18/21/askhenry-logo-png-68a37ac3d241c.png",
    url: "https://askhenry.pl/remedium/",
    howToUse: ["Wejdź na stronę i wybierz pakiet, który Cię interesuje.", "Zjedź na sam dół strony, podaj dane i skorzystaj ze zniżki."],
  },
  { id: "d17", partner: "Lisek", badge: "-6%", category: "dom",
    title: "Zamów zakupy",
    desc: "Zamawiaj zakupy pod drzwi, nawet w 10 min, także w niedziele i święta, z Klubem 6% taniej.",
    fullDesc: "Marzą Ci się zakupy dostarczone pod same drzwi? Złóż zamówienie w Lisek.App i skorzystaj ze zniżki 6%. Wołaj Liska! Promocja nie obejmuje produktów alkoholowych oraz wyrobów tytoniowych.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/12/22/11/lisek-slider3-png-69491e5c769b1.png",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/08/19/08/lisek-logo-png-68a41c02c594d.png",
    needsCode: true,
    howToUse: ["Zainstaluj aplikację Lisek.App lub wejdź na stronę Lisek.App.", "Wpisz swój kod promocyjny w zakładce Kupony.", "Złóż zamówienie za minimum 50 zł i gotowe!"],
  },
  { id: "d18", partner: "Lisek", badge: "-30 zł", category: "dom",
    title: "Zamów pierwsze zakupy",
    desc: "Pierwsze zakupy w Lisku -30 zł (min. wartość zamówienia 65 zł).",
    fullDesc: "Zakupy bez wychodzenia z domu, z dostawą nawet w 10 minut, z rabatem w Klubie Medyka. Lisek – tysiące produktów z Twojego telefonu prosto pod drzwi, codziennie, także w niedziele i święta.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/08/27/11/remedium-1920x1080-2-98-png-68aecb9993948.png",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/08/19/08/lisek-logo-png-68a41c02c594d.png",
  },
  { id: "d41", partner: "Niania", badge: "2 tyg. za 1 zł", category: "dom",
    title: "Znajdź troskliwą nianię",
    desc: "2 tygodnie dostępu do największej bazy opiekunek w Polsce tylko za 1 zł.",
    fullDesc: "Znajdź troskliwą nianię — 2 tygodnie dostępu do największej bazy opiekunek w Polsce tylko za 1 zł.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/10/28/12/niania-3-png-6900a32bcecab.png",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/10/27/13/niania-kwadrat-png-68ff6bcdc1862.png",
    url: "https://niania.pl/Discount.do?code=xgbnlfYpPNnx",
    howToUse: ["Wejdź na stronę partnera przez link zniżkowy.", "Załóż konto na portalu niania.pl."],
  },
  { id: "d42", partner: "Opieka Seniora", badge: "2 tyg. za 1 zł", category: "dom",
    title: "Znajdź opiekuna dla seniora",
    desc: "2 tygodnie dostępu do największej bazy opiekunów w Polsce tylko za 1 zł.",
    fullDesc: "Znajdź zaufanego opiekuna dla seniora — 2 tygodnie dostępu do największej bazy opiekunów w Polsce tylko za 1 zł.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/10/27/16/os-klubmedyka-png-68ff90b5064e8.png",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/10/27/14/os-kwadrat-png-68ff6d0c69b52.png",
    url: "https://opiekaseniora.pl/Discount.do?code=MRNBYHkLpywQ",
    howToUse: ["Wejdź na stronę partnera przez link zniżkowy.", "Załóż konto na portalu opiekaseniora.pl."],
  },
  { id: "d44", partner: "Pomoce Domowe", badge: "2 tyg. za 1 zł", category: "dom",
    title: "Znajdź pomoc domową",
    desc: "Znajdź najlepszą pomoc domową — 2 tygodnie dostępu za 1 zł.",
    fullDesc: "PomoceDomowe.pl to serwis łączący osoby poszukujące wsparcia w obowiązkach domowych z pomocami domowymi w całej Polsce. Regularno utrzymanie czystości, gruntowne porządki, prowadzenie domu — znajdziesz tu odpowiednią osobę.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/10/28/16/pomoce-domowe-grafika-png-6900db92787b9.png",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/10/27/14/pd-kwadrat-png-68ff6e80c3843.png",
    url: "https://pomocedomowe.pl/Discount.do?code=rMjShXumLMrs",
  },
  { id: "d45", partner: "Opieka Zwierząt", badge: "2 tyg. za 1 zł", category: "dom",
    title: "Znajdź opiekę dla pupila",
    desc: "2 tygodnie dostępu do bazy opiekunów zwierząt tylko za 1 zł.",
    fullDesc: "OpiekaZwierzat.pl to serwis stworzony z myślą o właścicielach zwierząt i opiekunach. Platforma łączy osoby poszukujące zaufanej opieki dla swojego pupila z opiekunami i petsitterami.",
    hero: "https://cdn.remedium.md/image/club_product_group/2025/11/05/14/opieka-zwierzat-grafika-png-690b502a97a2f.png",
    logo: "https://cdn.remedium.md/image/club_vendor/2025/10/27/14/oz-kwadrat-png-68ff6f5216399.png",
    url: "http://opiekazwierzat.pl/Discount.do?code=DMphzmatnllO",
  },
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
  cars: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>,
  investments: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  advisors: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  profile: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>,
};

const NAV_SECTIONS = [
  {
    items: [
      { id: "overview",    label: "Panel główny",  icon: "overview"  },
      { id: "purchases",   label: "Zakupy",        icon: "purchases" },
      { id: "discounts",   label: "Zniżki",        icon: "discounts" },
      { id: "cars",        label: "Samochody",     icon: "cars" },
      { id: "packages",    label: "Usługi",        icon: "packages" },
      { id: "packages2",   label: "Usługi 2",      icon: "packages" },
      { id: "packages3",   label: "Usługi 3",      icon: "packages" },
      { id: "packages4",   label: "Usługi 4",      icon: "packages" },
      { id: "insurance",   label: "Ubezpieczenia", icon: "insurance" },
    ],
  },
  {
    header: "Konto",
    items: [
      { id: "profile", label: "Mój profil", icon: "profile", badge: 2 },
      { id: "advisors",    label: "Twoi doradcy",  icon: "advisors"  },
    ],
  },
];

const INSURANCE_CATEGORIES = [
  { id: "oc",     name: "OC lekarskie",   icon: "shield", tag: "Obowiązkowe", tagVariant: "red",  priceLabel: "od 69 zł/mies.",    desc: "Odpowiedzialność cywilna za błędy w sztuce lekarskiej. Wymagane prawnie.", noMissing: false },
  { id: "income", name: "Utrata dochodu", icon: "wallet", tag: "Zalecane",    tagVariant: "warn", priceLabel: "~80–350 zł/mies.",  desc: "Ochrona przychodu przy chorobie lub wypadku.", noMissing: false },
];

/* ── OC DATA ─────────────────────────────────────────── */
const OC_SPEC_III = [
  "Anestezjologia i intensywna terapia","Chirurgia dziecięca","Chirurgia klatki piersiowej",
  "Chirurgia ogólna","Chirurgia szczękowo-twarzowa","Kardiochirurgia","Neurochirurgia",
  "Ortopedia i traumatologia narządu ruchu","Położnictwo i ginekologia","Urologia",
  "Chirurgia naczyniowa","Chirurgia onkologiczna","Chirurgia plastyczna",
  "Ginekologia onkologiczna","Urologia dziecięca","Chirurgia stomatologiczna",
  "Medycyna ratunkowa","Neonatologia",
];
const OC_SPEC_II = [
  "Medycyna sportowa","Ortodoncja","Periodontologia","Protetyka stomatologiczna",
  "Radioterapia onkologiczna","Stomatologia dziecięca","Stomatologia zachowawcza z endodoncją",
];
const OC_SPEC_I = [
  "Alergologia","Angiologia","Audiologia i foniatria","Balneologia i medycyna fizykalna",
  "Choroby płuc","Choroby wewnętrzne","Dermatologia i wenerologia","Diabetologia",
  "Endokrynologia","Farmakologia kliniczna","Gastroenterologia","Geriatria",
  "Hematologia","Hipertensjologia","Immunologia kliniczna","Intensywna terapia",
  "Kardiologia","Medycyna lotnicza","Medycyna morska i tropikalna",
  "Medycyna nuklearna","Medycyna pracy","Medycyna rodzinna","Medycyna sądowa",
  "Mikrobiologia lekarska","Nefrologia","Neurologia","Onkologia kliniczna",
  "Okulistyka","Otorynolaryngologia","Patomorfologia","Pediatria",
  "Psychiatria","Psychiatria dzieci i młodzieży","Radiologia i diagnostyka obrazowa",
  "Rehabilitacja medyczna","Reumatologia","Toksykologia kliniczna",
  "Transplantologia kliniczna","Medycyna paliatywna","Zdrowie publiczne",
];
const OC_ALL_SPECS = [
  ...OC_SPEC_III.map(s => ({ name: s, group: 3 })),
  ...OC_SPEC_II.map(s => ({ name: s, group: 2 })),
  ...OC_SPEC_I.map(s => ({ name: s, group: 1 })),
].sort((a, b) => a.name.localeCompare(b.name, "pl"));

const OC_SUMS = ["1 000 000 zł", "1 500 000 zł", "2 000 000 zł"];
const OC_PREMIUM = {
  mandatory: { 3: 400, 2: 200, 1: 100 },
  surplus: {
    "1 000 000 zł": { 3: 630, 2: 300, 1: 150 },
    "1 500 000 zł": { 3: 950, 2: 450, 1: 220 },
    "2 000 000 zł": { 3: 1300, 2: 650, 1: 320 },
  },
};
const OC_EXTRAS = [
  { key: "legal",     label: "Koszty ochrony prawnej",                    shortLabel: "Ochrona prawna", recommended: true,
    variants: [
      { sum: "50 000 zł",  price: 80  },
      { sum: "100 000 zł", price: 130 },
      { sum: "200 000 zł", price: 190 },
    ], defaultVariant: 1 },
  { key: "aesthetic", label: "Medycyna estetyczna i chirurgia plastyczna", shortLabel: "Medycyna estetyczna",
    variants: [
      { sum: "50 000 zł",  price: 320 },
      { sum: "100 000 zł", price: 500 },
      { sum: "200 000 zł", price: 750 },
    ], defaultVariant: 1 },
  { key: "nfz",      label: "Kary NFZ za błędną refundację leków",        shortLabel: "Kary NFZ", recommended: true,
    variants: [
      { sum: "100 000 zł", price: 130 },
      { sum: "200 000 zł", price: 200 },
      { sum: "500 000 zł", price: 340 },
    ], defaultVariant: 1 },
  { key: "hiv",      label: "Profilaktyka poekspozycyjna HIV/WZW",        shortLabel: "HIV/WZW", recommended: true,
    variants: [
      { sum: "Pakiet standardowy", price: 115 },
    ], defaultVariant: 0 },
];

/* ── INTER DATA ──────────────────────────────────────── */
const INTER_MANDATORY_SUMS = [
  { label: "150 000 / 350 000 EUR", value: "150k/350k", factor: 1.0  },
  { label: "350 000 / 700 000 EUR", value: "350k/700k", factor: 1.3  },
  { label: "500 000 / 500 000 EUR", value: "500k/500k", factor: 1.5  },
  { label: "750 000 / 750 000 EUR", value: "750k/750k", factor: 1.8  },
  { label: "1 000 000 / 1 000 000 EUR", value: "1M/1M", factor: 2.2 },
];
const INTER_VOLUNTARY_SUMS = [
  { label: "100 000 EUR", value: "100k", price: 180 },
  { label: "200 000 EUR", value: "200k", price: 280 },
  { label: "500 000 EUR", value: "500k", price: 450 },
];
const INTER_KLAUZULE = {
  regress:        { label: "Rezygnacja z regresu",                              price: 50  },
  nightEmergency: { label: "Nocna/świąteczna pomoc z wyjazdami",                price: 80  },
  surgical:       { label: "Zabiegi chirurgiczne/endoskopowe/radiologia interw.",price: 120 },
  staff:          { label: "Zatrudnianie personelu medycznego (kl. 1)",         price: 60  },
  leasing:        { label: "Leasing sprzętu medycznego (kl. 2)",               price: 40  },
  euroTransport:  { label: "Transport medyczny w Europie (kl. 4)",             price: 90  },
  aesthetic5A:    { label: "Medycyna estetyczna (kl. 5A)",                      price: 350 },
  plastic5B:      { label: "Chirurgia plastyczna (kl. 5B)",                     price: 500 },
  patientRights:  { label: "Naruszenie praw pacjenta (kl. 9)",
    sublimits: ["50 000 zł","100 000 zł","200 000 zł"], prices: [120, 200, 340] },
  courtExpert:    { label: "Biegły sądowy / orzecznik (kl. 11)",               price: 70  },
  office:         { label: "Gabinet własny / najmowany (kl. 12)",
    sublimits: ["50 000 zł","100 000 zł"], prices: [80, 140] },
  nfzFines:       { label: "Błędna refundacja leków (kl. 23)",
    sums: ["100 000 PLN","200 000 PLN","500 000 PLN"], prices: [150, 230, 380] },
};
const INTER_HIV_VARIANTS = [
  { label: "A-I  — NNW + badania + leki",                price: 130 },
  { label: "A-II — NNW + badania + leki + świadczenie",  price: 180 },
  { label: "B-V  — Pełny pakiet",                        price: 250 },
];
const INTER_LEGAL_VARIANTS = [
  { label: "Podstawowy — 50 000 EUR",   price: 150 },
  { label: "Rozszerzony — 100 000 EUR", price: 250 },
];
const INTER_PSYCH = [
  { label: "3 konsultacje", price: 90  },
  { label: "8 konsultacji", price: 180 },
];
const INTER_TOUR = {
  variants: [
    { label: "Europa — 100 000 EUR",  basePrice: 190 },
    { label: "Świat — 200 000 EUR",   basePrice: 290 },
  ],
  extremeAddon: 80,
  polandAddon:  40,
  groupAddon:   60,
};

function ocRiskGroup(s1, s2, sor) {
  if (sor) return 3;
  const g = (name) => OC_ALL_SPECS.find(s => s.name === name)?.group || 1;
  return Math.max(s1 ? g(s1) : 1, s2 ? g(s2) : 0);
}
function ocCalc(d) {
  const rg = ocRiskGroup(d.spec1, d.spec2, d.sor);
  let total = 0; const items = [];
  if (d.practice) { const p = OC_PREMIUM.mandatory[rg]; total += p; items.push({ label: "OC obowiązkowe", amount: p }); }
  if (d.practice && d.surplusSum) { const p = OC_PREMIUM.surplus[d.surplusSum]?.[rg] || 0; total += p; items.push({ label: "OC nadwyżkowe " + d.surplusSum, amount: p }); }
  if (!d.practice && d.voluntarySum) { const p = OC_PREMIUM.surplus[d.voluntarySum]?.[rg] || 0; total += p; items.push({ label: "OC dobrowolne " + d.voluntarySum, amount: p }); }
  if (d.practice && !d.surplusSum && d.voluntarySum) { const p = OC_PREMIUM.surplus[d.voluntarySum]?.[rg] || 0; total += p; items.push({ label: "OC dobrowolne " + d.voluntarySum, amount: p }); }
  OC_EXTRAS.forEach(ex => {
    if (d[ex.key]) {
      const vi = d.extraVariants?.[ex.key] ?? ex.defaultVariant;
      const v = ex.variants[vi] || ex.variants[ex.defaultVariant];
      total += v.price; items.push({ label: ex.label, amount: v.price });
    }
  });
  return { total, items, riskGroup: rg };
}

function interCalc(d) {
  const rg = ocRiskGroup(d.spec1, d.spec2, d.sor);
  let total = 0; const items = [];

  // OC obowiązkowe
  if (d.practice) {
    const sumEntry = INTER_MANDATORY_SUMS.find(s => s.value === d.interMandatorySum);
    const base = Math.round(OC_PREMIUM.mandatory[rg] * (sumEntry?.factor || 1.0) * 1.08);
    total += base; items.push({ label: "OC obowiązkowe (" + (sumEntry?.label || "min.") + ")", amount: base });
  }

  // OC dobrowolna (INTER EUR)
  if (d.interVoluntaryOc && d.interVoluntarySum) {
    const entry = INTER_VOLUNTARY_SUMS.find(s => s.value === d.interVoluntarySum);
    if (entry) { total += entry.price; items.push({ label: "OC dobrowolne " + entry.label, amount: entry.price }); }
  }

  // Klauzule proste (stała cena)
  const simpleKl = [
    ["regressWaiver",   "regress"],
    ["nightEmergency",  "nightEmergency"],
    ["surgicalProc",    "surgical"],
    ["employsMedStaff", "staff"],
    ["leasesEquipment", "leasing"],
    ["euroTransport",   "euroTransport"],
    ["aesthetic",       "aesthetic5A"],
    ["plasticSurgery",  "plastic5B"],
    ["courtExpert",     "courtExpert"],
  ];
  simpleKl.forEach(([field, klKey]) => {
    if (d[field]) {
      const kl = INTER_KLAUZULE[klKey];
      total += kl.price; items.push({ label: kl.label, amount: kl.price });
    }
  });

  // Klauzule z sublimitem
  if (d.patientRights) {
    const idx = d.patientRightsSub ?? 0;
    const p = INTER_KLAUZULE.patientRights.prices[idx] || INTER_KLAUZULE.patientRights.prices[0];
    total += p; items.push({ label: INTER_KLAUZULE.patientRights.label + " " + (INTER_KLAUZULE.patientRights.sublimits[idx] || ""), amount: p });
  }
  if (d.hasOwnOffice) {
    const idx = d.officeSub ?? 0;
    const p = INTER_KLAUZULE.office.prices[idx] || INTER_KLAUZULE.office.prices[0];
    total += p; items.push({ label: INTER_KLAUZULE.office.label + " " + (INTER_KLAUZULE.office.sublimits[idx] || ""), amount: p });
  }
  if (d.nfz) {
    const idx = d.nfzSub ?? 0;
    const p = INTER_KLAUZULE.nfzFines.prices[idx] || INTER_KLAUZULE.nfzFines.prices[0];
    total += p; items.push({ label: INTER_KLAUZULE.nfzFines.label + " " + (INTER_KLAUZULE.nfzFines.sums[idx] || ""), amount: p });
  }

  // Ochrona prawna INTER
  if (d.legal && d.interLegalVariant != null) {
    const v = INTER_LEGAL_VARIANTS[d.interLegalVariant] || INTER_LEGAL_VARIANTS[0];
    total += v.price; items.push({ label: "Ochrona prawna — " + v.label, amount: v.price });
  }

  // HIV/WZW
  if (d.hiv && d.interHivVariant != null) {
    const v = INTER_HIV_VARIANTS[d.interHivVariant] || INTER_HIV_VARIANTS[0];
    total += v.price; items.push({ label: "HIV/WZW — " + v.label, amount: v.price });
  }

  // Pomoc psychologiczna
  if (d.psychHelp) {
    const v = INTER_PSYCH[d.psychHelpVariant ?? 0] || INTER_PSYCH[0];
    total += v.price; items.push({ label: "Pomoc psychologiczna — " + v.label, amount: v.price });
  }

  // INTER Tour 365
  if (d.interTour && d.interTourVariant != null) {
    const v = INTER_TOUR.variants[d.interTourVariant] || INTER_TOUR.variants[0];
    let p = v.basePrice;
    if (d.interTourExtreme) p += INTER_TOUR.extremeAddon;
    if (d.interTourPoland) p += INTER_TOUR.polandAddon;
    if (d.interTourGroup) p += INTER_TOUR.groupAddon;
    total += p; items.push({ label: "INTER Tour 365 — " + v.label, amount: p });
  }

  return { total, items, riskGroup: rg };
}

const INS_PARTNERS = [
  { name: "Ergo Hestia",        logo: "ubezpieczenia/loga/ergohestia.png",  h: 34 },
  { name: "Lloyd's",            logo: "ubezpieczenia/loga/lloyds.png",      h: 18 },
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

function InView({ children, className, style }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

const PILL_VARIANTS = {
  default: "text-muted bg-secondary",
  green:   "text-green bg-green-bg",
  warn:    "text-warn bg-warn-bg",
  accent:  "text-accent bg-accent-bg",
  red:     "text-red bg-red-bg",
  muted:   "text-muted bg-secondary",
};

function Pill({ children, variant = "default" }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold leading-[1.4] ${PILL_VARIANTS[variant] || PILL_VARIANTS.default}`}>
      {children}
    </span>
  );
}

function StatusPill({ status }) {
  if (status === "trial")     return <Pill variant="warn">Próba</Pill>;
  if (status === "delivered") return <Pill variant="green">Dostarczone</Pill>;
  return                             <Pill variant="green">Aktywna</Pill>;
}

const BTN_VARIANTS = {
  primary: "bg-primary text-primary-fg border-primary",
  accent:  "bg-accent text-accent-fg border-accent",
  outline: "bg-bg text-fg border-input",
  ghost:   "bg-transparent text-muted border-border",
  warn:    "bg-transparent text-warn border-warn",
};

const BTN_SIZES = {
  sm: "h-9 px-3 py-2 text-sm",
  md: "px-4 py-2 text-sm",        // default
  lg: "h-11 px-5 py-2.5 text-[15px]",
};

function Btn({ children, variant = "primary", size = "md", onClick, className = "", disabled = false, style }) {
  const base = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border font-medium leading-5 cursor-pointer transition-[opacity,background] duration-150 active:opacity-85";
  const variantCls = BTN_VARIANTS[variant] || BTN_VARIANTS.primary;
  const sizeCls = BTN_SIZES[size] || BTN_SIZES.md;
  const disabledCls = disabled ? "pointer-events-none cursor-default opacity-[0.38]" : "";
  return (
    <button
      className={`${base} ${variantCls} ${sizeCls} ${disabledCls} ${className}`.trim()}
      onClick={disabled ? undefined : onClick}
      style={style}
    >
      {children}
    </button>
  );
}

function SectionHeader({ title, action, onAction }) {
  return (
    <div className="mb-4 flex items-baseline justify-between">
      <span className="text-[13px] font-semibold text-fg">{title}</span>
      {action && (
        <button className="inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-xs text-accent" onClick={onAction}>
          {action}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      )}
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
// Shortened: 4 screens (intro → dane+PWZ → rola+praca → done)

function Onboarding({ onComplete, setProfile }) {
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
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <div className="w-full max-w-[480px]">

        {/* Logo */}
        <div className="mb-10 flex items-center gap-2">
          <img src="Logo.png" alt="Klub Medyka" className="h-7 w-auto" />
        </div>

        {/* Progress bar — visible in steps 1–2 */}
        {step >= 1 && step <= 2 && (
          <React.Fragment>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Krok {step} z {TOTAL_STEPS}</div>
            <div className="mb-10 h-0.5 overflow-hidden rounded-[2px] bg-border">
              <div className="h-full rounded-[2px] bg-primary transition-[width] duration-300 ease-out" style={{ width: `${progress * 100}%` }} />
            </div>
          </React.Fragment>
        )}

        {/* ── STEP 0: Intro ── */}
        {step === 0 && (
          <div>
            <h1 className="mb-3 text-[32px] font-bold leading-[1.15] tracking-[-0.03em] text-fg">
              Witaj w<br/>Klub Medyka.
            </h1>
            <p className="mb-6 text-sm leading-[1.6] text-muted">
              Platforma benefitów dla lekarzy — ubezpieczenia, narzędzia do JDG, leasing, zniżki i doradcy dostępni bezpośrednio.
            </p>
            <div className="mb-8 flex flex-col gap-[10px]">
              {[
                "Doradca przypisany do Ciebie od razu",
                "Ubezpieczenia OC, NNW, podróżne i życiowe",
                "Narzędzia do działalności — InFakt, Autenti i więcej",
                "Samochody, elektronika, catering dietetyczny",
              ].map(t => (
                <div key={t} className="flex items-center gap-[10px] text-sm text-muted">
                  <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-green-border bg-green-bg text-[10px] font-bold text-green">✓</div>
                  {t}
                </div>
              ))}
            </div>
            <div className="flex gap-[10px]">
              <Btn variant="primary" onClick={() => setStep(1)} className="w-full">Załóż konto</Btn>
              <Btn variant="outline" onClick={() => { setProfile({ ...DEFAULT_PROFILE, role: "specialist", work: ["private"], firstName: "Anna", lastName: "Kowalska" }); onComplete(); }}>Mam już konto</Btn>
            </div>
          </div>
        )}

        {/* ── STEP 1: Dane + PWZ ── */}
        {step === 1 && (
          <div>
            <h1 className="mb-3 text-[28px] font-bold leading-[1.15] tracking-[-0.03em] text-fg">Twoje dane</h1>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">Imię *</div>
                  <input className="w-full rounded-lg border border-input bg-bg px-3.5 py-2.5 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary" value={form.firstName} onChange={e => set("firstName", e.target.value)}
                    placeholder="Anna" type="text" />
                </div>
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">Nazwisko</div>
                  <input className="w-full rounded-lg border border-input bg-bg px-3.5 py-2.5 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary" value={form.lastName} onChange={e => set("lastName", e.target.value)}
                    placeholder="Kowalska" type="text" />
                </div>
              </div>
              <div>
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">E-mail *</div>
                <input className="w-full rounded-lg border border-input bg-bg px-3.5 py-2.5 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary" value={form.email} onChange={e => set("email", e.target.value)}
                  placeholder="anna@szpital.pl" type="email" />
              </div>
              <div>
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Telefon <span className="font-normal normal-case tracking-normal">(opcjonalnie)</span>
                </div>
                <input className="w-full rounded-lg border border-input bg-bg px-3.5 py-2.5 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary" value={form.phone} onChange={e => set("phone", e.target.value)}
                  placeholder="+48 600 000 000" type="tel" />
              </div>
              <div>
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">Numer PWZ *</div>
                <input className="w-full rounded-lg border border-input bg-bg px-3.5 py-2.5 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary" value={form.pwz} onChange={e => set("pwz", e.target.value.replace(/\D/g, "").slice(0, 7))}
                  placeholder="1234567" type="text" inputMode="numeric" maxLength={7} />
                <div className="mt-2 text-xs leading-[1.5] text-muted">
                  7-cyfrowy numer prawa wykonywania zawodu lekarza
                </div>
              </div>
              <p className="mt-1 text-xs leading-[1.6] text-muted">
                Kontynuując akceptujesz{" "}
                <a href="#" className="cursor-pointer text-accent">regulamin</a> i{" "}
                <a href="#" className="cursor-pointer text-accent">politykę prywatności</a>.
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 2: Kim jesteś + Jak pracujesz (combined) ── */}
        {step === 2 && (
          <div>
            <h1 className="mb-3 text-[28px] font-bold leading-[1.15] tracking-[-0.03em] text-fg">Kim jesteś?</h1>
            <p className="mb-6 text-sm leading-[1.6] text-muted">Dobierzemy doradcę i oferty do Twojego etapu kariery.</p>
            <div className="flex flex-col gap-[7px]">
              {OB_ROLES.map(r => {
                const sel = form.role === r.id;
                return (
                  <button key={r.id} onClick={() => set("role", r.id)}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl border-[1.5px] px-4 py-[14px] text-left transition-all duration-150 ${sel ? "border-primary bg-primary" : "border-border bg-bg"}`}>
                    <span className={`text-sm ${sel ? "font-semibold text-white" : "font-normal text-fg"}`}>{r.label}</span>
                    <span className={`text-xs ${sel ? "text-white/55" : "text-muted"}`}>{r.sub}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
                Jak pracujesz? <span className="font-normal normal-case tracking-normal">(opcjonalnie, można wybrać kilka)</span>
              </div>
              <div className="flex flex-col gap-[7px]">
                {OB_WORK.map(w => {
                  const sel = form.work.includes(w.id);
                  return (
                    <button key={w.id} onClick={() => toggleWork(w.id)}
                      className={`flex w-full cursor-pointer items-center gap-[13px] rounded-xl border-[1.5px] px-4 py-[14px] text-left transition-all duration-150 ${sel ? "border-primary bg-primary" : "border-border bg-bg"}`}>
                      <div className={`flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-sm border-[1.5px] text-[10px] font-bold text-primary ${sel ? "border-white bg-bg" : "border-muted bg-transparent"}`}>
                        {sel && "✓"}
                      </div>
                      <span className={`text-sm ${sel ? "font-semibold text-white" : "text-fg"}`}>{w.label}</span>
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
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-green-border bg-green-bg text-[22px]">✓</div>
            <h1 className="mb-3 text-[28px] font-bold leading-[1.15] tracking-[-0.03em] text-fg">
              Konto gotowe,<br/>dr {form.firstName || "Kowalska"}.
            </h1>
            <p className="mb-6 text-sm leading-[1.6] text-muted">
              Przypisujemy Ci doradcę — odezwie się w ciągu 24 godzin. Możesz już przeglądać platformę.
            </p>
            <div className="mb-7 flex items-center gap-[14px] rounded-xl border border-border bg-bg px-[18px] py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-white">MK</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-fg">Marta Kowalczyk</div>
                <div className="mt-0.5 text-xs text-muted">Twój doradca ubezpieczeniowy</div>
              </div>
              <Pill variant="green">Dostępna</Pill>
            </div>
            <Btn variant="primary" onClick={() => {
              setProfile({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, pwz: form.pwz, role: form.role, work: form.work, interests: [] });
              onComplete();
            }} size="lg" className="w-full">
              Przejdź do platformy →
            </Btn>
          </div>
        )}

        {/* Navigation buttons — steps 1–2 */}
        {step >= 1 && step <= 2 && (
          <div className="mt-8 flex items-center justify-between">
            <button className="border-none bg-transparent p-0 text-[13px] text-muted" onClick={() => setStep(s => s - 1)}>
              ← Wróć
            </button>
            <Btn variant="primary"
              disabled={!canNext}
              onClick={() => canNext && setStep(s => s + 1)}>
              {step === 2 ? "Zakończ" : "Dalej →"}
            </Btn>
          </div>
        )}
        <div className="mt-auto flex justify-center pt-8">
          <svg width="205" height="18" viewBox="0 0 205 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[14px] w-auto">
            <path d="M119.945 9.25593V7.64731H118.442V14.7002H119.945V11.4848C119.945 10.7269 120.268 9.98875 120.871 9.5294C121.494 9.05396 122.332 8.81803 123.273 8.81803V7.5061C121.82 7.5061 120.51 8.12453 119.945 9.25593V9.25593Z" fill="#2E35FF"/><path d="M128.135 7.37679C125.424 7.37679 123.804 8.84421 123.804 11.1857C123.804 13.5271 125.423 14.9695 128.237 14.9695C129.883 14.9695 131.103 14.5709 132.067 13.7076L131.192 12.7675C130.422 13.4502 129.611 13.7845 128.314 13.7845C126.54 13.7845 125.423 13.0374 125.282 11.5056H132.272C132.297 11.4287 132.311 11.3376 132.311 11.1714C132.311 8.69943 130.666 7.375 128.135 7.375V7.37679ZM125.348 10.4403C125.63 9.19275 126.672 8.56181 128.15 8.56181C129.538 8.56181 130.539 9.14091 130.861 10.4278L125.348 10.4403Z" fill="#2E35FF"/><path d="M144.615 7.38953C143.125 7.38953 141.917 8.16167 141.403 9.3449C141.042 8.18669 140.143 7.38953 138.563 7.38953C137.214 7.38953 136.109 8.02046 135.556 9.01066V7.64691H134.053V14.6998H135.556V11.2395C135.556 9.83285 136.673 8.65319 138.078 8.63889C138.09 8.63889 138.101 8.63889 138.114 8.63889C139.488 8.63889 140.105 9.43605 140.105 10.7373V14.7016H141.595L141.585 11.2449C141.581 9.89004 142.615 8.72111 143.966 8.64604C144.032 8.64247 144.098 8.64068 144.165 8.64068C145.54 8.64068 146.157 9.43784 146.157 10.739V14.7034H147.635V10.6497C147.635 8.82299 146.735 7.3931 144.615 7.3931V7.38953Z" fill="#2E35FF"/><path d="M153.73 7.37679C151.019 7.37679 149.398 8.84421 149.398 11.1857C149.398 13.5271 151.017 14.9695 153.832 14.9695C155.477 14.9695 156.698 14.5709 157.661 13.7076L156.787 12.7675C156.016 13.4502 155.206 13.7845 153.908 13.7845C152.134 13.7845 151.017 13.0374 150.876 11.5056H157.867C157.892 11.4287 157.906 11.3376 157.906 11.1714C157.906 8.69943 156.26 7.375 153.73 7.375V7.37679ZM150.942 10.4403C151.224 9.19275 152.266 8.56181 153.744 8.56181C155.133 8.56181 156.134 9.14091 156.455 10.4278L150.942 10.4403V10.4403Z" fill="#2E35FF"/><path d="M166.199 8.90681C165.596 8.0185 164.464 7.38756 162.96 7.38756C160.672 7.38756 159.157 8.89251 159.157 11.1839C159.157 13.4753 160.674 14.9552 162.96 14.9552C164.463 14.9552 165.594 14.3243 166.199 13.4503V14.6979H167.702V5.1748H166.199V8.90681ZM164.438 13.5414C164.095 13.638 163.729 13.6809 163.345 13.6809C161.598 13.6809 160.622 12.78 160.622 11.1839C160.622 9.5878 161.598 8.67446 163.345 8.67446C163.724 8.67446 164.086 8.71557 164.425 8.80851C165.482 9.09449 166.199 10.0811 166.199 11.1768C166.199 12.2688 165.487 13.2483 164.438 13.5414Z" fill="#2E35FF"/><path d="M171.554 7.64758H170.064V14.7005H171.554V7.64758Z" fill="#2E35FF"/><path d="M170.794 5.00818C170.241 5.00818 169.831 5.35671 169.831 5.84466C169.831 6.30759 170.241 6.68115 170.794 6.68115C171.348 6.68115 171.746 6.30759 171.746 5.84466C171.746 5.35493 171.348 5.00818 170.794 5.00818Z" fill="#2E35FF"/><path d="M180.246 11.1401C180.246 11.9998 179.819 12.8148 179.086 13.2635C178.598 13.562 178.033 13.7085 177.417 13.7085C176.016 13.7085 175.309 12.9614 175.309 11.5726V7.64758H173.819V11.6763C173.819 13.5816 174.886 14.9579 177.031 14.9579C178.47 14.9579 179.626 14.4556 180.244 13.4529V14.7005H181.747V7.64758H180.244V11.1419L180.246 11.1401Z" fill="#2E35FF"/><path d="M194.63 7.38953C193.14 7.38953 191.932 8.16167 191.418 9.3449C191.057 8.18669 190.158 7.38953 188.578 7.38953C187.229 7.38953 186.125 8.02046 185.571 9.01066V7.64691H184.069V14.6998H185.571V11.2395C185.571 9.83285 186.689 8.65319 188.093 8.63889C188.106 8.63889 188.116 8.63889 188.129 8.63889C189.503 8.63889 190.12 9.43605 190.12 10.7373V14.7016H191.611L191.6 11.2449C191.596 9.89004 192.63 8.72111 193.981 8.64604C194.047 8.64247 194.113 8.64068 194.181 8.64068C195.555 8.64068 196.172 9.43784 196.172 10.739V14.7034H197.65V10.6497C197.65 8.82299 196.75 7.3931 194.63 7.3931V7.38953Z" fill="#2E35FF"/><path d="M204.767 3.33522C202.931 3.33522 201.437 1.83919 201.437 0H200.188C200.188 1.83919 198.694 3.33522 196.857 3.33522V4.58637C198.694 4.58637 200.188 6.08239 200.188 7.92158H201.437C201.437 6.08239 202.931 4.58637 204.767 4.58637V3.33522ZM200.812 5.6141C200.414 4.93133 199.843 4.35937 199.161 3.96079C199.843 3.56042 200.412 2.99025 200.812 2.30748C201.212 2.99025 201.781 3.56042 202.463 3.96079C201.781 4.36116 201.212 4.93133 200.812 5.6141Z" fill="#2E35FF"/>
            <path d="M103.801 14.7718C103.164 14.7718 102.602 14.6111 102.115 14.2896C101.628 13.9648 101.247 13.5074 100.972 12.9174C100.697 12.3241 100.559 11.6231 100.559 10.8144C100.559 10.0123 100.697 9.31632 100.972 8.72636C101.247 8.1364 101.63 7.68067 102.12 7.35918C102.611 7.03768 103.177 6.87693 103.82 6.87693C104.318 6.87693 104.71 6.95979 104.999 7.12551C105.29 7.28792 105.512 7.47352 105.665 7.68233C105.821 7.88782 105.942 8.05686 106.028 8.18943H106.127V4.43091H107.301V14.6127H106.167V13.4394H106.028C105.942 13.5786 105.819 13.7543 105.66 13.9664C105.501 14.1752 105.274 14.3625 104.979 14.5282C104.684 14.6906 104.291 14.7718 103.801 14.7718ZM103.96 13.7178C104.43 13.7178 104.828 13.5952 105.153 13.3499C105.478 13.1014 105.725 12.7583 105.894 12.3208C106.063 11.88 106.147 11.3712 106.147 10.7945C106.147 10.2245 106.064 9.72565 105.899 9.2981C105.733 8.86723 105.488 8.53247 105.163 8.29383C104.838 8.05188 104.437 7.93091 103.96 7.93091C103.462 7.93091 103.048 8.05851 102.717 8.31372C102.389 8.56562 102.142 8.90865 101.976 9.34284C101.814 9.77371 101.732 10.2576 101.732 10.7945C101.732 11.3381 101.815 11.8319 101.981 12.2761C102.15 12.7169 102.399 13.0682 102.727 13.3301C103.058 13.5886 103.469 13.7178 103.96 13.7178Z" fill="#4B5563"/>
            <path d="M95.6658 14.7718C94.9764 14.7718 94.3715 14.6078 93.8512 14.2797C93.3341 13.9515 92.9298 13.4925 92.6381 12.9025C92.3497 12.3126 92.2056 11.6232 92.2056 10.8343C92.2056 10.0389 92.3497 9.34452 92.6381 8.75124C92.9298 8.15797 93.3341 7.69727 93.8512 7.36914C94.3715 7.04102 94.9764 6.87695 95.6658 6.87695C96.3552 6.87695 96.9584 7.04102 97.4754 7.36914C97.9958 7.69727 98.4002 8.15797 98.6885 8.75124C98.9802 9.34452 99.126 10.0389 99.126 10.8343C99.126 11.6232 98.9802 12.3126 98.6885 12.9025C98.4002 13.4925 97.9958 13.9515 97.4754 14.2797C96.9584 14.6078 96.3552 14.7718 95.6658 14.7718ZM95.6658 13.7179C96.1895 13.7179 96.6203 13.5836 96.9584 13.3152C97.2965 13.0467 97.5467 12.6937 97.7091 12.2562C97.8715 11.8187 97.9527 11.3448 97.9527 10.8343C97.9527 10.3239 97.8715 9.84831 97.7091 9.40749C97.5467 8.96668 97.2965 8.61038 96.9584 8.3386C96.6203 8.06682 96.1895 7.93093 95.6658 7.93093C95.1421 7.93093 94.7112 8.06682 94.3732 8.3386C94.0351 8.61038 93.7849 8.9667 93.6225 9.40749C93.4601 9.84831 93.3789 10.3239 93.3789 10.8343C93.3789 11.3448 93.4601 11.8187 93.6225 12.2562C93.7849 12.6937 94.0351 13.0467 94.3732 13.3152C94.7112 13.5837 95.1421 13.7179 95.6658 13.7179Z" fill="#4B5563"/>
            <path d="M78.9812 14.6128L76.6545 6.97644H77.8875L79.5381 12.823H79.6176L81.2483 6.97644H82.5011L84.1119 12.8031H84.1915L85.842 6.97644H87.075L84.7483 14.6128H83.5949L81.9244 8.74633H81.8051L80.1347 14.6128H78.9812Z" fill="#4B5563"/>
            <path d="M72.2595 14.7719C71.5702 14.7719 70.9653 14.6078 70.4449 14.2797C69.9279 13.9515 69.5235 13.4925 69.2318 12.9025C68.9435 12.3126 68.7993 11.6232 68.7993 10.8344C68.7993 10.0389 68.9435 9.34454 69.2318 8.75127C69.5235 8.15799 69.9279 7.69729 70.4449 7.36916C70.9653 7.04104 71.5702 6.87698 72.2595 6.87698C72.9489 6.87698 73.5522 7.04104 74.0692 7.36916C74.5896 7.69729 74.9939 8.15799 75.2823 8.75127C75.5739 9.34454 75.7198 10.0389 75.7198 10.8344C75.7198 11.6232 75.5739 12.3126 75.2823 12.9025C74.9939 13.4925 74.5896 13.9515 74.0692 14.2797C73.5522 14.6078 72.9489 14.7719 72.2595 14.7719ZM72.2595 13.7179C72.7832 13.7179 73.2141 13.5837 73.5522 13.3152C73.8902 13.0467 74.1405 12.6937 74.3029 12.2562C74.4653 11.8187 74.5465 11.3448 74.5465 10.8344C74.5465 10.3239 74.4653 9.84833 74.3029 9.40752C74.1405 8.9667 73.8902 8.6104 73.5522 8.33862C73.2141 8.06684 72.7832 7.93095 72.2595 7.93095C71.7359 7.93095 71.305 8.06684 70.9669 8.33862C70.6289 8.6104 70.3786 8.9667 70.2162 9.40752C70.0538 9.84833 69.9726 10.3239 69.9726 10.8344C69.9726 11.3448 70.0538 11.8187 70.2162 12.2562C70.3786 12.6937 70.6289 13.0467 70.9669 13.3152C71.305 13.5837 71.7359 13.7179 72.2595 13.7179ZM71.7226 5.94232L72.9357 3.6355H74.3078L72.7567 5.94232H71.7226Z" fill="#4B5563"/>
            <path d="M62.9502 11.8286L62.9303 10.3769H63.1689L66.5099 6.97636H67.9616L64.4019 10.5758H64.3025L62.9502 11.8286ZM61.8564 14.6127V4.43091H63.0297V14.6127H61.8564ZM66.7087 14.6127L63.7258 10.8343L64.561 10.019L68.2002 14.6127H66.7087Z" fill="#4B5563"/>
            <path d="M54.8193 17.4764C54.6204 17.4764 54.4431 17.4599 54.2874 17.4267C54.1316 17.3969 54.0239 17.3671 53.9642 17.3372L54.2625 16.3031C54.5475 16.3761 54.7994 16.4026 55.0182 16.3827C55.2369 16.3628 55.4308 16.265 55.5999 16.0894C55.7722 15.917 55.9296 15.637 56.0722 15.2492L56.2909 14.6526L53.467 6.97644H54.7398L56.8477 13.0617H56.9273L59.0352 6.97644H60.308L57.0665 15.7264C56.9206 16.1209 56.74 16.4473 56.5246 16.7058C56.3091 16.9677 56.0589 17.1616 55.7739 17.2875C55.4921 17.4135 55.174 17.4764 54.8193 17.4764Z" fill="#4B5563"/>
            <path d="M48.2517 14.7718C47.6154 14.7718 47.0536 14.6111 46.5664 14.2896C46.0791 13.9648 45.698 13.5074 45.4229 12.9174C45.1478 12.3241 45.0103 11.6231 45.0103 10.8144C45.0103 10.0123 45.1478 9.31632 45.4229 8.72636C45.698 8.1364 46.0808 7.68067 46.5713 7.35918C47.0619 7.03768 47.6286 6.87693 48.2716 6.87693C48.7688 6.87693 49.1615 6.95979 49.4499 7.12551C49.7416 7.28792 49.9636 7.47352 50.1161 7.68233C50.2719 7.88782 50.3928 8.05686 50.479 8.18943H50.5784V4.43091H51.7517V14.6127H50.6182V13.4394H50.479C50.3928 13.5786 50.2702 13.7543 50.1111 13.9664C49.952 14.1752 49.725 14.3625 49.43 14.5282C49.135 14.6906 48.7423 14.7718 48.2517 14.7718ZM48.4108 13.7178C48.8815 13.7178 49.2792 13.5952 49.604 13.3499C49.9288 13.1014 50.1757 12.7583 50.3448 12.3208C50.5138 11.88 50.5983 11.3712 50.5983 10.7945C50.5983 10.2245 50.5155 9.72565 50.3497 9.2981C50.184 8.86723 49.9388 8.53247 49.6139 8.29383C49.2891 8.05188 48.8881 7.93091 48.4108 7.93091C47.9137 7.93091 47.4994 8.05851 47.1679 8.31372C46.8398 8.56562 46.5929 8.90865 46.4272 9.34284C46.2648 9.77371 46.1836 10.2576 46.1836 10.7945C46.1836 11.3381 46.2664 11.8319 46.4321 12.2761C46.6012 12.7169 46.8497 13.0682 47.1779 13.3301C47.5093 13.5886 47.9203 13.7178 48.4108 13.7178Z" fill="#4B5563"/>
            <path d="M40.4215 14.7718C39.6857 14.7718 39.051 14.6094 38.5174 14.2846C37.9871 13.9565 37.5777 13.4991 37.2894 12.9125C37.0043 12.3225 36.8618 11.6364 36.8618 10.8542C36.8618 10.072 37.0043 9.38263 37.2894 8.78604C37.5777 8.18614 37.9788 7.71881 38.4925 7.38406C39.0095 7.04599 39.6128 6.87695 40.3022 6.87695C40.6999 6.87695 41.0926 6.94324 41.4804 7.07582C41.8682 7.20839 42.2212 7.42383 42.5394 7.72212C42.8576 8.0171 43.1111 8.4082 43.3 8.89542C43.4889 9.38263 43.5834 9.98254 43.5834 10.6951V11.1923H37.697V10.1781H42.3902C42.3902 9.74722 42.3041 9.36275 42.1317 9.02468C41.9627 8.68661 41.7207 8.4198 41.4059 8.22425C41.0943 8.0287 40.7264 7.93093 40.3022 7.93093C39.8348 7.93093 39.4305 8.04693 39.0891 8.27894C38.751 8.50763 38.4908 8.80593 38.3086 9.17383C38.1263 9.54173 38.0351 9.93614 38.0351 10.3571V11.0332C38.0351 11.6099 38.1345 12.0988 38.3334 12.4998C38.5356 12.8975 38.8157 13.2008 39.1736 13.4096C39.5316 13.6151 39.9475 13.7179 40.4215 13.7179C40.7297 13.7179 41.0081 13.6748 41.2567 13.5886C41.5086 13.4991 41.7257 13.3665 41.908 13.1909C42.0903 13.0119 42.2311 12.7898 42.3306 12.5247L43.4641 12.8429C43.3448 13.2273 43.1442 13.5654 42.8625 13.8571C42.5808 14.1454 42.2328 14.3708 41.8185 14.5332C41.4042 14.6923 40.9385 14.7718 40.4215 14.7718Z" fill="#4B5563"/>
            <path d="M25.0518 14.6127V6.97638H26.1853V8.16957H26.2847C26.4438 7.7619 26.7007 7.44537 27.0553 7.21999C27.4099 6.9913 27.8358 6.87695 28.333 6.87695C28.8368 6.87695 29.2561 6.9913 29.5908 7.21999C29.9289 7.44537 30.1924 7.7619 30.3813 8.16957H30.4608C30.6564 7.77515 30.9497 7.46194 31.3408 7.22994C31.7319 6.99461 32.2009 6.87695 32.7478 6.87695C33.4305 6.87695 33.989 7.09073 34.4232 7.51829C34.8574 7.94253 35.0745 8.60375 35.0745 9.50195V14.6127H33.9012V9.50195C33.9012 8.93851 33.7471 8.53581 33.4388 8.29386C33.1306 8.05191 32.7677 7.93093 32.3501 7.93093C31.8131 7.93093 31.3972 8.09334 31.1022 8.41815C30.8072 8.73964 30.6597 9.14731 30.6597 9.64116V14.6127H29.4665V9.38263C29.4665 8.94845 29.3257 8.59878 29.0439 8.33363C28.7622 8.06516 28.3993 7.93093 27.9552 7.93093C27.6502 7.93093 27.3652 8.01213 27.1001 8.17454C26.8382 8.33694 26.6261 8.56232 26.4637 8.85067C26.3046 9.13571 26.2251 9.4655 26.2251 9.84002V14.6127H25.0518Z" fill="#4B5563"/>
            <path d="M15.4728 14.7917C14.9889 14.7917 14.5497 14.7006 14.1553 14.5183C13.7609 14.3327 13.4477 14.0659 13.2157 13.7179C12.9837 13.3665 12.8677 12.9423 12.8677 12.4451C12.8677 12.0076 12.9539 11.653 13.1262 11.3812C13.2985 11.1061 13.5289 10.8907 13.8172 10.7349C14.1056 10.5791 14.4238 10.4631 14.7718 10.3869C15.1231 10.3074 15.4761 10.2444 15.8307 10.198C16.2948 10.1383 16.6709 10.0936 16.9593 10.0637C17.251 10.0306 17.4631 9.97591 17.5957 9.89968C17.7315 9.82345 17.7995 9.69087 17.7995 9.50195V9.46218C17.7995 8.97165 17.6653 8.59049 17.3968 8.31871C17.1316 8.04693 16.7289 7.91104 16.1887 7.91104C15.6286 7.91104 15.1894 8.03368 14.8712 8.27894C14.553 8.52421 14.3293 8.78604 14.2001 9.06445L13.0864 8.66673C13.2853 8.20271 13.5504 7.84144 13.8819 7.58292C14.2166 7.32108 14.5812 7.13879 14.9756 7.03604C15.3734 6.92998 15.7645 6.87695 16.1489 6.87695C16.3942 6.87695 16.6759 6.90678 16.9941 6.96644C17.3156 7.02279 17.6255 7.14045 17.9238 7.31942C18.2254 7.4984 18.4756 7.76852 18.6745 8.12979C18.8734 8.49106 18.9728 8.97496 18.9728 9.5815V14.6127H17.7995V13.5787H17.7398C17.6603 13.7444 17.5277 13.9217 17.3421 14.1106C17.1565 14.2995 16.9096 14.4603 16.6013 14.5929C16.2931 14.7254 15.9169 14.7917 15.4728 14.7917ZM15.6518 13.7377C16.1158 13.7377 16.5069 13.6466 16.8251 13.4643C17.1466 13.282 17.3885 13.0467 17.5509 12.7583C17.7166 12.47 17.7995 12.1667 17.7995 11.8485V10.7747C17.7498 10.8343 17.6404 10.889 17.4714 10.9387C17.3056 10.9851 17.1134 11.0266 16.8947 11.063C16.6792 11.0962 16.4688 11.126 16.2633 11.1525C16.0611 11.1757 15.897 11.1956 15.7711 11.2122C15.4662 11.252 15.1811 11.3166 14.916 11.4061C14.6541 11.4922 14.442 11.6232 14.2796 11.7988C14.1205 11.9712 14.041 12.2065 14.041 12.5048C14.041 12.9125 14.1918 13.2207 14.4934 13.4295C14.7983 13.635 15.1844 13.7377 15.6518 13.7377Z" fill="#4B5563"/>
            <path d="M11.0766 4.43091V14.6127H9.90332V4.43091H11.0766Z" fill="#4B5563"/>
            <path d="M3.14205 14.6127H0V4.43091H3.28125C4.26894 4.43091 5.11411 4.63474 5.81676 5.04241C6.51941 5.44677 7.058 6.02845 7.43253 6.78744C7.80705 7.54312 7.99432 8.44795 7.99432 9.50193C7.99432 10.5625 7.8054 11.4757 7.42756 12.2413C7.04972 13.0036 6.49953 13.5902 5.77699 14.0012C5.05445 14.4089 4.17614 14.6127 3.14205 14.6127ZM1.23295 13.519H3.0625C3.90436 13.519 4.60204 13.3566 5.15554 13.0318C5.70904 12.707 6.12169 12.2446 6.39347 11.6447C6.66525 11.0448 6.80114 10.3305 6.80114 9.50193C6.80114 8.67996 6.6669 7.97234 6.39844 7.37906C6.12997 6.78247 5.72893 6.32508 5.19531 6.0069C4.6617 5.68541 3.99716 5.52466 3.2017 5.52466H1.23295V13.519Z" fill="#4B5563"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

function Sidebar({ active, setActive, theme, setTheme, profile }) {
  const displayName = profile && profile.firstName ? `Dr ${profile.firstName} ${profile.lastName}` : "Dr Kowalska";
  const roleLabel = profile && profile.role ? (OB_ROLES.find(r => r.id === profile.role)?.label || "") : "Rezydent";
  return (
    <aside className="sticky top-0 flex h-screen shrink-0 flex-col bg-bg" style={{ width: 'var(--sidebar-w)' }}>
      {/* Logo */}
      <div className="px-5 pb-4 pt-7">
        <div className="mb-3.5 flex cursor-pointer items-center" onClick={() => setActive("overview")}>
          <svg width="126" height="22" className="block dark:hidden" viewBox="0 0 178 31" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M27.125 0H3.875C1.7349 0 0 1.7349 0 3.875V27.125C0 29.2651 1.7349 31 3.875 31H27.125C29.2651 31 31 29.2651 31 27.125V3.875C31 1.7349 29.2651 0 27.125 0Z" fill="#0E0E10"/>
            <path d="M15.6838 15.0354L22.8913 10.2498L19.8979 5.09602L8.10822 12.5554L8.13728 12.6038C8.13728 12.6038 8.1179 12.6038 8.10822 12.6038V18.5616C12.0801 18.5616 15.306 21.8651 15.306 25.9145H21.2638C21.2638 21.4291 19.0551 17.4573 15.6838 15.0451V15.0354Z" fill="#CEFF3E"/>
            <path d="M170.654 23.3242C169.89 23.3242 169.201 23.1881 168.589 22.9159C167.982 22.6384 167.5 22.2301 167.144 21.691C166.794 21.1518 166.618 20.487 166.618 19.6966C166.618 19.0161 166.744 18.4534 166.995 18.0084C167.246 17.5635 167.589 17.2075 168.024 16.9406C168.458 16.6736 168.948 16.4721 169.492 16.336C170.042 16.1946 170.61 16.0925 171.196 16.0297C171.903 15.9564 172.476 15.891 172.915 15.8334C173.355 15.7706 173.674 15.6764 173.873 15.5508C174.078 15.4199 174.18 15.2184 174.18 14.9462V14.899C174.18 14.3075 174.004 13.8495 173.654 13.525C173.303 13.2004 172.798 13.0381 172.138 13.0381C171.442 13.0381 170.89 13.1899 170.481 13.4935C170.078 13.7972 169.806 14.1557 169.665 14.5693L167.011 14.1924C167.22 13.4595 167.566 12.8471 168.047 12.355C168.529 11.8577 169.118 11.4861 169.814 11.24C170.51 10.9888 171.28 10.8631 172.122 10.8631C172.703 10.8631 173.282 10.9312 173.858 11.0673C174.433 11.2034 174.96 11.4285 175.436 11.7426C175.912 12.0514 176.294 12.4728 176.582 13.0067C176.875 13.5407 177.022 14.2081 177.022 15.009V23.0808H174.29V21.424H174.195C174.023 21.759 173.779 22.0731 173.465 22.3662C173.156 22.6542 172.766 22.8871 172.295 23.0651C171.829 23.2378 171.282 23.3242 170.654 23.3242ZM171.392 21.2356C171.963 21.2356 172.457 21.123 172.876 20.8979C173.295 20.6676 173.617 20.364 173.842 19.9871C174.072 19.6102 174.187 19.1993 174.187 18.7544V17.3332C174.098 17.4064 173.947 17.4745 173.732 17.5373C173.523 17.6001 173.287 17.6551 173.025 17.7022C172.764 17.7493 172.505 17.7912 172.248 17.8278C171.992 17.8645 171.769 17.8959 171.581 17.922C171.157 17.9796 170.777 18.0738 170.442 18.2047C170.107 18.3356 169.843 18.5188 169.649 18.7544C169.455 18.9847 169.359 19.283 169.359 19.6495C169.359 20.1729 169.55 20.5682 169.932 20.8351C170.314 21.1021 170.801 21.2356 171.392 21.2356Z" fill="#0E0E10"/>
            <path d="M157.555 19.2962L157.547 15.8649H158.002L162.336 11.0202H165.658L160.326 16.9563H159.737L157.555 19.2962ZM154.963 23.0808V7H157.806V23.0808H154.963ZM162.533 23.0808L158.607 17.5923L160.523 15.59L165.933 23.0808H162.533Z" fill="#0E0E10"/>
            <path d="M144.359 27.6035C143.971 27.6035 143.613 27.5721 143.283 27.5093C142.959 27.4517 142.699 27.3836 142.506 27.3051L143.165 25.0909C143.579 25.2113 143.948 25.2689 144.272 25.2636C144.597 25.2584 144.882 25.1563 145.128 24.9574C145.38 24.7637 145.592 24.4392 145.764 23.9838L146.008 23.332L141.634 11.0202H144.649L147.429 20.1284H147.555L150.342 11.0202H153.365L148.536 24.5412C148.311 25.1799 148.013 25.7269 147.641 26.1823C147.269 26.6429 146.814 26.9937 146.275 27.2345C145.741 27.4805 145.102 27.6035 144.359 27.6035Z" fill="#0E0E10"/>
            <path d="M133.509 23.2928C132.561 23.2928 131.713 23.0494 130.965 22.5626C130.216 22.0757 129.625 21.3691 129.19 20.4425C128.756 19.516 128.539 18.3906 128.539 17.0662C128.539 15.7261 128.758 14.5955 129.198 13.6742C129.643 12.7476 130.242 12.0488 130.996 11.5777C131.75 11.1013 132.59 10.8632 133.517 10.8632C134.223 10.8632 134.804 10.9836 135.26 11.2243C135.715 11.4599 136.076 11.7452 136.343 12.0802C136.61 12.41 136.817 12.7215 136.964 13.0146H137.081V7H139.932V23.0808H137.136V21.1806H136.964C136.817 21.4738 136.605 21.7852 136.328 22.115C136.05 22.4395 135.684 22.717 135.228 22.9473C134.773 23.1776 134.2 23.2928 133.509 23.2928ZM134.302 20.9608C134.904 20.9608 135.417 20.7985 135.841 20.4739C136.265 20.1442 136.587 19.6861 136.807 19.0999C137.027 18.5136 137.136 17.8305 137.136 17.0505C137.136 16.2705 137.027 15.5926 136.807 15.0168C136.592 14.441 136.273 13.9935 135.849 13.6742C135.43 13.3548 134.914 13.1952 134.302 13.1952C133.669 13.1952 133.14 13.3601 132.716 13.6899C132.292 14.0196 131.972 14.4751 131.758 15.0561C131.543 15.6371 131.436 16.3019 131.436 17.0505C131.436 17.8043 131.543 18.4769 131.758 19.0684C131.978 19.6547 132.3 20.118 132.724 20.4582C133.153 20.7933 133.679 20.9608 134.302 20.9608Z" fill="#0E0E10"/>
            <path d="M121.634 23.3163C120.425 23.3163 119.381 23.0651 118.501 22.5625C117.627 22.0548 116.954 21.3376 116.483 20.4111C116.012 19.4793 115.777 18.3827 115.777 17.1211C115.777 15.8805 116.012 14.7917 116.483 13.8547C116.96 12.9125 117.624 12.1797 118.478 11.6562C119.331 11.1275 120.333 10.8631 121.485 10.8631C122.228 10.8631 122.93 10.9835 123.589 11.2243C124.254 11.4599 124.84 11.8263 125.348 12.3236C125.861 12.8209 126.264 13.4543 126.557 14.2238C126.851 14.988 126.997 15.8989 126.997 16.9563V17.8278H117.112V15.9119H124.272C124.267 15.3675 124.149 14.8833 123.919 14.4593C123.689 14.0301 123.367 13.6925 122.953 13.4464C122.545 13.2004 122.069 13.0774 121.524 13.0774C120.943 13.0774 120.433 13.2187 119.993 13.5014C119.553 13.7788 119.211 14.1453 118.965 14.6007C118.724 15.0508 118.601 15.5455 118.596 16.0847V17.7572C118.596 18.4586 118.724 19.0606 118.98 19.5631C119.237 20.0604 119.595 20.4425 120.056 20.7095C120.517 20.9712 121.056 21.1021 121.673 21.1021C122.087 21.1021 122.461 21.0445 122.796 20.9293C123.131 20.8089 123.422 20.6336 123.668 20.4033C123.914 20.1729 124.1 19.8876 124.225 19.5474L126.879 19.8458C126.712 20.5472 126.393 21.1597 125.921 21.6831C125.456 22.2014 124.859 22.6044 124.131 22.8923C123.404 23.175 122.571 23.3163 121.634 23.3163Z" fill="#0E0E10"/>
            <path d="M96.7509 7H100.316L105.09 18.6523H105.278L110.052 7H113.617V23.0808H110.822V12.0331H110.672L106.228 23.0337H104.14L99.6953 12.0095H99.5461V23.0808H96.7509V7Z" fill="#0E0E10"/>
            <path d="M78.0759 23.0808V7H80.9183V13.0146H81.0361C81.1827 12.7215 81.3895 12.41 81.6564 12.0802C81.9234 11.7452 82.2846 11.4599 82.74 11.2243C83.1954 10.9836 83.7764 10.8632 84.4831 10.8632C85.4149 10.8632 86.255 11.1013 87.0036 11.5777C87.7574 12.0488 88.3541 12.7476 88.7938 13.6742C89.2388 14.5955 89.4613 15.7261 89.4613 17.0662C89.4613 18.3906 89.244 19.516 88.8095 20.4425C88.3751 21.3691 87.7836 22.0757 87.035 22.5626C86.2864 23.0494 85.4384 23.2928 84.491 23.2928C83.8 23.2928 83.2268 23.1776 82.7714 22.9473C82.316 22.717 81.9496 22.4395 81.6721 22.115C81.3999 21.7852 81.1879 21.4738 81.0361 21.1806H80.8712V23.0808H78.0759ZM80.8634 17.0505C80.8634 17.8305 80.9733 18.5136 81.1932 19.0999C81.4182 19.6861 81.7402 20.1442 82.1589 20.4739C82.5829 20.7985 83.0959 20.9608 83.6979 20.9608C84.3261 20.9608 84.8522 20.7933 85.2762 20.4582C85.7002 20.118 86.0195 19.6547 86.2341 19.0684C86.454 18.4769 86.5639 17.8043 86.5639 17.0505C86.5639 16.3019 86.4566 15.6371 86.242 15.0561C86.0273 14.4751 85.708 14.0196 85.284 13.6899C84.86 13.3601 84.3313 13.1952 83.6979 13.1952C83.0907 13.1952 82.5751 13.3548 82.1511 13.6742C81.7271 13.9935 81.4052 14.441 81.1853 15.0168C80.9707 15.5926 80.8634 16.2705 80.8634 17.0505Z" fill="#0E0E10"/>
            <path d="M72.5535 18.0084V11.0202H75.3959V23.0808H72.6399V20.9372H72.5143C72.2421 21.6125 71.7945 22.1647 71.1716 22.594C70.5539 23.0232 69.7922 23.2378 68.8867 23.2378C68.0962 23.2378 67.3974 23.0625 66.7902 22.7117C66.1882 22.3558 65.7171 21.8402 65.3768 21.1649C65.0366 20.4844 64.8665 19.6626 64.8665 18.6994V11.0202H67.7089V18.2597C67.7089 19.0239 67.9182 19.6312 68.337 20.0813C68.7558 20.5315 69.3054 20.7566 69.9859 20.7566C70.4047 20.7566 70.8104 20.6545 71.203 20.4504C71.5956 20.2462 71.9175 19.9426 72.1688 19.5396C72.4253 19.1313 72.5535 18.6209 72.5535 18.0084Z" fill="#0E0E10"/>
            <path d="M62.3121 7V23.0808H59.4697V7H62.3121Z" fill="#0E0E10"/>
            <path d="M45 23.0808V7H47.9131V14.3887H48.1094L54.3831 7H57.94L51.7213 14.2159L57.995 23.0808H54.493L49.6955 16.1868L47.9131 18.2911V23.0808H45Z" fill="#0E0E10"/>
          </svg>
          <svg width="126" height="22" className="hidden dark:block" viewBox="0 0 178 31" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M27.125 0C29.2651 0 31 1.7349 31 3.875V27.125C31 29.2651 29.2651 31 27.125 31H3.875C1.7349 31 0 29.2651 0 27.125V3.875C0 1.7349 1.7349 0 3.875 0H27.125ZM8.1084 12.5557L8.1377 12.6035C8.1377 12.6035 8.11814 12.6035 8.1084 12.6035V18.5615C12.0801 18.5616 15.3055 21.8649 15.3057 25.9141H21.2637C21.2635 21.4289 19.0547 17.457 15.6836 15.0449V15.0352L22.8916 10.25L19.8975 5.0957L8.1084 12.5557Z" fill="#CEFF3E"/>
            <path d="M170.654 23.3242C169.89 23.3242 169.201 23.1881 168.589 22.9159C167.982 22.6384 167.5 22.2301 167.144 21.691C166.794 21.1518 166.618 20.487 166.618 19.6966C166.618 19.0161 166.744 18.4534 166.995 18.0084C167.246 17.5635 167.589 17.2075 168.024 16.9406C168.458 16.6736 168.948 16.4721 169.492 16.336C170.042 16.1946 170.61 16.0925 171.196 16.0297C171.903 15.9564 172.476 15.891 172.915 15.8334C173.355 15.7706 173.674 15.6764 173.873 15.5508C174.078 15.4199 174.18 15.2184 174.18 14.9462V14.899C174.18 14.3075 174.004 13.8495 173.654 13.525C173.303 13.2004 172.798 13.0381 172.138 13.0381C171.442 13.0381 170.89 13.1899 170.481 13.4935C170.078 13.7972 169.806 14.1557 169.665 14.5693L167.011 14.1924C167.22 13.4595 167.566 12.8471 168.047 12.355C168.529 11.8577 169.118 11.4861 169.814 11.24C170.51 10.9888 171.28 10.8631 172.122 10.8631C172.703 10.8631 173.282 10.9312 173.858 11.0673C174.433 11.2034 174.96 11.4285 175.436 11.7426C175.912 12.0514 176.294 12.4728 176.582 13.0067C176.875 13.5407 177.022 14.2081 177.022 15.009V23.0808H174.29V21.424H174.195C174.023 21.759 173.779 22.0731 173.465 22.3662C173.156 22.6542 172.766 22.8871 172.295 23.0651C171.829 23.2378 171.282 23.3242 170.654 23.3242ZM171.392 21.2356C171.963 21.2356 172.457 21.123 172.876 20.8979C173.295 20.6676 173.617 20.364 173.842 19.9871C174.072 19.6102 174.187 19.1993 174.187 18.7544V17.3332C174.098 17.4064 173.947 17.4745 173.732 17.5373C173.523 17.6001 173.287 17.6551 173.025 17.7022C172.764 17.7493 172.505 17.7912 172.248 17.8278C171.992 17.8645 171.769 17.8959 171.581 17.922C171.157 17.9796 170.777 18.0738 170.442 18.2047C170.107 18.3356 169.843 18.5188 169.649 18.7544C169.455 18.9847 169.359 19.283 169.359 19.6495C169.359 20.1729 169.55 20.5682 169.932 20.8351C170.314 21.1021 170.801 21.2356 171.392 21.2356Z" fill="white"/>
            <path d="M157.555 19.2962L157.547 15.8649H158.002L162.336 11.0202H165.658L160.326 16.9563H159.737L157.555 19.2962ZM154.963 23.0808V7H157.806V23.0808H154.963ZM162.533 23.0808L158.607 17.5923L160.523 15.59L165.933 23.0808H162.533Z" fill="white"/>
            <path d="M144.359 27.6035C143.971 27.6035 143.613 27.5721 143.283 27.5093C142.959 27.4517 142.699 27.3836 142.506 27.3051L143.165 25.0909C143.579 25.2113 143.948 25.2689 144.272 25.2636C144.597 25.2584 144.882 25.1563 145.128 24.9574C145.38 24.7637 145.592 24.4392 145.764 23.9838L146.008 23.332L141.634 11.0202H144.649L147.429 20.1284H147.555L150.342 11.0202H153.365L148.536 24.5412C148.311 25.1799 148.013 25.7269 147.641 26.1823C147.269 26.6429 146.814 26.9937 146.275 27.2345C145.741 27.4805 145.102 27.6035 144.359 27.6035Z" fill="white"/>
            <path d="M133.509 23.2928C132.561 23.2928 131.713 23.0494 130.965 22.5626C130.216 22.0757 129.625 21.3691 129.19 20.4425C128.756 19.516 128.539 18.3906 128.539 17.0662C128.539 15.7261 128.758 14.5955 129.198 13.6742C129.643 12.7476 130.242 12.0488 130.996 11.5777C131.75 11.1013 132.59 10.8632 133.517 10.8632C134.223 10.8632 134.804 10.9836 135.26 11.2243C135.715 11.4599 136.076 11.7452 136.343 12.0802C136.61 12.41 136.817 12.7215 136.964 13.0146H137.081V7H139.932V23.0808H137.136V21.1806H136.964C136.817 21.4738 136.605 21.7852 136.328 22.115C136.05 22.4395 135.684 22.717 135.228 22.9473C134.773 23.1776 134.2 23.2928 133.509 23.2928ZM134.302 20.9608C134.904 20.9608 135.417 20.7985 135.841 20.4739C136.265 20.1442 136.587 19.6861 136.807 19.0999C137.027 18.5136 137.136 17.8305 137.136 17.0505C137.136 16.2705 137.027 15.5926 136.807 15.0168C136.592 14.441 136.273 13.9935 135.849 13.6742C135.43 13.3548 134.914 13.1952 134.302 13.1952C133.669 13.1952 133.14 13.3601 132.716 13.6899C132.292 14.0196 131.972 14.4751 131.758 15.0561C131.543 15.6371 131.436 16.3019 131.436 17.0505C131.436 17.8043 131.543 18.4769 131.758 19.0684C131.978 19.6547 132.3 20.118 132.724 20.4582C133.153 20.7933 133.679 20.9608 134.302 20.9608Z" fill="white"/>
            <path d="M121.634 23.3163C120.425 23.3163 119.381 23.0651 118.501 22.5625C117.627 22.0548 116.954 21.3376 116.483 20.4111C116.012 19.4793 115.777 18.3827 115.777 17.1211C115.777 15.8805 116.012 14.7917 116.483 13.8547C116.96 12.9125 117.625 12.1797 118.478 11.6562C119.331 11.1275 120.333 10.8631 121.485 10.8631C122.228 10.8631 122.93 10.9835 123.589 11.2243C124.254 11.4599 124.84 11.8263 125.348 12.3236C125.861 12.8209 126.264 13.4543 126.557 14.2238C126.851 14.988 126.997 15.8989 126.997 16.9563V17.8278H117.112V15.9119H124.273C124.267 15.3675 124.149 14.8833 123.919 14.4593C123.689 14.0301 123.367 13.6925 122.953 13.4464C122.545 13.2004 122.069 13.0774 121.524 13.0774C120.943 13.0774 120.433 13.2187 119.993 13.5014C119.553 13.7788 119.211 14.1453 118.965 14.6007C118.724 15.0508 118.601 15.5455 118.596 16.0847V17.7572C118.596 18.4586 118.724 19.0606 118.98 19.5631C119.237 20.0604 119.595 20.4425 120.056 20.7095C120.517 20.9712 121.056 21.1021 121.674 21.1021C122.087 21.1021 122.461 21.0445 122.796 20.9293C123.131 20.8089 123.422 20.6336 123.668 20.4033C123.914 20.1729 124.1 19.8876 124.225 19.5474L126.879 19.8458C126.712 20.5472 126.393 21.1597 125.921 21.6831C125.456 22.2014 124.859 22.6044 124.131 22.8923C123.404 23.175 122.571 23.3163 121.634 23.3163Z" fill="white"/>
            <path d="M96.7509 7H100.316L105.09 18.6523H105.278L110.052 7H113.617V23.0808H110.822V12.0331H110.672L106.228 23.0337H104.14L99.6954 12.0095H99.5462V23.0808H96.7509V7Z" fill="white"/>
            <path d="M78.076 23.0808V7H80.9184V13.0146H81.0361C81.1827 12.7215 81.3895 12.41 81.6564 12.0802C81.9234 11.7452 82.2846 11.4599 82.74 11.2243C83.1954 10.9836 83.7765 10.8632 84.4831 10.8632C85.4149 10.8632 86.2551 11.1013 87.0036 11.5777C87.7574 12.0488 88.3542 12.7476 88.7939 13.6742C89.2388 14.5955 89.4613 15.7261 89.4613 17.0662C89.4613 18.3906 89.244 19.516 88.8096 20.4425C88.3751 21.3691 87.7836 22.0757 87.035 22.5626C86.2865 23.0494 85.4385 23.2928 84.491 23.2928C83.8 23.2928 83.2268 23.1776 82.7714 22.9473C82.316 22.717 81.9496 22.4395 81.6721 22.115C81.3999 21.7852 81.1879 21.4738 81.0361 21.1806H80.8713V23.0808H78.076ZM80.8634 17.0505C80.8634 17.8305 80.9733 18.5136 81.1932 19.0999C81.4183 19.6861 81.7402 20.1442 82.159 20.4739C82.583 20.7985 83.096 20.9608 83.698 20.9608C84.3261 20.9608 84.8522 20.7933 85.2762 20.4582C85.7002 20.118 86.0195 19.6547 86.2341 19.0684C86.454 18.4769 86.5639 17.8043 86.5639 17.0505C86.5639 16.3019 86.4566 15.6371 86.242 15.0561C86.0274 14.4751 85.7081 14.0196 85.284 13.6899C84.86 13.3601 84.3313 13.1952 83.698 13.1952C83.0907 13.1952 82.5751 13.3548 82.1511 13.6742C81.7271 13.9935 81.4052 14.441 81.1853 15.0168C80.9707 15.5926 80.8634 16.2705 80.8634 17.0505Z" fill="white"/>
            <path d="M72.5535 18.0084V11.0202H75.3959V23.0808H72.6399V20.9372H72.5143C72.2421 21.6125 71.7945 22.1647 71.1716 22.594C70.5539 23.0232 69.7922 23.2378 68.8867 23.2378C68.0962 23.2378 67.3974 23.0625 66.7902 22.7117C66.1882 22.3558 65.7171 21.8402 65.3768 21.1649C65.0366 20.4844 64.8665 19.6626 64.8665 18.6994V11.0202H67.7089V18.2597C67.7089 19.0239 67.9182 19.6312 68.337 20.0813C68.7558 20.5315 69.3054 20.7566 69.9859 20.7566C70.4047 20.7566 70.8104 20.6545 71.203 20.4504C71.5956 20.2462 71.9175 19.9426 72.1688 19.5396C72.4253 19.1313 72.5535 18.6209 72.5535 18.0084Z" fill="white"/>
            <path d="M62.3121 7V23.0808H59.4697V7H62.3121Z" fill="white"/>
            <path d="M45 23.0808V7H47.9131V14.3887H48.1094L54.3831 7H57.94L51.7213 14.2159L57.995 23.0808H54.493L49.6955 16.1868L47.9131 18.2911V23.0808H45Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3.5">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className="mb-6">
            {section.header && (
              <div className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-muted">{section.header}</div>
            )}
            {section.items.map(item => {
              const isActive = active === item.id;
              const baseCls = "mb-1 flex w-full items-center justify-between rounded-md border-none px-2.5 py-2.5 text-left text-[13px] transition-[background,color] duration-100";
              const stateCls = item.soon
                ? "cursor-default bg-transparent font-normal text-muted opacity-60 hover:bg-transparent hover:text-muted"
                : isActive
                  ? "bg-accent-bg font-semibold text-accent [&_svg]:opacity-100"
                  : "bg-transparent font-normal text-fg hover:bg-secondary hover:text-fg";
              return (
                <button key={item.id} onClick={() => !item.soon && setActive(item.id)} className={`${baseCls} ${stateCls}`}>
                  <span className="flex items-center gap-2.5 [&_svg]:shrink-0 [&_svg]:opacity-70">
                    {item.icon && (
                      <motion.span
                        key={isActive ? "active" : "idle"}
                        initial={isActive ? { scale: 0.6, rotate: -15 } : false}
                        animate={isActive ? { scale: 1, rotate: 0 } : { scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        style={{ display: "inline-flex" }}
                      >
                        {ICONS[item.icon]}
                      </motion.span>
                    )}
                    {item.label}
                  </span>
                  {item.badge && !isActive && (
                    <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-warn-bg text-[10px] font-bold text-warn">{item.badge}</span>
                  )}
                  {item.tag && (
                    <span className="rounded-[10px] bg-lime px-2 py-0.5 text-[9px] font-semibold tracking-[0.02em] text-lime-fg">{item.tag}</span>
                  )}
                  {item.soon && (
                    <span className="rounded-[10px] bg-secondary px-[7px] py-px text-[9px] text-muted">wkrótce</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User profile */}
      <div className="flex cursor-pointer items-center gap-2.5 px-4 py-3.5 transition-colors duration-150 hover:bg-secondary" onClick={() => setActive("profile")}>
        <img className="h-9 w-9 shrink-0 rounded-full object-cover" src={USER_AVATAR} alt={displayName} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-fg">{displayName}</div>
          <div className="text-[11px] text-muted">{roleLabel}</div>
        </div>
      </div>
    </aside>
  );
}

// ─── TOP BAR ──────────────────────────────────────────────────────────────────

function TopBar({ active, setActive, cart, onCartClick, onNotifClick, theme, setTheme }) {
  const label = NAV_SECTIONS.flatMap(s => s.items).find(i => i.id === active)?.label || "";
  const cartCount = cart ? cart.reduce((s, i) => s + i.qty, 0) : 0;
  const [themeOpen, setThemeOpen] = useState(false);
  const themeIconPaths = theme === "dark"
    ? <g transform="translate(11,11) scale(0.75)"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="var(--color-fg)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></g>
    : theme === "light"
    ? <g transform="translate(11,11) scale(0.75)"><circle cx="12" cy="12" r="5" stroke="var(--color-fg)" strokeWidth="1.8" fill="none"/><line x1="12" y1="1" x2="12" y2="3" stroke="var(--color-fg)" strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="21" x2="12" y2="23" stroke="var(--color-fg)" strokeWidth="1.8" strokeLinecap="round"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="var(--color-fg)" strokeWidth="1.8" strokeLinecap="round"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="var(--color-fg)" strokeWidth="1.8" strokeLinecap="round"/><line x1="1" y1="12" x2="3" y2="12" stroke="var(--color-fg)" strokeWidth="1.8" strokeLinecap="round"/><line x1="21" y1="12" x2="23" y2="12" stroke="var(--color-fg)" strokeWidth="1.8" strokeLinecap="round"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="var(--color-fg)" strokeWidth="1.8" strokeLinecap="round"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="var(--color-fg)" strokeWidth="1.8" strokeLinecap="round"/></g>
    : <g transform="translate(11,11) scale(0.75)"><circle cx="12" cy="12" r="9" stroke="var(--color-fg)" strokeWidth="1.8" fill="none"/><path d="M12 3a9 9 0 010 18" fill="var(--color-fg)"/></g>;
  return (
    <header className="topbar z-10 flex h-14 items-center justify-between bg-bg px-8 transition-[transform,margin-top] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]">
      <span className="text-[13px] text-muted"></span>
      <div className="flex items-center gap-2">
        <button className="relative flex h-8 w-8 cursor-pointer items-center justify-center border-none bg-transparent p-0 transition-opacity duration-150 ease-out hover:opacity-70 [&_svg]:h-8 [&_svg]:w-8" onClick={() => setActive("profile")} title="Profil">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="20" fill="var(--color-secondary)"/>
            <path d="M24.6668 26V24.6667C24.6668 23.9594 24.3859 23.2811 23.8858 22.781C23.3857 22.281 22.7074 22 22.0002 22H18.0002C17.2929 22 16.6146 22.281 16.1145 22.781C15.6144 23.2811 15.3335 23.9594 15.3335 24.6667V26M22.6668 16.6667C22.6668 18.1394 21.4729 19.3333 20.0002 19.3333C18.5274 19.3333 17.3335 18.1394 17.3335 16.6667C17.3335 15.1939 18.5274 14 20.0002 14C21.4729 14 22.6668 15.1939 22.6668 16.6667Z" stroke="var(--color-fg)" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="relative flex h-8 w-8 cursor-pointer items-center justify-center border-none bg-transparent p-0 transition-opacity duration-150 ease-out hover:opacity-70 [&_svg]:h-8 [&_svg]:w-8" title="Powiadomienia" onClick={onNotifClick}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="20" fill="var(--color-secondary)"/>
            <path d="M18.8667 26.0002C18.9783 26.2031 19.1423 26.3724 19.3417 26.4903C19.5411 26.6082 19.7684 26.6704 20 26.6704C20.2316 26.6704 20.459 26.6082 20.6584 26.4903C20.8577 26.3724 21.0218 26.2031 21.1334 26.0002M16 17.3335C16 16.2726 16.4214 15.2552 17.1716 14.5051C17.9217 13.7549 18.9391 13.3335 20 13.3335C21.0609 13.3335 22.0783 13.7549 22.8284 14.5051C23.5786 15.2552 24 16.2726 24 17.3335C24 22.0002 26 23.3335 26 23.3335H14C14 23.3335 16 22.0002 16 17.3335Z" stroke="var(--color-fg)" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="absolute right-0 top-0 h-[7px] w-[7px] rounded-full border-[1.5px] border-white bg-red" />
        </button>
        <button className="relative flex h-8 w-8 cursor-pointer items-center justify-center border-none bg-transparent p-0 transition-opacity duration-150 ease-out hover:opacity-70 [&_svg]:h-8 [&_svg]:w-8" onClick={onCartClick} title="Koszyk">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="20" fill="var(--color-secondary)"/>
            <path d="M13.3667 13.3667H14.7L16.4734 21.6467C16.5384 21.9499 16.7071 22.221 16.9505 22.4133C17.1939 22.6055 17.4966 22.7069 17.8067 22.7H24.3267C24.6301 22.6995 24.9244 22.5956 25.1607 22.4053C25.3971 22.215 25.5615 21.9497 25.6267 21.6534L26.7267 16.7H15.4134M18.0002 26C18.0002 26.3682 17.7017 26.6667 17.3335 26.6667C16.9653 26.6667 16.6668 26.3682 16.6668 26C16.6668 25.6318 16.9653 25.3333 17.3335 25.3333C17.7017 25.3333 18.0002 25.6318 18.0002 26ZM25.3335 26C25.3335 26.3682 25.035 26.6667 24.6668 26.6667C24.2986 26.6667 24.0002 26.3682 24.0002 26C24.0002 25.6318 24.2986 25.3333 24.6668 25.3333C25.035 25.3333 25.3335 25.6318 25.3335 26Z" stroke="var(--color-fg)" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {cartCount > 0 && <span className="topbar__cart-badge">{cartCount}</span>}
        </button>
        <div className="relative">
          <button className="relative flex h-8 w-8 cursor-pointer items-center justify-center border-none bg-transparent p-0 transition-opacity duration-150 ease-out hover:opacity-70 [&_svg]:h-8 [&_svg]:w-8" onClick={() => setThemeOpen(!themeOpen)} title="Motyw">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="20" fill="var(--color-secondary)"/>
              {themeIconPaths}
            </svg>
          </button>
          <AnimatePresence>
            {themeOpen && (
              <>
                <div className="fixed inset-0 z-[9]" onClick={() => setThemeOpen(false)} />
                <motion.div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[150px] rounded-lg border border-border bg-bg p-1 shadow-lg" initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -4 }} transition={{ duration: 0.15 }}>
                  {[
                    { id: "light", label: "Jasny", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> },
                    { id: "dark", label: "Ciemny", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg> },
                    { id: "system", label: "Auto", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
                  ].map(m => (
                    <button key={m.id} className={`flex w-full cursor-pointer items-center gap-2 rounded-md border-none bg-transparent px-3 py-2 text-[13px] text-fg transition-colors duration-150 ease-out hover:bg-secondary ${theme === m.id ? "bg-secondary font-semibold" : ""}`} onClick={() => { setTheme(m.id); setThemeOpen(false); }}>
                      {m.icon}
                      {m.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        <a href="https://remedium.md" target="_blank" rel="noopener noreferrer" className="ml-6 flex h-8 items-center gap-1.5 rounded-full bg-accent py-1 pl-1 pr-2 text-[13px] font-medium text-white no-underline transition-opacity duration-150 ease-out hover:opacity-90 [&_svg]:shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="h-6 w-6 shrink-0">
            <rect width="24" height="24" rx="12" fill="white"/>
            <path d="M19 10.8944C15.7495 10.8944 13.1056 8.25045 13.1056 5H10.8944C10.8944 8.25045 8.25045 10.8944 5 10.8944V13.1056C8.25045 13.1056 10.8944 15.7495 10.8944 19H13.1056C13.1056 15.7495 15.7495 13.1056 19 13.1056V10.8944ZM12 14.9219C11.2956 13.7153 10.2847 12.7044 9.07807 12C10.2847 11.2924 11.2924 10.2847 12 9.07807C12.7076 10.2847 13.7153 11.2924 14.9219 12C13.7153 12.7076 12.7076 13.7153 12 14.9219Z" fill="#2E35FF"/>
          </svg>
          <span>Remedium</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
        </a>
      </div>
    </header>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────

const CONTACT_SLOTS = [
  { id: "now",       label: "Jak najszybciej" },
  { id: "today",     label: "Dziś po 16:00" },
  { id: "tomorrow",  label: "Jutro rano (9:00–12:00)" },
  { id: "week",      label: "W tym tygodniu" },
];

// ─── Personalization helpers ───

function getPersonalizedDiscounts(profile) {
  const { role, work, interests } = profile;
  const scored = DISCOUNTS.map(d => {
    let score = 0;
    if (interests.includes("accounting") && d.category === "finanse") score += 3;
    if (interests.includes("insurance") && d.category === "ubezpieczenia") score += 3;
    if (interests.includes("car") && d.category === "auto") score += 3;
    if (interests.includes("tech") && (d.category === "sprzet" || d.category === "medycyna")) score += 3;
    if (interests.includes("lifestyle") && d.category === "zdrowie") score += 3;
    if (interests.includes("legal") && d.category === "finanse") score += 2;
    if (role === "student" && d.category === "edukacja") score += 4;
    if ((role === "resident" || role === "specialist" || role === "senior") && d.category === "finanse") score += 2;
    if ((work.includes("private") || work.includes("contract")) && d.category === "finanse") score += 2;
    return { ...d, _score: score };
  });
  let filtered = scored.filter(d => d._score > 0).sort((a, b) => b._score - a._score);
  if (filtered.length === 0) {
    const fallback = { student: ["edukacja", "ubezpieczenia"], intern: ["ubezpieczenia", "finanse"], resident: ["finanse", "ubezpieczenia"], specialist: ["finanse", "ubezpieczenia", "zdrowie"], senior: ["finanse", "ubezpieczenia", "zdrowie"] };
    const cats = fallback[role] || ["finanse", "ubezpieczenia"];
    filtered = DISCOUNTS.filter(d => cats.includes(d.category));
  }
  return filtered.slice(0, 6);
}

function getRecommendedProducts(profile) {
  const { role, interests } = profile;
  const all = PURCHASE_CATALOG[0]?.items || [];
  if (role === "student") return all.filter(p => p.monthlyGross < 150).slice(0, 6);
  if (role === "senior" || role === "specialist") return all.filter(p => p.monthlyGross > 200 || p.badge === "Premium" || p.badge === "Nowość").slice(0, 6);
  if (interests.includes("tech")) return all.filter(p => p.badge === "Nowość").slice(0, 6);
  return all.filter(p => p.variants && p.variants.length > 0).slice(0, 6);
}

function getRelevantAdvisors(profile) {
  const { role, work, interests } = profile;
  const needed = new Set(["insurance"]);
  if (role === "intern" || role === "resident") needed.add("legal");
  if (role === "specialist" || role === "senior") needed.add("tax");
  if (work.includes("private") || work.includes("contract")) needed.add("tax");
  if (interests.includes("legal")) needed.add("legal");
  if (interests.includes("insurance")) needed.add("life");
  return ALL_ADVISORS.filter(a => needed.has(a.category)).slice(0, 3);
}

// ─── Overview component ───

function Overview({ setActive, profile, setProfile, unlockedDiscounts, unlockDiscount }) {
  const [advisorsOpen, setAdvisorsOpen] = useState(false);
  const [bookingDropdown, setBookingDropdown] = useState(null);
  const [contactBooked, setContactBooked] = useState({});
  const [advisorQuestions, setAdvisorQuestions] = useState({});
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [discountTab, setDiscountTab] = useState("forYou");
  const [prefsOpen, setPrefsOpen] = useState(false);

  const toggleInterest = (id) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(id) ? prev.interests.filter(x => x !== id) : [...prev.interests, id],
    }));
  };

  const personalizedDiscounts = useMemo(() => getPersonalizedDiscounts(profile), [profile]);
  const newestDiscounts = useMemo(() => [...DISCOUNTS].sort((a, b) => {
    const numA = parseInt(a.id.replace("d", ""), 10);
    const numB = parseInt(b.id.replace("d", ""), 10);
    return numB - numA;
  }).slice(0, 6), []);
  const recommendedProducts = useMemo(() => getRecommendedProducts(profile), [profile]);
  const relevantAdvisors = useMemo(() => getRelevantAdvisors(profile), [profile]);
  const showCars = profile.interests.includes("car") || profile.role === "specialist" || profile.role === "senior";

  const displayName = profile.firstName || "Kowalska";
  const roleLabel = OB_ROLES.find(r => r.id === profile.role)?.label || "";
  const now = new Date();
  const monthLabel = now.toLocaleDateString("pl-PL", { month: "long", year: "numeric" });
  const fmtPrice = (n) => n.toFixed(2).replace(".", ",") + " zł";

  return (
    <div style={{ maxWidth: 800, display: "flex", flexDirection: "column", gap: 40 }}>

      {/* 1. Greeting */}
      <div>
        <div className="text-xs font-semibold text-muted" style={{ letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>{monthLabel.toUpperCase()}</div>
        <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.15, margin: 0 }}>
          <TextEffect per="char" preset="fade-in-blur" delay={0.1} as="span">{`Dzień dobry, ${displayName}.`}</TextEffect>
        </h1>
        {roleLabel && (
          <button className="role-btn" onClick={() => setPrefsOpen(true)}>
            <span className="role-btn__dot" />
            {roleLabel}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        )}
      </div>

      {/* Preferences dialog */}
      <AnimatePresence>
        {prefsOpen && (
          <>
            <motion.div className="prefs-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPrefsOpen(false)} />
            <motion.div className="prefs-dialog" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
              <div className="prefs-dialog__header">
                <h3 className="prefs-dialog__title">Co Cię interesuje?</h3>
                <button className="drawer__close" onClick={() => setPrefsOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <p className="text-sm text-muted" style={{ margin: "0 0 16px" }}>Zaznacz tematy — dopasujemy oferty i zniżki do Ciebie.</p>
              <div className="prefs-dialog__chips">
                {OB_INTERESTS.map(n => (
                  <button key={n.id}
                    className={`interest-chip${profile.interests.includes(n.id) ? " interest-chip--selected" : ""}`}
                    onClick={() => toggleInterest(n.id)}>
                    <span style={{ marginRight: 6 }}>{n.icon}</span> {n.label}
                  </button>
                ))}
              </div>
              <button className="prefs-dialog__done" onClick={() => setPrefsOpen(false)}>Gotowe</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 5. Co Cię interesuje? — wyłączone tymczasowo
      <div>
        <SectionHeader title="Co Cię interesuje?" />
        <p className="text-sm text-muted mb-2">Zaznacz tematy — dopasujemy oferty i zniżki do Ciebie.</p>
        <div className="interests">
          {OB_INTERESTS.map(n => (
            <button key={n.id}
              className={`interest-chip${profile.interests.includes(n.id) ? " interest-chip--selected" : ""}`}
              onClick={() => toggleInterest(n.id)}>
              <span style={{ marginRight: 6 }}>{n.icon}</span> {n.label}
            </button>
          ))}
        </div>
      </div>
      */}

      {/* 6. Discounts — tabbed: Dla Ciebie / Nowości */}
      <InView>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div className="discount-tabs">
            {[{ id: "forYou", label: "Dla Ciebie" }, { id: "new", label: "Nowości" }].map(tab => (
              <button
                key={tab.id}
                className={`discount-tabs__btn${discountTab === tab.id ? " discount-tabs__btn--active" : ""}`}
                onClick={() => setDiscountTab(tab.id)}
              >
                {tab.label}
                {discountTab === tab.id && (
                  <motion.div className="discount-tabs__indicator" layoutId="discountTabIndicator" transition={{ type: "spring", stiffness: 500, damping: 35 }} />
                )}
              </button>
            ))}
          </div>
          <button className="inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-xs text-accent" onClick={() => setActive("discounts")}>Wszystkie</button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={discountTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="discount-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              {(discountTab === "forYou" ? personalizedDiscounts : newestDiscounts).map(d => (
                <TiltCard key={d.id} className="discount-card" onClick={() => setSelectedDiscount(d)}>
                  <div className="discount-card__hero">
                    <img src={d.hero} alt={d.partner} className="discount-card__hero-img" />
                    <span className="discount-card__badge">{d.badge}</span>
                    {unlockedDiscounts.has(d.id) && (
                      <span className="discount-card__unlocked">
                        <svg width="20" height="20" viewBox="0 0 23 23" fill="none">
                          <path d="M19.9652 0H2.85217C1.27696 0 0 1.27696 0 2.85217V19.9652C0 21.5404 1.27696 22.8173 2.85217 22.8173H19.9652C21.5404 22.8173 22.8173 21.5404 22.8173 19.9652V2.85217C22.8173 1.27696 21.5404 0 19.9652 0Z" fill="#18181B"/>
                          <path d="M11.5447 11.0658L16.8498 7.54338L14.6465 3.75L5.96875 9.24042L5.99014 9.27607C5.99014 9.27607 5.97588 9.27607 5.96875 9.27607V13.6613C8.89222 13.6613 11.2667 16.0928 11.2667 19.0733H15.6519C15.6519 15.7719 14.0261 12.8484 11.5447 11.0729V11.0658Z" fill="#CEFF3E"/>
                        </svg>
                      </span>
                    )}
                  </div>
                  <div className="discount-card__body">
                    <div className="discount-card__brand">
                      <img src={d.logo} alt={d.partner} className="discount-card__logo" />
                      <span className="discount-card__partner">{d.partner}</span>
                    </div>
                    <div className="discount-card__title">{d.title}</div>
                  </div>
                </TiltCard>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
        {selectedDiscount && <DiscountDrawer discount={selectedDiscount} onClose={() => setSelectedDiscount(null)} isUnlocked={unlockedDiscounts.has(selectedDiscount.id)} onUnlock={unlockDiscount} />}
      </InView>

      {/* 7. Recommended products */}
      {recommendedProducts.length > 0 && (
        <InView>
          <SectionHeader title="Polecane produkty" action="Sklep" onAction={() => setActive("purchases")} />
          <div className="scroll-row" style={{ minWidth: 0 }}>
            {recommendedProducts.map(p => (
              <div key={p.id} className="scroll-row__item card" style={{ overflow: "hidden", cursor: "pointer" }} onClick={() => setActive("purchases")}>
                <div style={{ aspectRatio: "4/3", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {p.photo
                    ? <img src={p.photo} alt={p.model} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 12 }} />
                    : <span style={{ fontSize: 32 }}>{p.emoji}</span>
                  }
                </div>
                <div style={{ padding: 14 }}>
                  <div className="text-xs text-muted">{p.brand}</div>
                  <div className="font-semibold" style={{ fontSize: 13 }}>{p.model}</div>
                  <div className="font-bold text-accent" style={{ fontSize: 13, marginTop: 6 }}>
                    od {fmtPrice(p.monthlyGross)}/mies.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </InView>
      )}

      {/* 8. Advisors */}
      <InView>
        <SectionHeader title="Twoi doradcy" />
        <div className="advisor-grid">
          {relevantAdvisors.map(a => {
            const booked = contactBooked[a.id];
            const question = advisorQuestions[a.id] || "";
            return (
              <div key={a.id} className="advisor-tile">
                <div className="advisor-tile__top">
                  <img src={a.photo} alt={a.name} className="advisor-tile__photo" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="text-sm font-semibold" style={{ lineHeight: 1.35 }}>{a.name}</div>
                    <div className="text-xs text-muted">{a.role}</div>
                  </div>
                  <button className="advisor-tile__calendar-btn" onClick={() => setAdvisorsOpen(prev => !prev)} title="Umów kontakt">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </button>
                </div>
                {a.tags && a.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {a.tags.map(t => (
                      <span key={t} className="advisor-tag">{t}</span>
                    ))}
                  </div>
                )}
                <AnimatePresence>
                  {advisorsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="advisor-tile__contact">
                        <a href={`tel:${a.phone}`} className="advisor-tile__phone">{a.phone}</a>
                        {booked ? (
                          <div className="contact-booked">
                            <span className="text-green">✓</span> {booked}
                            {question && <div className="text-xs text-muted" style={{ marginTop: 4 }}>{question}</div>}
                            <button className="contact-booked__change" onClick={() => {
                              setContactBooked(prev => { const n = { ...prev }; delete n[a.id]; return n; });
                              setAdvisorQuestions(prev => { const n = { ...prev }; delete n[a.id]; return n; });
                            }}>Zmień</button>
                          </div>
                        ) : (
                          <React.Fragment>
                            <textarea
                              className="advisor-question"
                              placeholder="Napisz krótkie pytanie (opcjonalnie)..."
                              rows={2}
                              value={question}
                              onChange={(e) => setAdvisorQuestions(prev => ({ ...prev, [a.id]: e.target.value }))}
                            />
                            <div style={{ position: "relative" }}>
                              <Btn variant="outline" size="sm" className="contact-request-btn" onClick={() => setBookingDropdown(bookingDropdown === a.id ? null : a.id)}>
                                Zamów kontakt
                              </Btn>
                              {bookingDropdown === a.id && (
                                <div className="contact-dropdown">
                                  <div className="contact-dropdown__label">Kiedy mamy zadzwonić?</div>
                                  {CONTACT_SLOTS.map(slot => (
                                    <button key={slot.id} className="contact-dropdown__item" onClick={() => {
                                      setContactBooked(prev => ({ ...prev, [a.id]: slot.label }));
                                      setBookingDropdown(null);
                                    }}>
                                      {slot.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </React.Fragment>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </InView>


      {/* 10. Cars spotlight (conditional) */}
      {showCars && CARS_CATALOG.length > 0 && (
        <InView>
          <SectionHeader title="Samochody" action="Wszystkie" onAction={() => setActive("cars")} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {CARS_CATALOG.filter(c => c.photo).slice(0, 2).map(c => (
              <div key={c.id} className="card" style={{ overflow: "hidden", cursor: "pointer" }} onClick={() => setActive("cars")}>
                <div style={{ aspectRatio: "16/10", overflow: "hidden" }}>
                  <img src={c.photo} alt={`${c.brand} ${c.model}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: 14 }}>
                  <div className="text-xs text-muted">{c.brand}</div>
                  <div className="font-semibold" style={{ fontSize: 13 }}>{c.model}</div>
                  <div className="font-bold text-accent" style={{ fontSize: 13, marginTop: 6 }}>{c.price}</div>
                </div>
              </div>
            ))}
          </div>
        </InView>
      )}
    </div>
  );
}

// ─── PRODUCT DETAIL (sub-component) ──────────────────────────────────────────

function ProductDetail({ product: p, cat, defaultSelections, onBack, addToCart }) {
  const [variantSel, setVariantSel] = useState(defaultSelections);
  const [specsExpanded, setSpecsExpanded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [priceMode, setPriceMode] = useState("business"); // "business" | "consumer"
  const [openFaq, setOpenFaq] = useState(null);
  const [priceReady, setPriceReady] = useState(false);
  const [contractMonths, setContractMonths] = useState(p.pricing?.[0]?.numberOfMonths || 12);
  const [selectedServices, setSelectedServices] = useState(
    () => (p.additionalServices || []).filter(s => s.included).map(s => s.id)
  );
  const [stickyVisible, setStickyVisible] = useState(false);
  const priceBlockRef = useRef(null);

  useEffect(() => {
    setPriceReady(false);
    setContractMonths(p.pricing?.[0]?.numberOfMonths || 12);
    setSelectedServices((p.additionalServices || []).filter(s => s.included).map(s => s.id));
    const t = setTimeout(() => setPriceReady(true), 1800);
    return () => clearTimeout(t);
  }, [p.id]);

  useEffect(() => {
    const el = priceBlockRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setStickyVisible(!entry.isIntersecting), { threshold: 0, rootMargin: '0px 0px 100px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const selectVariant = (group, label) => {
    setVariantSel(prev => ({ ...prev, [group]: label }));
  };

  // ─── Price helpers ───
  const fmtMonthly = (n) => n.toFixed(2).replace(".", ",") + " zł";
  const fmtDiff = (n) => n > 0 ? ("+" + fmtMonthly(n)) : n < 0 ? ("−" + fmtMonthly(Math.abs(n))) : null;

  // ─── Computed monthly price from variants + pricing ───
  let totalDiff = 0;
  if (p.variants) {
    p.variants.forEach(v => {
      const sel = variantSel[v.group];
      const opt = v.options.find(o => o.label === sel);
      if (opt) totalDiff += (opt.diff || 0);
    });
  }
  // Base price from pricing[] (RentUp) or fallback to monthlyNet
  const pricingEntry = p.pricing?.find(pr => pr.numberOfMonths === contractMonths);
  const baseNet = pricingEntry ? pricingEntry.monthPrice : (p.monthlyNet || 0);
  const vatRate = p.vat || 23;
  const computedNet = baseNet + totalDiff;
  const computedGross = Math.round(computedNet * (1 + vatRate / 100) * 100) / 100;

  // ─── Additional services cost ───
  const servicesNet = (p.additionalServices || [])
    .filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.b2bAmount, 0);
  const servicesGross = (p.additionalServices || [])
    .filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.b2cAmount, 0);
  const totalNet = computedNet + servicesNet;
  const totalGross = computedGross + Math.round(servicesGross * 100) / 100;

  // ─── clientProductId from selected variant ───
  let clientProductId = p.id;
  if (p.variants) {
    for (const v of p.variants) {
      const sel = variantSel[v.group];
      const opt = v.options.find(o => o.label === sel);
      if (opt?.clientProductId) { clientProductId = opt.clientProductId; break; }
    }
  }

  // ─── Color from variant ───
  let imageBg = cat.color;
  if (p.variants) {
    const colorGroup = p.variants.find(v => v.isColor);
    if (colorGroup) {
      const sel = variantSel[colorGroup.group];
      const opt = colorGroup.options.find(o => o.label === sel);
      if (opt && opt.colorHex) imageBg = opt.colorHex;
    }
  }

  // ─── Dynamic subtitle from selected variants ───
  const subtitle = p.variants
    ? p.variants.map(v => variantSel[v.group]).filter(Boolean).join(" · ")
    : p.desc;

  return (
    <div className="pdp">
      {/* Breadcrumb */}
      <div className="pdp__breadcrumb">
        <button className="pdp__breadcrumb-link" onClick={onBack}>Zakupy</button>
        <span className="pdp__breadcrumb-sep">/</span>
        <button className="pdp__breadcrumb-link" onClick={onBack}>{cat.label}</button>
        <span className="pdp__breadcrumb-sep">/</span>
        <span className="pdp__breadcrumb-current">{p.brand} {p.model}</span>
      </div>

      {/* 2-column layout */}
      <div className="pdp__layout">
        {/* Left — image */}
        <div className="pdp__gallery">
          {(() => {
            const imgs = p.images || [{ emoji: p.emoji, label: "Produkt" }];
            const current = imgs[activeImg] || imgs[0];
            return (
              <>
                <div className="pdp__image-main" style={{ background: current.url ? "#fff" : imageBg, transition: "background 0.3s ease" }}>
                  {current.url
                    ? <img src={current.url} alt={current.label} className="pdp__image-photo" />
                    : <span>{current.emoji}</span>
                  }
                </div>
                {imgs.length > 1 && (
                  <div className="pdp__thumbs">
                    {imgs.map((img, i) => (
                      <button key={i}
                        className={`pdp__thumb${i === activeImg ? " pdp__thumb--active" : ""}`}
                        onClick={() => setActiveImg(i)}
                        title={img.label}>
                        {img.url
                          ? <img src={img.url} alt={img.label} className="pdp__thumb-photo" />
                          : <span>{img.emoji}</span>
                        }
                      </button>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
          {p.specs && p.specs.length > 0 && (
            <div className="pdp__specs-compact">
              <h3 className="pdp__specs-compact-title">Specyfikacja</h3>
              <div className="pdp__specs">
                {(specsExpanded ? p.specs : p.specs.slice(0, 4)).map((s, i) => (
                  <div key={i} className="pdp__spec-row">
                    <span className="pdp__spec-label">{s.label}</span>
                    <span className="pdp__spec-value">{s.value}</span>
                  </div>
                ))}
              </div>
              {p.specs.length > 4 && (
                <button className="pdp__specs-toggle" onClick={() => setSpecsExpanded(!specsExpanded)}>
                  {specsExpanded ? "Zwiń" : `Pokaż wszystkie (${p.specs.length})`}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transform: specsExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s ease"}}><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right — info */}
        <div className="pdp__info">
          <div className="pdp__brand">{p.brand}</div>
          <h1 className="pdp__title">{p.brand} {p.model}{p.badge && <span className="pdp__badge">{p.badge}</span>}</h1>
          <div className="pdp__meta-row">
            <span className="pdp__availability"><span className="pdp__availability-dot" /> Dostępny w magazynie</span>
            <span className="pdp__tag pdp__tag--lime">Subskrypcja {contractMonths} mies.</span>
            {/* {p.sellPrice && <span className="pdp__tag">{p.sellPrice.toLocaleString("pl-PL")} zł kat.</span>} */}
          </div>
          <p className="pdp__desc-short">{subtitle}</p>

          {/* Price block — subscription (moved above configurator) */}
          <div className="pdp__price-block" ref={priceBlockRef}>
            {priceReady && (
              <motion.div className="pdp__price-header" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <PeriodTooltip text={"Cena wynegocjowana z partnerem RentUp\nspecjalnie dla pracowników ochrony zdrowia\nw ramach programu Klub Medyka."}>
                  <div className="pdp__club-badge">
                    <svg className="pdp__club-badge-icon" width="18" height="18" viewBox="0 0 23 23" fill="none">
                      <path d="M19.9652 0H2.85217C1.27696 0 0 1.27696 0 2.85217V19.9652C0 21.5404 1.27696 22.8173 2.85217 22.8173H19.9652C21.5404 22.8173 22.8173 21.5404 22.8173 19.9652V2.85217C22.8173 1.27696 21.5404 0 19.9652 0Z" fill="#18181B"/>
                      <path className="pdp__sygnet-draw" d="M11.5447 11.0658L16.8498 7.54338L14.6465 3.75L5.96875 9.24042L5.99014 9.27607C5.99014 9.27607 5.97588 9.27607 5.96875 9.27607V13.6613C8.89222 13.6613 11.2667 16.0928 11.2667 19.0733H15.6519C15.6519 15.7719 14.0261 12.8484 11.5447 11.0729V11.0658Z" stroke="#CEFF3E" strokeWidth="0.5"/>
                    </svg>
                    <span>Cena dla klubowiczów</span>
                  </div>
                </PeriodTooltip>
                <div className="pdp__price-mode-toggle">
                  <button className={`pdp__price-mode-btn${priceMode === "business" ? " pdp__price-mode-btn--active" : ""}`} onClick={() => setPriceMode("business")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
                    Na firmę
                  </button>
                  <button className={`pdp__price-mode-btn${priceMode === "consumer" ? " pdp__price-mode-btn--active" : ""}`} onClick={() => setPriceMode("consumer")}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Dla Ciebie
                  </button>
                </div>
              </motion.div>
            )}
            {!priceReady ? (
              <div className="pdp__price-loader">
                <svg width="20" height="20" viewBox="0 0 23 23" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M19.9652 0H2.85217C1.27696 0 0 1.27696 0 2.85217V19.9652C0 21.5404 1.27696 22.8173 2.85217 22.8173H19.9652C21.5404 22.8173 22.8173 21.5404 22.8173 19.9652V2.85217C22.8173 1.27696 21.5404 0 19.9652 0Z" fill="#18181B"/>
                  <path className="pdp__sygnet-draw" d="M11.5447 11.0658L16.8498 7.54338L14.6465 3.75L5.96875 9.24042L5.99014 9.27607C5.99014 9.27607 5.97588 9.27607 5.96875 9.27607V13.6613C8.89222 13.6613 11.2667 16.0928 11.2667 19.0733H15.6519C15.6519 15.7719 14.0261 12.8484 11.5447 11.0729V11.0658Z" stroke="#CEFF3E" strokeWidth="0.5"/>
                </svg>
                <TextShimmerWave className="pdp__price-shimmer" duration={1.2} spread={1.5}>Ładuję zniżkę</TextShimmerWave>
              </div>
            ) : (
              <>
                {priceMode === "business" ? (
                  <div className="pdp__price-row" style={{ flexDirection: "column", gap: 2 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span className="pdp__price"><SlidingNumber value={totalNet} suffix=" zł" /></span>
                      <motion.span className="text-sm text-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.4 }}>netto / miesiąc</motion.span>
                    </div>
                    <motion.span className="text-sm text-muted" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.4 }}><SlidingNumber value={totalGross} suffix=" zł" /> brutto z VAT</motion.span>
                  </div>
                ) : (
                  <div className="pdp__price-row" style={{ flexDirection: "column", gap: 2 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span className="pdp__price"><SlidingNumber value={totalGross} suffix=" zł" /></span>
                      <motion.span className="text-sm text-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.4 }}>brutto / miesiąc</motion.span>
                    </div>
                    <motion.span className="text-sm text-muted" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.4 }}>w tym <SlidingNumber value={totalNet} suffix=" zł" /> netto + VAT</motion.span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Additional services (always visible — affects price) */}
          {p.additionalServices && p.additionalServices.length > 0 && (
            <div className="pdp__services">
              <div className="pdp__services-label">Usługi dodatkowe:</div>
              {p.additionalServices.map(svc => {
                const isChecked = selectedServices.includes(svc.id);
                const tooltipText = svc.tooltip || SERVICE_TOOLTIPS[svc.serviceType] || svc.description;
                return (
                  <label key={svc.id} className={`pdp__service-row${svc.included ? " pdp__service-row--included" : ""}${isChecked ? " pdp__service-row--checked" : ""}`}>
                    {!svc.included && <BorderTrail size={80} transition={{ repeat: Infinity, duration: isChecked ? 4 : 6, ease: 'linear' }} style={{ background: isChecked ? 'rgb(206, 255, 62)' : 'rgba(206, 255, 62, 0.3)' }} />}
                    {svc.included ? (
                      <span className="pdp__service-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#18181B" stroke="#18181B" strokeWidth="1.5"/>
                          <path d="M9 12l2 2 4-4" stroke="#CEFF3E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    ) : (
                      <input type="checkbox" checked={isChecked}
                        onChange={() => {
                          setSelectedServices(prev =>
                            prev.includes(svc.id) ? prev.filter(id => id !== svc.id) : [...prev, svc.id]
                          );
                        }}
                      />
                    )}
                    <div className="pdp__service-info">
                      <span className="pdp__service-name">
                        {svc.name}
                        <ServiceTooltip text={tooltipText} />
                      </span>
                      <span className="pdp__service-desc">
                        {!svc.included ? (() => {
                          const lines = tooltipText.split('\n').map(l => l.replace(/^[•]\s*/, '').trim()).filter(Boolean);
                          return lines.length > 1
                            ? <TextLoop interval={2.5} transition={{ duration: 0.25 }}>{lines.map((l, i) => <span key={i}>{l}</span>)}</TextLoop>
                            : svc.description;
                        })() : svc.description}
                      </span>
                    </div>
                    <span className="pdp__service-price">
                      {svc.included ? "w cenie" : `+${svc.b2bAmount.toFixed(2).replace(".", ",")} zł/mies.`}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {/* Collapsible configurator (variants + period) */}
          {(p.variants?.length > 0 || (p.pricing?.length > 1)) && (
            <details className="pdp__config-details">
              <summary className="pdp__config-summary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                <span>Skonfiguruj: <span className="pdp__config-summary-sel">{subtitle} · {contractMonths} mies.</span></span>
                <svg className="pdp__config-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </summary>
              <div className="pdp__config-body">
                {/* Variant configurator */}
                {p.variants && p.variants.length > 0 && (
                  <div className="pdp__configurator">
                    {p.variants.map(v => (
                      <div key={v.group} className="pdp__variant-group">
                        <div className="pdp__variant-label">{v.group}:</div>
                        <div className="pdp__variant-options">
                          {v.options.map(opt => {
                            const diffLabel = fmtDiff(opt.diff || 0);
                            return (
                              <button key={opt.label}
                                className={`pdp__variant-btn${variantSel[v.group] === opt.label ? " pdp__variant-btn--active" : ""}`}
                                onClick={() => selectVariant(v.group, opt.label)}>
                                {v.isColor && opt.colorHex && (
                                  <span className="pdp__variant-color-dot" style={{ background: opt.colorHex }} />
                                )}
                                <span className="pdp__variant-btn-label">{opt.label}</span>
                                {diffLabel && <span className="pdp__variant-btn-diff">{diffLabel}</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Contract period selector */}
                {p.pricing && p.pricing.length > 1 && (
                  <div className="pdp__period-selector">
                    <div className="pdp__period-label">Okres umowy:</div>
                    <div className="pdp__period-options">
                      {p.pricing.map(pr => {
                        const totalCost = (pr.monthPrice * pr.numberOfMonths).toFixed(0);
                        const hints = {
                          12: `Rata: ${pr.monthPrice.toFixed(2).replace(".",",")} zł netto/mies.\nŁączny koszt: ${totalCost} zł netto\nNajwiększa elastyczność\nWymiana sprzętu po 6 mies.`,
                          24: `Rata: ${pr.monthPrice.toFixed(2).replace(".",",")} zł netto/mies.\nŁączny koszt: ${totalCost} zł netto\nNajlepszy stosunek ceny do elastyczności\nWymiana sprzętu po 6 mies.`,
                          36: `Rata: ${pr.monthPrice.toFixed(2).replace(".",",")} zł netto/mies.\nŁączny koszt: ${totalCost} zł netto\nNajniższa rata miesięczna\nWymiana sprzętu po 6 mies.`,
                        };
                        const tooltip = hints[pr.numberOfMonths] || `Rata: ${pr.monthPrice.toFixed(2).replace(".",",")} zł netto/mies.\nŁączny koszt: ${totalCost} zł netto`;
                        return (
                          <PeriodTooltip key={pr.numberOfMonths} text={tooltip}>
                            <button
                              className={`pdp__period-btn${contractMonths === pr.numberOfMonths ? " pdp__period-btn--active" : ""}`}
                              onClick={() => setContractMonths(pr.numberOfMonths)}>
                              {pr.numberOfMonths} mies.
                            </button>
                          </PeriodTooltip>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* CTA buttons */}
          <div className="pdp__actions">
            <Btn variant="accent" className="pdp__btn-primary" onClick={() => addToCart && addToCart(p, { computedNet: totalNet, computedGross: totalGross, selections: variantSel, clientProductId, contractMonths, selectedServices })}>
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" style={{marginRight:8}}><path d="M1.36646 1.3667H2.69979L4.47312 9.6467C4.53817 9.94994 4.7069 10.221 4.95026 10.4133C5.19362 10.6055 5.49639 10.7069 5.80646 10.7H12.3265C12.6299 10.6995 12.9241 10.5956 13.1605 10.4053C13.3968 10.215 13.5612 9.94972 13.6265 9.65337L14.7265 4.70003H3.41312M5.99992 14C5.99992 14.3682 5.70144 14.6667 5.33325 14.6667C4.96506 14.6667 4.66659 14.3682 4.66659 14C4.66659 13.6318 4.96506 13.3333 5.33325 13.3333C5.70144 13.3333 5.99992 13.6318 5.99992 14ZM13.3333 14C13.3333 14.3682 13.0348 14.6667 12.6666 14.6667C12.2984 14.6667 11.9999 14.3682 11.9999 14C11.9999 13.6318 12.2984 13.3333 12.6666 13.3333C13.0348 13.3333 13.3333 13.6318 13.3333 14Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Dodaj do koszyka — <SlidingNumber value={priceMode === "business" ? totalNet : totalGross} suffix=" zł/mies." />
            </Btn>
          </div>

          {/* Subscription info */}
          <div className="pdp__payment-info">
            <div className="pdp__payment-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>
              <div className="pdp__payment-item-text">
                <span className="pdp__payment-item-title">Umowa na {contractMonths} miesięcy</span>
                <span className="pdp__payment-item-sub">Comiesięczna faktura VAT · Wymiana sprzętu po 6 mies. · Rezygnacja z 14-dniowym wyprzedzeniem</span>
              </div>
            </div>
          </div>

          {/* Delivery info */}
          <div className="pdp__delivery-info">
            <div className="pdp__delivery-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              <div className="pdp__delivery-item-text">
                <span className="pdp__delivery-item-title">{p.delivery || "Wysyłka w 1 dzień roboczy"}</span>
                <span className="pdp__delivery-item-sub">Darmowa dostawa bezpośrednio z magazynu.</span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="pdp__benefits">
            <div className="pdp__benefit"><span>✓</span> Ochrona Safe Up w cenie</div>
            <div className="pdp__benefit"><span>✓</span> Faktura VAT co miesiąc</div>
            <div className="pdp__benefit"><span>✓</span> Wymiana sprzętu po 6 mies.</div>
            <div className="pdp__benefit"><span>✓</span> Darmowa dostawa</div>
          </div>
        </div>
      </div>

      {/* Infographic cards */}
      <div className="pdp__infographic">
        <div className="pdp__info-card">
          <div className="pdp__info-card-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
          </div>
          <div className="pdp__info-card-title">Wymiana po 6 mies.</div>
          <div className="pdp__info-card-desc">Zamień sprzęt na nowszy model w trakcie trwania umowy</div>
        </div>
        <div className="pdp__info-card">
          <div className="pdp__info-card-icon pdp__info-card-icon--green">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div className="pdp__info-card-title">Ochrona Safe Up</div>
          <div className="pdp__info-card-desc">Pełna ochrona przed uszkodzeniami i kradzieżą w cenie</div>
        </div>
        <div className="pdp__info-card">
          <div className="pdp__info-card-icon pdp__info-card-icon--accent">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </div>
          <div className="pdp__info-card-title">Darmowa dostawa</div>
          <div className="pdp__info-card-desc">Bezpłatna wysyłka prosto z magazynu w 1 dzień roboczy</div>
        </div>
      </div>

      {/* Description + Specs below */}
      {(p.fullDesc || (p.specs && p.specs.length > 0)) && (
        <div className="pdp__details">
          {p.fullDesc && (
            <div className="pdp__section">
              <h3 className="pdp__section-title">Opis produktu</h3>
              <p className="pdp__section-text">{p.fullDesc}</p>
            </div>
          )}
        </div>
      )}

      {/* FAQ */}
      <div className="pdp__faq">
        <h3 className="pdp__section-title">Pytania i odpowiedzi</h3>
        {[
          { q: "Na czym polega subskrypcja?", a: "Subskrypcja to forma wynajmu sprzętu na okres " + contractMonths + " miesięcy. Płacisz stałą miesięczną ratę, a po zakończeniu umowy możesz przedłużyć ją, wymienić sprzęt lub zwrócić urządzenie." },
          { q: "Czy mogę wymienić urządzenie w trakcie umowy?", a: "Tak! Po 6 miesiącach od rozpoczęcia subskrypcji możesz wymienić urządzenie na nowszy model. Wystarczy skontaktować się z doradcą." },
          { q: "Co obejmuje ochrona Safe Up?", a: "Ochrona Safe Up zabezpiecza przed uszkodzeniami mechanicznymi, zalaniem oraz kradzieżą. Jest wliczona w cenę subskrypcji — nie trzeba wykupować osobnego ubezpieczenia." },
          { q: "Czy mogę zrezygnować wcześniej?", a: "Tak. Możesz zrezygnować z umowy z 14-dniowym wyprzedzeniem. Opcja FLEX pozwala na elastyczne zakończenie subskrypcji bez dodatkowych kosztów." },
          { q: 'Jaka jest różnica między \u201eNa firmę\u201d a \u201eDla Ciebie\u201d?', a: '\u201eNa firmę\u201d to oferta dla przedsiębiorców \u2014 ceny podane brutto z możliwością odliczenia VAT. \u201eDla Ciebie\u201d to oferta konsumencka \u2014 ceny netto + VAT, z pełną ochroną konsumencką.' },
        ].map((item, i) => (
          <div key={i} className={`pdp__faq-item${openFaq === i ? " pdp__faq-item--open" : ""}`}>
            <button className="pdp__faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <span>{item.q}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pdp__faq-chevron"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {openFaq === i && <div className="pdp__faq-answer">{item.a}</div>}
          </div>
        ))}
      </div>

      {/* Sticky bottom price bar */}
      {stickyVisible && (
        <motion.div className="pdp__sticky-bar" initial={{ y: 100 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}>
          <div className="pdp__sticky-bar-inner">
            <div className="pdp__sticky-bar-left">
              {!priceReady ? (
                <div className="pdp__sticky-bar-loader">
                  <svg width="18" height="18" viewBox="0 0 23 23" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M19.9652 0H2.85217C1.27696 0 0 1.27696 0 2.85217V19.9652C0 21.5404 1.27696 22.8173 2.85217 22.8173H19.9652C21.5404 22.8173 22.8173 21.5404 22.8173 19.9652V2.85217C22.8173 1.27696 21.5404 0 19.9652 0Z" fill="#18181B"/>
                    <path className="pdp__sygnet-draw" d="M11.5447 11.0658L16.8498 7.54338L14.6465 3.75L5.96875 9.24042L5.99014 9.27607C5.99014 9.27607 5.97588 9.27607 5.96875 9.27607V13.6613C8.89222 13.6613 11.2667 16.0928 11.2667 19.0733H15.6519C15.6519 15.7719 14.0261 12.8484 11.5447 11.0729V11.0658Z" stroke="#CEFF3E" strokeWidth="0.5"/>
                  </svg>
                  <TextShimmerWave className="pdp__price-shimmer" duration={1.2} spread={1.5}>Ładuję zniżkę klubową</TextShimmerWave>
                </div>
              ) : (
                <>
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
                    <PeriodTooltip text={"Cena wynegocjowana z partnerem RentUp\nspecjalnie dla pracowników ochrony zdrowia\nw ramach programu Klub Medyka."}>
                      <div className="pdp__sticky-bar-badge">
                        <svg width="16" height="16" viewBox="0 0 23 23" fill="none">
                          <path d="M19.9652 0H2.85217C1.27696 0 0 1.27696 0 2.85217V19.9652C0 21.5404 1.27696 22.8173 2.85217 22.8173H19.9652C21.5404 22.8173 22.8173 21.5404 22.8173 19.9652V2.85217C22.8173 1.27696 21.5404 0 19.9652 0Z" fill="#18181B"/>
                          <path d="M11.5447 11.0658L16.8498 7.54338L14.6465 3.75L5.96875 9.24042L5.99014 9.27607C5.99014 9.27607 5.97588 9.27607 5.96875 9.27607V13.6613C8.89222 13.6613 11.2667 16.0928 11.2667 19.0733H15.6519C15.6519 15.7719 14.0261 12.8484 11.5447 11.0729V11.0658Z" fill="#CEFF3E"/>
                        </svg>
                        <span>Cena klubowa</span>
                      </div>
                    </PeriodTooltip>
                  </motion.div>
                  <div className="pdp__sticky-bar-price">
                    <TextEffect className="pdp__sticky-bar-price-text" per="char" preset="fade-in-blur" key={`sticky-${totalNet}-${totalGross}-${priceMode}`}>
                      {fmtMonthly(priceMode === "business" ? totalNet : totalGross)}
                    </TextEffect>
                    <motion.span className="pdp__sticky-bar-period" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.3 }}>/{priceMode === "business" ? "netto" : "brutto"} mies.</motion.span>
                  </div>
                </>
              )}
            </div>
            {priceReady && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 0.3 }}>
                <Btn variant="accent" className="pdp__sticky-bar-cta" onClick={() => addToCart && addToCart(p, { computedNet: totalNet, computedGross: totalGross, selections: variantSel, clientProductId, contractMonths, selectedServices })}>
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" style={{marginRight:6}}><path d="M1.36646 1.3667H2.69979L4.47312 9.6467C4.53817 9.94994 4.7069 10.221 4.95026 10.4133C5.19362 10.6055 5.49639 10.7069 5.80646 10.7H12.3265C12.6299 10.6995 12.9241 10.5956 13.1605 10.4053C13.3968 10.215 13.5612 9.94972 13.6265 9.65337L14.7265 4.70003H3.41312M5.99992 14C5.99992 14.3682 5.70144 14.6667 5.33325 14.6667C4.96506 14.6667 4.66659 14.3682 4.66659 14C4.66659 13.6318 4.96506 13.3333 5.33325 13.3333C5.70144 13.3333 5.99992 13.6318 5.99992 14ZM13.3333 14C13.3333 14.3682 13.0348 14.6667 12.6666 14.6667C12.2984 14.6667 11.9999 14.3682 11.9999 14C11.9999 13.6318 12.2984 13.3333 12.6666 13.3333C13.0348 13.3333 13.3333 13.6318 13.3333 14Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Dodaj do koszyka
                </Btn>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── COUNTDOWN BADGE ──────────────────────────────────────────────────────────

function CountdownInline({ hours }) {
  const [endTime] = useState(() => Date.now() + hours * 3600000);
  const [remaining, setRemaining] = useState(hours * 3600000);

  React.useEffect(() => {
    const tick = () => setRemaining(Math.max(0, endTime - Date.now()));
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  const totalSec = Math.floor(remaining / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n) => n.toString().padStart(2, "0");
  const timeStr = d > 0 ? `${d}d ${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}:${pad(s)}`;

  return (
    <span className="countdown-inline" title="Oferta limitowana czasowo">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      {timeStr}
    </span>
  );
}

function VehisEmbed() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="product-section">
      <div className="product-section__head">
        <h3 className="font-bold" style={{ fontSize: 16 }}>Wirtualny salon samochodowy</h3>
        <span className="text-sm text-muted">Powered by VEHIS</span>
      </div>
      <div className="vehis-embed">
        {!loaded && (
          <div className="vehis-embed__loader">
            <div className="vehis-embed__sygnet">
              <svg width="40" height="40" viewBox="0 0 23 23" fill="none">
                <path d="M19.9652 0H2.85217C1.27696 0 0 1.27696 0 2.85217V19.9652C0 21.5404 1.27696 22.8173 2.85217 22.8173H19.9652C21.5404 22.8173 22.8173 21.5404 22.8173 19.9652V2.85217C22.8173 1.27696 21.5404 0 19.9652 0Z" fill="#18181B"/>
                <path className="vehis-embed__sygnet-mark" d="M11.5447 11.0658L16.8498 7.54338L14.6465 3.75L5.96875 9.24042L5.99014 9.27607C5.99014 9.27607 5.97588 9.27607 5.96875 9.27607V13.6613C8.89222 13.6613 11.2667 16.0928 11.2667 19.0733H15.6519C15.6519 15.7719 14.0261 12.8484 11.5447 11.0729V11.0658Z" fill="#CEFF3E"/>
              </svg>
            </div>
            <span>Ładowanie salonu samochodowego…</span>
          </div>
        )}
        <iframe
          src="https://embed.vehis.pl/?embed_client_token=03e091d0-bb44-4339-bb83-b330f6149a0a"
          title="VEHIS – Wirtualny salon samochodowy"
          className="vehis-embed__iframe"
          style={{ opacity: loaded ? 1 : 0 }}
          allow="fullscreen"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}

// ─── CAR DETAIL (sub-component) ──────────────────────────────────────────────

function CarDetail({ car, onBack }) {
  const s = car.specs;
  const specRows = s ? [
    { label: "Paliwo", value: s.fuel },
    { label: "Silnik", value: s.engine },
    { label: "Moc", value: s.power },
    { label: "Moment obrotowy", value: s.torque },
    { label: "Skrzynia", value: s.transmission },
    { label: "Napęd", value: s.drive },
    { label: "0–100 km/h", value: s.acceleration },
    { label: "V-max", value: s.topSpeed },
    s.range ? { label: "Zasięg", value: s.range } : null,
    { label: s.fuel === "Elektryczny" ? "Zużycie energii" : "Spalanie", value: s.consumption },
    { label: "CO₂", value: s.co2 },
    { label: "Bagażnik", value: s.trunk },
    { label: "Miejsca", value: s.seats },
    { label: "Rocznik", value: s.year },
  ].filter(Boolean) : [];

  const contractRows = s ? [
    { label: "Forma", value: s.type },
    { label: "Okres", value: s.duration },
    { label: "Limit km", value: s.mileage },
  ] : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 720 }}>
      <Btn variant="ghost" size="sm" onClick={onBack} className="self-start" style={{ gap: 6 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Wróć
      </Btn>

      {/* Hero image */}
      <div className="card" style={{ overflow: "hidden", padding: 0 }}>
        <div style={{ aspectRatio: "16/9", overflow: "hidden", background: "var(--color-secondary)" }}>
          <img src={car.photo} alt={`${car.brand} ${car.model}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>

      {/* Title + price */}
      <div>
        <div className="text-xs text-muted font-semibold" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{car.brand}</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.03em" }}>{car.model}</h1>
        <p className="text-sm text-muted" style={{ marginTop: 4 }}>{car.desc}</p>

        <div className="pdp__price-block" style={{ marginTop: 16 }}>
          <div className="pdp__club-badge">
            <svg className="pdp__club-badge-icon" width="18" height="18" viewBox="0 0 23 23" fill="none">
              <path d="M19.9652 0H2.85217C1.27696 0 0 1.27696 0 2.85217V19.9652C0 21.5404 1.27696 22.8173 2.85217 22.8173H19.9652C21.5404 22.8173 22.8173 21.5404 22.8173 19.9652V2.85217C22.8173 1.27696 21.5404 0 19.9652 0Z" fill="#18181B"/>
              <path className="pdp__sygnet-draw" d="M11.5447 11.0658L16.8498 7.54338L14.6465 3.75L5.96875 9.24042L5.99014 9.27607C5.99014 9.27607 5.97588 9.27607 5.96875 9.27607V13.6613C8.89222 13.6613 11.2667 16.0928 11.2667 19.0733H15.6519C15.6519 15.7719 14.0261 12.8484 11.5447 11.0729V11.0658Z" stroke="#CEFF3E" strokeWidth="0.5"/>
            </svg>
            <span>Cena dla klubowiczów</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span className="pdp__price">{car.price}</span>
            {car.priceNote && <span className="text-sm text-muted">{car.priceNote}</span>}
          </div>
          {car.priceOld && (
            <div className="text-sm text-muted" style={{ marginTop: 4, textDecoration: "line-through" }}>
              Cena regularna: {car.priceOld}
            </div>
          )}
        </div>
      </div>

      {/* Contract info */}
      {contractRows.length > 0 && (
        <div className="card">
          <div className="card__row" style={{ borderBottom: "none" }}>
            <span className="font-semibold" style={{ fontSize: 14 }}>Warunki umowy</span>
          </div>
          {contractRows.map(r => (
            <div key={r.label} className="card__row" style={{ justifyContent: "space-between" }}>
              <span className="text-sm text-muted">{r.label}</span>
              <span className="text-sm font-semibold">{r.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Specs */}
      {specRows.length > 0 && (
        <div className="card">
          <div className="card__row" style={{ borderBottom: "none" }}>
            <span className="font-semibold" style={{ fontSize: 14 }}>Parametry techniczne</span>
          </div>
          {specRows.map(r => (
            <div key={r.label} className="card__row" style={{ justifyContent: "space-between" }}>
              <span className="text-sm text-muted">{r.label}</span>
              <span className="text-sm font-semibold">{r.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <button className="inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-lime bg-lime px-4 py-2 text-sm font-medium leading-5 text-lime-fg transition-[opacity,background] duration-150 active:opacity-85">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1.36646 1.3667H2.69979L4.47312 9.6467C4.53817 9.94994 4.7069 10.221 4.95026 10.4133C5.19362 10.6055 5.49639 10.7069 5.80646 10.7H12.3265C12.6299 10.6995 12.9241 10.5956 13.1605 10.4053C13.3968 10.215 13.5612 9.94972 13.6265 9.65337L14.7265 4.70003H3.41312M5.99992 14C5.99992 14.3682 5.70144 14.6667 5.33325 14.6667C4.96506 14.6667 4.66659 14.3682 4.66659 14C4.66659 13.6318 4.96506 13.3333 5.33325 13.3333C5.70144 13.3333 5.99992 13.6318 5.99992 14ZM13.3333 14C13.3333 14.3682 13.0348 14.6667 12.6666 14.6667C12.2984 14.6667 11.9999 14.3682 11.9999 14C11.9999 13.6318 12.2984 13.3333 12.6666 13.3333C13.0348 13.3333 13.3333 13.6318 13.3333 14Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Zapytaj o ofertę
      </button>
    </div>
  );
}

// ─── CARS VIEW ───────────────────────────────────────────────────────────────

function CarsView({ addToCart, cart, removeFromCart }) {
  const [view, setView] = useState("list");
  const [selectedCar, setSelectedCar] = useState(null);

  if (view === "detail" && selectedCar) {
    return <CarDetail car={selectedCar} onBack={() => { setView("list"); setSelectedCar(null); }} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Samochody</h2>
        <p className="text-sm text-muted">Leasing, wynajem długoterminowy i elastyczny — oferty dla lekarzy.</p>
      </div>

      {/* Car cards */}
      <div className="product-grid">
        {CARS_CATALOG.map(item => (
          <div key={item.id} className="product-card" onClick={() => { setSelectedCar(item); setView("detail"); }}>
            <div className="product-card__image" style={{ background: "#fff" }}>
              {item.photo
                ? <img src={item.photo} alt={`${item.brand} ${item.model}`} className="product-card__photo" style={{ objectFit: "cover", inset: 0, width: "100%", height: "100%" }} />
                : <span>{item.emoji}</span>
              }
            </div>
            <div className="product-card__body">
              <div className="product-card__name">{item.brand} {item.model}</div>
              <div className="product-card__desc">{item.desc}</div>
              <div className="pdp__club-badge" style={{ marginBottom: 4, marginTop: 4 }}>
                <svg width="14" height="14" viewBox="0 0 23 23" fill="none">
                  <path d="M19.9652 0H2.85217C1.27696 0 0 1.27696 0 2.85217V19.9652C0 21.5404 1.27696 22.8173 2.85217 22.8173H19.9652C21.5404 22.8173 22.8173 21.5404 22.8173 19.9652V2.85217C22.8173 1.27696 21.5404 0 19.9652 0Z" fill="#18181B"/>
                  <path d="M11.5447 11.0658L16.8498 7.54338L14.6465 3.75L5.96875 9.24042L5.99014 9.27607C5.99014 9.27607 5.97588 9.27607 5.96875 9.27607V13.6613C8.89222 13.6613 11.2667 16.0928 11.2667 19.0733H15.6519C15.6519 15.7719 14.0261 12.8484 11.5447 11.0729V11.0658Z" fill="#CEFF3E"/>
                </svg>
                <span style={{ fontSize: 10 }}>Cena dla klubowiczów</span>
              </div>
              <div className="product-card__price-row">
                <div className="product-card__price-col">
                  <span className="product-card__price">{item.price}</span>
                  {item.priceOld && <span className="product-card__price-old">{item.priceOld}</span>}
                </div>
              </div>
              <button className="product-card__cta" onClick={(e) => { e.stopPropagation(); setSelectedCar(item); setView("detail"); }}>
                Sprawdź ofertę
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* VEHIS Virtual Showroom */}
      <VehisEmbed />
    </div>
  );
}

// ─── PURCHASES VIEW ───────────────────────────────────────────────────────────

function PurchasesView({ addToCart, cart, removeFromCart }) {
  const isInCart = (itemId) => cart && cart.some(c => c.product.id === itemId);
  const removeByProductId = (itemId) => {
    const cartItem = cart && cart.find(c => c.product.id === itemId);
    if (cartItem) removeFromCart(cartItem.key);
  };
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("shop"); // "shop", "orders", or "detail"
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCat, setSelectedCat] = useState(null);

  const FILTERS = [
    { id: "all", label: "Wszystko" },
    { id: "devices", label: "Elektronika" },
    { id: "entertainment", label: "Rozrywka" },
  ];

  const filteredCatalog = filter === "all"
    ? PURCHASE_CATALOG
    : PURCHASE_CATALOG.filter(cat => cat.id === filter);

  const openProduct = (item, cat) => {
    setSelectedProduct(item);
    setSelectedCat(cat);
    setView("detail");
  };

  // ─── PRODUCT DETAIL VIEW ──────────────────
  if (view === "detail" && selectedProduct) {
    const p = selectedProduct;
    const cat = selectedCat;

    // Build default variant selections
    const defaultSelections = {};
    if (p.variants) {
      p.variants.forEach(v => {
        const def = v.options.find(o => o.default);
        defaultSelections[v.group] = def ? def.label : v.options[0].label;
      });
    }

    return React.createElement(ProductDetail, {
      product: p,
      cat: cat,
      defaultSelections: defaultSelections,
      onBack: () => setView("shop"),
      addToCart: addToCart,
    });
  }

  // ─── ORDERS VIEW ──────────────────────────
  if (view === "orders") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Moje zamówienia</h2>
            <p className="text-sm text-muted">Historia Twoich zakupów.</p>
          </div>
          <button className="inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-xs text-accent" onClick={() => setView("shop")}>← Wróć do sklepu</button>
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

  // ─── CATALOG VIEW (default) ───────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Zakupy</h2>
          <p className="text-sm text-muted">Wynajem sprzętu dla lekarzy — subskrypcja miesięczna, bez zobowiązań jednorazowych.</p>
        </div>
        <button className="inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-xs text-accent" onClick={() => setView("orders")}>Moje zamówienia →</button>
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
            <button className="inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-xs text-accent">Zobacz wszystko →</button>
          </div>
          <div className="product-grid">
            {cat.items.map(item => (
                <div key={item.id} className="product-card" onClick={() => item.specs && openProduct(item, cat)}>
                  <div className="product-card__image" style={{ background: "#fff" }}>
                    {item.badge && <span className="product-card__badge">{item.badge}</span>}
                    {item.photo
                      ? <img src={item.photo} alt={`${item.brand} ${item.model}`} className="product-card__photo" />
                      : <span>{item.emoji}</span>
                    }
                  </div>
                  <div className="product-card__body">
                    <div className="product-card__name">{item.brand} {item.model}</div>
                    <div className="product-card__desc">{item.desc}</div>
                    {item.monthlyNet ? (
                      <div className="product-card__price-row">
                        <div className="product-card__price-col">
                          <span className="product-card__price-from">Już od</span>
                          <span className="product-card__price">{item.monthlyNet.toFixed(2).replace(".", ",")} zł</span>
                          <span className="product-card__price-suffix">netto + VAT / miesiąc</span>
                        </div>
                      </div>
                    ) : (
                      <div className="product-card__price-row">
                        <div className="product-card__price-col">
                          <span className="product-card__price">{item.price}</span>
                          {item.priceOld && <span className="product-card__price-old">{item.priceOld}</span>}
                        </div>
                      </div>
                    )}
                    {isInCart(item.id) ? (
                      <button className="product-card__cta product-card__cta--in-cart" onClick={(e) => { e.stopPropagation(); removeByProductId(item.id); }}>
                        <span className="product-card__cta-default">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Już w koszyku
                        </span>
                        <span className="product-card__cta-hover">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          Usuń z koszyka
                        </span>
                      </button>
                    ) : (
                      <button className="product-card__cta" onClick={(e) => { e.stopPropagation(); addToCart && addToCart(item); }}>
                        {item.monthlyNet ? (
                          <>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1.36646 1.3667H2.69979L4.47312 9.6467C4.53817 9.94994 4.7069 10.221 4.95026 10.4133C5.19362 10.6055 5.49639 10.7069 5.80646 10.7H12.3265C12.6299 10.6995 12.9241 10.5956 13.1605 10.4053C13.3968 10.215 13.5612 9.94972 13.6265 9.65337L14.7265 4.70003H3.41312M5.99992 14C5.99992 14.3682 5.70144 14.6667 5.33325 14.6667C4.96506 14.6667 4.66659 14.3682 4.66659 14C4.66659 13.6318 4.96506 13.3333 5.33325 13.3333C5.70144 13.3333 5.99992 13.6318 5.99992 14ZM13.3333 14C13.3333 14.3682 13.0348 14.6667 12.6666 14.6667C12.2984 14.6667 11.9999 14.3682 11.9999 14C11.9999 13.6318 12.2984 13.3333 12.6666 13.3333C13.0348 13.3333 13.3333 13.6318 13.3333 14Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Dodaj do koszyka
                          </>
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/><polyline points="12 3 12 15"/><polyline points="8 11 12 15 16 11"/></svg>
                            Kup teraz
                          </>
                        )}
                      </button>
                    )}
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
// Layout w trzech strefach:
//   A) LPHero     — Lekarz Przedsiębiorca (pre-sale konfigurator LUB post-sale panel)
//   B) LPFeatures — siatka 10 świadczeń + LeaseLink callout
//   C) SecondaryPackages — Lekarz Kierowca + Lekarz w Podróży (drugi plan)

function ServicesView({ lpSub, setLpSub }) {
  // Fallback jeżeli ktoś wyrenderuje widok bez propsów (np. testy)
  const [localLpSub, setLocalLpSub] = useState({
    active: false, billing: "rok", lloydSum: 5000, infaktAddon: true,
    activatedAt: null, nextRenewal: null,
  });
  const sub = lpSub ?? localLpSub;
  const setSub = setLpSub ?? setLocalLpSub;

  const [upgrade, setUpgrade] = useState(null); // null | "lloyds" | "infakt" | "billing"

  return (
    <div className="lp-view">
      <div className="lp-view__intro">
        <h2 className="text-[20px] font-bold tracking-[-0.02em]">Usługi</h2>
        <p className="text-sm text-muted mt-1">Nasz główny produkt to <strong className="text-fg">Lekarz Przedsiębiorca</strong> — jedna subskrypcja, która obsługuje całą infrastrukturę biznesową lekarza.</p>
      </div>

      <LPHero sub={sub} setSub={setSub} onUpgrade={setUpgrade} />
      <LPFeatures sub={sub} />
      <SecondaryPackages />

      <AnimatePresence>
        {upgrade && (
          <LPUpgradeDrawer variant={upgrade} sub={sub} setSub={setSub} onClose={() => setUpgrade(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── LP HERO (router pre-sale / post-sale) ───────────────────────────────────
function LPHero({ sub, setSub, onUpgrade }) {
  const toggleDemo = () => setSub(s => ({
    ...s,
    active: !s.active,
    activatedAt: !s.active ? "15 kwi 2026" : null,
    nextRenewal: !s.active ? (s.billing === "rok" ? "15 kwi 2027" : "15 maj 2026") : null,
  }));

  return (
    <section className="lp-hero">
      <div className="lp-hero__demo-toggle">
        <button onClick={toggleDemo} className="lp-hero__demo-btn" title="Przełącz stan pre-sale / post-sale dla demo">
          <span className="lp-hero__demo-dot" aria-hidden />
          <span className="lp-hero__demo-lbl">Demo</span>
          <span className="lp-hero__demo-val">{sub.active ? "po aktywacji" : "przed aktywacją"}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="M2 3.5h6M2 3.5l2-2M8 6.5H2M8 6.5l-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      {sub.active ? (
        <LPManagePanel sub={sub} onUpgrade={onUpgrade} />
      ) : (
        <LPConfigurator sub={sub} setSub={setSub} />
      )}
    </section>
  );
}

// ─── LP CONFIGURATOR (pre-sale) ──────────────────────────────────────────────
function LPConfigurator({ sub, setSub }) {
  const { raw, effective, annualSaving } = calcLPPrice(sub);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const priceRef = useRef(null);
  const priceInView = useInView(priceRef, { margin: "0px 0px -80px 0px" });

  const activate = () => setSub(s => ({
    ...s,
    active: true,
    activatedAt: "15 kwi 2026",
    nextRenewal: s.billing === "rok" ? "15 kwi 2027" : "15 maj 2026",
  }));

  return (
    <>
    <div className="lp-card">
      <div className="lp-card__top">
        <div className="lp-card__deco" aria-hidden>
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
            <defs>
              <pattern id="lp-dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="180" height="180" fill="url(#lp-dots)" />
          </svg>
        </div>
        <div className="lp-card__eyebrow">Nasz główny produkt</div>
        <h3 className="lp-card__title">
          <span className="lp-card__title-l1">Lekarz</span>
          <span className="lp-card__title-l2">Przedsiębiorca<span className="lp-card__title-dot">.</span></span>
        </h3>
        <p className="lp-card__tagline">{LP_PRODUCT.tagline}</p>
        <figure className="lp-card__quote">
          <svg className="lp-card__quote-mark" width="28" height="22" viewBox="0 0 28 22" fill="none" aria-hidden>
            <path d="M11.5 0C5.2 0 0 5 0 11.5V22h11V11H5.5C5.5 7 8.3 4 11.5 4V0zm16 0c-6.3 0-11.5 5-11.5 11.5V22h11V11H21.5C21.5 7 24.3 4 27.5 4V0z" fill="currentColor" />
          </svg>
          <blockquote>{LP_PRODUCT.quote}</blockquote>
        </figure>

        <LPStack sub={sub} />
      </div>

      <div className="lp-card__body">
        {/* Billing toggle — segmented control with layoutId indicator */}
        <div className="lp-billing" role="tablist" aria-label="Cykl rozliczenia">
          {[
            { id: "msc", label: "Miesięcznie" },
            { id: "rok", label: "Rocznie", save: "−10%" },
          ].map(o => {
            const active = sub.billing === o.id;
            return (
              <button
                key={o.id}
                role="tab"
                aria-selected={active}
                className={`lp-billing__opt${active ? " is-active" : ""}`}
                onClick={() => setSub(s => ({ ...s, billing: o.id }))}
              >
                {active && (
                  <motion.span
                    className="lp-billing__indicator"
                    layoutId="lp-billing-indicator"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    aria-hidden
                  />
                )}
                <span className="lp-billing__opt-label">{o.label}</span>
                {o.save && <span className="lp-billing__save">{o.save}</span>}
              </button>
            );
          })}
        </div>

        {/* Lloyd's options */}
        <div className="lp-field">
          <div className="lp-field__label">Suma ubezpieczenia utraty dochodu (Lloyd's)</div>
          <div className="lp-opts">
            {LP_PRODUCT.lloydOptions.map(opt => (
              <button
                key={opt.sum}
                className={`lp-opt${sub.lloydSum === opt.sum ? " is-active" : ""}`}
                onClick={() => setSub(s => ({ ...s, lloydSum: opt.sum }))}
              >
                <div className="lp-opt__name">{opt.label}</div>
                <div className="lp-opt__sub">{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* inFakt toggle */}
        <div className="lp-field">
          <div className="lp-field__label">Księgowość inFakt — add-on</div>
          <label className={`lp-toggle-row${sub.infaktAddon ? " is-on" : ""}`}>
            <div className="lp-toggle-row__info">
              <div className="lp-toggle-row__head">
                <span className="lp-toggle-row__name">Księgowość inFakt</span>
                <span className="lp-chip lp-chip--lime">Polecane</span>
                <span className="lp-chip lp-chip--warn">Bonus 1 000 zł</span>
              </div>
              <div className="lp-toggle-row__sub">+ 179 zł/msc · odblokowuje konto AION i kreator JDG · jednorazowy bonus 1 000 zł za aktywację</div>
            </div>
            <div className="lp-sw" role="switch" aria-checked={sub.infaktAddon}>
              <input
                type="checkbox"
                checked={sub.infaktAddon}
                onChange={e => setSub(s => ({ ...s, infaktAddon: e.target.checked }))}
              />
              <span className="lp-sw__track" />
              <span className="lp-sw__thumb" />
            </div>
          </label>
        </div>

        {/* Price row */}
        <div className="lp-price" ref={priceRef}>
          <div className="lp-price__main">
            <span className="lp-price__from">od</span>
            <span className="lp-price__num" aria-live="polite">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={effective}
                  initial={{ y: 18, opacity: 0, filter: "blur(6px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: -18, opacity: 0, filter: "blur(6px)" }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="lp-price__digits"
                >
                  {effective}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="lp-price__unit">zł / msc</span>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            {sub.billing === "rok" ? (
              <motion.div
                key="annual"
                className="lp-price__annual"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <span className="lp-price__annual-dot" aria-hidden />
                rozliczenie roczne · oszczędzasz <strong>&nbsp;{annualSaving} zł/rok</strong>
                <span className="lp-price__strike">(miesięcznie byłoby {raw} zł)</span>
              </motion.div>
            ) : (
              <motion.div
                key="monthly"
                className="lp-price__annual lp-price__annual--muted"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                przejdź na <button className="lp-link" onClick={() => setSub(s => ({ ...s, billing: "rok" }))}>rozliczenie roczne</button> i oszczędź do 419 zł
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Breakdown (collapsible) */}
        <div className="lp-breakdown">
          <button className="lp-breakdown__trigger" onClick={() => setBreakdownOpen(v => !v)}>
            {breakdownOpen ? "Ukryj breakdown" : `Pokaż breakdown (${LP_FEATURES.length} pozycji)`} {breakdownOpen ? "▴" : "▾"}
          </button>
          <AnimatePresence initial={false}>
            {breakdownOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                style={{ overflow: "hidden" }}
              >
                <LPBreakdown sub={sub} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lp-cta">
          <Btn variant="accent" size="lg" onClick={activate}>Aktywuj subskrypcję →</Btn>
          <span className="text-xs text-muted">Rezygnacja w dowolnym momencie · pierwsze 14 dni zwrot 100%</span>
        </div>
      </div>
    </div>

    {/* Floating price dock — pojawia się gdy naturalna cena zjeżdża z viewportu */}
    <AnimatePresence>
      {!priceInView && (
        <motion.div
          className="lp-dock"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="lp-dock__left">
            <div className="lp-dock__price">
              <span className="lp-dock__from">od</span>
              <span className="lp-dock__num">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={effective}
                    initial={{ y: 12, opacity: 0, filter: "blur(4px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: -12, opacity: 0, filter: "blur(4px)" }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className="lp-dock__digits"
                  >
                    {effective}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="lp-dock__unit">zł/msc</span>
              {sub.billing === "rok" && <span className="lp-dock__badge">rocznie −10%</span>}
            </div>
            <div className="lp-dock__meta">
              <span>{sub.lloydSum / 1000}k Lloyd's</span>
              <span className="lp-dock__sep" aria-hidden>·</span>
              <span>{sub.infaktAddon ? "z inFakt" : "bez inFakt"}</span>
            </div>
          </div>
          <button className="lp-dock__cta" onClick={activate}>
            Aktywuj
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}

// ─── LP STACK (hero: stat-row + chipy z nazwami usług) ──────────────────────
// Pokazuje od razu w hero "co dostajesz" — bez konieczności scrollowania
// do breakdown czy features grid. 3 KPI + chipy z krótkimi nazwami.
function LPStack({ sub }) {
  const baseCount = LP_FEATURES.filter(f => !f.requiresInfakt).length;
  const totalCount = sub.infaktAddon ? LP_FEATURES.length : baseCount;
  const gratisCount = LP_FEATURES.filter(f => f.gratis).length;

  return (
    <div className="lp-stack">
      <div className="lp-stack__stats">
        <div className="lp-stack__stat">
          <div className="lp-stack__stat-val">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={totalCount}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                {totalCount}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="lp-stack__stat-lbl">
            {totalCount === 1 ? "usługa" : totalCount < 5 ? "usługi" : "usług"} w standardzie
          </div>
        </div>
        <div className="lp-stack__divider" aria-hidden />
        <div className="lp-stack__stat">
          <div className="lp-stack__stat-val">
            87<span className="lp-stack__stat-unit"> 000 zł</span>
          </div>
          <div className="lp-stack__stat-lbl">prelimit LeaseLink od dnia 1</div>
        </div>
        <div className="lp-stack__divider" aria-hidden />
        <div className="lp-stack__stat">
          <div className="lp-stack__stat-val">
            {gratisCount}<span className="lp-stack__stat-unit"> × GRATIS</span>
          </div>
          <div className="lp-stack__stat-lbl">doradcy + konsultacja podatkowa</div>
        </div>
      </div>

      <div className="lp-stack__chips-wrap">
        <div className="lp-stack__chips-label">Zawiera:</div>
        <div className="lp-stack__chips">
          {LP_FEATURES.map(f => {
            const locked = f.requiresInfakt && !sub.infaktAddon;
            return (
              <motion.span
                key={f.id}
                className={`lp-stack__chip${f.gratis ? " is-gratis" : ""}${locked ? " is-locked" : ""}${f.requiresInfakt ? " is-addon" : ""}`}
                animate={{ opacity: locked ? 0.4 : 1 }}
                transition={{ duration: 0.25 }}
              >
                {f.gratis && <span className="lp-stack__chip-dot" aria-hidden />}
                {f.short}
                {locked && <span className="lp-stack__chip-note">wymaga inFakt</span>}
              </motion.span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── LP BREAKDOWN (składniki ceny w pre-sale) ────────────────────────────────
function LPBreakdown({ sub }) {
  const opt = LP_PRODUCT.lloydOptions.find(o => o.sum === sub.lloydSum);
  const rows = [
    { label: lpLloydLabel(sub.lloydSum), val: opt.deltaPrice > 0 ? `+ ${opt.deltaPrice} zł` : "w cenie" },
    { label: "OC zawodowe Ergo Hestia (auto z NIL)", val: "w cenie" },
    { label: "Wirtualny gabinet (adres + tel + email)", val: "w cenie" },
    { label: "Autenti — podpis kwalifikowany", val: "w cenie" },
    { label: "Prelimit LeaseLink (PWZ-based)", val: "w cenie" },
    { label: "eGabinet EDM", val: "w cenie" },
    { label: "Doradcy ubezpieczeniowi + analiza potrzeb", val: "GRATIS", gratis: true },
    { label: "Doradcy leasingowi LeaseLink", val: "GRATIS", gratis: true },
    { label: "Konsultacja podatkowa 15 min/msc", val: "GRATIS", gratis: true },
    { label: "Bank odpowiedzi prawnych (Tymiński)", val: "w cenie" },
  ];
  if (sub.infaktAddon) rows.push({ label: "Księgowość inFakt (add-on)", val: "+ 179 zł", warn: true });

  return (
    <div className="lp-bk">
      {rows.map((r, i) => (
        <div key={i} className="lp-bk__row">
          <span className="lp-bk__lbl">{r.label}</span>
          <span className={`lp-bk__val${r.gratis ? " lp-bk__val--gratis" : ""}${r.warn ? " lp-bk__val--warn" : ""}`}>{r.val}</span>
        </div>
      ))}
    </div>
  );
}

// ─── LP MANAGE PANEL (post-sale) ─────────────────────────────────────────────
function LPManagePanel({ sub, onUpgrade }) {
  const { effective } = calcLPPrice(sub);
  const billingLabel = sub.billing === "rok" ? "Roczne" : "Miesięczne";

  return (
    <div className="lp-card lp-card--active">
      <div className="lp-card__top">
        <div className="flex items-center gap-2 mb-2">
          <Pill variant="green">✓ Twoja subskrypcja aktywna</Pill>
          <span className="text-xs text-muted">od {sub.activatedAt}</span>
        </div>
        <h3 className="lp-card__title">{LP_PRODUCT.label}</h3>
        <p className="lp-card__tagline">
          {effective} zł / msc · odnowienie {sub.nextRenewal}
        </p>
      </div>

      <div className="lp-card__body">
        <div className="lp-field">
          <div className="lp-field__label">Twoja konfiguracja</div>
          <div className="lp-manage">
            <div className="lp-manage__row">
              <div>
                <div className="lp-manage__lbl">Suma Lloyd's</div>
                <div className="lp-manage__val">{(sub.lloydSum / 1000)}k / mies.</div>
              </div>
              <Btn variant="outline" size="sm" onClick={() => onUpgrade("lloyds")}>Zwiększ sumę →</Btn>
            </div>
            <div className="lp-manage__row">
              <div>
                <div className="lp-manage__lbl">Księgowość inFakt</div>
                <div className="lp-manage__val">{sub.infaktAddon ? "Aktywna (+179 zł)" : "Nie aktywna"}</div>
              </div>
              {sub.infaktAddon
                ? <span className="text-xs text-muted">aktywna</span>
                : <Btn variant="accent" size="sm" onClick={() => onUpgrade("infakt")}>Dodaj inFakt +</Btn>}
            </div>
            <div className="lp-manage__row">
              <div>
                <div className="lp-manage__lbl">Rozliczenie</div>
                <div className="lp-manage__val">{billingLabel}{sub.billing === "rok" ? " · −10%" : ""}</div>
              </div>
              {sub.billing === "rok"
                ? <span className="text-xs text-muted">najtańsza opcja</span>
                : <Btn variant="outline" size="sm" onClick={() => onUpgrade("billing")}>Przejdź na roczne →</Btn>}
            </div>
          </div>
        </div>

        <div className="lp-cta lp-cta--secondary">
          <Btn variant="outline" size="md">Zobacz rozliczenia</Btn>
          <span className="text-xs text-muted">Faktury, historia płatności i dokumenty polis</span>
        </div>
      </div>
    </div>
  );
}

// ─── LP FEATURES (grid + LeaseLink callout) ──────────────────────────────────
function LPFeatures({ sub }) {
  const gridRef = useRef(null);
  const inView = useInView(gridRef, { once: true, margin: "-40px" });

  return (
    <section className="lp-features">
      <h3 className="lp-section-title">Co dostajesz w cenie</h3>

      <LeaseLinkCallout />

      <div className="lp-feat-grid" ref={gridRef}>
        {LP_FEATURES.map((f, i) => {
          const locked = f.requiresInfakt && !sub.infaktAddon;
          return (
            <motion.div
              key={f.id}
              className={`lp-feat${locked ? " lp-feat--locked" : ""}`}
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? {
                opacity: locked ? 0.45 : 1,
                y: 0,
              } : { opacity: 0, y: 14 }}
              transition={{
                duration: 0.34,
                ease: [0.22, 1, 0.36, 1],
                delay: inView ? i * 0.035 : 0,
              }}
            >
              <motion.span
                className={`lp-feat__dot${locked ? " is-off" : ""}`}
                animate={{
                  scale: locked ? 0.7 : 1,
                  backgroundColor: locked ? "rgba(113,113,122,0.28)" : "var(--color-lime)",
                  boxShadow: locked ? "0 0 0 0 rgba(206,255,62,0)" : "0 0 0 3px rgba(206,255,62,0.18)",
                }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              />
              <div className="lp-feat__body">
                <div className="lp-feat__head">
                  <span className="lp-feat__name">{f.name}</span>
                  {f.gratis && <span className="lp-chip lp-chip--lime">GRATIS</span>}
                  {locked && <span className="lp-chip lp-chip--muted">wymaga inFakt</span>}
                </div>
                <div className="lp-feat__note">{f.note}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// ─── LEASELINK CALLOUT ───────────────────────────────────────────────────────
function LeaseLinkCallout() {
  const limit = LP_PRODUCT.leaselinkLimit;
  return (
    <div className="lp-leaselink">
      {/* Atmospheric background: radial gradient + dot pattern overlay */}
      <div className="lp-leaselink__atmos" aria-hidden>
        <svg className="lp-leaselink__pattern" width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="xMaxYMid slice">
          <defs>
            <pattern id="ll-dots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="currentColor" />
            </pattern>
            <radialGradient id="ll-glow" cx="85%" cy="30%" r="55%">
              <stop offset="0%" stopColor="#CEFF3E" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#CEFF3E" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#CEFF3E" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="600" height="200" fill="url(#ll-glow)" />
          <rect width="600" height="200" fill="url(#ll-dots)" opacity="0.35" />
        </svg>
      </div>
      <div className="lp-leaselink__bar" />
      <div className="lp-leaselink__body">
        <div className="lp-leaselink__eyebrow">
          <span className="lp-leaselink__eyebrow-dot" />
          Prelimit LeaseLink — dostępny od dnia 1
        </div>
        <div className="lp-leaselink__amount">
          <span className="lp-leaselink__currency">zł</span>
          <span className="lp-leaselink__digits">{limit.toLocaleString("pl-PL").replace(/,/g, " ")}</span>
        </div>
        <p className="lp-leaselink__note">
          PWZ-based · decyzja 30 sek · bez dokumentów. Sfinansuj sprzęt medyczny, rower premium,
          auto czy elektronikę — wydajesz cudze, swoje zostawiasz w kapitale.
        </p>
      </div>
      <button className="lp-leaselink__cta">
        Zobacz co sfinansujesz
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

// ─── SECONDARY PACKAGES (strefa C) ───────────────────────────────────────────
function SecondaryPackages() {
  const [expanded, setExpanded] = useState(null); // id or null

  return (
    <section className="lp-secondary">
      <h3 className="lp-section-title">Dodatkowe pakiety tematyczne</h3>
      <p className="text-sm text-muted mb-4">Wąskie pakiety jeśli nie potrzebujesz pełnej infrastruktury Lekarza Przedsiębiorcy.</p>

      <div className="lp-secondary__grid">
        {SECONDARY_PACKAGES.map(pkg => {
          const open = expanded === pkg.id;
          return (
            <div key={pkg.id} className={`lp-secondary__card${open ? " is-open" : ""}`}>
              <div className="lp-secondary__head">
                <div>
                  <div className="lp-secondary__name">{pkg.label}</div>
                  <div className="lp-secondary__desc">{pkg.desc}</div>
                </div>
                <div className="lp-secondary__price">
                  <div className="text-[20px] font-bold tracking-[-0.03em]">{pkg.packagePrice} zł<span className="text-sm text-muted font-normal">/mies.</span></div>
                  <div className="text-xs text-muted">{pkg.items.length} {pkg.items.length === 1 ? "usługa" : "usługi"}</div>
                </div>
              </div>
              <button className="lp-secondary__toggle" onClick={() => setExpanded(open ? null : pkg.id)}>
                {open ? "Zwiń szczegóły" : "Zobacz szczegóły"} {open ? "▴" : "▾"}
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="lp-secondary__items">
                      {pkg.items.map(item => (
                        <div key={item.id} className="lp-secondary__item">
                          <div className="flex-1">
                            <span className="text-sm font-medium">{item.name}</span>
                            <span className="text-xs text-muted ml-2">{item.desc}</span>
                          </div>
                          <span className="text-xs font-medium text-muted">{item.price > 0 ? `${item.price} zł/mies.` : "gratis"}</span>
                        </div>
                      ))}
                      <div className="lp-secondary__cta">
                        <Btn variant="primary" size="sm">Kup pakiet za {pkg.packagePrice} zł/mies.</Btn>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── LP UPGRADE DRAWER ───────────────────────────────────────────────────────
function LPUpgradeDrawer({ variant, sub, setSub, onClose }) {
  const [closing, setClosing] = useState(false);
  const lloydsUpgradeOpts = LP_PRODUCT.lloydOptions.filter(o => o.sum > sub.lloydSum);
  const [lloydsPick, setLloydsPick] = useState(lloydsUpgradeOpts[0]?.sum ?? null);

  const close = () => { setClosing(true); setTimeout(onClose, 220); };

  let title, body, confirmLabel, onConfirm;

  if (variant === "lloyds") {
    title = "Zwiększ sumę ubezpieczenia utraty dochodu";
    body = (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted">
          Obecna suma: <strong className="text-fg">{sub.lloydSum / 1000}k / mies.</strong>
          {" "}Upgrade dla lekarzy z wysokimi przychodami B2B — większa ochrona przy chorobie lub wypadku.
        </p>
        {lloydsUpgradeOpts.length === 0 ? (
          <div className="lp-alert">Masz już maksymalną sumę Lloyd's (15 000 zł / mies.).</div>
        ) : lloydsUpgradeOpts.map(opt => (
          <button
            key={opt.sum}
            className={`lp-opt${lloydsPick === opt.sum ? " is-active" : ""}`}
            onClick={() => setLloydsPick(opt.sum)}
          >
            <div className="lp-opt__name">{opt.label}</div>
            <div className="lp-opt__sub">{opt.sub}</div>
          </button>
        ))}
      </div>
    );
    confirmLabel = lloydsUpgradeOpts.length ? "Przejdź na wyższą sumę od następnego cyklu" : null;
    onConfirm = () => { setSub(s => ({ ...s, lloydSum: lloydsPick })); close(); };
  } else if (variant === "infakt") {
    title = "Dodaj księgowość inFakt";
    body = (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted">
          inFakt przejmuje księgowość Twojej JDG. Po aktywacji odblokowują się:
        </p>
        <ul className="lp-blist">
          <li>Konto firmowe AION — zero opłat, karta co-branded</li>
          <li>Kreator JDG — wskazywalny do US i ZUS</li>
          <li>Jednorazowy bonus <strong className="text-fg">1 000 zł</strong> za aktywację</li>
        </ul>
        <div className="lp-summary">
          <div className="lp-summary__row"><span>Dopłata</span><strong>+179 zł/msc</strong></div>
          <div className="lp-summary__row"><span>Bonus jednorazowy</span><strong className="text-green">+1 000 zł</strong></div>
        </div>
      </div>
    );
    confirmLabel = "Dodaj inFakt do subskrypcji";
    onConfirm = () => { setSub(s => ({ ...s, infaktAddon: true })); close(); };
  } else if (variant === "billing") {
    title = "Przejdź na rozliczenie roczne";
    body = (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted">
          Jeden punkt decyzji na rok zamiast dwunastu. Lloyd's bez surcharge 10%, oszczędność 10% na całej subskrypcji.
        </p>
        <div className="lp-summary">
          <div className="lp-summary__row"><span>Obecnie (miesięcznie)</span><strong>{calcLPPrice({ ...sub, billing: "msc" }).effective} zł/msc</strong></div>
          <div className="lp-summary__row"><span>Po zmianie (rocznie)</span><strong className="text-green">{calcLPPrice({ ...sub, billing: "rok" }).effective} zł/msc</strong></div>
          <div className="lp-summary__row"><span>Oszczędność</span><strong className="text-green">{calcLPPrice({ ...sub, billing: "rok" }).annualSaving} zł / rok</strong></div>
        </div>
      </div>
    );
    confirmLabel = "Przełącz od następnego cyklu";
    onConfirm = () => { setSub(s => ({ ...s, billing: "rok" })); close(); };
  }

  return (
    <>
      <motion.div
        className="drawer-overlay"
        onClick={close}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        className={`drawer lp-drawer${closing ? " drawer--closing" : ""}`}
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="lp-drawer__header">
          <div className="lp-drawer__title">{title}</div>
          <button className="lp-drawer__close" onClick={close} aria-label="Zamknij">✕</button>
        </div>
        <div className="lp-drawer__content">
          {body}
        </div>
        {confirmLabel && (
          <div className="lp-drawer__footer">
            <Btn variant="accent" size="lg" onClick={onConfirm}>{confirmLabel}</Btn>
            <button className="lp-link" onClick={close}>Anuluj</button>
          </div>
        )}
      </motion.div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── SERVICES 2 VIEW (bottom-up discovery) ─────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
// User przegląda pojedyncze usługi, dodaje do koszyka. Gdy zbiera klocki
// z pakietu LP, system progresywnie ujawnia istnienie pakietu:
//   L1 (≥2 LP items) — subtle bar informujący że usługi są częścią pakietu
//   L2 (≥4 LP items lub >349 zł) — pełen reveal + mini-config LP inline
// ═══════════════════════════════════════════════════════════════════════════

// LP pitch — kalkulacja savings i content karty reveal
function calcServices2Reveal(cartServices) {
  const cartServiceIds = new Set(cartServices.map(i => i.product.id));
  const lpItems = cartServices.filter(i => LP_CORE_IDS.has(i.product.id));
  const lpInCart = lpItems.length;
  const cartTotal = cartServices.reduce((s, i) => s + (i.priceGross || 0), 0);
  const missingLpServices = SERVICE_CATALOG.filter(s => s.inLP && !cartServiceIds.has(s.id));
  const level = (lpInCart >= 4 || cartTotal >= 349) ? 2 : lpInCart >= 2 ? 1 : 0;
  return { lpInCart, cartTotal, missingLpServices, level };
}

// Konwersja usługi z katalogu na obiekt produktu dla cart state
function serviceToCartProduct(svc) {
  return {
    id: svc.id,
    brand: "Remedium",
    model: svc.label,
    desc: svc.desc,
    categoryId: "service",
    monthlyNet: svc.soloPrice,
    monthlyGross: svc.soloPrice,
    emoji: svc.icon,
    productSellType: "SERVICE",
    priceUnit: svc.priceUnit || "zł/mies.",
  };
}

function Services2View({ cart, addToCart, removeFromCart, lpSub, setLpSub, setActive }) {
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const cartServices = (cart || []).filter(i => i.product?.categoryId === "service");
  const cartServiceIds = new Set(cartServices.map(i => i.product.id));
  const { lpInCart, cartTotal, missingLpServices, level } = calcServices2Reveal(cartServices);

  const selectedService = selectedId ? SERVICE_CATALOG.find(s => s.id === selectedId) : null;

  const visibleServices = filter === "all"
    ? SERVICE_CATALOG
    : SERVICE_CATALOG.filter(s => s.category === filter);

  const toggleService = (svc) => {
    if (cartServiceIds.has(svc.id)) {
      removeFromCart(svc.id);
    } else {
      addToCart(serviceToCartProduct(svc), null, { silent: true });
    }
  };

  const swapToLP = (opts = {}) => {
    // Wymiana koszyka na pakiet LP: usuwamy wszystkie service items z koszyka,
    // aktywujemy LP z parametrami wybranymi w mini-config.
    cartServices.forEach(i => removeFromCart(i.key));
    setLpSub(s => ({
      ...s,
      active: true,
      billing: opts.billing ?? s.billing,
      lloydSum: opts.lloydSum ?? s.lloydSum,
      infaktAddon: opts.infaktAddon ?? s.infaktAddon,
      activatedAt: "15 kwi 2026",
      nextRenewal: (opts.billing ?? s.billing) === "rok" ? "15 kwi 2027" : "15 maj 2026",
    }));
    // Przekierowanie na Usługi 1 żeby user zobaczył post-sale panel
    setTimeout(() => setActive && setActive("packages"), 150);
  };

  return (
    <div className="s2-view">
      <AnimatePresence mode="wait" initial={false}>
        {selectedService ? (
          <motion.div
            key="detail"
            className="s2-view__inner"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <ServiceDetailView
              service={selectedService}
              inCart={cartServiceIds.has(selectedService.id)}
              onToggle={() => toggleService(selectedService)}
              onBack={() => setSelectedId(null)}
              onOpenRelated={(id) => setSelectedId(id)}
              cartServices={cartServices}
              cartTotal={cartTotal}
              lpInCart={lpInCart}
              missingLpServices={missingLpServices}
              level={level}
              onRemove={removeFromCart}
              onSwap={swapToLP}
            />
          </motion.div>
        ) : (
          <motion.div
            key="catalog"
            className="s2-view__inner"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="s2-view__intro">
              <h2 className="text-[20px] font-bold tracking-[-0.02em]">Usługi</h2>
              <p className="text-sm text-muted mt-1">
                Wybierz usługi których potrzebujesz. Każda kupowana osobno lub w pakiecie — porównamy w trakcie.
              </p>
            </div>

            {/* Category filter */}
            <div className="s2-filter" role="tablist" aria-label="Kategorie usług">
              {SERVICE_CATEGORIES.map(c => {
                const active = filter === c.id;
                const count = c.id === "all" ? SERVICE_CATALOG.length : SERVICE_CATALOG.filter(s => s.category === c.id).length;
                return (
                  <button
                    key={c.id}
                    role="tab"
                    aria-selected={active}
                    className={`s2-filter__opt${active ? " is-active" : ""}`}
                    onClick={() => setFilter(c.id)}
                  >
                    {active && <motion.span className="s2-filter__indicator" layoutId="s2-filter-indicator" transition={{ type: "spring", stiffness: 420, damping: 34 }} aria-hidden />}
                    <span className="s2-filter__label">{c.label}</span>
                    <span className="s2-filter__count">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="s2-grid-layout">
              {/* Catalog grid */}
              <div className="s2-catalog">
                {visibleServices.map(svc => (
                  <ServiceCatalogCard
                    key={svc.id}
                    service={svc}
                    inCart={cartServiceIds.has(svc.id)}
                    onToggle={() => toggleService(svc)}
                    onOpen={() => setSelectedId(svc.id)}
                  />
                ))}
              </div>

              {/* Sidebar: cart + LP reveal */}
              <aside className="s2-sidebar">
                <Services2Cart
                  items={cartServices}
                  total={cartTotal}
                  lpInCart={lpInCart}
                  onRemove={(key) => removeFromCart(key)}
                />

                <AnimatePresence mode="wait">
                  {level === 1 && (
                    <motion.div
                      key="l1"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <LPRevealL1 lpInCart={lpInCart} missingCount={missingLpServices.length} />
                    </motion.div>
                  )}
                  {level === 2 && (
                    <motion.div
                      key="l2"
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <LPRevealL2
                        lpInCart={lpInCart}
                        cartTotal={cartTotal}
                        missingServices={missingLpServices}
                        onSwap={swapToLP}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Service catalog card ────────────────────────────────────────────────────
function ServiceCatalogCard({ service, inCart, onToggle, onOpen }) {
  const price = service.soloPrice;
  const unit = service.priceUnit || "zł / mies.";
  const handleCardClick = (e) => {
    // Nie otwieraj detail jeśli user kliknął w button Dodaj/W koszyku
    if (e.target.closest(".s2-card__cta")) return;
    onOpen && onOpen();
  };
  return (
    <motion.div
      className={`s2-card${inCart ? " is-in-cart" : ""}`}
      onClick={handleCardClick}
      layout
      transition={{ duration: 0.2 }}
    >
      <div className="s2-card__top">
        <div className="s2-card__icon" aria-hidden>{service.icon}</div>
        {service.inLP && (
          <span className="s2-card__lp-hint" title="Usługa jest częścią pakietu Lekarz Przedsiębiorca">
            w pakiecie LP
          </span>
        )}
      </div>
      <div className="s2-card__body">
        <h4 className="s2-card__title">{service.label}</h4>
        <p className="s2-card__desc">{service.desc}</p>
        <ul className="s2-card__features">
          {service.soloFeatures.map((f, i) => <li key={i}>{f}</li>)}
        </ul>
      </div>
      <div className="s2-card__footer">
        <div className="s2-card__price">
          <span className="s2-card__price-num">{price}</span>
          <span className="s2-card__price-unit">{unit}</span>
        </div>
        <button
          className={`s2-card__cta${inCart ? " is-in-cart" : ""}`}
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
        >
          {inCart ? (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden><path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              W koszyku
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              Dodaj
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Sidebar: koszyk Services 2 ──────────────────────────────────────────────
function Services2Cart({ items, total, lpInCart, onRemove }) {
  return (
    <div className="s2-cart">
      <div className="s2-cart__head">
        <div>
          <div className="s2-cart__eyebrow">Twój koszyk</div>
          <div className="s2-cart__count">{items.length} {items.length === 1 ? "usługa" : items.length < 5 ? "usługi" : "usług"}</div>
        </div>
        <div className="s2-cart__total">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={total}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="s2-cart__total-num"
            >
              {total} zł
            </motion.div>
          </AnimatePresence>
          <div className="s2-cart__total-unit">/ mies.</div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="s2-cart__empty">
          Dodaj pierwszą usługę z katalogu.
        </div>
      ) : (
        <ul className="s2-cart__list">
          <AnimatePresence initial={false}>
            {items.map(item => (
              <motion.li
                key={item.key}
                className="s2-cart__item"
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22 }}
              >
                <span className="s2-cart__item-icon" aria-hidden>{item.product.emoji}</span>
                <span className="s2-cart__item-name">{item.product.model}</span>
                <span className="s2-cart__item-price">{item.priceGross} zł</span>
                <button className="s2-cart__item-remove" onClick={() => onRemove(item.key)} aria-label="Usuń">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

// ─── Service Detail View (per-service landing page) ─────────────────────────
function ServiceDetailView({
  service, inCart, onToggle, onBack, onOpenRelated,
  cartServices, cartTotal, lpInCart, missingLpServices, level,
  onRemove, onSwap,
}) {
  const landing = service.landing || {};
  const [openFaq, setOpenFaq] = useState(null);
  const price = service.soloPrice;
  const unit = service.priceUnit || "zł / mies.";

  // Related: do 3 innych usług z tej samej kategorii, bez obecnej
  const related = SERVICE_CATALOG
    .filter(s => s.category === service.category && s.id !== service.id)
    .slice(0, 3);

  return (
    <div className="s2-detail">
      <button className="s2-detail__back" onClick={onBack}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M9 3l-4 4 4 4M5 7h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Wróć do katalogu
      </button>

      <div className="s2-detail__layout">
        {/* Main column */}
        <div className="s2-detail__main">
          {/* Hero */}
          <section className="s2-detail__hero">
            <div className="s2-detail__hero-left">
              <div className="s2-detail__icon" aria-hidden>{service.icon}</div>
            </div>
            <div className="s2-detail__hero-body">
              <div className="s2-detail__meta-row">
                <div className="s2-detail__category">
                  {SERVICE_CATEGORIES.find(c => c.id === service.category)?.label}
                </div>
                {service.inLP && (
                  <span className="s2-detail__lp-hint" title="Usługa jest częścią pakietu Lekarz Przedsiębiorca">
                    w pakiecie Lekarz Przedsiębiorca
                  </span>
                )}
              </div>
              <h1 className="s2-detail__title">{service.label}</h1>
              <p className="s2-detail__long">{landing.longDesc || service.desc}</p>
              {landing.partner && (
                <div className="s2-detail__partner">
                  <span className="s2-detail__partner-lbl">Dostawca:</span>
                  <span className="s2-detail__partner-val">{landing.partner}</span>
                </div>
              )}
            </div>
          </section>

          {/* Value props */}
          {landing.valueProps && landing.valueProps.length > 0 && (
            <section className="s2-detail__section">
              <div className="s2-vp-grid">
                {landing.valueProps.map((vp, i) => (
                  <motion.div
                    key={i}
                    className="s2-vp"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="s2-vp__title">{vp.title}</div>
                    <div className="s2-vp__desc">{vp.desc}</div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Co obejmuje */}
          <section className="s2-detail__section">
            <h2 className="s2-detail__h2">Co obejmuje</h2>
            <div className="s2-includes">
              {(landing.includes || service.soloFeatures.map(f => ({ title: f, desc: "" }))).map((item, i) => (
                <div key={i} className="s2-include">
                  <div className="s2-include__dot" aria-hidden />
                  <div className="s2-include__body">
                    <div className="s2-include__title">{item.title}</div>
                    {item.desc && <div className="s2-include__desc">{item.desc}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Jak to działa */}
          {landing.howItWorks && landing.howItWorks.length > 0 && (
            <section className="s2-detail__section">
              <h2 className="s2-detail__h2">Jak to działa</h2>
              <ol className="s2-steps">
                {landing.howItWorks.map((step, i) => (
                  <li key={i} className="s2-step">
                    <div className="s2-step__num">{i + 1}</div>
                    <div className="s2-step__body">
                      <div className="s2-step__title">{step.title}</div>
                      <div className="s2-step__desc">{step.desc}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* LP advantage callout */}
          {service.inLP && service.lpAdvantage && (
            <section className="s2-detail__section">
              <div className="s2-lp-banner">
                <div className="s2-lp-banner__bar" aria-hidden />
                <div className="s2-lp-banner__body">
                  <div className="s2-lp-banner__eyebrow">W pakiecie Lekarz Przedsiębiorca</div>
                  <div className="s2-lp-banner__title">{service.lpAdvantage}</div>
                  <div className="s2-lp-banner__note">
                    Pakiet LP łączy 10 usług, 7 ekskluzywnych perków i prelimit LeaseLink 87 000 zł
                    za 349 zł/msc. Suma Twoich usług osobno — {cartTotal} zł/msc.
                  </div>
                </div>
                <button className="s2-lp-banner__cta" onClick={onBack}>
                  Zobacz pakiet
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 6h6M6 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </section>
          )}

          {/* FAQ */}
          {landing.faq && landing.faq.length > 0 && (
            <section className="s2-detail__section">
              <h2 className="s2-detail__h2">Częste pytania</h2>
              <div className="s2-faq">
                {landing.faq.map((item, i) => {
                  const open = openFaq === i;
                  return (
                    <div key={i} className={`s2-faq__item${open ? " is-open" : ""}`}>
                      <button className="s2-faq__q" onClick={() => setOpenFaq(open ? null : i)} aria-expanded={open}>
                        <span>{item.q}</span>
                        <motion.span
                          className="s2-faq__chev"
                          animate={{ rotate: open ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          aria-hidden
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                            style={{ overflow: "hidden" }}
                          >
                            <div className="s2-faq__a">{item.a}</div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Related services */}
          {related.length > 0 && (
            <section className="s2-detail__section">
              <h2 className="s2-detail__h2">Zobacz też</h2>
              <div className="s2-related">
                {related.map(s => (
                  <button key={s.id} className="s2-related__card" onClick={() => onOpenRelated(s.id)}>
                    <div className="s2-related__icon" aria-hidden>{s.icon}</div>
                    <div className="s2-related__body">
                      <div className="s2-related__name">{s.short}</div>
                      <div className="s2-related__price">{s.soloPrice} {s.priceUnit || "zł/msc"}</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="s2-related__arrow"><path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar: sticky price card + cart + LP reveal */}
        <aside className="s2-detail__aside">
          <div className="s2-detail__price-card">
            <div className="s2-detail__price-num">
              {price}
              <span className="s2-detail__price-unit">{unit}</span>
            </div>
            <button
              className={`s2-detail__cta${inCart ? " is-in-cart" : ""}`}
              onClick={onToggle}
            >
              {inCart ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  W koszyku
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  Dodaj do koszyka
                </>
              )}
            </button>
            {service.inLP && (
              <div className="s2-detail__lp-hint-card">
                💡 {service.lpAdvantage}
              </div>
            )}
          </div>

          <Services2Cart
            items={cartServices}
            total={cartTotal}
            lpInCart={lpInCart}
            onRemove={onRemove}
          />

          <AnimatePresence mode="wait">
            {level === 1 && (
              <motion.div key="l1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <LPRevealL1 lpInCart={lpInCart} missingCount={missingLpServices.length} />
              </motion.div>
            )}
            {level === 2 && (
              <motion.div key="l2" initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }} transition={{ duration: 0.32 }}>
                <LPRevealL2 lpInCart={lpInCart} cartTotal={cartTotal} missingServices={missingLpServices} onSwap={onSwap} />
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}

// ─── LP Reveal Level 1 (subtle hint) ─────────────────────────────────────────
function LPRevealL1({ lpInCart, missingCount }) {
  return (
    <div className="s2-reveal s2-reveal--l1">
      <span className="s2-reveal__dot" aria-hidden />
      <div className="s2-reveal__body">
        <strong>{lpInCart} z 10 usług pakietu</strong> — te klocki często idą razem w pakiecie <em>Lekarz Przedsiębiorca</em>. Dodaj jeszcze {missingCount === 1 ? "jedną" : "kilka"}, żeby zobaczyć porównanie.
      </div>
    </div>
  );
}

// ─── LP Reveal Level 2 (full reveal + mini-config) ───────────────────────────
function LPRevealL2({ lpInCart, cartTotal, missingServices, onSwap }) {
  const [billing, setBilling] = useState("rok");
  const [lloydSum, setLloydSum] = useState(5000);
  const [infaktAddon, setInfaktAddon] = useState(true);

  const pseudoSub = { billing, lloydSum, infaktAddon, active: false };
  const { effective } = calcLPPrice(pseudoSub);
  const savings = cartTotal - effective;

  return (
    <div className="s2-reveal s2-reveal--l2">
      {/* Header reveal moment */}
      <div className="s2-reveal__header">
        <div className="s2-reveal__sparkle" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 1l1.5 4.5L15 7l-4.5 1.5L9 13l-1.5-4.5L3 7l4.5-1.5L9 1z" fill="currentColor"/>
          </svg>
        </div>
        <div>
          <div className="s2-reveal__eyebrow">Mamy dla Ciebie pakiet</div>
          <h3 className="s2-reveal__title">Lekarz Przedsiębiorca</h3>
          <div className="s2-reveal__sub">Twój koszyk pokrywa <strong>{lpInCart} z 10 usług</strong> tego pakietu</div>
        </div>
      </div>

      {/* Comparison */}
      <div className="s2-compare">
        <div className="s2-compare__col">
          <div className="s2-compare__lbl">Twój koszyk</div>
          <div className="s2-compare__val s2-compare__val--muted">
            {cartTotal} <span>zł/mies</span>
          </div>
          <div className="s2-compare__note">{lpInCart} {lpInCart === 1 ? "usługa" : "usług"} z pakietu</div>
        </div>
        <div className="s2-compare__arrow" aria-hidden>
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><path d="M1 6h15M12 1l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div className="s2-compare__col s2-compare__col--featured">
          <div className="s2-compare__lbl">Pakiet LP</div>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={effective}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="s2-compare__val"
            >
              {effective} <span>zł/mies</span>
            </motion.div>
          </AnimatePresence>
          <div className="s2-compare__note">10 usług + extra</div>
        </div>
      </div>

      {savings > 0 && (
        <div className="s2-savings">
          <span className="s2-savings__num">−{savings} zł</span>
          <span className="s2-savings__lbl">miesięcznie · {Math.round((savings / cartTotal) * 100)}% taniej niż osobno</span>
        </div>
      )}

      {/* What you ALSO get in LP */}
      <div className="s2-also">
        <div className="s2-also__title">Dodatkowo w pakiecie dostajesz:</div>
        <div className="s2-also__grid">
          {missingServices.slice(0, 4).map(s => (
            <div key={s.id} className="s2-also__row s2-also__row--service">
              <span className="s2-also__icon" aria-hidden>{s.icon}</span>
              <span className="s2-also__name">{s.short}</span>
              <span className="s2-also__price">warte {s.soloPrice} zł/msc</span>
            </div>
          ))}
          {LP_EXCLUSIVES.map(ex => (
            <div key={ex.id} className={`s2-also__row s2-also__row--exclusive${ex.comingSoon ? " is-coming" : ""}`}>
              <span className="s2-also__icon" aria-hidden>{ex.icon}</span>
              <div className="s2-also__body">
                <div className="s2-also__name">{ex.label}</div>
                <div className="s2-also__note">{ex.note}</div>
              </div>
              {ex.comingSoon ? (
                <span className="s2-chip s2-chip--muted">wkrótce</span>
              ) : (
                <span className="s2-chip s2-chip--lime">tylko w LP</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mini-config inline */}
      <div className="s2-mini">
        <div className="s2-mini__title">Dostosuj pakiet:</div>

        {/* Billing */}
        <div className="s2-mini__row">
          <div className="s2-mini__lbl">Rozliczenie</div>
          <div className="s2-mini__billing">
            {[{ id: "msc", label: "Miesięcznie" }, { id: "rok", label: "Rocznie −10%" }].map(o => (
              <button
                key={o.id}
                className={`s2-mini__opt${billing === o.id ? " is-active" : ""}`}
                onClick={() => setBilling(o.id)}
              >
                {billing === o.id && <motion.span className="s2-mini__indicator" layoutId="s2-mini-billing" transition={{ type: "spring", stiffness: 420, damping: 34 }} aria-hidden />}
                <span>{o.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lloyd's sum */}
        <div className="s2-mini__row">
          <div className="s2-mini__lbl">Suma Lloyd's</div>
          <div className="s2-mini__lloyds">
            {LP_PRODUCT.lloydOptions.map(opt => (
              <button
                key={opt.sum}
                className={`s2-mini__opt${lloydSum === opt.sum ? " is-active" : ""}`}
                onClick={() => setLloydSum(opt.sum)}
              >
                {lloydSum === opt.sum && <motion.span className="s2-mini__indicator" layoutId="s2-mini-lloyds" transition={{ type: "spring", stiffness: 420, damping: 34 }} aria-hidden />}
                <span>{opt.sum / 1000}k</span>
              </button>
            ))}
          </div>
        </div>

        {/* inFakt */}
        <div className="s2-mini__row">
          <div className="s2-mini__lbl">
            inFakt
            <span className="s2-mini__note">+ 1 000 zł bonus</span>
          </div>
          <label className="s2-mini__switch">
            <input type="checkbox" checked={infaktAddon} onChange={e => setInfaktAddon(e.target.checked)} />
            <span className="s2-mini__switch-track" />
            <span className="s2-mini__switch-thumb" />
          </label>
        </div>
      </div>

      <div className="s2-reveal__cta">
        <button
          className="s2-reveal__confirm"
          onClick={() => onSwap({ billing, lloydSum, infaktAddon })}
        >
          Zamień koszyk na pakiet LP
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="s2-reveal__fineprint">
          Dotychczasowe usługi w koszyku zostaną zastąpione pakietem. Subskrypcję możesz anulować w dowolnym momencie.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── SERVICES 3 VIEW (ekosystem / gap analysis) ────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
// Mentalny model: mapa obszarów życia lekarza. Każdy obszar pokazuje status
// pokrycia (covered / partial / gap / soon). User widzi ile "ekosystemu" ma
// zabezpieczone. LP staje się "zbuduj cały ekosystem w 1 aktywacji".
// ═══════════════════════════════════════════════════════════════════════════

function Services3View({ lpSub, setLpSub, activeServices, toggleActiveService, setActive }) {
  const [selectedAreaId, setSelectedAreaId] = useState(null);

  // Efektywny zbiór aktywnych usług: ręczne aktywacje + LP_CORE_IDS jeśli LP aktywne
  const effectiveActive = React.useMemo(() => {
    const s = new Set(activeServices);
    if (lpSub?.active) LP_CORE_IDS.forEach(id => s.add(id));
    return s;
  }, [activeServices, lpSub?.active]);

  // Status per obszar
  const areasWithStatus = LIFE_AREAS.map(area => ({
    ...area,
    ...computeAreaStatus(area, effectiveActive, !!lpSub?.active),
  }));

  // Metryki agregatowe (pomijamy obszary "soon" z mianownika)
  const countable = areasWithStatus.filter(a => a.status !== "soon");
  const coveredCount = countable.filter(a => a.status === "covered").length;
  const partialCount = countable.filter(a => a.status === "partial").length;
  const totalCountable = countable.length;
  const coveragePct = totalCountable ? Math.round((coveredCount / totalCountable) * 100) : 0;

  // Jakie obszary dodałby LP (te które są coveredByLP i obecnie nie są covered)
  const lpWouldAdd = areasWithStatus.filter(a => a.coveredByLP && a.status !== "covered" && a.status !== "soon").length;
  const lpTotal = LIFE_AREAS.filter(a => a.coveredByLP).length;

  const selectedArea = selectedAreaId ? areasWithStatus.find(a => a.id === selectedAreaId) : null;

  const activateLP = () => {
    setLpSub(s => ({ ...s, active: true, activatedAt: "15 kwi 2026", nextRenewal: s.billing === "rok" ? "15 kwi 2027" : "15 maj 2026" }));
    setTimeout(() => setActive && setActive("packages"), 150);
  };

  return (
    <div className="s3-view">
      <AnimatePresence mode="wait" initial={false}>
        {selectedArea ? (
          <motion.div
            key="detail"
            className="s3-view__inner"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <AreaDetailView
              area={selectedArea}
              effectiveActive={effectiveActive}
              lpActive={!!lpSub?.active}
              onToggleService={toggleActiveService}
              onBack={() => setSelectedAreaId(null)}
              onGoToLP={() => { setSelectedAreaId(null); setActive && setActive("packages"); }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            className="s3-view__inner"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Hero — title + progress ring */}
            <section className="s3-hero">
              <div className="s3-hero__body">
                <div className="s3-hero__eyebrow">Twój ekosystem</div>
                <h2 className="s3-hero__title">
                  Pokrywasz <span className="s3-hero__num">{coveredCount}</span>
                  <span className="s3-hero__denom"> z {totalCountable} obszarów</span>
                </h2>
                <p className="s3-hero__sub">
                  {partialCount > 0
                    ? <><strong>{partialCount}</strong> {partialCount === 1 ? "obszar masz" : "obszarów masz"} częściowo pokrytych. Dopełnij ekosystem pojedynczo lub weź pakiet.</>
                    : "Zobacz które sfery życia zawodowego masz zabezpieczone i co zostało do uzupełnienia."}
                </p>
              </div>
              <div className="s3-hero__ring">
                <CoverageRing pct={coveragePct} />
              </div>
            </section>

            {/* Unified grid — LP hero (when not active) + area cards */}
            <div className="s3-grid">
              {!lpSub?.active && (
                <LPHeroCard lpWouldAdd={lpWouldAdd} lpTotal={lpTotal} onClick={() => setActive && setActive("packages")} />
              )}
              {areasWithStatus.map(area => (
                <AreaCard
                  key={area.id}
                  area={area}
                  onClick={() => area.status !== "soon" && setSelectedAreaId(area.id)}
                />
              ))}
            </div>

            {lpSub?.active && (
              <div className="s3-lp-active">
                <span className="s3-lp-active__dot" aria-hidden />
                Pakiet Lekarz Przedsiębiorca aktywny — automatycznie pokrywa {lpTotal} obszarów ekosystemu.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Coverage ring (SVG progress) ────────────────────────────────────────────
function CoverageRing({ pct }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="s3-ring">
      <svg width="112" height="112" viewBox="0 0 112 112" className="s3-ring__svg">
        <circle cx="56" cy="56" r={radius} className="s3-ring__track" />
        <motion.circle
          cx="56" cy="56" r={radius}
          className="s3-ring__fill"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="s3-ring__center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={pct}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="s3-ring__pct"
          >
            {pct}%
          </motion.div>
        </AnimatePresence>
        <div className="s3-ring__lbl">pokrycia</div>
      </div>
    </div>
  );
}

// ─── Area card (Mews-inspired: quiet uniform tiles, status via subtle bg tint) ─
function AreaCard({ area, onClick }) {
  const isSoon = area.status === "soon";
  const isCovered = area.status === "covered";
  const ctaLabel = isCovered ? "Zarządzaj" : isSoon ? "Wkrótce" : "Zobacz szczegóły";

  return (
    <motion.div
      layout
      className={`s3-card s3-card--${area.status}${isSoon ? " is-soon" : ""}`}
      onClick={onClick}
      whileHover={isSoon ? {} : { y: -2 }}
      transition={{ duration: 0.15 }}
    >
      <div className="s3-card__icon" aria-hidden>{area.icon}</div>
      <div className="s3-card__body">
        <h3 className="s3-card__title">{area.label}</h3>
        <p className="s3-card__desc">{area.short}</p>
      </div>
      {!isSoon && (
        <div className="s3-card__link">
          <span>{ctaLabel}</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
      {isSoon && (
        <div className="s3-card__link s3-card__link--soon">
          <span>Wkrótce</span>
        </div>
      )}
    </motion.div>
  );
}

// ─── LP Hero card (Mews-style featured card — lime dominant) ────────────────
function LPHeroCard({ lpWouldAdd, lpTotal, onClick }) {
  return (
    <motion.div
      className="s3-card s3-card--hero"
      onClick={onClick}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    >
      <div className="s3-card__icon s3-card__icon--hero" aria-hidden>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 1l2.5 7 7 2.5-7 2.5L11 21l-2.5-7-7-2.5 7-2.5L11 1z" fill="currentColor"/>
        </svg>
      </div>
      <div className="s3-card__body">
        <h3 className="s3-card__title">Pakiet Lekarz Przedsiębiorca</h3>
        <p className="s3-card__desc">
          Jedna subskrypcja pokrywa {lpTotal} obszarów Twojego ekosystemu — zamiast aktywować je pojedynczo.
        </p>
      </div>
      <div className="s3-card__link s3-card__link--hero">
        <span>Zobacz pakiet</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </motion.div>
  );
}

// ─── Area detail (podstrona ekosystemu) ──────────────────────────────────────
function AreaDetailView({ area, effectiveActive, lpActive, onToggleService, onBack, onGoToLP }) {
  const servicesInArea = area.serviceIds
    .map(id => SERVICE_CATALOG.find(s => s.id === id))
    .filter(Boolean);

  const statusCopy = {
    covered: "Obszar chroniony",
    partial: `Częściowo pokryte (${area.activeCount}/${area.totalCount})`,
    gap: "Masz tu lukę",
  };

  return (
    <div className="s3-detail">
      <button className="s3-detail__back" onClick={onBack}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M9 3l-4 4 4 4M5 7h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Wróć do ekosystemu
      </button>

      {/* Hero card */}
      <section className={`s3-detail__hero s3-detail__hero--${area.status}`}>
        <div className="s3-detail__hero-icon" aria-hidden>{area.icon}</div>
        <div className="s3-detail__hero-body">
          <div className="s3-detail__status">
            <span className={`s3-dot s3-dot--${area.status}`} />
            {statusCopy[area.status]}
          </div>
          <h1 className="s3-detail__title">{area.label}</h1>
          <p className="s3-detail__desc">{area.desc}</p>
        </div>
      </section>

      {/* LP-only callout (Finansowanie) */}
      {area.lpOnly && (
        <div className="s3-detail__lp-only">
          <div className="s3-detail__lp-only-chip">Obszar LP-only</div>
          <p className="s3-detail__lp-only-text">
            Finansowanie i sprzęt (prelimit LeaseLink 87 000 zł, konto AION, karta ZEN co-branded) są dostępne
            wyłącznie w pakiecie Lekarz Przedsiębiorca — {lpActive ? "już aktywne dzięki Twojej subskrypcji." : "nie da się ich aktywować osobno."}
          </p>
          {!lpActive && (
            <button className="s3-detail__lp-only-cta" onClick={onGoToLP}>
              Zobacz pakiet LP
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
        </div>
      )}

      {/* Suggestion (np. Mobilność → Lekarz Kierowca pakiet) */}
      {area.suggestion && !area.lpOnly && (
        <div className="s3-detail__suggestion">
          <span className="s3-detail__suggestion-ic" aria-hidden>💡</span>
          <span>{area.suggestion}</span>
        </div>
      )}

      {/* Services that fill this area */}
      {servicesInArea.length > 0 && (
        <section className="s3-detail__section">
          <h2 className="s3-detail__h2">Usługi wypełniające ten obszar</h2>
          <div className="s3-detail__services">
            {servicesInArea.map(svc => {
              const isActive = effectiveActive.has(svc.id);
              const viaLP = lpActive && LP_CORE_IDS.has(svc.id);
              return (
                <div key={svc.id} className={`s3-svc-card${isActive ? " is-active" : ""}`}>
                  <div className="s3-svc-card__icon" aria-hidden>{svc.icon}</div>
                  <div className="s3-svc-card__body">
                    <div className="s3-svc-card__name">{svc.label}</div>
                    <div className="s3-svc-card__desc">{svc.desc}</div>
                    <div className="s3-svc-card__price">
                      {viaLP ? (
                        <span className="s3-svc-card__via-lp">aktywne przez pakiet LP</span>
                      ) : (
                        <>
                          <strong>{svc.soloPrice}</strong>
                          <span> {svc.priceUnit || "zł / mies."}</span>
                          {isActive && <span className="s3-svc-card__active-tag">aktywne</span>}
                        </>
                      )}
                    </div>
                  </div>
                  {viaLP ? (
                    <div className="s3-svc-card__lock" title="Aktywne przez LP">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  ) : (
                    <button
                      className={`s3-svc-card__toggle${isActive ? " is-active" : ""}`}
                      onClick={() => onToggleService(svc.id)}
                    >
                      {isActive ? "Aktywne ✓" : "Aktywuj"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* LP tease */}
      {area.coveredByLP && area.status !== "covered" && !area.lpOnly && (
        <div className="s3-detail__lp-tease">
          <div className="s3-detail__lp-tease-bar" aria-hidden />
          <div className="s3-detail__lp-tease-body">
            <div className="s3-detail__lp-tease-eyebrow">Alternatywa</div>
            <div className="s3-detail__lp-tease-title">
              Ten obszar jest też w pakiecie <strong>Lekarz Przedsiębiorca</strong>
            </div>
            <div className="s3-detail__lp-tease-note">
              Razem z 6 innymi obszarami (Praktyka, Ochrona dochodu, Firma, Doradztwo, Finansowanie, …) za 349 zł/msc — jedna subskrypcja zamiast kilku.
            </div>
          </div>
          <button className="s3-detail__lp-tease-cta" onClick={onGoToLP}>
            Zobacz pakiet
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden><path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── SERVICES 4 VIEW (flat Znizki-like pattern) ─────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
// Płaska struktura: kategorie u góry, kafelki usług niżej. Klik → landing.
// Bez pośrednich widoków "co w środku" — jedna warstwa zagłębienia.
// ═══════════════════════════════════════════════════════════════════════════

const SERVICE_CAT_THEME = {
  insurance:  { bg: "linear-gradient(135deg, #EEF2FF 0%, #C7D2FE 100%)", fg: "#3730A3" },
  accounting: { bg: "linear-gradient(135deg, #ECFEFF 0%, #A5F3FC 100%)", fg: "#0E7490" },
  medical:    { bg: "linear-gradient(135deg, #FDF4FF 0%, #F5D0FE 100%)", fg: "#86198F" },
  legal:      { bg: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)", fg: "#92400E" },
};

function Services4View({ cart, addToCart, removeFromCart, lpSub, setLpSub, setActive, purchasedServices, openManageService, cancelService, updateServiceParams, pendingManageId, setPendingManageId }) {
  const [subTab, setSubTab] = useState("catalog"); // "catalog" | "my"
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [lpStripDismissed, setLpStripDismissed] = useState(false);

  // Deep-link: jeśli ktoś wywołał openManageService, przełącz na "Moje usługi"
  React.useEffect(() => {
    if (pendingManageId) setSubTab("my");
  }, [pendingManageId]);

  const handleManage = (id) => {
    setPendingManageId && setPendingManageId(id);
    setSubTab("my");
  };
  const cartServices = (cart || []).filter(i => i.product?.categoryId === "service");
  const cartServiceIds = new Set(cartServices.map(i => i.product.id));
  const { lpInCart, cartTotal, missingLpServices, level } = calcServices2Reveal(cartServices);
  const purchased = purchasedServices || {};

  const selectedService = selectedId ? SERVICE_CATALOG.find(s => s.id === selectedId) : null;
  const visibleServices = filter === "all" ? SERVICE_CATALOG : SERVICE_CATALOG.filter(s => s.category === filter);

  const toggleService = (svc) => {
    if (cartServiceIds.has(svc.id)) removeFromCart(svc.id);
    else addToCart(serviceToCartProduct(svc), null, { silent: true });
  };

  const swapToLP = (opts = {}) => {
    cartServices.forEach(i => removeFromCart(i.key));
    setLpSub(s => ({
      ...s,
      active: true,
      billing: opts.billing ?? s.billing,
      lloydSum: opts.lloydSum ?? s.lloydSum,
      infaktAddon: opts.infaktAddon ?? s.infaktAddon,
      activatedAt: "15 kwi 2026",
      nextRenewal: (opts.billing ?? s.billing) === "rok" ? "15 kwi 2027" : "15 maj 2026",
    }));
    setTimeout(() => setActive && setActive("packages"), 150);
  };

  const ownedCount = Object.keys(purchased).length;

  return (
    <div className="s4-view">
      {/* Nagłówek + sub-taby — widoczne tylko na widoku katalog/my (nie na detail) */}
      {!selectedService && (
        <div className="s4-view__header">
          <div className="s4-view__intro">
            <h2 className="text-[20px] font-bold tracking-[-0.02em]">Usługi</h2>
            <p className="text-sm text-muted mt-1">
              {subTab === "catalog"
                ? "Wszystkie usługi w jednym miejscu. Wybierz kategorię albo kliknij kafelek, aby zobaczyć szczegóły."
                : "Aktywne subskrypcje i usługi — parametry, dokumenty, akcje w jednym miejscu."}
            </p>
          </div>
          <div className="s4-subnav" role="tablist">
            <button
              role="tab"
              aria-selected={subTab === "catalog"}
              className={`s4-subnav__tab${subTab === "catalog" ? " is-active" : ""}`}
              onClick={() => setSubTab("catalog")}
            >
              {subTab === "catalog" && <motion.span layoutId="s4-subnav-indicator" className="s4-subnav__indicator" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="s4-subnav__label">Katalog</span>
            </button>
            <button
              role="tab"
              aria-selected={subTab === "my"}
              className={`s4-subnav__tab${subTab === "my" ? " is-active" : ""}`}
              onClick={() => setSubTab("my")}
            >
              {subTab === "my" && <motion.span layoutId="s4-subnav-indicator" className="s4-subnav__indicator" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="s4-subnav__label">Moje usługi</span>
              {ownedCount > 0 && <span className="s4-subnav__count">{ownedCount}</span>}
            </button>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {selectedService ? (
          <motion.div
            key="detail"
            className="s4-view__inner"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <ServiceDetailView
              service={selectedService}
              inCart={cartServiceIds.has(selectedService.id)}
              onToggle={() => toggleService(selectedService)}
              onBack={() => setSelectedId(null)}
              onOpenRelated={(id) => setSelectedId(id)}
              cartServices={cartServices}
              cartTotal={cartTotal}
              lpInCart={lpInCart}
              missingLpServices={missingLpServices}
              level={level}
              onRemove={removeFromCart}
              onSwap={swapToLP}
            />
          </motion.div>
        ) : subTab === "catalog" ? (
          <motion.div
            key="catalog"
            className="s4-view__inner"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {!lpSub?.active && !lpStripDismissed && (
              <LPPromoStrip
                lpSub={lpSub}
                onOpenLP={() => setActive && setActive("packages")}
                onDismiss={() => setLpStripDismissed(true)}
              />
            )}

            <div className="filter-bar s4-filter">
              {SERVICE_CATEGORIES.map(c => (
                <button
                  key={c.id}
                  className={`filter-pill${filter === c.id ? " filter-pill--active" : ""}`}
                  onClick={() => setFilter(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="s4-grid">
              {visibleServices.map(svc => (
                <Service4Card
                  key={svc.id}
                  service={svc}
                  inCart={cartServiceIds.has(svc.id)}
                  isPurchased={!!purchased[svc.id]}
                  onOpen={() => setSelectedId(svc.id)}
                  onManage={() => handleManage(svc.id)}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="my"
            className="s4-view__inner"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <MyServicesView
              purchasedServices={purchasedServices}
              cancelService={cancelService}
              updateServiceParams={updateServiceParams}
              lpSub={lpSub}
              setLpSub={setLpSub}
              pendingManageId={pendingManageId}
              setPendingManageId={setPendingManageId}
              setActive={setActive}
              onGoToCatalog={() => setSubTab("catalog")}
              embedded
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LPPromoStrip({ lpSub, onOpenLP, onDismiss }) {
  const lpPrice = calcLPPrice(lpSub || { billing: "rok", lloydSum: 5000, infaktAddon: true });
  const savings = Math.max(0, LP_ALL_SOLO_MONTHLY - lpPrice.effective);
  return (
    <div className="s4-lp-strip" role="region" aria-label="Promocja pakietu Lekarz Przedsiębiorca">
      <div className="s4-lp-strip__icon" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2l2.4 5.4L18 9l-4 3.8L15 19l-5-3-5 3 1-6.2L2 9l5.6-1.6z" fill="currentColor"/></svg>
      </div>
      <div className="s4-lp-strip__text">
        Kupujesz kilka usług? W pakiecie <strong>Lekarz Przedsiębiorca</strong> zaoszczędzisz
        <strong className="s4-lp-strip__savings"> ~{savings} zł/mies.</strong>
      </div>
      <button className="s4-lp-strip__cta" onClick={onOpenLP}>
        Zobacz pakiet
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <button className="s4-lp-strip__close" onClick={onDismiss} aria-label="Ukryj">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
      </button>
    </div>
  );
}

function Service4Card({ service, inCart, isPurchased, onOpen, onManage }) {
  const theme = SERVICE_CAT_THEME[service.category] || SERVICE_CAT_THEME.insurance;
  const categoryLabel = SERVICE_CATEGORIES.find(c => c.id === service.category)?.label;
  const partner = service.landing?.partner?.split("·")[0]?.trim() || "Remedium";
  const short = service.landing?.longDesc || service.desc;
  const handleClick = () => {
    if (isPurchased) onManage && onManage();
    else onOpen && onOpen();
  };
  return (
    <motion.div
      className={`s4-card${inCart ? " is-in-cart" : ""}${isPurchased ? " is-purchased" : ""}`}
      onClick={handleClick}
      layout
      transition={{ duration: 0.2 }}
    >
      <div className="s4-card__hero" style={{ background: theme.bg, color: theme.fg }}>
        <div className="s4-card__hero-icon" aria-hidden>{service.icon}</div>
        {isPurchased ? (
          <span className="s4-card__badge s4-card__badge--active">Aktywna</span>
        ) : service.inLP && LP_SERVICE_PERK_SHORT[service.id] ? (
          <span className="s4-card__badge s4-card__badge--lp" title="Korzyść w pakiecie Lekarz Przedsiębiorca">
            W LP: {LP_SERVICE_PERK_SHORT[service.id]}
          </span>
        ) : service.inLP ? (
          <span className="s4-card__badge">W LP</span>
        ) : null}
      </div>
      <div className="s4-card__body">
        <div className="s4-card__meta">
          <span className="s4-card__logo" style={{ background: theme.fg }} aria-hidden>
            {partner.charAt(0).toUpperCase()}
          </span>
          <span className="s4-card__partner">{partner}</span>
          <span className="s4-card__cat">{categoryLabel}</span>
        </div>
        <h3 className="s4-card__title">{service.label}</h3>
        <p className="s4-card__desc">{short}</p>
      </div>
      <div className="s4-card__footer">
        <div className="s4-card__price">
          <span className="s4-card__price-num">{service.soloPrice}</span>
          <span className="s4-card__price-unit">zł / mies.</span>
        </div>
        {isPurchased ? (
          <button className="s4-card__cta s4-card__cta--manage" onClick={(e) => { e.stopPropagation(); onManage && onManage(); }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M8 5v3l2 1.5M14 8A6 6 0 11 2 8a6 6 0 0112 0z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Zarządzaj
          </button>
        ) : (
          <button className="s4-card__cta" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Zobacz szczegóły
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── MOJE USŁUGI — HUB + PANEL ZARZĄDZANIA ─────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
// Jedno źródło prawdy o posiadanych usługach. Każda usługa ma swój własny
// panel zarządzania (registry SERVICE_MANAGE_VIEWS), ze wspólnym shellem.
// ═══════════════════════════════════════════════════════════════════════════

function MyServicesView({ purchasedServices, cancelService, updateServiceParams, lpSub, setLpSub, pendingManageId, setPendingManageId, setActive, onGoToCatalog, embedded }) {
  const [selectedId, setSelectedId] = useState(null);

  // Deep-link z Service4Card: otwórz panel dla konkretnej usługi
  React.useEffect(() => {
    if (pendingManageId) {
      setSelectedId(pendingManageId);
      setPendingManageId(null);
    }
  }, [pendingManageId, setPendingManageId]);

  const purchased = purchasedServices || {};
  const ownedIds = Object.keys(purchased);
  const ownedServices = ownedIds
    .map(id => SERVICE_CATALOG.find(s => s.id === id))
    .filter(Boolean);

  // Migration upsell: user ma ≥2 LP-core usługi kupione solo, ale LP nie jest aktywny
  const ownedLpCore = ownedServices.filter(s => LP_CORE_IDS.has(s.id));
  const showLPMigration = !lpSub?.active && ownedLpCore.length >= 2;
  const currentSoloMonthly = ownedLpCore.reduce((sum, s) => sum + (s.soloPrice || 0), 0);
  const lpPriceCalc = calcLPPrice(lpSub || { billing: "rok", lloydSum: 5000, infaktAddon: true });
  const migrationSavings = Math.max(0, currentSoloMonthly - lpPriceCalc.effective);

  const activateLPFromMigration = () => {
    if (!setLpSub) return;
    setLpSub(s => ({
      ...s,
      active: true,
      activatedAt: new Date().toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" }),
      nextRenewal: s.billing === "rok" ? "15 kwi 2027" : "15 maj 2026",
    }));
  };

  const selectedService = selectedId ? SERVICE_CATALOG.find(s => s.id === selectedId) : null;
  const selectedPurchase = selectedId ? purchased[selectedId] : null;

  if (selectedService && selectedPurchase) {
    return (
      <ServiceManagePanel
        service={selectedService}
        purchase={selectedPurchase}
        lpSub={lpSub}
        onBack={() => setSelectedId(null)}
        onCancel={() => { cancelService(selectedService.id); setSelectedId(null); }}
        onUpdateParams={(patch) => updateServiceParams(selectedService.id, patch)}
      />
    );
  }

  return (
    <div className="ms-view">
      {!embedded && (
        <div className="ms-view__intro">
          <h2 className="text-[20px] font-bold tracking-[-0.02em]">Moje usługi</h2>
          <p className="text-sm text-muted mt-1">
            Aktywne subskrypcje i usługi — parametry, dokumenty, akcje w jednym miejscu.
          </p>
        </div>
      )}

      {lpSub?.active && (
        <div className="ms-lp-hero">
          <div className="ms-lp-hero__left">
            <div className="ms-lp-hero__eyebrow">Pakiet</div>
            <div className="ms-lp-hero__title">Lekarz Przedsiębiorca</div>
            <div className="ms-lp-hero__meta">
              {lpSub.lloydSum / 1000}k Lloyd's · {lpSub.infaktAddon ? "inFakt w pakiecie" : "bez inFaktu"} · rozliczenie {lpSub.billing === "rok" ? "roczne" : "miesięczne"}
            </div>
          </div>
          <button className="ms-lp-hero__btn" onClick={() => setActive && setActive("packages")}>
            Zarządzaj pakietem
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      )}

      {showLPMigration && (
        <div className="ms-migrate">
          <div className="ms-migrate__badge">Oszczędność</div>
          <div className="ms-migrate__body">
            <div className="ms-migrate__title">Masz {ownedLpCore.length} usługi z pakietu LP — scal je i zaoszczędź</div>
            <div className="ms-migrate__desc">
              Teraz płacisz <strong>{currentSoloMonthly} zł/mies.</strong> za usługi solo. Pakiet Lekarz Przedsiębiorca to <strong>{lpPriceCalc.effective} zł/mies.</strong> — i masz dodatkowo opiekuna, negocjowane rabaty, prelimit LeaseLink i bonus aktywacyjny.
            </div>
            <div className="ms-migrate__savings">
              Zaoszczędzisz <strong>{migrationSavings} zł/mies.</strong> · {migrationSavings * 12} zł/rok
            </div>
          </div>
          <div className="ms-migrate__actions">
            <button className="ms-migrate__btn ms-migrate__btn--primary" onClick={activateLPFromMigration}>
              Aktywuj pakiet
            </button>
            <button className="ms-migrate__btn" onClick={() => setActive && setActive("packages")}>
              Zobacz szczegóły
            </button>
          </div>
        </div>
      )}

      {ownedServices.length === 0 ? (
        <div className="ms-empty">
          <div className="ms-empty__icon">📭</div>
          <div className="ms-empty__title">Brak aktywnych usług</div>
          <div className="ms-empty__desc">Przeglądaj katalog w zakładce Usługi, aby aktywować pierwszą subskrypcję.</div>
          <button className="ms-empty__btn" onClick={() => onGoToCatalog ? onGoToCatalog() : setActive && setActive("packages4")}>Przejdź do katalogu</button>
        </div>
      ) : (
        <div className="ms-grid">
          {ownedServices.map(svc => {
            const p = purchased[svc.id];
            const isLPCovered = lpSub?.active && LP_CORE_IDS.has(svc.id);
            return (
              <div key={svc.id} className="ms-card" onClick={() => setSelectedId(svc.id)}>
                <div className="ms-card__icon" aria-hidden>{svc.icon}</div>
                <div className="ms-card__body">
                  <div className="ms-card__title">{svc.label}</div>
                  <div className="ms-card__meta">
                    <span className={`ms-status ms-status--${p.status}`}>● {p.status === "active" ? "Aktywna" : p.status}</span>
                    <span className="ms-card__date">od {p.purchasedAt}</span>
                  </div>
                  {isLPCovered && (
                    <div className="ms-card__lp-chip">Część pakietu LP</div>
                  )}
                </div>
                <svg className="ms-card__chevron" width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SHELL panelu zarządzania — wspólne sekcje dla wszystkich typów usług ───
function ServiceManagePanel({ service, purchase, lpSub, onBack, onCancel, onUpdateParams }) {
  const [tab, setTab] = useState("status");
  const isLPCovered = lpSub?.active && LP_CORE_IDS.has(service.id);
  const CustomView = SERVICE_MANAGE_VIEWS[service.id] || GenericManageView;
  const categoryLabel = SERVICE_CATEGORIES.find(c => c.id === service.category)?.label;

  const TABS = [
    { id: "status",   label: "Status" },
    { id: "params",   label: "Parametry" },
    { id: "docs",     label: "Dokumenty" },
    { id: "actions",  label: "Akcje" },
    { id: "history",  label: "Historia" },
  ];

  return (
    <div className="ms-panel">
      <button className="ms-panel__back" onClick={onBack}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Moje usługi
      </button>

      <div className="ms-panel__head">
        <div className="ms-panel__icon" aria-hidden>{service.icon}</div>
        <div className="ms-panel__head-body">
          <div className="ms-panel__eyebrow">{categoryLabel}</div>
          <h2 className="ms-panel__title">{service.label}</h2>
          <div className="ms-panel__meta">
            <span className={`ms-status ms-status--${purchase.status}`}>● Aktywna</span>
            <span>aktywna od {purchase.purchasedAt}</span>
            {purchase.nextRenewal && <span>odnowienie {purchase.nextRenewal}</span>}
          </div>
        </div>
      </div>

      {isLPCovered && (
        <div className="ms-panel__lp-banner">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.8 4.2L14 7l-3 3 .8 4.2L8 12l-3.8 2.2L5 10 2 7l4.2-.8z" fill="currentColor"/></svg>
          Usługa jest częścią pakietu Lekarz Przedsiębiorca — parametry i rozliczenie konfigurowane przez pakiet.
        </div>
      )}

      <div className="ms-panel__tabs" role="tablist">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`ms-panel__tab${tab === t.id ? " is-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {tab === t.id && <motion.span layoutId="ms-tab-indicator" className="ms-panel__tab-indicator" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="ms-panel__tab-label">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="ms-panel__content">
        <CustomView
          tab={tab}
          service={service}
          purchase={purchase}
          isLPCovered={isLPCovered}
          onCancel={onCancel}
          onUpdateParams={onUpdateParams}
        />
      </div>
    </div>
  );
}

// ─── Generyczny fallback — dla usług bez custom panelu ──────────────────────
function GenericManageView({ tab, service, purchase, isLPCovered, onCancel }) {
  if (tab === "status") {
    return (
      <div className="ms-section">
        <div className="ms-stat-grid">
          <div className="ms-stat">
            <div className="ms-stat__label">Status</div>
            <div className="ms-stat__value">Aktywna</div>
          </div>
          <div className="ms-stat">
            <div className="ms-stat__label">Aktywna od</div>
            <div className="ms-stat__value">{purchase.purchasedAt}</div>
          </div>
          {purchase.nextRenewal && (
            <div className="ms-stat">
              <div className="ms-stat__label">Kolejne odnowienie</div>
              <div className="ms-stat__value">{purchase.nextRenewal}</div>
            </div>
          )}
          <div className="ms-stat">
            <div className="ms-stat__label">Opłata</div>
            <div className="ms-stat__value">{service.soloPrice} zł / mies.</div>
          </div>
        </div>
      </div>
    );
  }
  if (tab === "params") {
    return (
      <div className="ms-section">
        <div className="ms-empty-tab">
          Parametry konfigurowalne dla tej usługi będą dostępne w kolejnej wersji.
        </div>
      </div>
    );
  }
  if (tab === "docs") {
    return (
      <div className="ms-section">
        {(purchase.docs || []).length === 0 ? (
          <div className="ms-empty-tab">Brak dokumentów.</div>
        ) : (
          <ul className="ms-docs">
            {purchase.docs.map((d, i) => (
              <li key={i} className="ms-docs__item">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M9 1H3v14h10V5L9 1z M9 1v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <div className="ms-docs__body">
                  <div className="ms-docs__name">{d.name}</div>
                  <div className="ms-docs__meta">{d.date} · {d.size}</div>
                </div>
                <button className="ms-docs__dl">Pobierz</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  if (tab === "actions") {
    return (
      <div className="ms-section">
        <div className="ms-actions">
          <button className="ms-action-btn">Kontakt z doradcą</button>
          <button className="ms-action-btn ms-action-btn--danger" onClick={onCancel} disabled={isLPCovered} title={isLPCovered ? "Usługa jest częścią pakietu LP" : ""}>
            Anuluj usługę
          </button>
        </div>
      </div>
    );
  }
  if (tab === "history") {
    return (
      <div className="ms-section">
        <ul className="ms-history">
          <li className="ms-history__item">
            <div className="ms-history__dot" />
            <div>
              <div className="ms-history__title">Usługa aktywowana</div>
              <div className="ms-history__meta">{purchase.purchasedAt}</div>
            </div>
          </li>
        </ul>
      </div>
    );
  }
  return null;
}

// ─── Lloyd's — custom management (zmień sumę, zgłoś szkodę, pobierz polisę) ─
function LloydsManageView({ tab, service, purchase, isLPCovered, onCancel, onUpdateParams }) {
  const [claimOpen, setClaimOpen] = useState(false);
  const SUM_OPTIONS = [5000, 10000, 15000];

  if (tab === "status") {
    return (
      <div className="ms-section">
        <div className="ms-stat-grid">
          <div className="ms-stat">
            <div className="ms-stat__label">Suma ubezpieczenia</div>
            <div className="ms-stat__value">{purchase.params.sum.toLocaleString("pl-PL")} zł / mies.</div>
          </div>
          <div className="ms-stat">
            <div className="ms-stat__label">Okres wyczekiwania</div>
            <div className="ms-stat__value">{purchase.params.waitPeriod} dni</div>
          </div>
          <div className="ms-stat">
            <div className="ms-stat__label">Aktywna od</div>
            <div className="ms-stat__value">{purchase.purchasedAt}</div>
          </div>
          <div className="ms-stat">
            <div className="ms-stat__label">Składka</div>
            <div className="ms-stat__value">{service.soloPrice} zł / mies.</div>
          </div>
        </div>
        <div className="ms-callout">
          <div className="ms-callout__title">Brak zgłoszonych szkód</div>
          <div className="ms-callout__desc">Jeśli jesteś niezdolny do pracy &gt; 14 dni, zgłoś szkodę przez zakładkę Akcje.</div>
        </div>
      </div>
    );
  }

  if (tab === "params") {
    return (
      <div className="ms-section">
        <div className="ms-field">
          <div className="ms-field__label">Suma ubezpieczenia (miesięczna)</div>
          <div className="ms-seg">
            {SUM_OPTIONS.map(s => (
              <button
                key={s}
                className={`ms-seg__opt${purchase.params.sum === s ? " is-active" : ""}`}
                onClick={() => onUpdateParams({ sum: s })}
                disabled={isLPCovered}
              >
                {s / 1000}k zł
              </button>
            ))}
          </div>
          <div className="ms-field__hint">
            Zmiana sumy wchodzi od następnego cyklu rozliczeniowego. Wyższa suma = wyższa składka.
          </div>
        </div>
        {isLPCovered && (
          <div className="ms-info">Suma konfigurowana przez pakiet LP — przejdź do "Zarządzaj pakietem".</div>
        )}
      </div>
    );
  }

  if (tab === "docs") {
    return (
      <div className="ms-section">
        <ul className="ms-docs">
          {(purchase.docs || []).map((d, i) => (
            <li key={i} className="ms-docs__item">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M9 1H3v14h10V5L9 1z M9 1v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div className="ms-docs__body">
                <div className="ms-docs__name">{d.name}</div>
                <div className="ms-docs__meta">{d.date} · {d.size}</div>
              </div>
              <button className="ms-docs__dl">Pobierz</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (tab === "actions") {
    return (
      <div className="ms-section">
        <div className="ms-actions ms-actions--rich">
          <button className="ms-action-card" onClick={() => setClaimOpen(true)}>
            <div className="ms-action-card__icon">🚨</div>
            <div className="ms-action-card__body">
              <div className="ms-action-card__title">Zgłoś szkodę</div>
              <div className="ms-action-card__desc">Nie możesz pracować &gt; 14 dni — uruchom wypłatę świadczenia.</div>
            </div>
          </button>
          <button className="ms-action-card">
            <div className="ms-action-card__icon">💬</div>
            <div className="ms-action-card__body">
              <div className="ms-action-card__title">Kontakt z opiekunem polisy</div>
              <div className="ms-action-card__desc">Dedykowany specjalista Remedium.</div>
            </div>
          </button>
          <button className="ms-action-card ms-action-card--danger" onClick={onCancel} disabled={isLPCovered}>
            <div className="ms-action-card__icon">✕</div>
            <div className="ms-action-card__body">
              <div className="ms-action-card__title">Anuluj polisę</div>
              <div className="ms-action-card__desc">{isLPCovered ? "Niedostępne — część pakietu LP." : "Ochrona wygaśnie z końcem okresu rozliczeniowego."}</div>
            </div>
          </button>
        </div>
        {claimOpen && (
          <div className="ms-claim-modal" onClick={() => setClaimOpen(false)}>
            <div className="ms-claim-modal__box" onClick={e => e.stopPropagation()}>
              <div className="ms-claim-modal__title">Zgłoszenie szkody</div>
              <div className="ms-claim-modal__desc">Formularz zgłoszenia szkody — prototyp. Docelowo: data L4, dokumenty medyczne, oświadczenie.</div>
              <button className="ms-claim-modal__close" onClick={() => setClaimOpen(false)}>Zamknij</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (tab === "history") {
    return (
      <div className="ms-section">
        <ul className="ms-history">
          <li className="ms-history__item">
            <div className="ms-history__dot" />
            <div>
              <div className="ms-history__title">Polisa aktywowana · suma {purchase.params.sum / 1000}k zł</div>
              <div className="ms-history__meta">{purchase.purchasedAt}</div>
            </div>
          </li>
        </ul>
      </div>
    );
  }

  return null;
}

// Registry — rozszerzamy o kolejne custom panele w następnych turach
const SERVICE_MANAGE_VIEWS = {
  lloyds: LloydsManageView,
};

// ─── DISCOUNTS VIEW ───────────────────────────────────────────────────────────

function TiltCard({ children, className, onClick }) {
  const ref = React.useRef(null);
  const handleMouseMove = (e) => {
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;
    el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
  };
  const handleMouseLeave = () => {
    ref.current.style.transform = "";
  };
  return (
    <div ref={ref} className={className} onClick={onClick}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {children}
    </div>
  );
}

function UnlockIcon() {
  const [showLock, setShowLock] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => setShowLock(v => !v), 1800);
    return () => clearInterval(timer);
  }, []);
  return (
    <div style={{ width: 64, height: 64, position: "relative" }}>
      <svg width="64" height="64" viewBox="0 0 23 23" fill="none" style={{ display: "block" }}>
        <path d="M19.9652 0H2.85217C1.27696 0 0 1.27696 0 2.85217V19.9652C0 21.5404 1.27696 22.8173 2.85217 22.8173H19.9652C21.5404 22.8173 22.8173 21.5404 22.8173 19.9652V2.85217C22.8173 1.27696 21.5404 0 19.9652 0Z" fill="#18181B"/>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <AnimatePresence mode="wait">
          {showLock ? (
            <motion.svg key="lock" width="30" height="30" viewBox="0 0 24 24" fill="none"
              initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: [0, -12, 12, -6, 0] }}
              exit={{ opacity: 0, scale: 0.4, rotate: 30 }}
              transition={{ duration: 0.25, rotate: { delay: 0.2, duration: 0.5 } }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="#CEFF3E" strokeWidth="1.8" fill="none"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#CEFF3E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </motion.svg>
          ) : (
            <motion.svg key="sygnet" width="44" height="44" viewBox="0 0 23 23" fill="none"
              initial={{ opacity: 0, scale: 0.4, rotate: 30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.4, rotate: -30 }}
              transition={{ duration: 0.25 }}>
              <path d="M11.5447 11.0658L16.8498 7.54338L14.6465 3.75L5.96875 9.24042L5.99014 9.27607C5.99014 9.27607 5.97588 9.27607 5.96875 9.27607V13.6613C8.89222 13.6613 11.2667 16.0928 11.2667 19.0733H15.6519C15.6519 15.7719 14.0261 12.8484 11.5447 11.0729V11.0658Z" fill="#CEFF3E"/>
            </motion.svg>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DiscountDrawer({ discount: d, onClose, isUnlocked, onUnlock }) {
  const [generatedCode, setGeneratedCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [closing, setClosing] = useState(false);
  const [unlockPhase, setUnlockPhase] = useState("idle"); // "idle" | "loading" | "success"
  const [showUnlockToast, setShowUnlockToast] = useState(false);

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "REMTD";
    for (let i = 0; i < 7; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setGeneratedCode(code);
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };
  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };
  const handleClose = () => { setClosing(true); setTimeout(onClose, 250); };

  const handleUnlock = () => {
    setUnlockPhase("loading");
    setTimeout(() => {
      setUnlockPhase("success");
      setShowUnlockToast(true);
      setTimeout(() => setShowUnlockToast(false), 4000);
      setTimeout(() => { if (onUnlock) onUnlock(d.id); }, 600);
    }, 1500);
  };

  if (!d) return null;

  const unlocked = isUnlocked || unlockPhase === "success";

  const KMSygnet = ({ size = 56, spinning = false }) => (
    <svg width={size} height={size} viewBox="0 0 23 23" fill="none" className={spinning ? "drawer__unlock-spin" : ""}>
      <path d="M19.9652 0H2.85217C1.27696 0 0 1.27696 0 2.85217V19.9652C0 21.5404 1.27696 22.8173 2.85217 22.8173H19.9652C21.5404 22.8173 22.8173 21.5404 22.8173 19.9652V2.85217C22.8173 1.27696 21.5404 0 19.9652 0Z" fill="#18181B"/>
      <path d="M11.5447 11.0658L16.8498 7.54338L14.6465 3.75L5.96875 9.24042L5.99014 9.27607C5.99014 9.27607 5.97588 9.27607 5.96875 9.27607V13.6613C8.89222 13.6613 11.2667 16.0928 11.2667 19.0733H15.6519C15.6519 15.7719 14.0261 12.8484 11.5447 11.0729V11.0658Z" fill="#CEFF3E"/>
    </svg>
  );

  return (
    <React.Fragment>
      <div className={`drawer-overlay${closing ? " drawer-overlay--closing" : ""}`} onClick={handleClose}></div>
      <div className={`drawer${closing ? " drawer--closing" : ""}`}>
        {/* Header: logo + badge + close */}
        <div className="drawer__header">
          <div className="drawer__header-left">
            <img src={d.logo} alt={d.partner} className="drawer__logo" />
            <span className="drawer__header-badge">{d.badge}</span>
          </div>
          <button className="drawer__close" onClick={handleClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="drawer__content">
          <AnimatePresence mode="wait">
            {!unlocked ? (
              <motion.div key="locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
                {/* Ekran odblokowania */}
                <div className="drawer__unlock-hero">
                  <img src={d.hero} alt={d.partner} className="drawer__hero-img" />
                  <div className="drawer__unlock-overlay">
                    <UnlockIcon />
                  </div>
                </div>

                <div className="drawer__unlock-info">
                  <div className="drawer__unlock-partner">{d.partner}</div>
                  <div className="drawer__title">{d.title}</div>
                  <p className="drawer__desc-short drawer__desc-short--clamp">{d.desc}</p>

                  <button
                    className={`drawer__unlock-btn${unlockPhase === "loading" ? " drawer__unlock-btn--loading" : ""}${unlockPhase === "success" ? " drawer__unlock-btn--success" : ""}`}
                    onClick={handleUnlock}
                    disabled={unlockPhase !== "idle"}
                  >
                    {unlockPhase === "idle" && (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        Odblokuj zniżkę
                      </>
                    )}
                    {unlockPhase === "loading" && (
                      <>
                        <KMSygnet size={20} spinning />
                        Odblokowywanie...
                      </>
                    )}
                    {unlockPhase === "success" && (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Zniżka odblokowana!
                      </>
                    )}
                  </button>

                  <p className="drawer__unlock-note">Zniżka zostanie przypisana do Twojego konta w Klubie Medyka</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="unlocked" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Pełny widok — odblokowany */}
                <div className="drawer__hero drawer__hero--compact">
                  <img src={d.hero} alt={d.partner} className="drawer__hero-img" />
                </div>

                <div className="drawer__title">{d.title}</div>
                <p className="drawer__desc-short">{d.desc}</p>

                {d.needsCode && (
                  <div className="drawer__code-box">
                    <div className="drawer__code-box-label">Kod zniżkowy</div>
                    {generatedCode ? (
                      <div>
                        <div className="drawer__code-row">
                          <div className="drawer__code-value">{generatedCode}</div>
                          <button className="drawer__code-copy" onClick={copyCode} title="Kopiuj">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                          </button>
                          <button className="drawer__code-refresh" onClick={generateCode} title="Nowy kod">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                          </button>
                        </div>
                        {copied && <div className="drawer__code-toast">Kod skopiowany do schowka</div>}
                      </div>
                    ) : (
                      <button className="drawer__btn-primary" onClick={generateCode}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5.99479 6.0026H6.00146M9.99479 6.0026L5.99479 10.0026M9.99479 10.0026H10.0015M1.32812 6.0026C1.85856 6.0026 2.36727 6.21332 2.74234 6.58839C3.11741 6.96346 3.32813 7.47217 3.32813 8.0026C3.32813 8.53304 3.11741 9.04175 2.74234 9.41682C2.36727 9.79189 1.85856 10.0026 1.32812 10.0026L1.32812 11.3359C1.32812 11.6896 1.4686 12.0287 1.71865 12.2787C1.9687 12.5288 2.30784 12.6693 2.66146 12.6693L13.3281 12.6693C13.6817 12.6693 14.0209 12.5288 14.2709 12.2787C14.521 12.0287 14.6615 11.6896 14.6615 11.3359V10.0026C14.131 10.0026 13.6223 9.79189 13.2472 9.41682C12.8722 9.04175 12.6615 8.53304 12.6615 8.0026C12.6615 7.47217 12.8722 6.96346 13.2472 6.58839C13.6223 6.21332 14.131 6.0026 14.6615 6.0026V4.66927C14.6615 4.31565 14.521 3.97651 14.2709 3.72646C14.0209 3.47641 13.6817 3.33594 13.3281 3.33594L2.66146 3.33594C2.30784 3.33594 1.9687 3.47641 1.71865 3.72646C1.4686 3.97651 1.32813 4.31565 1.32812 4.66927L1.32812 6.0026Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Wygeneruj kod zniżkowy
                      </button>
                    )}
                  </div>
                )}

                {d.howToUse && d.howToUse.length > 0 && (
                  <div className="drawer__how-to-use">
                    <div className="drawer__how-to-use-label">Jak skorzystać</div>
                    <ol className="drawer__how-to-use-steps">
                      {d.howToUse.map((step, i) => <li key={i}>{step}</li>)}
                    </ol>
                  </div>
                )}

                {d.fullDesc && (
                  <React.Fragment>
                    <button className="drawer__details-toggle" onClick={() => setShowFullDesc(!showFullDesc)}>
                      Szczegóły oferty
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showFullDesc ? "rotate(180deg)" : "", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    {showFullDesc && <p className="drawer__desc-full">{d.fullDesc}</p>}
                  </React.Fragment>
                )}

                {d.url && (
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="drawer__btn-outline">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    Przejdź na stronę partnera
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {showUnlockToast && createPortal(
        <div className="unlock-toast">
          <svg width="20" height="20" viewBox="0 0 23 23" fill="none">
            <path d="M19.9652 0H2.85217C1.27696 0 0 1.27696 0 2.85217V19.9652C0 21.5404 1.27696 22.8173 2.85217 22.8173H19.9652C21.5404 22.8173 22.8173 21.5404 22.8173 19.9652V2.85217C22.8173 1.27696 21.5404 0 19.9652 0Z" fill="#18181B"/>
            <path d="M11.5447 11.0658L16.8498 7.54338L14.6465 3.75L5.96875 9.24042L5.99014 9.27607C5.99014 9.27607 5.97588 9.27607 5.96875 9.27607V13.6613C8.89222 13.6613 11.2667 16.0928 11.2667 19.0733H15.6519C15.6519 15.7719 14.0261 12.8484 11.5447 11.0729V11.0658Z" fill="#CEFF3E"/>
          </svg>
          Zniżka przypisana do Twojego konta!
        </div>,
        document.body
      )}
    </React.Fragment>
  );
}

function DiscountsView({ unlockedDiscounts, unlockDiscount }) {
  const [filter, setFilter] = useState("all");
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [viewMode, setViewMode] = useState("cards");
  const filtered = filter === "all" ? DISCOUNTS : DISCOUNTS.filter(d => d.category === filter);
  const isCompact = viewMode === "compact";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Zniżki</h2>
          <p className="text-sm text-muted">Oferty i rabaty od partnerów Klub Medyka.</p>
        </div>
        <div className="discount-view-toggle">
          <button className={`discount-view-toggle__btn${!isCompact ? " discount-view-toggle__btn--active" : ""}`} onClick={() => setViewMode("cards")} title="Karty">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
          <button className={`discount-view-toggle__btn${isCompact ? " discount-view-toggle__btn--active" : ""}`} onClick={() => setViewMode("compact")} title="Kompaktowy">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
        </div>
      </div>
      <div className="filter-bar">
        {DISCOUNT_CATEGORIES.map(c => (
          <button key={c.id} className={`filter-pill${filter === c.id ? " filter-pill--active" : ""}`} onClick={() => setFilter(c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      {isCompact ? (
        <div className="discount-grid discount-grid--compact">
          {filtered.map(d => (
            <div key={d.id} className="discount-card discount-card--compact" onClick={() => setSelectedDiscount(d)}>
              <span className="discount-card__badge discount-card__badge--compact">{d.badge}</span>
              <div className="discount-card--compact__body">
                <img src={d.logo} alt={d.partner} className="discount-card__logo discount-card__logo--compact" />
                <div className="discount-card__title discount-card__title--compact">{d.title}</div>
                <p className="discount-card__desc discount-card__desc--compact">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="discount-grid">
          {filtered.map(d => (
            <TiltCard key={d.id} className="discount-card" onClick={() => setSelectedDiscount(d)}>
              <div className="discount-card__hero">
                <img src={d.hero} alt={d.partner} className="discount-card__hero-img" />
                <span className="discount-card__badge">{d.badge}</span>
                {unlockedDiscounts.has(d.id) && (
                  <span className="discount-card__unlocked">
                    <svg width="20" height="20" viewBox="0 0 23 23" fill="none">
                      <path d="M19.9652 0H2.85217C1.27696 0 0 1.27696 0 2.85217V19.9652C0 21.5404 1.27696 22.8173 2.85217 22.8173H19.9652C21.5404 22.8173 22.8173 21.5404 22.8173 19.9652V2.85217C22.8173 1.27696 21.5404 0 19.9652 0Z" fill="#18181B"/>
                      <path d="M11.5447 11.0658L16.8498 7.54338L14.6465 3.75L5.96875 9.24042L5.99014 9.27607C5.99014 9.27607 5.97588 9.27607 5.96875 9.27607V13.6613C8.89222 13.6613 11.2667 16.0928 11.2667 19.0733H15.6519C15.6519 15.7719 14.0261 12.8484 11.5447 11.0729V11.0658Z" fill="#CEFF3E"/>
                    </svg>
                  </span>
                )}
              </div>
              <div className="discount-card__body">
                <div className="discount-card__brand">
                  <img src={d.logo} alt={d.partner} className="discount-card__logo" />
                  <span className="discount-card__partner">{d.partner}</span>
                </div>
                <div className="discount-card__title">{d.title}</div>
                <p className="discount-card__desc">{d.desc}</p>
              </div>
              <div className="discount-card__footer">
                <button className="discount-card__cta" onClick={(e) => { e.stopPropagation(); setSelectedDiscount(d); }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5.99479 6.0026H6.00146M9.99479 6.0026L5.99479 10.0026M9.99479 10.0026H10.0015M1.32812 6.0026C1.85856 6.0026 2.36727 6.21332 2.74234 6.58839C3.11741 6.96346 3.32813 7.47217 3.32813 8.0026C3.32813 8.53304 3.11741 9.04175 2.74234 9.41682C2.36727 9.79189 1.85856 10.0026 1.32812 10.0026L1.32812 11.3359C1.32812 11.6896 1.4686 12.0287 1.71865 12.2787C1.9687 12.5288 2.30784 12.6693 2.66146 12.6693L13.3281 12.6693C13.6817 12.6693 14.0209 12.5288 14.2709 12.2787C14.521 12.0287 14.6615 11.6896 14.6615 11.3359V10.0026C14.131 10.0026 13.6223 9.79189 13.2472 9.41682C12.8722 9.04175 12.6615 8.53304 12.6615 8.0026C12.6615 7.47217 12.8722 6.96346 13.2472 6.58839C13.6223 6.21332 14.131 6.0026 14.6615 6.0026V4.66927C14.6615 4.31565 14.521 3.97651 14.2709 3.72646C14.0209 3.47641 13.6817 3.33594 13.3281 3.33594L2.66146 3.33594C2.30784 3.33594 1.9687 3.47641 1.71865 3.72646C1.4686 3.97651 1.32813 4.31565 1.32812 4.66927L1.32812 6.0026Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Wykorzystaj
                </button>
              </div>
            </TiltCard>
          ))}
        </div>
      )}

      {selectedDiscount && <DiscountDrawer discount={selectedDiscount} onClose={() => setSelectedDiscount(null)} isUnlocked={unlockedDiscounts?.has(selectedDiscount.id)} onUnlock={unlockDiscount} />}
    </div>
  );
}

// ─── INSURANCE VIEW ───────────────────────────────────────────────────────────

function InsIcon({ id, size }) {
  const s = size || 28;
  const props = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (id) {
    case "shield": return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    case "wallet": return <svg {...props}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/><circle cx="16" cy="14" r="1"/></svg>;
    case "plane":  return <svg {...props}><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.4-.1.9.3 1.1L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.8 5.3c.2.4.7.5 1.1.3l.5-.3c.4-.2.6-.6.5-1.1z"/></svg>;
    case "heart":  return <svg {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
    case "list":   return <svg {...props}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
    default: return null;
  }
}

/* ── OC FORM ─────────────────────────────────────────── */
function OcForm() {
  const [step, setStep] = useState(0);
  // Pre-fill from profile — user is "Rezydent · Kardiologia"
  const [spec1, setSpec1] = useState("Kardiologia");
  const [spec1Confirmed, setSpec1Confirmed] = useState(false);
  const [spec2, setSpec2] = useState("");
  const [sor, setSor] = useState(null);
  const [practice, setPractice] = useState(null);
  const [surplusSum, setSurplusSum] = useState("");
  const [voluntarySum, setVoluntarySum] = useState("");
  const [extras, setExtras] = useState({ legal: false, aesthetic: false, nfz: false, hiv: false });
  const [extraVariants, setExtraVariants] = useState(() => {
    const ev = {};
    OC_EXTRAS.forEach(ex => { ev[ex.key] = ex.defaultVariant; });
    return ev;
  });
  const [hadClaim, setHadClaim] = useState(null);
  const [phase, setPhase] = useState("form"); // form | loading | offers
  const [submitted, setSubmitted] = useState(false);
  const [editField, setEditField] = useState(null);

  const toggleExtra = (k) => setExtras(e => ({ ...e, [k]: !e[k] }));
  const setExtraVariant = (k, vi) => setExtraVariants(ev => ({ ...ev, [k]: vi }));
  const d = { spec1, spec2, sor, practice, surplusSum, voluntarySum, extraVariants, ...extras };
  const { total, items, riskGroup } = ocCalc(d);
  const riskLabel = riskGroup === 3 ? "III (najwyższa)" : riskGroup === 2 ? "II (średnia)" : "I (podstawowa)";
  const needsVoluntary = !practice || (practice && !surplusSum);

  const canNext = () => {
    if (step === 0) return spec1 && spec1Confirmed && sor !== null;
    if (step === 1) {
      if (practice === null) return false;
      return true;
    }
    if (step === 2) return hadClaim !== null;
    return true;
  };

  const startCalc = () => {
    setPhase("loading");
    setTimeout(() => setPhase("offers"), 2800);
  };

  // Offer amounts — INTER slightly more expensive
  const ergoTotal = total;
  const interTotal = Math.round(total * 1.08);
  const [expandedOffer, setExpandedOffer] = useState(null);
  const [hoveredTip, setHoveredTip] = useState(null);
  const [compareMode, setCompareMode] = useState(false);

  const scopeItems = () => {
    const items = [];
    if (practice) items.push({ key: "mandatory", label: "OC obowiązkowe", sum: "równowartość 75 000 EUR", price: OC_PREMIUM.mandatory[riskGroup], removable: false, active: true,
      tip: "Obowiązkowe ubezpieczenie dla lekarzy prowadzących praktykę. Pokrywa roszczenia pacjentów z tytułu błędów w sztuce lekarskiej do ustawowego limitu." });
    if (surplusSum) items.push({ key: "surplus", label: "OC nadwyżkowe", sum: surplusSum, price: OC_PREMIUM.surplus[surplusSum]?.[riskGroup] || 0, removable: true, active: true,
      tip: "Rozszerzenie sumy gwarancyjnej ponad obowiązkowe minimum. Chroni w razie roszczeń przekraczających limit OC obowiązkowego.",
      onRemove: () => setSurplusSum("") });
    if (needsVoluntary && voluntarySum) items.push({ key: "voluntary", label: "OC dobrowolne", sum: voluntarySum, price: OC_PREMIUM.surplus[voluntarySum]?.[riskGroup] || 0, removable: true, active: true,
      tip: "Dobrowolne OC dla lekarzy nieprowadzących praktyki. Ochrona odpowiedzialności cywilnej w ramach zatrudnienia.",
      onRemove: () => setVoluntarySum("") });
    const tips = {
      legal: "Pokrywa koszty adwokata, radcy prawnego i postępowań sądowych w sprawach związanych z wykonywaniem zawodu.",
      aesthetic: "Rozszerzenie OC o zabiegi medycyny estetycznej i chirurgii plastycznej, które standardowo są wyłączone z polisy.",
      nfz: "Ochrona na wypadek kar nakładanych przez NFZ za błędy w wystawianiu recept refundowanych.",
      hiv: "Pakiet obejmujący profilaktykę poekspozycyjną: NNW, koszty badań, leków antyretrowirusowych oraz świadczenie w razie zakażenia HIV lub WZW.",
    };
    OC_EXTRAS.forEach(ex => {
      const vi = extraVariants[ex.key] ?? ex.defaultVariant;
      const v = ex.variants[vi];
      items.push({
        key: ex.key, label: ex.shortLabel, sum: ex.variants.length > 1 ? "limit " + v.sum : v.sum,
        price: v.price, removable: true, active: extras[ex.key],
        tip: tips[ex.key],
        onToggle: () => toggleExtra(ex.key),
        variants: ex.variants.length > 1 ? ex.variants : null,
        currentVariant: vi,
        onVariantChange: ex.variants.length > 1 ? (newVi) => setExtraVariant(ex.key, newVi) : null,
      });
    });
    return items;
  };

  const offers = [
    { id: "ergo", name: "Ergo Hestia", logo: "ubezpieczenia/loga/ergohestia.png", price: ergoTotal, available: true, excludes: [] },
    { id: "inter", name: "INTER Ubezpieczenia", logo: "ubezpieczenia/loga/inter logo.webp", price: interTotal, available: true, excludes: ["aesthetic"] },
    { id: "pzu", name: "PZU", logo: "ubezpieczenia/loga/PZU_logo.png", price: null, available: false, excludes: [] },
    { id: "lloyds", name: "Lloyd's", logo: "ubezpieczenia/loga/lloyds.png", price: null, available: false, excludes: [] },
  ];

  // ── Loading / offers screen ──
  if (phase === "loading") {
    return (
      <div className="oc-form">
        <div className="oc-loading">
          <p className="oc-loading__title">Porównujemy oferty ubezpieczycieli...</p>
          <div className="oc-loading__logos">
            {INS_PARTNERS.map((p, i) => (
              <img key={p.name} src={p.logo} alt={p.name} className="oc-loading__logo" style={{ height: p.h, animationDelay: i * 0.3 + "s" }} />
            ))}
          </div>
          <div className="oc-loading__bar"><div className="oc-loading__bar-fill" /></div>
        </div>
      </div>
    );
  }

  if (phase === "offers") {
    const scope = scopeItems();
    const optionalOff = scope.filter(s => s.removable && !s.active);
    return (
      <div className="oc-form">
        <div className="oc-offers">
          <h3 className="oc-step__title">Oferty ubezpieczycieli</h3>
          <div className="oc-offers__tabs">
            <button className={`oc-offers__tab ${!compareMode ? "oc-offers__tab--active" : ""}`} onClick={() => setCompareMode(false)}>Lista ofert</button>
            <button className={`oc-offers__tab ${compareMode ? "oc-offers__tab--active" : ""}`} onClick={() => setCompareMode(true)}>Porównaj oferty</button>
          </div>

          {compareMode ? (() => {
            const avail = offers.filter(o => o.available);
            const prices = avail.map(o => Math.round(total * (o.id === "inter" ? 1.08 : 1)));
            const minPrice = Math.min(...prices);
            return (
              <div className="oc-compare">
                <table className="oc-compare__table">
                  <thead>
                    <tr>
                      <th></th>
                      {avail.map((o, i) => (
                        <th key={o.id}>
                          <div className="oc-compare__insurer">
                            <img src={o.logo} alt={o.name} className="oc-compare__logo" />
                            <span className="oc-compare__name">{o.name}</span>
                            {prices[i] === minPrice && <span className="oc-compare__best">Najlepsza cena</span>}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="oc-compare__row--total">
                      <td>Składka roczna</td>
                      {avail.map((o, i) => (
                        <td key={o.id}><strong>{prices[i].toLocaleString("pl-PL")} zł</strong><span className="text-muted">/rok</span></td>
                      ))}
                    </tr>
                    {scope.map(s => (
                      <tr key={s.key} className={`oc-compare__row ${s.active ? "" : "oc-compare__row--addable"}`}>
                        <td>{s.label}</td>
                        {avail.map(o => {
                          const mult = o.id === "inter" ? 1.08 : 1;
                          const excluded = o.excludes?.includes(s.key);
                          return (
                            <td key={o.id}>
                              {excluded ? (
                                <span className="oc-compare__unavail">
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                                  Niedostępne
                                </span>
                              ) : s.active ? (
                                <span className={`oc-compare__yes ${s.removable ? "oc-compare__yes--clickable" : ""}`}
                                  onClick={s.removable ? (s.onToggle || s.onRemove) : undefined}>
                                  <span className="oc-compare__yes-default">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2E35FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                    {s.removable ? " " + Math.round(s.price * mult) + " zł" : " " + s.sum}
                                  </span>
                                  {s.removable && <span className="oc-compare__yes-hover">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                                    Usuń
                                  </span>}
                                </span>
                              ) : (
                                <button className="oc-compare__add-btn" onClick={s.onToggle || undefined}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                                  Dodaj · +{Math.round(s.price * mult)} zł
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td></td>
                      {avail.map((o, i) => (
                        <td key={o.id}>
                          <button className="oc-compare__select-btn" onClick={() => setSubmitted(true)}>
                            Wybierz — {prices[i].toLocaleString("pl-PL")} zł/rok
                          </button>
                          <span className="oc-compare__or-installment">lub 2 raty × {Math.ceil(prices[i] / 2).toLocaleString("pl-PL")} zł</span>
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                </table>
              </div>
            );
          })() : (() => {
            const bestId = offers.filter(o => o.available).reduce((best, o) => {
              const p = Math.round(total * (o.id === "inter" ? 1.08 : 1));
              return !best || p < best.p ? { id: o.id, p } : best;
            }, null)?.id;
            return <div className="oc-offers__list">
            {offers.map((o, i) => {
              const mult = o.id === "inter" ? 1.08 : 1;
              const livePrice = o.available ? Math.round(total * mult) : null;
              return (
              <div key={o.id} className={`oc-offer ${!o.available ? "oc-offer--pending" : ""} ${expandedOffer === o.id ? "oc-offer--expanded" : ""}`} style={{ animationDelay: i * 0.12 + "s" }}>
                <div className="oc-offer__header" onClick={() => o.available && setExpandedOffer(expandedOffer === o.id ? null : o.id)}>
                  <div className="oc-offer__logo">
                    <img src={o.logo} alt={o.name} />
                  </div>
                  <div className="oc-offer__body">
                    <span className="oc-offer__name">{o.name} {o.id === bestId && <span className="oc-offer__best">Najlepsza cena</span>}</span>
                    {o.available ? (
                      expandedOffer === o.id
                        ? <span className="oc-offer__price">{livePrice.toLocaleString("pl-PL")} zł<span className="text-muted">/rok</span></span>
                        : <span className="oc-offer__pending" style={{ cursor: "pointer" }}>Rozwiń, aby zobaczyć cenę</span>
                    ) : (
                      <span className="oc-offer__pending">Oferta po akceptacji konsultanta</span>
                    )}
                  </div>
                  {o.available ? (
                    <svg className="oc-offer__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  ) : (
                    <div className="oc-offer__lock">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                  )}
                </div>

                {expandedOffer === o.id && (
                  <div className="oc-offer__details">
                    <div className="oc-offer__scope">
                      <span className="oc-offer__scope-title">Zakres ubezpieczenia</span>
                      {scope.filter(s => s.active).map(s => (
                        <div key={s.key} className={`oc-offer__scope-row ${s.removable ? "oc-offer__scope-row--toggle" : "oc-offer__scope-row--locked"} ${s.variants ? "oc-offer__scope-row--has-variants" : ""}`}>
                          <div className="oc-offer__scope-row-main"
                            onClick={() => { setHoveredTip(null); (s.onToggle || s.onRemove || (() => {}))(); }}>
                            {s.removable
                              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E35FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                              : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            }
                            <span className="oc-offer__scope-label"
                              onMouseEnter={() => setHoveredTip(s.key)} onMouseLeave={() => setHoveredTip(null)}>{s.label}</span>
                            {!s.variants && <span className="oc-offer__scope-sum">{s.sum}</span>}
                            {s.removable && <span className="oc-offer__scope-price">{s.price} zł</span>}
                          </div>
                          {hoveredTip === s.key && s.tip && (
                            <div className="oc-offer__tip">{s.tip}</div>
                          )}
                          {s.variants && (
                            <div className="oc-offer__variant-picker">
                              {s.variants.map((v, vi) => (
                                <button key={vi} className={`oc-offer__variant-btn ${vi === s.currentVariant ? "oc-offer__variant-btn--active" : ""}`}
                                  onClick={(e) => { e.stopPropagation(); s.onVariantChange(vi); }}>
                                  {v.sum} · {v.price} zł
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {optionalOff.length > 0 && (
                      <div className="oc-offer__add-back">
                        <span className="oc-offer__scope-title">Dodaj do zakresu</span>
                        {optionalOff.map(s => (
                          <div key={s.key} className="oc-offer__scope-row oc-offer__scope-row--off"
                            onClick={() => { setHoveredTip(null); (s.onToggle || s.onRemove)(); }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                            <span className="oc-offer__scope-label"
                              onMouseEnter={() => setHoveredTip(s.key)} onMouseLeave={() => setHoveredTip(null)}>{s.label}</span>
                            <span className="oc-offer__scope-price">+{s.price} zł</span>
                            {hoveredTip === s.key && s.tip && (
                              <div className="oc-offer__tip">{s.tip}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="oc-offer__meta">
                      <span>Grupa ryzyka: <strong>{riskLabel}</strong> · Specjalizacja: <strong>{spec1}</strong></span>
                    </div>
                    <button className="oc-offer__select-btn" onClick={() => setSubmitted(true)}>Wybierz tę ofertę — {livePrice.toLocaleString("pl-PL")} zł/rok</button>
                  </div>
                )}
              </div>
              );
            })}
          </div>; })()}

          <div className="oc-nav" style={{ marginTop: 20 }}>
            <button className="oc-nav__back" onClick={() => { setPhase("form"); setStep(3); setExpandedOffer(null); }}>← Zmień parametry</button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="oc-form">
        <div className="oc-done">
          <div className="oc-done__icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2E35FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <h3>Oferta wybrana</h3>
          <p className="text-sm text-muted">Doradca przygotuje dokumenty i skontaktuje się w ciągu 24h w celu finalizacji polisy.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="oc-form">
      {/* Progress */}
      <div className="oc-steps">
        {["Specjalizacja", "Zakres OC", "Rozszerzenia", "Podsumowanie"].map((label, i) => (
          <div key={i} className={`oc-steps__item ${i < step ? "oc-steps__item--done" : ""} ${i === step ? "oc-steps__item--active" : ""}`}>
            <div className="oc-steps__dot">{i < step ? "✓" : i + 1}</div>
            <span className="oc-steps__label">{label}</span>
          </div>
        ))}
      </div>

      {/* STEP 0: Specialization */}
      {step === 0 && (
        <div className="oc-step">
          <h3 className="oc-step__title">Specjalizacja lekarska</h3>
          <p className="oc-step__desc">Specjalizacja wpływa na grupę ryzyka i wysokość składki.</p>

          <div className="oc-field">
            <label className="oc-field__label">Główna specjalizacja</label>
            {spec1Confirmed ? (
              <div className="oc-spec-confirmed">
                <div className="oc-spec-confirmed__info">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2E35FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  <span className="oc-spec-confirmed__name">{spec1}</span>
                  <span className="oc-spec-confirmed__group">Grupa {riskGroup === 3 ? "III" : riskGroup === 2 ? "II" : "I"}</span>
                </div>
                <button className="oc-spec-confirmed__change" onClick={() => setSpec1Confirmed(false)}>Zmień</button>
              </div>
            ) : (
              <>
                <div className="oc-spec-confirm">
                  <span className="oc-spec-confirm__label">Z Twojego profilu:</span>
                  <span className="oc-spec-confirm__value">{spec1}</span>
                  <button className="oc-spec-confirm__btn" onClick={() => setSpec1Confirmed(true)}>Potwierdzam</button>
                </div>
                <details className="oc-spec-confirm__details">
                  <summary>Inna specjalizacja?</summary>
                  <select className="oc-select" value={spec1} onChange={e => { setSpec1(e.target.value); setSpec1Confirmed(true); }} style={{ marginTop: 8 }}>
                    <option value="">— Wybierz specjalizację —</option>
                    <optgroup label="Grupa III ryzyka (najwyższa)">{OC_SPEC_III.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>
                    <optgroup label="Grupa II ryzyka">{OC_SPEC_II.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>
                    <optgroup label="Grupa I ryzyka (podstawowa)">{OC_SPEC_I.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>
                  </select>
                </details>
              </>
            )}
          </div>

          <div className="oc-field">
            <label className="oc-field__label">Druga specjalizacja <span className="text-muted">(opcjonalnie)</span></label>
            <p className="oc-field__hint">Składka liczona wg najwyższej grupy ryzyka spośród obu specjalizacji.</p>
            <select className="oc-select" value={spec2} onChange={e => setSpec2(e.target.value)}>
              <option value="">— Brak drugiej specjalizacji —</option>
              <optgroup label="Grupa III">{OC_SPEC_III.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>
              <optgroup label="Grupa II">{OC_SPEC_II.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>
              <optgroup label="Grupa I">{OC_SPEC_I.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>
            </select>
          </div>

          <div className="oc-field">
            <label className="oc-field__label">Pracujesz w pogotowiu ratunkowym lub pełnisz dyżury na SOR?</label>
            <div className="oc-toggle">
              <button className={`oc-toggle__btn ${sor === true ? "oc-toggle__btn--on" : ""}`} onClick={() => setSor(true)}>Tak</button>
              <button className={`oc-toggle__btn ${sor === false ? "oc-toggle__btn--on" : ""}`} onClick={() => setSor(false)}>Nie</button>
            </div>
            {sor === true && <p className="oc-field__warn">Praca na SOR = automatycznie III grupa ryzyka (najwyższa składka).</p>}
          </div>

          {spec1 && sor !== null && (
            <div className="oc-risk-badge">Twoja grupa ryzyka: <strong>{riskLabel}</strong></div>
          )}
        </div>
      )}

      {/* STEP 1: Practice & Sums */}
      {step === 1 && (
        <div className="oc-step">
          <h3 className="oc-step__title">Zakres ubezpieczenia OC</h3>
          <p className="oc-step__desc">Grupa ryzyka: <strong>{riskLabel}</strong></p>

          <div className="oc-field">
            <label className="oc-field__label">Prowadzisz indywidualną lub grupową praktykę lekarską?</label>
            <div className="oc-toggle">
              <button className={`oc-toggle__btn ${practice === true ? "oc-toggle__btn--on" : ""}`} onClick={() => { setPractice(true); }}>Tak</button>
              <button className={`oc-toggle__btn ${practice === false ? "oc-toggle__btn--on" : ""}`} onClick={() => { setPractice(false); setSurplusSum(""); }}>Nie</button>
            </div>
            {practice === true && (
              <p className="oc-field__info">OC obowiązkowe: <strong>{OC_PREMIUM.mandatory[riskGroup]} zł/rok</strong></p>
            )}
          </div>

          {practice === true && (
            <div className="oc-field">
              <label className="oc-field__label">Podwyższenie sumy OC obowiązkowego</label>
              <p className="oc-field__hint">Nadwyżka uruchamia się po wyczerpaniu sumy z ubezpieczenia obowiązkowego.</p>
              <div className="oc-sum-picker">
                <button className={`oc-sum-picker__btn ${surplusSum === "" ? "oc-sum-picker__btn--on" : ""}`} onClick={() => setSurplusSum("")}>Nie podwyższam</button>
                {OC_SUMS.map(s => (
                  <button key={s} className={`oc-sum-picker__btn ${surplusSum === s ? "oc-sum-picker__btn--on" : ""}`} onClick={() => setSurplusSum(s)}>
                    {s} <span className="text-muted">({OC_PREMIUM.surplus[s][riskGroup]} zł/rok)</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {needsVoluntary && practice !== null && (
            <div className="oc-field">
              <label className="oc-field__label">Suma OC dobrowolnego</label>
              <p className="oc-field__hint">{practice === false ? "Rekomendujemy OC dobrowolne — pełna ochrona przy pracy na umowie." : "Wybierz sumę OC dobrowolnego."}</p>
              <div className="oc-sum-picker">
                <button className={`oc-sum-picker__btn ${voluntarySum === "" ? "oc-sum-picker__btn--on" : ""}`} onClick={() => setVoluntarySum("")}>Nie wybieram</button>
                {OC_SUMS.map(s => (
                  <button key={s} className={`oc-sum-picker__btn ${voluntarySum === s ? "oc-sum-picker__btn--on" : ""}`} onClick={() => setVoluntarySum(s)}>
                    {s} <span className="text-muted">({OC_PREMIUM.surplus[s][riskGroup]} zł/rok)</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Extensions + Claims */}
      {step === 2 && (
        <div className="oc-step">
          <h3 className="oc-step__title">Rozszerzenia ochrony</h3>
          <p className="oc-step__desc">Dopasuj zakres do swoich potrzeb.</p>

          {(() => {
            const allOn = OC_EXTRAS.every(ex => extras[ex.key]);
            const totalExtras = OC_EXTRAS.reduce((sum, ex) => sum + ex.variants[extraVariants[ex.key]].price, 0);
            return (
              <div className="oc-extras">
                <div className={`oc-extra oc-extra--full ${allOn ? "oc-extra--on" : ""}`}
                  onClick={() => { const newVal = !allOn; setExtras(OC_EXTRAS.reduce((acc, ex) => ({ ...acc, [ex.key]: newVal }), {})); }}>
                  <label className="oc-extra__top">
                    <div className="oc-extra__check">
                      {allOn && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                    </div>
                    <div className="oc-extra__body">
                      <span className="oc-extra__name">Dodaj pełną ochronę <span className="oc-extra__rec">Zalecane</span></span>
                      <span className="oc-extra__hint">Wszystkie rozszerzenia w jednym pakiecie</span>
                    </div>
                    <span className="oc-extra__price">+{totalExtras} zł</span>
                  </label>
                </div>
                {OC_EXTRAS.map(ex => {
                  const vi = extraVariants[ex.key];
                  const v = ex.variants[vi];
                  const hasVars = ex.variants.length > 1;
                  return (
                    <div key={ex.key} className={`oc-extra ${extras[ex.key] ? (allOn ? "oc-extra--on-subtle" : "oc-extra--on") : ""}`}>
                      <label className="oc-extra__top" onClick={() => toggleExtra(ex.key)}>
                        <div className="oc-extra__check">
                          {extras[ex.key] && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                        </div>
                        <div className="oc-extra__body">
                          <span className="oc-extra__name">{ex.label}</span>
                          <span className="oc-extra__hint">{hasVars ? `Limit ${v.sum}` : v.sum}</span>
                        </div>
                        <span className="oc-extra__price">+{v.price} zł</span>
                      </label>
                      {extras[ex.key] && hasVars && (
                        <div className="oc-extra__variants">
                          <span className="oc-extra__variants-label">Wybierz limit:</span>
                          <div className="oc-extra__variants-btns">
                            {ex.variants.map((opt, oi) => (
                              <button key={oi} className={`oc-extra__var-btn ${oi === vi ? "oc-extra__var-btn--on" : ""}`}
                                onClick={() => setExtraVariant(ex.key, oi)}>
                                {opt.sum}<span className="text-muted"> · {opt.price} zł</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}

          <div className="oc-field" style={{ marginTop: 20 }}>
            <label className="oc-field__label">W ostatnich 3 latach miałeś szkodę lub zgłoszono wobec Ciebie roszczenie?</label>
            <div className="oc-toggle">
              <button className={`oc-toggle__btn ${hadClaim === true ? "oc-toggle__btn--warn" : ""}`} onClick={() => setHadClaim(true)}>Tak</button>
              <button className={`oc-toggle__btn ${hadClaim === false ? "oc-toggle__btn--on" : ""}`} onClick={() => setHadClaim(false)}>Nie</button>
            </div>
            {hadClaim === true && (
              <div className="oc-field__error-box">
                Ze względu na zgłoszone roszczenia nie możemy przedstawić oferty w standardowym trybie. Konsultant skontaktuje się indywidualnie w celu oceny ryzyka.
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: Summary — inline editing */}
      {step === 3 && (
        <div className="oc-step">
          <h3 className="oc-step__title">Sprawdź parametry</h3>
          <p className="oc-step__desc">Kliknij dowolną wartość, aby zmienić ją na miejscu.</p>

          <div className="oc-summary">
            {/* Specjalizacja */}
            {editField === "spec1" ? (
              <div className="oc-summary__edit-row">
                <span className="oc-summary__edit-label">Specjalizacja</span>
                <select className="oc-select" value={spec1} autoFocus onChange={e => { setSpec1(e.target.value); setEditField(null); }}>
                  <optgroup label="Grupa III (najwyższa)">{OC_SPEC_III.map(s => <option key={s}>{s}</option>)}</optgroup>
                  <optgroup label="Grupa II">{OC_SPEC_II.map(s => <option key={s}>{s}</option>)}</optgroup>
                  <optgroup label="Grupa I (podstawowa)">{OC_SPEC_I.map(s => <option key={s}>{s}</option>)}</optgroup>
                </select>
              </div>
            ) : (
              <div className="oc-summary__row oc-summary__row--edit" onClick={() => setEditField("spec1")}>
                <span>Specjalizacja</span><strong>{spec1}<span className="oc-summary__pen">&#9998;</span></strong>
              </div>
            )}

            {/* Druga specjalizacja */}
            {editField === "spec2" ? (
              <div className="oc-summary__edit-row">
                <span className="oc-summary__edit-label">Druga specjalizacja</span>
                <select className="oc-select" value={spec2} autoFocus onChange={e => { setSpec2(e.target.value); setEditField(null); }}>
                  <option value="">— Brak —</option>
                  <optgroup label="Grupa III">{OC_SPEC_III.map(s => <option key={s}>{s}</option>)}</optgroup>
                  <optgroup label="Grupa II">{OC_SPEC_II.map(s => <option key={s}>{s}</option>)}</optgroup>
                  <optgroup label="Grupa I">{OC_SPEC_I.map(s => <option key={s}>{s}</option>)}</optgroup>
                </select>
              </div>
            ) : (
              <div className="oc-summary__row oc-summary__row--edit" onClick={() => setEditField("spec2")}>
                <span>Druga specjalizacja</span><strong>{spec2 || "Brak"}<span className="oc-summary__pen">&#9998;</span></strong>
              </div>
            )}

            {/* SOR */}
            {editField === "sor" ? (
              <div className="oc-summary__edit-row">
                <span className="oc-summary__edit-label">Praca na SOR</span>
                <div className="oc-toggle">
                  <button className={`oc-toggle__btn ${sor ? "oc-toggle__btn--on" : ""}`} onClick={() => { setSor(true); setEditField(null); }}>Tak</button>
                  <button className={`oc-toggle__btn ${sor === false ? "oc-toggle__btn--on" : ""}`} onClick={() => { setSor(false); setEditField(null); }}>Nie</button>
                </div>
              </div>
            ) : (
              <div className="oc-summary__row oc-summary__row--edit" onClick={() => setEditField("sor")}>
                <span>Praca na SOR</span><strong>{sor ? "Tak" : "Nie"}<span className="oc-summary__pen">&#9998;</span></strong>
              </div>
            )}

            {/* Grupa ryzyka — auto */}
            <div className="oc-summary__row">
              <span>Grupa ryzyka</span><strong>{riskLabel}</strong>
            </div>

            {/* Praktyka */}
            {editField === "practice" ? (
              <div className="oc-summary__edit-row">
                <span className="oc-summary__edit-label">Praktyka lekarska</span>
                <div className="oc-toggle">
                  <button className={`oc-toggle__btn ${practice ? "oc-toggle__btn--on" : ""}`} onClick={() => { setPractice(true); setEditField(null); }}>Tak</button>
                  <button className={`oc-toggle__btn ${practice === false ? "oc-toggle__btn--on" : ""}`} onClick={() => { setPractice(false); setSurplusSum(""); setEditField(null); }}>Nie</button>
                </div>
              </div>
            ) : (
              <div className="oc-summary__row oc-summary__row--edit" onClick={() => setEditField("practice")}>
                <span>Praktyka lekarska</span><strong>{practice ? "Tak" : "Nie"}<span className="oc-summary__pen">&#9998;</span></strong>
              </div>
            )}

            {/* Nadwyżka OC */}
            {practice && (editField === "surplus" ? (
              <div className="oc-summary__edit-row">
                <span className="oc-summary__edit-label">Nadwyżka OC obowiązkowego</span>
                <div className="oc-sum-picker">
                  <button className={`oc-sum-picker__btn ${surplusSum === "" ? "oc-sum-picker__btn--on" : ""}`} onClick={() => { setSurplusSum(""); setEditField(null); }}>Nie podwyższam</button>
                  {OC_SUMS.map(s => (
                    <button key={s} className={`oc-sum-picker__btn ${surplusSum === s ? "oc-sum-picker__btn--on" : ""}`} onClick={() => { setSurplusSum(s); setEditField(null); }}>
                      {s} <span className="text-muted">({OC_PREMIUM.surplus[s][riskGroup]} zł)</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="oc-summary__row oc-summary__row--edit" onClick={() => setEditField("surplus")}>
                <span>Nadwyżka OC</span><strong>{surplusSum || "Brak"}<span className="oc-summary__pen">&#9998;</span></strong>
              </div>
            ))}

            {/* OC dobrowolne */}
            {needsVoluntary && (editField === "voluntary" ? (
              <div className="oc-summary__edit-row">
                <span className="oc-summary__edit-label">Suma OC dobrowolnego</span>
                <div className="oc-sum-picker">
                  <button className={`oc-sum-picker__btn ${voluntarySum === "" ? "oc-sum-picker__btn--on" : ""}`} onClick={() => { setVoluntarySum(""); setEditField(null); }}>Nie wybieram</button>
                  {OC_SUMS.map(s => (
                    <button key={s} className={`oc-sum-picker__btn ${voluntarySum === s ? "oc-sum-picker__btn--on" : ""}`} onClick={() => { setVoluntarySum(s); setEditField(null); }}>
                      {s} <span className="text-muted">({OC_PREMIUM.surplus[s][riskGroup]} zł)</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="oc-summary__row oc-summary__row--edit" onClick={() => setEditField("voluntary")}>
                <span>OC dobrowolne</span><strong>{voluntarySum || "Brak"}<span className="oc-summary__pen">&#9998;</span></strong>
              </div>
            ))}

            {/* Rozszerzenia — toggle + warianty */}
            {OC_EXTRAS.map(ex => {
              const vi = extraVariants[ex.key];
              const v = ex.variants[vi];
              const hasVars = ex.variants.length > 1;
              const isEditing = editField === "ext_" + ex.key;
              return (
                <React.Fragment key={ex.key}>
                  {isEditing ? (
                    <div className="oc-summary__edit-row">
                      <span className="oc-summary__edit-label">{ex.shortLabel}</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
                        <div className="oc-toggle">
                          <button className={`oc-toggle__btn ${extras[ex.key] ? "oc-toggle__btn--on" : ""}`} onClick={() => { if (!extras[ex.key]) toggleExtra(ex.key); }}>Tak</button>
                          <button className={`oc-toggle__btn ${!extras[ex.key] ? "oc-toggle__btn--on" : ""}`} onClick={() => { if (extras[ex.key]) toggleExtra(ex.key); setEditField(null); }}>Nie</button>
                        </div>
                        {extras[ex.key] && hasVars && (
                          <div className="oc-sum-picker">
                            {ex.variants.map((opt, oi) => (
                              <button key={oi} className={`oc-sum-picker__btn ${oi === vi ? "oc-sum-picker__btn--on" : ""}`}
                                onClick={() => { setExtraVariant(ex.key, oi); setEditField(null); }}>
                                {opt.sum} <span className="text-muted">({opt.price} zł)</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="oc-summary__row oc-summary__row--edit" onClick={() => hasVars && extras[ex.key] ? setEditField("ext_" + ex.key) : toggleExtra(ex.key)}>
                      <span>{ex.shortLabel} {extras[ex.key] && <span className="text-muted">(+{v.price} zł{hasVars ? `, limit ${v.sum}` : ""})</span>}</span>
                      <strong className={extras[ex.key] ? "text-green" : ""}>{extras[ex.key] ? "✓ Tak" : "Nie"}{extras[ex.key] && hasVars && <span className="oc-summary__pen">&#9998;</span>}</strong>
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {/* Szkody */}
            {editField === "claim" ? (
              <div className="oc-summary__edit-row">
                <span className="oc-summary__edit-label">Szkody w ostatnich 3 latach</span>
                <div className="oc-toggle">
                  <button className={`oc-toggle__btn ${hadClaim === true ? "oc-toggle__btn--warn" : ""}`} onClick={() => { setHadClaim(true); setEditField(null); }}>Tak</button>
                  <button className={`oc-toggle__btn ${hadClaim === false ? "oc-toggle__btn--on" : ""}`} onClick={() => { setHadClaim(false); setEditField(null); }}>Nie</button>
                </div>
              </div>
            ) : (
              <div className="oc-summary__row oc-summary__row--edit" onClick={() => setEditField("claim")}>
                <span>Szkody w ostatnich 3 latach</span><strong>{hadClaim ? "Tak" : "Nie"}<span className="oc-summary__pen">&#9998;</span></strong>
              </div>
            )}
          </div>

          {hadClaim === true && (
            <div className="oc-field__error-box" style={{ marginTop: 12 }}>
              Ze względu na zgłoszone roszczenia standardowa kalkulacja nie jest dostępna. Konsultant oceni ryzyko indywidualnie.
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="oc-nav">
        {step > 0 && <button className="oc-nav__back" onClick={() => setStep(s => s - 1)}>← Wstecz</button>}
        {step < 3 ? (
          <button className="oc-nav__next" disabled={!canNext()} onClick={() => setStep(s => s + 1)}>Dalej →</button>
        ) : (
          <button className="oc-nav__next" onClick={startCalc}>
            {hadClaim ? "Wyślij zapytanie" : "Porównaj oferty ubezpieczycieli"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── OC FORM V2 — UNIFIED ERGO + INTER ─────────────────── */

function InsurerBadge({ insurer }) {
  const src = insurer === "inter"
    ? "ubezpieczenia/loga/inter logo.webp"
    : "ubezpieczenia/loga/ergohestia.png";
  return (
    <span className="oc-insurer-badge">
      <img src={src} alt={insurer} style={{ height: 12, maxHeight: 12, width: "auto", maxWidth: 56, objectFit: "contain", display: "block" }} />
    </span>
  );
}

/* ── INCOME LOSS FORM ─────────────────────────────────── */
const INCOME_SOURCES = [
  "Jednoosobowa działalność gospodarcza",
  "Udziałowiec w spółce",
  "Umowa zlecenie / o dzieło",
  "Umowa o pracę",
];
const TAX_FORMS = [
  "Skala podatkowa",
  "Podatek liniowy",
  "Ryczałt",
  "Karta podatkowa",
];
const INCOME_BENEFIT_OPTIONS = [
  { value: 3000,  label: "3 000 zł" },
  { value: 5000,  label: "5 000 zł" },
  { value: 8000,  label: "8 000 zł" },
  { value: 10000, label: "10 000 zł" },
  { value: 15000, label: "15 000 zł" },
  { value: 20000, label: "20 000 zł" },
];

function IncomeForm() {
  const [step, setStep] = useState(0);
  const [birthDate, setBirthDate] = useState("");
  const [benefit, setBenefit] = useState("");
  const [incomeSource, setIncomeSource] = useState("");
  const [taxForm, setTaxForm] = useState("");
  const [hasEmployees, setHasEmployees] = useState(null);
  const [notes, setNotes] = useState("");
  const [phase, setPhase] = useState("form"); // form | loading | done

  const canNext = () => {
    if (step === 0) return birthDate && incomeSource && taxForm;
    if (step === 1) return benefit && hasEmployees !== null;
    return true;
  };

  const submit = () => {
    setPhase("loading");
    setTimeout(() => setPhase("done"), 2200);
  };

  if (phase === "done") {
    return (
      <div className="oc-form">
        <div className="oc-done">
          <div className="oc-done__icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2E35FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </div>
          <h3>Zapytanie wysłane</h3>
          <p className="text-sm text-muted">Doradca przygotuje indywidualną ofertę i skontaktuje się w ciągu 24h.</p>
        </div>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="oc-form">
        <div className="oc-loading">
          <div className="oc-loading__spinner" />
          <p className="oc-loading__text">Przesyłamy dane do doradcy…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="oc-form">
      {/* Stepper */}
      <div className="oc-steps">
        {["Dane podstawowe", "Ochrona", "Podsumowanie"].map((label, i) => (
          <div key={i} className={`oc-steps__item ${i < step ? "oc-steps__item--done" : ""} ${i === step ? "oc-steps__item--active" : ""}`}>
            <div className="oc-steps__dot">{i < step ? "✓" : i + 1}</div>
            <span className="oc-steps__label">{label}</span>
          </div>
        ))}
      </div>

      {/* STEP 0: Dane podstawowe */}
      {step === 0 && (
        <div className="oc-step">
          <h3 className="oc-step__title">Dane podstawowe</h3>
          <p className="oc-step__desc">Informacje potrzebne do wyceny ubezpieczenia od utraty dochodu.</p>

          <div className="oc-field">
            <label className="oc-field__label">Data urodzenia</label>
            <input type="date" className="oc-select" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
          </div>

          <div className="oc-field">
            <label className="oc-field__label">Źródło przychodów <span className="text-muted">(min. 80% dochodu)</span></label>
            <p className="oc-field__hint">Wskaż główną formę, z której pochodzi co najmniej 80% Twoich przychodów z zawodu lekarza.</p>
            <select className="oc-select" value={incomeSource} onChange={e => setIncomeSource(e.target.value)}>
              <option value="">— Wybierz —</option>
              {INCOME_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="oc-field">
            <label className="oc-field__label">Forma opodatkowania przychodów</label>
            <select className="oc-select" value={taxForm} onChange={e => setTaxForm(e.target.value)}>
              <option value="">— Wybierz —</option>
              {TAX_FORMS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* STEP 1: Ochrona */}
      {step === 1 && (
        <div className="oc-step">
          <h3 className="oc-step__title">Zakres ochrony</h3>
          <p className="oc-step__desc">Wybierz wysokość miesięcznego świadczenia i uzupełnij informacje o zatrudnieniu.</p>

          <div className="oc-field">
            <label className="oc-field__label">Wysokość świadczenia miesięcznego</label>
            <p className="oc-field__hint">Nie więcej niż 80% średniomiesięcznych przychodów z zawodu lekarza osiągniętych w ostatnich 12 miesiącach.</p>
            <div className="oc-sum-picker" style={{ flexWrap: "wrap" }}>
              {INCOME_BENEFIT_OPTIONS.map(opt => (
                <button key={opt.value}
                  className={`oc-sum-picker__btn ${benefit === opt.value ? "oc-sum-picker__btn--on" : ""}`}
                  onClick={() => setBenefit(opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="oc-field">
            <label className="oc-field__label">Zatrudniasz współpracowników? <span className="text-muted">(bez względu na formę)</span></label>
            <div className="oc-toggle">
              <button className={`oc-toggle__btn ${hasEmployees === true ? "oc-toggle__btn--on" : ""}`} onClick={() => setHasEmployees(true)}>Tak</button>
              <button className={`oc-toggle__btn ${hasEmployees === false ? "oc-toggle__btn--on" : ""}`} onClick={() => setHasEmployees(false)}>Nie</button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Podsumowanie */}
      {step === 2 && (
        <div className="oc-step">
          <h3 className="oc-step__title">Podsumowanie</h3>
          <p className="oc-step__desc">Sprawdź dane przed wysłaniem zapytania.</p>

          <div className="oc-summary">
            <div className="oc-summary__row">
              <span className="oc-summary__label">Data urodzenia</span>
              <span className="oc-summary__value">{new Date(birthDate).toLocaleDateString("pl-PL")}</span>
            </div>
            <div className="oc-summary__row">
              <span className="oc-summary__label">Źródło przychodów</span>
              <span className="oc-summary__value">{incomeSource}</span>
            </div>
            <div className="oc-summary__row">
              <span className="oc-summary__label">Opodatkowanie</span>
              <span className="oc-summary__value">{taxForm}</span>
            </div>
            <div className="oc-summary__row">
              <span className="oc-summary__label">Świadczenie miesięczne</span>
              <span className="oc-summary__value oc-summary__value--accent">{INCOME_BENEFIT_OPTIONS.find(o => o.value === benefit)?.label}/mies.</span>
            </div>
            <div className="oc-summary__row">
              <span className="oc-summary__label">Współpracownicy</span>
              <span className="oc-summary__value">{hasEmployees ? "Tak" : "Nie"}</span>
            </div>
          </div>

          <div className="oc-field" style={{ marginTop: 16 }}>
            <label className="oc-field__label">Uwagi / pytania dodatkowe <span className="text-muted">(opcjonalnie)</span></label>
            <textarea className="oc-select" rows={3} placeholder="Np. pytania o karencję, zakres, wyłączenia…"
              value={notes} onChange={e => setNotes(e.target.value)}
              style={{ resize: "vertical", minHeight: 60 }} />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="oc-nav">
        {step > 0 && <button className="oc-nav__back" onClick={() => setStep(s => s - 1)}>← Wstecz</button>}
        {step < 2 ? (
          <button className="oc-nav__next" disabled={!canNext()} onClick={() => setStep(s => s + 1)}>Dalej →</button>
        ) : (
          <button className="oc-nav__next" onClick={submit}>Wyślij zapytanie o ofertę</button>
        )}
      </div>
    </div>
  );
}

function InsuranceDetail({ cat, onBack }) {
  const [uploaded, setUploaded] = useState(false);
  const [requested, setRequested] = useState(false);

  return (
    <div className="ins-detail">
      <button className="ins-back" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Wróć do kategorii
      </button>

      <div className="ins-detail__header">
        <div className="ins-detail__icon"><InsIcon id={cat.icon} size={32} /></div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{cat.name}</h2>
          <p className="text-sm text-muted">{cat.desc}</p>
        </div>
      </div>

      {/* OC — formularz */}
      {cat.id === "oc" && <OcForm />}

      {/* Utrata dochodu — formularz */}
      {cat.id === "income" && <IncomeForm />}

      {/* CTA + upload (not for OC/income — have own forms) */}
    </div>
  );
}

/* ── OCR UTILS ──────────────────────────────────────── */
// Dłuższe / bardziej specyficzne nazwy MUSZĄ być przed krótszymi (np. "INTER Polska" przed "INTER")
const KNOWN_INSURERS = [
  "Nationale-Nederlanden","STU Ergo Hestia","Ergo Hestia",
  "INTER Ubezpieczenia","INTER Polska",
  "TUiR WARTA","TUiR Warta","Warta",
  "Powszechny Zakład Ubezpieczeń","PZU",
  "Allianz","Generali","UNIQA","Compensa",
  "Lloyd's","AXA","Signal Iduna","TU Europa",
  "Vienna Insurance Group","Wiener","Aviva",
  "INTER", // na końcu — żeby nie łapał "Internet"
];

function extractPolicyData(text) {
  const result = { policyNumber: "", insurer: "", expiryDate: "", sumInsured: "" };
  if (!text) return result;

  // ── Numer polisy ──
  // Priorytety: "numer polisy", "nr polisy", "polisa...NR:", "polisa numer:", generic "NR:"
  const numPatterns = [
    /(?:numer polisy|nr\.?\s*polisy|polisa\s*(?:nr|numer))[:\s.]*([A-Za-z0-9][A-Za-z0-9\-\/\.]{2,25})/i,
    /polisa[^\n]{0,40}?NR[:\s.]*(\d{5,20})/i,
    /(?:NR|numer)[:\s.]+(\d{5,20})/i,
    /polisy?\s+(\d{5,20})/i,
  ];
  for (const pat of numPatterns) {
    const m = text.match(pat);
    if (m) { result.policyNumber = m[1].trim(); break; }
  }

  // ── Ubezpieczyciel ── (word boundary, żeby "INTER" nie matchowało w "Internet")
  for (const name of KNOWN_INSURERS) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp("\\b" + escaped + "\\b", "i");
    if (re.test(text)) {
      result.insurer = name;
      break;
    }
  }

  // ── Data ważności ──
  const DATE_RE = "(\\d{1,4}[\\.\\/\\-]\\d{1,2}[\\.\\/\\-]\\d{2,4})";
  const datePatterns = [
    // "opłacona do", "ważna do", "aktywna...do"
    new RegExp("(?:op[łl]acona\\s+do|wa[żz]na\\s+do|aktywna[^\\n]{0,30}?do)[:\\s]*" + DATE_RE, "i"),
    // "zakończenia ochrony", "koniec ochrony", "końca ochrony"
    new RegExp("(?:zako[ńn]czeni[ae]\\s+ochrony|ko[ńn](?:iec|ca)\\s+ochrony|koniec\\s+(?:okresu\\s+)?ubezp)[:\\s]*" + DATE_RE, "i"),
    // "ważności do", "ochrony do"
    new RegExp("(?:wa[żz]no[śs][ćc]i?\\s*do|ochrony?\\s*do)[:\\s]*" + DATE_RE, "i"),
    // "DO:" format (Warta)
    new RegExp("DO[:\\s]+" + DATE_RE, "i"),
    // date range: DATE – DATE (pick the second one)
    new RegExp(DATE_RE + "\\s*(?:–|-|do)\\s*" + DATE_RE),
    // generic "do" + date, "wygasa"
    new RegExp("(?:do|ko[ńn]c(?:zy|a)|wygasa|okres[^\\n]{0,15}?do)[:\\s]*" + DATE_RE, "i"),
  ];
  for (const pat of datePatterns) {
    const m = text.match(pat);
    if (m) {
      result.expiryDate = (m[2] || m[1]).trim();
      break;
    }
  }
  // Fallback: jeśli nie znaleziono, zbierz wszystkie daty i weź najnowszą (prawdopodobnie koniec polisy)
  if (!result.expiryDate) {
    const allDates = [...text.matchAll(/(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{4})/g)];
    let best = null, bestTs = 0;
    for (const dm of allDates) {
      const [, a, b, c] = dm;
      const day = parseInt(a), mon = parseInt(b), yr = parseInt(c);
      if (yr < 2000 || yr > 2100 || mon < 1 || mon > 12 || day < 1 || day > 31) continue;
      const ts = new Date(yr, mon - 1, day).getTime();
      if (ts > bestTs) { bestTs = ts; best = dm[0]; }
    }
    if (best) result.expiryDate = best;
  }

  // ── Suma ubezpieczenia / gwarancyjna ──
  const MONEY = "([\\d\\s.,]+)\\s*(EUR|PLN|z[łl])";
  const sumPatterns = [
    new RegExp("(?:suma gwarancyjna|suma ubezp[a-z]*|SG|s\\.g\\.)[:\\s]*" + MONEY, "i"),
    new RegExp("(?:suma gwarancyjna|suma ubezp[a-z]*)[^\\n]{0,80}?" + MONEY, "i"),
    new RegExp(MONEY + "\\s*(?:na jedno zdarzenie|na zdarzenie)", "i"),
    // Fallback: "SKŁADKA ŁĄCZNA" lub "składka łączna"
    new RegExp("(?:sk[łl]adka [łl][aą]czna)[:\\s]*" + MONEY, "i"),
  ];
  for (const pat of sumPatterns) {
    const m = text.match(pat);
    if (m) {
      result.sumInsured = m[1].trim().replace(/\s/g, "") + " " + m[2];
      break;
    }
  }

  return result;
}

async function extractTextFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";
  for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map(item => item.str).join(" ") + "\n";
  }
  return fullText.trim();
}

async function ocrFromFile(file) {
  const isPdf = file.type === "application/pdf";

  // PDF → próbuj wyciągnąć tekst z warstwy tekstowej
  if (isPdf && window.pdfjsLib) {
    const pdfText = await extractTextFromPdf(file);
    if (pdfText.length > 50) return pdfText;
    // PDF bez tekstu → renderuj do canvas i OCR
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    const { data: { text } } = await Tesseract.recognize(canvas, "pol");
    return text;
  }

  // Obraz → Tesseract OCR
  const { data: { text } } = await Tesseract.recognize(file, "pol");
  return text;
}

function OcrModal({ catId, onConfirm, onCancel }) {
  const [scanning, setScanning] = useState(true);
  const [data, setData] = useState({ policyNumber: "", insurer: "", expiryDate: "", sumInsured: "" });
  const [rawText, setRawText] = useState("");
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);

  const startScan = (f) => {
    setFile(f);
    setScanning(true);
    setError(null);
    ocrFromFile(f).then(text => {
      setRawText(text);
      setData(extractPolicyData(text));
      setScanning(false);
    }).catch(err => {
      console.error("OCR error:", err);
      setError("Nie udało się odczytać pliku. Uzupełnij dane ręcznie.");
      setScanning(false);
    });
  };

  const pickedRef = React.useRef(false);
  React.useEffect(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.png,.jpg,.jpeg";
    input.onchange = (e) => {
      const f = e.target.files[0];
      if (f) { pickedRef.current = true; startScan(f); }
      else onCancel();
    };
    input.click();
    const handleFocus = () => { setTimeout(() => { if (!pickedRef.current) onCancel(); }, 600); };
    window.addEventListener("focus", handleFocus, { once: true });
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const handleField = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  // Modal zawsze renderowany — file picker otwarty lub skan w toku
  if (!scanning && !file) return null;

  return (
    <div className="ocr-modal" onClick={onCancel}>
      <div className="ocr-modal__card" onClick={e => e.stopPropagation()}>
        {scanning ? (
          <div className="ocr-modal__scanning">
            <div className="ocr-modal__spinner" />
            <p style={{ fontWeight: 600, fontSize: 14, margin: "12px 0 4px" }}>Analizuję dokument…</p>
            <p className="text-sm text-muted">Odczytywanie tekstu z pliku</p>
          </div>
        ) : (
          <React.Fragment>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>Dane z polisy</h3>
            <p className="text-sm text-muted" style={{ margin: "0 0 16px" }}>
              {error || "Sprawdź i uzupełnij poniższe dane. Możesz je edytować."}
            </p>

            <div className="ocr-modal__fields">
              <div className="ocr-modal__field">
                <label>Ubezpieczyciel</label>
                <input type="text" value={data.insurer} onChange={e => handleField("insurer", e.target.value)}
                  placeholder="np. Ergo Hestia" />
              </div>
              <div className="ocr-modal__field">
                <label>Numer polisy</label>
                <input type="text" value={data.policyNumber} onChange={e => handleField("policyNumber", e.target.value)}
                  placeholder="np. OC-2024/12345" />
              </div>
              <div className="ocr-modal__field">
                <label>Data ważności (do)</label>
                <input type="text" value={data.expiryDate} onChange={e => handleField("expiryDate", e.target.value)}
                  placeholder="np. 31.12.2026" />
              </div>
              <div className="ocr-modal__field">
                <label>Suma gwarancyjna</label>
                <input type="text" value={data.sumInsured} onChange={e => handleField("sumInsured", e.target.value)}
                  placeholder="np. 75000 EUR" />
              </div>
            </div>

            {rawText && (
              <details style={{ marginTop: 12, fontSize: 11, color: "var(--color-muted)" }}>
                <summary style={{ cursor: "pointer", fontWeight: 500 }}>Odczytany tekst (debug)</summary>
                <pre style={{ whiteSpace: "pre-wrap", maxHeight: 120, overflow: "auto", marginTop: 6, padding: 8, background: "var(--color-secondary)", borderRadius: 6, fontSize: 10 }}>{rawText.slice(0, 2000)}</pre>
              </details>
            )}

            <div className="ocr-modal__actions">
              <button className="ocr-modal__btn ocr-modal__btn--cancel" onClick={onCancel}>Anuluj</button>
              <button className="ocr-modal__btn ocr-modal__btn--confirm" onClick={() => onConfirm(data, file.name)}>Potwierdź</button>
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

// ─── INSURANCE DASHBOARD ──────────────────────────────────────────────────────

const INS_DASH_DEFAULT_POLICIES = {};

function InsuranceDashView() {
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem("km-ins-mode") || "new"; } catch { return "new"; }
  });
  const [policies, setPolicies] = useState(() => {
    try { return JSON.parse(localStorage.getItem("km-ins-policies")) || INS_DASH_DEFAULT_POLICIES; }
    catch { return INS_DASH_DEFAULT_POLICIES; }
  });
  const [selectedCat, setSelectedCat] = useState(null);
  const [ocrModal, setOcrModal] = useState(null);
  const [contactOpen, setContactOpen] = useState(null);
  const [contactSlot, setContactSlot] = useState(null);
  const [contactSent, setContactSent] = useState({});
  const [expandedPolicy, setExpandedPolicy] = useState(null);

  // Persist
  useEffect(() => {
    try { localStorage.setItem("km-ins-policies", JSON.stringify(policies)); } catch {}
  }, [policies]);
  useEffect(() => {
    try { localStorage.setItem("km-ins-mode", mode); } catch {}
  }, [mode]);

  // Drill-down to InsuranceDetail
  if (selectedCat) {
    return <InsuranceDetail cat={selectedCat} onBack={() => setSelectedCat(null)} />;
  }

  const handleOcrConfirm = (data, fileName) => {
    const catId = ocrModal;
    setPolicies(prev => ({
      ...prev,
      [catId]: { source: "external", provider: data.insurer || "Nieznany", policyNumber: data.policyNumber || "", expiryDate: data.expiryDate || "", sumInsured: data.sumInsured || "" }
    }));
    setOcrModal(null);
  };

  const handleContactSend = (catId) => {
    if (!contactSlot) return;
    setContactSent(prev => ({ ...prev, [catId]: true }));
    setContactOpen(null);
    setContactSlot(null);
  };

  const daysLeft = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d)) return null;
    return Math.max(0, Math.ceil((d - new Date()) / 86400000));
  };

  // ── Demo data for "existing customer" mode ──
  const DEMO_POLICIES = {
    oc: { source: "km", provider: "Ergo Hestia", policyNumber: "EH/OC-2025/78341", expiryDate: "2026-11-30", sumInsured: "75 000 EUR", premium: "149 zł/mies.", scope: "OC obowiązkowe + nadwyżkowe", extras: ["Ochrona prawna 100 000 zł", "Profilaktyka HIV/WZW", "Kary NFZ 200 000 zł"] },
    income: { source: "km", provider: "Lloyd's", policyNumber: "LL/UD-2025/42190", expiryDate: "2026-08-15", sumInsured: "10 000 zł/mies.", premium: "189 zł/mies.", scope: "Utrata dochodu — choroba i wypadek", extras: ["Karencja 30 dni", "Świadczenie do 12 miesięcy"] },
  };

  const activePolicies = mode === "existing" ? DEMO_POLICIES : policies;

  return (
    <div className="ins-dash">
      {/* Toggle */}
      <div className="ins-toggle">
        <button className={`ins-toggle__btn${mode === "new" ? " ins-toggle__btn--active" : ""}`} onClick={() => setMode("new")}>
          Szukam ubezpieczenia
        </button>
        <button className={`ins-toggle__btn${mode === "existing" ? " ins-toggle__btn--active" : ""}`} onClick={() => setMode("existing")}>
          Mam ubezpieczenie u nas
        </button>
      </div>

      {/* ═══ MODE: NEW ═══ */}
      {mode === "new" && (
        <>
          <div className="ins-dash__header" style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h2 className="ins-dash__title">Wybierz ubezpieczenie</h2>
            <p className="ins-dash__subtitle">Oferty od Ergo Hestii i Lloyd's — dopasowane do lekarzy</p>
          </div>

          <div className="ins-pick">
            {INSURANCE_CATEGORIES.map(cat => (
              <div key={cat.id} className="ins-pick__card">
                <div className="ins-pick__icon">
                  {cat.id === "oc" && <img src="ubezpieczenia/loga/ergohestia.png" alt="Ergo Hestia" style={{ height: 28, objectFit: "contain" }} />}
                  {cat.id === "income" && <img src="ubezpieczenia/loga/lloyds.png" alt="Lloyd's" style={{ height: 16, objectFit: "contain" }} />}
                </div>
                <h3 className="ins-pick__name">{cat.name}</h3>
                {cat.tag && <Pill variant={cat.tagVariant}>{cat.tag}</Pill>}
                <p className="ins-pick__desc">{cat.desc}</p>
                {cat.priceLabel && <span className="ins-pick__price">{cat.priceLabel}</span>}
                <button className="ins-pick__btn" onClick={() => setSelectedCat(cat)}>
                  Sprawdź ofertę
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            ))}
          </div>

          <div className="ins-divider">
            <span className="ins-divider__line" />
            <span className="ins-divider__text">lub</span>
            <span className="ins-divider__line" />
          </div>

          <div className="ins-scan">
            <div className="ins-scan__icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
            </div>
            <div className="ins-scan__content">
              <h3 className="ins-scan__title">Masz już ubezpieczenie?</h3>
              <p className="ins-scan__desc">Zeskanuj obecną polisę — odczytamy datę wygaśnięcia i przypomnimy o odnowieniu z lepszą ofertą.</p>
            </div>
            <div className="ins-scan__actions">
              <button className="ins-scan__btn" onClick={() => setOcrModal("oc")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
                Skanuj polisę OC
              </button>
              <button className="ins-scan__btn" onClick={() => setOcrModal("income")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
                Skanuj polisę od utraty dochodu
              </button>
            </div>
          </div>
        </>
      )}

      {/* ═══ MODE: EXISTING CUSTOMER ═══ */}
      {mode === "existing" && (
        <>
          <div className="ins-dash__header" style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h2 className="ins-dash__title">Twoje polisy</h2>
            <p className="ins-dash__subtitle">Śledź status, szczegóły i daty odnowienia</p>
          </div>

          <div className="ins-tracker">
            {INSURANCE_CATEGORIES.map(cat => {
              const policy = activePolicies[cat.id];
              if (!policy) return null;
              const days = daysLeft(policy.expiryDate);
              const isExpanded = expandedPolicy === cat.id;
              const urgent = days !== null && days < 30;
              const warn = days !== null && days < 90 && !urgent;

              return (
                <div key={cat.id} className={`ins-tracker__card${urgent ? " ins-tracker__card--urgent" : warn ? " ins-tracker__card--warn" : ""}`}>
                  {/* Card header — always visible */}
                  <button className="ins-tracker__header" onClick={() => setExpandedPolicy(isExpanded ? null : cat.id)}>
                    <div className="ins-tracker__left">
                      <div className="ins-tracker__logo">
                        {cat.id === "oc" && <img src="ubezpieczenia/loga/ergohestia.png" alt="Ergo Hestia" style={{ height: 22, objectFit: "contain" }} />}
                        {cat.id === "income" && <img src="ubezpieczenia/loga/lloyds.png" alt="Lloyd's" style={{ height: 12, objectFit: "contain" }} />}
                      </div>
                      <div>
                        <span className="ins-tracker__name">{cat.name}</span>
                        <span className="ins-tracker__nr">Nr {policy.policyNumber}</span>
                      </div>
                    </div>
                    <div className="ins-tracker__right">
                      <span className="ins-tracker__status">Aktywna</span>
                      {days !== null && (
                        <span className={`ins-tracker__days${urgent ? " ins-tracker__days--urgent" : warn ? " ins-tracker__days--warn" : ""}`}>
                          {days === 0 ? "Wygasła" : `${days} dni`}
                        </span>
                      )}
                      <svg className={`ins-tracker__chevron${isExpanded ? " ins-tracker__chevron--open" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                  </button>

                  {/* Expiry progress bar */}
                  {days !== null && (
                    <div className="ins-tracker__bar">
                      <div className={`ins-tracker__bar-fill${urgent ? " ins-tracker__bar-fill--urgent" : warn ? " ins-tracker__bar-fill--warn" : ""}`} style={{ width: `${Math.min(100, (days / 365) * 100)}%` }} />
                    </div>
                  )}

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="ins-tracker__details">
                      <div className="ins-tracker__grid">
                        <div className="ins-tracker__field">
                          <span className="ins-tracker__label">Ubezpieczyciel</span>
                          <span className="ins-tracker__value">{policy.provider}</span>
                        </div>
                        <div className="ins-tracker__field">
                          <span className="ins-tracker__label">Składka</span>
                          <span className="ins-tracker__value">{policy.premium}</span>
                        </div>
                        <div className="ins-tracker__field">
                          <span className="ins-tracker__label">Suma gwarancyjna</span>
                          <span className="ins-tracker__value">{policy.sumInsured}</span>
                        </div>
                        <div className="ins-tracker__field">
                          <span className="ins-tracker__label">Ważna do</span>
                          <span className="ins-tracker__value">{policy.expiryDate && new Date(policy.expiryDate).toLocaleDateString("pl-PL")}</span>
                        </div>
                      </div>

                      {policy.scope && (
                        <div className="ins-tracker__field" style={{ marginTop: 12 }}>
                          <span className="ins-tracker__label">Zakres</span>
                          <span className="ins-tracker__value">{policy.scope}</span>
                        </div>
                      )}

                      {policy.extras?.length > 0 && (
                        <div className="ins-tracker__extras">
                          <span className="ins-tracker__label">Rozszerzenia</span>
                          <ul className="ins-tracker__extras-list">
                            {policy.extras.map((e, i) => (
                              <li key={i}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                                {e}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Contact advisor */}
                      <div className="ins-tracker__actions">
                        {contactOpen !== cat.id && !contactSent[cat.id] && (
                          <>
                            <button className="ins-pick__btn" onClick={() => { setContactOpen(cat.id); setContactSlot(null); }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                              Skontaktuj się z doradcą
                            </button>
                            <button className="ins-pick__btn ins-pick__btn--outline" onClick={() => setSelectedCat(cat)}>
                              Szczegóły polisy
                            </button>
                          </>
                        )}

                        {contactOpen === cat.id && !contactSent[cat.id] && (
                          <div className="ins-tracker__contact">
                            <p className="ins-tracker__contact-label">Kiedy możemy zadzwonić?</p>
                            <div className="ins-tracker__contact-slots">
                              {CONTACT_SLOTS.map(s => (
                                <button key={s.id} className={`ins-tracker__slot${contactSlot === s.id ? " ins-tracker__slot--active" : ""}`} onClick={() => setContactSlot(s.id)}>
                                  {s.label}
                                </button>
                              ))}
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button className="ins-pick__btn" onClick={() => handleContactSend(cat.id)} disabled={!contactSlot} style={{ flex: 1 }}>
                                Wyślij prośbę
                              </button>
                              <button className="ins-pick__btn ins-pick__btn--outline" onClick={() => setContactOpen(null)} style={{ flex: 0 }}>
                                Anuluj
                              </button>
                            </div>
                          </div>
                        )}

                        {contactSent[cat.id] && (
                          <div className="ins-tracker__contact-done">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                            <span>Prośba wysłana — doradca odezwie się wkrótce</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Partners */}
      <div className="ins-partners" style={{ marginTop: 32 }}>
        <span className="ins-partners__label">Ubezpieczamy z</span>
        <div className="ins-partners__logos">
          {INS_PARTNERS.map(p => (
            <img key={p.name} src={p.logo} alt={p.name} className="ins-partners__logo" title={p.name} style={{ height: p.h }} />
          ))}
        </div>
      </div>

      {/* OCR Modal */}
      {ocrModal && (
        <OcrModal catId={ocrModal} onConfirm={handleOcrConfirm} onCancel={() => setOcrModal(null)} />
      )}
    </div>
  );
}

function InsuranceView() {
  const [selected, setSelected] = useState(null);
  // status: null = brak, "km" = kupione w KM, "external" = dodane z zewnątrz
  const [statuses, setStatuses] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [policyData, setPolicyData] = useState({});
  const [ocrModal, setOcrModal] = useState(null); // catId or null
  // daty wygaśnięcia polis kuponych w KM
  const expiryDates = {};

  if (selected) {
    return <InsuranceDetail cat={selected} onBack={() => setSelected(null)} />;
  }

  const coveredCount = INSURANCE_CATEGORIES.filter(c => statuses[c.id]).length;
  const totalCount = INSURANCE_CATEGORIES.length;

  const handleFileUpload = (catId) => {
    setOcrModal(catId);
  };

  const handleOcrConfirm = (data, fileName) => {
    const catId = ocrModal;
    setPolicyData(prev => ({ ...prev, [catId]: data }));
    setUploadedFiles(prev => ({ ...prev, [catId]: fileName }));
    setStatuses(prev => ({ ...prev, [catId]: "external" }));
    setOcrModal(null);
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Twoje ubezpieczenia</h2>
      </div>

      {/* Cards */}
      <div className="ins-grid">
        {INSURANCE_CATEGORIES.map(cat => {
          const status = statuses[cat.id];
          const isExternal = status === "external";
          const fileName = uploadedFiles[cat.id];
          const expiry = expiryDates[cat.id];
          const daysLeft = expiry ? Math.max(0, Math.ceil((new Date(expiry) - new Date()) / 86400000)) : null;

          return (
            <div key={cat.id} className={`ins-card ins-card--status ${cat.disabled ? "ins-card--disabled" : status ? "ins-card--covered" : cat.noMissing ? "" : "ins-card--missing"}`}>
              <div className="ins-card__icon">
                <InsIcon id={cat.icon} />
                {status && !cat.disabled && (
                  <span className="ins-card__check">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </span>
                )}
              </div>
              <div className="ins-card__body">
                <div className="ins-card__top">
                  <span className="ins-card__name">{cat.name}</span>
                  {cat.tag && <Pill variant={cat.tagVariant}>{cat.tag}</Pill>}
                  {status === "km" && !cat.disabled && <span className="ins-card__status-badge ins-card__status-badge--active">Aktywne</span>}
                  {isExternal && <span className="ins-card__status-badge ins-card__status-badge--ext">Polisa zewnętrzna</span>}
                </div>
                {!status && !cat.disabled && cat.priceLabel && <span className="ins-card__price">{cat.priceLabel}</span>}
                {!status && !cat.disabled && !cat.priceLabel && <span className="ins-card__price ins-card__price--muted">Wycena indywidualna</span>}
                {cat.disabled && <span className="ins-card__price ins-card__price--muted">{cat.desc}</span>}
                {status === "km" && daysLeft !== null && (
                  <span className="ins-card__expiry">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    Wygasa za {daysLeft} dni ({new Date(expiry).toLocaleDateString("pl-PL")})
                  </span>
                )}
                {isExternal && policyData[cat.id] && (
                  <div className="ins-card__policy-data">
                    {policyData[cat.id].insurer && <span className="ins-card__policy-row">{policyData[cat.id].insurer}</span>}
                    {policyData[cat.id].policyNumber && <span className="ins-card__policy-row text-muted">Nr: {policyData[cat.id].policyNumber}</span>}
                    {policyData[cat.id].expiryDate && <span className="ins-card__policy-row text-muted">Ważna do: {policyData[cat.id].expiryDate}</span>}
                    {policyData[cat.id].sumInsured && <span className="ins-card__policy-row text-muted">Suma: {policyData[cat.id].sumInsured}</span>}
                  </div>
                )}
                {isExternal && !policyData[cat.id] && fileName && (
                  <span className="ins-card__file">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                    {fileName}
                  </span>
                )}
              </div>
              <div className="ins-card__actions">
                {!status && !cat.disabled && (
                  <>
                    <button className="ins-card__btn ins-card__btn--primary" onClick={() => setSelected(cat)}>
                      Znajdź ofertę
                    </button>
                    <button className="ins-card__btn ins-card__btn--ghost" onClick={() => handleFileUpload(cat.id)}
                      title="Mam polisę z innego źródła">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                      Mam polisę
                    </button>
                  </>
                )}
                {status && (
                  <>
                    <button className="ins-card__btn ins-card__btn--outline" onClick={() => setSelected(cat)}>
                      {isExternal ? "Szczegóły" : "Zarządzaj"}
                    </button>
                    <button className="ins-card__btn ins-card__btn--ghost" title="Zamów kontakt z agentem">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      Kontakt
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hint */}
      {coveredCount < totalCount && (
        <div className="ins-hint">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          <p>Masz ubezpieczenie wykupione gdzie indziej? Dodaj polisę (PDF/zdjęcie), aby śledzić datę wygaśnięcia i mieć wszystko w jednym miejscu.</p>
        </div>
      )}

      <div className="ins-partners">
        <span className="ins-partners__label">Chronimy medyków z</span>
        <div className="ins-partners__logos">
          {INS_PARTNERS.map(p => (
            <img key={p.name} src={p.logo} alt={p.name} className="ins-partners__logo" title={p.name} style={{ height: p.h }} />
          ))}
        </div>
      </div>

      {/* OCR Modal */}
      {ocrModal && (
        <OcrModal
          catId={ocrModal}
          onConfirm={handleOcrConfirm}
          onCancel={() => setOcrModal(null)}
        />
      )}
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

function ProfileView({ profile, setProfile, unlockedDiscounts, setActive }) {
  const [editing,    setEditing]    = useState(false);
  const [draft, setDraft] = useState(profile);

  const setDraftField = (k, v) => setDraft(d => ({ ...d, [k]: v }));
  const toggleDraftWork = (v) => setDraft(d => ({
    ...d, work: d.work.includes(v) ? d.work.filter(x => x !== v) : [...d.work, v],
  }));
  const saveProfile = () => { setProfile(draft); setEditing(false); };
  const cancelEdit = () => { setDraft(profile); setEditing(false); };

  const roleLabel = OB_ROLES.find(r => r.id === profile.role)?.label || "";
  const workLabels = profile.work.map(w => OB_WORK.find(o => o.id === w)?.label).filter(Boolean);

  const unlockedList = DISCOUNTS.filter(d => unlockedDiscounts?.has(d.id));

  return (
    <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 32 }}>
      <div className="flex items-center gap-4">
        <img style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} src={USER_AVATAR} alt={`Dr ${profile.firstName} ${profile.lastName}`} />
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Dr {profile.firstName} {profile.lastName}</h2>
          <p className="text-sm text-muted" style={{ margin: "3px 0 0" }}>{roleLabel}{workLabels.length > 0 ? ` · ${workLabels.join(", ")}` : ""}</p>
        </div>
      </div>

      {/* Dane z onboardingu */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <SectionHeader title="Dane profilu" />
          {!editing && (
            <button className="inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-xs text-accent" onClick={() => setEditing(true)}>Edytuj</button>
          )}
        </div>

        {editing ? (
          <div className="card" style={{ padding: 20 }}>
            <div className="profile-form">
              <div className="profile-form__row">
                <div className="profile-form__field">
                  <label className="profile-form__label">Imię</label>
                  <input className="w-full rounded-lg border border-input bg-bg px-3.5 py-2.5 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary" value={draft.firstName} onChange={e => setDraftField("firstName", e.target.value)} />
                </div>
                <div className="profile-form__field">
                  <label className="profile-form__label">Nazwisko</label>
                  <input className="w-full rounded-lg border border-input bg-bg px-3.5 py-2.5 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary" value={draft.lastName} onChange={e => setDraftField("lastName", e.target.value)} />
                </div>
              </div>
              <div className="profile-form__field">
                <label className="profile-form__label">E-mail</label>
                <input className="w-full rounded-lg border border-input bg-bg px-3.5 py-2.5 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary" type="email" value={draft.email} onChange={e => setDraftField("email", e.target.value)} />
              </div>
              <div className="profile-form__field">
                <label className="profile-form__label">Telefon</label>
                <input className="w-full rounded-lg border border-input bg-bg px-3.5 py-2.5 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-muted focus:border-primary" type="tel" value={draft.phone} onChange={e => setDraftField("phone", e.target.value)} />
              </div>
              <div className="profile-form__field">
                <label className="profile-form__label">Numer PWZ</label>
                <div className="profile-form__locked">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <span>{draft.pwz}</span>
                </div>
                <span className="profile-form__hint">Numer PWZ nie podlega zmianie. Skontaktuj się z doradcą.</span>
              </div>

              <div style={{ marginTop: 8 }}>
                <label className="profile-form__label">Kim jesteś?</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {OB_ROLES.map(r => (
                    <button key={r.id} onClick={() => setDraftField("role", r.id)}
                      className={`ob-option ob-option--compact${draft.role === r.id ? " ob-option--selected" : ""}`}>
                      <span className="ob-option__label">{r.label}</span>
                      <span className="ob-option__sub">{r.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <label className="profile-form__label">Jak pracujesz?</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {OB_WORK.map(w => (
                    <button key={w.id} onClick={() => toggleDraftWork(w.id)}
                      className={`ob-check ob-check--compact${draft.work.includes(w.id) ? " ob-check--selected" : ""}`}>
                      <div className="ob-check__box">{draft.work.includes(w.id) && "✓"}</div>
                      <span className="ob-check__label">{w.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="profile-form__actions">
                <Btn variant="primary" onClick={saveProfile}>Zapisz zmiany</Btn>
                <Btn variant="outline" onClick={cancelEdit}>Anuluj</Btn>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            <div className="profile-field">
              <span className="profile-field__label">Imię i nazwisko</span>
              <span className="profile-field__value">{profile.firstName} {profile.lastName}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field__label">E-mail</span>
              <span className="profile-field__value">{profile.email}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field__label">Telefon</span>
              <span className="profile-field__value">{profile.phone || "—"}</span>
            </div>
            <div className="profile-field">
              <span className="profile-field__label">Numer PWZ</span>
              <span className="profile-field__value">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                {profile.pwz}
              </span>
            </div>
            <div className="profile-field">
              <span className="profile-field__label">Rola</span>
              <span className="profile-field__value">{roleLabel}</span>
            </div>
            <div className="profile-field" style={{ borderBottom: "none" }}>
              <span className="profile-field__label">Forma pracy</span>
              <span className="profile-field__value">{workLabels.join(", ") || "—"}</span>
            </div>
          </div>
        )}
      </div>

      <div>
        <SectionHeader title="Odblokowane zniżki" action={unlockedList.length > 0 ? "Wszystkie zniżki" : undefined} onAction={() => setActive("discounts")} />
        {unlockedList.length > 0 ? (
          <div className="card" style={{ padding: 0 }}>
            {unlockedList.map((d, i) => (
              <div key={d.id} className="profile-discount" style={{ borderBottom: i < unlockedList.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                <img src={d.logo} alt={d.partner} className="profile-discount__logo" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="text-sm font-semibold" style={{ lineHeight: 1.3 }}>{d.title}</div>
                  <div className="text-xs text-muted">{d.partner}</div>
                </div>
                <span className="profile-discount__badge">{d.badge}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: "32px 20px", textAlign: "center" }}>
            <p className="text-sm text-muted">Nie masz jeszcze odblokowanych zniżek.</p>
            <button className="mt-2 inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 text-xs text-accent" onClick={() => setActive("discounts")}>Przeglądaj zniżki</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

function AdvisorsView() {
  const [contactDropdown, setContactDropdown] = useState(null);
  const [contactBooked, setContactBooked] = useState({});
  const insuranceAdvisors = ALL_ADVISORS.filter(a => a.category === "insurance" || a.category === "life");
  return (
    <div>
      <SectionHeader title="Twoi doradcy" subtitle="Ubezpieczenia" />
      <div className="advisor-grid">
        {insuranceAdvisors.map(a => {
          const openId = contactDropdown === a.id;
          const booked = contactBooked[a.id];
          return (
            <div key={a.id} className="advisor-tile">
              <div className="advisor-tile__top">
                <img src={a.photo} alt={a.name} className="advisor-tile__photo" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="text-sm font-semibold" style={{ lineHeight: 1.35 }}>{a.name}</div>
                  <div className="text-xs text-muted">{a.role}</div>
                </div>
              </div>
              <a href={`tel:${a.phone}`} className="advisor-tile__phone">{a.phone}</a>
              <div style={{ position: "relative" }}>
                {booked ? (
                  <div className="contact-booked">
                    <span className="text-green">✓</span> {booked}
                    <button className="contact-booked__change" onClick={() => {
                      setContactBooked(prev => { const n = { ...prev }; delete n[a.id]; return n; });
                    }}>Zmień</button>
                  </div>
                ) : (
                  <Btn variant="outline" size="sm" className="contact-request-btn" onClick={() => setContactDropdown(openId ? null : a.id)}>
                    Zamów kontakt
                  </Btn>
                )}
                {openId && (
                  <div className="contact-dropdown">
                    <div className="contact-dropdown__label">Kiedy mamy zadzwonić?</div>
                    {CONTACT_SLOTS.map(slot => (
                      <button key={slot.id} className="contact-dropdown__item" onClick={() => {
                        setContactBooked(prev => ({ ...prev, [a.id]: slot.label }));
                        setContactDropdown(null);
                      }}>
                        {slot.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── NOTIFICATIONS DRAWER ─────────────────────────────────────────────────────

function NotifIcon() {
  const [showBell, setShowBell] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => setShowBell(v => !v), 1800);
    return () => clearInterval(timer);
  }, []);
  return (
    <div style={{ width: 64, height: 64, position: 'relative', marginBottom: 20 }}>
      <svg width="64" height="64" viewBox="0 0 23 23" fill="none" style={{ display: 'block' }}>
        <path d="M19.9652 0H2.85217C1.27696 0 0 1.27696 0 2.85217V19.9652C0 21.5404 1.27696 22.8173 2.85217 22.8173H19.9652C21.5404 22.8173 22.8173 21.5404 22.8173 19.9652V2.85217C22.8173 1.27696 21.5404 0 19.9652 0Z" fill="#18181B"/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          {showBell ? (
            <motion.svg key="bell" width="32" height="32" viewBox="0 0 24 24" fill="none"
              initial={{ opacity: 0, scale: 0.4, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: [0, -15, 15, -8, 0] }}
              exit={{ opacity: 0, scale: 0.4, rotate: 30 }}
              transition={{ duration: 0.25, rotate: { delay: 0.2, duration: 0.5 } }}>
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#CEFF3E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21a2 2 0 01-3.46 0" stroke="#CEFF3E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </motion.svg>
          ) : (
            <motion.svg key="sygnet" width="44" height="44" viewBox="0 0 23 23" fill="none"
              initial={{ opacity: 0, scale: 0.4, rotate: 30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.4, rotate: -30 }}
              transition={{ duration: 0.25 }}>
              <path d="M11.5447 11.0658L16.8498 7.54338L14.6465 3.75L5.96875 9.24042L5.99014 9.27607C5.99014 9.27607 5.97588 9.27607 5.96875 9.27607V13.6613C8.89222 13.6613 11.2667 16.0928 11.2667 19.0733H15.6519C15.6519 15.7719 14.0261 12.8484 11.5447 11.0729V11.0658Z" fill="#CEFF3E"/>
            </motion.svg>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function NotificationsDrawer({ onClose, profile }) {
  const [closing, setClosing] = useState(false);
  const handleClose = () => { setClosing(true); setTimeout(onClose, 250); };
  const firstName = profile?.firstName || "Użytkowniku";

  return (
    <React.Fragment>
      <div className={`drawer-overlay${closing ? " drawer-overlay--closing" : ""}`} onClick={handleClose}></div>
      <div className={`drawer notif-drawer${closing ? " drawer--closing" : ""}`}>
        <div className="drawer__header">
          <div className="drawer__header-left">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            <span className="drawer__title">Powiadomienia</span>
          </div>
          <button className="drawer__close" onClick={handleClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="drawer__body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px', flex: 1 }}>
          <NotifIcon />
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-fg)', marginBottom: 8 }}>
            Cześć{firstName ? `, ${firstName}` : ""}!
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.6, maxWidth: 280 }}>
            Wkrótce będziemy informować Cię tutaj o nowych zniżkach, statusie zamówień i ofertach dopasowanych do Twojego profilu.
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 10, border: '1px solid var(--color-border)', fontSize: 13, color: 'var(--color-muted)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Bądź na bieżąco — zostaw powiadomienia włączone
          </motion.div>
        </div>
      </div>
    </React.Fragment>
  );
}

// ─── CART DRAWER ──────────────────────────────────────────────────────────────

function CartDrawer({ cart, onClose, removeFromCart, updateQty, profile, priceMode, onProductClick, onGoToShop }) {
  const [closing, setClosing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const fmtMonthly = (n) => n.toFixed(2).replace(".", ",") + " zł";
  const fmtPrice = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " zł";
  const subItems = cart.filter(i => !i.isOneTime);
  const oneTimeItems = cart.filter(i => i.isOneTime);
  const totalNet = subItems.reduce((s, i) => s + i.priceNet * i.qty, 0);
  const totalGross = subItems.reduce((s, i) => s + i.priceGross * i.qty, 0);
  const totalOneTime = oneTimeItems.reduce((s, i) => s + i.oneTimePrice * i.qty, 0);
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 250);
  };

  return (
    <React.Fragment>
      <div className={`drawer-overlay${closing ? " drawer-overlay--closing" : ""}`} onClick={handleClose}></div>
      <div className={`drawer cart-drawer${closing ? " drawer--closing" : ""}`}>
        {/* Header */}
        <div className="drawer__header">
          <div className="drawer__header-left">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Koszyk</span>
            {totalItems > 0 && <span className="drawer__header-badge" style={{ background: "var(--color-accent)", color: "var(--color-accent-fg)" }}>{totalItems}</span>}
          </div>
          <button className="drawer__close" onClick={handleClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="drawer__content">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <motion.div className="cart-empty__sygnet"
                animate={{ y: [0, -10, 0], rotate: [0, -5, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                <svg width="56" height="56" viewBox="0 0 23 23" fill="none">
                  <path d="M19.9652 0H2.85217C1.27696 0 0 1.27696 0 2.85217V19.9652C0 21.5404 1.27696 22.8173 2.85217 22.8173H19.9652C21.5404 22.8173 22.8173 21.5404 22.8173 19.9652V2.85217C22.8173 1.27696 21.5404 0 19.9652 0Z" fill="#18181B"/>
                  <path d="M11.5447 11.0658L16.8498 7.54338L14.6465 3.75L5.96875 9.24042L5.99014 9.27607C5.99014 9.27607 5.97588 9.27607 5.96875 9.27607V13.6613C8.89222 13.6613 11.2667 16.0928 11.2667 19.0733H15.6519C15.6519 15.7719 14.0261 12.8484 11.5447 11.0729V11.0658Z" fill="#CEFF3E"/>
                </svg>
              </motion.div>
              <motion.div className="cart-empty__title"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                Koszyk jest pusty
              </motion.div>
              <motion.div className="cart-empty__desc"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                Dodaj produkty z zakładki Zakupy
              </motion.div>
              {(() => {
                const roleRecs = {
                  intern:     ["iphone15", "ipad", "macbook"],
                  resident:   ["macbook-air-m4", "iphone17pro", "garmin-fenix8"],
                  specialist: ["macbook-pro-m4", "iphone17promax", "ipad-air-m3"],
                  senior:     ["macbook-pro-16-m4pro", "iphone17promax", "dell-u2723qe"],
                };
                const recIds = roleRecs[profile?.role] || ["iphone15", "macbook-air-m4", "garmin-fenix8"];
                const allItems = PURCHASE_CATALOG.flatMap(cat => (cat.items || []).map(item => ({ item, cat })));
                const recs = recIds.map(id => allItems.find(x => x.item.id === id)).filter(Boolean);
                if (recs.length === 0) return null;
                return (
                  <motion.div className="cart-empty__recs"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <div className="cart-empty__recs-title">Polecane dla Ciebie</div>
                    <div className="cart-empty__recs-list">
                      {recs.map(({ item, cat }, i) => (
                        <motion.button key={item.id} className="cart-empty__rec-card"
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 + i * 0.1 }}
                          onClick={() => onProductClick && onProductClick(item, cat)}>
                          <div className="cart-empty__rec-emoji">{item.emoji}</div>
                          <div className="cart-empty__rec-info">
                            <div className="cart-empty__rec-name">{item.brand} {item.model}</div>
                            <div className="cart-empty__rec-price">od {item.monthlyNet.toFixed(2).replace(".", ",")} zł/mies.</div>
                          </div>
                          <svg className="cart-empty__rec-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                );
              })()}
              <motion.button className="cart-empty__shop-btn"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
                onClick={() => onGoToShop && onGoToShop()}>
                Przeglądaj cały sklep
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </motion.button>
            </div>
          ) : (
            <React.Fragment>
              {/* Items */}
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.key} className="cart-item">
                    <div className="cart-item__img" style={{ background: "var(--color-secondary)" }}>
                      {item.product.photo
                        ? <img src={item.product.photo} alt={item.product.brand} />
                        : <span style={{ fontSize: 24 }}>{item.product.emoji}</span>
                      }
                    </div>
                    <div className="cart-item__info">
                      <div className="cart-item__name">{item.product.brand} {item.product.model}</div>
                      {item.variant && item.variant.selections && (
                        <div className="cart-item__variant">
                          {Object.values(item.variant.selections).join(" · ")}
                        </div>
                      )}
                      {item.variant?.contractMonths && (
                        <div className="cart-item__variant">{item.variant.contractMonths} mies.</div>
                      )}
                      {item.variant?.selectedServices?.length > 0 && (
                        <div className="cart-item__services">
                          {(item.product.additionalServices || [])
                            .filter(s => item.variant.selectedServices.includes(s.id))
                            .map(s => <span key={s.id} className="cart-item__service-tag">{s.name}</span>)
                          }
                        </div>
                      )}
                      <div className="cart-item__price-line">
                        {item.isOneTime ? (
                          <span className="cart-item__price">{item.product.price}</span>
                        ) : (
                          <>
                            <span className="cart-item__price">{fmtMonthly(item.priceNet)}/mies.</span>
                            <span className="text-xs text-muted">netto</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="cart-item__actions">
                      <button className="cart-item__remove" onClick={() => removeFromCart(item.key)} title="Usuń">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="cart-summary">
                {subItems.length > 0 && (
                  <>
                    <div className="cart-summary__row">
                      <span>Subskrypcje ({subItems.length})</span>
                      <span className="font-semibold">{fmtMonthly(totalNet)} netto/mies.</span>
                    </div>
                    <div className="cart-summary__row">
                      <span>VAT (23%)</span>
                      <span className="font-semibold">{fmtMonthly(totalGross - totalNet)}</span>
                    </div>
                  </>
                )}
                {oneTimeItems.length > 0 && (
                  <div className="cart-summary__row">
                    <span>Zakupy jednorazowe ({oneTimeItems.length})</span>
                    <span className="font-semibold">{fmtPrice(totalOneTime)}</span>
                  </div>
                )}
                <div className="cart-summary__row">
                  <span>Dostawa</span>
                  <span style={{ color: "var(--color-green)", fontWeight: 600 }}>Gratis</span>
                </div>
                {subItems.length > 0 && (
                  <div className="cart-summary__total">
                    <span>Razem / miesiąc</span>
                    <span>{fmtMonthly(totalGross)} brutto</span>
                  </div>
                )}
                {oneTimeItems.length > 0 && (
                  <div className="cart-summary__total">
                    <span>Jednorazowo</span>
                    <span>{fmtPrice(totalOneTime)}</span>
                  </div>
                )}
                {subItems.length > 0 && (
                  <div className="cart-savings">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#18181B" stroke="#18181B" strokeWidth="1.5"/>
                      <path d="M9 12l2 2 4-4" stroke="#CEFF3E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Safe Up</span>
                    <span className="cart-savings__price">w cenie</span>
                  </div>
                )}
                <button className="cart-checkout-btn" onClick={() => setShowCheckout(true)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  Przejdź do płatności
                </button>
                <button className="cart-continue-btn" onClick={handleClose}>
                  ← Kontynuuj zakupy
                </button>

                {subItems.length > 0 && (
                  <div className="cart-financing">
                    <div className="cart-financing__note">Comiesięczna faktura VAT · Wymiana sprzętu po 6 mies. · Ochrona Safe Up w cenie</div>
                  </div>
                )}
              </div>
            </React.Fragment>
          )}
        </div>
      </div>

      {/* Checkout summary modal */}
      {showCheckout && <CheckoutModal cart={cart} totalNet={totalNet} totalGross={totalGross} profile={profile} priceMode={priceMode} onClose={() => setShowCheckout(false)} />}
    </React.Fragment>
  );
}

function CheckoutModal({ cart, totalNet, totalGross, profile, priceMode, onClose }) {
  const fmtMonthly = (n) => n.toFixed(2).replace(".", ",") + " zł";

  // Build RentUp ClientOrder payload
  const orderPayload = {
    quantity: cart.reduce((s, i) => s + i.qty, 0),
    sumOfOrder: Math.round(totalGross * 100) / 100,
    returnUrl: window.location.href,
    b2c: priceMode === "consumer",
    clientOrderId: "KM-" + Date.now(),
    client: {
      email: profile?.email || "lekarz@example.com",
      nip: profile?.nip || null,
    },
    productOrders: cart.filter(i => !i.isOneTime).map(item => ({
      clientProductId: item.variant?.clientProductId || item.product.id,
      quantity: item.qty,
      sellPrice: item.product.sellPrice || 0,
    })),
    additionalServices: cart.filter(i => !i.isOneTime).flatMap(item =>
      (item.variant?.selectedServices || []).map(svcId => {
        const svc = (item.product.additionalServices || []).find(s => s.id === svcId);
        return svc ? { id: svc.id, name: svc.name, serviceType: svc.serviceType } : null;
      }).filter(Boolean)
    ),
  };

  const handleRedirect = () => {
    console.log("RentUp Order Payload:", JSON.stringify(orderPayload, null, 2));
    alert("Docelowo: POST /api/v2/order → redirect do RentUp.\n\nPayload został wypisany w konsoli.");
  };

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={e => e.stopPropagation()}>
        <div className="checkout-modal__header">
          <h2 className="checkout-modal__title">Podsumowanie zamówienia</h2>
          <button className="drawer__close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="checkout-modal__body">
          <div className="checkout-modal__section">
            <h3 className="checkout-modal__section-title">Produkty</h3>
            {cart.filter(i => !i.isOneTime).map(item => (
              <div key={item.key} className="checkout-modal__item">
                <div className="checkout-modal__item-name">
                  {item.product.brand} {item.product.model} {item.variant?.selections ? "· " + Object.values(item.variant.selections).join(" · ") : ""}
                  {item.qty > 1 && <span> ×{item.qty}</span>}
                </div>
                <div className="checkout-modal__item-price">{fmtMonthly(item.priceNet)}/mies.</div>
                {item.variant?.contractMonths && (
                  <div className="checkout-modal__item-detail">Okres: {item.variant.contractMonths} mies.</div>
                )}
                {item.variant?.selectedServices?.length > 0 && (
                  <div className="checkout-modal__item-services">
                    {(item.product.additionalServices || [])
                      .filter(s => item.variant.selectedServices.includes(s.id))
                      .map(s => (
                        <div key={s.id} className="checkout-modal__item-detail">+ {s.name} ({fmtMonthly(s.b2bAmount)})</div>
                      ))
                    }
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="checkout-modal__totals">
            <div className="checkout-modal__total-row">
              <span>Razem netto/mies.</span>
              <span className="font-semibold">{fmtMonthly(totalNet)}</span>
            </div>
            <div className="checkout-modal__total-row checkout-modal__total-row--main">
              <span>Razem brutto/mies.</span>
              <span className="font-semibold">{fmtMonthly(totalGross)}</span>
            </div>
          </div>

          <details className="checkout-modal__api-debug">
            <summary>Dane do RentUp API (debug)</summary>
            <pre className="checkout-modal__api-json">{JSON.stringify(orderPayload, null, 2)}</pre>
          </details>
        </div>

        <div className="checkout-modal__footer">
          <Btn variant="accent" className="checkout-modal__submit" onClick={handleRedirect}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Przekieruj do finansowania
          </Btn>
          <div className="checkout-modal__note">Docelowo: redirect do RentUp na stronę finansowania</div>
        </div>
      </div>
    </div>
  );
}

const VIEWS = {
  overview:    Overview,
  purchases:   PurchasesView,
  cars:        CarsView,
  packages:    ServicesView,
  packages2:   Services2View,
  packages3:   Services3View,
  packages4:   Services4View,
  discounts:      DiscountsView,
  advisors:       AdvisorsView,
  insurance:      InsuranceDashView,
  investments: InvestmentsView,
  profile:     ProfileView,
};

function Preloader({ onDone }) {
  const [fadeOut, setFadeOut] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 1800);
    const t2 = setTimeout(onDone, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div className={`preloader${fadeOut ? " preloader--out" : ""}`}>
      <div className="preloader__logo">
        <svg width="64" height="64" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.9652 0H2.85217C1.27696 0 0 1.27696 0 2.85217V19.9652C0 21.5404 1.27696 22.8173 2.85217 22.8173H19.9652C21.5404 22.8173 22.8173 21.5404 22.8173 19.9652V2.85217C22.8173 1.27696 21.5404 0 19.9652 0Z" fill="#18181B"/>
          <path className="preloader__mark" d="M11.5447 11.0658L16.8498 7.54338L14.6465 3.75L5.96875 9.24042L5.99014 9.27607C5.99014 9.27607 5.97588 9.27607 5.96875 9.27607V13.6613C8.89222 13.6613 11.2667 16.0928 11.2667 19.0733H15.6519C15.6519 15.7719 14.0261 12.8484 11.5447 11.0729V11.0658Z" fill="#CEFF3E"/>
        </svg>
      </div>
      <div className="preloader__bar">
        <div className="preloader__bar-fill" />
      </div>
      <div className="preloader__powered">
        <img src={`${import.meta.env.BASE_URL}powered-by-white.svg`} alt="Wykonał remedium" />
      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useTheme();
  const [profile, setProfile] = useProfile();
  const [onboarded, setOnboarded] = useState(() => {
    try { const s = localStorage.getItem(PROFILE_KEY); return s ? !!JSON.parse(s).role : false; } catch { return false; }
  });
  const [loading,   setLoading]   = useState(true);
  const [active,    setActive_]   = useState("overview");
  const [navKey,    setNavKey]    = useState(0);
  const [cart,      setCart]      = useState([]);
  const [cartOpen,  setCartOpen]  = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unlockedDiscounts, setUnlockedDiscounts] = useState(new Set());
  const unlockDiscount = (id) => setUnlockedDiscounts(prev => new Set(prev).add(id));

  // ─── Lekarz Przedsiębiorca — subskrypcja użytkownika ─────────────────────
  // Default: pre-sale konfigurator ustawiony na "najbardziej opłacalną" konfigurację
  // (rocznie + 5k Lloyd's + inFakt ON). Demo toggle z LPHero może przełączyć na post-sale.
  const [lpSub, setLpSub] = useState({
    active: false,
    billing: "rok",
    lloydSum: 5000,
    infaktAddon: true,
    activatedAt: null,
    nextRenewal: null,
  });

  // ─── Usługi 3 (ekosystem) — indywidualnie aktywowane usługi ──────────────
  // Odrębne od LP — user może mieć np. tylko Lloyd's solo, bez pakietu.
  // Gdy lpSub.active === true, LP_CORE_IDS są traktowane jako aktywne implicite.
  const [activeServices, setActiveServices] = useState(new Set());
  const toggleActiveService = (id) => {
    setActiveServices(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ─── Moje usługi — kupione usługi z parametrami per typ ───────────────────
  // Seed dla demo: Lloyd's + inFakt kupione miesiąc temu. Real flow: purchaseService()
  // wywołane z ServiceDetailView lub po checkoucie koszyka.
  const [purchasedServices, setPurchasedServices] = useState({
    lloyds: {
      id: "lloyds",
      status: "active",
      purchasedAt: "12 mar 2026",
      params: { sum: 5000, waitPeriod: 14, billing: "miesiąc" },
      nextRenewal: "12 kwi 2026",
      docs: [
        { name: "Polisa Lloyd's — 2026.pdf", date: "12 mar 2026", size: "412 KB" },
        { name: "OWU utrata dochodu.pdf", date: "12 mar 2026", size: "218 KB" },
      ],
    },
    infakt: {
      id: "infakt",
      status: "active",
      purchasedAt: "12 mar 2026",
      params: { plan: "Firma +", billing: "miesiąc" },
      nextRenewal: "12 kwi 2026",
      docs: [
        { name: "Umowa o świadczenie usług księgowych.pdf", date: "12 mar 2026", size: "156 KB" },
      ],
    },
  });

  const purchaseService = (id, params = {}) => {
    setPurchasedServices(prev => ({
      ...prev,
      [id]: {
        id,
        status: "active",
        purchasedAt: new Date().toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" }),
        params,
        nextRenewal: null,
        docs: [],
      },
    }));
  };
  const cancelService = (id) => {
    setPurchasedServices(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };
  const updateServiceParams = (id, patch) => {
    setPurchasedServices(prev => ({
      ...prev,
      [id]: { ...prev[id], params: { ...prev[id].params, ...patch } },
    }));
  };

  // Pending deep-link: Service4Card "Zarządzaj" → sub-tab "Moje usługi" + otwórz panel
  const [pendingManageId, setPendingManageId] = useState(null);
  const openManageService = (id) => {
    setPendingManageId(id);
    setActive("packages4");
  };

  const setActive = (id) => { setActive_(id); setNavKey(k => k + 1); };

  const addToCart = (product, variant, options = {}) => {
    setCart(prev => {
      // Key includes contractMonths and services so same product with different config = separate item
      const keyParts = [product.id];
      if (variant?.selections) keyParts.push(JSON.stringify(variant.selections));
      if (variant?.contractMonths) keyParts.push("m" + variant.contractMonths);
      if (variant?.selectedServices?.length) keyParts.push("s" + variant.selectedServices.sort().join(","));
      const key = keyParts.join("|");
      const existing = prev.find(i => i.key === key);
      if (existing) return prev;
      const isOneTime = !product.monthlyNet && !product.pricing;
      const priceNet = variant && variant.computedNet ? variant.computedNet : (product.monthlyNet || 0);
      const priceGross = variant && variant.computedGross ? variant.computedGross : (product.monthlyGross || 0);
      const oneTimePrice = isOneTime ? parseFloat((product.price || "0").replace(/[^\d]/g, "")) : 0;
      return [...prev, { key, product, variant, qty: 1, priceNet, priceGross, isOneTime, oneTimePrice }];
    });
    // silent=true for Services2 where reveal UI lives in the view itself
    if (!options.silent) setCartOpen(true);
  };

  const removeFromCart = (key) => setCart(prev => prev.filter(i => i.key !== key));
  const updateQty = (key, delta) => setCart(prev => prev.map(i => {
    if (i.key !== key) return i;
    const newQty = i.qty + delta;
    return newQty > 0 ? { ...i, qty: newQty } : i;
  }).filter(i => i.qty > 0));

  /* ── Hide topbar on scroll down, show on scroll up ── */
  const [topbarHidden, setTopbarHidden] = useState(false);
  const scrollRef = useRef(null);
  const lastScrollY = useRef(0);
  const scrollAccum = useRef(0);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const THRESHOLD = 30;
    const onScroll = () => {
      const y = el.scrollTop;
      const delta = y - lastScrollY.current;
      if (y <= 48) { setTopbarHidden(false); scrollAccum.current = 0; }
      else if (delta > 0) { scrollAccum.current = 0; setTopbarHidden(true); }
      else { scrollAccum.current += Math.abs(delta); if (scrollAccum.current > THRESHOLD) setTopbarHidden(false); }
      lastScrollY.current = y;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [loading, onboarded]);

  if (loading) return <Preloader onDone={() => setLoading(false)} />;
  if (!onboarded) return <Onboarding onComplete={() => setOnboarded(true)} setProfile={setProfile} />;

  const View = VIEWS[active] || Overview;

  return (
    <div className="app-layout">
      <Sidebar active={active} setActive={setActive} theme={theme} setTheme={setTheme} profile={profile} />
      <div className={`main${topbarHidden ? " main--topbar-hidden" : ""}`}>
        <TopBar active={active} setActive={setActive} cart={cart} onCartClick={() => setCartOpen(true)} onNotifClick={() => setNotifOpen(true)} theme={theme} setTheme={setTheme} />
        <main className="main__content" ref={scrollRef}>
          <View key={navKey} setActive={setActive} addToCart={addToCart} cart={cart} removeFromCart={removeFromCart} profile={profile} setProfile={setProfile} unlockedDiscounts={unlockedDiscounts} unlockDiscount={unlockDiscount} lpSub={lpSub} setLpSub={setLpSub} activeServices={activeServices} toggleActiveService={toggleActiveService} purchasedServices={purchasedServices} purchaseService={purchaseService} cancelService={cancelService} updateServiceParams={updateServiceParams} openManageService={openManageService} pendingManageId={pendingManageId} setPendingManageId={setPendingManageId} />
        </main>
      </div>
      {notifOpen && <NotificationsDrawer onClose={() => setNotifOpen(false)} profile={profile} />}
      {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} removeFromCart={removeFromCart} updateQty={updateQty} profile={profile} priceMode="business" onProductClick={(item, cat) => { setCartOpen(false); openProduct(item, cat); }} onGoToShop={() => { setCartOpen(false); setActive("shop"); }} />}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
