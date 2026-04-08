/**
 * Financial calculation utilities (server-side)
 * EMI, Health Score, SIP, SWP, Compound Interest, etc.
 */

/**
 * Calculate EMI (Equated Monthly Installment)
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (%)
 * @param {number} tenureMonths - Loan tenure in months
 */
const calculateEMI = (principal, annualRate, tenureMonths) => {
  if (annualRate === 0) return principal / tenureMonths;
  const r = annualRate / 12 / 100;
  const emi = (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
  return Math.round(emi * 100) / 100;
};

/**
 * Generate amortization schedule for a loan
 */
const generateAmortizationSchedule = (principal, annualRate, tenureMonths) => {
  const emi = calculateEMI(principal, annualRate, tenureMonths);
  const r = annualRate / 12 / 100;
  const schedule = [];
  let balance = principal;

  for (let month = 1; month <= tenureMonths; month++) {
    const interest = Math.round(balance * r * 100) / 100;
    const principalPaid = Math.round((emi - interest) * 100) / 100;
    balance = Math.max(0, Math.round((balance - principalPaid) * 100) / 100);
    schedule.push({ month, emi, interest, principalPaid, balance });
  }
  return schedule;
};

/**
 * Calculate future value of SIP (Systematic Investment Plan)
 * Optionally with step-up (annual % increase in contribution)
 */
const calculateSIP = (monthlyAmount, annualRate, tenureYears, stepUpPercent = 0) => {
  const totalMonths = tenureYears * 12;
  const r = annualRate / 12 / 100;
  const yearlyBreakdown = [];
  let totalInvested = 0;
  let futureValue = 0;

  if (stepUpPercent === 0) {
    // Standard SIP formula
    futureValue = monthlyAmount * ((Math.pow(1 + r, totalMonths) - 1) / r) * (1 + r);
    totalInvested = monthlyAmount * totalMonths;

    // Year-by-year for chart
    for (let y = 1; y <= tenureYears; y++) {
      const months = y * 12;
      const fv = monthlyAmount * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
      yearlyBreakdown.push({ year: y, invested: monthlyAmount * months, value: Math.round(fv) });
    }
  } else {
    // Step-up SIP (month-by-month simulation)
    let currentMonthly = monthlyAmount;
    let corpus = 0;
    let invested = 0;

    for (let month = 1; month <= totalMonths; month++) {
      if (month > 1 && (month - 1) % 12 === 0) {
        currentMonthly = currentMonthly * (1 + stepUpPercent / 100);
      }
      corpus = (corpus + currentMonthly) * (1 + r);
      invested += currentMonthly;

      if (month % 12 === 0) {
        yearlyBreakdown.push({
          year: month / 12,
          invested: Math.round(invested),
          value: Math.round(corpus),
        });
      }
    }
    futureValue = corpus;
    totalInvested = invested;
  }

  return {
    futureValue: Math.round(futureValue),
    totalInvested: Math.round(totalInvested),
    totalReturns: Math.round(futureValue - totalInvested),
    yearlyBreakdown,
  };
};

/**
 * Calculate lumpsum investment future value
 */
const calculateLumpsum = (principal, annualRate, tenureYears, inflationRate = 0) => {
  const yearlyBreakdown = [];
  for (let y = 1; y <= tenureYears; y++) {
    const value = principal * Math.pow(1 + annualRate / 100, y);
    yearlyBreakdown.push({ year: y, invested: principal, value: Math.round(value) });
  }
  const futureValue = principal * Math.pow(1 + annualRate / 100, tenureYears);
  const inflationAdjustedValue = inflationRate > 0
    ? futureValue / Math.pow(1 + inflationRate / 100, tenureYears)
    : futureValue;

  return {
    futureValue: Math.round(futureValue),
    totalInvested: principal,
    totalReturns: Math.round(futureValue - principal),
    inflationAdjustedValue: Math.round(inflationAdjustedValue),
    yearlyBreakdown,
  };
};

/**
 * Calculate monthly SIP required to reach a goal
 */
const calculateSIPForGoal = (targetAmount, currentSavings, annualRate, tenureYears) => {
  const remaining = targetAmount - currentSavings;
  if (remaining <= 0) return 0;
  const n = tenureYears * 12;
  const r = annualRate / 12 / 100;
  const sip = (remaining * r) / ((Math.pow(1 + r, n) - 1) * (1 + r));
  return Math.round(sip);
};

/**
 * Calculate financial health score (0–100)
 * Based on savings rate, emergency fund, debt ratio, and investment ratio
 */
const calculateHealthScore = (profile) => {
  const {
    monthlyIncome = 0,
    monthlyExpenses = 0,
    totalEMI = 0,
    monthlySavings = 0,
    monthlyInvestments = 0,
    emergencyFund = 0,
    emergencyFundTarget = 0,
  } = profile;

  if (monthlyIncome === 0) return { score: 0, breakdown: {}, grade: 'N/A' };

  const scores = {};

  // 1. Savings Rate (25 pts): target ≥ 20% of income
  const savingsRate = monthlySavings / monthlyIncome;
  scores.savings = Math.min(25, Math.round((savingsRate / 0.2) * 25));

  // 2. Debt-to-Income Ratio (25 pts): EMI ≤ 35% of income is healthy
  const dti = totalEMI / monthlyIncome;
  scores.debtRatio = dti > 0.6 ? 0 : Math.round((1 - dti / 0.6) * 25);

  // 3. Emergency Fund (25 pts): target = 6 months of expenses
  const sixMonthExpenses = (monthlyExpenses + totalEMI) * 6;
  const efTarget = emergencyFundTarget > 0 ? emergencyFundTarget : sixMonthExpenses;
  scores.emergencyFund = efTarget > 0 ? Math.min(25, Math.round((emergencyFund / efTarget) * 25)) : 0;

  // 4. Investment Rate (25 pts): target ≥ 10% of income
  const investRate = monthlyInvestments / monthlyIncome;
  scores.investment = Math.min(25, Math.round((investRate / 0.1) * 25));

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  let grade = 'F';
  if (total >= 90) grade = 'A+';
  else if (total >= 80) grade = 'A';
  else if (total >= 70) grade = 'B';
  else if (total >= 60) grade = 'C';
  else if (total >= 50) grade = 'D';

  return { score: total, breakdown: scores, grade };
};

/**
 * Dashboard summary — aggregates profile + goals + loans
 */
const buildDashboardSummary = (profile, goals, loans) => {
  const activeLoans = loans.filter((l) => l.isActive);
  const totalEMI = activeLoans.reduce((sum, l) => sum + (l.emiAmount || 0), 0);
  const totalDebt = activeLoans.reduce((sum, l) => sum + (l.outstandingAmount ?? l.principalAmount), 0);

  const completedGoals = goals.filter((g) => g.isCompleted).length;
  const totalGoalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalGoalSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);
  const goalProgress = totalGoalTarget > 0 ? (totalGoalSaved / totalGoalTarget) * 100 : 0;

  const healthScore = calculateHealthScore({ ...profile, totalEMI });

  return {
    totalIncome: profile.monthlyIncome + (profile.otherIncome || 0),
    totalExpenses: profile.monthlyExpenses,
    totalEMI: Math.round(totalEMI),
    totalDebt: Math.round(totalDebt),
    monthlySavings: profile.monthlySavings,
    totalSavings: profile.totalSavings,
    monthlyInvestments: profile.monthlyInvestments,
    totalInvestments: profile.totalInvestments,
    emergencyFund: profile.emergencyFund,
    healthScore,
    goals: {
      total: goals.length,
      completed: completedGoals,
      progress: Math.round(goalProgress),
    },
    loans: {
      total: activeLoans.length,
      totalEMI: Math.round(totalEMI),
      totalDebt: Math.round(totalDebt),
    },
  };
};
// ============ INVESTMENT SUGGESTIONS & RISK ANALYSIS ============
// (Add at the very end of file)

// Real market data for suggestions
const MARKET_DATA = {
  'RELIANCE': { name: 'Reliance Industries', value: 2456.30, turnover: 125.45, growth: 2.34, risk: 7, sector: 'Energy' },
  'TCS': { name: 'Tata Consultancy Services', value: 3567.80, turnover: 89.23, growth: 1.56, risk: 3, sector: 'IT' },
  'INFY': { name: 'Infosys', value: 1456.75, turnover: 67.89, growth: 3.21, risk: 4, sector: 'IT' },
  'HDFC': { name: 'HDFC Bank', value: 1678.90, turnover: 234.67, growth: -0.78, risk: 5, sector: 'Banking' },
  'WIPRO': { name: 'Wipro', value: 512.30, turnover: 45.67, growth: 5.67, risk: 8, sector: 'IT' },
  'HINDUNILVR': { name: 'Hindustan Unilever', value: 2678.90, turnover: 156.78, growth: 1.23, risk: 2, sector: 'FMCG' }
};

// Get investment suggestions based on risk appetite
const getInvestmentSuggestions = (riskAppetite) => {
  let stocks = Object.keys(MARKET_DATA);
  
  if (riskAppetite === 'Low') {
    stocks = stocks.filter(s => MARKET_DATA[s].risk <= 4);
  } else if (riskAppetite === 'Medium') {
    stocks = stocks.filter(s => MARKET_DATA[s].risk >= 3 && MARKET_DATA[s].risk <= 7);
  } else if (riskAppetite === 'High') {
    stocks = stocks.filter(s => MARKET_DATA[s].risk >= 6);
  }
  
  return stocks.map(symbol => ({
    symbol,
    ...MARKET_DATA[symbol],
    recommendation: MARKET_DATA[symbol].growth > 3 ? 'Buy' : (MARKET_DATA[symbol].growth < -1 ? 'Sell' : 'Hold')
  }));
};

// Get similar funds based on sector
const getSimilarFunds = (selectedSymbol) => {
  const selected = MARKET_DATA[selectedSymbol];
  if (!selected) return [];
  
  return Object.keys(MARKET_DATA)
    .filter(s => s !== selectedSymbol && MARKET_DATA[s].sector === selected.sector)
    .map(s => ({ symbol: s, ...MARKET_DATA[s] }));
};

// Risk vs Return analysis
const getRiskReturnAnalysis = (symbol, userRiskAppetite) => {
  const stock = MARKET_DATA[symbol];
  if (!stock) return null;
  
  let verdict = '';
  if (userRiskAppetite === 'Low' && stock.risk <= 4) verdict = '✅ Suitable for your low-risk profile';
  else if (userRiskAppetite === 'Medium' && stock.risk >= 3 && stock.risk <= 7) verdict = '✅ Balanced choice for medium risk';
  else if (userRiskAppetite === 'High' && stock.risk >= 6) verdict = '✅ High risk - High potential match';
  else verdict = '⚠️ This stock may not match your risk appetite';
  
  return {
    stockName: stock.name,
    riskScore: stock.risk,
    riskLevel: stock.risk <= 3 ? 'Low' : (stock.risk <= 6 ? 'Medium' : 'High'),
    expectedReturn: stock.growth,
    currentValue: stock.value,
    turnover: stock.turnover,
    recommendation: verdict,
    suggestion: stock.risk <= 3 ? 'Good for capital preservation' :
                (stock.risk <= 6 ? 'Suitable for balanced growth' : 'Only if you can handle volatility')
  };
};

// Track goal progress with investment mix suggestion
const trackGoalProgress = (goal) => {
  const today = new Date();
  const targetDate = new Date(goal.targetDate);
  const monthsLeft = Math.max(0, (targetDate - today) / (1000 * 60 * 60 * 24 * 30.44));
  
  const requiredMonthly = calculateSIPForGoal(goal.targetAmount, goal.savedAmount, 12, monthsLeft / 12);
  const progressPercent = (goal.savedAmount / goal.targetAmount) * 100;
  const isOnTrack = goal.monthlySIPRequired >= requiredMonthly;
  
  // Investment mix based on risk profile
  let mix = { equity: 40, debt: 40, gold: 10, cash: 10 };
  if (goal.priority === 'high') mix = { equity: 60, debt: 25, gold: 10, cash: 5 };
  if (goal.priority === 'low') mix = { equity: 30, debt: 50, gold: 10, cash: 10 };
  
  return {
    progressPercent: progressPercent.toFixed(2),
    monthsLeft: Math.floor(monthsLeft),
    requiredMonthlyInvestment: requiredMonthly,
    isOnTrack,
    monthlyShortfall: isOnTrack ? 0 : requiredMonthly - (goal.monthlySIPRequired || 0),
    investmentMix: mix,
    status: progressPercent >= 100 ? 'Completed' : (isOnTrack ? 'On Track' : 'Behind Schedule')
  };
};

module.exports = {
  calculateEMI,
  generateAmortizationSchedule,
  calculateSIP,
  calculateLumpsum,
  calculateSIPForGoal,
  calculateHealthScore,
  buildDashboardSummary,
  getInvestmentSuggestions,
  getSimilarFunds,
  getRiskReturnAnalysis,
  trackGoalProgress
};