import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

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
    id: "devices", label: "Sprzęt i elektronika", color: "var(--color-secondary)",
    items: [
      { id: "iphone15", brand: "Apple",  model: "iPhone 15 Pro",      desc: "Smartfon · 256 GB · Tytan naturalny",     monthlyNet: 167.83, monthlyGross: 206.43, contractMonths: 12, emoji: "📱", badge: "Nowość",
        photo: "zdjecia-produktow/iphone15-nat-front.jpg",
        images: [
          { url: "zdjecia-produktow/iphone15-nat-front.jpg", label: "Przód" },
          { url: "zdjecia-produktow/iphone15-nat-back.jpg", label: "Tył" },
          { url: "zdjecia-produktow/iphone15-nat-side.jpg", label: "Bok" },
        ],
        fullDesc: "iPhone 15 Pro z chipem A17 Pro. Tytanowa konstrukcja, najlżejszy iPhone Pro w historii. Kamera 48 MP z 5-krotnym zoomem optycznym. Przycisk Czynność do szybkiego dostępu do ulubionych funkcji. USB-C z obsługą USB 3.",
        variants: [
          { group: "Pamięć wbudowana", options: [
            { label: "128 GB", diff: -22, default: false },
            { label: "256 GB", diff: 0, default: true },
            { label: "512 GB", diff: 35 },
            { label: "1 TB", diff: 78 },
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
        photo: "https://klubmedyka.store/8275-home_default/apple-iphone-17-pro-max-256gb-glebinowy-blekit.jpg",
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "iphone17pro", brand: "Apple", model: "iPhone 17 Pro", desc: "Smartfon · 256 GB · Kosmiczny pomarańcz", monthlyNet: 167.83, monthlyGross: 206.43, contractMonths: 12, emoji: "📱",
        photo: "https://klubmedyka.store/8231-home_default/apple-iphone-17-pro-256gb-kosmiczny-pomarancz.jpg",
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "iphone17", brand: "Apple", model: "iPhone 17", desc: "Smartfon · 256 GB · Szałwia", monthlyNet: 116.99, monthlyGross: 143.90, contractMonths: 12, emoji: "📱",
        photo: "https://klubmedyka.store/8175-home_default/apple-iphone-17-256gb-szalwia.jpg",
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "galaxy-z-fold7", brand: "Samsung", model: "Galaxy Z Fold7", desc: "Składany · 12/256 GB · Srebrny", monthlyNet: 264.58, monthlyGross: 325.43, contractMonths: 12, emoji: "📱", badge: "Nowość",
        photo: "https://klubmedyka.store/7972-home_default/samsung-galaxy-z-fold7-12-256gb-srebrny.jpg",
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "galaxy-s25-ultra", brand: "Samsung", model: "Galaxy S25 Ultra 5G", desc: "Smartfon · 12/256 GB · Tytan czarny", monthlyNet: 176.20, monthlyGross: 216.73, contractMonths: 12, emoji: "📱",
        photo: "https://klubmedyka.store/6176-home_default/samsung-galaxy-s25-ultra-5g-12256gb-tytan-czarny.jpg",
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "galaxy-z-flip6", brand: "Samsung", model: "Galaxy Z Flip 6 5G", desc: "Składany · 12/256 GB · Miętowy", monthlyNet: 156.22, monthlyGross: 192.15, contractMonths: 12, emoji: "📱",
        photo: "https://klubmedyka.store/7257-home_default/samsung-galaxy-z-flip-6-5g-12-256gb-szary.jpg",
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "macbook-pro-m4", brand: "Apple", model: "MacBook Pro 14\" M4", desc: "Laptop · 16 GB RAM · 512 GB SSD", monthlyNet: 236.07, monthlyGross: 290.37, contractMonths: 12, emoji: "💻", badge: "Nowość",
        photo: "https://klubmedyka.store/5658-home_default/macbook-pro-14-m4-16gb-ram-512gb-ssd-srebrny.jpg",
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "macbook-pro-16-m4pro", brand: "Apple", model: "MacBook Pro 16\" M4 Pro", desc: "Laptop · 24 GB RAM · 512 GB SSD", monthlyNet: 378.61, monthlyGross: 465.69, contractMonths: 12, emoji: "💻",
        photo: "https://klubmedyka.store/5666-home_default/macbook-pro-16-m4-pro-24gb-ram-512gb-ssd-srebrny.jpg",
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "ipad-air-m3", brand: "Apple", model: "iPad Air M3 11\"", desc: "Tablet · 256 GB · Wi-Fi", monthlyNet: 99.23, monthlyGross: 122.05, contractMonths: 12, emoji: "📲",
        photo: "https://klubmedyka.store/7889-home_default/tablet-apple-ipad-pro-2024-11-m4-256gb-wi-fi-srebrny.jpg",
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "apple-watch-11", brand: "Apple", model: "Watch Series 11", desc: "Smartwatch · GPS · 46 mm · Srebrny", monthlyNet: 63.32, monthlyGross: 77.88, contractMonths: 12, emoji: "⌚",
        photo: "https://klubmedyka.store/8389-home_default/apple-watch-11-gps-46mm-koperta-z-aluminium-srebrny-pasek-sportowy-ml.jpg",
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "apple-watch-ultra3", brand: "Apple", model: "Watch Ultra 3", desc: "Smartwatch · GPS+Cellular · 49 mm · Tytan", monthlyNet: 111.34, monthlyGross: 136.95, contractMonths: 12, emoji: "⌚", badge: "Premium",
        photo: "https://klubmedyka.store/8335-home_default/apple-watch-ultra-3-gps-cellular-49mm-koperta-tytanowa-naturalny-opaska-trail-ml.jpg",
        delivery: "Wysyłka w 1 dzień roboczy",
      },
      { id: "ps5-digital", brand: "Sony", model: "PlayStation 5 Digital Slim", desc: "Konsola · 1 TB · bez napędu", monthlyNet: 73.57, monthlyGross: 90.49, contractMonths: 12, emoji: "🎮",
        photo: "https://klubmedyka.store/5874-home_default/konsola-sony-playstation-5-digital-slim-d-chassis-1tb.jpg",
        delivery: "Wysyłka w 1–2 dni robocze",
      },
      { id: "nintendo-switch2", brand: "Nintendo", model: "Switch 2", desc: "Konsola przenośna · nowa generacja", monthlyNet: 70.72, monthlyGross: 86.99, contractMonths: 12, emoji: "🎮", badge: "Nowość",
        photo: "https://klubmedyka.store/7636-home_default/nintendo-switch-oled-white.jpg",
        delivery: "Wysyłka w 1–2 dni robocze",
      },
      { id: "gopro-hero13", brand: "GoPro", model: "HERO 13 Black", desc: "Kamera sportowa · 5.3K · Wi-Fi", monthlyNet: 55.04, monthlyGross: 67.70, contractMonths: 12, emoji: "📷",
        photo: "https://klubmedyka.store/7899-home_default/kamera-sportowa-gopro-hero-13-black.jpg",
        delivery: "Wysyłka w 1–2 dni robocze",
      },
      { id: "garmin-fenix8", brand: "Garmin", model: "Fenix 8 47mm AMOLED", desc: "Smartwatch · Szafirowe szkło · Tytanowy", monthlyNet: 142.82, monthlyGross: 175.67, contractMonths: 12, emoji: "⌚",
        photo: "https://klubmedyka.store/7744-home_default/smartwatch-garmin-fenix-8-43-mm-amoled-srebrny-z-paskiem-silikonowym-w-kolorze-whitestone.jpg",
        delivery: "Wysyłka w 1–2 dni robocze",
      },
      { id: "xiaomi-vacuum-x20", brand: "Xiaomi", model: "Robot Vacuum X20+", desc: "Robot sprzątający · stacja dokująca", monthlyNet: 76.39, monthlyGross: 93.96, contractMonths: 12, emoji: "🤖",
        photo: "https://klubmedyka.store/7631-home_default/xiaomi-robot-vacuum-x20-max-czarny.jpg",
        delivery: "Wysyłka w 1–2 dni robocze",
      },
      { id: "macbook-air-m4", brand: "Apple", model: "MacBook Air 15\" M4", desc: "Laptop · 32 GB RAM · 1 TB SSD", monthlyNet: 270.93, monthlyGross: 333.24, contractMonths: 12, emoji: "💻", badge: "Nowość",
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
  { id: "mooveno", brand: "Mooveno", model: "Elastyczny wynajem", desc: "Od 1 miesi\u0105ca \u00b7 r\u00f3\u017cne marki", price: "od 1 800 z\u0142/mies.", priceOld: null, priceNote: "Rata netto", emoji: "🔑", photo: "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=600&h=450&fit=crop",
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
      { id: "cars",        label: "Samochody",     icon: "cars" },
      { id: "discounts",   label: "Zniżki",        icon: "discounts" },
      { id: "packages",    label: "Usługi",        icon: "packages", soon: true },
      { id: "advisors",    label: "Twoi doradcy",  icon: "advisors"  },
      { id: "investments", label: "Inwestycje",    icon: "investments", soon: true },
      { id: "insurance",   label: "Ubezpieczenia", icon: "insurance", soon: true },
    ],
  },
  {
    header: "Konto",
    items: [
      { id: "profile", label: "Mój profil", icon: "profile", badge: 2 },
    ],
  },
];

const INSURANCE_CATEGORIES = [
  { id: "oc",     name: "OC lekarskie",   icon: "shield", tag: "Obowiązkowe", tagVariant: "red",  priceLabel: "od 69 zł/mies.",    desc: "Odpowiedzialność cywilna za błędy w sztuce lekarskiej. Wymagane prawnie.", noMissing: false },
  { id: "income", name: "Utrata dochodu", icon: "wallet", tag: "Zalecane",    tagVariant: "warn", priceLabel: "~80–350 zł/mies.",  desc: "Ochrona przychodu przy chorobie lub wypadku.", noMissing: false },
  { id: "life",   name: "Na życie",       icon: "heart",  tag: null,          tagVariant: null,   priceLabel: "~60–400 zł/mies.",  desc: "Ochrona rodziny na wypadek śmierci lub niezdolności do pracy.", noMissing: false },
  { id: "travel", name: "Podróże",        icon: "plane",  tag: "Wkrótce",     tagVariant: "muted", priceLabel: "od 19 zł/mies.",   desc: "Roczna polisa — podróże prywatne i konferencje medyczne.", provider: "INTER", noMissing: true, disabled: true },
  { id: "other",  name: "Inne",           icon: "list",   tag: null,          tagVariant: null,   priceLabel: null,                desc: "NNW, mieszkanie, auto, OC prywatne.", noMissing: true },
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
  { name: "PZU",                 logo: "ubezpieczenia/loga/PZU_logo.png",   h: 36 },
  { name: "Ergo Hestia",        logo: "ubezpieczenia/loga/ergohestia.png",  h: 34 },
  { name: "INTER Ubezpieczenia", logo: "ubezpieczenia/loga/inter logo.webp", h: 26 },
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
    <div className="onboarding">
      <div className="onboarding__inner">

        {/* Logo */}
        <div className="onboarding__logo">
          <img src="Logo.png" alt="Klub Medyka" />
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
              <Btn variant="outline" onClick={() => { setProfile({ ...DEFAULT_PROFILE, role: "specialist", work: ["private"], firstName: "Anna", lastName: "Kowalska" }); onComplete(); }}>Mam już konto</Btn>
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
            <Btn variant="primary" onClick={() => {
              setProfile({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, pwz: form.pwz, role: form.role, work: form.work, interests: [] });
              onComplete();
            }} className="btn--full btn--lg">
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

function Sidebar({ active, setActive, theme, setTheme, profile }) {
  const displayName = profile && profile.firstName ? `Dr ${profile.firstName} ${profile.lastName}` : "Dr Kowalska";
  const roleLabel = profile && profile.role ? (OB_ROLES.find(r => r.id === profile.role)?.label || "") : "Rezydent";
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__header">
        <div className="sidebar__logo" onClick={() => setActive("overview")} style={{ cursor: "pointer" }}>
          <img src="Logo.png" alt="Klub Medyka" />
        </div>
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
                  {item.tag && (
                    <span className="sidebar__tag">{item.tag}</span>
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

      <ThemeToggle theme={theme} setTheme={setTheme} />

      {/* User profile */}
      <div className="sidebar__profile" onClick={() => setActive("profile")}>
        <img className="sidebar__profile-avatar" src={USER_AVATAR} alt={displayName} />
        <div className="sidebar__profile-info">
          <div className="sidebar__profile-name">{displayName}</div>
          <div className="sidebar__profile-role">{roleLabel}</div>
        </div>
      </div>
    </aside>
  );
}

// ─── TOP BAR ──────────────────────────────────────────────────────────────────

function TopBar({ active, setActive, cart, onCartClick }) {
  const label = NAV_SECTIONS.flatMap(s => s.items).find(i => i.id === active)?.label || "";
  const cartCount = cart ? cart.reduce((s, i) => s + i.qty, 0) : 0;
  return (
    <header className="topbar">
      <span className="topbar__title">{label}</span>
      <div className="topbar__actions">
        <button className="topbar__icon-btn" onClick={() => setActive("profile")} title="Profil">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="20" fill="var(--color-secondary)"/>
            <path d="M24.6668 26V24.6667C24.6668 23.9594 24.3859 23.2811 23.8858 22.781C23.3857 22.281 22.7074 22 22.0002 22H18.0002C17.2929 22 16.6146 22.281 16.1145 22.781C15.6144 23.2811 15.3335 23.9594 15.3335 24.6667V26M22.6668 16.6667C22.6668 18.1394 21.4729 19.3333 20.0002 19.3333C18.5274 19.3333 17.3335 18.1394 17.3335 16.6667C17.3335 15.1939 18.5274 14 20.0002 14C21.4729 14 22.6668 15.1939 22.6668 16.6667Z" stroke="var(--color-fg)" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="topbar__icon-btn" title="Powiadomienia">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="20" fill="var(--color-secondary)"/>
            <path d="M18.8667 26.0002C18.9783 26.2031 19.1423 26.3724 19.3417 26.4903C19.5411 26.6082 19.7684 26.6704 20 26.6704C20.2316 26.6704 20.459 26.6082 20.6584 26.4903C20.8577 26.3724 21.0218 26.2031 21.1334 26.0002M16 17.3335C16 16.2726 16.4214 15.2552 17.1716 14.5051C17.9217 13.7549 18.9391 13.3335 20 13.3335C21.0609 13.3335 22.0783 13.7549 22.8284 14.5051C23.5786 15.2552 24 16.2726 24 17.3335C24 22.0002 26 23.3335 26 23.3335H14C14 23.3335 16 22.0002 16 17.3335Z" stroke="var(--color-fg)" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="topbar__notification-dot" />
        </button>
        <button className="topbar__icon-btn topbar__cart-btn" onClick={onCartClick} title="Koszyk">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="20" fill="var(--color-secondary)"/>
            <path d="M13.3667 13.3667H14.7L16.4734 21.6467C16.5384 21.9499 16.7071 22.221 16.9505 22.4133C17.1939 22.6055 17.4966 22.7069 17.8067 22.7H24.3267C24.6301 22.6995 24.9244 22.5956 25.1607 22.4053C25.3971 22.215 25.5615 21.9497 25.6267 21.6534L26.7267 16.7H15.4134M18.0002 26C18.0002 26.3682 17.7017 26.6667 17.3335 26.6667C16.9653 26.6667 16.6668 26.3682 16.6668 26C16.6668 25.6318 16.9653 25.3333 17.3335 25.3333C17.7017 25.3333 18.0002 25.6318 18.0002 26ZM25.3335 26C25.3335 26.3682 25.035 26.6667 24.6668 26.6667C24.2986 26.6667 24.0002 26.3682 24.0002 26C24.0002 25.6318 24.2986 25.3333 24.6668 25.3333C25.035 25.3333 25.3335 25.6318 25.3335 26Z" stroke="var(--color-fg)" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {cartCount > 0 && <span className="topbar__cart-badge">{cartCount}</span>}
        </button>
        <a href="https://remedium.md" target="_blank" rel="noopener noreferrer" className="topbar__remedium">
          <svg className="topbar__remedium-avatar" width="24" height="24" viewBox="0 0 24 24" fill="none">
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

function Overview({ setActive, profile, setProfile }) {
  const [contactDropdown, setContactDropdown] = useState(null);
  const [contactBooked, setContactBooked] = useState({});
  const [advisorQuestions, setAdvisorQuestions] = useState({});
  const [selectedDiscount, setSelectedDiscount] = useState(null);

  const toggleInterest = (id) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(id) ? prev.interests.filter(x => x !== id) : [...prev.interests, id],
    }));
  };

  const personalizedDiscounts = useMemo(() => getPersonalizedDiscounts(profile), [profile]);
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
          Dzień dobry,<br />dr {displayName}.
        </h1>
        {roleLabel && (
          <div className="text-sm text-muted" style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--color-accent)", flexShrink: 0 }} />
            {roleLabel}
          </div>
        )}
      </div>




      {/* 5. Co Cię interesuje? */}
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

      {/* 6. Personalized discounts */}
      {personalizedDiscounts.length > 0 && (
        <div>
          <SectionHeader title="Dopasowane zniżki" action="Wszystkie" onAction={() => setActive("discounts")} />
          <div className="discount-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {personalizedDiscounts.map(d => (
              <div key={d.id} className="discount-card" onClick={() => setSelectedDiscount(d)}>
                <div className="discount-card__hero">
                  <img src={d.hero} alt={d.partner} className="discount-card__hero-img" />
                  <span className="discount-card__badge">{d.badge}</span>
                </div>
                <div className="discount-card__body">
                  <img src={d.logo} alt={d.partner} className="discount-card__logo" />
                  <div className="discount-card__title">{d.title}</div>
                </div>
              </div>
            ))}
          </div>
          {selectedDiscount && <DiscountDrawer discount={selectedDiscount} onClose={() => setSelectedDiscount(null)} />}
        </div>
      )}

      {/* 7. Recommended products */}
      {recommendedProducts.length > 0 && (
        <div>
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
        </div>
      )}

      {/* 8. Advisors */}
      <div>
        <SectionHeader title="Twoi doradcy" />
        <div className="advisor-grid">
          {relevantAdvisors.map(a => {
            const openId = contactDropdown === a.id;
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
                </div>
                {a.tags && a.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {a.tags.map(t => (
                      <span key={t} className="advisor-tag">{t}</span>
                    ))}
                  </div>
                )}
                <a href={`tel:${a.phone}`} className="advisor-tile__phone">{a.phone}</a>
                <div style={{ position: "relative" }}>
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
                      <button className="btn btn--outline btn--sm contact-request-btn" onClick={() => setContactDropdown(openId ? null : a.id)}>
                        Zamów kontakt
                      </button>
                    </React.Fragment>
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


      {/* 10. Cars spotlight (conditional) */}
      {showCars && CARS_CATALOG.length > 0 && (
        <div>
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
        </div>
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

  const selectVariant = (group, label) => {
    setVariantSel(prev => ({ ...prev, [group]: label }));
  };

  // ─── Price helpers ───
  const fmtMonthly = (n) => n.toFixed(2).replace(".", ",") + " zł";
  const fmtDiff = (n) => n > 0 ? ("+" + fmtMonthly(n)) : n < 0 ? ("−" + fmtMonthly(Math.abs(n))) : null;

  // ─── Computed monthly price from variants ───
  let totalDiff = 0;
  if (p.variants) {
    p.variants.forEach(v => {
      const sel = variantSel[v.group];
      const opt = v.options.find(o => o.label === sel);
      if (opt) totalDiff += (opt.diff || 0);
    });
  }
  const computedNet = (p.monthlyNet || 0) + totalDiff;
  const computedGross = (p.monthlyGross || 0) + Math.round(totalDiff * 1.23 * 100) / 100;
  const contractMonths = p.contractMonths || 12;

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
                <div className="pdp__image-main" style={{ background: current.url ? "var(--color-secondary)" : imageBg, transition: "background 0.3s ease" }}>
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
          </div>
          <p className="pdp__desc-short">{subtitle}</p>

          {/* Variant configurator */}
          {p.variants && p.variants.length > 0 && (
            <div className="pdp__configurator">
              <div className="pdp__configurator-title">Skonfiguruj:</div>
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

          {/* Price block — subscription */}
          <div className="pdp__price-block">
            <div className="pdp__price-header">
              <div className="pdp__club-badge">
                <svg className="pdp__club-badge-icon" width="18" height="18" viewBox="0 0 23 23" fill="none">
                  <path d="M19.9652 0H2.85217C1.27696 0 0 1.27696 0 2.85217V19.9652C0 21.5404 1.27696 22.8173 2.85217 22.8173H19.9652C21.5404 22.8173 22.8173 21.5404 22.8173 19.9652V2.85217C22.8173 1.27696 21.5404 0 19.9652 0Z" fill="#18181B"/>
                  <path className="pdp__sygnet-draw" d="M11.5447 11.0658L16.8498 7.54338L14.6465 3.75L5.96875 9.24042L5.99014 9.27607C5.99014 9.27607 5.97588 9.27607 5.96875 9.27607V13.6613C8.89222 13.6613 11.2667 16.0928 11.2667 19.0733H15.6519C15.6519 15.7719 14.0261 12.8484 11.5447 11.0729V11.0658Z" stroke="#CEFF3E" strokeWidth="0.5"/>
                </svg>
                <span>Cena dla klubowiczów</span>
              </div>
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
            </div>
            {priceMode === "business" ? (
              <div className="pdp__price-row" style={{ flexDirection: "column", gap: 2 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span className="pdp__price">{fmtMonthly(computedNet)}</span>
                  <span className="text-sm text-muted">netto / miesiąc</span>
                </div>
                <span className="text-sm text-muted">{fmtMonthly(computedGross)} brutto z VAT</span>
              </div>
            ) : (
              <div className="pdp__price-row" style={{ flexDirection: "column", gap: 2 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span className="pdp__price">{fmtMonthly(computedGross)}</span>
                  <span className="text-sm text-muted">brutto / miesiąc</span>
                </div>
                <span className="text-sm text-muted">w tym {fmtMonthly(computedNet)} netto + VAT</span>
              </div>
            )}
            <div className="pdp__safe-up-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Ochrona Safe Up w cenie
            </div>
          </div>

          {/* CTA buttons */}
          <div className="pdp__actions">
            <button className="btn btn--accent pdp__btn-primary" onClick={() => addToCart && addToCart(p, { computedNet, computedGross, selections: variantSel })}>
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" style={{marginRight:8}}><path d="M1.36646 1.3667H2.69979L4.47312 9.6467C4.53817 9.94994 4.7069 10.221 4.95026 10.4133C5.19362 10.6055 5.49639 10.7069 5.80646 10.7H12.3265C12.6299 10.6995 12.9241 10.5956 13.1605 10.4053C13.3968 10.215 13.5612 9.94972 13.6265 9.65337L14.7265 4.70003H3.41312M5.99992 14C5.99992 14.3682 5.70144 14.6667 5.33325 14.6667C4.96506 14.6667 4.66659 14.3682 4.66659 14C4.66659 13.6318 4.96506 13.3333 5.33325 13.3333C5.70144 13.3333 5.99992 13.6318 5.99992 14ZM13.3333 14C13.3333 14.3682 13.0348 14.6667 12.6666 14.6667C12.2984 14.6667 11.9999 14.3682 11.9999 14C11.9999 13.6318 12.2984 13.3333 12.6666 13.3333C13.0348 13.3333 13.3333 13.6318 13.3333 14Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Dodaj do koszyka — {fmtMonthly(computedNet)}/mies.
            </button>
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
      <button onClick={onBack} className="btn btn--ghost btn--sm" style={{ alignSelf: "flex-start", gap: 6 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Wróć
      </button>

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
      <button className="btn btn--lime" style={{ width: "100%", justifyContent: "center", gap: 8 }}>
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

  // ─── CATALOG VIEW (default) ───────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Zakupy</h2>
          <p className="text-sm text-muted">Wynajem sprzętu dla lekarzy — subskrypcja miesięczna, bez zobowiązań jednorazowych.</p>
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

function DiscountDrawer({ discount: d, onClose }) {
  const [generatedCode, setGeneratedCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [closing, setClosing] = useState(false);
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
  if (!d) return null;
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
          {/* Hero — mniejszy */}
          <div className="drawer__hero drawer__hero--compact">
            <img src={d.hero} alt={d.partner} className="drawer__hero-img" />
          </div>

          {/* Tytuł + krótki opis */}
          <div className="drawer__title">{d.title}</div>
          <p className="drawer__desc-short">{d.desc}</p>

          {/* Sekcja kodu — tylko jeśli needsCode */}
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

          {/* Jak skorzystać — kroki */}
          {d.howToUse && d.howToUse.length > 0 && (
            <div className="drawer__how-to-use">
              <div className="drawer__how-to-use-label">Jak skorzystać</div>
              <ol className="drawer__how-to-use-steps">
                {d.howToUse.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </div>
          )}

          {/* Szczegóły — rozwijane */}
          {d.fullDesc && (
            <React.Fragment>
              <button className="drawer__details-toggle" onClick={() => setShowFullDesc(!showFullDesc)}>
                Szczegóły oferty
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showFullDesc ? "rotate(180deg)" : "", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {showFullDesc && <p className="drawer__desc-full">{d.fullDesc}</p>}
            </React.Fragment>
          )}

          {/* Link do partnera */}
          {d.url && (
            <a href={d.url} target="_blank" rel="noopener noreferrer" className="drawer__btn-outline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              Przejdź na stronę partnera
            </a>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}

function DiscountsView() {
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
              </div>
              <div className="discount-card__body">
                <img src={d.logo} alt={d.partner} className="discount-card__logo" />
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

      {selectedDiscount && <DiscountDrawer discount={selectedDiscount} onClose={() => setSelectedDiscount(null)} />}
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

      {/* Podróże — INTER */}
      {cat.id === "travel" && (
        <div className="ins-section">
          <div className="ins-partner">
            <Pill variant="accent">Partner: INTER</Pill>
            <p className="text-sm" style={{ marginTop: 8, lineHeight: 1.6 }}>
              Roczna polisa podróżna od INTER Ubezpieczenia — obejmuje podróże prywatne i wyjazdy na konferencje medyczne. Koszty leczenia, NNW, bagaż, OC w życiu prywatnym.
            </p>
          </div>
          <div className="ins-estimate">
            <span className="ins-estimate__label">Składka roczna</span>
            <span className="ins-estimate__value">od 19 zł/mies.</span>
          </div>
          <p className="text-sm text-muted" style={{ marginTop: 8 }}>
            Możliwość połączenia w pakiecie z OC lekarskim — zapytaj doradcę o cenę łączną.
          </p>
        </div>
      )}

      {/* Na życie — szacunek */}
      {cat.id === "life" && (
        <div className="ins-section">
          <div className="ins-estimate">
            <span className="ins-estimate__label">Szacunkowa składka</span>
            <span className="ins-estimate__value">60–400 zł/mies.</span>
          </div>
          <p className="text-sm text-muted" style={{ marginTop: 12, lineHeight: 1.6 }}>
            Ochrona finansowa rodziny na wypadek śmierci, niezdolności do pracy lub poważnej choroby. Stawka zależy od wieku, sumy ubezpieczenia i zakresu ochrony. Doradca dopasuje wariant do Twojej sytuacji.
          </p>
        </div>
      )}

      {/* Inne */}
      {cat.id === "other" && (
        <div className="ins-section">
          <p className="text-sm" style={{ lineHeight: 1.6, marginBottom: 12 }}>Pomagamy też z innymi ubezpieczeniami:</p>
          <ul className="ins-other-list">
            <li>NNW (następstwa nieszczęśliwych wypadków)</li>
            <li>Ubezpieczenie mieszkania / domu</li>
            <li>Ubezpieczenie samochodu (AC/OC)</li>
            <li>OC w życiu prywatnym</li>
            <li>Ubezpieczenie sprzętu medycznego</li>
          </ul>
        </div>
      )}

      {/* CTA + upload (not for OC/income — have own forms) */}
      {cat.id !== "oc" && cat.id !== "income" && <div className="ins-cta">
        {!requested ? (
          <Btn variant="primary" style={{ width: "100%" }} onClick={() => setRequested(true)}>
            {cat.id === "other" ? "Skontaktuj się z doradcą" : "Poproś o ofertę"}
          </Btn>
        ) : (
          <div className="ins-cta__done">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            <span>Zgłoszenie wysłane — doradca odezwie się wkrótce</span>
          </div>
        )}
        {cat.id !== "other" && (
          <div className="ins-upload">
            <span className="text-sm text-muted">Masz obecną polisę? Dołącz ją, a porównamy warunki.</span>
            {uploaded
              ? <span className="text-sm font-semibold text-green">Przesłano</span>
              : <button className="ins-upload__btn" onClick={() => setUploaded(true)}>Załącz plik</button>
            }
          </div>
        )}
      </div>}
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

const INS_DASH_DEFAULT_POLICIES = {
  life: { source: "km", provider: "Ergo Hestia", policyNumber: "EH/2025/ZYC-4821", expiryDate: "2026-09-14", sumInsured: "200 000 zł" }
};

function InsuranceDashView() {
  const [policies, setPolicies] = useState(() => {
    try { return JSON.parse(localStorage.getItem("km-ins-policies")) || INS_DASH_DEFAULT_POLICIES; }
    catch { return INS_DASH_DEFAULT_POLICIES; }
  });
  const [selectedCat, setSelectedCat] = useState(null);
  const [ocrModal, setOcrModal] = useState(null);
  const [contactOpen, setContactOpen] = useState(null);
  const [contactSlot, setContactSlot] = useState(null);
  const [contactSent, setContactSent] = useState({});
  const [addFormOpen, setAddFormOpen] = useState(null);
  const [addForm, setAddForm] = useState({ provider: "", policyNumber: "", expiryDate: "", sumInsured: "" });
  const [removeConfirm, setRemoveConfirm] = useState(null);

  // Persist policies
  useEffect(() => {
    try { localStorage.setItem("km-ins-policies", JSON.stringify(policies)); } catch {}
  }, [policies]);

  // Drill-down to InsuranceDetail
  if (selectedCat) {
    return <InsuranceDetail cat={selectedCat} onBack={() => setSelectedCat(null)} />;
  }

  const activeCats = INSURANCE_CATEGORIES.filter(c => !c.disabled && !c.noMissing);
  const coveredCount = activeCats.filter(c => policies[c.id]).length;
  const totalCount = activeCats.length;

  const handleOcrConfirm = (data, fileName) => {
    const catId = ocrModal;
    setPolicies(prev => ({
      ...prev,
      [catId]: { source: "external", provider: data.insurer || "Nieznany", policyNumber: data.policyNumber || "", expiryDate: data.expiryDate || "", sumInsured: data.sumInsured || "" }
    }));
    setOcrModal(null);
  };

  const handleAddFormSubmit = (catId) => {
    if (!addForm.provider && !addForm.policyNumber) return;
    setPolicies(prev => ({
      ...prev,
      [catId]: { source: "external", ...addForm }
    }));
    setAddFormOpen(null);
    setAddForm({ provider: "", policyNumber: "", expiryDate: "", sumInsured: "" });
  };

  const handleRemove = (catId) => {
    setPolicies(prev => {
      const next = { ...prev };
      delete next[catId];
      return next;
    });
    setRemoveConfirm(null);
  };

  const handleContactSend = (catId) => {
    if (!contactSlot) return;
    setContactSent(prev => ({ ...prev, [catId]: true }));
    setContactOpen(null);
    setContactSlot(null);
  };

  // Days left helper
  const daysLeft = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d)) return null;
    return Math.max(0, Math.ceil((d - new Date()) / 86400000));
  };

  // Renewals: policies with expiryDate, sorted ascending
  const renewals = INSURANCE_CATEGORIES
    .filter(c => policies[c.id] && policies[c.id].expiryDate)
    .map(c => ({ cat: c, policy: policies[c.id], days: daysLeft(policies[c.id].expiryDate) }))
    .filter(r => r.days !== null)
    .sort((a, b) => a.days - b.days);

  return (
    <div className="ins-dash">
      {/* Header */}
      <div className="ins-dash__header">
        <div>
          <h2 className="ins-dash__title">Twoje ubezpieczenia</h2>
          <p className="ins-dash__subtitle">Zarządzaj swoimi polisami w jednym miejscu</p>
        </div>
        <span className="ins-dash__badge">{coveredCount} z {totalCount}</span>
      </div>

      {/* Progress bar */}
      <div className="ins-dash__progress">
        {activeCats.map(c => (
          <div key={c.id} className={`ins-dash__progress-seg${policies[c.id] ? " ins-dash__progress-seg--filled" : ""}`} title={c.name} />
        ))}
      </div>

      {/* Cards */}
      <div className="ins-dash__list">
        {INSURANCE_CATEGORIES.map(cat => {
          const policy = policies[cat.id];
          const days = policy ? daysLeft(policy.expiryDate) : null;
          const isCovered = !!policy;
          const isKm = policy?.source === "km";
          const isExternal = policy?.source === "external";

          return (
            <div key={cat.id} className={`ins-dash__card${isCovered ? " ins-dash__card--covered" : cat.disabled ? " ins-dash__card--disabled" : cat.noMissing ? "" : " ins-dash__card--missing"}`}>
              <div className="ins-dash__card-top">
                <div className="ins-dash__card-icon"><InsIcon id={cat.icon} size={22} /></div>
                <div className="ins-dash__card-info">
                  <div className="ins-dash__card-header">
                    <span className="ins-dash__card-name">{cat.name}</span>
                    {cat.tag && <Pill variant={cat.tagVariant}>{cat.tag}</Pill>}
                    {isKm && <span className="ins-dash__status ins-dash__status--km">Aktywne</span>}
                    {isExternal && <span className="ins-dash__status ins-dash__status--ext">Polisa zewnętrzna</span>}
                  </div>

                  {/* Covered: show details */}
                  {isCovered && (
                    <div className="ins-dash__card-meta">
                      {policy.provider && <span>{policy.provider}</span>}
                      {policy.policyNumber && <span className="text-muted"> · Nr {policy.policyNumber}</span>}
                      {policy.sumInsured && <span className="text-muted"> · Suma: {policy.sumInsured}</span>}
                    </div>
                  )}

                  {/* Expiry bar */}
                  {isCovered && days !== null && (
                    <div className="ins-dash__expiry">
                      <div className="ins-dash__expiry-bar">
                        <div
                          className={`ins-dash__expiry-fill${days < 30 ? " ins-dash__expiry-fill--urgent" : days < 90 ? " ins-dash__expiry-fill--warn" : ""}`}
                          style={{ width: `${Math.min(100, (days / 365) * 100)}%` }}
                        />
                      </div>
                      <span className={`ins-dash__expiry-label${days < 30 ? " ins-dash__expiry-label--urgent" : days < 90 ? " ins-dash__expiry-label--warn" : ""}`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        {days === 0 ? "Wygasła" : `Wygasa za ${days} dni`} ({policy.expiryDate && new Date(policy.expiryDate).toLocaleDateString("pl-PL")})
                      </span>
                    </div>
                  )}

                  {/* Not covered: show desc + price */}
                  {!isCovered && !cat.disabled && (
                    <div className="ins-dash__card-desc">
                      <span>{cat.desc}</span>
                      {cat.priceLabel && <span className="ins-dash__card-price">{cat.priceLabel}</span>}
                    </div>
                  )}

                  {/* Disabled */}
                  {cat.disabled && <span className="ins-dash__card-desc text-muted">{cat.desc}</span>}
                </div>
              </div>

              {/* Actions */}
              {!cat.disabled && (
                <div className="ins-dash__card-actions">
                  {!isCovered && (
                    <>
                      <button className="ins-dash__btn ins-dash__btn--primary" onClick={() => setSelectedCat(cat)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        Znajdź ofertę
                      </button>
                      <button className="ins-dash__btn ins-dash__btn--ghost" onClick={() => { setAddFormOpen(addFormOpen === cat.id ? null : cat.id); setOcrModal(null); }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                        Mam polisę
                      </button>
                    </>
                  )}
                  {isCovered && (
                    <>
                      <button className="ins-dash__btn ins-dash__btn--outline" onClick={() => setSelectedCat(cat)}>
                        {isExternal ? "Szczegóły" : "Zarządzaj"}
                      </button>
                      <button className="ins-dash__btn ins-dash__btn--ghost" onClick={() => { setContactOpen(contactOpen === cat.id ? null : cat.id); setContactSlot(null); }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        Kontakt
                      </button>
                      {isExternal && (
                        <button className="ins-dash__btn ins-dash__btn--ghost ins-dash__btn--danger" onClick={() => setRemoveConfirm(cat.id)} title="Usuń polisę">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Remove confirmation */}
              {removeConfirm === cat.id && (
                <div className="ins-dash__confirm">
                  <span>Usunąć polisę?</span>
                  <button className="ins-dash__btn ins-dash__btn--danger-sm" onClick={() => handleRemove(cat.id)}>Tak, usuń</button>
                  <button className="ins-dash__btn ins-dash__btn--ghost" onClick={() => setRemoveConfirm(null)}>Anuluj</button>
                </div>
              )}

              {/* Inline contact */}
              {contactOpen === cat.id && !contactSent[cat.id] && (
                <div className="ins-dash__contact">
                  <p className="ins-dash__contact-label">Kiedy możemy zadzwonić?</p>
                  <div className="ins-dash__contact-slots">
                    {CONTACT_SLOTS.map(s => (
                      <button key={s.id} className={`ins-dash__slot${contactSlot === s.id ? " ins-dash__slot--active" : ""}`} onClick={() => setContactSlot(s.id)}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <button className="ins-dash__btn ins-dash__btn--primary" onClick={() => handleContactSend(cat.id)} disabled={!contactSlot}>
                    Wyślij prośbę o kontakt
                  </button>
                </div>
              )}
              {contactSent[cat.id] && contactOpen === cat.id && (
                <div className="ins-dash__contact-done">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  Prośba wysłana — odezwiemy się wkrótce
                </div>
              )}

              {/* Inline add form */}
              {addFormOpen === cat.id && (
                <div className="ins-dash__add-form">
                  <p className="ins-dash__add-form-label">Dodaj polisę ręcznie lub skanuj dokument</p>
                  <div className="ins-dash__add-form-row">
                    <button className="ins-dash__btn ins-dash__btn--outline" onClick={() => { setOcrModal(cat.id); setAddFormOpen(null); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                      Skanuj dokument (OCR)
                    </button>
                  </div>
                  <div className="ins-dash__add-form-divider">lub wpisz dane ręcznie</div>
                  <div className="ins-dash__add-form-fields">
                    <input type="text" placeholder="Ubezpieczyciel (np. PZU)" value={addForm.provider} onChange={e => setAddForm(f => ({ ...f, provider: e.target.value }))} className="ins-dash__input" />
                    <input type="text" placeholder="Numer polisy" value={addForm.policyNumber} onChange={e => setAddForm(f => ({ ...f, policyNumber: e.target.value }))} className="ins-dash__input" />
                    <input type="date" placeholder="Data wygaśnięcia" value={addForm.expiryDate} onChange={e => setAddForm(f => ({ ...f, expiryDate: e.target.value }))} className="ins-dash__input" />
                    <input type="text" placeholder="Suma ubezpieczenia" value={addForm.sumInsured} onChange={e => setAddForm(f => ({ ...f, sumInsured: e.target.value }))} className="ins-dash__input" />
                  </div>
                  <button className="ins-dash__btn ins-dash__btn--primary" onClick={() => handleAddFormSubmit(cat.id)} disabled={!addForm.provider && !addForm.policyNumber}>
                    Dodaj polisę
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Renewals */}
      {renewals.length > 0 && (
        <div className="ins-dash__renewals">
          <h3 className="ins-dash__renewals-title">Zbliżające się odnowienia</h3>
          {renewals.map(r => (
            <div key={r.cat.id} className={`ins-dash__renewal-row${r.days < 30 ? " ins-dash__renewal-row--urgent" : r.days < 60 ? " ins-dash__renewal-row--warn" : ""}`}>
              <InsIcon id={r.cat.icon} size={16} />
              <span className="ins-dash__renewal-name">{r.cat.name}</span>
              <span className="ins-dash__renewal-days">{r.days} dni</span>
              <span className="ins-dash__renewal-date">{new Date(r.policy.expiryDate).toLocaleDateString("pl-PL")}</span>
            </div>
          ))}
        </div>
      )}

      {/* Partners */}
      <div className="ins-partners" style={{ marginTop: 24 }}>
        <span className="ins-partners__label">Chronimy medyków z</span>
        <div className="ins-partners__logos">
          {INS_PARTNERS.map(p => (
            <img key={p.name} src={p.logo} alt={p.name} className="ins-partners__logo" title={p.name} style={{ height: p.h }} />
          ))}
        </div>
      </div>

      {/* Hint */}
      <div className="ins-hint" style={{ marginTop: 16 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        <p>Masz ubezpieczenie wykupione gdzie indziej? Kliknij „Mam polisę", aby dodać ją do swojego panelu — ręcznie lub skanując dokument.</p>
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
  const [statuses, setStatuses] = useState({ life: "km" });
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [policyData, setPolicyData] = useState({});
  const [ocrModal, setOcrModal] = useState(null); // catId or null
  // daty wygaśnięcia polis kuponych w KM
  const expiryDates = { life: "2026-09-14" };

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

function ProfileView({ profile, setProfile }) {
  const [claimedIds, setClaimedIds] = useState({});
  const [copiedId,   setCopiedId]   = useState(null);
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

  const perks = [
    { id: "cinema",  title: "2× bilet do kina",  brand: "Cinema City", value: "2 × 35 zł", code: "MEDYK-CC-0224", expires: "11 dni" },
    { id: "massage", title: "Voucher na masaż",   brand: "Zdrovit Spa", value: "120 zł",     code: "KLUB-SPA-0224", expires: "11 dni" },
  ];

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
            <button className="section-header__action" onClick={() => setEditing(true)}>Edytuj</button>
          )}
        </div>

        {editing ? (
          <div className="card" style={{ padding: 20 }}>
            <div className="profile-form">
              <div className="profile-form__row">
                <div className="profile-form__field">
                  <label className="profile-form__label">Imię</label>
                  <input className="input" value={draft.firstName} onChange={e => setDraftField("firstName", e.target.value)} />
                </div>
                <div className="profile-form__field">
                  <label className="profile-form__label">Nazwisko</label>
                  <input className="input" value={draft.lastName} onChange={e => setDraftField("lastName", e.target.value)} />
                </div>
              </div>
              <div className="profile-form__field">
                <label className="profile-form__label">E-mail</label>
                <input className="input" type="email" value={draft.email} onChange={e => setDraftField("email", e.target.value)} />
              </div>
              <div className="profile-form__field">
                <label className="profile-form__label">Telefon</label>
                <input className="input" type="tel" value={draft.phone} onChange={e => setDraftField("phone", e.target.value)} />
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
                  <button className="btn btn--outline btn--sm contact-request-btn" onClick={() => setContactDropdown(openId ? null : a.id)}>
                    Zamów kontakt
                  </button>
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

// ─── CART DRAWER ──────────────────────────────────────────────────────────────

function CartDrawer({ cart, onClose, removeFromCart, updateQty }) {
  const [closing, setClosing] = useState(false);
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
              <div className="cart-empty__icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E4E4E7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              </div>
              <div className="cart-empty__title">Koszyk jest pusty</div>
              <div className="cart-empty__desc">Dodaj produkty z zakładki Zakupy</div>
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
                    <svg width="18" height="18" viewBox="0 0 23 23" fill="none"><path d="M19.9652 0H2.85217C1.27696 0 0 1.27696 0 2.85217V19.9652C0 21.5404 1.27696 22.8173 2.85217 22.8173H19.9652C21.5404 22.8173 22.8173 21.5404 22.8173 19.9652V2.85217C22.8173 1.27696 21.5404 0 19.9652 0Z" fill="#18181B"/><path d="M11.5447 11.0658L16.8498 7.54338L14.6465 3.75L5.96875 9.24042L5.99014 9.27607C5.99014 9.27607 5.97588 9.27607 5.96875 9.27607V13.6613C8.89222 13.6613 11.2667 16.0928 11.2667 19.0733H15.6519C15.6519 15.7719 14.0261 12.8484 11.5447 11.0729V11.0658Z" fill="#CEFF3E"/></svg>
                    <span>Ochrona Safe Up w cenie</span>
                  </div>
                )}
                <button className="cart-checkout-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  Przejdź do płatności
                </button>
                <button className="cart-continue-btn" onClick={handleClose}>
                  ← Kontynuuj zakupy
                </button>

                {subItems.length > 0 && (
                  <div className="cart-financing">
                    <div className="cart-financing__note">Umowa na 12 mies. · Comiesięczna faktura VAT · Wymiana sprzętu po 6 mies.</div>
                  </div>
                )}
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}

const VIEWS = {
  overview:    Overview,
  purchases:   PurchasesView,
  cars:        CarsView,
  packages:    ServicesView,
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

  const setActive = (id) => { setActive_(id); setNavKey(k => k + 1); };

  const addToCart = (product, variant) => {
    setCart(prev => {
      const key = product.id + (variant ? JSON.stringify(variant) : "");
      const existing = prev.find(i => i.key === key);
      if (existing) return prev;
      const isOneTime = !product.monthlyNet;
      const priceNet = variant && variant.computedNet ? variant.computedNet : (product.monthlyNet || 0);
      const priceGross = variant && variant.computedGross ? variant.computedGross : (product.monthlyGross || 0);
      const oneTimePrice = isOneTime ? parseFloat((product.price || "0").replace(/[^\d]/g, "")) : 0;
      return [...prev, { key, product, variant, qty: 1, priceNet, priceGross, isOneTime, oneTimePrice }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (key) => setCart(prev => prev.filter(i => i.key !== key));
  const updateQty = (key, delta) => setCart(prev => prev.map(i => {
    if (i.key !== key) return i;
    const newQty = i.qty + delta;
    return newQty > 0 ? { ...i, qty: newQty } : i;
  }).filter(i => i.qty > 0));

  if (loading) return <Preloader onDone={() => setLoading(false)} />;
  if (!onboarded) return <Onboarding onComplete={() => setOnboarded(true)} setProfile={setProfile} />;

  const View = VIEWS[active] || Overview;

  return (
    <div className="app-layout">
      <Sidebar active={active} setActive={setActive} theme={theme} setTheme={setTheme} profile={profile} />
      <div className="main">
        <TopBar active={active} setActive={setActive} cart={cart} onCartClick={() => setCartOpen(true)} />
        <main className="main__content">
          <View key={navKey} setActive={setActive} addToCart={addToCart} cart={cart} removeFromCart={removeFromCart} profile={profile} setProfile={setProfile} />
        </main>
      </div>
      {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} removeFromCart={removeFromCart} updateQty={updateQty} />}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
