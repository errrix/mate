import { getDigitRange, getRandomInRange, getRandomNumberByDigits } from './numberUtils';

function generateLimitedFactors(firstDigits, secondDigits, maxResult) {
    const firstRange = getDigitRange(firstDigits);
    const secondRange = getDigitRange(secondDigits);

    if (firstRange.min * secondRange.min > maxResult) {
        throw new RangeError('Невозможно сгенерировать умножение с таким ограничением результата.');
    }

    const validFirstNumbers = [];
    for (let first = firstRange.min; first <= firstRange.max; first++) {
        if (first * secondRange.min <= maxResult) {
            validFirstNumbers.push(first);
        }
    }

    const first = validFirstNumbers[getRandomInRange(0, validFirstNumbers.length - 1)];
    const maxSecond = Math.min(secondRange.max, Math.floor(maxResult / first));
    const second = getRandomInRange(secondRange.min, maxSecond);

    return [first, second];
}

export function generateMultiplication(count, firstDigits, secondDigits, maxResult) {
    const examples = [];

    for (let i = 0; i < count; i++) {
        const [first, second] = maxResult > 0
            ? generateLimitedFactors(firstDigits, secondDigits, maxResult)
            : [getRandomNumberByDigits(firstDigits), getRandomNumberByDigits(secondDigits)];

        examples.push({
            numbers: [first, second],
            operator: '×',
            type: 'multiplication'
        });
    }

    return examples;
}
