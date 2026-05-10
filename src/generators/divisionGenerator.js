import { getDigitRange, getRandomInRange, getRandomNumberByDigits } from './numberUtils';

function generateDivisionExample(dividendDigits, divisorDigits) {
    const dividendRange = getDigitRange(dividendDigits);
    const divisor = getRandomNumberByDigits(divisorDigits);
    const minQuotient = Math.ceil(dividendRange.min / divisor);
    const maxQuotient = Math.floor(dividendRange.max / divisor);

    if (maxQuotient < minQuotient) {
        throw new RangeError('Невозможно сгенерировать деление с такими разрядностями.');
    }

    const quotient = getRandomInRange(minQuotient, maxQuotient);

    return {
        dividend: divisor * quotient,
        divisor,
        type: 'division'
    };
}

export function generateDivision(count, dividendDigits, divisorDigits) {
    const examples = [];

    for (let i = 0; i < count; i++) {
        examples.push(generateDivisionExample(dividendDigits, divisorDigits));
    }

    return examples;
}
