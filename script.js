    let savingsChart = null;
    let stackedBarChart = null;
    
    function updateRangeValue(inputId, valueId, suffix = '') {
        const input = document.getElementById(inputId);
        const value = document.getElementById(valueId);
        if (input && value) {
            if (inputId === 'years') {
                const years = parseInt(input.value);
                const months = years * 12;
                value.textContent = `${years} ans`;
            } else {
                value.textContent = parseFloat(input.value).toLocaleString('fr-FR') + suffix;
            }
        }
    }
    
    function calculateSavings() {
        const initialAmount = parseFloat(document.getElementById('initialAmount').value);
        const initialMonthlyContribution = parseFloat(document.getElementById('monthlyContribution').value);
        const annualInterestRate = parseFloat(document.getElementById('annualInterestRate').value) / 100;
        const years = parseInt(document.getElementById('years').value);
        const initialEntryFeesRate = parseFloat(document.getElementById('initialEntryFees').value) / 100;
        const monthlyEntryFeesRate = parseFloat(document.getElementById('monthlyEntryFees').value) / 100;
        const annualManagementFeesRate = parseFloat(document.getElementById('managementFees').value) / 100;
        const indexationRate = parseFloat(document.getElementById('indexationRate').value) / 100;
    
        let balance = initialAmount * (1 - initialEntryFeesRate);
        const monthlyInterestRate = Math.pow(1 + annualInterestRate, 1 / 12) - 1;
        const monthlyManagementFeesRate = Math.pow(1 + (-annualManagementFeesRate), 1 / 12) - 1;
        const months = years * 12;
    
        const contributionsData = [initialAmount];
        const interestData = [0];
        let totalContributions = initialAmount;
        let totalInterest = 0;
        let totalInitialEntryFees = initialAmount * initialEntryFeesRate;
        let totalMonthlyEntryFees = 0;
        let totalManagementFees = 0;
        let monthlyContribution = initialMonthlyContribution;
    
        for (let i = 1; i <= months; i++) {
            // Indexation du versement mensuel au début de chaque année
            if (i % 12 === 1 && i > 1) {
                monthlyContribution *= (1 + indexationRate);
            }
            
            // Les frais de gestion sont prélevés au début de chaque mois
            const managementFees = balance * (-monthlyManagementFeesRate);
            totalManagementFees += managementFees;
            balance -= managementFees;
            
            // Calcul des intérêts juste après la déduction des frais de gestion
            const interestEarned = balance * monthlyInterestRate;
            totalInterest += interestEarned;
            balance += interestEarned;
            
            const contributionAfterFees = monthlyContribution * (1 - monthlyEntryFeesRate);
            totalMonthlyEntryFees += monthlyContribution * monthlyEntryFeesRate;
            totalContributions += monthlyContribution;
            
            balance += contributionAfterFees;
            
            if (i % 12 === 0) {
                contributionsData.push(Math.round(totalContributions * 100) / 100);
                interestData.push(Math.round((totalInterest - totalManagementFees) * 100) / 100);
            }
        }
    
        const finalBalance = Math.round(balance * 100) / 100;
        const interestEarned = finalBalance - totalContributions + totalInitialEntryFees + totalMonthlyEntryFees + totalManagementFees;
    
        document.getElementById('finalAmount').textContent = Math.round(finalBalance).toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0});
        document.getElementById('totalContributions').textContent = Math.round(totalContributions).toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0});
        document.getElementById('interestEarned').textContent = Math.round(interestEarned).toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0});
        document.getElementById('totalInitialEntryFees').textContent = Math.round(totalInitialEntryFees).toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0});
        document.getElementById('totalMonthlyEntryFees').textContent = Math.round(totalMonthlyEntryFees).toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0});
        document.getElementById('totalManagementFees').textContent = Math.round(totalManagementFees).toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0});
        document.getElementById('lastMonthlyContribution').textContent = Math.round(monthlyContribution).toLocaleString('fr-FR', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0});
        
    
        updateCharts(contributionsData, interestData, years, totalContributions, interestEarned, totalInitialEntryFees, totalMonthlyEntryFees, totalManagementFees);
    }
        document.getElementById('interestEarned').textContent = interestEarned.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR'});
    
    function updateCharts(contributionsData, interestData, years, totalContributions, interestEarned, totalInitialEntryFees, totalMonthlyEntryFees, totalManagementFees) {
        const ctx1 = document.getElementById('savingsChart');
        const ctx3 = document.getElementById('stackedBarChart');

        if (savingsChart) {
            savingsChart.destroy();
        }
        if (stackedBarChart) {
            stackedBarChart.destroy();
        }
        
        const labels = Array.from({length: years + 1}, (_, i) => `${i} an${i > 1 ? 's' : ''} `);
        
        // Calcul des données cumulées
        const cumulativeData = contributionsData.map((contrib, index) => contrib + interestData[index]);
        
        const isDarkTheme = document.body.classList.contains('dark-theme');
        const textColor = isDarkTheme ? '#ffffff' : '#1a1a1a';
        const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        
        savingsChart = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Cumul des versements',
                        data: contributionsData,
                        borderColor: '#ffa500',
                        backgroundColor: 'rgba(255, 165, 0, 0.1)',
                        fill: true
                    },
                    {
                        label: 'Cumul total (versements + intérêts)',
                        data: cumulativeData,
                        borderColor: '#4caf50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Durée',
                            color: textColor
                        },
                        ticks: { color: textColor },
                        grid: { color: gridColor }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Montant (€)',
                            color: textColor
                        },
                        ticks: {
                            color: textColor,
                            callback: function(value) {
                                return value.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR'});
                            }
                        },
                        grid: { color: gridColor }
                    }
                },
                plugins: {
                    legend: { labels: { color: textColor } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    
       
        stackedBarChart = new Chart(ctx3, {
            type: 'bar',
            data: {
                labels: ['Résultat'],
                datasets: [
                    {
                        label: 'Versements',
                        data: [totalContributions],
                        backgroundColor: '#ffa500'
                    },
                    {
                        label: 'Intérêts gagnés',
                        data: [interestEarned],
                        backgroundColor: '#4caf50'
                    },
                    {
                        label: 'Frais totaux',
                        data: [totalInitialEntryFees + totalMonthlyEntryFees + totalManagementFees],
                        backgroundColor: '#ff6347'
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: textColor },
                        grid: { color: gridColor }
                    },
                    y: {
                        stacked: true,
                        ticks: {
                            color: textColor,
                            callback: function(value) {
                                return value.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR'});
                            }
                        },
                        grid: { color: gridColor }
                    }
                },
                plugins: {
                    legend: { labels: { color: textColor } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
    
    
    // Mise à jour des valeurs affichées et recalcul lors du changement des curseurs
    document.querySelectorAll('input[type="range"]').forEach(input => {
        input.addEventListener('input', () => {
            updateRangeValue(input.id, input.id + 'Value', input.id === 'annualInterestRate' || input.id === 'initialEntryFees' || input.id === 'monthlyEntryFees' || input.id === 'managementFees' || input.id === 'indexationRate' ? ' %' : ' €');
            calculateSavings();
        });
    });
    
    // Fonction pour changer de thème
    function toggleTheme() {
        document.body.classList.toggle('light-theme');
        document.body.classList.toggle('dark-theme');
        calculateSavings(); // Recalcul pour mettre à jour les couleurs des graphiques
    }
    
    // Ajout de l'événement au bouton de changement de thème
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Calcul initial
    document.addEventListener('DOMContentLoaded', function() {
        calculateSavings();
    });
