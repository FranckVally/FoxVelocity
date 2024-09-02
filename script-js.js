document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="range"]');
    const resultElements = {
        finalAmount: document.getElementById('finalAmount'),
        totalContributions: document.getElementById('totalContributions'),
        interestEarned: document.getElementById('interestEarned'),
        totalInitialEntryFees: document.getElementById('totalInitialEntryFees'),
        totalMonthlyEntryFees: document.getElementById('totalMonthlyEntryFees'),
        totalManagementFees: document.getElementById('totalManagementFees'),
        lastMonthlyContribution: document.getElementById('lastMonthlyContribution')
    };

    inputs.forEach(input => {
        input.addEventListener('input', updateValue);
        input.addEventListener('change', calculate);
    });

    function updateValue(e) {
        const value = e.target.value;
        const outputId = e.target.id + 'Value';
        const output = document.getElementById(outputId);
        output.textContent = formatValue(value, e.target.id);
    }

    function formatValue(value, id) {
        switch (id) {
            case 'initialAmount':
            case 'monthlyContribution':
                return parseFloat(value).toLocaleString('fr-FR') + ' €';
            case 'annualInterestRate':
            case 'initialEntryFees':
            case 'monthlyEntryFees':
            case 'managementFees':
            case 'indexationRate':
                return parseFloat(value).toFixed(1) + ' %';
            case 'years':
                return value + (value > 1 ? ' ans' : ' an');
            default:
                return value;
        }
    }

    function calculate() {
        const initialAmount = parseFloat(document.getElementById('initialAmount').value);
        const monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value);
        const annualInterestRate = parseFloat(document.getElementById('annualInterestRate').value) / 100;
        const years = parseInt(document.getElementById('years').value);
        const initialEntryFees = parseFloat(document.getElementById('initialEntryFees').value) / 100;
        const monthlyEntryFees = parseFloat(document.getElementById('monthlyEntryFees').value) / 100;
        const managementFees = parseFloat(document.getElementById('managementFees').value) / 100;
        const indexationRate = parseFloat(document.getElementById('indexationRate').value) / 100;

        let balance = initialAmount * (1 - initialEntryFees);
        let totalContributions = initialAmount;
        let totalInitialEntryFees = initialAmount * initialEntryFees;
        let totalMonthlyEntryFees = 0;
        let totalManagementFees = 0;
        let currentMonthlyContribution = monthlyContribution;

        for (let month = 1; month <= years * 12; month++) {
            if (month % 12 === 1 && month > 1) {
                currentMonthlyContribution *= (1 + indexationRate);
            }

            const contributionAfterFees = currentMonthlyContribution * (1 - monthlyEntryFees);
            balance += contributionAfterFees;
            totalContributions += currentMonthlyContribution;
            totalMonthlyEntryFees += currentMonthlyContribution * monthlyEntryFees;

            const monthlyInterest = balance * (annualInterestRate / 12);
            balance += monthlyInterest;

            const monthlyManagementFees = balance * (managementFees / 12);
            balance -= monthlyManagementFees;
            totalManagementFees += monthlyManagementFees;
        }

        const interestEarned = balance - totalContributions + totalInitialEntryFees + totalMonthlyEntryFees + totalManagementFees;

        resultElements.finalAmount.textContent = formatCurrency(balance);
        resultElements.totalContributions.textContent = formatCurrency(totalContributions);
        resultElements.interestEarned.textContent = formatCurrency(interestEarned);
        resultElements.totalInitialEntryFees.textContent = formatCurrency(totalInitialEntryFees);
        resultElements.totalMonthlyEntryFees.textContent = formatCurrency(totalMonthlyEntryFees);
        resultElements.totalManagementFees.textContent = formatCurrency(totalManagementFees);
        resultElements.lastMonthlyContribution.textContent = formatCurrency(currentMonthlyContribution);

        // Add chart updates here if needed
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
    }

    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
    });

    // Initial calculation
    calculate();
});
