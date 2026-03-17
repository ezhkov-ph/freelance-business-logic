document.addEventListener('DOMContentLoaded', () => {
    const billableHoursInput = document.getElementById('billableHours');
    const billableValue = document.getElementById('billableValue');
    const adminHoursInput = document.getElementById('adminHours');
    const adminValue = document.getElementById('adminValue');

    const expensesList = document.getElementById('expensesList');
    const hourlyRateDisplay = document.getElementById('hourlyRate');
    const totalExpensesDisplay = document.getElementById('totalExpenses');
    const growthReserveDisplay = document.getElementById('growthReserve');
    const profitPriceDisplay = document.getElementById('profitPrice');
    const strategyAdvice = document.getElementById('strategyAdvice');

    const addExpenseBtn = document.getElementById('addExpense');
    const modal = document.getElementById('modal');
    const confirmBtn = document.getElementById('confirmBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    // Update hours display
    billableHoursInput.addEventListener('input', (e) => {
        billableValue.textContent = `${e.target.value} ч`;
        calculate();
    });

    adminHoursInput.addEventListener('input', (e) => {
        adminValue.textContent = `${e.target.value} ч`;
        calculate();
    });

    // Listen to all expense inputs (delegation)
    expensesList.addEventListener('input', (e) => {
        if (e.target.classList.contains('exp-input')) {
            calculate();
        }
    });

    // Listen to growth percent change
    document.getElementById('growthPercent').addEventListener('input', calculate);

    // Calculation logic
    function calculate() {
        const billable = parseFloat(billableHoursInput.value);
        const admin = parseFloat(adminHoursInput.value);
        const totalWorkload = billable + admin;
        const taxRate = (parseFloat(document.getElementById('taxPercent').value) || 0) / 100;
        const growthRate = (parseFloat(document.getElementById('growthPercent').value) || 0) / 100;

        const inputs = document.querySelectorAll('.exp-input:not(#taxPercent):not(#growthPercent)');
        
        let fixedExpenses = 0;
        inputs.forEach(input => {
            fixedExpenses += parseFloat(input.value) || 0;
        });

        // Capacity Meter Update
        const capacityLabel = document.getElementById('totalCapacityLabel');
        const capacityFill = document.getElementById('capacityFill');
        capacityLabel.textContent = `${totalWorkload} ч / 160 ч`;
        
        const capPercent = Math.min(100, (totalWorkload / 160) * 100);
        capacityFill.style.width = `${capPercent}%`;
        
        if (totalWorkload > 160) {
            capacityFill.style.background = '#ef4444'; // Red
        } else if (totalWorkload > 120) {
            capacityFill.style.background = '#f59e0b'; // Amber
        } else {
            capacityFill.style.background = 'linear-gradient(90deg, var(--primary), var(--success))';
        }

        // --- MATH REVOLUTION (Janda Style) ---
        // Your "Life Hour Value" based on 160h standard
        const lifeHourValue = fixedExpenses / 160;
        
        // Overhead is literally "lost money" that must be recovered
        const overheadFinancialCost = admin * lifeHourValue;
        
        // Total budget to cover = Fixed bills + Value of your admin time
        const totalBudget = fixedExpenses + overheadFinancialCost;

        // Apply Tax
        const requiredRevenue = totalBudget / (1 - (taxRate >= 1 ? 0.99 : taxRate));

        // Minimum Rate (Break-even BASED on billable hours only)
        const minRate = Math.ceil(requiredRevenue / billable);
        
        // Growth (Dynamic buffer on top of EVERYTHING)
        const reserve = Math.ceil(totalBudget * growthRate);
        const profitRevenue = (totalBudget + reserve) / (1 - (taxRate >= 1 ? 0.99 : taxRate));
        const profitRate = Math.ceil(profitRevenue / billable);

        // Update UI
        profitPriceDisplay.textContent = profitRate.toLocaleString('ru-RU'); // Main Big Number
        hourlyRateDisplay.textContent = `${minRate.toLocaleString('ru-RU')} ₽/ч`; // Breakdown highlight
        totalExpensesDisplay.textContent = `${fixedExpenses.toLocaleString('ru-RU')} ₽`;
        document.getElementById('totalOverhead').textContent = `${Math.round(overheadFinancialCost).toLocaleString('ru-RU')} ₽`;
        growthReserveDisplay.textContent = `${reserve.toLocaleString('ru-RU')} ₽`;

        updateAdvice(minRate, profitRate, billable, totalWorkload, overheadFinancialCost);
    }

    function updateAdvice(min, profit, billable, total, overheadCost) {
        let text = "";
        
        if (total > 160) {
            text = "🔴 ПЕРЕГРУЗ. Вы работаете больше нормы. Цена вашего часа должна учитывать этот риск. ";
        } else {
            text = "🟢 Вы в графике. ";
        }

        const costMsg = overheadCost > 0 ? `Ваш оверхед (внутренние дела) «стоит» вам ${Math.round(overheadCost).toLocaleString('ru-RU')} ₽ в месяц. ` : "";
        text += costMsg + `Чтобы бизнес не шел в минус, минимальный проектный час должен быть ${min} ₽. `;
        
        if (billable < 60) {
            text += " У вас слишком мало оплачиваемых часов. Поднимайте чек, иначе оверхед вас съест.";
        }
        
        strategyAdvice.textContent = text;
    }

    // Modal logic
    addExpenseBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        clearModal();
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            clearModal();
        }
    });

    confirmBtn.addEventListener('click', () => {
        const name = document.getElementById('newExpName').value;
        const val = document.getElementById('newExpValue').value;

        if (name && val) {
            addNewExpense(name, val);
            modal.classList.add('hidden');
            clearModal();
            calculate();
        }
    });

    function addNewExpense(name, val) {
        const item = document.createElement('div');
        item.className = 'exp-item';
        item.innerHTML = `
            <div class="exp-info">
                <i class="fa-solid fa-tag"></i>
                <span>${name}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <input type="number" class="exp-input" value="${val}" style="width: 80px;">
                <button class="btn-delete" title="Удалить" style="background: transparent; border: none; color: var(--danger); cursor: pointer; padding: 5px; opacity: 0.5; transition: 0.3s;">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        
        // Handle deletion
        const deleteBtn = item.querySelector('.btn-delete');
        deleteBtn.addEventListener('mouseenter', () => deleteBtn.style.opacity = '1');
        deleteBtn.addEventListener('mouseleave', () => deleteBtn.style.opacity = '0.5');
        deleteBtn.addEventListener('click', () => {
            if(confirm(`Удалить категорию "${name}"?`)) {
                item.remove();
                calculate();
            }
        });

        expensesList.appendChild(item);
    }

    function clearModal() {
        document.getElementById('newExpName').value = '';
        document.getElementById('newExpValue').value = '';
    }

    // Initial calculation
    calculate();
});
