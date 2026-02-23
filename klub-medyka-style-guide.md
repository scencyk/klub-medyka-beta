# Klub Medyka — Frontend Style Guide

Instrukcja stylów do implementacji front-endu na podstawie projektu Figma **Klub Medyka**.

---

## 1. Typografia

### Font Family

Cały projekt opiera się na jednym foncie:

```
font-family: 'Inter', sans-serif;
```

**Figma token:** `typography/font-family/font-sans` = `Inter`

### Skala rozmiarów tekstu

| Token                                  | Rozmiar | Line-height | Waga       | Zastosowanie                                |
|----------------------------------------|---------|-------------|------------|---------------------------------------------|
| `text extra small/leading-normal`      | 12px    | 16px        | 400 / 600  | Breadcrumbs, drobne etykiety                |
| `text small/leading-normal`            | 14px    | 20px        | 400 / 500 / 600 | Przyciski, nawigacja, etykiety formularzy |
| `text base/leading-normal`             | 16px    | 24px        | 400 / 700  | Treść paragrafów, opisy produktów, footer   |
| `text extra large/leading-none`        | 20px    | 1 (auto)    | 700        | Nagłówki sekcji, ceny przekreślone          |
| `text 2x large/leading-normal`        | 24px    | 32px        | 600        | Tytuły stron, nagłówki głównych sekcji      |
| `text 4x large/leading-normal`        | 36px    | 40px        | 700        | Cena główna produktu                        |

### Wagi fontów

| Token                     | Wartość | CSS                 |
|---------------------------|---------|---------------------|
| `font/weight/normal`      | 400     | `font-weight: 400`  |
| `font/weight/medium`      | 500     | `font-weight: 500`  |
| `font/weight/semibold`    | 600     | `font-weight: 600`  |
| `font/weight/bold`        | 700     | `font-weight: 700`  |

### Przykłady użycia

```css
/* Nagłówek sekcji (np. "Bezkonkurencyjne warunki") */
.section-heading {
  font-family: 'Inter', sans-serif;
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
  color: #18181b;
}

/* Tekst w przycisku */
.button-text {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
}

/* Treść opisu produktu */
.body-text {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: #262626;
}
```

---

## 2. Paleta kolorów

### Kolory podstawowe (base tokens)

| Token                         | Wartość HEX  | Zastosowanie                                  |
|-------------------------------|-------------|-----------------------------------------------|
| `base/background`             | `#FFFFFF`   | Tło strony, karty produktów                   |
| `base/foreground`             | `#18181B`   | Główny kolor tekstu                           |
| `base/primary`                | `#18181B`   | Aktywne przyciski (wariant default), tab nav   |
| `base/primary-foreground`     | `#FAFAFA`   | Tekst na ciemnych przyciskach                  |
| `base/secondary`              | `#F4F4F5`   | Tła drugorzędne, miniaturki                   |
| `base/secondary-foreground`   | `#18181B`   | Tekst na tle secondary                        |
| `base/muted-foreground`       | `#71717A`   | Tekst drugorzędny, footer, nieaktywne taby    |
| `base/border`                 | `#E4E4E7`   | Obramowania kart, separatory                  |
| `base/input`                  | `#E4E4E7`   | Obramowania pól formularzy, outline buttons    |
| `base/ring-offset`            | `#FFFFFF`   | Tło pod focus ring                            |

### Kolory brandowe

| Token                          | Wartość HEX  | Zastosowanie                                  |
|--------------------------------|-------------|-----------------------------------------------|
| `colors/remedium-blue`         | `#2E35FF`   | Przycisk CTA, cena, aktywny kolor wariantu    |
| `Remedium Dark`                | `#1E1926`   | Ciemny wariant brandu                         |

### Kolory Tailwind (z projektu)

| Token                            | Wartość HEX  | Zastosowanie                              |
|----------------------------------|-------------|-------------------------------------------|
| `tailwind-colors/base/black`     | `#000000`   | Nagłówki sekcji (Opis produktu itp.)      |
| `tailwind-colors/base/white`     | `#FFFFFF`   | Tła białe                                 |
| `tailwind-colors/slate/200`      | `#E2E8F0`   | Obramowanie kontenera bocznego            |
| `tailwind-colors/slate/950`      | `#020617`   | Logo text color                           |
| `tailwind-colors/zinc/300`       | `#D4D4D8`   | Obramowanie search bara                   |
| `tailwind-colors/zinc/500`       | `#71717A`   | Breadcrumbs text                          |
| `tailwind-colors/zinc/700`       | `#3F3F46`   | Drugorzędne ikony                         |
| `tailwind-colors/neutral/700`    | `#404040`   | Tekst pomocniczy (np. "/ miesięcznie")    |
| `tailwind-colors/neutral/800`    | `#262626`   | Treść produktu, etykiety formularzy       |

### Kolory akcji na kartach produktów

| Kolor         | HEX         | Zastosowanie                 |
|---------------|-------------|------------------------------|
| Cena aktualna | `#2E35FF`   | Remedium Blue — cena główna  |
| Cena stara    | `#71717A`   | Przekreślona (muted)         |
| Cena promo    | `#2E35FF`   | Wyróżniona cena             |

---

## 3. Spacing (odstępy)

System spacing oparty na tokenach o bazie 4px:

| Token          | Wartość  | CSS              |
|----------------|---------|------------------|
| `spacing/0`    | 0px     | `gap: 0`         |
| `spacing/0-5`  | 2px     | `gap: 2px`       |
| `spacing/1`    | 4px     | `gap: 4px`       |
| `spacing/1-5`  | 6px     | `padding: 6px`   |
| `spacing/2`    | 8px     | `gap: 8px`       |
| `spacing/2-5`  | 10px    | `padding: 10px`  |
| `spacing/3`    | 12px    | `padding: 12px`  |
| `spacing/4`    | 16px    | `gap: 16px`      |
| `spacing/6`    | 24px    | `padding: 24px`  |
| `spacing/7`    | 28px    | `gap: 28px`      |
| `spacing/8`    | 32px    | `gap: 32px`      |
| `spacing/16`   | 64px    | `gap: 64px`      |
| `spacing/24`   | 96px    | `padding: 96px`  |

---

## 4. Border Radius

| Token               | Wartość  | Zastosowanie                                 |
|----------------------|---------|----------------------------------------------|
| `border-radius/md`   | 6px     | Breadcrumbs, drobne elementy, logo container |
| `border-radius/lg`   | 8px     | Przyciski, inputy, karty mniejsze           |
| `border-radius/xl`   | 12px    | Karty produktów, kontenery główne            |
| `border-radius/full` | 9999px  | Search bar, avatar button, badge pills       |

---

## 5. Cienie (Shadows)

| Token        | Wartość CSS                                                                                              |
|--------------|----------------------------------------------------------------------------------------------------------|
| `shadow/lg`  | `0 4px 6px -2px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.1)`                                    |

Używany na kartach produktów i elementach z efektem podniesienia (hover/elevation).

---

## 6. Layout i Grid

### Kontener główny

```
max-width: 1280px (content area: 1244px)
padding-horizontal: 24px
margin: 0 auto
```

### Siatka produktów

Karty produktowe rozmieszczone w rzędach po **5 kolumn** na desktopie, z `gap: 16px` między nimi. Pojedyncza karta wykorzystuje elastyczne dopasowanie (`flex: 1`).

### Nawigacja (Navbar)

```
height: 80px
padding-vertical: 12px
position: sticky, top: 0
background: white
```

### Footer

```
padding-vertical: 96px
max-width: 1280px
gap wewnętrzny sekcji: 64px
```

---

## 7. Komponenty UI

Projekt bazuje na komponentach **shadcn/ui**. Poniżej mapowanie komponentów Figma na shadcn:

### Button

Dokumentacja: [shadcn/ui Button](https://ui.shadcn.com/docs/components/button)

| Wariant             | Background     | Text Color   | Border          | Border-radius | Height |
|---------------------|----------------|-------------|-----------------|---------------|--------|
| **Default (sm)**    | `#18181B`      | `#FAFAFA`    | brak            | 8px           | 36px   |
| **Outline (sm)**    | `#FFFFFF`      | `#18181B`    | 1px `#E4E4E7`   | 8px           | 36px   |
| **Blue (default)**  | `#2E35FF`      | `#FAFAFA`    | brak            | 8px           | 40px   |
| **Secondary (icon)**| `#FFFFFF`      | `#18181B`    | 1px `#E4E4E7`   | 8px           | 40px   |

Padding dla `sm`: `8px 12px`, dla `default`: `8px 16px`.

### Badge

Dokumentacja: [shadcn/ui Badge](https://ui.shadcn.com/docs/components/badge)

| Wariant       | Background   | Text Color  | Border         |
|---------------|-------------|-------------|----------------|
| **Default**   | `#18181B`   | `#FAFAFA`    | brak           |
| **Secondary** | `#F4F4F5`   | `#18181B`    | brak           |
| **Outline**   | transparent | `#18181B`    | 1px `#E4E4E7`  |

### Dropdown Menu

Dokumentacja: [shadcn/ui Dropdown Menu](https://ui.shadcn.com/docs/components/dropdown-menu)

Trigger button: wariant Secondary z ikoną ChevronDown.

### Separator

Dokumentacja: [shadcn/ui Separator](https://ui.shadcn.com/docs/components/separator)

1px linia w kolorze `base/border` (`#E4E4E7`).

### Aspect Ratio

Dokumentacja: [shadcn/ui Aspect Ratio](https://ui.shadcn.com/docs/components/aspect-ratio)

Używany dla zdjęć produktów w kartach.

### Tab Navigation

Niestandardowy komponent (nie shadcn). Pasek zakładek pod navbarem:

```css
/* Zakładka aktywna */
.tab-active {
  border-bottom: 2px solid #18181B;
  color: #18181B;
  font-weight: 400;
}

/* Zakładka nieaktywna */
.tab-inactive {
  border-bottom: none;
  color: #71717A;
  font-weight: 400;
}

/* Wspólne */
.tab {
  padding: 6px 0;
  font-size: 14px;
  line-height: 20px;
}
.tab-inner {
  padding: 8px 12px;
  border-radius: 6px;
}
```

---

## 8. Karty produktów

### Struktura

```
┌─────────────────────────┐
│   [Obraz produktu]       │  ← aspect ratio, border-radius: 12px
│                           │
├─────────────────────────┤
│   Marka + Model (bold)   │  ← 14px, weight 700
│   Opis krótki             │  ← 14px, weight 400, color #71717A
│   2050 zł  2312 zł       │  ← cena: #2E35FF bold, stara: line-through #71717A
│   Rata netto              │  ← 12px, color #71717A
└─────────────────────────┘
```

### Styl karty

```css
.product-card {
  background: #FFFFFF;
  border-radius: 12px;
  overflow: hidden;
}

.product-price-current {
  color: #2E35FF;
  font-weight: 700;
  font-size: 20px;
}

.product-price-old {
  color: #71717A;
  text-decoration: line-through;
  font-size: 14px;
}
```

---

## 9. Search Bar

```css
.search-bar {
  height: 40px;
  width: 480px;
  border: 1px solid #D4D4D8;
  border-radius: 9999px;          /* pill shape */
  padding: 4px 12px;
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  gap: 4px;
}

.search-bar-placeholder {
  font-size: 14px;
  font-weight: 400;
  color: #18181B;
  font-feature-settings: 'ss01' 1, 'cv01' 1, 'cv11' 1;
}
```

---

## 10. Sekcja cenowa (strona produktu)

```css
.pricing-container {
  background: #FAFAFA;
  border: 1px solid #E4E4E7;
  border-radius: 12px;
  padding: 40px;
}

.price-main {
  font-size: 36px;
  font-weight: 700;
  line-height: 40px;
  color: #2E35FF;
}

.price-period {
  font-size: 16px;
  font-weight: 400;
  color: #404040;
}

.cta-button {
  background: #2E35FF;
  color: #FAFAFA;
  border-radius: 8px;
  height: 40px;
  width: 100%;
  font-size: 14px;
  font-weight: 500;
}
```

---

## 11. Sekcja partnerów

Karuzela logo partnerów w kolorowych polach:

```css
.partner-logo-container {
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

Każdy partner ma indywidualne tło (kolorowe), ale zachowuje spójny `border-radius: 12px`.

---

## 12. Footer

```css
.footer {
  padding: 96px 24px;
  max-width: 1280px;
  margin: 0 auto;
}

.footer-links {
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: #71717A;
  gap: 32px;
}

.footer-legal {
  font-size: 16px;
  color: #71717A;
}

.footer-separator {
  border-top: 1px solid #E4E4E7;
}
```

Social media icons: 24x24px, `gap: 32px` między ikonami.

---

## 13. Breadcrumbs

```css
.breadcrumb-text {
  font-size: 12px;
  line-height: 16px;
  color: #71717A;
  font-weight: 400;
}

.breadcrumb-active {
  font-weight: 600;
}

.breadcrumb-separator {
  /* Ikona chevron-right, obrócona -90deg */
  width: 3.26px;
  height: 6.52px;
}

.breadcrumb-gap {
  gap: 8px;
}
```

---

## 14. Specjalne tokeny i uwagi

### Logo

```
Font: Inter Semi Bold (600)
Size: ~22.8px
Letter-spacing: -0.38px
Color: #020617 (slate-950)
```

Logo zawiera ikonę (22.8x22.8px) + tekst "Klub Medyka".

### Przycisk CTA "Remedium"

```css
.remedium-button {
  background: #2E35FF;
  border-radius: 9999px;       /* pill */
  height: 40px;
  padding: 8px 10px 8px 8px;
  color: #FAFAFA;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}
```

Zawiera: avatar (24x24px) + tekst + ikona ArrowUpRight.

### Feature settings Inter

Niektóre pola tekstowe korzystają ze specjalnych feature settings:

```css
font-feature-settings: 'ss01' 1, 'cv01' 1, 'cv11' 1;
```

---

## 15. Podsumowanie CSS Variables

```css
:root {
  /* Typography */
  --font-sans: 'Inter', sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --font-size-4xl: 36px;
  --line-height-xs: 16px;
  --line-height-sm: 20px;
  --line-height-base: 24px;
  --line-height-2xl: 32px;
  --line-height-4xl: 40px;

  /* Colors - Base */
  --color-background: #FFFFFF;
  --color-foreground: #18181B;
  --color-primary: #18181B;
  --color-primary-foreground: #FAFAFA;
  --color-secondary: #F4F4F5;
  --color-muted-foreground: #71717A;
  --color-border: #E4E4E7;
  --color-input: #E4E4E7;

  /* Colors - Brand */
  --color-remedium-blue: #2E35FF;
  --color-remedium-dark: #1E1926;

  /* Spacing */
  --spacing-0: 0px;
  --spacing-1: 4px;
  --spacing-1-5: 6px;
  --spacing-2: 8px;
  --spacing-2-5: 10px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-6: 24px;
  --spacing-7: 28px;
  --spacing-8: 32px;
  --spacing-16: 64px;
  --spacing-24: 96px;

  /* Border Radius */
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-lg: 0 4px 6px -2px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.1);
}
```
