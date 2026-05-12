import { getRandomNumberByDigits } from './numberUtils';

export function generateMultiplication(count, firstDigits, secondDigits) {
    const examples = [];

    for (let i = 0; i < count; i++) {
        const first = getRandomNumberByDigits(firstDigits);
        const second = getRandomNumberByDigits(secondDigits);

        examples.push({
            numbers: [first, second],
            operator: '×',
            type: 'multiplication'
        });
    }

    return examples;
}
