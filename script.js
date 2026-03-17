document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('barter-form');
    const resultsPanel = document.getElementById('results-panel');
    const btnReset = document.getElementById('btnReset');
    const btnCopyPrompt = document.getElementById('btnCopyPrompt');

    const dynamicContext = document.getElementById('dynamic-context');
    const offerCategory = document.getElementById('offerCategory');

    const CONTEXT_FIELDS = {
        'access': { label: 'Что это за доступ?', id: 'ctx_access_type', placeholder: 'Например: Годовой абонемент или 1 ночь', type: 'text', hint: 'Поможет составить текст предложения.' },
        'service': { label: 'Объем услуг?', id: 'ctx_service_hours', placeholder: 'Например: 5 сеансов или 10 часов', type: 'text', hint: 'Уточните количественную оценку времени.' },
        'goods': { label: 'Состояние товара', id: 'ctx_goods_type', type: 'select', options: [{v:'new', t:'Свежая коллекция / Закуп'}, {v:'old', t:'Сток / Распродажа / Склад'}], hint: 'Сток бизнесу отдавать намного "дешевле", чем новинку.' },
        'pr': { label: 'Ожидаемый охват (просмотры)', id: 'ctx_reach', placeholder: 'Например: 10000', type: 'number', hint: 'Реальная ценность рекламы зависит от охвата.' },
        'food': { label: 'Количество персон', id: 'ctx_people', placeholder: 'Например: 2', type: 'number', hint: 'На сколько человек рассчитан предложенный сертификат/ужин.' },
        'rent': { label: 'Доплаты за обслуживание (₽)', id: 'ctx_rent_extra', placeholder: '0', type: 'number', hint: 'Сумма, которую вам придется заплатить из своего кармана.' },
        'transport': { label: 'Прямые затраты на логистику (₽)', id: 'ctx_out_of_pocket', placeholder: 'Например: 5000', type: 'number', hint: 'Сколько компания платит живыми деньгами за ваш проезд/перевозку.' },
        'medical': { label: 'Стоимость расходников (₽)', id: 'ctx_med_cost', placeholder: '0', type: 'number', hint: 'Примерная цена реагентов/материалов на 1 прием.' },
        'education': { label: 'Формат обучения', id: 'ctx_is_live', type: 'select', options: [{v:'no', t:'Запись курса (автоматика)'}, {v:'yes', t:'Живой поток / Группа с куратором'}], hint: 'Запись стоит бизнесу 0 руб, живой поток требует ресурсов.' },
        'software': { label: 'Срок лицензии', id: 'ctx_soft_term', placeholder: 'Например: 1 год или бессрочно', type: 'text', hint: 'Влияет на ценность в долгосроке.' },
        'raw': { label: 'Доступность материала', id: 'ctx_raw_spec', type: 'select', options: [{v:'easy', t:'Легко купить на рынке'}, {v:'hard', t:'Сложный дефицитный материал'}], hint: 'С дефицитом торговаться сложнее.' }
    };

    offerCategory.addEventListener('change', (e) => {
        const cat = e.target.value;
        const config = CONTEXT_FIELDS[cat];
        if (config) {
            dynamicContext.innerHTML = `
                <label for="${config.id}">
                    ${config.label}
                    <span class="help-icon" title="${config.hint}">?</span>
                </label>`;
            if (config.type === 'select') {
                const select = document.createElement('select');
                select.id = config.id;
                config.options.forEach(opt => {
                    const o = document.createElement('option');
                    o.value = opt.v; o.textContent = opt.t;
                    select.appendChild(o);
                });
                dynamicContext.appendChild(select);
            } else {
                const input = document.createElement('input');
                input.type = config.type; input.id = config.id; 
                input.placeholder = config.placeholder;
                dynamicContext.appendChild(input);
            }
            dynamicContext.classList.remove('hidden');
        } else {
            dynamicContext.classList.add('hidden');
            dynamicContext.innerHTML = '';
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateBarter();
    });

    btnReset.addEventListener('click', () => {
        resultsPanel.classList.add('hidden');
        dynamicContext.classList.add('hidden');
        form.reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    btnCopyPrompt.addEventListener('click', () => {
        const text = document.getElementById('negotiationPrompt').innerText;
        navigator.clipboard.writeText(text).then(() => {
            const icon = btnCopyPrompt.querySelector('i');
            icon.className = 'fa-solid fa-check';
            setTimeout(() => { icon.className = 'fa-regular fa-copy'; }, 2000);
        });
    });

    function getVal(id) { return parseFloat(document.getElementById(id).value) || 0; }
    function getStr(id) { return document.getElementById(id).value; }
    function getRadio(name) { 
        const el = document.querySelector(`input[name="${name}"]:checked`);
        return el ? el.value : ''; 
    }

    function calculateBarter() {
        // 1. Мои данные
        const myPrice = getVal('myPrice');
        const myExpenses = getVal('myExpenses');
        const portfolio = getRadio('portfolio');

        // 2. Данные бартера
        const offerCategory = getStr('offerCategory');
        const partnerBusy = getRadio('partnerBusy');
        const offerValue = getVal('offerValue');
        const liquidity = getRadio('liquidity');

        if (!offerCategory || !myPrice || !offerValue) return;

        // ==== МАГИЯ: ПОД КАПОТОМ ====
        // Базовая матрица себестоимости партнера (насколько им трудно):
        let marginalCost = 0; 
        let coordCost = 0; // Напряг для связи (доп. мое время)

        if (offerCategory === 'access') { 
            coordCost = 0.1;
            if (partnerBusy === 'empty') marginalCost = 0.05;
            else if (partnerBusy === 'normal') marginalCost = 0.15;
            else marginalCost = 0.4; 
        } else if (offerCategory === 'service') { 
            coordCost = 1.5; 
            if (partnerBusy === 'empty') marginalCost = 0.3;
            else if (partnerBusy === 'normal') marginalCost = 0.6;
            else marginalCost = 0.9; 
        } else if (offerCategory === 'goods') { 
            coordCost = 0.3;
            if (partnerBusy === 'empty') marginalCost = 0.4;
            else if (partnerBusy === 'normal') marginalCost = 0.5;
            else marginalCost = 0.75; 
        } else if (offerCategory === 'food') {
            coordCost = 0.4;
            if (partnerBusy === 'empty') marginalCost = 0.25;
            else if (partnerBusy === 'normal') marginalCost = 0.45;
            else marginalCost = 0.7;
        } else if (offerCategory === 'pr') { // Реклама, охваты
            coordCost = 1.0; 
            if (partnerBusy === 'empty') marginalCost = 0.01;
            else if (partnerBusy === 'normal') marginalCost = 0.05;
            else marginalCost = 0.6; 
        } else if (offerCategory === 'rent') { // Аренда студий
            coordCost = 0.2;
            if (partnerBusy === 'empty') marginalCost = 0.05;
            else if (partnerBusy === 'normal') marginalCost = 0.2;
            else marginalCost = 0.9;
        } else if (offerCategory === 'education' || offerCategory === 'software') { // Цифра
            coordCost = 0.1;
            marginalCost = 0.01; // Почти всегда 0 для компании
            if (partnerBusy === 'full') marginalCost = 0.1;
        } else if (offerCategory === 'raw') { // Материалы
            coordCost = 0.6;
            if (partnerBusy === 'empty') marginalCost = 0.4;
            else if (partnerBusy === 'normal') marginalCost = 0.6;
            else marginalCost = 0.9;
        } else if (offerCategory === 'transport') { // Билеты, такси
            coordCost = 0.5;
            const ctxCost = getVal('ctx_out_of_pocket');
            // Если они платят живые деньги за билет, MC растет
            marginalCost = ctxCost > 0 ? (ctxCost / offerValue) : 0.8; 
            if (marginalCost < 0.3) marginalCost = 0.3; // минимум на топливо
        } else if (offerCategory === 'medical') { // Врачи
            coordCost = 1.2;
            const ctxMed = getVal('ctx_med_cost');
            marginalCost = ctxMed > 0 ? (ctxMed / offerValue) : 0.4;
            if (partnerBusy === 'full') marginalCost += 0.3;
        }

        // Ликвидность и портафолио
        const liqCoef = liquidity === 'high' ? 1.0 : (liquidity === 'medium' ? 0.6 : 0.2);
        const portfolioBonus = portfolio === 'high' ? 0.4 : (portfolio === 'medium' ? 0.1 : 0.0);
        
        // --- СПЕЦ-КОРРЕКТИРОВКИ контекста (ДО расчета базы) ---
        if (offerCategory === 'goods') {
            const goodsType = getStr('ctx_goods_type');
            if (goodsType === 'old') { 
                marginalCost *= 0.6; // сток разгружать выгоднее
                coordCost += 0.2; // но может быть брак/косяки
            }
        }
        if (offerCategory === 'education') {
            const isLive = getStr('ctx_is_live');
            if (isLive === 'yes') { 
                marginalCost = Math.max(marginalCost, 0.5); 
                coordCost = 1.5; 
            }
        }
        if (offerCategory === 'rent') {
            const rentExtra = getVal('ctx_rent_extra');
            if (rentExtra > 0) {
                marginalCost += (rentExtra / offerValue); // доплаты повышают себестоимость
            }
        }
        if (offerCategory === 'raw') {
            const rawSpec = getStr('ctx_raw_spec');
            if (rawSpec === 'hard') marginalCost += 0.2; 
        }

        // --- ИТОГОВЫЙ РАСЧЕТ ЦЕННОСТИ ---
        function marginPenalty(mc) {
            return Math.max(0, 0.41 - mc * 0.5);
        }

        // Реальная ценность для меня (с учетом штрафа на "воздух")
        let realOfferValue = offerValue * liqCoef * (1 - (marginPenalty(marginalCost)));

        // Корректировка ценности по охватам PR
        if (offerCategory === 'pr') {
            const reach = getVal('ctx_reach');
            if (reach > 0 && reach < 2000) realOfferValue *= 0.6;
            else if (reach > 50000) realOfferValue *= 1.3; // большой охват реально ценен
        }

        // Рычаг торгов
        let suggestionMultiplier = Math.max(0.6, Math.round((2.2 - marginalCost * 1.8) * 10) / 10);
        
        // Для диджитала и доступов рычаг выше
        if (marginalCost < 0.15) suggestionMultiplier += 0.4;
        
        // Если это личный сервис (стрижка/массаж) - не борщим с рычагом
        if (offerCategory === 'service') suggestionMultiplier = Math.min(suggestionMultiplier, 1.6);

        let partnerSecretMsg = '';
        let partnerSecretColor = '';

        if (marginalCost < 0.25) {
            partnerSecretMsg = 'Шикарные условия для торгов! Выдать бартер этому бизнесу сейчас почти ничего не стоит — просите в 2-3 раза больше.';
            partnerSecretColor = '#34d399'; // green
        } else if (marginalCost < 0.55) {
            partnerSecretMsg = 'Нормальный рабочий бартер! Себестоимость умеренная, можно уверенно просить обмен с хорошим запасом.';
            partnerSecretColor = '#3b82f6'; // blue
        } else if (marginalCost > 0.75) {
            partnerSecretMsg = 'Осторожно! Партнер перегружен, бартер отнимает их «живые» деньги. На большую щедрость рассчитывать не стоит.';
            partnerSecretColor = '#f87171'; // red
        } else {
            partnerSecretMsg = 'Адекватный обмен. У бизнеса стабильная загрузка, торгуемся на равных.';
            partnerSecretColor = '#f59e0b'; // yellow
        }

        // Мой головняк:
        const busyCostMultiplier = partnerBusy === 'full' ? 1.5 : 1; 
        const hiddenCoordCost = (myPrice * 0.1) * coordCost * busyCostMultiplier;

        // ИТОГО себестоимость:
        const totalMyCost = myPrice + myExpenses + hiddenCoordCost - (myPrice * portfolioBonus);
        const netBenefit = realOfferValue - totalMyCost;
        const recommendedBarterAsk = myPrice * suggestionMultiplier;

        renderResults({
            netBenefit,
            realOfferValue,
            totalMyCost,
            myPrice,
            myExpenses,
            offerCategory,
            partnerBusy,
            offerValue,
            portfolio,
            liquidity,
            suggestionMultiplier,
            recommendedBarterAsk,
            partnerSecretMsg,
            partnerSecretColor,
            marginalCost
        });
    }

    function renderResults(res) {
        const banner = document.getElementById('verdictBanner');
        const title = document.getElementById('verdictTitle');
        const reason = document.getElementById('verdictReason');
        const promptEl = document.getElementById('negotiationPrompt');

        document.getElementById('resRealValue').textContent = formatMoney(res.realOfferValue);
        
        let realValMsg = `Рыночная цена ${formatMoney(res.offerValue)}. `;
        if (res.liquidity === 'low') realValMsg += 'Но так как это сложно продать, его реальный вес для вас сильно ниже.';
        else if (res.liquidity === 'medium') realValMsg += 'Но продать это с рук придется со скидкой.';
        else realValMsg += 'Вы легко сможете это конвертировать в деньги, так что цена справедлива.';
        document.getElementById('realValueExplain').textContent = realValMsg;

        const partnerResEl = document.getElementById('resPartnerSecrets');
        const partnerExpEl = document.getElementById('partnerSecretsExplain');
        
        partnerResEl.textContent = `Рычаг торгов: x${res.suggestionMultiplier}`;
        partnerResEl.style.color = res.partnerSecretColor;
        partnerExpEl.textContent = res.partnerSecretMsg;

        // ВЕРДИКТ И ПРОМПТ
        let verdict = '';
        let promptText = '';

        if (res.netBenefit > 0) {
            verdict = 'accept';
            title.innerHTML = '<i class="fa-solid fa-check-circle"></i> Бартер выгоден!';
            reason.textContent = "Предложение полностью окупает работу. Вы в плюсе.";
            
            promptText = `Здравствуйте!\nРассмотрел(а) ваше предложение. Проект интересный, готов(а) выполнить работу по бартеру на ваших условиях!\n\nДавайте обсудим: когда я смогу получить/активировать услугу и когда приступаем к работе?`;
            
            if (res.offerCategory === 'access') {
                promptText += `\n\nМожем зафиксировать, что я смогу активировать абонемент/свой доступ не сразу, а в нужный мне момент в течение года?`;
            }

        } else if (res.netBenefit > -(res.myPrice * 0.5) && (res.portfolio === 'high' || res.liquidity === 'high' || res.suggestionMultiplier > 1)) {
            verdict = 'consider';
            title.innerHTML = '<i class="fa-solid fa-scale-unbalanced"></i> Просите больше или доплаты';
            reason.textContent = "Обмен не совсем равный для вас. Это можно легко исправить переговорами.";

            if (res.suggestionMultiplier > 1.2) {
                // Пытаемся взять количеством (фитнес, билеты, залежалый товар)
                promptText = `Здравствуйте!\nПроект мне интересен, но объем бартера не совсем покрывает мои издержки.\nУчитывая, что мои услуги стоят ${formatMoney(res.myPrice)}, я бы хотел(а) попросить бартер на сумму около ${formatMoney(res.recommendedBarterAsk)} (например, увеличить количество услуг или добавить X).\nДля вас фактическая себестоимость этого объема несущественна, а мне это поможет оправдать временные затраты.\n\nЧто скажете?`;
            } else {
                // Пытаемся взять гибридно (мастера, плотная запись)
                const cashNeeded = Math.ceil((Math.abs(res.netBenefit) + res.myExpenses) / 1000) * 1000;
                promptText = `Здравствуйте!\nПроект отличный, но чистый бартер не покрывает мои базовые издержки (транспорт, налоги, время). \n\nПредлагаю гибридный формат:\n1. Часть по бартеру (например, ${formatMoney(res.offerValue * 0.7)})\n2. Доплата ${formatMoney(Math.max(cashNeeded, 2000))} живыми деньгами для закрытия моих срочных расходов.\n\nПодскажите, возможен ли такой вариант?`;
                
                if (res.offerCategory === 'service') {
                    promptText += `\n*Чтобы не нагружать ваших мастеров в плотном графике, я готов(а) разбить получение своих сеансов на несколько месяцев.*`;
                }
            }

        } else {
            verdict = 'reject';
            title.innerHTML = '<i class="fa-solid fa-xmark-circle"></i> Невыгодно. Откажитесь.';
            reason.textContent = "Трудозатрат больше, чем выгоды. Бизнес партнера сейчас не в том состоянии, чтобы дать вам хороший бартер.";

            promptText = `Здравствуйте!\nСпасибо за предложение, проект интересный.\nК сожалению, я всё просчитал(а), и сейчас не готов(а) брать его на бартерной основе. Мне это экономически невыгодно с учётом логистики и моих текущих накладных расходов.\n\nЕсли вопрос нужно решить, могу ли я предложить вам свои услуги за стандартный гонорар? Расскажите, есть ли на это бюджет?`;
        }

        banner.className = `verdict-banner verdict-${verdict}`;
        promptEl.innerText = promptText;

        resultsPanel.classList.remove('hidden');
        resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function formatMoney(num) {
        return num.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
    }
});
