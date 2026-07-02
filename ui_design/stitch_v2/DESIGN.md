---
version: alpha
name: OVERWORLD
description: An editorial pixel-art design system where chunky 16-bit landscapes punch
  through giant blocky display type on warm parchment. Layouts fracture the grid through
  asymmetric margins, full-bleed image breakouts, slightly rotated sticker badges,
  and hard offset block shadows.
colors:
  parchment: '#F2EAD6'
  bone: '#FFFAEF'
  ink: '#161310'
  ink-soft: '#3A332A'
  border-tan: '#D9CDB3'
  border-strong: '#161310'
  sky-cobalt: '#2E5DD6'
  sunset-vermillion: '#E2522E'
  pine-moss: '#2F6E4F'
  primary: '#2E5DD6'
  secondary: '#E2522E'
  tertiary: '#2F6E4F'
  surface: '#FFFAEF'
  surface-sunken: '#F2EAD6'
  on-surface: '#161310'
  on-primary: '#FFFAEF'
  on-secondary: '#FFFAEF'
  border: '#D9CDB3'
  focus: '#2E5DD6'
  error: '#E2522E'
  success: '#2F6E4F'
  surface-dim: '#e0d9d3'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#faf2ec'
  surface-container: '#f5ece7'
  surface-container-high: '#efe7e1'
  surface-container-highest: '#e9e1db'
  on-surface-variant: '#434654'
  inverse-surface: '#34302c'
  inverse-on-surface: '#f8efea'
  outline: '#747685'
  outline-variant: '#c3c5d6'
  surface-tint: '#2355ce'
  primary-container: '#2e5dd6'
  on-primary-container: '#dfe4ff'
  inverse-primary: '#b5c4ff'
  secondary-container: '#fc653f'
  on-secondary-container: '#5e1100'
  on-tertiary: '#ffffff'
  tertiary-container: '#337253'
  on-tertiary-container: '#b2f4cd'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b5c4ff'
  on-primary-fixed: '#00174d'
  on-primary-fixed-variant: '#003cab'
  secondary-fixed: '#ffdad2'
  secondary-fixed-dim: '#ffb4a2'
  on-secondary-fixed: '#3c0700'
  on-secondary-fixed-variant: '#8a1d00'
  tertiary-fixed: '#aff1ca'
  tertiary-fixed-dim: '#94d4af'
  on-tertiary-fixed: '#002112'
  on-tertiary-fixed-variant: '#0b5135'
  background: '#fff8f4'
  on-background: '#1e1b18'
  surface-variant: '#e9e1db'
typography:
  display-font: Pixelify Sans, ui-monospace, monospace
  body-font: Inter, ui-sans-serif, system-ui, sans-serif
  hud-font: VT323, ui-monospace, Menlo, monospace
  display-xxl:
    fontFamily: '{typography.display-font}'
    fontSize: 128px
    lineHeight: 0.92
    letterSpacing: -0.02em
    fontWeight: 700
  display-xl:
    fontFamily: '{typography.display-font}'
    fontSize: 96px
    lineHeight: 0.94
    letterSpacing: -0.015em
    fontWeight: 700
  display-lg:
    fontFamily: '{typography.display-font}'
    fontSize: 72px
    lineHeight: 0.96
    letterSpacing: -0.01em
    fontWeight: 700
  headline-lg:
    fontFamily: '{typography.display-font}'
    fontSize: 44px
    lineHeight: 1.02
    fontWeight: 700
  headline-md:
    fontFamily: '{typography.display-font}'
    fontSize: 28px
    lineHeight: 1.1
    fontWeight: 600
  body-lg:
    fontFamily: '{typography.body-font}'
    fontSize: 18px
    lineHeight: 1.55
    fontWeight: 400
  body-md:
    fontFamily: '{typography.body-font}'
    fontSize: 16px
    lineHeight: 1.6
    fontWeight: 400
  body-sm:
    fontFamily: '{typography.body-font}'
    fontSize: 14px
    lineHeight: 1.55
    fontWeight: 500
  label-sm:
    fontFamily: '{typography.hud-font}'
    fontSize: 18px
    lineHeight: 1
    letterSpacing: 0.04em
    textTransform: uppercase
    fontWeight: '500'
  hud-md:
    fontFamily: '{typography.hud-font}'
    fontSize: 22px
    lineHeight: 1
    letterSpacing: 0.02em
    fontWeight: '400'
  hud-sm:
    fontFamily: '{typography.hud-font}'
    fontSize: 16px
    lineHeight: 1
    letterSpacing: 0.04em
    fontWeight: '400'
  display-lg-mobile:
    fontFamily: sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 46px
rounded:
  none: 0px
  sm: 0px
  md: 0px
  lg: 0px
  xl: 0px
  full: 0px
spacing:
  px: 2px
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  xxxl: 64px
  bleed: 96px
  gutter: 32px
  page-max: 1280px
elevation:
  shadow-flush: '0 0 0 0 #161310'
  shadow-tap: '2px 2px 0 0 #161310'
  shadow-card: '6px 6px 0 0 #161310'
  shadow-card-lg: '10px 10px 0 0 #161310'
  shadow-button: '4px 4px 0 0 #161310'
  shadow-cobalt: '4px 4px 0 0 #2E5DD6'
  shadow-vermillion: '4px 4px 0 0 #E2522E'
border:
  hairline:
    width: 1px
    color: '{colors.border-tan}'
  ink:
    width: 2px
    color: '{colors.ink}'
  ink-thick:
    width: 3px
    color: '{colors.ink}'
components:
  button-primary:
    backgroundColor: '{colors.sky-cobalt}'
    textColor: '{colors.bone}'
    typography: '{typography.label-sm}'
    padding: 14px 22px
    rounded: '{rounded.none}'
    border: 2px solid {colors.ink}
    shadow: '{elevation.shadow-button}'
  button-primary-hover:
    backgroundColor: '#1F47B0'
    textColor: '{colors.bone}'
    shadow: '{elevation.shadow-flush}'
    transform: translate(4px, 4px)
  button-secondary:
    backgroundColor: '{colors.bone}'
    textColor: '{colors.ink}'
    typography: '{typography.label-sm}'
    padding: 14px 22px
    rounded: '{rounded.none}'
    border: 2px solid {colors.ink}
    shadow: '{elevation.shadow-button}'
  button-secondary-hover:
    backgroundColor: '{colors.parchment}'
    shadow: '{elevation.shadow-flush}'
    transform: translate(4px, 4px)
  button-ghost:
    backgroundColor: transparent
    textColor: '{colors.ink}'
    typography: '{typography.label-sm}'
    padding: 12px 18px
    border: 2px solid {colors.ink}
    shadow: '{elevation.shadow-flush}'
  input-field:
    backgroundColor: '{colors.bone}'
    textColor: '{colors.ink}'
    placeholderColor: '{colors.ink-soft}'
    typography: '{typography.hud-md}'
    padding: 12px 14px
    border: 2px solid {colors.ink}
    rounded: '{rounded.none}'
    height: 48px
    shadow: '{elevation.shadow-tap}'
  input-field-focus:
    border: 2px solid {colors.sky-cobalt}
    shadow: '{elevation.shadow-cobalt}'
  card:
    backgroundColor: '{colors.bone}'
    textColor: '{colors.ink}'
    padding: 24px
    border: 2px solid {colors.ink}
    rounded: '{rounded.none}'
    shadow: '{elevation.shadow-card}'
    cornerNotch: 10px
  card-sunken:
    backgroundColor: '{colors.parchment}'
    border: 2px solid {colors.ink}
    shadow: '{elevation.shadow-tap}'
  badge-primary:
    backgroundColor: '{colors.sky-cobalt}'
    textColor: '{colors.bone}'
    typography: '{typography.label-sm}'
    padding: 4px 10px
    border: 2px solid {colors.ink}
    rotation: -2deg
  badge-vermillion:
    backgroundColor: '{colors.sunset-vermillion}'
    textColor: '{colors.bone}'
    typography: '{typography.label-sm}'
    padding: 4px 10px
    border: 2px solid {colors.ink}
    rotation: 1deg
  badge-moss:
    backgroundColor: '{colors.pine-moss}'
    textColor: '{colors.bone}'
    typography: '{typography.label-sm}'
    padding: 4px 10px
    border: 2px solid {colors.ink}
    rotation: -1deg
  checkbox:
    size: 20px
    backgroundColor: '{colors.bone}'
    border: 2px solid {colors.ink}
    rounded: '{rounded.none}'
  checkbox-checked:
    backgroundColor: '{colors.sky-cobalt}'
    border: 2px solid {colors.ink}
    tickColor: '{colors.bone}'
  tabs-track:
    backgroundColor: '{colors.parchment}'
    border: 2px solid {colors.ink}
    padding: '0'
  tabs-active:
    backgroundColor: '{colors.bone}'
    textColor: '{colors.ink}'
    underline: 4px solid {colors.sky-cobalt}
    typography: '{typography.label-sm}'
  tabs-inactive:
    backgroundColor: transparent
    textColor: '{colors.ink-soft}'
    typography: '{typography.label-sm}'
---

"