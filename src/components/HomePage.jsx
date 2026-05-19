import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const worksheetExamples = [
    { top: '48', operator: '+', bottom: '27' },
    { top: '93', operator: '-', bottom: '58' },
    { top: '124', operator: '+', bottom: '236' },
    { top: '72', operator: ':', bottom: '8' },
    { top: '306', operator: '-', bottom: '179' },
    { top: '37', operator: 'x', bottom: '6' },
    { top: '450', operator: '+', bottom: '125' },
    { top: '84', operator: ':', bottom: '7' },
    { top: '208', operator: '-', bottom: '96' },
    { top: '19', operator: 'x', bottom: '5' },
    { top: '700', operator: '-', bottom: '284' },
    { top: '56', operator: '+', bottom: '38' }
];

const homeVariants = {
    hp1: {
        tone: 'home-page-hp1',
        eyebrow: 'Для дома, урока и репетитора',
        headline: 'Лист с примерами за пару минут',
        lead: 'Выберите тему, диапазон чисел и количество заданий. Генератор соберет аккуратный лист по математике, который можно сразу распечатать.',
        cta: 'Создать лист с примерами',
        secondaryCta: 'Посмотреть, как это работает',
        visualTitle: 'Практика на сегодня',
        visualNote: 'A4 · тетрадная сетка · ответы по желанию',
        metrics: [
            ['2 минуты', 'на подготовку вместо ручного набора'],
            ['4 операции', 'сложение, вычитание, умножение, деление'],
            ['A4', 'готовый формат для печати']
        ],
        problemTitle: 'Когда практику надо дать сейчас, Word только мешает',
        problemText: 'Открыть документ, придумать примеры, выровнять столбики, проверить, что все влезло на лист. Для одной тренировки это слишком много мелкой работы.',
        problemPoints: ['не нужно набирать задания вручную', 'не нужно искать подходящий PDF', 'не нужно заново верстать лист под каждую тему'],
        benefitsTitle: 'Что получает взрослый, который готовит задания',
        benefits: [
            ['Быстрый старт', 'Сначала задаете параметры, затем сразу переходите к готовому листу.'],
            ['Настройка под уровень', 'Меняйте операции, диапазоны чисел, количество примеров и формат вывода.'],
            ['Печатный результат', 'Лист рассчитан на обычную печать и практику в тетради или на бумаге.']
        ],
        stepsTitle: 'Как это устроено',
        steps: [
            ['1', 'Выберите операции', 'Отметьте сложение, вычитание, умножение или деление.'],
            ['2', 'Задайте сложность', 'Укажите диапазоны, разрядность и количество примеров.'],
            ['3', 'Распечатайте лист', 'Получите готовые задания и, если нужно, блок с ответами.']
        ],
        useTitle: 'Подходит для разных сценариев',
        useCases: [
            ['Дома', 'Короткая тренировка после школы без долгой подготовки.'],
            ['На уроке', 'Раздаточный лист для закрепления темы.'],
            ['У репетитора', 'Быстрая подборка заданий под конкретного ученика.']
        ],
        faqTitle: 'Частые сомнения',
        faqs: [
            ['Нужно регистрироваться?', 'Нет. Можно перейти в генератор и сразу собрать лист.'],
            ['Можно менять сложность?', 'Да. Основной смысл страницы настроек — подобрать задания под текущий уровень.'],
            ['Это только для начальной школы?', 'Лучше всего подходит для базовой арифметики и регулярной практики вычислений.']
        ],
        finalTitle: 'Соберите первый лист и оцените, сколько времени это экономит',
        finalText: 'Начните с простого набора примеров, затем усложните параметры под ребенка, класс или ученика.'
    },
    hp2: {
        tone: 'home-page-hp2',
        eyebrow: 'Рабочий инструмент для занятий',
        headline: 'Листы для урока без ручной подготовки',
        lead: 'Генератор берет на себя рутину: создает однотипные примеры, сохраняет аккуратную разметку и помогает быстро получить материал для класса или индивидуального занятия.',
        cta: 'Перейти к генератору',
        secondaryCta: 'Разобрать процесс',
        visualTitle: 'Раздаточный лист',
        visualNote: '12 примеров · место для решения · печать',
        metrics: [
            ['без верстки', 'разметка собирается автоматически'],
            ['под тему', 'операции и числа задаются вручную'],
            ['для группы', 'можно быстро менять объем заданий']
        ],
        problemTitle: 'Подготовка однотипных заданий не должна съедать вечер',
        problemText: 'Учителю и репетитору часто нужен не красивый шаблон, а надежный рабочий лист: ровные примеры, понятная структура, быстрый повтор с другими числами.',
        problemPoints: ['меньше ручной рутины перед занятием', 'быстрее сделать несколько уровней сложности', 'проще держать формат листов одинаковым'],
        benefitsTitle: 'Почему это удобно для учебной работы',
        benefits: [
            ['Контроль объема', 'Задайте столько примеров, сколько нужно для пятиминутки, домашней работы или тренировки.'],
            ['Повторяемый формат', 'Каждый лист строится по одной логике, поэтому детям легче сосредоточиться на решении.'],
            ['Ответы под рукой', 'Если включить ответы, проверка занимает меньше времени после занятия.']
        ],
        stepsTitle: 'От темы урока до печати',
        steps: [
            ['01', 'Выберите навык', 'Например, вычитание с переходом через десяток или умножение.'],
            ['02', 'Ограничьте числа', 'Оставьте только тот диапазон, который сейчас нужен.'],
            ['03', 'Сформируйте лист', 'Распечатайте и используйте на уроке, дома или на консультации.']
        ],
        useTitle: 'Где страница экономит время',
        useCases: [
            ['Пятиминутка', 'Быстрый блок вычислений в начале урока.'],
            ['Домашняя работа', 'Лист на закрепление без поиска готовых материалов.'],
            ['Индивидуальная работа', 'Отдельный уровень сложности для ученика, которому нужна тренировка.']
        ],
        faqTitle: 'Что важно перед использованием',
        faqs: [
            ['Можно ли подготовить несколько листов?', 'Да. Меняйте параметры и генерируйте новый вариант.'],
            ['Подойдет для печати на A4?', 'Да, печатный сценарий — основная задача генератора.'],
            ['Можно ли использовать без интернета?', 'После загрузки приложения генерация работает в браузере, но сам сайт нужно открыть.']
        ],
        finalTitle: 'Сделайте лист под ближайшее занятие',
        finalText: 'Выберите тему, задайте объем и отправьте результат на печать.'
    },
    hp3: {
        tone: 'home-page-hp3',
        eyebrow: 'Для регулярной практики без лишних разговоров',
        headline: 'Математика на сегодня без вечерней подготовки',
        lead: 'Когда нужно немного потренироваться, откройте генератор, выберите сложность и распечатайте лист. Без поиска сборников и без ручного набора примеров.',
        cta: 'Сделать задания на сегодня',
        secondaryCta: 'Узнать подробнее',
        visualTitle: 'Домашняя тренировка',
        visualNote: '10-15 минут практики · простой лист',
        metrics: [
            ['быстро', 'подготовка не превращается в отдельную задачу'],
            ['понятно', 'ребенок видит обычные примеры на листе'],
            ['гибко', 'можно упростить или усложнить в следующий раз']
        ],
        problemTitle: 'Регулярность ломается, когда каждый лист надо придумывать заново',
        problemText: 'Сегодня нужно сложение, завтра вычитание, через неделю умножение. Если каждый раз искать материалы, практика откладывается.',
        problemPoints: ['легко сделать короткое занятие после школы', 'можно менять сложность по самочувствию ребенка', 'не нужно превращать подготовку в проект'],
        benefitsTitle: 'Что помогает заниматься спокойнее',
        benefits: [
            ['Короткая подготовка', 'Открыли, выбрали, распечатали. Остальное время остается на объяснение и решение.'],
            ['Задания без перегруза', 'Количество примеров настраивается, поэтому лист можно сделать коротким.'],
            ['Постепенное усложнение', 'Когда ребенок справляется, увеличьте диапазон чисел или добавьте другую операцию.']
        ],
        stepsTitle: 'Простой ритуал на 10-15 минут',
        steps: [
            ['раз', 'Соберите лист', 'Выберите только то, что ребенок сейчас проходит.'],
            ['два', 'Решите на бумаге', 'Печатный формат помогает не отвлекаться на экран.'],
            ['три', 'Повторите завтра', 'Смените числа или тему, когда понадобится.']
        ],
        useTitle: 'Когда особенно полезно',
        useCases: [
            ['После каникул', 'Мягко вернуть вычислительную практику.'],
            ['Перед контрольной', 'Повторить конкретный тип примеров.'],
            ['Для уверенности', 'Дать больше похожих заданий, если тема пока идет тяжело.']
        ],
        faqTitle: 'Вопросы родителей',
        faqs: [
            ['Это заменяет учебник?', 'Нет. Это быстрый способ дать дополнительную практику по вычислениям.'],
            ['Можно сделать совсем короткий лист?', 'Да. Количество примеров выбирается в настройках.'],
            ['Нужна помощь взрослого?', 'Для выбора параметров — да, но сам лист выглядит привычно для ребенка.']
        ],
        finalTitle: 'Подготовьте сегодняшнюю тренировку без долгой подготовки',
        finalText: 'Начните с небольшого листа и настройте сложность под текущую тему.'
    }
};

function WorksheetPreview({ title, note }) {
    return (
        <div className="home-preview" aria-label="Пример печатного листа">
            <div className="home-preview-paper">
                <div className="home-preview-topline">
                    <span>{title}</span>
                    <span>Дата: _______</span>
                </div>
                <div className="home-preview-grid">
                    {worksheetExamples.map((example, index) => (
                        <div className="home-worksheet-example" key={`${example.top}-${index}`}>
                            <div className="home-worksheet-top">{example.top}</div>
                            <div className="home-worksheet-bottom">
                                <span>{example.operator}</span>
                                <strong>{example.bottom}</strong>
                            </div>
                            <div className="home-worksheet-line" />
                        </div>
                    ))}
                </div>
                <div className="home-preview-note">{note}</div>
            </div>
        </div>
    );
}

function MetricStrip({ metrics }) {
    return (
        <div className="home-metrics" aria-label="Ключевые преимущества">
            {metrics.map(([value, label]) => (
                <div className="home-metric" key={value}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                </div>
            ))}
        </div>
    );
}

function SectionHeader({ eyebrow, title, text }) {
    return (
        <div className="home-section-heading">
            {eyebrow && <p>{eyebrow}</p>}
            <h2>{title}</h2>
            {text && <span>{text}</span>}
        </div>
    );
}

function HomeCardList({ items, className = '' }) {
    return (
        <div className={`home-card-list ${className}`}>
            {items.map(([title, text]) => (
                <article className="home-card" key={title}>
                    <h3>{title}</h3>
                    <p>{text}</p>
                </article>
            ))}
        </div>
    );
}

function Steps({ steps }) {
    return (
        <div className="home-steps">
            {steps.map(([number, title, text]) => (
                <article className="home-step" key={title}>
                    <span>{number}</span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                </article>
            ))}
        </div>
    );
}

function Faqs({ faqs }) {
    return (
        <div className="home-faq-list">
            {faqs.map(([question, answer]) => (
                <details className="home-faq" key={question}>
                    <summary>{question}</summary>
                    <p>{answer}</p>
                </details>
            ))}
        </div>
    );
}

export function HomePage({ variant = 'hp1' }) {
    const page = homeVariants[variant] || homeVariants.hp1;

    return (
        <article className={`home-page ${page.tone}`}>
            <section className="home-hero">
                <div className="home-hero-copy">
                    <p className="home-eyebrow">{page.eyebrow}</p>
                    <h1>{page.headline}</h1>
                    <p className="home-lead">{page.lead}</p>
                    <div className="home-actions">
                        <Link className="home-primary" to="/generator">{page.cta}</Link>
                        <Link className="home-secondary" to="/how-it-works">{page.secondaryCta}</Link>
                    </div>
                </div>
                <WorksheetPreview title={page.visualTitle} note={page.visualNote} />
            </section>

            <MetricStrip metrics={page.metrics} />

            <section className="home-problem">
                <div>
                    <SectionHeader title={page.problemTitle} text={page.problemText} />
                </div>
                <ul>
                    {page.problemPoints.map((point) => (
                        <li key={point}>{point}</li>
                    ))}
                </ul>
            </section>

            <section className="home-section">
                <SectionHeader eyebrow="Преимущества" title={page.benefitsTitle} />
                <HomeCardList items={page.benefits} />
            </section>

            <section className="home-section home-workflow">
                <SectionHeader eyebrow="Процесс" title={page.stepsTitle} />
                <Steps steps={page.steps} />
            </section>

            <section className="home-section">
                <SectionHeader eyebrow="Сценарии" title={page.useTitle} />
                <HomeCardList items={page.useCases} className="home-use-cases" />
            </section>

            <section className="home-section home-faq-section">
                <SectionHeader eyebrow="Перед стартом" title={page.faqTitle} />
                <Faqs faqs={page.faqs} />
            </section>

            <section className="home-final-cta">
                <div>
                    <h2>{page.finalTitle}</h2>
                    <p>{page.finalText}</p>
                </div>
                <Link className="home-primary" to="/generator">{page.cta}</Link>
            </section>
        </article>
    );
}
