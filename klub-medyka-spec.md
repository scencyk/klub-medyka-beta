# Klub Medyka 2.0 — Struktura i mechanika

Dokument opisuje architekturę, komponenty i logikę prototypu `klub-medyka-clean.jsx` jako bazę do dalszej budowy.

---

## 1. Stos technologiczny

- **React** (funkcyjny, hooki `useState`)
- **Inline styles** — brak CSS/Tailwind, wszystko przez obiekty `style={}`
- **Jeden plik** — cała aplikacja w jednym JSX (do rozbicia na moduły)
- **Brak routera** — nawigacja przez stan `active` (string ID widoku)
- **Brak backendu** — dane mockowe jako stałe na górze pliku

---

## 2. Design tokens

### Kolory (`C`)

| Token      | Hex       | Rola                          |
|------------|-----------|-------------------------------|
| `bg`       | `#F8F7F5` | Tło aplikacji                 |
| `surface`  | `#FFFFFF` | Tło kart i paneli             |
| `border`   | `#ECEAE6` | Obramowania                   |
| `muted`    | `#A09D98` | Tekst drugorzędny             |
| `label`    | `#6B6965` | Etykiety                      |
| `body`     | `#2D2B29` | Tekst główny                  |
| `accent`   | `#1A56DB` | Akcent (linki, CTA)           |
| `accentBg` | `#EEF2FF` | Tło akcentowe                 |
| `warn`     | `#B45309` | Ostrzeżenia                   |
| `warnBg`   | `#FFFBEB` | Tło ostrzeżeń                 |
| `green`    | `#059669` | Sukces / aktywny              |
| `greenBg`  | `#ECFDF5` | Tło sukcesów                  |
| `red`      | `#DC2626` | Błąd / priorytet              |

### Typografia (`T`)

| Token   | Rozmiar | Waga | Opis                     |
|---------|---------|------|--------------------------|
| `h1`    | 28px    | 700  | Nagłówek główny          |
| `h2`    | 20px    | 700  | Nagłówek sekcji          |
| `h3`    | 14px    | 600  | Nagłówek karty           |
| `small` | 12px    | —    | Tekst pomocniczy         |
| `label` | 11px    | 600  | Etykieta (uppercase)     |

Font: `DM Sans`, fallback: `Helvetica Neue`, `sans-serif`.

---

## 3. Modele danych (mock)

### Doradcy

```
MY_ADVISOR         — przypisany doradca użytkownika
ALL_ADVISORS[]     — lista wszystkich doradców (id, name, role, phone, initials, available)
```

### Pakiety usług (`PACKAGES[]`)

Każdy pakiet:
- `id`, `label`, `packagePrice` — cena pakietu łącznie
- `desc` — opis
- `items[]` — lista usług, każda z własną ceną (`price`), nazwą, opisem

Trzy pakiety:
1. **Lekarz Przedsiębiorca** (349 zł) — 6 usług (WG, InFakt, Autenti, doradztwo prawne, OC, EDM)
2. **Lekarz Kierowca** (129 zł) — 3 usługi (ubezp. auta, myjnia, zniżki na paliwo)
3. **Lekarz w Podróży** (49 zł) — 1 usługa (ubezp. podróżne INTER)

### Subskrypcje użytkownika (`MY_SUBS[]`)

```
{ id, name, cat, price, status: "active"|"trial", renewal }
```

### Katalog zakupów jednorazowych (`PURCHASE_CATALOG[]`)

Kategorie: sprzęt/elektronika, samochody, catering/diety. Każdy item: `name`, `price` (string), `sub`, `tag` (opcjonalny badge).

### Historia zakupów (`MY_PURCHASES[]`)

```
{ id, name, cat, date, price, status: "delivered"|"active" }
```

### Zniżki (`DISCOUNTS[]`)

```
{ id, name, discount, code, monthly: bool }
```

### Alerty (`ALERTS[]`)

```
{ id, level: "warn"|"info", text, cta, ctaNav }
```
`ctaNav` — ID widoku, na który przenosi CTA.

### Oferty dopasowane (`OFFERS[]`)

```
{ id, name, reason, price, discount }
```

### Ubezpieczenia (`INSURANCE_PRODUCTS[]`)

```
{ id, name, priority: 0|1|2, owned: bool, provider, showPrices: bool,
  priceFrom|priceEst, renewal, desc }
```

### Nawigacja (`NAV_SECTIONS[]`)

Trzy grupy:
1. **Bez nagłówka**: Panel główny, Zakupy, Usługi, Zniżki
2. **Finanse**: Ubezpieczenia, Inwestycje (soon)
3. **Konto**: Mój profil (badge: 2)

---

## 4. Komponenty współdzielone (atomy)

| Komponent       | Props                              | Opis                                             |
|-----------------|------------------------------------|--------------------------------------------------|
| `SectionHeader` | `title`, `action?`, `onAction?`    | Nagłówek sekcji z opcjonalnym linkiem po prawej   |
| `Pill`          | `children`, `variant`              | Badge/etykieta. Warianty: default, green, warn, accent, red |
| `StatusPill`    | `status`                           | Mapuje status na Pill: trial→warn, delivered→green, domyślnie→green ("Aktywna") |
| `Btn`           | `children`, `variant`, `onClick`, `style` | Przycisk. Warianty: ghost, primary, accent, warn |
| `TableHeader`   | `cols`                             | Pusty wiersz nagłówka z grid (tylko spacing)      |

---

## 5. Onboarding (6 kroków)

Stan: `step` (0–5), `form` (obiekt z danymi użytkownika).

| Krok | Nazwa           | Opis                                                     | Walidacja                     |
|------|-----------------|----------------------------------------------------------|-------------------------------|
| 0    | Intro           | Ekran powitalny z listą benefitów. CTA: "Załóż konto" / "Mam już konto" (skip) | —                             |
| 1    | Dane podstawowe | Imię*, Nazwisko, Email*, Telefon (opcj.)                 | `firstName` + `email` wymagane |
| 2    | Kim jesteś?     | Single-select: student, stażysta, rezydent, specjalista, senior | Wymagany wybór                |
| 3    | Jak pracujesz?  | Multi-select: etat NFZ, JDG, kontrakty B2B, mix          | Opcjonalne                    |
| 4    | Czego szukasz?  | Multi-select grid 2×3: księgowość, ubezpieczenia, prawo, auto, EDM, lifestyle | Opcjonalne                    |
| 5    | Konto gotowe    | Potwierdzenie + podgląd przypisanego doradcy. CTA: "Przejdź do platformy" | —                             |

Mechanika:
- Pasek postępu: `step / (TOTAL - 1)` — widoczny tylko w krokach 1–4
- Nawigacja: "← Wróć" (krok wstecz) + "Dalej →" / "Zakończ" (ostatni krok)
- Przycisk dalej zablokowany (`opacity: 0.38`) gdy walidacja nie przechodzi
- Logo Klub Medyka zawsze widoczne na górze
- `onComplete` — callback przenoszący do głównej aplikacji

---

## 6. Layout główny

```
┌─────────────────────────────────────────────┐
│ Sidebar (220px, sticky) │ TopBar (sticky)   │
│                         │─────────────────── │
│ Logo + user info        │                    │
│ Nawigacja               │   <View />         │
│ (3 sekcje)              │   (main content)   │
│                         │   padding: 36/40px │
│ Widget doradcy (dół)    │                    │
└─────────────────────────────────────────────┘
```

### Sidebar

- **Logo + dane użytkownika**: "Dr Anna Kowalska", "Rezydent · Kardiologia"
- **Nawigacja**: renderuje `NAV_SECTIONS`, aktywna pozycja podświetlona (accentBg), elementy `soon` wyszarzone z badge "wkrótce"
- **Badge**: profil ma badge liczbowy (świadczenia do odebrania)
- **Widget doradcy** (na dole): avatar z kropką statusu (zielona/szara), imię, przycisk telefonu (klik zmienia stan na "Dzwonię…")

### TopBar

- Lewa strona: nazwa aktualnego widoku (z `NAV_SECTIONS`)
- Prawa strona: ikona prezentów (🎁) z kropką powiadomienia, dzwonek (🔔), avatar "AK" (klik → profil)

---

## 7. Widoki

### 7.1 Overview (Panel główny)

Sekcje od góry:

1. **Powitanie + bilet do kina** — miesiąc/rok, "Dzień dobry, dr Kowalska." + karta biletu (ticket metaphor z dashed border i notchami). Przycisk "Odbierz" → pokazuje kod.
2. **Alerty** — lista powiadomień (warn/info) z CTA nawigującym do odpowiedniego widoku.
3. **Aktywne usługi** — tabela z `MY_SUBS`, statusy Pill, suma na dole (297 zł/mies.).
4. **Doradcy** — grid 3 kolumny, avatar + dane + telefon (lub "Niedostępny").
5. **Oferty dopasowane** — lista z `OFFERS`, oznaczenia pilności (⚠).
6. **Zniżki (podgląd)** — pierwsze 3 z `DISCOUNTS`, z kodami i badge "co miesiąc".

### 7.2 Purchases (Zakupy)

Dwie zakładki (tabs):

**Katalog:**
- Pogrupowany po kategoriach (`PURCHASE_CATALOG`)
- Każdy item: nazwa, tag (Pill), opis, cena, przycisk "Sprawdź →"

**Moje zakupy:**
- Tabela: Produkt, Kwota, Data, Status
- Empty state z ikoną 📦

### 7.3 Services (Usługi / Pakiety)

Dla każdego pakietu z `PACKAGES`:

- **Nagłówek pakietu**: nazwa, opis, cena pakietu, cena osobno (przekreślona), oszczędność, przycisk "Kup pakiet"
- **Lista itemów**: checkboxy — klik zaznacza/odznacza usługę
- **Nudge bar** (warunkowo): pojawia się gdy zaznaczono itemy i pakiet jest tańszy niż suma. Tekst: "Pakiet za X zł oszczędza Ci Y zł miesięcznie" + przycisk "Weź pakiet".

Mechanika:
- `selected` — `{ [pkgId]: Set<itemId> }` — zaznaczone usługi
- `purchased` — `{ [pkgId]: bool }` — kupione pakiety
- Po kupnie: checkboxy zielone, zablokowane, badge "✓ Kupiony", tło greenBg
- Nudge bar: żółte obramowanie + warnBg gdy aktywny

### 7.4 Discounts (Zniżki)

Tabela z kolumnami: Partner, Zniżka, Kod.
- Kody w monospace z dashed border
- Przycisk "Kopiuj" → "✓ Skopiowano" (2s timeout)
- Badge "co miesiąc" dla `monthly: true`

### 7.5 Insurance (Ubezpieczenia)

Lista accordion z `INSURANCE_PRODUCTS`:

- **Zamknięty wiersz**: nazwa, badge priorytetu (Priorytet #1/red, #2/warn), badge "Masz" (green), dostawca, cena lub "wycena"
- **Rozwinięty panel**: opis, upload polisy (klik → "✓ Przesłano"), przyciski "Zmień polisę"/"Poproś o ofertę" + "Porównaj"

Mechanika:
- `expanded` — ID otwartego produktu (max 1 naraz)
- `uploaded` — `{ [insId]: bool }` — czy polisa przesłana

### 7.6 Investments (Inwestycje)

Placeholder z dashed border. Tekst informacyjny + przycisk "Powiadom mnie →". Sekcja oznaczona jako "wkrótce" w nawigacji.

### 7.7 Profile (Mój profil)

- **Nagłówek**: avatar, imię, specjalizacja, miasto
- **Świadczenia miesiąca**: lista benefitów (bilety, voucher) z metaforą biletu (dashed tear line, notche)
  - Każdy: tytuł, brand, wygasa za X dni, wartość, kod
  - Akcje: "Kopiuj" + "Odbierz" → "✓ Odebrano" (opacity: 0.48)
  - Informacja: "Nowe świadczenia 1. dnia każdego miesiąca."

---

## 8. Nawigacja i routing

```js
const VIEWS = {
  overview, purchases, packages, discounts,
  insurance, investments, profile
};
```

- Stan `active` (string) w `App` → przekazywany do `Sidebar` i `TopBar`
- `setActive(id)` — zmienia widok, przekazywany do widoków (np. alerty CTA nawigują do insurance/packages)
- Brak URL routing — cała nawigacja w pamięci

---

## 9. Stan aplikacji

| Stan           | Komponent      | Typ                  | Opis                                 |
|----------------|----------------|----------------------|--------------------------------------|
| `onboarded`    | `App`          | `bool`               | Czy onboarding ukończony             |
| `active`       | `App`          | `string`             | ID aktywnego widoku                  |
| `step`         | `Onboarding`   | `number` (0–5)       | Krok onboardingu                     |
| `form`         | `Onboarding`   | `object`             | Dane formularza onboardingu          |
| `calling`      | `Sidebar`      | `bool`               | Symulacja dzwonienia do doradcy      |
| `ticketClaimed`| `Overview`     | `bool`               | Czy bilet do kina odebrany           |
| `selected`     | `ServicesView`  | `{pkgId: Set}`      | Zaznaczone usługi w pakietach        |
| `purchased`    | `ServicesView`  | `{pkgId: bool}`     | Kupione pakiety                      |
| `copied`       | `DiscountsView` | `string\|null`      | ID skopiowanego kodu                 |
| `expanded`     | `InsuranceView` | `string\|null`      | ID rozwiniętego ubezpieczenia        |
| `uploaded`     | `InsuranceView` | `{insId: bool}`     | Przesłane polisy                     |
| `claimedIds`   | `ProfileView`   | `{perkId: bool}`    | Odebrane świadczenia                 |
| `copiedId`     | `ProfileView`   | `string\|null`      | ID skopiowanego kodu świadczenia     |

---

## 10. Wzorce i konwencje

- **Motyw biletu/kuponu**: dashed border + okrągłe notche po bokach (Cinema City, świadczenia w profilu)
- **Status komunikowany kolorem**: green=aktywne/sukces, warn=próba/ostrzeżenie, red=priorytet, accent=akcja
- **Interakcje "kliknij → zmień tekst"**: Kopiuj→Skopiowano, Odbierz→kod, Dzwoń→Dzwonię, Załącz→Przesłano
- **Nudge pattern**: gdy użytkownik wybiera droższe opcje osobno — wizualne zachęcanie do pakietu (żółte obramowanie, komunikat oszczędności)
- **Accordion**: max 1 otwarty panel (ubezpieczenia)
- **Grid layouty**: sidebar fixed 220px, main fluid, karty max-width 560–800px
- **Brak modali** — wszystko inline/accordion

---

## 11. Do zrobienia (poza prototypem)

- [ ] Rozbicie na pliki/moduły
- [ ] Router (URL-based navigation)
- [ ] State management (context/store)
- [ ] Backend API + autentykacja
- [ ] Prawdziwy upload plików (polisy)
- [ ] Clipboard API (kopiowanie kodów)
- [ ] Responsywność (mobile)
- [ ] System ikon (zamiast emoji)
- [ ] Animacje / transitions
- [ ] Formularze z walidacją (onboarding, kontakt z doradcą)
- [ ] Powiadomienia (push/in-app)
- [ ] Testy
