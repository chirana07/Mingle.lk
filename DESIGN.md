---
name: Mingle.lk
description: Familiar social browsing for intentional connections.
colors:
  primary: "#7041b5"
  primary-hover: "#60339f"
  primary-deep: "#54288a"
  tint: "#f1eaf9"
  canvas: "#faf9fc"
  surface: "#fff"
  surface-hover: "#f4f1f8"
  ink: "#262131"
  muted: "#716a7e"
  border: "#e6e1ed"
typography:
  headline:
    fontFamily: "Geist, sans-serif"
    fontSize: "27px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Geist, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Geist, sans-serif"
    fontSize: "13px"
    lineHeight: 1.75
  label:
    fontFamily: "Geist, sans-serif"
    fontSize: "12px"
    fontWeight: 600
rounded:
  chip: "8px"
  control: "10px"
  navigation: "12px"
  post: "14px"
  panel: "16px"
  sheet-top: "32px"
  circle: "50%"
spacing:
  tight: "8px"
  compact: "12px"
  standard: "16px"
  post: "18px"
  roomy: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "14px 0"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-filter:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "8px 13px"
  input-note:
    backgroundColor: "{colors.surface-hover}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "12px"
  nav-item:
    rounded: "{rounded.navigation}"
    padding: "12px 16px"
  filter-chip:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.primary-hover}"
    rounded: "{rounded.chip}"
    padding: "7px 10px"
  profile-post:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.post}"
---

# Design System: Mingle.lk

## Overview

**Creative North Star: "Familiar social browsing for intentional connections"**

Mingle.lk uses white surfaces, cool lavender ground, ink text and a plum accent. The Instagram-like browsing language is a confirmed product direction; the linked-arch m mark and shared-answer interactions give the implementation its own identity.

People and their relationship intentions lead the experience. Compact supporting text, outlined icons and lightly bounded surfaces keep photography and conversation legible. This document records the built system rather than proposing a new visual direction.

**Key Characteristics:**

- White surfaces on cool lavender ground.
- Plum actions and outlined navigation icons.
- Circular identity imagery and lightly rounded containers.
- Shared answers that lead into an opening note.

## Colors

The palette combines a single plum accent with cool neutrals. Frontmatter owns the reusable values.

### Primary

- **Plum** (`primary`): filled calls to action, logo, active controls and focus outlines.
- **Deep plum** (`primary-hover`, `primary-deep`): stronger interaction states and accent text.
- **Lavender tint** (`tint`): selected filters and quiet supporting surfaces.

### Neutral

- **Cool canvas** (`canvas`): the page ground.
- **White surface** (`surface`): navigation, posts and dialogs.
- **Soft surface** (`surface-hover`): fields and inset content.
- **Ink** (`ink`): primary text.
- **Muted ink** (`muted`): secondary information.
- **Lavender border** (`border`): dividers and container edges.

**The Accent Rule.** Reserve filled plum for actionable emphasis; keep content surfaces white or softly tinted.

The existing Tailwind rose scale is remapped to plum in the global stylesheet. Internal katha-prefixed aliases remain compatibility identifiers, not visible branding.

## Typography

**Body Font:** Geist with sans-serif fallback. The app loads Geist through its font provider; script fallback behavior needs separate multilingual visual verification. Geist Mono is loaded but is not the defining display or body face.

The hierarchy is compact and direct: the headline role names a screen, the title role introduces supporting panels, body text describes a person, and labels support controls. Mobile discovery headings reduce to (23px). Supporting metadata commonly uses (11px), while navigation labels use (15px) on desktop.

The wordmark is a separate treatment: (29px), weight (750), tracking (-0.04em), with a lighter accented .lk suffix. Its mobile header size is (24px).

## Layout

The observed discovery shell has a fixed left rail (238px), a centered feed track capped at (590px), a supporting rail (280px) and a gap (52px). The workspace has a maximum width of (1050px) and padding (38px 44px 64px). Wide task views use a single flexible track and a maximum width of (1160px).

At widths up to (1199px), the supporting rail disappears, the left rail contracts to (205px), and the main track caps at (600px). At widths up to (767px), the left rail yields to a sticky header (66px) and fixed bottom navigation with safe-area padding. Mobile posts lose side borders and corner rounding, while the feed stays centered with a maximum width of (600px). At (1450px) and above, the desktop workspace centers with compensation for the navigation rail. Very narrow layouts receive an additional adjustment below (360px).

These are existing shell patterns, not a requirement that every future screen use a photo feed. Reuse the compact-to-roomy spacing values for controls and content groupings.

## Elevation & Depth

The browsing surface is mostly flat. White and lavender layers plus thin borders establish hierarchy. The mobile account menu uses a soft shadow (`0 12px 35px #26213118`); existing dialogs also use small utility shadows and a dark blurred backdrop.

**The Surface Rule.** Keep feed posts flat at rest; use depth to distinguish menus and dialogs from the browsing plane.

## Shapes

The original mark draws two connected, rounded arches with a small dot over their meeting point. Preserve its vector geometry in the logo component and icon source. Avatars remain circular; controls, navigation, posts and panels follow their distinct frontmatter radii. Mobile sheets have rounded upper corners; full-width mobile feed posts have square edges. Borders are generally (1px).

## Components

### Buttons

Filled primary buttons use plum with white text and deepen on hover. Filter buttons use a white surface and thin border. Icon buttons are circular (40px) targets with a tinted hover state. Desktop navigation targets are at least (52px) high; mobile navigation targets are at least (48px) high. These observed dimensions are not a claim that all controls meet a universal minimum target size.

Global keyboard focus uses a (2px) plum outline offset by (4px). Photo buttons move that outline inward. Disabled buttons use a not-allowed cursor and reduced opacity; sent connection actions retain their green confirmation state.

### Chips

Active filter chips use lavender tint, deep plum text, compact padding and a remove action. Their minimum height is (34px). Keep the selected value readable and retain the accessible removal label.

### Cards / Containers

Desktop profile posts use white surfaces, thin lavender borders and the post radius. Their identity row precedes the photograph; actions, bio and shared-answer content follow. Desktop photographs use aspect ratio (1.08); mobile photographs use (0.94), with cover cropping.

### Inputs / Fields

The opening-note field uses the soft surface, a thin border, panel radius and compact padding. Focus changes its border to plum. Labels remain separate from placeholders. Preserve submitting and disabled states in the corresponding action.

### Navigation

Outlined icons accompany text. The active desktop item uses a lavender background, stronger plum text and heavier icon stroke. Mobile navigation retains labels beneath icons. Count badges reflect real pending requests and unread messages. The account menu exposes language, subscription and session actions on mobile.

### Shared answers and profile shortcuts

Circular shortcuts open actual profiles. Shared answers are divided from the biography by a thin rule and open a connection note anchored to available card data. They are the signature conversation pattern; retain their relationship to real profile data rather than decorating empty content with invented activity.

### Motion

Navigation and icon hover transitions last (150–200ms). Voice bars animate over (1.2s). The profile sheet uses a spring with damping (25) and stiffness (300). CSS reduced-motion rules shorten CSS animation and transitions; this alone does not establish reduced-motion coverage for JavaScript-driven motion.

## Do's and Don'ts

### Do:

- Do preserve the original linked-arch mark and Mingle.lk wordmark.
- Do use white and lavender surfaces with plum action emphasis.
- Do keep keyboard focus visible and provide names for icon-only controls.
- Do show real profile, compatibility and request data in social browsing patterns.

### Don't:

- Don't introduce fictitious story activity, profile counts or social features.
- Don't treat internal katha-prefixed API or CSS identifiers as visible branding.
- Don't replace profile imagery or claim its licensing was newly verified by this design pass.
- Don't claim native-device validation from generated launcher icons alone.
