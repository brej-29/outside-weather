---
name: Outside
description: A compact outing planner with progressive weather preferences and clear hourly evidence.
colors:
  paper: "#f3f1e9"
  ink: "#263e33"
  forest: "#264b3c"
  muted: "#58665c"
  line: "#cbcfc1"
  gold: "#e7c76d"
  pale: "#e5eadf"
  white: "#fffef8"
  warning: "#803d25"
  control-ground: "#e9ecdf"
  field-line: "#9ca995"
  focus: "#a64a22"
  notice-ground: "#f4e5cf"
  notice-ink: "#64391d"
  hour-within: "#a4b88b"
  hour-outside: "#d9bda2"
typography:
  display:
    fontFamily: "Outside, Georgia, serif"
    fontSize: "clamp(44px, 5.4vw, 68px)"
    fontWeight: 400
    lineHeight: 0.94
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Outside, Georgia, serif"
    fontSize: "36px"
    fontWeight: 400
    lineHeight: 1.1
  title:
    fontFamily: "Outside, Georgia, serif"
    fontSize: "30px"
    fontWeight: 400
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "16px"
    lineHeight: 1.65
  label:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "13px"
    fontWeight: 600
rounded:
  surface: "14px"
  recommendation: "12px"
  field: "7px"
  day: "6px"
  hour: "4px"
  starter: "6px"
spacing:
  compact: "8px"
  regular: "16px"
  group: "24px"
  panel: "30px"
components:
  text-button:
    textColor: "{colors.ink}"
    padding: "8px 0"
  text-button-hover:
    textColor: "#964520"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "10px"
    height: "44px"
  day:
    textColor: "{colors.muted}"
    rounded: "{rounded.day}"
    padding: "10px 13px"
  day-selected:
    backgroundColor: "{colors.pale}"
    textColor: "{colors.ink}"
    rounded: "{rounded.day}"
    padding: "10px 13px"
  recommendation:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.white}"
    rounded: "{rounded.surface}"
    padding: "24px"
---

# Design System: Outside

## Overview

**Creative North Star: "The Outdoor Journal"**

Outside pairs warm paper and pine ink with an open editorial rhythm. A calm serif voice gives the page personality; straightforward controls and aligned hourly values keep decisions easy to inspect. Forecast data supplies the central visual.

The system is flat and restrained. Sun-yellow geometry adds warmth without competing with the recommendation. Interface labels remain direct, and sample, loading, error and live-data states stay explicit.

**Key Characteristics:**

- Broad serif headings and compact sans-serif controls.
- Warm neutral surfaces with pine emphasis and sparse yellow accents.
- Open margins around dense, aligned hourly evidence.
- Native interaction, visible focus and textual explanations alongside color.

## Colors

The palette combines muted outdoor greens with warm paper and a small sun-yellow accent. Frontmatter values are normative; their implementation is in `web/style.css`.

### Primary

- **Forest:** the recommendation surface and chosen hourly blocks.
- **Sun gold:** sun geometry, selection highlighting and restrained confirmation detail.

### Neutral

- **Paper:** the page ground.
- **White:** the forecast work surface and field interiors.
- **Pine ink:** primary text and control foregrounds.
- **Muted pine:** supporting copy, secondary labels and data context.
- **Line:** quiet boundaries between sections.
- **Control ground:** a slightly greener surface for preferences.
- **Pale:** selected day and hover surfaces.
- **Field line:** input borders and hourly scrollbars.

### Status

- **Warning:** stale-state emphasis.
- **Notice ground and notice ink:** conspicuous sample and service notices.
- **Hour within and hour outside:** preference checks in the hourly sequence.
- **Focus:** the warm rust keyboard outline.

**The Evidence Rule.** Color supports a stated result; hourly reasons and status text must carry the meaning independently.

## Typography

**Display Font:** self-hosted Newsreader, registered as Outside, with Georgia and serif fallbacks.
**Body Font:** Arial, with Helvetica and sans-serif fallbacks.

The regular serif has a broad, open editorial character. The sans-serif carries compact controls, dates and measurements. The shipped Newsreader face is regular (400); synthesized font styles are disabled.

### Hierarchy

- **Display:** the frontmatter fluid scale, reduced to (43px) on phones.
- **Headline:** method headings, reduced to (32px) on phones.
- **Title:** place headings; control and forecast headings use nearby steps (24–27px).
- **Recommendation time:** regular serif (36px), with responsive steps (29–30px).
- **Body:** introductory copy uses the frontmatter role; explanatory copy uses (14px) with generous line spacing, and recommendation copy uses (13px).
- **Label:** field labels use the frontmatter role; secondary labels and compact hourly context use (10–12px).

**The Data Alignment Rule.** Use tabular numerals for hourly values and weather metrics. Preserve units in the surrounding label or table caption.

## Layout

The page is centered within 1240px. A compact editorial introduction leads into a single full-width planner. City, duration and the primary Find my window action form the first row, in that reading order. On phones these stack in the same order.

Weather preferences are a collapsed native disclosure, with the active limits summarized alongside its label. This keeps the first task visible while preserving access to rain, wind and temperature controls. Results follow directly below the setup, with date, 12-hour time and continuous duration emphasized. Selecting another day updates its recommendation.

At 900px the preference grid uses two columns and the scroll instruction appears. At 600px controls stack, the decorative sun disappears and the forecast metrics share a compact row. Main padding is 26-30px on desktop and 18-22px on phones. Hourly evidence scrolls inside its own region with a minimum width of 550px.

## Elevation & Depth

The system uses no shadows. Tonal layering distinguishes paper, preferences, forecast surface and the forest recommendation. Thin borders define work areas and dividers; the selected hourly blocks gain an outline rather than artificial elevation.

**The Flat Surface Rule.** Establish hierarchy with tone, spacing and type before adding another container.

## Shapes

Work surfaces and recommendations use gently curved corners from the surface radius. Fields and notices use the smaller field radius; day controls and hourly bars use tighter corners. Starter-place controls use compact 6px rounded rectangles.

Icons are authored inline SVG with a consistent fine stroke, current text color and no fill. The sun and orbit are exact geometry, separate from the functional icon system. Decorative geometry is hidden from assistive technology.

## Components

### Buttons

Text actions are understated and underlined, with an underline offset (4px). Hover moves the foreground toward rust. Buttons transition background and color over (200ms) using the shared easing curve. Native button semantics remain intact.

Day controls use muted text at rest and a pale green selected surface with stronger ink and weight. Their selected state is also exposed through pressed-state semantics.

### Inputs / Fields

Search, number and select controls share a white surface, thin field border, modest corner radius and comfortable height. Search places its SVG action at the trailing edge. Ranges use forest accent color.

Focus uses a rust outline (3px) with offset (4px). Invalid preference edits receive a visible explanation while results retain the previous valid values. Disabled controls visibly dim.

### Chips

Chosen places appear as quiet text rows with a lower divider and a labeled SVG remove action. They remain visually connected to place search rather than becoming separate cards.

### Cards / Containers

The planner is one bordered work surface. Setup and results share a white ground, divided by a thin rule. The recommendation uses a solid forest surface with light text, 12px corners and no shadow.

### Navigation

The brand and simple text links share one horizontal masthead. Links underline on hover and show the common focus treatment. The header becomes shorter on phones while preserving both navigation destinations.

### Hourly Evidence

Equal-width hourly bars form a continuous sequence. Within-limit, outside-limit and selected blocks have distinct tones; the selected blocks also have an outline. Hours, feels-like values and rain probabilities align underneath.

A native disclosure reveals full values and reasons. Expanded state, timeline scroll and active result-control focus survive ordinary result updates. Sample and live sources are visibly distinguished above the recommendation.

### Motion and Browser Surfaces

A short clipped reveal (450ms) introduces a recommendation from an already-visible state. Loading placeholders pulse separately. Reduced-motion preferences disable animation, transitions and smooth scrolling.

Selection uses sun gold with pine text; carets use forest; hourly scrollbars use field-line on paper. A skip link appears on keyboard focus.

## Do's and Don'ts

### Do:

- **Do** keep editorial headings broad and controls compact.
- **Do** pair hourly colors with inspectable textual reasons.
- **Do** preserve explicit sample, source, loading and error labels.
- **Do** retain visible focus and native keyboard behavior.
- **Do** keep units and dates close to the values they explain.

### Don't:

- **Don't** replace the flat tonal hierarchy with decorative shadows.
- **Don't** use color alone to communicate forecast checks.
- **Don't** turn scrolling hourly evidence into page-level horizontal overflow.
- **Don't** use text glyphs in place of the SVG icon system.
- **Don't** synthesize an italic or bold Newsreader style from the regular face.
