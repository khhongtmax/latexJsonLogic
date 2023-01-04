
export const exponentExp = '([a-zA-Z]|[0-9]+|{.*}|(.*))^([a-zA-Z]|[0-9]+|{.*})'

export const fracExp = '\\\\frac{.*}{.*}';

export const sqrtExp = '\\\\sqrt(.*)?{.*}';

export const divExp = `([a-zA-Z]|[0-9]+|${fracExp}|${sqrtExp}|${exponentExp}|(.*))(\\\\)(div)([a-zA-Z]|[0-9]+|${fracExp}|${sqrtExp}|${exponentExp})`;

export const timesExp = `([a-zA-Z]|[0-9]+|${fracExp}|${sqrtExp}|${exponentExp}|(.*))(\\\\)(times)([a-zA-Z]|[0-9]+|${fracExp}|${sqrtExp}|${exponentExp})`;

export const dotExp = `([0-9]+).([0-9]+)?(\\\\)(dot)([0-9]+|{[0-9]}|([0-9]+)?\\\\dot([0-9]+|{[0-9]}))`;