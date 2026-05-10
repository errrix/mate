/**
 * Генератор примеров на сложение
 */

/**
 * Генерирует случайное число заданной разрядности
 */
function getRandomNumber(digits) {
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Генерирует примеры на сложение
 * @param {number} count - количество примеров
 * @param {number} digits - разрядность чисел
 * @param {number} terms - количество слагаемых
 * @returns {Array} массив примеров
 */
export function generateAddition(count, digits, terms) {
    const examples = [];
    for (let i = 0; i < count; i++) {
        const numbers = [];
        for (let j = 0; j < terms; j++) {
            const num = getRandomNumber(digits);
            numbers.push(num);
        }
        examples.push({ 
            numbers, 
            operator: '+',
            type: 'addition'
        });
    }
    return examples;
}
