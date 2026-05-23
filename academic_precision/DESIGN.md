---
name: Academic Precision
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#444651'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#0d0097'
  on-tertiary: '#ffffff'
  tertiary-container: '#2724b8'
  on-tertiary-container: '#a1a4ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  tabular-nums:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  container-margin: 24px
  gutter: 16px
  sidebar-width: 260px
  sidebar-collapsed: 72px
---

## Brand & Style
The design system is engineered for the complex, high-stakes environment of university administration. The brand personality is **authoritative, systematic, and transparent**, aimed at registrars and department heads who manage intricate logistical data.

The aesthetic follows a **Modern Corporate Minimalism** approach. It prioritizes information density and functional clarity over decorative flair. The goal is to evoke a sense of academic rigor and institutional trust. Key characteristics include high-quality typography, a disciplined use of white space to prevent cognitive overload, and a layout that treats data as the primary visual element.

## Colors
The palette is rooted in "Academic Blue," a deep, stable primary color that anchors the interface. A secondary Slate Gray is used for utilitarian elements like icons and secondary text to maintain a professional, neutral tone.

Backgrounds utilize a crisp, cool white for interactive surfaces and a very light gray (#f8fafc) for the global canvas to reduce eye strain during long sessions. 

Visual coding is critical for scheduling:
- **Lecture sessions** use the primary Blue.
- **Practice sessions** use Indigo/Purple to provide a distinct but harmonious contrast.
- **Conflict detection** utilizes a semantic system of Red (Error/Hard Conflict), Amber (Warning/Soft Conflict), and Green (Success/Validated).

## Typography
This design system utilizes **Inter** for its exceptional legibility and systematic feel. The type hierarchy is designed for high information density, favoring smaller, well-spaced text over large display sizes.

To support complex scheduling data, the system employs **tabular numbers** for all time and date displays, ensuring columns of figures align perfectly in tables and calendars. Labels use a slightly heavier weight and increased letter spacing to remain legible at small scales.

## Layout & Spacing
The layout uses a **Fixed Grid** model for the main content area to maintain predictability in data presentation, while the sidebar remains fixed to the viewport edge. 

A strict 4px base unit controls all spacing, promoting a compact and efficient "Data-Rich" environment. 
- **Desktop:** 12-column grid with 24px margins. Content is often divided into a 3-column navigation/filter sidebar and a 9-column workspace.
- **Tablet:** 8-column grid with 16px margins. The sidebar collapses into an icon-only rail.
- **Mobile:** 4-column grid with 16px margins. Navigation moves to a bottom bar or hamburger menu.

## Elevation & Depth
To maintain a modern and professional appearance, this design system avoids heavy shadows. Instead, it uses **Tonal Layers and Low-Contrast Outlines**.

Depth is communicated through:
1.  **Canvas Layer:** The #f8fafc background.
2.  **Surface Layer:** White cards and panels with a 1px solid border (#e2e8f0).
3.  **Elevation (Floating):** Only used for dropdowns and modals, employing a soft, neutral shadow (0px 4px 12px rgba(0, 0, 0, 0.05)) to separate the element from the workspace without breaking the minimalist aesthetic.

## Shapes
The shape language is **Soft (0.25rem)**. This provides a subtle modern touch that softens the clinical nature of the data without appearing too casual or "bubbly." 

Larger containers like cards may use `rounded-lg` (0.5rem) for a clearer structural definition, while interactive elements like buttons, input fields, and tags strictly follow the 0.25rem standard.

## Components
- **Sidebar Navigation:** A dark-themed sidebar using #1e3a8a for the active state indicator. Compact vertical padding for navigation links to maximize the number of visible items.
- **Data Tables:** High-density rows (32px or 40px height) with subtle horizontal dividers. No vertical lines. Column headers use `label-sm` with a light gray background.
- **Scheduling Cards:** Used for calendar entries. These use a solid left-border (4px) color-coded by session type (Lecture/Practice).
- **Status Indicators:** Small, circular dots or subtle "Pills" with low-opacity backgrounds (e.g., a 10% red background with solid red text for errors).
- **Input Fields:** Clean, rectangular fields with 1px borders. The focus state uses a 2px "Academic Blue" ring with a 2px offset.
- **Conflict Alerts:** Inline banners (Callouts) that appear at the top of the workspace or within table rows, using semantic icons to ensure accessibility for color-blind users.