import { getDigitRange, getRandomInRange } from './numberUtils';

function generateDivisionExample(dividendDigits, divisorDigits, random) {
    const dividendRange = getDigitRange(dividendDigits);
    const divisorRange = getDigitRange(divisorDigits);
    // Dividing by 1 is not an exercise, so one-digit divisors start at 2.
    const divisor = getRandomInRange(Math.max(2, divisorRange.min), divisorRange.max, random);
    const minQuotient = Math.ceil(dividendRange.min / divisor);
    const maxQuotient = Math.floor(dividendRange.max / divisor);

    if (maxQuotient < minQuotient) {
        throw new RangeError('Невозможно сгенерировать деление с такими разрядностями.');
    }

    // Skip a quotient of 1 whenever the range offers anything else.
    const quotient = getRandomInRange(Math.min(Math.max(2, minQuotient), maxQuotient), maxQuotient, random);

    return {
        dividend: divisor * quotient,
        divisor,
        type: 'division'
    };
}

export function generateDivision(count, dividendDigits, divisorDigits, { random = Math.random } = {}) {
    const examples = [];

    for (let i = 0; i < count; i++) {
        examples.push(generateDivisionExample(dividendDigits, divisorDigits, random));
    }

    return examples;
}
