import { TemplateAttribute, DerivedStat } from '@/types/rpg';

/**
 * Evaluates a formula string using attribute values.
 * Formula syntax: {AttributeName} for referencing attributes.
 * Supports +, -, *, / and parentheses.
 * Example: "{Constituição} * 2 + 10"
 */
export function evaluateFormula(
  formula: string,
  attributes: TemplateAttribute[]
): number | string {
  try {
    let expression = formula;

    // Replace {AttributeName} with actual values
    const attrPattern = /\{([^}]+)\}/g;
    expression = expression.replace(attrPattern, (_, attrName: string) => {
      const attr = attributes.find(
        (a) => a.name.toLowerCase() === attrName.trim().toLowerCase()
      );
      if (!attr) return '0';
      const val = parseFloat(attr.value);
      return isNaN(val) ? '0' : val.toString();
    });

    // Validate: only allow numbers, operators, spaces, parentheses, dots
    if (!/^[\d\s+\-*/().]+$/.test(expression)) {
      return 'Erro';
    }

    // Safe eval using Function constructor with no access to scope
    const result = new Function(`return (${expression})`)();
    if (typeof result === 'number' && !isNaN(result)) {
      return Math.round(result * 100) / 100;
    }
    return 'Erro';
  } catch {
    return 'Erro';
  }
}

/**
 * Calculates all derived stats for a character sheet
 */
export function calculateDerivedStats(
  derivedStats: DerivedStat[],
  attributes: TemplateAttribute[]
): Record<string, number | string> {
  const results: Record<string, number | string> = {};
  for (const stat of derivedStats) {
    results[stat.id] = evaluateFormula(stat.formula, attributes);
  }
  return results;
}
