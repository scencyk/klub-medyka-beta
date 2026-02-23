const { useState } = React;

const USER_AVATAR = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const ALL_ADVISORS = [
  { id: "a1", name: "Marta Kowalczyk",      role: "Doradca ubezpieczeniowy", phone: "+48 600 100 200", initials: "MK", available: true,  photo: "advisors/marta.jpg"  },
  { id: "a2", name: "Tomasz Nowak",         role: "Doradca prawny",          phone: "+48 601 200 300", initials: "TN", available: true,  photo: "advisors/tomasz.jpg" },
  { id: "a3", name: "Agnieszka Wiśniewska", role: "Doradca finansowy",       phone: "+48 602 300 400", initials: "AW", available: false, photo: "advisors/agnieszka.jpg" },
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
    id: "devices", label: "Sprzęt i elektronika", color: "#FFFFFF",
    items: [
      { id: "iphone15", brand: "Apple",  model: "iPhone 15 Pro",      desc: "Smartfon · 256 GB · Tytan naturalny",     price: "5 299 zł", priceOld: "5 999 zł", priceNote: "Rata netto", emoji: "📱", basePrice: 5299, priceOldBase: 5999, badge: "Nowość",
        photo: "zdjecia-produktow/iphone15-nat-front.jpg",
        images: [
          { url: "zdjecia-produktow/iphone15-nat-front.jpg", label: "Przód" },
          { url: "zdjecia-produktow/iphone15-nat-back.jpg", label: "Tył" },
          { url: "zdjecia-produktow/iphone15-nat-side.jpg", label: "Bok" },
        ],
        fullDesc: "iPhone 15 Pro z chipem A17 Pro. Tytanowa konstrukcja, najlżejszy iPhone Pro w historii. Kamera 48 MP z 5-krotnym zoomem optycznym. Przycisk Czynność do szybkiego dostępu do ulubionych funkcji. USB-C z obsługą USB 3.",
        variants: [
          { group: "Przekątna ekranu", options: [
            { label: '6,1"', diff: 0, default: true },
            { label: '6,7"', diff: 350 },
          ]},
          { group: "Pamięć wbudowana", options: [
            { label: "128 GB", diff: -400 },
            { label: "256 GB", diff: 0, default: true },
            { label: "512 GB", diff: 500 },
            { label: "1 TB", diff: 1200 },
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
        delivery: "Dostawa 1–2 dni robocze",
      },
      { id: "ipad",     brand: "Apple",  model: "iPad Pro M4",        desc: "Tablet · 11\" · idealny do gabinetu",     price: "4 799 zł", priceOld: "5 299 zł", priceNote: "Rata netto", emoji: "📲", basePrice: 4799, priceOldBase: 5299, badge: "Nowość",
        photo: "zdjecia-produktow/ipad-czarny-front.jpg",
        images: [
          { url: "zdjecia-produktow/ipad-czarny-front.jpg", label: "Przód" },
          { url: "zdjecia-produktow/ipad-srebrny-front.jpg", label: "Srebrny" },
        ],
        fullDesc: "Najcieńszy produkt Apple w historii. Chip M4 zapewnia ogromną moc w ultrasmukłej obudowie. Ekran Ultra Retina XDR z technologią tandem OLED. Idealny do dokumentacji medycznej, notatek i wideokonferencji.",
        variants: [
          { group: "Przekątna ekranu", options: [
            { label: '11"', diff: 0, default: true },
            { label: '13"', diff: 600 },
          ]},
          { group: "Pamięć wbudowana", options: [
            { label: "256 GB", diff: 0, default: true },
            { label: "512 GB", diff: 400 },
            { label: "1 TB", diff: 1000 },
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
        delivery: "Dostawa 1–2 dni robocze",
      },
      { id: "macbook",  brand: "Apple",  model: "MacBook Air M3",     desc: "Laptop · 15\" · 16 GB RAM",               price: "6 499 zł", priceOld: null,        priceNote: "Rata netto", emoji: "💻", basePrice: 6499, priceOldBase: null,
        photo: "zdjecia-produktow/macbook-szary-front.jpg",
        images: [
          { url: "zdjecia-produktow/macbook-szary-front.jpg", label: "Północ" },
          { url: "zdjecia-produktow/macbook-srebrny-front.jpg", label: "Srebrny" },
          { url: "zdjecia-produktow/macbook-starlight-front.jpg", label: "Starlight" },
        ],
        fullDesc: "MacBook Air 15 cali z chipem M3. Niesamowicie cienki i lekki, z 18 godzinami pracy na baterii. 16 GB RAM i szybki dysk SSD. Idealny do pracy w gabinecie i na konferencjach.",
        variants: [
          { group: "Przekątna ekranu", options: [
            { label: '13,6"', diff: -500 },
            { label: '15,3"', diff: 0, default: true },
          ]},
          { group: "Pamięć RAM", options: [
            { label: "16 GB", diff: 0, default: true },
            { label: "24 GB", diff: 400 },
          ]},
          { group: "Dysk SSD", options: [
            { label: "256 GB", diff: -300 },
            { label: "512 GB", diff: 0, default: true },
            { label: "1 TB", diff: 400 },
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
        delivery: "Dostawa 1–2 dni robocze",
      },
      { id: "sony",     brand: "Sony",   model: "WH-1000XM5",        desc: "Słuchawki · ANC · na dyżury i do nauki",  price: "1 099 zł", priceOld: "1 499 zł", priceNote: null,         emoji: "🎧",
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
        delivery: "Dostawa 1–2 dni robocze",
        installment: null,
      },
      { id: "monitor",  brand: "Dell",   model: "UltraSharp U2724D", desc: "Monitor · 27\" · 4K IPS · USB-C",         price: "2 399 zł", priceOld: null,        priceNote: "Rata netto", emoji: "🖥️",
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
        delivery: "Dostawa 2–3 dni robocze",
        installment: "12 × 199 zł netto",
      },
    ],
  },
  {
    id: "cars", label: "Samochody", color: "#FFFFFF",
    items: [
      { id: "glc",      brand: "Mercedes-Benz", model: "GLC Coupe 220 d mHEV", desc: "SUV · diesel · wynajem długoterminowy",   price: "2 850 zł/mies.", priceOld: "3 120 zł/mies.", priceNote: "Rata netto", emoji: "🚗", photo: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=450&fit=crop" },
      { id: "bmw3",     brand: "BMW",            model: "320i M Sport",          desc: "Sedan · benzyna · leasing 36 mies.",     price: "2 450 zł/mies.", priceOld: null,              priceNote: "Rata netto", emoji: "🏎️", photo: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=450&fit=crop" },
      { id: "tesla3",   brand: "Tesla",          model: "Model 3 Long Range",   desc: "Elektryczny · 600 km zasięgu",           price: "2 100 zł/mies.", priceOld: "2 500 zł/mies.", priceNote: "Rata netto", emoji: "⚡", photo: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=450&fit=crop" },
      { id: "vehis",    brand: "VEHIS",          model: "Wirtualny salon",       desc: "Konfiguruj i zamów online bez wychodzenia", price: "wycena online",   priceOld: null,              priceNote: null,         emoji: "🛒", photo: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=450&fit=crop" },
      { id: "mooveno",  brand: "Mooveno",        model: "Elastyczny wynajem",    desc: "Od 1 miesiąca · różne marki",             price: "od 1 800 zł/mies.", priceOld: null,           priceNote: "Rata netto", emoji: "🔑", photo: "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=600&h=450&fit=crop" },
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
  advisors: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  profile: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>,
};

const NAV_SECTIONS = [
  {
    items: [
      { id: "overview",    label: "Panel główny",  icon: "overview"  },
      { id: "purchases",   label: "Zakupy",        icon: "purchases" },
      { id: "packages",    label: "Usługi",        icon: "packages"  },
      { id: "discounts",   label: "Zniżki",        icon: "discounts" },
      { id: "advisors",    label: "Twoi doradcy",  icon: "advisors"  },
      { id: "insurance",   label: "Ubezpieczenia", icon: "insurance",   soon: true },
      { id: "investments", label: "Inwestycje",    icon: "investments", soon: true },
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
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__header">
        <div className="sidebar__logo" onClick={() => setActive("overview")} style={{ cursor: "pointer" }}>
          <img src="../brand assets/Logo.png" alt="Klub Medyka" />
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
                  {item.soon && (
                    <span className="sidebar__soon">wkrótce</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User profile */}
      <div className="sidebar__profile" onClick={() => setActive("profile")}>
        <img className="sidebar__profile-avatar" src={USER_AVATAR} alt="Dr Anna Kowalska" />
        <div className="sidebar__profile-info">
          <div className="sidebar__profile-name">Dr Anna Kowalska</div>
          <div className="sidebar__profile-role">Rezydent · Kardiologia</div>
        </div>
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
        <button className="topbar__icon-btn" onClick={() => setActive("profile")} title="Profil">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="20" fill="#F4F4F5"/>
            <path d="M24.6668 26V24.6667C24.6668 23.9594 24.3859 23.2811 23.8858 22.781C23.3857 22.281 22.7074 22 22.0002 22H18.0002C17.2929 22 16.6146 22.281 16.1145 22.781C15.6144 23.2811 15.3335 23.9594 15.3335 24.6667V26M22.6668 16.6667C22.6668 18.1394 21.4729 19.3333 20.0002 19.3333C18.5274 19.3333 17.3335 18.1394 17.3335 16.6667C17.3335 15.1939 18.5274 14 20.0002 14C21.4729 14 22.6668 15.1939 22.6668 16.6667Z" stroke="#18181B" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="topbar__icon-btn" title="Powiadomienia">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="20" fill="#F4F4F5"/>
            <path d="M18.8667 26.0002C18.9783 26.2031 19.1423 26.3724 19.3417 26.4903C19.5411 26.6082 19.7684 26.6704 20 26.6704C20.2316 26.6704 20.459 26.6082 20.6584 26.4903C20.8577 26.3724 21.0218 26.2031 21.1334 26.0002M16 17.3335C16 16.2726 16.4214 15.2552 17.1716 14.5051C17.9217 13.7549 18.9391 13.3335 20 13.3335C21.0609 13.3335 22.0783 13.7549 22.8284 14.5051C23.5786 15.2552 24 16.2726 24 17.3335C24 22.0002 26 23.3335 26 23.3335H14C14 23.3335 16 22.0002 16 17.3335Z" stroke="#18181B" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="topbar__notification-dot" />
        </button>
        <button className="topbar__icon-btn" onClick={() => setActive("purchases")} title="Koszyk">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="20" fill="#F4F4F5"/>
            <path d="M13.3667 13.3667H14.7L16.4734 21.6467C16.5384 21.9499 16.7071 22.221 16.9505 22.4133C17.1939 22.6055 17.4966 22.7069 17.8067 22.7H24.3267C24.6301 22.6995 24.9244 22.5956 25.1607 22.4053C25.3971 22.215 25.5615 21.9497 25.6267 21.6534L26.7267 16.7H15.4134M18.0002 26C18.0002 26.3682 17.7017 26.6667 17.3335 26.6667C16.9653 26.6667 16.6668 26.3682 16.6668 26C16.6668 25.6318 16.9653 25.3333 17.3335 25.3333C17.7017 25.3333 18.0002 25.6318 18.0002 26ZM25.3335 26C25.3335 26.3682 25.035 26.6667 24.6668 26.6667C24.2986 26.6667 24.0002 26.3682 24.0002 26C24.0002 25.6318 24.2986 25.3333 24.6668 25.3333C25.035 25.3333 25.3335 25.6318 25.3335 26Z" stroke="#18181B" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
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

function Overview({ setActive }) {
  const [ticketClaimed, setTicketClaimed] = useState(false);
  const [interests, setInterests] = useState([]);
  const [contactDropdown, setContactDropdown] = useState(null);
  const [contactBooked, setContactBooked] = useState({});

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
          {ALL_ADVISORS.map(a => {
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

// ─── PRODUCT DETAIL (sub-component) ──────────────────────────────────────────

function ProductDetail({ product: p, cat, defaultSelections, onBack }) {
  const [variantSel, setVariantSel] = useState(defaultSelections);
  const [specsExpanded, setSpecsExpanded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const selectVariant = (group, label) => {
    setVariantSel(prev => ({ ...prev, [group]: label }));
  };

  // ─── Price helpers ───
  const fmtPrice = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " zł";
  const fmtDiff = (n) => n > 0 ? ("+" + fmtPrice(n)) : n < 0 ? ("−" + fmtPrice(Math.abs(n))) : null;

  // ─── Computed price from variants ───
  let totalDiff = 0;
  if (p.variants) {
    p.variants.forEach(v => {
      const sel = variantSel[v.group];
      const opt = v.options.find(o => o.label === sel);
      if (opt) totalDiff += (opt.diff || 0);
    });
  }
  const computedPrice = (p.basePrice || 0) + totalDiff;
  const computedOld = p.priceOldBase ? p.priceOldBase + totalDiff : null;
  const rataMonth = Math.ceil(computedPrice / 12);

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
          <div className="pdp__tags">
            <span className="pdp__tag pdp__tag--lime">Raty 0%</span>
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

          {/* Price block */}
          <div className="pdp__price-block">
            <div className="pdp__club-badge">
              <svg className="pdp__club-badge-icon" width="18" height="18" viewBox="0 0 23 23" fill="none">
                <path d="M19.9652 0H2.85217C1.27696 0 0 1.27696 0 2.85217V19.9652C0 21.5404 1.27696 22.8173 2.85217 22.8173H19.9652C21.5404 22.8173 22.8173 21.5404 22.8173 19.9652V2.85217C22.8173 1.27696 21.5404 0 19.9652 0Z" fill="#18181B"/>
                <path className="pdp__sygnet-draw" d="M11.5447 11.0658L16.8498 7.54338L14.6465 3.75L5.96875 9.24042L5.99014 9.27607C5.99014 9.27607 5.97588 9.27607 5.96875 9.27607V13.6613C8.89222 13.6613 11.2667 16.0928 11.2667 19.0733H15.6519C15.6519 15.7719 14.0261 12.8484 11.5447 11.0729V11.0658Z" stroke="#CEFF3E" strokeWidth="0.5"/>
              </svg>
              <span>Cena dla klubowiczów</span>
            </div>
            <div className="pdp__price-row">
              <span className="pdp__price">{fmtPrice(computedPrice)}</span>
              {computedOld && computedOld > computedPrice && <span className="pdp__price-old">{fmtPrice(computedOld)}</span>}
              {computedOld && computedOld > computedPrice && (
                <span className="pdp__tag pdp__tag--lime">−{Math.round((1 - computedPrice / computedOld) * 100)}%</span>
              )}
            </div>
          </div>

          {/* CTA buttons */}
          <div className="pdp__actions">
            <button className="btn btn--accent pdp__btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:8}}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              Dodaj do koszyka
            </button>
            <button className="btn btn--outline pdp__btn-secondary">Zapytaj doradcę</button>
          </div>

          {/* Payment options */}
          <div className="pdp__payment-info">
            <div className="pdp__payment-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              <div className="pdp__payment-item-text">
                <span className="pdp__payment-item-title">Dopasuj swoją płatność</span>
                <span className="pdp__payment-item-highlight">Rata już od {fmtPrice(rataMonth)}</span>
                <span className="pdp__payment-item-sub">Sprawdź szczegóły rat i leasingu</span>
              </div>
            </div>
          </div>

          {/* Delivery info */}
          <div className="pdp__delivery-info">
            <div className="pdp__delivery-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              <div className="pdp__delivery-item-text">
                <span className="pdp__delivery-item-title">Wysyłka najczęściej w 1 dzień roboczy</span>
                <span className="pdp__delivery-item-sub">Wysyłka realizowana bezpośrednio z magazynu.</span>
              </div>
            </div>
            <div className="pdp__delivery-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              <div className="pdp__delivery-item-text">
                <span className="pdp__delivery-item-title">Darmowa dostawa</span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="pdp__benefits">
            <div className="pdp__benefit"><span>✓</span> Gwarancja producenta</div>
            <div className="pdp__benefit"><span>✓</span> Faktura VAT dla lekarza</div>
            <div className="pdp__benefit"><span>✓</span> Raty 0% bez zaświadczeń</div>
          </div>
        </div>
      </div>

      {/* Description below */}
      {p.fullDesc && (
        <div className="pdp__details">
          <div className="pdp__section">
            <h3 className="pdp__section-title">Opis produktu</h3>
            <p className="pdp__section-text">{p.fullDesc}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PURCHASES VIEW ───────────────────────────────────────────────────────────

function PurchasesView() {
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("shop"); // "shop", "orders", or "detail"
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCat, setSelectedCat] = useState(null);

  const FILTERS = [
    { id: "all", label: "Wszystko" },
    { id: "devices", label: "Elektronika" },
    { id: "cars", label: "Samochody" },
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
            {cat.items.map(item => {
              const rataVal = item.basePrice ? Math.ceil(item.basePrice / 36) : null;
              return (
                <div key={item.id} className="product-card" onClick={() => item.specs && openProduct(item, cat)}>
                  <div className="product-card__image" style={{ background: cat.color }}>
                    {item.badge && <span className="product-card__badge">{item.badge}</span>}
                    {item.photo
                      ? <img src={item.photo} alt={`${item.brand} ${item.model}`} className="product-card__photo" />
                      : <span>{item.emoji}</span>
                    }
                  </div>
                  <div className="product-card__body">
                    <div className="product-card__name">{item.brand} {item.model}</div>
                    <div className="product-card__desc">{item.desc}</div>
                    <div className="product-card__price-row">
                      <div className="product-card__price-col">
                        <span className="product-card__price">{item.price}</span>
                        {item.priceOld && <span className="product-card__price-old">{item.priceOld}</span>}
                      </div>
                      {rataVal && (
                        <div className="product-card__rata-col">
                          <span className="product-card__rata-label">Rata już od:</span>
                          <span className="product-card__rata-value">{rataVal} zł</span>
                        </div>
                      )}
                    </div>
                    <button className="product-card__cta" onClick={(e) => { e.stopPropagation(); }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1.36646 1.3667H2.69979L4.47312 9.6467C4.53817 9.94994 4.7069 10.221 4.95026 10.4133C5.19362 10.6055 5.49639 10.7069 5.80646 10.7H12.3265C12.6299 10.6995 12.9241 10.5956 13.1605 10.4053C13.3968 10.215 13.5612 9.94972 13.6265 9.65337L14.7265 4.70003H3.41312M5.99992 14C5.99992 14.3682 5.70144 14.6667 5.33325 14.6667C4.96506 14.6667 4.66659 14.3682 4.66659 14C4.66659 13.6318 4.96506 13.3333 5.33325 13.3333C5.70144 13.3333 5.99992 13.6318 5.99992 14ZM13.3333 14C13.3333 14.3682 13.0348 14.6667 12.6666 14.6667C12.2984 14.6667 11.9999 14.3682 11.9999 14C11.9999 13.6318 12.2984 13.3333 12.6666 13.3333C13.0348 13.3333 13.3333 13.6318 13.3333 14Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Do koszyka
                    </button>
                  </div>
                </div>
              );
            })}
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
        <img style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} src={USER_AVATAR} alt="Dr Anna Kowalska" />
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

function AdvisorsView() {
  const [contactDropdown, setContactDropdown] = useState(null);
  const [contactBooked, setContactBooked] = useState({});
  return (
    <div>
      <SectionHeader title="Twoi doradcy" />
      <div className="advisor-grid">
        {ALL_ADVISORS.map(a => {
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

const VIEWS = {
  overview:    Overview,
  purchases:   PurchasesView,
  packages:    ServicesView,
  discounts:   DiscountsView,
  advisors:    AdvisorsView,
  insurance:   InsuranceView,
  investments: InvestmentsView,
  profile:     ProfileView,
};

function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [active,    setActive_]   = useState("overview");
  const [navKey,    setNavKey]    = useState(0);

  const setActive = (id) => { setActive_(id); setNavKey(k => k + 1); };

  if (!onboarded) return <Onboarding onComplete={() => setOnboarded(true)} />;

  const View = VIEWS[active] || Overview;

  return (
    <div className="app-layout">
      <Sidebar active={active} setActive={setActive} />
      <div className="main">
        <TopBar active={active} setActive={setActive} />
        <main className="main__content">
          <View key={navKey} setActive={setActive} />
        </main>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
