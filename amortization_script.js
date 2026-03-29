document.addEventListener('DOMContentLoaded', () => {
    // Элементы выбора оборудования
    const equipmentCards = document.querySelectorAll('.equipment-card');
    const customEquipmentBlock = document.getElementById('customEquipmentBlock');
    const customEquipName = document.getElementById('customEquipName');
    const equipNameInput = document.getElementById('equipName');

    // Элементы выбора метода
    const methodCards = document.querySelectorAll('.method-card');

    // Параметры
    const initialCostInput = document.getElementById('initialCost');
    const usefulLifeInput = document.getElementById('usefulLife');
    const liquidationValueInput = document.getElementById('liquidationValue');
    const totalProductionInput = document.getElementById('totalProduction');
    const currentProductionInput = document.getElementById('currentProduction');
    const groupBalanceInput = document.getElementById('groupBalance');
    const groupRateInput = document.getElementById('groupRate');

    // Дополнительные параметры
    const productionParams = document.getElementById('productionParams');
    const groupParams = document.getElementById('groupParams');

    // Настройки расчета
    const calcPeriodSelect = document.getElementById('calcPeriod');
    const accelerationFactorInput = document.getElementById('accelerationFactor');
    const interestRateInput = document.getElementById('interestRate');

    // Кнопки
    const calcBtn = document.getElementById('calcBtn');
    const btnReset = document.getElementById('btnReset');

    // Результаты
    const resultsPanel = document.getElementById('results-panel');
    const resultSubtitle = document.getElementById('resultSubtitle');
    const resAmortizationAmount = document.getElementById('resAmortizationAmount');
    const resRemainingValue = document.getElementById('resRemainingValue');
    const resAccumulatedAmort = document.getElementById('resAccumulatedAmort');
    const resDepreciationRate = document.getElementById('resDepreciationRate');
    const scheduleTableBody = document.getElementById('scheduleTableBody');
    const methodDescription = document.getElementById('methodDescription');
    const methodPros = document.getElementById('methodPros');
    const methodCons = document.getElementById('methodCons');
    const industryAdvice = document.getElementById('industryAdvice');

    // Состояние
    let selectedEquipmentType = null;
    let selectedMethod = null;

    // Данные по оборудованию для креативных индустрий
    const equipmentDefaults = {
        photo: { name: 'Фотокамера', life: 5, defaultRate: 20 },
        video: { name: 'Видеокамера', life: 5, defaultRate: 20 },
        dj: { name: 'DJ контроллер', life: 7, defaultRate: 14 },
        light: { name: 'Световой прибор', life: 5, defaultRate: 20 },
        audio: { name: 'Аудиооборудование', life: 7, defaultRate: 14 },
        computer: { name: 'Ноутбук для монтажа', life: 3, defaultRate: 33 },
        custom: { name: '', life: 5, defaultRate: 20 }
    };

    // Описание методов амортизации (7 методов - без истощения)
    const methodsInfo = {
        linear: {
            name: 'Линейный метод',
            description: 'Амортизация начисляется равномерно в течение всего срока полезного использования. Каждый год списывается одинаковая сумма, рассчитанная как отношение первоначальной стоимости к сроку службы. Это самый простой и предсказуемый метод.',
            pros: ['Простота расчета и понимания', 'Равномерное распределение расходов', 'Удобно для планирования бюджета', 'Подходит для оборудования с постоянным износом'],
            cons: ['Не учитывает ускоренный износ в начале срока', 'Не отражает реальное снижение производительности', 'Менее выгоден для налогообложения в первые годы'],
            advice: {
                photo: 'Идеально для фотооборудования, которое используется равномерно. Камеры и объективы стареют постепенно.',
                video: 'Хорошо подходит для видеокамер стабильного использования.',
                dj: 'Рекомендуется для DJ-оборудования среднего уровня.',
                light: 'Отлично для светодиодного оборудования с предсказуемым сроком службы.',
                audio: 'Подходит для студийного оборудования с равномерным износом.',
                computer: 'Не рекомендуется для компьютеров — они устаревают быстрее в первые годы.',
                custom: 'Универсальный выбор для большинства видов оборудования.'
            }
        },
        declining: {
            name: 'Метод уменьшаемого остатка',
            description: 'Ускоренный метод амортизации, при котором наибольшие суммы списываются в первые годы службы актива. Процент рассчитывается от остаточной стоимости, а не от первоначальной. Коэффициент ускорения обычно равен 2 (двойное уменьшение).',
            pros: ['Быстрое возмещение стоимости оборудования', 'Снижение налога на прибыль в первые годы', 'Лучше отражает реальный износ техники', 'Защита от риска морального устаревания'],
            cons: ['Сложнее в расчетах', 'Меньше налоговых преимуществ в конце срока', 'Не подходит для оборудования с равномерным износом'],
            advice: {
                photo: 'Отлично для профессиональных камер — они быстро теряют стоимость в первые годы.',
                video: 'Рекомендуется для видеооборудования высокого класса.',
                dj: 'Хорошо для топового DJ-оборудования, которое быстро обновляется.',
                light: 'Подходит для сложного светового оборудования.',
                audio: 'Рекомендуется для цифрового аудиооборудования.',
                computer: 'Идеально для компьютеров и ноутбуков — они стремительно дешевеют.',
                custom: 'Выбирайте для оборудования, которое быстро устаревает морально.'
            }
        },
        annuity: {
            name: 'Аннуитетный метод',
            description: 'Метод основан на концепции сложных процентов. В первые годы амортизация минимальна, а в последние — максимальна. Работает по принципу аннуитетных платежей в кредитах, но в обратном порядке.',
            pros: ['Меньшая нагрузка на расходы в начале срока', 'Увеличение амортизации к концу срока', 'Подходит для оборудования с растущей производительностью'],
            cons: ['Сложный расчет', 'Меньше преимуществ для налогообложения в начале', 'Не интуитивен для понимания'],
            advice: {
                photo: 'Редко используется для фотооборудования.',
                video: 'Может подойти для оборудования с растущей отдачей.',
                dj: 'Не рекомендуется для DJ-оборудования.',
                light: 'Подходит для систем с постепенным выходом на полную мощность.',
                audio: 'Возможно для студий с планируемым ростом загрузки.',
                computer: 'Не рекомендуется для компьютерной техники.',
                custom: 'Используйте только для специфических случаев с растущей эффективностью.'
            }
        },
        units: {
            name: 'Метод единиц производства',
            description: 'Амортизация напрямую зависит от фактической эксплуатации оборудования. Рассчитывается пропорционально количеству выпущенных единиц продукции, отработанных часов, съемок или других показателей.',
            pros: ['Точно отражает фактический износ', 'Справедливое распределение расходов', 'Гибкость при неравномерной загрузке', 'Нет амортизации при простое'],
            cons: ['Требует точного учета производства', 'Сложнее в администрировании', 'Непредсказуемость расходов'],
            advice: {
                photo: 'Идеально для фотографов — считайте по количеству съемок.',
                video: 'Отлично для видеографов — по числу проектов или часов съемки.',
                dj: 'Хорошо для DJ — по количеству мероприятий.',
                light: 'Подходит для прокатного оборудования — по дням аренды.',
                audio: 'Рекомендуется для студийного оборудования — по часам записи.',
                computer: 'Возможно для рендер-ферм — по количеству проектов.',
                custom: 'Лучший выбор при неравномерной загрузке оборудования.'
            }
        },
        group: {
            name: 'Нелинейный (групповой) метод',
            description: 'Амортизация начисляется не на отдельный актив, а на группу однородного оборудования. Все объекты объединяются в пул, и амортизация рассчитывается от суммарного баланса группы по установленной норме.',
            pros: ['Упрощение учета для множества объектов', 'Автоматическое распределение износа', 'Удобно для парка оборудования', 'Гибкость при выбытии отдельных единиц'],
            cons: ['Требует группировки активов', 'Менее точный для отдельных единиц', 'Сложнее при инвентаризации'],
            advice: {
                photo: 'Отлично для студий с парком камер и объективов.',
                video: 'Рекомендуется для продакшенов с большим парком техники.',
                dj: 'Подходит для компаний с несколькими комплектами.',
                light: 'Идеально для больших парков светового оборудования.',
                audio: 'Хорошо для студий с множеством микрофонов и каналов.',
                computer: 'Рекомендуется для парков компьютеров.',
                custom: 'Выбирайте при наличии более 5 единиц однородного оборудования.'
            }
        },
        sumyears: {
            name: 'Метод суммы чисел лет',
            description: 'Ускоренный метод, где амортизация рассчитывается через дробь: в числителе — оставшиеся годы службы, в знаменателе — сумма всех лет срока полезного использования. Например, для 5 лет: 5/15, 4/15, 3/15, 2/15, 1/15.',
            pros: ['Ускоренное списание в первые годы', 'Проще метода уменьшаемого остатка', 'Хорошая защита от устаревания', 'Налоговые преимущества'],
            cons: ['Более сложный расчет, чем линейный', 'Меньше амортизации в конце срока', 'Не подходит для равномерного износа'],
            advice: {
                photo: 'Хорошо для профессионального фотооборудования.',
                video: 'Рекомендуется для видеокамер высокого класса.',
                dj: 'Подходит для топового оборудования.',
                light: 'Хорошо для сложного светового оборудования.',
                audio: 'Рекомендуется для цифровых аудиосистем.',
                computer: 'Отлично для компьютеров — защищает от быстрого устаревания.',
                custom: 'Выбирайте для оборудования с ускоренным износом в начале.'
            }
        },
        immediate: {
            name: 'Единовременное списание',
            description: 'Позволяет списать 100% (или фиксированную часть, например, 30%) стоимости оборудования в расходы сразу в момент ввода в эксплуатацию. Максимально быстрый метод амортизации.',
            pros: ['Мгновенное возмещение стоимости', 'Максимальная налоговая экономия в первый год', 'Простота учета', 'Нет необходимости в дальнейших расчетах'],
            cons: ['Нет амортизации в последующие годы', 'Требует достаточной прибыли в первый год', 'Не отражает реальный износ', 'Применим не во всех юрисдикциях'],
            advice: {
                photo: 'Возможно для недорогих аксессуаров и расходников.',
                video: 'Подходит для мелкого оборудования до определенного лимита.',
                dj: 'Возможно для кабелей, адаптеров, расходников.',
                light: 'Подходит для недорогих световых приборов.',
                audio: 'Возможно для микрофонов и кабелей.',
                computer: 'Рекомендуется для периферии и аксессуаров.',
                custom: 'Используйте для недорогого оборудования или в рамках специальных программ.'
            }
        }
    };

    // Выбор типа оборудования
    equipmentCards.forEach(card => {
        card.addEventListener('click', () => {
            equipmentCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedEquipmentType = card.dataset.type;

            // Показываем поле для кастомного названия
            if (selectedEquipmentType === 'custom') {
                customEquipmentBlock.classList.remove('hidden');
            } else {
                customEquipmentBlock.classList.add('hidden');
                // Автозаполнение названия
                const defaults = equipmentDefaults[selectedEquipmentType];
                if (defaults && !equipNameInput.value) {
                    equipNameInput.value = defaults.name;
                }
            }

            // Автозаполнение срока службы
            const defaults = equipmentDefaults[selectedEquipmentType];
            if (defaults && !usefulLifeInput.value) {
                usefulLifeInput.value = defaults.life;
            }
        });
    });

    // Выбор метода амортизации
    methodCards.forEach(card => {
        card.addEventListener('click', () => {
            methodCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedMethod = card.dataset.method;

            // Показываем дополнительные параметры
            productionParams.classList.add('hidden');
            groupParams.classList.add('hidden');

            if (selectedMethod === 'units') {
                productionParams.classList.remove('hidden');
            } else if (selectedMethod === 'group') {
                groupParams.classList.remove('hidden');
            }
        });
    });

    // Расчет амортизации
    calcBtn.addEventListener('click', () => {
        if (!selectedMethod) {
            alert('Пожалуйста, выберите метод амортизации');
            return;
        }

        const initialCost = parseFloat(initialCostInput.value) || 0;
        const usefulLife = parseInt(usefulLifeInput.value) || 0;
        const liquidationValue = parseFloat(liquidationValueInput.value) || 0;
        const accelerationFactor = parseFloat(accelerationFactorInput.value) || 2;
        const interestRate = parseFloat(interestRateInput.value) || 10;
        const period = calcPeriodSelect.value;

        if (initialCost <= 0 || usefulLife <= 0) {
            alert('Пожалуйста, заполните стоимость и срок полезного использования');
            return;
        }

        let results = null;
        const depreciableAmount = initialCost - liquidationValue;

        switch (selectedMethod) {
            case 'linear':
                results = calculateLinear(initialCost, liquidationValue, usefulLife, period);
                break;
            case 'declining':
                results = calculateDeclining(initialCost, liquidationValue, usefulLife, accelerationFactor, period);
                break;
            case 'annuity':
                results = calculateAnnuity(initialCost, liquidationValue, usefulLife, interestRate, period);
                break;
            case 'units':
                const totalProduction = parseFloat(totalProductionInput.value) || 0;
                const currentProduction = parseFloat(currentProductionInput.value) || 0;
                results = calculateUnits(depreciableAmount, totalProduction, currentProduction);
                break;
            case 'group':
                const groupBalance = parseFloat(groupBalanceInput.value) || initialCost;
                const groupRate = parseFloat(groupRateInput.value) || 20;
                results = calculateGroup(groupBalance, groupRate, period);
                break;
            case 'sumyears':
                results = calculateSumYears(initialCost, liquidationValue, usefulLife, period);
                break;
            case 'immediate':
                results = calculateImmediate(initialCost);
                break;
        }

        if (results) {
            displayResults(results, initialCost, usefulLife);
        }
    });

    // Функции расчета амортизации
    
    /**
     * Линейный метод - равномерная амортизация
     */
    function calculateLinear(initialCost, liquidationValue, usefulLife, period) {
        const depreciableAmount = initialCost - liquidationValue;
        const annualDepreciation = depreciableAmount / usefulLife;
        const annualRate = (annualDepreciation / initialCost) * 100;

        const periodMultiplier = getPeriodMultiplier(period);
        const periodDepreciation = annualDepreciation * periodMultiplier;

        const schedule = [];
        let accumulated = 0;
        let remaining = initialCost;

        for (let year = 1; year <= usefulLife; year++) {
            accumulated += annualDepreciation;
            remaining -= annualDepreciation;
            schedule.push({
                year,
                depreciation: annualDepreciation,
                accumulated,
                remaining: Math.max(remaining, liquidationValue)
            });
        }

        return {
            periodDepreciation,
            remainingValue: initialCost - periodDepreciation,
            accumulatedAmort: periodDepreciation,
            annualRate,
            schedule
        };
    }

    /**
     * Метод уменьшаемого остатка - ускоренная амортизация
     */
    function calculateDeclining(initialCost, liquidationValue, usefulLife, accelerationFactor, period) {
        const straightLineRate = 1 / usefulLife;
        const decliningRate = straightLineRate * accelerationFactor;

        const periodMultiplier = getPeriodMultiplier(period);

        const schedule = [];
        let accumulated = 0;
        let remaining = initialCost;
        let firstYearDepreciation = 0;

        for (let year = 1; year <= usefulLife; year++) {
            const yearDepreciation = remaining * decliningRate;
            if (year === 1) {
                firstYearDepreciation = yearDepreciation * periodMultiplier;
            }

            // Не опускаем ниже ликвидационной стоимости
            const actualDepreciation = Math.min(yearDepreciation, remaining - liquidationValue);
            accumulated += actualDepreciation;
            remaining -= actualDepreciation;

            schedule.push({
                year,
                depreciation: actualDepreciation,
                accumulated,
                remaining: Math.max(remaining, liquidationValue)
            });
        }

        const annualRate = decliningRate * 100;

        return {
            periodDepreciation: firstYearDepreciation,
            remainingValue: initialCost - firstYearDepreciation,
            accumulatedAmort: firstYearDepreciation,
            annualRate,
            schedule
        };
    }

    /**
     * Аннуитетный метод - сложные проценты
     */
    function calculateAnnuity(initialCost, liquidationValue, usefulLife, interestRate, period) {
        const rate = interestRate / 100;
        const depreciableAmount = initialCost - liquidationValue;

        // Аннуитетный фактор
        const annuityFactor = (rate * Math.pow(1 + rate, usefulLife)) / (Math.pow(1 + rate, usefulLife) - 1);
        const annualPayment = depreciableAmount * annuityFactor;

        const periodMultiplier = getPeriodMultiplier(period);

        const schedule = [];
        let accumulated = 0;
        let remaining = initialCost;
        let firstYearDepreciation = 0;

        for (let year = 1; year <= usefulLife; year++) {
            const interestExpense = remaining * rate;
            const principalPortion = annualPayment - interestExpense;

            if (year === 1) {
                firstYearDepreciation = principalPortion * periodMultiplier;
            }

            accumulated += principalPortion;
            remaining -= principalPortion;

            schedule.push({
                year,
                depreciation: principalPortion,
                accumulated,
                remaining: Math.max(remaining, liquidationValue)
            });
        }

        const annualRate = (firstYearDepreciation / initialCost) * 100;

        return {
            periodDepreciation: firstYearDepreciation,
            remainingValue: initialCost - firstYearDepreciation,
            accumulatedAmort: firstYearDepreciation,
            annualRate,
            schedule
        };
    }

    /**
     * Метод единиц производства - по факту эксплуатации
     */
    function calculateUnits(depreciableAmount, totalProduction, currentProduction) {
        if (totalProduction <= 0) {
            return {
                periodDepreciation: 0,
                remainingValue: depreciableAmount,
                accumulatedAmort: 0,
                annualRate: 0,
                schedule: []
            };
        }

        const ratePerUnit = depreciableAmount / totalProduction;
        const periodDepreciation = ratePerUnit * currentProduction;

        return {
            periodDepreciation,
            remainingValue: depreciableAmount - periodDepreciation,
            accumulatedAmort: periodDepreciation,
            annualRate: totalProduction > 0 ? (currentProduction / totalProduction) * 100 : 0,
            schedule: [{
                year: 1,
                depreciation: periodDepreciation,
                accumulated: periodDepreciation,
                remaining: Math.max(depreciableAmount - periodDepreciation, 0)
            }]
        };
    }

    /**
     * Групповой метод - амортизация пула активов
     */
    function calculateGroup(groupBalance, groupRate, period) {
        const periodMultiplier = getPeriodMultiplier(period);
        const annualDepreciation = groupBalance * (groupRate / 100);
        const periodDepreciation = annualDepreciation * periodMultiplier;

        return {
            periodDepreciation,
            remainingValue: groupBalance - periodDepreciation,
            accumulatedAmort: periodDepreciation,
            annualRate: groupRate,
            schedule: [{
                year: 1,
                depreciation: periodDepreciation,
                accumulated: periodDepreciation,
                remaining: groupBalance - periodDepreciation
            }]
        };
    }

    /**
     * Метод суммы чисел лет - ускоренная амортизация
     */
    function calculateSumYears(initialCost, liquidationValue, usefulLife, period) {
        const depreciableAmount = initialCost - liquidationValue;
        const sumOfYears = (usefulLife * (usefulLife + 1)) / 2;
        const periodMultiplier = getPeriodMultiplier(period);

        const schedule = [];
        let accumulated = 0;
        let remaining = initialCost;
        let firstYearDepreciation = 0;

        for (let year = 1; year <= usefulLife; year++) {
            const remainingYears = usefulLife - year + 1;
            const yearDepreciation = depreciableAmount * (remainingYears / sumOfYears);

            if (year === 1) {
                firstYearDepreciation = yearDepreciation * periodMultiplier;
            }

            accumulated += yearDepreciation;
            remaining -= yearDepreciation;

            schedule.push({
                year,
                depreciation: yearDepreciation,
                accumulated,
                remaining: Math.max(remaining, liquidationValue)
            });
        }

        const annualRate = (firstYearDepreciation / initialCost) * 100;

        return {
            periodDepreciation: firstYearDepreciation,
            remainingValue: initialCost - firstYearDepreciation,
            accumulatedAmort: firstYearDepreciation,
            annualRate,
            schedule
        };
    }

    /**
     * Единовременное списание - 100% в первый год
     */
    function calculateImmediate(initialCost) {
        return {
            periodDepreciation: initialCost,
            remainingValue: 0,
            accumulatedAmort: initialCost,
            annualRate: 100,
            schedule: [{
                year: 1,
                depreciation: initialCost,
                accumulated: initialCost,
                remaining: 0
            }]
        };
    }

    /**
     * Коэффициент периода расчета
     */
    function getPeriodMultiplier(period) {
        switch (period) {
            case 'month': return 1 / 12;
            case 'quarter': return 1 / 4;
            case 'year': return 1;
            case 'full': return 1;
            default: return 1;
        }
    }

    // Отображение результатов
    function displayResults(results, initialCost, usefulLife) {
        resultsPanel.classList.remove('hidden');

        // Обновляем подзаголовок
        const equipmentName = equipNameInput.value || 'Оборудование';
        const methodName = methodsInfo[selectedMethod]?.name || 'Метод';
        resultSubtitle.textContent = `${methodName} для "${equipmentName}"`;

        // Основные показатели
        resAmortizationAmount.textContent = formatMoney(results.periodDepreciation);
        resRemainingValue.textContent = formatMoney(results.remainingValue);
        resAccumulatedAmort.textContent = formatMoney(results.accumulatedAmort);
        resDepreciationRate.textContent = results.annualRate.toFixed(2) + '%';

        // Таблица по годам
        scheduleTableBody.innerHTML = '';
        results.schedule.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.year}</td>
                <td>${formatMoney(row.depreciation)}</td>
                <td>${formatMoney(row.accumulated)}</td>
                <td>${formatMoney(row.remaining)}</td>
            `;
            scheduleTableBody.appendChild(tr);
        });

        // Описание метода
        const methodInfo = methodsInfo[selectedMethod];
        if (methodInfo) {
            methodDescription.textContent = methodInfo.description;

            // Преимущества
            methodPros.innerHTML = '';
            methodInfo.pros.forEach(pro => {
                const li = document.createElement('li');
                li.textContent = pro;
                methodPros.appendChild(li);
            });

            // Недостатки
            methodCons.innerHTML = '';
            methodInfo.cons.forEach(cons => {
                const li = document.createElement('li');
                li.textContent = cons;
                methodCons.appendChild(li);
            });

            // Рекомендации для индустрии
            const advice = methodInfo.advice[selectedEquipmentType] || methodInfo.advice.custom;
            industryAdvice.textContent = advice;
        }

        // Прокрутка к результатам
        resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function formatMoney(num) {
        return num.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
    }

    // Сброс
    btnReset.addEventListener('click', () => {
        resultsPanel.classList.add('hidden');
        methodCards.forEach(c => c.classList.remove('selected'));
        equipmentCards.forEach(c => c.classList.remove('selected'));
        selectedMethod = null;
        selectedEquipmentType = null;

        productionParams.classList.add('hidden');
        groupParams.classList.add('hidden');
        customEquipmentBlock.classList.add('hidden');
        
        // Очистка полей
        initialCostInput.value = '';
        usefulLifeInput.value = '';
        liquidationValueInput.value = '0';
        totalProductionInput.value = '';
        currentProductionInput.value = '';
        groupBalanceInput.value = '';
        groupRateInput.value = '';
        equipNameInput.value = '';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
