import React from 'react';
import { useParams } from 'react-router-dom';
import { NotebookGrid } from './NotebookGrid';
import '../../components/ExamplesScreen.css';

const visualCases = {
    'small-horizontal': {
        title: 'Маленькие примеры',
        operator: '×',
        printAnswers: true,
        items: [
            { example: { numbers: [2, 7], operator: '×', type: 'multiplication' }, index: 0 },
            { example: { numbers: [4, 2], operator: '×', type: 'multiplication' }, index: 1 },
            { example: { numbers: [7, 4], operator: '×', type: 'multiplication' }, index: 2 },
            { example: { numbers: [8, 3], operator: '-', type: 'subtraction' }, index: 3 },
            { example: { numbers: [12, 7], operator: '-', type: 'subtraction' }, index: 4 },
            { example: { numbers: [19, 5], operator: '-', type: 'subtraction' }, index: 5 },
            { example: { numbers: [4, 7], operator: '+', type: 'addition' }, index: 6 },
            { example: { numbers: [9, 1], operator: '+', type: 'addition' }, index: 7 },
            { example: { numbers: [6, 6], operator: '×', type: 'multiplication' }, index: 8 }
        ]
    },
    'vertical-arithmetic': {
        title: 'Обычные примеры',
        operator: '+',
        printAnswers: true,
        items: [
            { example: { numbers: [235, 168], type: 'addition' }, index: 0 },
            { example: { numbers: [527, 389], type: 'subtraction' }, index: 1 },
            { example: { numbers: [34, 27], type: 'multiplication' }, index: 2 },
            { example: { numbers: ['426,30', '607,3'], type: 'addition' }, index: 3 }
        ]
    },
    'paginated-addition': {
        title: 'Много примеров',
        operator: '+',
        printAnswers: true,
        items: Array.from({ length: 80 }, (_, index) => ({
            example: { numbers: [123 + index, 45], type: 'addition' },
            index
        }))
    }
};

export function NotebookGridVisualTestPage() {
    const { caseName } = useParams();
    const visualCase = visualCases[caseName] ?? visualCases['small-horizontal'];

    return (
        <main className="screen active notebook-visual-test-page">
            <NotebookGrid
                title={visualCase.title}
                items={visualCase.items}
                operator={visualCase.operator}
                printAnswers={visualCase.printAnswers}
            />
        </main>
    );
}
