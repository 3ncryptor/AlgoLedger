# @algoledger/config

Shared design tokens so every app in the monorepo renders the same brand and can be re-themed from one place.

## Usage

Add as a dependency, then import before your app's own `@theme inline` block:

```css
@import 'tailwindcss';
@import '@algoledger/config/theme/soft-motion-tokens.css';
```

This defines `--brand-primary`, `--brand-primary-hover`, `--brand-secondary`, `--brand-heading` as CSS custom properties and maps them to Tailwind utilities (`bg-brand`, `text-brand`, `text-brand-heading`, `bg-brand-hover`, etc.) via `@theme inline`.

## Re-theming

Edit the four `--brand-*` values in `theme/soft-motion-tokens.css` to rebrand every consuming app at once. To override for a single app only, redefine the same custom properties in that app's own `:root` block, positioned after this import.
