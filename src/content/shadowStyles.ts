/**
 * Builds a stylesheet for a Shadow DOM root from compiled Tailwind CSS
 * Chrome ignores @property inside shadow roots, so Tailwind's custom properties
 * (border style, shadows, ...) would have no initial value and those utilities break.
 * Copy each @property's initial value onto every element instead,
 * the same fallback Tailwind ships for browsers without @property.
 */
export default function createShadowStyleSheet(css: string): CSSStyleSheet {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(css);

  const defaults = [...sheet.cssRules]
    .filter((rule): rule is CSSPropertyRule => rule instanceof CSSPropertyRule)
    .map((rule) => `${rule.name}: ${rule.initialValue ?? "initial"};`)
    .join(" ");

  if (defaults) {
    sheet.insertRule(`@layer properties { *, ::before, ::after, ::backdrop { ${defaults} } }`, 0);
  }
  return sheet;
}
