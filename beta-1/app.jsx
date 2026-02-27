const { useState } = React;

const USER_AVATAR = "https://images.unsplash.com/photo-1592621385612-4d7129426394?w=200&h=200&fit=crop&crop=faces";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const ALL_ADVISORS = [
  { id: "a1", name: "Marta Kowalczyk",      role: "Ubezpieczenia praktyki lekarskiej", phone: "+48 600 100 200", initials: "MK", available: true,  photo: "advisors/marta.jpg",     category: "insurance" },
  { id: "a2", name: "Tomasz Nowak",         role: "Doradca prawny",                    phone: "+48 601 200 300", initials: "TN", available: true,  photo: "advisors/tomasz.jpg",    category: "legal"     },
  { id: "a3", name: "Agnieszka Wiśniewska", role: "Doradca finansowy",                 phone: "+48 602 300 400", initials: "AW", available: false, photo: "advisors/agnieszka.jpg", category: "tax"       },
  { id: "a4", name: "Karolina Zielińska",   role: "Ubezpieczenia na życie",            phone: "+48 603 400 500", initials: "KZ", available: true,  photo: "advisors/karolina.jpg",  category: "life"      },
  { id: "a5", name: "Michał Wójcik",        role: "Doradca kredytowy",                 phone: "+48 604 500 600", initials: "MW", available: true,  photo: "advisors/michal.jpg",    category: "credit"    },
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
      { id: "sony",     brand: "Sony",   model: "WH-1000XM5",        desc: "Słuchawki · ANC · na dyżury i do nauki",  price: "1 099 zł", priceOld: "1 499 zł", priceNote: null,         emoji: "🎧", countdownHours: 26,
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
  investments: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  advisors: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  profile: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>,
};

const NAV_SECTIONS = [
  {
    items: [
      { id: "overview",    label: "Panel główny",  icon: "overview"  },
      { id: "purchases",   label: "Zakupy",        icon: "purchases" },
      { id: "insurance",   label: "Ubezpieczenia", icon: "insurance", tag: "Nowość" },
      { id: "insurance-v2", label: "Ubezpieczenia v2", icon: "insurance", tag: "Nowy" },
      { id: "discounts",   label: "Zniżki",        icon: "discounts" },
      { id: "discounts-v2", label: "Zniżki v2",     icon: "discounts" },
      { id: "discounts-v3", label: "Zniżki v3",     icon: "discounts" },
      // { id: "discounts-v4", label: "Zniżki v4",     icon: "discounts" },
      { id: "packages",    label: "Usługi",        icon: "packages" },
      { id: "advisors",    label: "Twoi doradcy",  icon: "advisors"  },
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

const INSURANCE_CATEGORIES = [
  { id: "oc",     name: "OC lekarskie",   icon: "shield", tag: "Obowiązkowe", tagVariant: "red",  priceLabel: "od 69 zł/mies.",    desc: "Odpowiedzialność cywilna za błędy w sztuce lekarskiej. Wymagane prawnie.", noMissing: false },
  { id: "income", name: "Utrata dochodu", icon: "wallet", tag: "Zalecane",    tagVariant: "warn", priceLabel: "~80–350 zł/mies.",  desc: "Ochrona przychodu przy chorobie lub wypadku.", noMissing: false },
  { id: "life",   name: "Na życie",       icon: "heart",  tag: null,          tagVariant: null,   priceLabel: "~60–400 zł/mies.",  desc: "Ochrona rodziny na wypadek śmierci lub niezdolności do pracy.", noMissing: false },
  { id: "travel", name: "Podróże",        icon: "plane",  tag: null,          tagVariant: null,   priceLabel: "od 19 zł/mies.",    desc: "Roczna polisa — podróże prywatne i konferencje medyczne.", provider: "INTER", noMissing: true },
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
  { name: "PZU",                 logo: "../ubezpieczenia/loga/PZU_logo.png",   h: 36 },
  { name: "Ergo Hestia",        logo: "../ubezpieczenia/loga/ergohestia.png",  h: 34 },
  { name: "INTER Ubezpieczenia", logo: "../ubezpieczenia/loga/inter logo.webp", h: 26 },
  { name: "Lloyd's",            logo: "../ubezpieczenia/loga/lloyds.png",      h: 18 },
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

function TopBar({ active, setActive, cart, onCartClick }) {
  const label = NAV_SECTIONS.flatMap(s => s.items).find(i => i.id === active)?.label || "";
  const cartCount = cart ? cart.reduce((s, i) => s + i.qty, 0) : 0;
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
        <button className="topbar__icon-btn topbar__cart-btn" onClick={onCartClick} title="Koszyk">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="20" fill="#F4F4F5"/>
            <path d="M13.3667 13.3667H14.7L16.4734 21.6467C16.5384 21.9499 16.7071 22.221 16.9505 22.4133C17.1939 22.6055 17.4966 22.7069 17.8067 22.7H24.3267C24.6301 22.6995 24.9244 22.5956 25.1607 22.4053C25.3971 22.215 25.5615 21.9497 25.6267 21.6534L26.7267 16.7H15.4134M18.0002 26C18.0002 26.3682 17.7017 26.6667 17.3335 26.6667C16.9653 26.6667 16.6668 26.3682 16.6668 26C16.6668 25.6318 16.9653 25.3333 17.3335 25.3333C17.7017 25.3333 18.0002 25.6318 18.0002 26ZM25.3335 26C25.3335 26.3682 25.035 26.6667 24.6668 26.6667C24.2986 26.6667 24.0002 26.3682 24.0002 26C24.0002 25.6318 24.2986 25.3333 24.6668 25.3333C25.035 25.3333 25.3335 25.6318 25.3335 26Z" stroke="#18181B" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
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
          {ALL_ADVISORS.slice(0, 3).map(a => {
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

      {/* Insurance status */}
      <div>
        <SectionHeader title="Ubezpieczenia" action="Wszystkie" onAction={() => setActive("insurance")} />
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="dash-ins__active">
            <div className="dash-ins__row">
              <div className="dash-ins__icon dash-ins__icon--ok">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <div className="dash-ins__info">
                <span className="font-semibold" style={{ fontSize: 13 }}>Na życie</span>
                <span className="text-xs" style={{ color: "#166534" }}>Aktywne · wygasa za 202 dni</span>
              </div>
              <button className="dash-ins__manage" onClick={() => setActive("insurance")}>Zarządzaj</button>
            </div>
          </div>
          <div className="dash-ins__missing">
            <div className="dash-ins__missing-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              <span>4 obszary bez ochrony</span>
            </div>
            <div className="dash-ins__chips">
              {[
                { label: "OC lekarskie", tag: "Obowiązkowe", urgent: true },
                { label: "Utrata dochodu", tag: "Zalecane", urgent: false },
                { label: "Podróże", tag: null, urgent: false },
                { label: "Inne", tag: null, urgent: false },
              ].map(item => (
                <button key={item.label} className={`dash-ins__chip ${item.urgent ? "dash-ins__chip--urgent" : ""}`}
                  onClick={() => setActive("insurance")}>
                  {item.label}
                  {item.tag && <span className="dash-ins__chip-tag">{item.tag}</span>}
                </button>
              ))}
            </div>
          </div>
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
                <img src={d.logo} alt={d.partner} style={{ width: 24, height: 24, borderRadius: 4, objectFit: "contain" }} />
                <span className="font-semibold" style={{ fontSize: 13 }}>{d.partner}</span>
                <span className="text-xs text-muted">{d.title}</span>
              </div>
              <span className="font-semibold" style={{ fontSize: 13, color: "var(--color-accent)" }}>{d.badge}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCT DETAIL (sub-component) ──────────────────────────────────────────

function ProductDetail({ product: p, cat, defaultSelections, onBack, addToCart }) {
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
            <button className="btn btn--accent pdp__btn-primary" onClick={() => addToCart && addToCart(p, { computedPrice, selections: variantSel })}>
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
                        {item.countdownHours && <CountdownInline hours={item.countdownHours} />}
                      </div>
                      {rataVal && (
                        <div className="product-card__rata-col">
                          <span className="product-card__rata-label">Rata już od:</span>
                          <span className="product-card__rata-value">{rataVal} zł</span>
                        </div>
                      )}
                    </div>
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
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1.36646 1.3667H2.69979L4.47312 9.6467C4.53817 9.94994 4.7069 10.221 4.95026 10.4133C5.19362 10.6055 5.49639 10.7069 5.80646 10.7H12.3265C12.6299 10.6995 12.9241 10.5956 13.1605 10.4053C13.3968 10.215 13.5612 9.94972 13.6265 9.65337L14.7265 4.70003H3.41312M5.99992 14C5.99992 14.3682 5.70144 14.6667 5.33325 14.6667C4.96506 14.6667 4.66659 14.3682 4.66659 14C4.66659 13.6318 4.96506 13.3333 5.33325 13.3333C5.70144 13.3333 5.99992 13.6318 5.99992 14ZM13.3333 14C13.3333 14.3682 13.0348 14.6667 12.6666 14.6667C12.2984 14.6667 11.9999 14.3682 11.9999 14C11.9999 13.6318 12.2984 13.3333 12.6666 13.3333C13.0348 13.3333 13.3333 13.6318 13.3333 14Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Do koszyka
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* VEHIS Virtual Showroom */}
      {(filter === "all" || filter === "cars") && (
        <VehisEmbed />
      )}
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
  const filtered = filter === "all" ? DISCOUNTS : DISCOUNTS.filter(d => d.category === filter);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Zniżki</h2>
        <p className="text-sm text-muted">Oferty i rabaty od partnerów Klub Medyka.</p>
      </div>
      <div className="filter-bar">
        {DISCOUNT_CATEGORIES.map(c => (
          <button key={c.id} className={`filter-pill${filter === c.id ? " filter-pill--active" : ""}`} onClick={() => setFilter(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
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
      {selectedDiscount && <DiscountDrawer discount={selectedDiscount} onClose={() => setSelectedDiscount(null)} />}
    </div>
  );
}

// ─── DISCOUNTS V2 VIEW (compact list) ─────────────────────────────────────────

function DiscountsV2Row({ d, isExpanded, onToggle }) {
  const [generatedCode, setGeneratedCode] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateCode = (e) => {
    e.stopPropagation();
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "KM-";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setGeneratedCode(code);
  };
  const copyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`dv2-item${isExpanded ? " dv2-item--expanded" : ""}`}>
      <button className="dv2-row" onClick={onToggle}>
        <img src={d.logo} alt={d.partner} className="dv2-row__logo" />
        <span className="dv2-row__partner">{d.partner}</span>
        <span className="dv2-row__title">{d.title}</span>
        <span className="dv2-row__badge">{d.badge}</span>
        <svg className={`dv2-row__chevron${isExpanded ? " dv2-row__chevron--open" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {isExpanded && (
        <div className="dv2-expand">
          <p className="dv2-expand__desc">{d.desc}</p>
          {d.howToUse && d.howToUse.length > 0 && (
            <ol className="dv2-expand__steps">
              {d.howToUse.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          )}
          <div className="dv2-expand__actions">
            {d.needsCode && (
              generatedCode ? (
                <div className="dv2-expand__code-row">
                  <span className="dv2-expand__code-value">{generatedCode}</span>
                  <button className="dv2-expand__code-btn" onClick={copyCode} title="Kopiuj">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </button>
                  {copied && <span className="dv2-expand__code-toast">Skopiowano</span>}
                </div>
              ) : (
                <button className="dv2-expand__btn dv2-expand__btn--primary" onClick={generateCode}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M5.99479 6.0026H6.00146M9.99479 6.0026L5.99479 10.0026M9.99479 10.0026H10.0015M1.32812 6.0026C1.85856 6.0026 2.36727 6.21332 2.74234 6.58839C3.11741 6.96346 3.32813 7.47217 3.32813 8.0026C3.32813 8.53304 3.11741 9.04175 2.74234 9.41682C2.36727 9.79189 1.85856 10.0026 1.32812 10.0026L1.32812 11.3359C1.32812 11.6896 1.4686 12.0287 1.71865 12.2787C1.9687 12.5288 2.30784 12.6693 2.66146 12.6693L13.3281 12.6693C13.6817 12.6693 14.0209 12.5288 14.2709 12.2787C14.521 12.0287 14.6615 11.6896 14.6615 11.3359V10.0026C14.131 10.0026 13.6223 9.79189 13.2472 9.41682C12.8722 9.04175 12.6615 8.53304 12.6615 8.0026C12.6615 7.47217 12.8722 6.96346 13.2472 6.58839C13.6223 6.21332 14.131 6.0026 14.6615 6.0026V4.66927C14.6615 4.31565 14.521 3.97651 14.2709 3.72646C14.0209 3.47641 13.6817 3.33594 13.3281 3.33594L2.66146 3.33594C2.30784 3.33594 1.9687 3.47641 1.71865 3.72646C1.4686 3.97651 1.32813 4.31565 1.32812 4.66927L1.32812 6.0026Z" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Wygeneruj kod
                </button>
              )
            )}
            {d.url && (
              <a href={d.url} target="_blank" rel="noopener noreferrer" className="dv2-expand__btn" onClick={(e) => e.stopPropagation()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Strona partnera
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function packByPartner(items) {
  const map = new Map();
  items.forEach(d => {
    const key = d.partner;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(d);
  });
  return Array.from(map.values());
}

function bestBadge(group) {
  const badges = group.map(d => d.badge);
  if (badges.every(b => b === badges[0])) return badges[0];

  function numVal(badge) {
    const clean = badge.replace(/^do\s+/, "");
    const pct = clean.match(/-?\s*(\d[\d\s]*)\s*%/);
    if (pct) return parseFloat(pct[1].replace(/\s/g, ""));
    const money = clean.match(/-?\s*(\d[\d\s]*)\s*zł/);
    if (money) return parseFloat(money[1].replace(/\s/g, ""));
    return 0;
  }

  let best = badges[0], bestVal = numVal(badges[0]);
  for (let i = 1; i < badges.length; i++) {
    const v = numVal(badges[i]);
    if (v > bestVal) { bestVal = v; best = badges[i]; }
  }
  return best.startsWith("do ") ? best : "do " + best;
}

function DiscountsV2Partner({ group, expandedId, toggleExpand }) {
  const [open, setOpen] = useState(false);
  const first = group[0];

  if (group.length === 1) {
    return <DiscountsV2Row d={first} isExpanded={expandedId === first.id} onToggle={() => toggleExpand(first.id)} />;
  }

  return (
    <div className="dv2-item">
      <button className="dv2-row" onClick={() => setOpen(!open)}>
        <img src={first.logo} alt={first.partner} className="dv2-row__logo" />
        <span className="dv2-row__partner">{first.partner}</span>
        <span className="dv2-row__title">{group.length} oferty</span>
        <span className="dv2-row__badge">{bestBadge(group)}</span>
        <svg className={`dv2-row__chevron${open ? " dv2-row__chevron--open" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="dv2-sublist">
          {group.map(d => (
            <DiscountsV2Row key={d.id} d={d} isExpanded={expandedId === d.id} onToggle={() => toggleExpand(d.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function DiscountsV2View() {
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const filtered = filter === "all" ? DISCOUNTS : DISCOUNTS.filter(d => d.category === filter);

  const grouped = DISCOUNT_CATEGORIES.filter(c => c.id !== "all").map(cat => {
    const items = DISCOUNTS.filter(d => d.category === cat.id);
    return items.length > 0 ? { ...cat, items } : null;
  }).filter(Boolean);

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  const renderPacked = (items) => {
    const packed = packByPartner(items);
    return packed.map((group, i) => (
      <DiscountsV2Partner key={group[0].partner + i} group={group} expandedId={expandedId} toggleExpand={toggleExpand} />
    ));
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Zniżki</h2>
        <p className="text-sm text-muted">Kompaktowy widok ofert i rabatów.</p>
      </div>
      <div className="filter-bar">
        {DISCOUNT_CATEGORIES.map(c => (
          <button key={c.id} className={`filter-pill${filter === c.id ? " filter-pill--active" : ""}`} onClick={() => setFilter(c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      {filter === "all" ? (
        grouped.map(group => (
          <div key={group.id} className="dv2-group">
            <div className="dv2-group__header">
              <span className="dv2-group__label">{group.label}</span>
              <span className="dv2-group__count">{group.items.length} {group.items.length === 1 ? "oferta" : group.items.length < 5 ? "oferty" : "ofert"}</span>
            </div>
            <div className="dv2-list">
              {renderPacked(group.items)}
            </div>
          </div>
        ))
      ) : (
        <div className="dv2-list">
          {renderPacked(filtered)}
        </div>
      )}
    </div>
  );
}

// ─── DISCOUNTS V3 VIEW (coupon cards) ─────────────────────────────────────────

function DiscountsV3Coupon({ d }) {
  const [generatedCode, setGeneratedCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const catLabel = DISCOUNT_CATEGORIES.find(c => c.id === d.category)?.label || d.category;

  const generateCode = (e) => {
    e.stopPropagation();
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "KM-";
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setGeneratedCode(code);
  };
  const copyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dv3-coupon">
      <div className="dv3-coupon__tag" data-cat={d.category}>{catLabel}</div>
      <div className="dv3-coupon__body">
        <div className="dv3-coupon__header">
          <img src={d.logo} alt={d.partner} className="dv3-coupon__logo" />
          <span className="dv3-coupon__partner">{d.partner}</span>
          <span className="dv3-coupon__badge">{d.badge}</span>
        </div>
        <div className="dv3-coupon__title">{d.title}</div>
        <p className="dv3-coupon__desc">{d.desc}</p>
      </div>
      <div className="dv3-coupon__footer">
        {d.needsCode && (
          generatedCode ? (
            <button className="dv3-coupon__btn dv3-coupon__btn--code" onClick={copyCode}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              {copied ? "Skopiowano!" : generatedCode}
            </button>
          ) : (
            <button className="dv3-coupon__btn dv3-coupon__btn--generate" onClick={generateCode}>
              Wygeneruj kod
            </button>
          )
        )}
        {d.url && (
          <a href={d.url} target="_blank" rel="noopener noreferrer" className="dv3-coupon__btn dv3-coupon__btn--link">
            Strona partnera
          </a>
        )}
      </div>
    </div>
  );
}

function DiscountsV3View() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? DISCOUNTS : DISCOUNTS.filter(d => d.category === filter);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Zniżki</h2>
        <p className="text-sm text-muted">Kupony i oferty od partnerów.</p>
      </div>
      <div className="filter-bar">
        {DISCOUNT_CATEGORIES.map(c => (
          <button key={c.id} className={`filter-pill${filter === c.id ? " filter-pill--active" : ""}`} onClick={() => setFilter(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="dv3-grid">
        {filtered.map(d => (
          <DiscountsV3Coupon key={d.id} d={d} />
        ))}
      </div>
    </div>
  );
}

// ─── DISCOUNTS V4 — CLAIMABLE COUPONS ─────────────────────────────────────────

function DiscountsV4Coupon({ d, onClaim }) {
  const [claimed, setClaimed] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const catLabel = DISCOUNT_CATEGORIES.find(c => c.id === d.category)?.label || d.category;

  const claim = () => {
    if (claimed) return;
    if (d.needsCode) {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "KM-";
      for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
      setGeneratedCode(code);
    }
    setClaimed(true);
    onClaim(d.partner);
  };

  const copyCode = (e) => {
    e.stopPropagation();
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`dv4-coupon${claimed ? " dv4-coupon--claimed" : ""}`}>
      <div className="dv4-coupon__main">
        <div className="dv4-coupon__tag" data-cat={d.category}>{catLabel}</div>
        <div className="dv4-coupon__body">
          <div className="dv4-coupon__header">
            <img src={d.logo} alt={d.partner} className="dv4-coupon__logo" />
            <span className="dv4-coupon__partner">{d.partner}</span>
            <span className="dv4-coupon__badge">{d.badge}</span>
          </div>
          <div className="dv4-coupon__title">{d.title}</div>
        </div>
      </div>
      <div className="dv4-coupon__tear">
        {!claimed ? (
          <button className="dv4-coupon__claim" onClick={claim}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M12 8v8M8 12h8"/></svg>
            Odbierz kupon
          </button>
        ) : (
          <div className="dv4-coupon__unlocked">
            {d.needsCode && generatedCode && (
              <button className="dv4-coupon__code" onClick={copyCode}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                {copied ? "Skopiowano!" : generatedCode}
              </button>
            )}
            {d.url && (
              <a href={d.url} target="_blank" rel="noopener noreferrer" className="dv4-coupon__go">
                Skorzystaj u partnera
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DiscountsV4View() {
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState(null);
  const toastTimer = React.useRef(null);
  const filtered = filter === "all" ? DISCOUNTS : DISCOUNTS.filter(d => d.category === filter);

  const showToast = (partner) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(partner);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Zniżki</h2>
        <p className="text-sm text-muted">Odbierz kupony i aktywuj rabaty u partnerów.</p>
      </div>
      <div className="filter-bar">
        {DISCOUNT_CATEGORIES.map(c => (
          <button key={c.id} className={`filter-pill${filter === c.id ? " filter-pill--active" : ""}`} onClick={() => setFilter(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="dv4-grid">
        {filtered.map(d => (
          <DiscountsV4Coupon key={d.id} d={d} onClaim={showToast} />
        ))}
      </div>
      {toast && (
        <div className="dv4-toast" key={toast}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          <span>Kupon <strong>{toast}</strong> przypisany do Twojego konta</span>
        </div>
      )}
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
    { id: "ergo", name: "Ergo Hestia", logo: "../ubezpieczenia/loga/ergohestia.png", price: ergoTotal, available: true, excludes: [] },
    { id: "inter", name: "INTER Ubezpieczenia", logo: "../ubezpieczenia/loga/inter logo.webp", price: interTotal, available: true, excludes: ["aesthetic"] },
    { id: "pzu", name: "PZU", logo: "../ubezpieczenia/loga/PZU_logo.png", price: null, available: false, excludes: [] },
    { id: "lloyds", name: "Lloyd's", logo: "../ubezpieczenia/loga/lloyds.png", price: null, available: false, excludes: [] },
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
    ? "../ubezpieczenia/loga/inter logo.webp"
    : "../ubezpieczenia/loga/ergohestia.png";
  return (
    <span className="oc-insurer-badge">
      <img src={src} alt={insurer} style={{ height: 12, maxHeight: 12, width: "auto", maxWidth: 56, objectFit: "contain", display: "block" }} />
    </span>
  );
}

const V2_STEPS = ["Profil ryzyka", "Zakres OC", "Rozszerzenia", "Produkty INTER", "Podsumowanie"];

function OcFormV2() {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState("form");
  const [submitted, setSubmitted] = useState(false);

  /* ── Step 0: profil ryzyka ── */
  const [spec1, setSpec1] = useState("Kardiologia");
  const [spec1Confirmed, setSpec1Confirmed] = useState(false);
  const [spec2, setSpec2] = useState("");
  const [sor, setSor] = useState(null);
  const [nightEmergency, setNightEmergency] = useState(null);
  const [surgicalProc, setSurgicalProc] = useState(null);

  /* ── Step 1: zakres OC ── */
  const [practice, setPractice] = useState(null);
  const [surplusSum, setSurplusSum] = useState("");
  const [voluntarySum, setVoluntarySum] = useState("");
  const [interMandatorySum, setInterMandatorySum] = useState("");
  const [interVoluntaryOc, setInterVoluntaryOc] = useState(null);
  const [interVoluntarySum, setInterVoluntarySum] = useState("");
  const [regressWaiver, setRegressWaiver] = useState(null);
  const [hasOwnOffice, setHasOwnOffice] = useState(null);
  const [officeSub, setOfficeSub] = useState(0);
  const [employsMedStaff, setEmploysMedStaff] = useState(null);
  const [leasesEquipment, setLeasesEquipment] = useState(null);

  /* ── Step 2: rozszerzenia ── */
  const [extras, setExtras] = useState({ legal: false, aesthetic: false, nfz: false, hiv: false });
  const [extraVariants, setExtraVariants] = useState(() => {
    const ev = {}; OC_EXTRAS.forEach(ex => { ev[ex.key] = ex.defaultVariant; }); return ev;
  });
  const [interLegalVariant, setInterLegalVariant] = useState(0);
  const [interHivVariant, setInterHivVariant] = useState(0);
  const [plasticSurgery, setPlasticSurgery] = useState(null);
  const [euroTransport, setEuroTransport] = useState(null);
  const [patientRights, setPatientRights] = useState(null);
  const [patientRightsSub, setPatientRightsSub] = useState(0);
  const [courtExpert, setCourtExpert] = useState(null);
  const [psychHelp, setPsychHelp] = useState(null);
  const [psychHelpVariant, setPsychHelpVariant] = useState(0);
  const [hadClaim, setHadClaim] = useState(null);
  const [claimCount, setClaimCount] = useState(0);
  const [nfzSub, setNfzSub] = useState(0);

  /* ── Step 3: produkty INTER ── */
  const [interTour, setInterTour] = useState(false);
  const [interTourVariant, setInterTourVariant] = useState(0);
  const [interTourExtreme, setInterTourExtreme] = useState(false);
  const [interTourPoland, setInterTourPoland] = useState(false);
  const [interTourGroup, setInterTourGroup] = useState(false);

  /* ── Offers ── */
  const [expandedOffer, setExpandedOffer] = useState(null);
  const [compareMode, setCompareMode] = useState(false);

  const rg = ocRiskGroup(spec1, spec2, sor);

  /* ── calc ── */
  const d = {
    spec1, spec2, sor, practice, surplusSum, voluntarySum,
    interMandatorySum, interVoluntaryOc, interVoluntarySum,
    regressWaiver, nightEmergency, surgicalProc,
    employsMedStaff, leasesEquipment, euroTransport,
    aesthetic: extras.aesthetic, plasticSurgery, patientRights, patientRightsSub,
    courtExpert, hasOwnOffice, officeSub,
    legal: extras.legal, interLegalVariant,
    hiv: extras.hiv, interHivVariant,
    nfz: extras.nfz, nfzSub,
    psychHelp, psychHelpVariant,
    interTour, interTourVariant, interTourExtreme, interTourPoland, interTourGroup,
    hadClaim, claimCount, extraVariants,
  };
  const ergo = ocCalc(d);
  const inter = interCalc(d);

  const canNext = () => {
    if (step === 0) return spec1 && spec1Confirmed && sor !== null;
    if (step === 1) return practice !== null;
    if (step === 2) return hadClaim !== null;
    return true;
  };

  const startCalc = () => {
    setPhase("loading");
    setTimeout(() => setPhase("offers"), 2800);
  };

  /* ── Offers phase ── */
  if (phase === "loading") {
    return (
      <div className="oc-form">
        <div className="oc-loading">
          <p className="oc-loading__title">Porównujemy oferty ubezpieczycieli…</p>
          <div className="oc-loading__logos">
            {INS_PARTNERS.map((p, i) => (
              <img key={p.name} className="oc-loading__logo" src={p.logo} alt={p.name}
                style={{ height: p.h, animationDelay: i * 0.4 + "s" }} />
            ))}
          </div>
          <div className="oc-loading__bar"><div className="oc-loading__bar-fill" /></div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="oc-form">
        <div className="oc-done">
          <div className="oc-done__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <h3>Zapytanie wysłane!</h3>
          <p className="text-sm text-muted">Doradca skontaktuje się z Tobą w ciągu 24 h z indywidualną wyceną.</p>
        </div>
      </div>
    );
  }

  if (phase === "offers") {
    const offers = [
      { id: "ergo",  name: "Ergo Hestia",        logo: "../ubezpieczenia/loga/ergohestia.png", price: ergo.total, available: !hadClaim, items: ergo.items },
      { id: "inter", name: "INTER Ubezpieczenia", logo: "../ubezpieczenia/loga/inter logo.webp", price: inter.total, available: !hadClaim || claimCount <= 2, items: inter.items },
      { id: "pzu",   name: "PZU",   logo: "../ubezpieczenia/loga/PZU_logo.png", price: null, available: false, items: [] },
      { id: "lloyds",name: "Lloyd's",logo: "../ubezpieczenia/loga/lloyds.png",   price: null, available: false, items: [] },
    ];
    const cheapest = offers.filter(o => o.available && o.price).sort((a, b) => a.price - b.price)[0]?.id;

    return (
      <div className="oc-form">
        <div className="oc-offers__tabs">
          <button className={"oc-offers__tab" + (!compareMode ? " oc-offers__tab--active" : "")} onClick={() => setCompareMode(false)}>Lista ofert</button>
          <button className={"oc-offers__tab" + (compareMode ? " oc-offers__tab--active" : "")} onClick={() => setCompareMode(true)}>Porównaj oferty</button>
        </div>

        {!compareMode && (
          <div className="oc-offers__list">
            {offers.map((o, i) => {
              const isOpen = expandedOffer === o.id;
              return (
                <div key={o.id} className={"oc-offer" + (isOpen ? " oc-offer--expanded" : "") + (!o.available ? " oc-offer--pending" : "")}
                     style={{ animationDelay: i * 0.08 + "s" }}>
                  <div className="oc-offer__header" onClick={() => o.available && setExpandedOffer(isOpen ? null : o.id)}>
                    <div className="oc-offer__logo"><img src={o.logo} alt={o.name} /></div>
                    <div className="oc-offer__body">
                      <div className="oc-offer__name">
                        {o.name}
                        {o.id === cheapest && <span className="oc-offer__best">Najlepsza cena</span>}
                      </div>
                      {o.price != null ? (
                        <div className="oc-offer__price">
                          {!isOpen && <span className="text-sm text-muted">Rozwiń, aby zobaczyć cenę</span>}
                          {isOpen && <>{o.price} zł<span className="text-muted"> / rok</span></>}
                        </div>
                      ) : (
                        <div className="oc-offer__pending">Wkrótce dostępne</div>
                      )}
                    </div>
                    {o.available ? (
                      <svg className="oc-offer__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                    ) : (
                      <svg className="oc-offer__lock" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    )}
                  </div>
                  {isOpen && o.items.length > 0 && (
                    <div className="oc-offer__details">
                      <div className="oc-offer__scope">
                        <div className="oc-offer__scope-title">Zakres ochrony</div>
                        {o.items.map((it, j) => (
                          <div key={j} className="oc-offer__scope-row">
                            <div className="oc-offer__scope-row-main">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5"><path d="m5 13 4 4L19 7"/></svg>
                              <span>{it.label}</span>
                              <span className="oc-offer__scope-price">{it.amount} zł</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="oc-offer__meta">
                        <span>Składka roczna: <strong>{o.price} zł</strong></span>
                        <span>lub dwie raty: <strong>{Math.ceil(o.price / 2)} zł × 2</strong></span>
                      </div>
                      <button className="oc-offer__select-btn" onClick={() => setSubmitted(true)}>Wybierz tę ofertę</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {compareMode && (
          <div className="oc-compare">
            <table className="oc-compare__table">
              <thead>
                <tr>
                  <th />
                  {offers.filter(o => o.available).map(o => (
                    <th key={o.id}>
                      <div className="oc-compare__insurer">
                        <img className="oc-compare__logo" src={o.logo} alt={o.name} />
                        <span className="oc-compare__name">{o.name}</span>
                        {o.id === cheapest && <span className="oc-compare__best">Najlepsza cena</span>}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Collect all unique labels */}
                {(() => {
                  const available = offers.filter(o => o.available);
                  const allLabels = [...new Set(available.flatMap(o => o.items.map(it => it.label)))];
                  return allLabels.map(label => (
                    <tr key={label}>
                      <td>{label}</td>
                      {available.map(o => {
                        const it = o.items.find(x => x.label === label);
                        return <td key={o.id}>{it ? <span className="oc-compare__yes"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5"><path d="m5 13 4 4L19 7"/></svg> {it.amount} zł</span> : "—"}</td>;
                      })}
                    </tr>
                  ));
                })()}
              </tbody>
              <tfoot>
                <tr className="oc-compare__row--total">
                  <td><strong>Razem / rok</strong></td>
                  {offers.filter(o => o.available).map(o => (
                    <td key={o.id}><strong>{o.price} zł</strong></td>
                  ))}
                </tr>
                <tr>
                  <td />
                  {offers.filter(o => o.available).map(o => (
                    <td key={o.id}>
                      <button className="oc-compare__select-btn" onClick={() => setSubmitted(true)}>Wybieram</button>
                      <span className="oc-compare__or-installment">lub dwie raty: {Math.ceil(o.price / 2)} zł × 2</span>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <button className="oc-nav__back" onClick={() => { setPhase("form"); setStep(4); }}>← Wróć do formularza</button>
        </div>
      </div>
    );
  }

  /* ── Form phase ── */
  return (
    <div className="oc-form">
      {/* stepper */}
      <div className="oc-steps">
        {V2_STEPS.map((label, i) => (
          <div key={i} className={"oc-steps__item" + (i === step ? " oc-steps__item--active" : "") + (i < step ? " oc-steps__item--done" : "")}>
            <div className="oc-steps__dot">{i < step ? "✓" : i + 1}</div>
            <span className="oc-steps__label">{label}</span>
          </div>
        ))}
      </div>

      {/* ── STEP 0 ── */}
      {step === 0 && (
        <div className="oc-step">
          <h3 className="oc-step__title">Profil ryzyka</h3>
          <p className="oc-step__desc">Twoja specjalizacja i zakres pracy wpływają na grupę ryzyka i składkę.</p>

          <div className="oc-field">
            <label className="oc-field__label">Specjalizacja główna</label>
            {!spec1Confirmed ? (
              <div className="oc-spec-confirm">
                <span className="oc-spec-confirm__label">Z profilu:</span>
                <span className="oc-spec-confirm__value">{spec1}</span>
                <button className="oc-spec-confirm__btn" onClick={() => setSpec1Confirmed(true)}>Potwierdzam</button>
              </div>
            ) : (
              <div className="oc-spec-confirmed">
                <div className="oc-spec-confirmed__info">
                  <span className="oc-spec-confirmed__name">{spec1}</span>
                  <span className="oc-spec-confirmed__group">Grupa {rg}</span>
                </div>
                <button className="oc-spec-confirmed__change" onClick={() => setSpec1Confirmed(false)}>Zmień</button>
              </div>
            )}
            {!spec1Confirmed && (
              <details className="oc-spec-confirm__details">
                <summary>Inna specjalizacja?</summary>
                <select className="oc-select" value={spec1} onChange={e => setSpec1(e.target.value)} style={{ marginTop: 6 }}>
                  <option value="">— Wybierz —</option>
                  {OC_ALL_SPECS.map(s => <option key={s.name} value={s.name}>{s.name} (grupa {s.group})</option>)}
                </select>
              </details>
            )}
          </div>

          <div className="oc-field">
            <label className="oc-field__label">Druga specjalizacja (opcjonalnie)</label>
            <select className="oc-select" value={spec2} onChange={e => setSpec2(e.target.value)}>
              <option value="">— Brak —</option>
              {OC_ALL_SPECS.filter(s => s.name !== spec1).map(s => <option key={s.name} value={s.name}>{s.name} (grupa {s.group})</option>)}
            </select>
          </div>

          <div className="oc-field">
            <label className="oc-field__label">Pracujesz na SOR / pogotowie?</label>
            <div className="oc-toggle">
              <button className={"oc-toggle__btn" + (sor === true ? " oc-toggle__btn--on" : "")} onClick={() => setSor(true)}>Tak</button>
              <button className={"oc-toggle__btn" + (sor === false ? " oc-toggle__btn--on" : "")} onClick={() => setSor(false)}>Nie</button>
            </div>
            {sor && <div className="oc-field__warn">Praca na SOR automatycznie kwalifikuje do grupy ryzyka III.</div>}
          </div>

          <div className="oc-field oc-field--inter">
            <label className="oc-field__label">Nocna/świąteczna pomoc z wyjazdami? <InsurerBadge insurer="inter" /></label>
            <div className="oc-toggle">
              <button className={"oc-toggle__btn" + (nightEmergency === true ? " oc-toggle__btn--on" : "")} onClick={() => setNightEmergency(true)}>Tak</button>
              <button className={"oc-toggle__btn" + (nightEmergency === false ? " oc-toggle__btn--on" : "")} onClick={() => setNightEmergency(false)}>Nie</button>
            </div>
          </div>

          <div className="oc-field oc-field--inter">
            <label className="oc-field__label">Zabiegi chirurgiczne / endoskopowe / radiologia interwencyjna? <InsurerBadge insurer="inter" /></label>
            <div className="oc-toggle">
              <button className={"oc-toggle__btn" + (surgicalProc === true ? " oc-toggle__btn--on" : "")} onClick={() => setSurgicalProc(true)}>Tak</button>
              <button className={"oc-toggle__btn" + (surgicalProc === false ? " oc-toggle__btn--on" : "")} onClick={() => setSurgicalProc(false)}>Nie</button>
            </div>
          </div>

          {spec1Confirmed && (
            <div className="oc-risk-badge">
              Twoja grupa ryzyka: <strong>Grupa {rg}</strong>
              {rg === 3 && " — najwyższa"}
              {rg === 2 && " — średnia"}
              {rg === 1 && " — podstawowa"}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div className="oc-step">
          <h3 className="oc-step__title">Zakres OC</h3>
          <p className="oc-step__desc">Określ formę wykonywania zawodu i zakres ochrony.</p>

          <div className="oc-field">
            <label className="oc-field__label">Prowadzisz praktykę lekarską?</label>
            <div className="oc-toggle">
              <button className={"oc-toggle__btn" + (practice === true ? " oc-toggle__btn--on" : "")} onClick={() => setPractice(true)}>Tak</button>
              <button className={"oc-toggle__btn" + (practice === false ? " oc-toggle__btn--on" : "")} onClick={() => setPractice(false)}>Nie</button>
            </div>
          </div>

          {practice === true && (
            <React.Fragment>
              <div className="oc-field__info" style={{ marginBottom: 16 }}>
                OC obowiązkowe jest wymagane prawnie. Minimalna suma gwarancyjna: 75 000 EUR na zdarzenie.
              </div>

              <div className="oc-field oc-field--inter">
                <label className="oc-field__label">Suma gwarancyjna OC obowiązkowego <InsurerBadge insurer="inter" /></label>
                <p className="oc-field__hint">Dotyczy oferty INTER — wyższe sumy dają szerszą ochronę.</p>
                <select className="oc-select" value={interMandatorySum} onChange={e => setInterMandatorySum(e.target.value)}>
                  <option value="">— Suma minimalna —</option>
                  {INTER_MANDATORY_SUMS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div className="oc-field oc-field--ergo">
                <label className="oc-field__label">Podwyższenie sumy OC (nadwyżkowe) <InsurerBadge insurer="ergo" /></label>
                <p className="oc-field__hint">Dodatkowa ochrona ponad limit obowiązkowy — dotyczy oferty Ergo Hestia.</p>
                <div className="oc-sum-picker">
                  {OC_SUMS.map(s => (
                    <button key={s} className={"oc-sum-picker__btn" + (surplusSum === s ? " oc-sum-picker__btn--on" : "")}
                      onClick={() => setSurplusSum(surplusSum === s ? "" : s)}>
                      {s} <span className="text-muted" style={{ marginLeft: "auto", fontSize: 11 }}>+{OC_PREMIUM.surplus[s]?.[rg] || "?"} zł/rok</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="oc-field oc-field--inter">
                <label className="oc-field__label">Rezygnacja z prawa regresu? <InsurerBadge insurer="inter" /></label>
                <p className="oc-field__hint">Ubezpieczyciel nie będzie dochodził od Ciebie zwrotu wypłaconego odszkodowania.</p>
                <div className="oc-toggle">
                  <button className={"oc-toggle__btn" + (regressWaiver === true ? " oc-toggle__btn--on" : "")} onClick={() => setRegressWaiver(true)}>Tak</button>
                  <button className={"oc-toggle__btn" + (regressWaiver === false ? " oc-toggle__btn--on" : "")} onClick={() => setRegressWaiver(false)}>Nie</button>
                </div>
              </div>

              <div className="oc-field oc-field--inter">
                <label className="oc-field__label">Posiadasz gabinet własny / najmowany? <InsurerBadge insurer="inter" /></label>
                <div className="oc-toggle">
                  <button className={"oc-toggle__btn" + (hasOwnOffice === true ? " oc-toggle__btn--on" : "")} onClick={() => setHasOwnOffice(true)}>Tak</button>
                  <button className={"oc-toggle__btn" + (hasOwnOffice === false ? " oc-toggle__btn--on" : "")} onClick={() => setHasOwnOffice(false)}>Nie</button>
                </div>
                {hasOwnOffice && (
                  <div style={{ marginTop: 8 }}>
                    <span className="oc-field__hint">Sublimit odpowiedzialności:</span>
                    <div className="oc-sum-picker" style={{ marginTop: 4 }}>
                      {INTER_KLAUZULE.office.sublimits.map((s, i) => (
                        <button key={s} className={"oc-sum-picker__btn" + (officeSub === i ? " oc-sum-picker__btn--on" : "")} onClick={() => setOfficeSub(i)}>
                          {s} <span className="text-muted" style={{ marginLeft: "auto", fontSize: 11 }}>+{INTER_KLAUZULE.office.prices[i]} zł</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="oc-field oc-field--inter">
                <label className="oc-field__label">Zatrudniasz personel medyczny? <InsurerBadge insurer="inter" /></label>
                <div className="oc-toggle">
                  <button className={"oc-toggle__btn" + (employsMedStaff === true ? " oc-toggle__btn--on" : "")} onClick={() => setEmploysMedStaff(true)}>Tak</button>
                  <button className={"oc-toggle__btn" + (employsMedStaff === false ? " oc-toggle__btn--on" : "")} onClick={() => setEmploysMedStaff(false)}>Nie</button>
                </div>
              </div>

              <div className="oc-field oc-field--inter">
                <label className="oc-field__label">Leasingujesz sprzęt medyczny? <InsurerBadge insurer="inter" /></label>
                <div className="oc-toggle">
                  <button className={"oc-toggle__btn" + (leasesEquipment === true ? " oc-toggle__btn--on" : "")} onClick={() => setLeasesEquipment(true)}>Tak</button>
                  <button className={"oc-toggle__btn" + (leasesEquipment === false ? " oc-toggle__btn--on" : "")} onClick={() => setLeasesEquipment(false)}>Nie</button>
                </div>
              </div>
            </React.Fragment>
          )}

          {practice === false && (
            <React.Fragment>
              <div className="oc-field oc-field--ergo">
                <label className="oc-field__label">Suma OC dobrowolnego (PLN) <InsurerBadge insurer="ergo" /></label>
                <div className="oc-sum-picker">
                  {OC_SUMS.map(s => (
                    <button key={s} className={"oc-sum-picker__btn" + (voluntarySum === s ? " oc-sum-picker__btn--on" : "")}
                      onClick={() => setVoluntarySum(voluntarySum === s ? "" : s)}>
                      {s} <span className="text-muted" style={{ marginLeft: "auto", fontSize: 11 }}>+{OC_PREMIUM.surplus[s]?.[rg] || "?"} zł/rok</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="oc-field oc-field--inter">
                <label className="oc-field__label">OC dobrowolne (EUR) <InsurerBadge insurer="inter" /></label>
                <div className="oc-toggle" style={{ marginBottom: 8 }}>
                  <button className={"oc-toggle__btn" + (interVoluntaryOc === true ? " oc-toggle__btn--on" : "")} onClick={() => setInterVoluntaryOc(true)}>Ubezpieczam</button>
                  <button className={"oc-toggle__btn" + (interVoluntaryOc === false ? " oc-toggle__btn--on" : "")} onClick={() => setInterVoluntaryOc(false)}>Rezygnuję</button>
                </div>
                {interVoluntaryOc && (
                  <div className="oc-sum-picker">
                    {INTER_VOLUNTARY_SUMS.map(s => (
                      <button key={s.value} className={"oc-sum-picker__btn" + (interVoluntarySum === s.value ? " oc-sum-picker__btn--on" : "")}
                        onClick={() => setInterVoluntarySum(interVoluntarySum === s.value ? "" : s.value)}>
                        {s.label} <span className="text-muted" style={{ marginLeft: "auto", fontSize: 11 }}>+{s.price} zł/rok</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </React.Fragment>
          )}
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <div className="oc-step">
          <h3 className="oc-step__title">Rozszerzenia ochrony</h3>
          <p className="oc-step__desc">Dopasuj zakres do swoich potrzeb.</p>

          {/* Full protection toggle */}
          <div className={"oc-extra oc-extra--full" + (extras.legal && extras.aesthetic && extras.nfz && extras.hiv ? " oc-extra--on" : "")}
            onClick={() => {
              const allOn = extras.legal && extras.aesthetic && extras.nfz && extras.hiv;
              setExtras({ legal: !allOn, aesthetic: !allOn, nfz: !allOn, hiv: !allOn });
            }}>
            <div className="oc-extra__top">
              <div className="oc-extra__check">{extras.legal && extras.aesthetic && extras.nfz && extras.hiv ? "✓" : ""}</div>
              <div className="oc-extra__body">
                <span className="oc-extra__name">Dodaj Pełną Ochronę <span className="oc-extra__rec">Zalecane</span></span>
                <span className="oc-extra__hint">Wszystkie rozszerzenia w jednym pakiecie</span>
              </div>
            </div>
          </div>

          <div className="oc-extras">
            {OC_EXTRAS.map(ex => {
              const on = extras[ex.key];
              return (
                <div key={ex.key} className={"oc-extra" + (on ? " oc-extra--on" : "")}>
                  <div className="oc-extra__top" onClick={() => setExtras(prev => ({ ...prev, [ex.key]: !prev[ex.key] }))}>
                    <div className="oc-extra__check">{on ? "✓" : ""}</div>
                    <div className="oc-extra__body">
                      <span className="oc-extra__name">
                        {ex.label}
                        {ex.recommended && <span className="oc-extra__rec">Zalecane</span>}
                      </span>
                    </div>
                    <span className="oc-extra__price">{ex.variants[extraVariants[ex.key]]?.price || ex.variants[0].price} zł</span>
                  </div>
                  {on && ex.variants.length > 1 && (
                    <div className="oc-extra__variants">
                      <span className="oc-extra__variants-label">Suma ubezpieczenia:</span>
                      <div className="oc-extra__variants-btns">
                        {ex.variants.map((v, vi) => (
                          <button key={vi} className={"oc-extra__var-btn" + (extraVariants[ex.key] === vi ? " oc-extra__var-btn--on" : "")}
                            onClick={() => setExtraVariants(prev => ({ ...prev, [ex.key]: vi }))}>
                            {v.sum} — {v.price} zł
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* INTER-specific variants for shared extensions */}
                  {on && ex.key === "legal" && (
                    <div className="oc-extra__variants" style={{ borderTop: "1px dashed var(--color-border)" }}>
                      <span className="oc-extra__variants-label"><InsurerBadge insurer="inter" /> Wariant INTER (Ochrona Prawna):</span>
                      <div className="oc-extra__variants-btns">
                        {INTER_LEGAL_VARIANTS.map((v, vi) => (
                          <button key={vi} className={"oc-extra__var-btn" + (interLegalVariant === vi ? " oc-extra__var-btn--on" : "")}
                            onClick={() => setInterLegalVariant(vi)}>{v.label} — {v.price} zł</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {on && ex.key === "hiv" && (
                    <div className="oc-extra__variants" style={{ borderTop: "1px dashed var(--color-border)" }}>
                      <span className="oc-extra__variants-label"><InsurerBadge insurer="inter" /> Wariant INTER (HIV/WZW z NNW):</span>
                      <div className="oc-extra__variants-btns">
                        {INTER_HIV_VARIANTS.map((v, vi) => (
                          <button key={vi} className={"oc-extra__var-btn" + (interHivVariant === vi ? " oc-extra__var-btn--on" : "")}
                            onClick={() => setInterHivVariant(vi)}>{v.label} — {v.price} zł</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {on && ex.key === "nfz" && (
                    <div className="oc-extra__variants" style={{ borderTop: "1px dashed var(--color-border)" }}>
                      <span className="oc-extra__variants-label"><InsurerBadge insurer="inter" /> Suma INTER (kl. 23):</span>
                      <div className="oc-extra__variants-btns">
                        {INTER_KLAUZULE.nfzFines.sums.map((s, i) => (
                          <button key={i} className={"oc-extra__var-btn" + (nfzSub === i ? " oc-extra__var-btn--on" : "")}
                            onClick={() => setNfzSub(i)}>{s} — {INTER_KLAUZULE.nfzFines.prices[i]} zł</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* INTER-specific: chirurgia plastyczna */}
          <div className="oc-field oc-field--inter" style={{ marginTop: 16 }}>
            <label className="oc-field__label">Chirurgia plastyczna (kl. 5B) <InsurerBadge insurer="inter" /></label>
            <p className="oc-field__hint">Oddzielne od medycyny estetycznej — dotyczy wyłącznie INTER.</p>
            <div className="oc-toggle">
              <button className={"oc-toggle__btn" + (plasticSurgery === true ? " oc-toggle__btn--on" : "")} onClick={() => setPlasticSurgery(true)}>Tak</button>
              <button className={"oc-toggle__btn" + (plasticSurgery === false ? " oc-toggle__btn--on" : "")} onClick={() => setPlasticSurgery(false)}>Nie</button>
            </div>
          </div>

          {/* INTER collapsible section */}
          <details className="oc-inter-section">
            <summary>
              <img src="../ubezpieczenia/loga/inter logo.webp" className="oc-inter-section__logo" alt="INTER" />
              Dodatkowe klauzule INTER
            </summary>
            <div style={{ padding: "12px 0", display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="oc-field">
                <label className="oc-field__label">Transport medyczny w Europie (kl. 4)</label>
                <div className="oc-toggle">
                  <button className={"oc-toggle__btn" + (euroTransport === true ? " oc-toggle__btn--on" : "")} onClick={() => setEuroTransport(true)}>Tak (+{INTER_KLAUZULE.euroTransport.price} zł)</button>
                  <button className={"oc-toggle__btn" + (euroTransport === false ? " oc-toggle__btn--on" : "")} onClick={() => setEuroTransport(false)}>Nie</button>
                </div>
              </div>

              <div className="oc-field">
                <label className="oc-field__label">Naruszenie praw pacjenta (kl. 9)</label>
                <div className="oc-toggle">
                  <button className={"oc-toggle__btn" + (patientRights === true ? " oc-toggle__btn--on" : "")} onClick={() => setPatientRights(true)}>Tak</button>
                  <button className={"oc-toggle__btn" + (patientRights === false ? " oc-toggle__btn--on" : "")} onClick={() => setPatientRights(false)}>Nie</button>
                </div>
                {patientRights && (
                  <div className="oc-sum-picker" style={{ marginTop: 6 }}>
                    {INTER_KLAUZULE.patientRights.sublimits.map((s, i) => (
                      <button key={s} className={"oc-sum-picker__btn" + (patientRightsSub === i ? " oc-sum-picker__btn--on" : "")} onClick={() => setPatientRightsSub(i)}>
                        {s} <span className="text-muted" style={{ marginLeft: "auto", fontSize: 11 }}>+{INTER_KLAUZULE.patientRights.prices[i]} zł</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="oc-field">
                <label className="oc-field__label">Biegły sądowy / orzecznik (kl. 11)</label>
                <div className="oc-toggle">
                  <button className={"oc-toggle__btn" + (courtExpert === true ? " oc-toggle__btn--on" : "")} onClick={() => setCourtExpert(true)}>Tak (+{INTER_KLAUZULE.courtExpert.price} zł)</button>
                  <button className={"oc-toggle__btn" + (courtExpert === false ? " oc-toggle__btn--on" : "")} onClick={() => setCourtExpert(false)}>Nie</button>
                </div>
              </div>

              <div className="oc-field">
                <label className="oc-field__label">Pomoc psychologiczna</label>
                <div className="oc-toggle">
                  <button className={"oc-toggle__btn" + (psychHelp === true ? " oc-toggle__btn--on" : "")} onClick={() => setPsychHelp(true)}>Tak</button>
                  <button className={"oc-toggle__btn" + (psychHelp === false ? " oc-toggle__btn--on" : "")} onClick={() => setPsychHelp(false)}>Nie</button>
                </div>
                {psychHelp && (
                  <div className="oc-extra__variants-btns" style={{ marginTop: 6 }}>
                    {INTER_PSYCH.map((v, vi) => (
                      <button key={vi} className={"oc-extra__var-btn" + (psychHelpVariant === vi ? " oc-extra__var-btn--on" : "")}
                        onClick={() => setPsychHelpVariant(vi)}>{v.label} — {v.price} zł</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </details>

          {/* Claims */}
          <div className="oc-field" style={{ marginTop: 16 }}>
            <label className="oc-field__label">Szkody / roszczenia w ostatnich 3 latach?</label>
            <div className="oc-toggle">
              <button className={"oc-toggle__btn" + (hadClaim === false ? " oc-toggle__btn--on" : "")} onClick={() => { setHadClaim(false); setClaimCount(0); }}>Nie</button>
              <button className={"oc-toggle__btn" + (hadClaim === true ? " oc-toggle__btn--warn" : "")} onClick={() => setHadClaim(true)}>Tak</button>
            </div>
            {hadClaim && (
              <React.Fragment>
                <div className="oc-field oc-field--inter" style={{ marginTop: 10 }}>
                  <label className="oc-field__label">Ile szkód w ostatnich 36 miesiącach? <InsurerBadge insurer="inter" /></label>
                  <input type="number" min="0" max="20" className="oc-select" style={{ maxWidth: 120 }}
                    value={claimCount} onChange={e => setClaimCount(parseInt(e.target.value) || 0)} />
                </div>
                <div className="oc-field__error-box" style={{ marginTop: 8 }}>
                  Ergo Hestia: standardowa kalkulacja niedostępna — konsultant oceni indywidualnie.<br/>
                  INTER: {claimCount <= 2 ? "kalkulacja możliwa przy " + claimCount + " szkodach." : "wymagana indywidualna ocena."}
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 3: INTER extras ── */}
      {step === 3 && (
        <div className="oc-step">
          <h3 className="oc-step__title">Produkty dodatkowe INTER</h3>
          <p className="oc-step__desc">Opcjonalne produkty dostępne wyłącznie w ofercie INTER Polska.</p>

          <div className="oc-field__info" style={{ marginBottom: 16 }}>
            <img src="../ubezpieczenia/loga/inter logo.webp" alt="INTER" style={{ height: 14, verticalAlign: "middle", marginRight: 6 }} />
            Te produkty wpływają wyłącznie na ofertę INTER. Możesz je pominąć.
          </div>

          <div className={"oc-extra" + (interTour ? " oc-extra--on" : "")}>
            <div className="oc-extra__top" onClick={() => setInterTour(!interTour)}>
              <div className="oc-extra__check">{interTour ? "✓" : ""}</div>
              <div className="oc-extra__body">
                <span className="oc-extra__name">INTER Tour 365 — ubezpieczenie podróży</span>
                <span className="oc-extra__hint">Roczna polisa podróżna dla lekarzy.</span>
              </div>
            </div>
            {interTour && (
              <div style={{ padding: "12px 0 4px 36px", display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid var(--color-border)", marginTop: 8 }}>
                <div>
                  <span className="oc-extra__variants-label">Wariant:</span>
                  <div className="oc-extra__variants-btns" style={{ marginTop: 4 }}>
                    {INTER_TOUR.variants.map((v, vi) => (
                      <button key={vi} className={"oc-extra__var-btn" + (interTourVariant === vi ? " oc-extra__var-btn--on" : "")}
                        onClick={() => setInterTourVariant(vi)}>{v.label} — od {v.basePrice} zł</button>
                    ))}
                  </div>
                </div>
                <div className="oc-toggle" style={{ maxWidth: 400 }}>
                  <button className={"oc-toggle__btn" + (interTourExtreme ? " oc-toggle__btn--on" : "")} onClick={() => setInterTourExtreme(!interTourExtreme)}>Sporty ekstremalne (+{INTER_TOUR.extremeAddon} zł)</button>
                </div>
                <div className="oc-toggle" style={{ maxWidth: 400 }}>
                  <button className={"oc-toggle__btn" + (interTourPoland ? " oc-toggle__btn--on" : "")} onClick={() => setInterTourPoland(!interTourPoland)}>Polska (+{INTER_TOUR.polandAddon} zł)</button>
                </div>
                <div className="oc-toggle" style={{ maxWidth: 400 }}>
                  <button className={"oc-toggle__btn" + (interTourGroup ? " oc-toggle__btn--on" : "")} onClick={() => setInterTourGroup(!interTourGroup)}>Polisa grupowa (+{INTER_TOUR.groupAddon} zł)</button>
                </div>
              </div>
            )}
          </div>

          <button className="oc-skip-btn" onClick={() => { setInterTour(false); setStep(4); }}>
            Pomiń — nie potrzebuję dodatkowych produktów
          </button>
        </div>
      )}

      {/* ── STEP 4: Podsumowanie ── */}
      {step === 4 && (
        <div className="oc-step">
          <h3 className="oc-step__title">Podsumowanie</h3>
          <p className="oc-step__desc">Sprawdź dane i porównaj oferty.</p>

          <div className="oc-premium-card">
            <span className="oc-premium-card__label">Szacowana składka roczna</span>
            <span className="oc-premium-card__value">
              {Math.min(ergo.total, inter.total)} – {Math.max(ergo.total, inter.total)} zł
            </span>
            <div className="oc-premium-card__items">
              <div className="oc-premium-card__row"><span>Ergo Hestia</span><span>{ergo.total} zł / rok</span></div>
              <div className="oc-premium-card__row"><span>INTER Polska</span><span>{inter.total} zł / rok</span></div>
            </div>
          </div>

          <div className="oc-summary">
            <div className="oc-summary__row"><span>Specjalizacja</span><strong>{spec1}{spec2 ? ", " + spec2 : ""}</strong></div>
            <div className="oc-summary__row"><span>SOR / pogotowie</span><strong>{sor ? "Tak" : "Nie"}</strong></div>
            <div className="oc-summary__row"><span>Grupa ryzyka</span><strong>Grupa {rg}</strong></div>
            <div className="oc-summary__row"><span>Praktyka lekarska</span><strong>{practice ? "Tak" : "Nie"}</strong></div>

            {practice && surplusSum && <div className="oc-summary__row"><span>OC nadwyżkowe (Ergo)</span><strong>{surplusSum}</strong></div>}
            {practice && interMandatorySum && <div className="oc-summary__row"><span>Suma OC obowiązkowego (INTER)</span><strong>{INTER_MANDATORY_SUMS.find(s => s.value === interMandatorySum)?.label || interMandatorySum}</strong></div>}
            {!practice && voluntarySum && <div className="oc-summary__row"><span>OC dobrowolne (Ergo)</span><strong>{voluntarySum}</strong></div>}
            {!practice && interVoluntaryOc && interVoluntarySum && <div className="oc-summary__row"><span>OC dobrowolne (INTER)</span><strong>{INTER_VOLUNTARY_SUMS.find(s => s.value === interVoluntarySum)?.label || interVoluntarySum}</strong></div>}

            {nightEmergency && <div className="oc-summary__row"><span>Nocna/świąteczna pomoc</span><strong>Tak</strong></div>}
            {surgicalProc && <div className="oc-summary__row"><span>Zabiegi chirurgiczne</span><strong>Tak</strong></div>}
            {regressWaiver && <div className="oc-summary__row"><span>Rezygnacja z regresu</span><strong>Tak</strong></div>}
            {hasOwnOffice && <div className="oc-summary__row"><span>Gabinet (kl. 12)</span><strong>{INTER_KLAUZULE.office.sublimits[officeSub]}</strong></div>}
            {employsMedStaff && <div className="oc-summary__row"><span>Personel medyczny (kl. 1)</span><strong>Tak</strong></div>}
            {leasesEquipment && <div className="oc-summary__row"><span>Leasing sprzętu (kl. 2)</span><strong>Tak</strong></div>}

            {extras.legal && <div className="oc-summary__row"><span>Ochrona prawna</span><strong>{OC_EXTRAS[0].variants[extraVariants.legal]?.sum}</strong></div>}
            {extras.aesthetic && <div className="oc-summary__row"><span>Medycyna estetyczna</span><strong>{OC_EXTRAS[1].variants[extraVariants.aesthetic]?.sum}</strong></div>}
            {extras.nfz && <div className="oc-summary__row"><span>Kary NFZ</span><strong>{OC_EXTRAS[2].variants[extraVariants.nfz]?.sum}</strong></div>}
            {extras.hiv && <div className="oc-summary__row"><span>HIV/WZW</span><strong>Tak</strong></div>}

            {plasticSurgery && <div className="oc-summary__row"><span>Chirurgia plastyczna (kl. 5B)</span><strong>Tak</strong></div>}
            {euroTransport && <div className="oc-summary__row"><span>Transport Europa (kl. 4)</span><strong>Tak</strong></div>}
            {patientRights && <div className="oc-summary__row"><span>Prawa pacjenta (kl. 9)</span><strong>{INTER_KLAUZULE.patientRights.sublimits[patientRightsSub]}</strong></div>}
            {courtExpert && <div className="oc-summary__row"><span>Biegły sądowy (kl. 11)</span><strong>Tak</strong></div>}
            {psychHelp && <div className="oc-summary__row"><span>Pomoc psychologiczna</span><strong>{INTER_PSYCH[psychHelpVariant]?.label}</strong></div>}
            {interTour && <div className="oc-summary__row"><span>INTER Tour 365</span><strong>{INTER_TOUR.variants[interTourVariant]?.label}</strong></div>}

            <div className="oc-summary__row"><span>Szkodowość</span><strong>{hadClaim ? "Tak (" + claimCount + ")" : "Brak"}</strong></div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="oc-nav">
        {step > 0 && <button className="oc-nav__back" onClick={() => setStep(s => s - 1)}>← Wstecz</button>}
        {step < 4 ? (
          <button className="oc-nav__next" disabled={!canNext()} onClick={() => setStep(s => s + 1)}>Dalej →</button>
        ) : (
          <button className="oc-nav__next" onClick={startCalc}>
            {hadClaim && claimCount > 2 ? "Wyślij zapytanie" : "Porównaj oferty ubezpieczycieli"}
          </button>
        )}
      </div>
    </div>
  );
}

function InsuranceV2View() {
  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>OC lekarskie</h2>
        <p className="text-sm text-muted">Porównaj oferty Ergo Hestia i INTER Polska w jednym formularzu.</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20, padding: "12px 16px", background: "var(--color-bg-subtle)", borderRadius: 10 }}>
        <span className="text-sm text-muted">Ubezpieczyciele:</span>
        <img src="../ubezpieczenia/loga/ergohestia.png" alt="Ergo Hestia" style={{ height: 28 }} />
        <img src="../ubezpieczenia/loga/inter logo.webp" alt="INTER" style={{ height: 22 }} />
      </div>
      <OcFormV2 />
    </div>
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

function InsuranceView() {
  const [selected, setSelected] = useState(null);
  // status: null = brak, "km" = kupione w KM, "external" = dodane z zewnątrz
  const [statuses, setStatuses] = useState({ life: "km" });
  const [uploadedFiles, setUploadedFiles] = useState({});
  // daty wygaśnięcia polis kuponych w KM
  const expiryDates = { life: "2026-09-14" };

  if (selected) {
    return <InsuranceDetail cat={selected} onBack={() => setSelected(null)} />;
  }

  const coveredCount = INSURANCE_CATEGORIES.filter(c => statuses[c.id]).length;
  const totalCount = INSURANCE_CATEGORIES.length;

  const handleFileUpload = (catId) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.png,.jpg,.jpeg";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setUploadedFiles(prev => ({ ...prev, [catId]: file.name }));
        setStatuses(prev => ({ ...prev, [catId]: "external" }));
      }
    };
    input.click();
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
            <div key={cat.id} className={`ins-card ins-card--status ${status ? "ins-card--covered" : cat.noMissing ? "" : "ins-card--missing"}`}>
              <div className="ins-card__icon">
                <InsIcon id={cat.icon} />
                {status && (
                  <span className="ins-card__check">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </span>
                )}
              </div>
              <div className="ins-card__body">
                <div className="ins-card__top">
                  <span className="ins-card__name">{cat.name}</span>
                  {cat.tag && <Pill variant={cat.tagVariant}>{cat.tag}</Pill>}
                  {status === "km" && <span className="ins-card__status-badge ins-card__status-badge--active">Aktywne</span>}
                  {isExternal && <span className="ins-card__status-badge ins-card__status-badge--ext">Polisa zewnętrzna</span>}
                </div>
                {!status && cat.priceLabel && <span className="ins-card__price">{cat.priceLabel}</span>}
                {!status && !cat.priceLabel && <span className="ins-card__price ins-card__price--muted">Wycena indywidualna</span>}
                {status === "km" && daysLeft !== null && (
                  <span className="ins-card__expiry">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    Wygasa za {daysLeft} dni ({new Date(expiry).toLocaleDateString("pl-PL")})
                  </span>
                )}
                {isExternal && fileName && (
                  <span className="ins-card__file">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                    {fileName}
                  </span>
                )}
              </div>
              <div className="ins-card__actions">
                {!status && (
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
  const [editing,    setEditing]    = useState(false);
  const [profile,    setProfile]    = useState({
    firstName: "Anna", lastName: "Kowalska", email: "anna.kowalska@gmail.com",
    phone: "+48 600 123 456", pwz: "5678901",
    role: "resident", work: ["nfz", "private"],
  });
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

// ─── CART DRAWER ──────────────────────────────────────────────────────────────

function CartDrawer({ cart, onClose, removeFromCart, updateQty }) {
  const [closing, setClosing] = useState(false);
  const fmtPrice = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " zł";
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalSavings = cart.reduce((s, i) => {
    const oldPrice = i.variant && i.product.priceOldBase
      ? i.product.priceOldBase + (i.variant.computedPrice - (i.product.basePrice || 0))
      : i.product.priceOldBase || 0;
    return s + (oldPrice > i.price ? (oldPrice - i.price) * i.qty : 0);
  }, 0);

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
            {totalItems > 0 && <span className="drawer__header-badge" style={{ background: "var(--color-accent)", color: "#fff" }}>{totalItems}</span>}
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
                {cart.map(item => {
                  const oldPrice = item.variant && item.product.priceOldBase
                    ? item.product.priceOldBase + (item.variant.computedPrice - (item.product.basePrice || 0))
                    : item.product.priceOldBase || 0;
                  const hasDicount = oldPrice > item.price;
                  return (
                  <div key={item.key} className="cart-item">
                    <div className="cart-item__img" style={{ background: "#F4F4F5" }}>
                      {item.product.photo
                        ? <img src={item.product.photo} alt={item.product.brand} />
                        : <span style={{ fontSize: 24 }}>{item.product.emoji}</span>
                      }
                    </div>
                    <div className="cart-item__info">
                      <div className="cart-item__name">{item.product.brand} {item.product.model}</div>
                      {item.variant && (
                        <div className="cart-item__variant">
                          {Object.entries(item.variant.selections || {}).map(([k, v]) => v).join(" · ")}
                        </div>
                      )}
                      <div className="cart-item__price-line">
                        <span className="cart-item__price">{fmtPrice(item.price)}</span>
                        {hasDicount && <span className="cart-item__price-old">{fmtPrice(oldPrice)}</span>}
                      </div>
                    </div>
                    <div className="cart-item__actions">
                      <div className="cart-item__qty">
                        <button className="cart-item__qty-btn" onClick={() => updateQty(item.key, -1)}>−</button>
                        <span className="cart-item__qty-val">{item.qty}</span>
                        <button className="cart-item__qty-btn" onClick={() => updateQty(item.key, 1)}>+</button>
                      </div>
                      <button className="cart-item__remove" onClick={() => removeFromCart(item.key)} title="Usuń">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="cart-summary">
                <div className="cart-summary__row">
                  <span>Produkty ({totalItems})</span>
                  <span className="font-semibold">{fmtPrice(total)}</span>
                </div>
                <div className="cart-summary__row">
                  <span>Dostawa</span>
                  <span style={{ color: "var(--color-green)", fontWeight: 600 }}>Gratis</span>
                </div>
                <div className="cart-summary__total">
                  <span>Razem</span>
                  <span>{fmtPrice(total)}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="cart-savings">
                    <svg width="18" height="18" viewBox="0 0 23 23" fill="none"><path d="M19.9652 0H2.85217C1.27696 0 0 1.27696 0 2.85217V19.9652C0 21.5404 1.27696 22.8173 2.85217 22.8173H19.9652C21.5404 22.8173 22.8173 21.5404 22.8173 19.9652V2.85217C22.8173 1.27696 21.5404 0 19.9652 0Z" fill="#18181B"/><path d="M11.5447 11.0658L16.8498 7.54338L14.6465 3.75L5.96875 9.24042L5.99014 9.27607C5.99014 9.27607 5.97588 9.27607 5.96875 9.27607V13.6613C8.89222 13.6613 11.2667 16.0928 11.2667 19.0733H15.6519C15.6519 15.7719 14.0261 12.8484 11.5447 11.0729V11.0658Z" fill="#CEFF3E"/></svg>
                    <span>Oszczędzasz z Klubem Medyka</span>
                    <span className="cart-savings__amount">−{fmtPrice(totalSavings)}</span>
                  </div>
                )}
                <button className="cart-checkout-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  Przejdź do płatności
                </button>
                <button className="cart-continue-btn" onClick={handleClose}>
                  ← Kontynuuj zakupy
                </button>

                {/* Financing options */}
                <div className="cart-financing">
                  <div className="cart-financing__header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    <span>Dopasuj swoją płatność</span>
                  </div>
                  <div className="cart-financing__options">
                    <div className="cart-financing__option">
                      <div className="cart-financing__option-label">Raty 0%</div>
                      <div className="cart-financing__option-value">od {fmtPrice(Math.ceil(total / 36))}/mies.</div>
                      <div className="cart-financing__option-sub">na 36 miesięcy</div>
                    </div>
                    <div className="cart-financing__option">
                      <div className="cart-financing__option-label">Leasing</div>
                      <div className="cart-financing__option-value">od {fmtPrice(Math.ceil(total / 48))}/mies.</div>
                      <div className="cart-financing__option-sub">na 48 miesięcy</div>
                    </div>
                  </div>
                  <div className="cart-financing__note">Bez zaświadczeń · Decyzja w 15 min · Faktura VAT</div>
                </div>
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
  packages:    ServicesView,
  discounts:      DiscountsView,
  "discounts-v2": DiscountsV2View,
  "discounts-v3": DiscountsV3View,
  "discounts-v4": DiscountsV4View,
  advisors:       AdvisorsView,
  insurance:      InsuranceView,
  "insurance-v2": InsuranceV2View,
  investments: InvestmentsView,
  profile:     ProfileView,
};

function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [active,    setActive_]   = useState("overview");
  const [navKey,    setNavKey]    = useState(0);
  const [cart,      setCart]      = useState([]);
  const [cartOpen,  setCartOpen]  = useState(false);

  const setActive = (id) => { setActive_(id); setNavKey(k => k + 1); };

  const addToCart = (product, variant) => {
    setCart(prev => {
      const key = product.id + (variant ? JSON.stringify(variant) : "");
      const existing = prev.find(i => i.key === key);
      if (existing) return prev.map(i => i.key === key ? { ...i, qty: i.qty + 1 } : i);
      const price = variant ? variant.computedPrice : product.basePrice || parseInt(product.price.replace(/\s/g, ""));
      return [...prev, { key, product, variant, qty: 1, price }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (key) => setCart(prev => prev.filter(i => i.key !== key));
  const updateQty = (key, delta) => setCart(prev => prev.map(i => {
    if (i.key !== key) return i;
    const newQty = i.qty + delta;
    return newQty > 0 ? { ...i, qty: newQty } : i;
  }).filter(i => i.qty > 0));

  if (!onboarded) return <Onboarding onComplete={() => setOnboarded(true)} />;

  const View = VIEWS[active] || Overview;

  return (
    <div className="app-layout">
      <Sidebar active={active} setActive={setActive} />
      <div className="main">
        <TopBar active={active} setActive={setActive} cart={cart} onCartClick={() => setCartOpen(true)} />
        <main className="main__content">
          <View key={navKey} setActive={setActive} addToCart={addToCart} cart={cart} removeFromCart={removeFromCart} />
        </main>
      </div>
      {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} removeFromCart={removeFromCart} updateQty={updateQty} />}
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
