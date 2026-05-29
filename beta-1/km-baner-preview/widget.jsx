const { useEffect, useLayoutEffect, useRef, useState } = React;

const OFFERS = [
  {
    kind: 'oc',
    brand: { label: 'ERGO\nHESTIA', bg: '#FFFFFF', fg: '#DC2626', border: '#E4E4E7' },
    title: 'OC zawodowe od 89 zł/mies.',
    sub: 'Obowiązkowe — klasa ryzyka automatycznie z NIL.',
  },
  {
    kind: 'event',
    brand: { label: 'POZ\n26', bg: '#CEFF3E', fg: '#0A0A0A', border: 'transparent' },
    title: 'POZ Wiosna 26 — start za 2 dni',
    sub: 'Bezpłatny dostęp do live & nagrań w pakiecie.',
  },
  {
    kind: 'gabinet',
    brand: { label: 'Wirtualny\ngabinet', bg: '#2E35FF', fg: '#FFFFFF', border: 'transparent' },
    title: 'Wirtualny gabinet — 29 zł/mies.',
    sub: 'Recepty, konsultacje, druki — w jednym miejscu.',
  },
  {
    kind: 'sport',
    brand: { label: 'Medicover\nSport', bg: '#0E7490', fg: '#FFFFFF', border: 'transparent' },
    title: 'MedicoverSport w cenie pakietu',
    sub: 'Dostęp do 4 500+ obiektów sportowych w Polsce.',
  },
  {
    kind: 'ksiegowosc',
    brand: { label: 'inFakt', bg: '#FB923C', fg: '#FFFFFF', border: 'transparent' },
    title: 'inFakt — księgowość online dla lekarzy',
    sub: 'Faktury, rozliczenia, podatki — bez papierologii.',
  },
  {
    kind: 'uod',
    brand: { label: "Lloyd's\nLeadenhall", bg: '#1E3A8A', fg: '#FBBF24', border: 'transparent' },
    title: "UD Lloyd's/Leadenhall — OC premium",
    sub: 'Najwyższy poziom ochrony dla specjalistów.',
  },
  {
    kind: 'tech',
    brand: { label: 'iPhone\n17 Pro', bg: '#0A0A0A', fg: '#FFFFFF', border: 'transparent' },
    title: 'iPhone 17 Pro w racie 89 zł/mies.',
    sub: 'Finansowanie LP × Klub Medyka — bez prowizji.',
  },
  {
    kind: 'shop',
    brand: { label: 'KM\nShop', bg: '#10B981', fg: '#FFFFFF', border: 'transparent' },
    title: 'Rabaty do −30% w klubmedyka.store',
    sub: 'Sprzęt, gadżety, akcesoria — tylko dla członków.',
  },
  {
    kind: 'finance',
    brand: { label: 'Kredyt\nLP', bg: '#E879F9', fg: '#FFFFFF', border: 'transparent' },
    title: 'Kredyt LP — 8,9% RRSO',
    sub: 'Ekskluzywna stawka dla lekarzy przez Klub Medyka.',
  },
  {
    kind: 'offer',
    brand: { label: 'Nowe\noferty', bg: '#5B63FF', fg: '#FFFFFF', border: 'transparent' },
    title: '3 nowe oferty w tym tygodniu',
    sub: 'Sprawdź co dodali nasi partnerzy.',
  },
];

const ROTATION_MS = 3800;
const HREF = 'https://klubmedyka.pl';

const TEASERS = [
  '2 nowe oferty',
  'Już za 2 dni',
  'OC od 89 zł',
  'Gabinet 29 zł',
  'MedicoverSport',
  'Księgowość inFakt',
  "Lloyd's premium",
  '−30% rabaty',
  'iPhone od 89 zł',
];

const DEFAULT_LABEL = 'Klub Medyka';
const DEFAULT_DURATION_MS = 1600;
const TEASER_DURATION_MS = 2000;

const sygnetPath = "M11.5447 11.0658L16.8498 7.54338L14.6465 3.75L5.96875 9.24042L5.99014 9.27607C5.99014 9.27607 5.97588 9.27607 5.96875 9.27607V13.6613C8.89222 13.6613 11.2667 16.0928 11.2667 19.0733H15.6519C15.6519 15.7719 14.0261 12.8484 11.5447 11.0729V11.0658Z";

function Sygnet({ size = 16, color = '#0A0A0A' }) {
  return (
    <svg viewBox="0 0 23 23" width={size} height={size} aria-hidden="true">
      <path d={sygnetPath} fill={color} />
    </svg>
  );
}

function KlubMedykaHoverWidget({ href = HREF, items = OFFERS, intervalMs = ROTATION_MS, teasers = TEASERS }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [labelStep, setLabelStep] = useState(0);
  const closeTimer = useRef(null);

  useEffect(() => {
    const t = window.setInterval(() => {
      setIndex(i => (i + 1) % items.length);
    }, intervalMs);
    return () => window.clearInterval(t);
  }, [items.length, intervalMs]);

  useEffect(() => {
    if (open) return undefined;
    const showingDefault = labelStep % 2 === 0;
    const duration = showingDefault ? DEFAULT_DURATION_MS : TEASER_DURATION_MS;
    const t = window.setTimeout(() => setLabelStep(s => s + 1), duration);
    return () => window.clearTimeout(t);
  }, [labelStep, open]);

  const showingDefault = open || labelStep % 2 === 0;
  const teaserIdx = Math.floor(labelStep / 2) % teasers.length;
  const currentLabel = showingDefault ? DEFAULT_LABEL : teasers[teaserIdx];
  const pulseKey = `pulse-${labelStep}`;

  const allLabels = [DEFAULT_LABEL, ...teasers];
  const currentLabelIdx = showingDefault ? 0 : teaserIdx + 1;
  const measureRefs = useRef([]);
  const [widths, setWidths] = useState([]);

  useLayoutEffect(() => {
    const next = measureRefs.current.map(el => (el ? Math.ceil(el.getBoundingClientRect().width) : 0));
    setWidths(next);
  }, []);

  const currentWidth = widths[currentLabelIdx];

  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  const current = items[index];

  return (
    <span
      style={{ position: 'relative', display: 'inline-block', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
      onFocus={() => { cancelClose(); setOpen(true); }}
      onBlur={scheduleClose}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          height: 32,
          paddingLeft: 4,
          paddingRight: 12,
          borderRadius: 999,
          background: '#0A0A0A',
          color: '#FFFFFF',
          textDecoration: 'none',
          boxShadow: '0 1px 2px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.04)',
          transition: 'transform 200ms ease, box-shadow 200ms ease',
          cursor: 'pointer',
          transform: open ? 'scale(1.02)' : 'scale(1)',
        }}
      >
        <span
          style={{
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 24, height: 24, flexShrink: 0, borderRadius: '50%', background: '#CEFF3E',
          }}
        >
          <Sygnet size={16} color="#0A0A0A" />
          {!showingDefault && (
            <span
              key={pulseKey}
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                animation: 'km-pulse 900ms ease-out 1',
                pointerEvents: 'none',
              }}
            />
          )}
        </span>
        <span
          style={{
            position: 'relative',
            display: 'inline-block',
            height: 14,
            overflow: 'hidden',
            width: currentWidth ? `${currentWidth}px` : 'auto',
            transition: 'width 320ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {allLabels.map((label, i) => {
            const isActive = i === currentLabelIdx;
            return (
              <span
                key={`lbl-${i}`}
                ref={el => { measureRefs.current[i] = el; }}
                aria-hidden={isActive ? 'false' : 'true'}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  whiteSpace: 'nowrap',
                  fontSize: 13,
                  fontWeight: 500,
                  lineHeight: 1,
                  color: i === 0 ? '#FFFFFF' : '#CEFF3E',
                  opacity: isActive ? 1 : 0,
                  transform: `translateY(${isActive ? 0 : 8}px)`,
                  transition: 'opacity 280ms cubic-bezier(0.22, 1, 0.36, 1), transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
                  pointerEvents: isActive ? 'auto' : 'none',
                }}
              >
                {label}
              </span>
            );
          })}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', color: 'rgba(255,255,255,0.7)', marginLeft: 2 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </span>
      </a>

      <div
        aria-hidden={open ? 'false' : 'true'}
        style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          right: 0,
          width: 360,
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0)' : 'translateY(-6px)',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 200ms cubic-bezier(0.22, 1, 0.36, 1), transform 200ms cubic-bezier(0.22, 1, 0.36, 1)',
          zIndex: 50,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: 'absolute', top: -6, right: 16, width: 12, height: 12,
            background: '#FFFFFF', transform: 'rotate(45deg)',
            border: '1px solid #E4E4E7', borderRight: 'none', borderBottom: 'none',
            borderTopLeftRadius: 2,
          }}
        />

        <div
          style={{
            position: 'relative',
            background: '#FFFFFF',
            borderRadius: 18,
            border: '1px solid #E4E4E7',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.12), 0 8px 16px -6px rgba(0,0,0,0.06)',
            padding: '14px 14px 10px',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 22, height: 22, borderRadius: '50%', background: '#0A0A0A',
                }}
              >
                <Sygnet size={14} color="#CEFF3E" />
              </span>
              <span
                style={{
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: '#52525B',
                }}
              >
                W klubie możesz mieć
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 28, height: 4, borderRadius: 999, background: '#0A0A0A', display: 'inline-block' }} />
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#D4D4D8', display: 'inline-block' }} />
              <span style={{ display: 'inline-flex', width: 14, height: 14, alignItems: 'center', justifyContent: 'center', color: '#71717A' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </span>
            </div>
          </div>

          <div style={{ position: 'relative', minHeight: 64 }}>
            {items.map((item, i) => {
              const isActive = i === index;
              return (
                <div
                  key={item.kind}
                  aria-hidden={isActive ? 'false' : 'true'}
                  style={{
                    position: isActive ? 'relative' : 'absolute',
                    inset: isActive ? 'auto' : 0,
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    opacity: isActive ? 1 : 0,
                    transform: `translateY(${isActive ? 0 : 6}px)`,
                    transition: 'opacity 280ms cubic-bezier(0.22, 1, 0.36, 1), transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
                    pointerEvents: isActive ? 'auto' : 'none',
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      background: item.brand.bg,
                      color: item.brand.fg,
                      border: `1px solid ${item.brand.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                      lineHeight: 1.15,
                      textAlign: 'center',
                      whiteSpace: 'pre-line',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {item.brand.label}
                  </div>
                  <div style={{ minWidth: 0, flex: 1, paddingTop: 2 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.25, color: '#0A0A0A' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 400, lineHeight: 1.4, color: '#52525B', marginTop: 4 }}>
                      {item.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid #F4F4F5' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {items.map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: i === index ? 14 : 4,
                    height: 4,
                    borderRadius: 999,
                    background: i === index ? '#0A0A0A' : '#E4E4E7',
                    transition: 'width 240ms ease, background 240ms ease',
                  }}
                />
              ))}
            </div>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 12, fontWeight: 600, color: '#0A0A0A', textDecoration: 'none',
              }}
            >
              Zobacz ofertę
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes km-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(206,255,62,0.55); }
          70%  { box-shadow: 0 0 0 10px rgba(206,255,62,0); }
          100% { box-shadow: 0 0 0 0 rgba(206,255,62,0); }
        }
      `}</style>
    </span>
  );
}

const widgetMount = document.getElementById('widget-mount');
if (widgetMount) {
  ReactDOM.createRoot(widgetMount).render(<KlubMedykaHoverWidget />);
}
