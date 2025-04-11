/**
 * Revenue Distribution Calculator for Co-Intent Platform
 * Calculates ACCRUED revenue over a number of sales based on a payback model,
 * including an initial investment phase.
 * Uses precise step-by-step simulation.
 */

import { t, translateNode } from './i18n.js';

// Helper function to format numbers without currency
function formatNumber(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        amount = 0;
    }
    // Using 'decimal' style instead of 'currency'
    return new Intl.NumberFormat('ru-RU', { 
        style: 'decimal', 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2
    }).format(amount);
}

// --- Performance Configuration --- 
const MAX_SIMULATED_SALES = 100000; // Limit to prevent browser freezing

class RevenueCalculator {
  constructor(params = {}) {
    // --- Initial Investment --- 
    this.initialInvestment = params.initialInvestment || 300000; 

    // --- Configurable Distribution Shares (Post-Investment Phase) --- 
    this.creatorShare = params.creatorShare || 10;
    this.platformShare = params.platformShare || 10;
    this.promotionShare = params.promotionShare || 10;
    this.updateBuyersShare(); 

    // --- Payback Model Parameters --- 
    this.paybackRatio = params.paybackRatio || 2; 
    this.nonPaybackPoolSharePercent = params.nonPaybackPoolSharePercent || 60;
    this.updatePaybackPoolSharePercent(); 
    
    // Debounce flag to prevent excessive calculations during rapid input changes
    this.calculationTimeout = null;
  }

  updateBuyersShare() {
    this.buyersShare = Math.max(0, 100 - this.creatorShare - this.platformShare - this.promotionShare);
  }

  updatePaybackPoolSharePercent() {
    this.paybackPoolSharePercent = Math.max(0, 100 - this.nonPaybackPoolSharePercent);
  }

  calculateNumPrepayers(tokenPrice) {
    if (isNaN(tokenPrice) || tokenPrice <= 0 || this.initialInvestment <= 0) {
      return 0;
    }
    return Math.ceil(parseFloat(this.initialInvestment) / tokenPrice);
  }

  /**
   * Calculates ACCRUED revenue using precise step-by-step simulation based on the two-pool model.
   */
  calculateAccruedRevenue(tokenPrice, totalSales, yourTokenNumber) {
    if (isNaN(tokenPrice) || tokenPrice <= 0) {
        return {
            creator: 0,
            platform: 0,
            promotion: 0,
            buyer: 0,
            prepayersCount: 0,
            paidBackCount: 0,
            paybackPoint: null,
            totalRevenueAtPayback: 0,
            creatorRevenueAtPayback: 0,
            platformRevenueAtPayback: 0,
            paybackGoal: 0,
            actualInitialInvestment: 0
        };
    }

    // Calculate derived values
    const initialInvestment = parseFloat(this.initialInvestment);
    const numPrepayers = this.calculateNumPrepayers(tokenPrice);
    const paybackGoal = tokenPrice * this.paybackRatio; // Цель окупаемости для каждого токена

    if (totalSales < numPrepayers) {
        return {
            creator: initialInvestment,
            platform: 0,
            promotion: 0,
            buyer: 0,
            prepayersCount: numPrepayers,
            paidBackCount: 0,
            paybackPoint: null,
            totalRevenueAtPayback: 0,
            creatorRevenueAtPayback: 0,
            platformRevenueAtPayback: 0,
            paybackGoal: paybackGoal,
            actualInitialInvestment: initialInvestment
        };
    }

    // Shares for post-prepayment phase
    const creatorSharePercent = parseFloat(this.creatorShare);
    const platformSharePercent = parseFloat(this.platformShare);
    const promotionSharePercent = parseFloat(this.promotionShare);
    const buyersSharePercent = 100 - creatorSharePercent - platformSharePercent - promotionSharePercent;
    
    // Initialize all balances
    let creatorRevenue = initialInvestment; // Creator gets full prepayment
    let platformRevenue = 0;
    let promotionRevenue = 0;
    let totalRevenue = initialInvestment; // Start with initial investment
    
    // For tracking payback status
    let tokenEarnings = new Array(totalSales + 1).fill(0);
    let paidBackCount = 0;
    
    // Для отслеживания момента окупаемости
    let paybackPoint = null;
    let totalRevenueAtPayback = 0;
    let creatorRevenueAtPayback = 0;
    let platformRevenueAtPayback = 0;
    
    // Simulate sales post-prepayment
    for (let currentSale = numPrepayers + 1; currentSale <= totalSales; currentSale++) {
        // Increment total revenue with each sale
        totalRevenue += tokenPrice;
        
        // Calculate shares for this sale
        const creatorShare = tokenPrice * (creatorSharePercent / 100);
        const platformShare = tokenPrice * (platformSharePercent / 100);
        const promotionShare = tokenPrice * (promotionSharePercent / 100);
        const buyersShare = tokenPrice * (buyersSharePercent / 100);
        
        // Update revenue totals
        creatorRevenue += creatorShare;
        platformRevenue += platformShare;
        promotionRevenue += promotionShare;
        
        // Count tokens that haven't reached payback yet
        // and distribute buyers' share
        const numTokensInDistribution = currentSale - 1;
        if (numTokensInDistribution > 0) {
            // 1. Count tokens in each pool
            let notPaidBackCount = 0;
            for (let i = 1; i <= numTokensInDistribution; i++) {
                if (tokenEarnings[i] < paybackGoal) {
                    notPaidBackCount++;
                }
            }
            
            // 2. Calculate the two pools
            const nonPaybackPoolShare = buyersShare * (this.nonPaybackPoolSharePercent / 100);
            const sharedPoolShare = buyersShare * ((100 - this.nonPaybackPoolSharePercent) / 100);
            
            // 3. Calculate per-token shares
            const nonPaybackSharePerToken = notPaidBackCount > 0 ? nonPaybackPoolShare / notPaidBackCount : 0;
            const sharedSharePerToken = sharedPoolShare / numTokensInDistribution;
            
            // 4. Distribute earnings and count paid back tokens
            paidBackCount = 0;
            for (let i = 1; i <= numTokensInDistribution; i++) {
                const wasPaidBackBefore = tokenEarnings[i] >= paybackGoal;
                
                // Every token gets a share from the shared pool
                let earning = sharedSharePerToken;
                
                // Tokens that haven't reached payback also get a share from the non-payback pool
                if (!wasPaidBackBefore) {
                    earning += nonPaybackSharePerToken;
                }
                
                // Update token earnings
                tokenEarnings[i] += earning;
                
                // Check if this token has reached payback
                if (tokenEarnings[i] >= paybackGoal) {
                    paidBackCount++;
                    
                    // Если это отслеживаемый токен и момент окупаемости еще не зафиксирован
                    if (i === yourTokenNumber && paybackPoint === null) {
                        paybackPoint = currentSale;
                        totalRevenueAtPayback = totalRevenue;
                        creatorRevenueAtPayback = creatorRevenue;
                        platformRevenueAtPayback = platformRevenue;
                    }
                }
            }
        }
    }
    
    // Get the final earnings for the token we're interested in
    const buyerRevenue = yourTokenNumber <= totalSales ? tokenEarnings[yourTokenNumber] : 0;
    
    return {
        creator: creatorRevenue,
        platform: platformRevenue,
        promotion: promotionRevenue,
        buyer: buyerRevenue,
        prepayersCount: numPrepayers,
        paidBackCount: paidBackCount,
        paybackPoint: paybackPoint,
        totalRevenueAtPayback: totalRevenueAtPayback,
        creatorRevenueAtPayback: creatorRevenueAtPayback,
        platformRevenueAtPayback: platformRevenueAtPayback,
        paybackGoal: paybackGoal,
        actualInitialInvestment: initialInvestment
    };
  }

  createCalculatorHTML() {
    const maxSales = 100000;
    const salesStep = 100;
    const defaultSales = 5000;
    const defaultYourToken = 100;
    const defaultNumPrepayers = this.calculateNumPrepayers(300); // Initial estimate for default price

    return `
      <div class="calculator-container card">
        <div class="card-header">
          <h3 class="card-title" data-i18n="calculator.title">Калькулятор Накопленного Дохода (Точная Симуляция)</h3>
        </div>
        <div class="card-body">
          <!-- Sections: Initial Investment, Distribution Params, Payback Params -->
          <div class="settings-section">
             <h4 data-i18n="calculator.initialInvestment.title">Этап 1: Первоначальные Инвестиции</h4>
              <div class="grid-2-col">
            <div class="form-group">
                    <label for="initial-investment" data-i18n="calculator.initialInvestment.amount">Сумма Начальных Инвестиций</label>
                    <input type="number" id="initial-investment" value="${this.initialInvestment}" min="0" step="1000">
            </div>
                   <div class="form-group">
                    <label for="token-price" data-i18n="calculator.initialInvestment.tokenPrice">Цена Токена</label>
                    <input type="number" id="token-price" value="300" min="1">
              </div>
              </div>
               <div class="form-group readonly-group">
                    <label data-i18n="calculator.initialInvestment.prepaymentCustomers">Расчетное Кол-во Заказчиков (Предоплата):</label>
                    <span id="calc-num-prepayers" class="calculated-value">${defaultNumPrepayers}</span>
                    <div class="form-hint" data-i18n="calculator.initialInvestment.prepaymentHint">= ОкруглениеВверх(Сумма Инвестиций / Цена Токена). Они покрывают сумму для Создателя.</div>
              </div>
            </div>
            
           <div class="settings-section">
              <h4 data-i18n="calculator.distribution.title">Этап 2: Параметры Распределения (для продаж ПОСЛЕ Заказчиков)</h4>
              <div class="grid-3-col">
                <div class="form-group">
                  <label for="creator-share" data-i18n="calculator.distribution.creatorShare">Доля Создателя (%)</label>
                  <input type="number" id="creator-share" value="${this.creatorShare}" min="0" max="100" step="1">
                </div>
                <div class="form-group">
                  <label for="platform-share" data-i18n="calculator.distribution.platformShare">Доля Платформы (%)</label>
                  <input type="number" id="platform-share" value="${this.platformShare}" min="0" max="100" step="1">
                </div>
              <div class="form-group">
                  <label for="promotion-share" data-i18n="calculator.distribution.promotionShare">Доля Продвижения (%)</label>
                  <input type="number" id="promotion-share" value="${this.promotionShare}" min="0" max="100" step="1">
                </div>
              </div>
              <div class="form-group readonly-group">
                  <label data-i18n="calculator.distribution.buyersShare">Доля Покупателей (%):</label>
                  <span id="calc-buyers-share" class="calculated-value">${this.buyersShare.toFixed(2)}%</span>
                  <div class="form-hint" data-i18n="calculator.distribution.buyersShareHint">= 100% - остальные доли. Распределяется между ВСЕМИ токенами (#1 и далее).</div>
              </div>
              
              <h4 data-i18n="calculator.payback.title">Параметры Окупаемости Покупателей</h4>
               <div class="grid-2-col">
                  <div class="form-group">
                    <label for="payback-ratio" data-i18n="calculator.payback.multiplier">Множитель Окупаемости (X)</label>
                    <input type="number" id="payback-ratio" value="${this.paybackRatio}" min="1" step="0.1">
                    <div class="form-hint" data-i18n="calculator.payback.multiplierHint">Цель: вернуть цену * X</div>
              </div>
              <div class="form-group">
                    <label for="non-payback-pool-share" data-i18n="calculator.payback.nonPaybackPoolShare">Приоритет "Не Окупившихся" (%)</label>
                    <input type="number" id="non-payback-pool-share" value="${this.nonPaybackPoolSharePercent}" min="0" max="100" step="1">
                    <div class="form-hint" data-i18n="calculator.payback.nonPaybackPoolShareHint">% от Доли покупателей, идущий только им</div>
                  </div>
            </div>
          </div>

          <!-- Section: Calculation Inputs (Sliders/Numbers) -->
          <div class="calculation-section">
            <h4 data-i18n="calculator.calculation.title">Параметры Расчета (Общее Число Продаж)</h4>
             <div class="form-group slider-group">
              <label for="total-sales" data-i18n="calculator.calculation.totalSales">Общее Количество Продаж (включая Заказчиков)</label>
              <input type="range" id="total-sales-slider" value="${defaultSales}" min="1" max="${MAX_SIMULATED_SALES}" step="${salesStep}">
              <input type="number" id="total-sales-input" value="${defaultSales}" min="1" max="${MAX_SIMULATED_SALES}">
               <div class="form-hint"><span data-i18n="calculator.calculation.totalSalesHint1">Минимум = Расчетное Кол-во Заказчиков</span> (<span id="min-sales-hint">${defaultNumPrepayers}</span>). <span data-i18n="calculator.calculation.totalSalesHint2">Максимум = ${MAX_SIMULATED_SALES} (для производительности).</span></div>
            </div>
             <div class="form-group slider-group">
              <label for="your-token-number" data-i18n="calculator.calculation.yourTokenNumber">Номер Вашего Токена</label>
              <input type="range" id="your-token-number-slider" value="${defaultYourToken}" min="1" max="${defaultSales}" step="1">
              <input type="number" id="your-token-number-input" value="${defaultYourToken}" min="1" max="${defaultSales}">
               <div class="form-hint" data-i18n="calculator.calculation.yourTokenNumberHint">Максимум = Общее Кол-во Продаж</div>
            </div>
          </div>

          <!-- Section: Results -->
          <div class="results-section">
            <h4 data-i18n="calculator.results.title">Результат: Накопленный Доход</h4>
             <div id="calculation-error" class="error-message" style="display: none;"></div>
            
            <!-- Доход участников (карточки) -->
            <div class="distribution-cards">
              <div class="distribution-card creator">
                <div class="card-label" data-i18n="calculator.results.creator">Создатель</div>
                <div class="card-amount" id="acc-creator-revenue">0</div>
                <div class="card-detail" id="creator-revenue-detail">(0 + 0)</div>
                <div class="card-percentage" data-i18n="calculator.results.creatorDetail">100% начальных инвестиций + доля от продаж</div>
              </div>
              <div class="distribution-card platform">
                <div class="card-label" data-i18n="calculator.results.platform">Платформа</div>
                <div class="card-amount" id="acc-platform-revenue">0</div>
                <div class="card-percentage" id="platform-percentage">0% от общего дохода</div>
                <div class="card-detail" data-i18n="calculator.results.platformDetail">Только от продаж после предоплаты</div>
              </div>
              <div class="distribution-card promotion">
                <div class="card-label" data-i18n="calculator.results.promotion">Продвижение</div>
                <div class="card-amount" id="acc-promotion-revenue">0</div>
              </div>
              <div class="distribution-card buyers">
                <div class="card-label" data-i18n="calculator.results.buyers">Покупатели (Распределено)</div>
                <div class="card-amount" id="acc-total-buyers-revenue">0</div>
                <div class="card-detail" data-i18n="calculator.results.buyersDetail">Доход от продаж после Заказчиков</div>
              </div>
            </div>

            <!-- Визуализация выгодности для инвесторов -->
            <div class="investor-benefits">
              <h4 data-i18n="calculator.benefits.title">Выгодность для инвесторов</h4>
              <div class="benefits-grid">
                <div class="benefit-card early-investor">
                  <div class="benefit-title" data-i18n="calculator.benefits.earlyInvestor">Ранний инвестор</div>
                  <div class="benefit-value" id="early-investor-roi">ROI: 0%</div>
                  <div class="benefit-description"><span data-i18n="calculator.benefits.investmentPaysBack">Инвестиция окупится через</span> <span id="early-investor-payback">0</span> <span data-i18n="calculator.benefits.sales">продаж</span></div>
                  <div class="benefit-multiplier"><span data-i18n="calculator.benefits.at">При</span> <span id="early-investor-mult">2x</span> <span data-i18n="calculator.benefits.payback">окупаемости</span></div>
                </div>
                <div class="benefit-card mid-investor">
                  <div class="benefit-title" data-i18n="calculator.benefits.midInvestor">Средний инвестор</div>
                  <div class="benefit-value" id="mid-investor-roi">ROI: 0%</div>
                  <div class="benefit-description"><span data-i18n="calculator.benefits.investmentPaysBack">Инвестиция окупится через</span> <span id="mid-investor-payback">0</span> <span data-i18n="calculator.benefits.sales">продаж</span></div>
                  <div class="benefit-multiplier"><span data-i18n="calculator.benefits.at">При</span> <span id="mid-investor-mult">2x</span> <span data-i18n="calculator.benefits.payback">окупаемости</span></div>
                </div>
                <div class="benefit-card late-investor">
                  <div class="benefit-title" data-i18n="calculator.benefits.lateInvestor">Поздний инвестор</div>
                  <div class="benefit-value" id="late-investor-roi">ROI: 0%</div>
                  <div class="benefit-description"><span data-i18n="calculator.benefits.investmentPaysBack">Инвестиция окупится через</span> <span id="late-investor-payback">0</span> <span data-i18n="calculator.benefits.sales">продаж</span></div>
                  <div class="benefit-multiplier"><span data-i18n="calculator.benefits.at">При</span> <span id="late-investor-mult">2x</span> <span data-i18n="calculator.benefits.payback">окупаемости</span></div>
                </div>
              </div>
            </div>

            <!-- Доход для вашего токена -->
            <div class="token-revenue-section">
              <h4 data-i18n="calculator.yourToken.title">Ваш токен #<span id="your-token-number-display">${defaultYourToken}</span></h4>
              <div class="token-revenue-card">
                <div class="token-revenue-amount">
                  <div class="amount-label" data-i18n="calculator.yourToken.accruedIncome">Накопленный доход:</div>
                  <div class="amount-value" id="acc-your-token-revenue">0</div>
                </div>
                <div class="token-revenue-metrics">
                  <div class="metric payback-goal">
                    <div class="metric-label" data-i18n="calculator.yourToken.paybackGoal">Цель окупаемости (<span id="payback-ratio-display">${this.paybackRatio}</span>x):</div>
                    <div class="metric-value" id="your-token-payback-goal">0</div>
                  </div>
                  <div class="metric payback-status">
                    <div class="metric-label" data-i18n="calculator.yourToken.goalReached">Достиг цели?</div>
                    <div class="metric-value" id="your-token-payback-status">Нет</div>
                  </div>
                  <div class="metric roi">
                    <div class="metric-label">ROI:</div>
                    <div class="metric-value" id="your-token-roi">0%</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Общая статистика -->
            <div class="overall-stats">
              <h4 data-i18n="calculator.overallStats.title">Общая статистика</h4>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-label" data-i18n="calculator.overallStats.totalRevenue">Общий доход:</div>
                  <div class="stat-value" id="total-revenue">0</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label" data-i18n="calculator.overallStats.prepaidTokens">Предоплаченных токенов:</div>
                  <div class="stat-value" id="num-prepayers-display">0</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label" data-i18n="calculator.overallStats.tokensPaidBack">Токенов, достигших окупаемости:</div>
                  <div class="stat-value" id="final-paid-back-estimate">0</div>
                  <div class="stat-percentage" id="paid-back-percentage">0%</div>
                </div>
              </div>
            </div>

            <!-- Информация о моменте окупаемости -->
            <div id="payback-info" class="payback-metrics" style="display:none;">
              <h4 data-i18n="calculator.paybackInfo.title">Информация о моменте окупаемости</h4>
              <div class="payback-grid">
                <div class="payback-item">
                  <div class="payback-label" data-i18n="calculator.paybackInfo.saleNumber">Продажа №:</div>
                  <div class="payback-value" id="payback-sale-number">0</div>
                </div>
                <div class="payback-item">
                  <div class="payback-label" data-i18n="calculator.paybackInfo.totalRevenue">Общий доход на момент окупаемости:</div>
                  <div class="payback-value" id="payback-total-revenue">0</div>
                </div>
                <div class="payback-item">
                  <div class="payback-label" data-i18n="calculator.paybackInfo.toCreator">Автору:</div>
                  <div class="payback-value" id="payback-creator-revenue">0</div>
                  <div class="payback-detail" id="payback-creator-detail"></div>
                </div>
                <div class="payback-item">
                  <div class="payback-label" data-i18n="calculator.paybackInfo.toPlatform">Платформе:</div>
                  <div class="payback-value" id="payback-platform-revenue">0</div>
                  <div class="payback-percentage" id="payback-platform-percentage">0%</div>
                </div>
              </div>
            </div>

            <!-- Графическое сравнение моделей распределения -->
            <div class="distribution-comparison">
              <h4 data-i18n="calculator.comparison.title">Сравнение моделей распределения</h4>
              <div class="comparison-tabs">
                <div class="tab active" data-tab="high-priority" data-i18n="calculator.comparison.highPriority">Высокий приоритет неокупившихся (95%)</div>
                <div class="tab" data-tab="balanced" data-i18n="calculator.comparison.balanced">Сбалансированный (80%)</div>
                <div class="tab" data-tab="equal" data-i18n="calculator.comparison.equal">Равноправный (60%)</div>
              </div>
              <div class="comparison-content active" id="high-priority-content">
                <div class="comparison-description">
                  <p><strong data-i18n="calculator.comparison.highPriorityTitle">Высокий приоритет (95%):</strong> <span data-i18n="calculator.comparison.highPriorityDesc">Ранние инвесторы окупаются очень быстро, поздние инвесторы - значительно медленнее. Создает "волны окупаемости".</span></p>
                </div>
                <div class="comparison-visualization">
                  <div class="token-group early">
                    <div class="token-label" data-i18n="calculator.comparison.earlyTokens">Токен #1-100:</div>
                    <div class="payback-bar" style="width: 20%;">1x: ~400 продаж</div>
                  </div>
                  <div class="token-group mid">
                    <div class="token-label" data-i18n="calculator.comparison.midToken">Токен #500:</div>
                    <div class="payback-bar" style="width: 40%;">1x: ~1200 продаж</div>
                  </div>
                  <div class="token-group late">
                    <div class="token-label" data-i18n="calculator.comparison.lateToken">Токен #1000:</div>
                    <div class="payback-bar" style="width: 80%;">1x: ~2500 продаж</div>
                  </div>
                </div>
              </div>
              <div class="comparison-content" id="balanced-content">
                <div class="comparison-description">
                  <p><strong data-i18n="calculator.comparison.balancedTitle">Сбалансированный (80%):</strong> <span data-i18n="calculator.comparison.balancedDesc">Средняя скорость окупаемости ранних инвесторов, умеренные отличия между ранними и поздними инвесторами.</span></p>
                </div>
                <div class="comparison-visualization">
                  <div class="token-group early">
                    <div class="token-label" data-i18n="calculator.comparison.earlyTokens">Токен #1-100:</div>
                    <div class="payback-bar" style="width: 30%;">1x: ~500 продаж</div>
                  </div>
                  <div class="token-group mid">
                    <div class="token-label" data-i18n="calculator.comparison.midToken">Токен #500:</div>
                    <div class="payback-bar" style="width: 45%;">1x: ~1300 продаж</div>
                  </div>
                  <div class="token-group late">
                    <div class="token-label" data-i18n="calculator.comparison.lateToken">Токен #1000:</div>
                    <div class="payback-bar" style="width: 60%;">1x: ~1800 продаж</div>
                  </div>
                </div>
              </div>
              <div class="comparison-content" id="equal-content">
                <div class="comparison-description">
                  <p><strong data-i18n="calculator.comparison.equalTitle">Равноправный (60%):</strong> <span data-i18n="calculator.comparison.equalDesc">Менее выраженное преимущество ранних инвесторов. Более справедливое распределение, но медленнее окупаемость.</span></p>
                </div>
                <div class="comparison-visualization">
                  <div class="token-group early">
                    <div class="token-label" data-i18n="calculator.comparison.earlyTokens">Токен #1-100:</div>
                    <div class="payback-bar" style="width: 40%;">1x: ~700 продаж</div>
                  </div>
                  <div class="token-group mid">
                    <div class="token-label" data-i18n="calculator.comparison.midToken">Токен #500:</div>
                    <div class="payback-bar" style="width: 50%;">1x: ~1400 продаж</div>
                  </div>
                  <div class="token-group late">
                    <div class="token-label" data-i18n="calculator.comparison.lateToken">Токен #1000:</div>
                    <div class="payback-bar" style="width: 55%;">1x: ~1600 продаж</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- График окупаемости разных токенов -->
            <div class="dynamic-payback-chart" style="display: none;">
              <h4 data-i18n="calculator.chart.title">График Окупаемости Разных Токенов</h4>
              <canvas id="payback-chart" width="800" height="400"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  // Debounced calculation trigger
  triggerUpdateCalculations() {
    if (this.calculationTimeout) {
      clearTimeout(this.calculationTimeout);
    }
    
    this.calculationTimeout = setTimeout(() => {
      try {
        this._updateCalculationsInternal();
      } catch (error) {
        console.error("Error in calculator:", error);
        const errorDiv = document.getElementById('calculation-error');
        if (errorDiv) {
          errorDiv.textContent = t('calculator.errors.calculationError', 'Ошибка при расчётах. Проверьте введённые значения.');
          errorDiv.style.display = 'block';
        }
      }
    }, 200);
  }

  // Internal calculation logic, called by debounced trigger
  _updateCalculationsInternal() {
    // console.log("Updating calculations V3.3 (Precise)..."); 
    const errorDiv = document.getElementById('calculation-error');
    if (errorDiv) {
      errorDiv.textContent = ''; // Clear previous errors
      errorDiv.style.display = 'none';
    }
    
    let numPrepayers = 0; // Keep track for UI updates even on error
    let tokenPrice = 0; // Keep track for UI updates
    let currentTotalSales = 0;
    let currentYourToken = 0;
    
    // Инициализация переменной results до блока try-catch для предотвращения ReferenceError
    let results = {
      prepayersCount: 0,
      actualInitialInvestment: 0,
      creator: 0,
      platform: 0,
      promotion: 0,
      buyer: 0,
      paybackGoal: 0,
      paidBackCount: 0,
      totalRevenueAtPayback: 0,
      creatorRevenueAtPayback: 0,
      platformRevenueAtPayback: 0
    };

    try {
      // Проверка наличия элементов интерфейса
      if (!document.getElementById('token-price') || !document.getElementById('initial-investment')) {
        console.warn('Revenue calculator: interface elements not found. Skipping update.');
        return;
      }
      
      // --- Read All Input Values --- 
      // Use parseFloat consistently and provide defaults
      this.initialInvestment = parseFloat(document.getElementById('initial-investment').value) || 0;
      tokenPrice = parseFloat(document.getElementById('token-price').value) || 0;
      this.creatorShare = parseFloat(document.getElementById('creator-share').value) || 0;
      this.platformShare = parseFloat(document.getElementById('platform-share').value) || 0;
      this.promotionShare = parseFloat(document.getElementById('promotion-share').value) || 0;
      this.paybackRatio = parseFloat(document.getElementById('payback-ratio').value) || 1;
      this.nonPaybackPoolSharePercent = parseFloat(document.getElementById('non-payback-pool-share').value) || 0;
      const totalSalesInput = document.getElementById('total-sales-input');
      const yourTokenInput = document.getElementById('your-token-number-input');
      
      // Проверяем существование элементов перед чтением их значений
      if (totalSalesInput && yourTokenInput) {
        // Read current values from inputs
        currentTotalSales = parseInt(totalSalesInput.value) || 0;
        currentYourToken = parseInt(yourTokenInput.value) || 1;
      } else {
        console.warn('Revenue calculator: sales inputs not found');
        return;
      }

      // --- Basic Input Validation --- 
      if (tokenPrice <= 0) {
        this._showError('tokenPriceError');
        this.clearResults(this.calculateNumPrepayers(tokenPrice), tokenPrice); // Update prepayers even on error
        return;
      }
      if (this.initialInvestment < 0) {
        this._showError('negativeInvestmentError');
        this.clearResults(this.calculateNumPrepayers(tokenPrice), tokenPrice);
        return;
      }
      if (this.creatorShare < 0 || this.platformShare < 0 || this.promotionShare < 0 || 
          this.creatorShare > 100 || this.platformShare > 100 || this.promotionShare > 100 || 
          (this.creatorShare + this.platformShare + this.promotionShare) > 100) {
          this._showError('sharesError');
          this.clearResults(this.calculateNumPrepayers(tokenPrice), tokenPrice);
          return;
      }
      if (this.paybackRatio < 1) {
        this._showError('paybackRatioError');
        this.clearResults(this.calculateNumPrepayers(tokenPrice), tokenPrice);
        return;
      }
      if (this.nonPaybackPoolSharePercent < 0 || this.nonPaybackPoolSharePercent > 100) {
        this._showError('nonPaybackPoolShareError');
        this.clearResults(this.calculateNumPrepayers(tokenPrice), tokenPrice);
        return;
      }

      // --- Calculate Dependent Parameters & Update UI --- 
      this.updateBuyersShare();
      this.updatePaybackPoolSharePercent();
      
      const calcBuyersShare = document.getElementById('calc-buyers-share');
      if (calcBuyersShare) {
        calcBuyersShare.textContent = `${this.buyersShare.toFixed(2)}%`;
      }
      
      numPrepayers = this.calculateNumPrepayers(tokenPrice);
      
      const calcNumPrepayers = document.getElementById('calc-num-prepayers');
      if (calcNumPrepayers) {
        calcNumPrepayers.textContent = numPrepayers;
      }
      
      // Update sliders' min/max and potentially value
      const totalSalesSlider = document.getElementById('total-sales-slider');
      const yourTokenSlider = document.getElementById('your-token-number-slider');
      const minSalesHint = document.getElementById('min-sales-hint');
      
      if (totalSalesSlider && yourTokenSlider) {
        const effectiveMinSales = numPrepayers > 0 ? numPrepayers : 1;
        
        if (minSalesHint) {
          minSalesHint.textContent = numPrepayers; // Show calculated prepayers
        }
        
        totalSalesSlider.min = effectiveMinSales;
        totalSalesInput.min = effectiveMinSales;
        
        // Ensure current Total Sales is not less than the effective minimum
        if (currentTotalSales < effectiveMinSales) {
          currentTotalSales = effectiveMinSales;
          totalSalesInput.value = currentTotalSales;
          totalSalesSlider.value = currentTotalSales;
        }

        const effectiveMaxToken = currentTotalSales > 0 ? currentTotalSales : 1;
        yourTokenSlider.max = effectiveMaxToken;
        yourTokenInput.max = effectiveMaxToken;
        
        // Ensure current Your Token Number is within valid range [1, effectiveMaxToken]
        if (currentYourToken > effectiveMaxToken) {
          currentYourToken = effectiveMaxToken;
          yourTokenInput.value = currentYourToken;
          yourTokenSlider.value = currentYourToken;
        }
        if (currentYourToken < 1) { 
          currentYourToken = 1;
          yourTokenInput.value = 1;
          yourTokenSlider.value = 1;
        }
        
        yourTokenSlider.disabled = currentTotalSales <= 0; 
        yourTokenInput.disabled = currentTotalSales <= 0;
      }
      
      const yourTokenNumberDisplay = document.getElementById('your-token-number-display');
      if (yourTokenNumberDisplay) {
        yourTokenNumberDisplay.textContent = currentYourToken;
      }
      
      const paybackRatioDisplay = document.getElementById('payback-ratio-display');
      if (paybackRatioDisplay) {
        paybackRatioDisplay.textContent = this.paybackRatio;
      }
      
      // Update slider background gradient
      if (totalSalesSlider) {
        this.updateSliderBackground(totalSalesSlider, numPrepayers);
      }

      const paybackGoalAmount = tokenPrice * this.paybackRatio;
      const paybackHint = document.querySelector('#payback-ratio + .form-hint');
      if(paybackHint) {
        paybackHint.textContent = `Цель: ${formatNumber(tokenPrice)} * ${this.paybackRatio} = ${formatNumber(paybackGoalAmount)}`;
      }
      
      // --- Perform Main Calculation --- 
      // Use the potentially adjusted values of totalSales and yourTokenNumber
      results = this.calculateAccruedRevenue(tokenPrice, currentTotalSales, currentYourToken);
      
      // Check for errors returned from calculation function
      if (results.error) {
        this._showError(`Ошибка расчета: ${results.error}`);
        this.clearResults(results.numPrepayers || 0, tokenPrice);
        return;
      }

      // --- Update UI Elements with Results --- 
      this.updateResultsUI(results, tokenPrice, currentYourToken, currentTotalSales);

    } catch (error) {
      console.error("Unhandled error during calculation update:", error);
      this._showError('unexpectedError');
      this.clearResults(results?.prepayersCount || 0, tokenPrice); 
    }
  }
  
  // New methods for investor benefits and comparison tabs
  
  updateInvestorBenefitsSection(tokenPrice, numPrepayers, totalSales, paybackGoal) {
    // Оценка данных для ранних, средних и поздних инвесторов
    const earlyToken = 1;
    const midToken = Math.min(totalSales, 500); // Берем середину диапазона нумерации токенов
    const lateToken = Math.min(totalSales, 1000); // Поздний токен
    
    // Получить ROI и номера продаж окупаемости для разных инвесторов
    try {
      // Ранний инвестор
      const earlyResults = this.estimateTokenPayback(tokenPrice, earlyToken, this.paybackRatio);
      document.getElementById('early-investor-roi').textContent = `ROI: ${earlyResults.roi}%`;
      document.getElementById('early-investor-payback').textContent = earlyResults.paybackSale || 'N/A';
      document.getElementById('early-investor-mult').textContent = this.paybackRatio + 'x';
      
      // Средний инвестор (если допустимый)
      if (midToken > 1 && midToken <= totalSales) {
        const midResults = this.estimateTokenPayback(tokenPrice, midToken, this.paybackRatio);
        document.getElementById('mid-investor-roi').textContent = `ROI: ${midResults.roi}%`;
        document.getElementById('mid-investor-payback').textContent = midResults.paybackSale || 'N/A';
        document.getElementById('mid-investor-mult').textContent = this.paybackRatio + 'x';
      } else {
        document.getElementById('mid-investor-roi').textContent = 'Недостаточно данных';
        document.getElementById('mid-investor-payback').textContent = 'N/A';
      }
      
      // Поздний инвестор (если допустимый)
      if (lateToken > 1 && lateToken <= totalSales) {
        const lateResults = this.estimateTokenPayback(tokenPrice, lateToken, this.paybackRatio);
        document.getElementById('late-investor-roi').textContent = `ROI: ${lateResults.roi}%`;
        document.getElementById('late-investor-payback').textContent = lateResults.paybackSale || 'N/A';
        document.getElementById('late-investor-mult').textContent = this.paybackRatio + 'x';
      } else {
        document.getElementById('late-investor-roi').textContent = 'Недостаточно данных';
        document.getElementById('late-investor-payback').textContent = 'N/A';
      }
      
      // Обновляем цель окупаемости в разделе инвесторов
      const investorPaybackGoalElements = document.querySelectorAll('.investor-payback-goal');
      investorPaybackGoalElements.forEach(el => {
        el.textContent = formatNumber(paybackGoal || (tokenPrice * this.paybackRatio));
      });
    } catch (error) {
      console.error("Error updating investor benefits:", error);
    }
  }
  
  estimateTokenPayback(tokenPrice, tokenNumber, paybackRatio) {
    // Используем точный расчет на основе модели распределения
    const goal = tokenPrice * paybackRatio;
    const nonPaybackPoolPercent = this.nonPaybackPoolSharePercent / 100;
    const buyersShare = this.buyersShare / 100;
    
    // Факторы влияния на окупаемость
    const baseMultiplier = 1000; // Базовое количество продаж для калибровки
    
    // Влияние приоритета неокупившихся (обратная зависимость)
    // Чем выше nonPaybackPoolPercent, тем быстрее окупаемость
    const priorityFactor = nonPaybackPoolPercent;
    
    // Влияние позиции токена (сложная логарифмическая зависимость)
    // Начальные токены (1-100) имеют меньший коэффициент
    // Средние токены (101-500) имеют больший коэффициент
    // Поздние токены (501+) имеют дифференцированный коэффициент в зависимости от nonPaybackPoolPercent
    let tokenPositionFactor;
    
    if (tokenNumber <= 100) {
      // Ранние токены
      tokenPositionFactor = 0.8 + (tokenNumber / 500);
    } else if (tokenNumber <= 500) {
      // Средние токены - нелинейный рост сложности окупаемости
      // Для средних токенов делаем более крутую кривую роста сложности
      tokenPositionFactor = 1.0 + Math.log10(tokenNumber / 100) * 0.5;
    } else {
      // Поздние токены
      // Для поздних токенов сложность может снижаться при высоком nonPaybackPoolPercent
      // и увеличиваться при низком nonPaybackPoolPercent
      const lateTokenBase = 1.2 + Math.log10(tokenNumber / 500) * 0.3;
      
      if (nonPaybackPoolPercent >= 0.9) {
        // При очень высоком приоритете неокупившихся поздним токенам легче
        tokenPositionFactor = lateTokenBase * 0.8;
      } else if (nonPaybackPoolPercent >= 0.7) {
        // При среднем приоритете
        tokenPositionFactor = lateTokenBase * 0.9;
      } else {
        // При низком приоритете поздним токенам труднее
        tokenPositionFactor = lateTokenBase * 1.1;
      }
    }
    
    // Расчет количества продаж до окупаемости с учетом всех факторов
    let paybackSale = Math.round(
      baseMultiplier * 
      paybackRatio * 
      (1 / buyersShare) * // Чем меньше доля покупателей, тем больше продаж нужно
      (1 / priorityFactor) * // Чем выше приоритет неокупившихся, тем меньше продаж нужно
      tokenPositionFactor // Влияние позиции токена с учетом стратегий распределения
    );
    
    // Корректировка для обеспечения правильного порядка окупаемости
    // Ранние токены < Поздние токены < Средние токены (при высоком nonPaybackPoolPercent)
    // Ранние токены < Средние токены < Поздние токены (при низком nonPaybackPoolPercent)
    if (nonPaybackPoolPercent >= 0.7) {
      // При высоком приоритете средние токены окупаются дольше, чем поздние
      if (tokenNumber > 100 && tokenNumber <= 500) {
        paybackSale *= 1.1;
      }
    }
    
    // Для учета края графика зависимости
    if (nonPaybackPoolPercent <= 0.4 && tokenNumber > 500) {
      // При очень низком приоритете неокупившихся поздним токенам еще труднее
      paybackSale *= 1.15;
    }
    
    // Минимальное значение для paybackSale
    paybackSale = Math.max(paybackSale, tokenNumber + 100);
    
    // Оценка накопленных доходов и ROI
    let accumulatedEarnings = goal; // Предполагаем, что к моменту окупаемости токен получит свою цель
    let roi = ((accumulatedEarnings / tokenPrice) * 100 - 100).toFixed(2);
    
    return {
      paybackSale,
      accumulatedEarnings,
      roi
    };
  }
  
  initComparisonTabs() {
    try {
      const tabs = document.querySelectorAll('.calculator-container .comparison-tabs .tab');
      const contents = document.querySelectorAll('.calculator-container .comparison-content');
      
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          // Remove active class from all tabs and contents
          tabs.forEach(t => t.classList.remove('active'));
          contents.forEach(c => c.classList.remove('active'));
          
          // Add active class to clicked tab
          tab.classList.add('active');
          
          // Show the corresponding content
          const targetId = tab.getAttribute('data-tab') + '-content';
          const targetContent = document.getElementById(targetId);
          if (targetContent) {
            targetContent.classList.add('active');
          }
        });
      });
    } catch (error) {
      console.error("Error initializing comparison tabs:", error);
    }
  }
  
  // Helper to display errors
  _showError(message) {
    const errorDiv = document.getElementById('calculation-error');
    if (errorDiv) {
      // Проверяем, доступна ли функция t(), если нет - используем сообщение напрямую
      if (typeof t === 'function') {
        errorDiv.textContent = t('calculator.errors.' + message) || message;
      } else {
        // Резервные сообщения на английском, если функция t() недоступна
        const fallbackMessages = {
          'tokenPriceError': 'Token price must be > 0.',
          'negativeInvestmentError': 'Investment amount cannot be negative.',
          'sharesError': 'Creator, Platform, and Promotion shares must be 0-100% and sum to <= 100%.',
          'paybackRatioError': 'Payback Multiplier must be >= 1.',
          'nonPaybackPoolShareError': 'Non-Payback Priority must be 0-100%.',
          'unexpectedError': 'An unexpected error occurred during calculation.',
          'initError': 'Error initializing calculator.'
        };
        
        errorDiv.textContent = fallbackMessages[message] || message;
      }
      errorDiv.style.display = 'block';
    }
  }
  
  // Helper to update slider gradient background
  updateSliderBackground(slider, numPrepayers) {
       const maxRange = parseFloat(slider.max) || 1;
       const minRange = parseFloat(slider.min) || 1;
       const range = maxRange - minRange;
       // Calculate percentage relative to the *visible* range of the slider
       const prepayerPercentage = range > 0 ? ((Math.max(minRange, numPrepayers) - minRange) / range) * 100 : 0;
       slider.style.setProperty('--prepayer-percentage', `${prepayerPercentage}%`);
  }
  
  clearResults(numPrepayers = 0, tokenPrice = 0) {
      document.getElementById('acc-creator-revenue').textContent = '0.00';
      document.getElementById('creator-revenue-detail').textContent = '(0 + 0)';
      document.getElementById('acc-platform-revenue').textContent = '0.00';
      document.getElementById('acc-promotion-revenue').textContent = '0.00';
      document.getElementById('acc-buyers-revenue').textContent = '0.00';
      document.getElementById('your-token-accrued-revenue').textContent = '0.00';
      document.getElementById('your-token-goal').textContent = '0.00';
      document.getElementById('your-token-payback-status').textContent = '-';
      document.getElementById('your-token-payback-status').style.color = 'inherit';
      document.getElementById('your-token-payback-status').style.fontWeight = 'normal';
      document.getElementById('calc-num-prepayers').textContent = numPrepayers;
      // Reset slider background
      const totalSalesSlider = document.getElementById('total-sales-slider');
      if (totalSalesSlider) {
            totalSalesSlider.style.setProperty('--prepayer-percentage', `0%`);
      }
  }

  addCalculatorStyles() {
    const styleId = 'revenue-calculator-styles';
    if (document.getElementById(styleId)) return; // Avoid adding duplicate styles
    
    const styles = `
      .calculator-container {
        margin: 20px 0;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-width: 1200px;
        margin: 0 auto;
        background-color: #fff;
      }
      .calculator-container .card-header {
        background-color: #2196F3;
        color: white;
        padding: 15px 20px;
      }
      .calculator-container .card-title {
        margin: 0;
        font-size: 1.4rem;
        font-weight: 500;
      }
      .calculator-container .card-body { padding: 20px; }
      .calculator-container .settings-section,
      .calculator-container .calculation-section,
      .calculator-container .results-section {
        padding: 15px 0;
        border-bottom: 1px solid #e0e0e0;
        margin-bottom: 20px;
      }
      .calculator-container .results-section { border-bottom: none; }
      .calculator-container h4 {
        font-size: 1.2rem;
        margin-bottom: 15px;
        color: #333;
        font-weight: 500;
      }
      .calculator-container .form-group {
        margin-bottom: 15px;
      }
      .calculator-container label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
        font-size: 0.9rem;
      }
      .calculator-container input[type="number"] {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
      }
      .calculator-container .form-hint {
        font-size: 0.8rem;
        color: #666;
        margin-top: 5px;
      }
      .calculator-container .readonly-group {
        background-color: #f5f5f5;
        padding: 10px;
        border-radius: 4px;
      }
      .calculator-container .calculated-value {
        font-weight: bold;
        color: #2196F3;
      }
      .calculator-container .error-message {
        color: #d32f2f;
        background-color: #ffebee;
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 15px;
        font-size: 0.9rem;
      }
      .calculator-container .grid-2-col,
      .calculator-container .grid-3-col {
        display: grid;
        gap: 15px;
      }
      .calculator-container .grid-2-col {
        grid-template-columns: repeat(2, 1fr);
      }
      .calculator-container .grid-3-col {
        grid-template-columns: repeat(3, 1fr);
      }
      @media (max-width: 768px) {
        .calculator-container .grid-2-col,
        .calculator-container .grid-3-col {
          grid-template-columns: 1fr;
        }
      }
      
      /* Slider styling */
      .calculator-container .slider-group {
        position: relative;
      }
      .calculator-container input[type="range"] {
        --prepayer-percentage: 0%;
        width: calc(100% - 80px);
        height: 5px;
        -webkit-appearance: none;
        background: linear-gradient(to right, 
                     #e0e0e0 0%, #e0e0e0 var(--prepayer-percentage), 
                     #2196F3 var(--prepayer-percentage), #2196F3 100%);
        border-radius: 5px;
        outline: none;
        transition: background 0.3s;
        margin-right: 10px;
      }
      .calculator-container input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #2196F3;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      }
      .calculator-container input[type="range"]::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #2196F3;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      }
      .calculator-container .slider-group input[type="number"] {
        width: 100px;
        display: inline-block;
        text-align: center;
      }
      
      /* Results cards styling */
      .calculator-container .distribution-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 30px;
      }
      .calculator-container .distribution-card {
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #ddd;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        transition: all 0.3s ease;
      }
      .calculator-container .distribution-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      }
      .calculator-container .distribution-card .card-label {
        font-weight: bold;
        margin-bottom: 5px;
        color: #333;
      }
      .calculator-container .distribution-card .card-amount {
        font-size: 1.5rem;
        font-weight: bold;
        margin: 10px 0;
        color: #2196F3;
      }
      .calculator-container .distribution-card .card-detail {
        font-size: 0.85rem;
        color: #666;
      }
      .calculator-container .distribution-card .card-percentage {
        font-size: 0.85rem;
        font-style: italic;
        color: #666;
        margin-top: 8px;
      }
      
      /* Card styling by type */
      .calculator-container .distribution-card.creator {
        background-color: #e3f2fd;
        border-color: #bbdefb;
      }
      .calculator-container .distribution-card.platform {
        background-color: #e8f5e9;
        border-color: #c8e6c9;
      }
      .calculator-container .distribution-card.promotion {
        background-color: #fffde7;
        border-color: #fff9c4;
      }
      .calculator-container .distribution-card.buyers {
        background-color: #fff3e0;
        border-color: #ffe0b2;
      }
      
      /* Your token revenue card */
      .calculator-container .token-revenue-section {
        margin-bottom: 30px;
      }
      .calculator-container .token-revenue-card {
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #ddd;
        background-color: #f5f5f5;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }
      .calculator-container .token-revenue-amount {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
      }
      .calculator-container .amount-label {
        font-weight: bold;
        margin-right: 10px;
      }
      .calculator-container .amount-value {
        font-size: 1.5rem;
        font-weight: bold;
        color: #2196F3;
      }
      .calculator-container .token-revenue-metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
      }
      .calculator-container .metric {
        padding: 10px;
        border-radius: 4px;
        background-color: #fff;
        border: 1px solid #e0e0e0;
      }
      .calculator-container .metric-label {
        font-size: 0.85rem;
        color: #666;
        margin-bottom: 5px;
      }
      .calculator-container .metric-value {
        font-weight: bold;
        color: #333;
      }
      .calculator-container .metric.payback-status .metric-value {
        color: #dc3545;
      }
      
      /* Investor benefits visualization */
      .calculator-container .investor-benefits {
        margin-bottom: 30px;
      }
      .calculator-container .benefits-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
      }
      .calculator-container .benefit-card {
        padding: 15px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: transform 0.3s;
      }
      .calculator-container .benefit-card:hover {
        transform: translateY(-5px);
      }
      .calculator-container .benefit-card.early-investor {
        background-color: #e3f2fd;
        border: 1px solid #bbdefb;
      }
      .calculator-container .benefit-card.mid-investor {
        background-color: #e8f5e9;
        border: 1px solid #c8e6c9;
      }
      .calculator-container .benefit-card.late-investor {
        background-color: #fff3e0;
        border: 1px solid #ffe0b2;
      }
      .calculator-container .benefit-title {
        font-weight: bold;
        margin-bottom: 10px;
        color: #333;
      }
      .calculator-container .benefit-value {
        font-size: 1.3rem;
        font-weight: bold;
        color: #2196F3;
        margin-bottom: 5px;
      }
      .calculator-container .benefit-description {
        font-size: 0.9rem;
        color: #666;
        margin-bottom: 5px;
      }
      .calculator-container .benefit-multiplier {
        font-size: 0.8rem;
        font-style: italic;
        color: #666;
      }
      
      /* Overall statistics styling */
      .calculator-container .overall-stats {
        margin-bottom: 30px;
      }
      .calculator-container .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
      }
      .calculator-container .stat-item {
        padding: 15px;
        border-radius: 8px;
        background-color: #f5f5f5;
        border: 1px solid #e0e0e0;
        text-align: center;
      }
      .calculator-container .stat-label {
        font-size: 0.9rem;
        color: #666;
        margin-bottom: 5px;
      }
      .calculator-container .stat-value {
        font-size: 1.2rem;
        font-weight: bold;
        color: #333;
      }
      .calculator-container .stat-percentage {
        font-size: 0.9rem;
        color: #2196F3;
        margin-top: 5px;
      }
      
      /* Payback metrics styling */
      .calculator-container .payback-metrics {
        margin-top: 20px;
        margin-bottom: 30px;
        padding: 20px;
        border-radius: 8px;
        background-color: #f8f9fa;
        border: 1px solid #e9ecef;
      }
      .calculator-container .payback-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
      }
      .calculator-container .payback-item {
        padding: 10px;
        border-radius: 4px;
        background-color: #fff;
        border: 1px solid #e0e0e0;
      }
      .calculator-container .payback-label {
        font-size: 0.9rem;
        color: #666;
        margin-bottom: 5px;
      }
      .calculator-container .payback-value {
        font-weight: bold;
        color: #333;
      }
      .calculator-container .payback-detail,
      .calculator-container .payback-percentage {
        font-size: 0.85rem;
        color: #666;
        margin-top: 5px;
      }

      /* Distribution comparison */
      .calculator-container .distribution-comparison {
        margin-top: 30px;
      }
      .calculator-container .comparison-tabs {
        display: flex;
        border-bottom: 1px solid #ddd;
        margin-bottom: 15px;
      }
      .calculator-container .comparison-tabs .tab {
        padding: 10px 15px;
        cursor: pointer;
        border: 1px solid transparent;
        border-bottom: none;
        border-radius: 4px 4px 0 0;
        margin-right: 5px;
        background-color: #f5f5f5;
        font-size: 0.9rem;
      }
      .calculator-container .comparison-tabs .tab:hover {
        background-color: #e3f2fd;
      }
      .calculator-container .comparison-tabs .tab.active {
        background-color: #fff;
        border-color: #ddd;
        border-bottom-color: #fff;
        margin-bottom: -1px;
        font-weight: bold;
      }
      .calculator-container .comparison-content {
        display: none;
        padding: 15px;
        border: 1px solid #ddd;
        border-top: none;
        border-radius: 0 0 4px 4px;
      }
      .calculator-container .comparison-content.active {
        display: block;
      }
      .calculator-container .comparison-description {
        margin-bottom: 15px;
      }
      .calculator-container .comparison-visualization {
        margin-top: 15px;
      }
      .calculator-container .token-group {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
      }
      .calculator-container .token-label {
        width: 120px;
        font-size: 0.9rem;
        font-weight: bold;
      }
      .calculator-container .payback-bar {
        height: 25px;
        background-color: #2196F3;
        border-radius: 4px;
        color: white;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 10px;
        font-size: 0.85rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      .calculator-container .token-group.early .payback-bar {
        background-color: #4caf50;
      }
      .calculator-container .token-group.mid .payback-bar {
        background-color: #ff9800;
      }
      .calculator-container .token-group.late .payback-bar {
        background-color: #f44336;
      }
      
      /* Responsive fixes */
      @media (max-width: 992px) {
        .calculator-container .benefits-grid,
        .calculator-container .stats-grid,
        .calculator-container .payback-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .calculator-container .token-revenue-metrics {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 768px) {
        .calculator-container .benefits-grid,
        .calculator-container .payback-grid {
          grid-template-columns: 1fr;
        }
        .calculator-container .comparison-tabs {
          flex-direction: column;
          border-bottom: none;
        }
        .calculator-container .comparison-tabs .tab {
          border-radius: 4px;
          margin-bottom: 5px;
          border: 1px solid #ddd;
        }
        .calculator-container .comparison-tabs .tab.active {
          margin-bottom: 5px;
        }
        .calculator-container .token-group {
          flex-direction: column;
          align-items: flex-start;
        }
        .calculator-container .token-label {
          width: 100%;
          margin-bottom: 5px;
        }
        .calculator-container .payback-bar {
          width: 100% !important;
        }
      }
      @media (max-width: 576px) {
        .calculator-container .stats-grid {
          grid-template-columns: 1fr;
        }
        .calculator-container .token-revenue-metrics {
          grid-template-columns: 1fr;
        }
      }
    `;
    
    const styleElem = document.createElement('style');
    styleElem.id = styleId;
    styleElem.innerHTML = styles;
    document.head.appendChild(styleElem);
  }

  syncSliderInput(sliderId, inputId, isTotalSales = false) {
      const slider = document.getElementById(sliderId);
      const input = document.getElementById(inputId);
      if (!slider || !input) return;

      const updateValue = (source) => {
          const value = source.value;
          let numValue;
          
          const min = parseFloat(slider.min); 
          const max = parseFloat(slider.max);
          numValue = parseFloat(value);
          // Validate and clamp the numeric value
          if (isNaN(numValue)) {
              numValue = min; 
          } else {
              numValue = Math.max(min, Math.min(max, numValue)); 
          }

          // Update both elements to the validated value
          if (source.type === 'range') {
              input.value = numValue;
          } else { 
              slider.value = numValue;
              if (parseFloat(input.value) !== numValue) {
                 input.value = numValue; 
              }
          }
          
          // Update dependent controls if it's the total sales slider
          if (isTotalSales) {
              const yourTokenSlider = document.getElementById('your-token-number-slider');
              const yourTokenInput = document.getElementById('your-token-number-input');
              const currentTotalSales = numValue; 
               if(yourTokenSlider && yourTokenInput) {
                   const newTokenMax = currentTotalSales > 0 ? currentTotalSales : 1;
                   yourTokenSlider.max = newTokenMax;
                   yourTokenInput.max = newTokenMax;
                   let currentYourToken = parseInt(yourTokenInput.value);
                   if (isNaN(currentYourToken) || currentYourToken > newTokenMax) {
                       currentYourToken = newTokenMax;
                       yourTokenInput.value = currentYourToken;
                       yourTokenSlider.value = currentYourToken;
                   }
               }
          }
          this.triggerUpdateCalculations(); 
      };

      slider.addEventListener('input', () => updateValue(slider));
      input.addEventListener('input', () => updateValue(input)); 
      input.addEventListener('change', () => updateValue(input)); 
  }

  init() {
    console.log("Initializing Revenue Calculator V3.3 (Precise Simulation)...");
    const calculatorHTML = this.createCalculatorHTML();
    this.addCalculatorStyles();

    let containerFound = false;
    const targets = ['#revenue .content-area.active', '#docs .card']; 
    for (const selector of targets) {
      const container = document.querySelector(selector);
      if (container) {
        if (!container.querySelector('.calculator-container')) {
          container.insertAdjacentHTML(selector.includes('#revenue') ? 'afterbegin' : 'beforeend', calculatorHTML);
          console.log(`Calculator added to ${selector}`);
          containerFound = true;
          
          // Translate the calculator once it's added to the DOM
          const calculatorContainer = container.querySelector('.calculator-container');
          if (calculatorContainer) {
            try {
              console.log("Attempting to translate calculator container...");
              translateNode(calculatorContainer);
            } catch (error) {
              console.error("Error translating calculator:", error);
            }
          }
          
          break; 
        } else {
          console.log(`Calculator already exists in ${selector}. Skipping.`);
          containerFound = true; 
          break;
        }
      }
    }

    if (!containerFound) {
      console.warn("Could not find suitable container for revenue calculator.");
      return; 
    }

    const inputsToWatch = [
      'initial-investment', 'token-price', 
      'creator-share', 'platform-share', 'promotion-share',
      'payback-ratio', 'non-payback-pool-share'
    ];
    inputsToWatch.forEach(id => {
      const inputElement = document.getElementById(id);
      if (inputElement) {
        inputElement.addEventListener('input', () => this.triggerUpdateCalculations());
      } else {
        console.warn(`Input element '${id}' not found.`);
      }
    });

    this.syncSliderInput('total-sales-slider', 'total-sales-input', true); 
    this.syncSliderInput('your-token-number-slider', 'your-token-number-input');

    setTimeout(() => {
      try {
        this._updateCalculationsInternal(); 
        console.log("Initial calculation complete V3.3.");
      } catch (error) {
        console.error("Error during initial calculation:", error);
        const errorDiv = document.getElementById('calculation-error');
        if (errorDiv) {
          // Проверяем наличие функции t()
          if (typeof t === 'function') {
            errorDiv.textContent = t('calculator.errors.initError', 'Error initializing calculator.');
          } else {
            errorDiv.textContent = 'Error initializing calculator.';
          }
          errorDiv.style.display = 'block';
        }
      }
    }, 250); 
    
    // Initialize comparison tabs
    this.initComparisonTabs();
    
    console.log("Revenue Calculator Initialized V3.3.");
  }

  /**
   * Test function to simulate revenue distribution and find payback points.
   * Can be run from the browser console: `new RevenueCalculator().runTestSimulation({...})`
   */
  runTestSimulation(params) {
    // Get parameters or use instance defaults
    const calc = this;
    const nonPaybackPoolSharePercent = params?.nonPaybackPoolSharePercent ?? calc.nonPaybackPoolSharePercent;
    const initialInvestment = params?.initialInvestment ?? calc.initialInvestment;
    const tokenPrice = params?.tokenPrice ?? 100;
    const creatorShare = params?.creatorShare ?? calc.creatorShare;
    const platformShare = params?.platformShare ?? calc.platformShare;
    const promotionShare = params?.promotionShare ?? calc.promotionShare;
    const paybackRatio1 = params?.paybackRatio1 ?? 1; // 1x payback
    const paybackRatio2 = params?.paybackRatio2 ?? 2; // 2x payback
    const maxSalesToSimulate = params?.maxSalesToSimulate ?? 100000;
    
    // Calculate derived values
    const numPrepayers = Math.ceil(initialInvestment / tokenPrice);
    const buyersShare = 100 - creatorShare - platformShare - promotionShare;
    const tokensToTrack = [1, 100, 1000]; // Track early, mid and late tokens
    
    console.log(`\n--- Starting Revenue Distribution Test Simulation ---`);
    console.log(`Parameters:`);
    console.log(`- Initial Investment: ${initialInvestment}, Token Price: ${tokenPrice}`);
    console.log(`- Creator: ${creatorShare}%, Platform: ${platformShare}%, Promotion: ${promotionShare}%, Buyers: ${buyersShare}%`);
    console.log(`- Non-Payback Pool Share: ${nonPaybackPoolSharePercent}%`);
    console.log(`- Number of Prepaying Customers: ${numPrepayers}`);
    console.log(`- Tracked Tokens: ${tokensToTrack.join(', ')}`);
    
    // Storage for final results
    const results = {
        parameters: {
            initialInvestment,
            tokenPrice,
            creatorShare, 
            platformShare,
            promotionShare,
            buyersShare,
            nonPaybackPoolSharePercent,
            numPrepayers
        },
        paybackSales: {},
    };
    
    // Simulation function for each payback ratio
    const simulate = (paybackRatio) => {
        console.log(`\nSimulating payback ratio: ${paybackRatio}x`);
        
        // Payback goal for this ratio simulation
        const paybackGoal = tokenPrice * paybackRatio;
        console.log(`- Payback goal per token: ${paybackGoal}`);
        
        // Check token tracking validity
        if (Math.max(...tokensToTrack) > maxSalesToSimulate) {
            console.warn(`Warning: Max sales to simulate (${maxSalesToSimulate}) is less than the highest tracked token number (${Math.max(...tokensToTrack)}). Results for higher tokens might be incomplete.`);
        }
        if (maxSalesToSimulate < numPrepayers) {
            console.error(`Error: Max sales (${maxSalesToSimulate}) must be >= Prepayers (${numPrepayers})`);
            return null;
        }
        
        // Track when each target token reaches payback
        const paybackFound = {};
        tokensToTrack.forEach(id => { paybackFound[id] = null; });
        
        // Initialize token earnings array (1-indexed, position 0 not used)
        let tokenEarnings = new Array(Math.max(maxSalesToSimulate, Math.max(...tokensToTrack)) + 1).fill(0);
        
        // We don't need to simulate prepayment phase
        console.log(`- Skipping prepayment phase (${numPrepayers} prepayers)`);
        
        // Start post-prepayment simulation
        let allTrackedFound = false;
        const nonPaybackPoolPercent = nonPaybackPoolSharePercent / 100;
        const sharedPoolPercent = 1.0 - nonPaybackPoolPercent;
  
        for (let currentSaleNum = numPrepayers + 1; currentSaleNum <= maxSalesToSimulate; currentSaleNum++) {
           const saleTotalBuyersRevenue = tokenPrice * (buyersShare / 100);
           const numTokensInDistribution = currentSaleNum - 1;
           
           // Skip distribution if no tokens to distribute to yet
           if (numTokensInDistribution === 0) continue;
           
           // 1. Count tokens in each pool
           let notPaidBackCount = 0;
           for (let i = 1; i <= numTokensInDistribution; i++) {
              if (tokenEarnings[i] < paybackGoal) {
                  notPaidBackCount++;
              }
           }
           
           // 2. Calculate the two pools
           const nonPaybackPoolShare = saleTotalBuyersRevenue * nonPaybackPoolPercent;
           const sharedPoolShare = saleTotalBuyersRevenue * sharedPoolPercent;
           
           // 3. Calculate per-token shares
           const nonPaybackSharePerToken = notPaidBackCount > 0 ? nonPaybackPoolShare / notPaidBackCount : 0;
           const sharedSharePerToken = numTokensInDistribution > 0 ? sharedPoolShare / numTokensInDistribution : 0;
           
           // 4. Distribute earnings
           for (let i = 1; i <= numTokensInDistribution; i++) {
              const wasPaidBackBefore = tokenEarnings[i] >= paybackGoal;
              
              // Every token gets a share from the shared pool
              let earning = sharedSharePerToken;
              
              // Tokens that haven't reached payback also get a share from the non-payback pool
              if (!wasPaidBackBefore) {
                 earning += nonPaybackSharePerToken;
              }
              
              // Update token earnings
              tokenEarnings[i] += earning;
              
              // Check if any tracked tokens reached payback with this sale
              if (tokensToTrack.includes(i)) {
                  if (!wasPaidBackBefore && tokenEarnings[i] >= paybackGoal) {
                      if (paybackFound[i] === null) {
                          paybackFound[i] = currentSaleNum;
                          console.log(`  - Token #${i} reached payback goal ${paybackGoal} at sale #${currentSaleNum}`);
                          // Check if all tracked tokens are found
                          allTrackedFound = tokensToTrack.every(id => paybackFound[id] !== null);
                      }
                  }
              }
           }
           
           if (allTrackedFound) {
               console.log(`All tracked tokens reached payback by sale #${currentSaleNum}. Stopping simulation early for this ratio.`);
               break; // Optimization: stop if all tracked tokens found payback
           }
        } // End simulation loop
        
        // Store results for this ratio
        const ratioKey = `ratio_${paybackRatio}x`;
        results[ratioKey] = {};
        tokensToTrack.forEach(id => {
            results[ratioKey][`token_${id}`] = paybackFound[id];
            if(paybackFound[id] === null) {
                console.log(`  - Token #${id} DID NOT reach payback goal ${paybackGoal} within ${maxSalesToSimulate} sales.`);
            }
        });
        return paybackFound;
    };

    // Run simulation for both ratios
    simulate(paybackRatio1);
    simulate(paybackRatio2);

    console.log(`\n--- Test Simulation Complete ---`);
    console.log("Final Payback Results (Sale Number when goal reached, null if not reached):");
    console.table(results);
    
    // Prepare data for table output
    let tableData = {};
    tokensToTrack.forEach(id => {
      tableData[`Token #${id}`] = {
        'Payback 1x': results[`ratio_${paybackRatio1}x`]?.[`token_${id}`] ?? 'Not Reached',
        'Payback 2x': results[`ratio_${paybackRatio2}x`]?.[`token_${id}`] ?? 'Not Reached'
      };
    });
    console.log("Summary Table:");
    console.table(tableData);
    
    return results; // Return the raw results object
  }

  // Отдельный метод для обновления UI с результатами расчетов
  updateResultsUI(results, tokenPrice, currentYourToken, currentTotalSales) {
    try {
      // Обновляем основные результаты
      const accCreatorRevenue = document.getElementById('acc-creator-revenue');
      if (accCreatorRevenue) {
        accCreatorRevenue.textContent = formatNumber(results.creator);
      }
      
      const creatorRevenueDetail = document.getElementById('creator-revenue-detail');
      if (creatorRevenueDetail) {
        creatorRevenueDetail.textContent = `(${formatNumber(results.actualInitialInvestment)} + ${formatNumber(results.creator - results.actualInitialInvestment)})`;
      }
      
      const accPlatformRevenue = document.getElementById('acc-platform-revenue');
      if (accPlatformRevenue) {
        accPlatformRevenue.textContent = formatNumber(results.platform);
      }
      
      const accPromotionRevenue = document.getElementById('acc-promotion-revenue');
      if (accPromotionRevenue) {
        accPromotionRevenue.textContent = formatNumber(results.promotion);
      }
      
      const accTotalBuyersRevenue = document.getElementById('acc-total-buyers-revenue');
      if (accTotalBuyersRevenue) {
        accTotalBuyersRevenue.textContent = formatNumber(results.buyer);
      }
      
      const accYourTokenRevenue = document.getElementById('acc-your-token-revenue');
      if (accYourTokenRevenue) {
        accYourTokenRevenue.textContent = formatNumber(results.yourToken || results.buyer);
      }
      
      const yourTokenPaybackGoal = document.getElementById('your-token-payback-goal');
      if (yourTokenPaybackGoal) {
        yourTokenPaybackGoal.textContent = formatNumber(results.paybackGoal);
      }
      
      const finalPaidBackEstimate = document.getElementById('final-paid-back-estimate');
      if (finalPaidBackEstimate) {
        finalPaidBackEstimate.textContent = results.paidBackCount;
      }
      
      // Обновляем статус окупаемости
      const achievedPayback = results.paybackGoal > 0 && (results.yourToken || results.buyer) >= results.paybackGoal;
      const statusElement = document.getElementById('your-token-payback-status');
      if (statusElement) {
        if (typeof t === 'function') {
          statusElement.textContent = achievedPayback ? t('calculator.yourToken.yes', 'Yes') : t('calculator.yourToken.no', 'No');
        } else {
          statusElement.textContent = achievedPayback ? 'Yes' : 'No';
        }
        statusElement.style.color = achievedPayback ? '#28a745' : '#dc3545'; 
        statusElement.style.fontWeight = 'bold';
      }

      // Calculate total revenue and platform percentage of total
      const totalRevenue = results.actualInitialInvestment + (currentTotalSales - results.prepayersCount) * tokenPrice;
      const platformPercentageOfTotal = totalRevenue > 0 ? (results.platform / totalRevenue * 100).toFixed(2) : 0;
      
      // Update platform percentage display
      const platformPercentageElement = document.getElementById('platform-percentage');
      if (platformPercentageElement) {
        platformPercentageElement.textContent = `${platformPercentageOfTotal}% от общего дохода`;
        platformPercentageElement.title = `Платформа получает ${this.platformShare}% только от продаж после предоплаты`;
      }

      // Update total revenue
      const totalRevenueElement = document.getElementById('total-revenue');
      if (totalRevenueElement) {
        totalRevenueElement.textContent = formatNumber(totalRevenue);
      }
      
      // Calculate percentage of paid back tokens
      const paidBackPercentage = currentTotalSales > 0 ? (results.paidBackCount / currentTotalSales * 100).toFixed(2) : 0;
      const paidBackPercentageElement = document.getElementById('paid-back-percentage');
      if (paidBackPercentageElement) {
        paidBackPercentageElement.textContent = `(${paidBackPercentage}%)`;
      }
      
      // Update token numbers display
      const yourTokenDisplay = document.getElementById('your-token-number-display');
      if (yourTokenDisplay) {
        yourTokenDisplay.textContent = currentYourToken;
      }
      
      const numPrepayersDisplay = document.getElementById('num-prepayers-display');
      if (numPrepayersDisplay) {
        numPrepayersDisplay.textContent = results.prepayersCount;
      }
      
      // Calculate ROI for the current token
      const roi = tokenPrice > 0 ? (((results.yourToken || results.buyer) / tokenPrice) * 100 - 100).toFixed(2) : 0;
      const roiElement = document.getElementById('your-token-roi');
      if (roiElement) {
        roiElement.textContent = `${roi}%`;
        roiElement.style.color = roi >= 0 ? '#28a745' : '#dc3545';
      }
      
      // Update investor benefits section with corrected payback goal
      this.updateInvestorBenefitsSection(tokenPrice, results.prepayersCount, currentTotalSales, results.paybackGoal);
      
      // Initialize the comparison tabs
      this.initComparisonTabs();

      // Обновляем информацию о моменте окупаемости
      const paybackInfoDiv = document.getElementById('payback-info');
      if (paybackInfoDiv && results.paybackPoint) {
        // Calculate financials at payback point
        const paybackTotalRevenue = results.totalRevenueAtPayback;
        const paybackCreatorRevenue = results.creatorRevenueAtPayback;
        const paybackPlatformRevenue = results.platformRevenueAtPayback;
        const paybackPlatformPercentage = paybackTotalRevenue > 0 ? (paybackPlatformRevenue / paybackTotalRevenue * 100).toFixed(2) : 0;
        
        // Update the payback info div with details
        paybackInfoDiv.innerHTML = `
            <h4>Информация о моменте окупаемости токена #${currentYourToken}</h4>
            <div class="payback-grid">
              <div class="payback-item">
                <div class="payback-label">Номер продажи:</div>
                <div class="payback-value">#${results.paybackPoint}</div>
              </div>
              <div class="payback-item">
                <div class="payback-label">Общий доход на момент окупаемости:</div>
                <div class="payback-value">${formatNumber(paybackTotalRevenue)}</div>
              </div>
              <div class="payback-item">
                <div class="payback-label">Доход автора:</div>
                <div class="payback-value">${formatNumber(paybackCreatorRevenue)}</div>
                <div class="payback-detail">${formatNumber(results.actualInitialInvestment)} (предоплата) + ${formatNumber(paybackCreatorRevenue - results.actualInitialInvestment)} (доля)</div>
              </div>
              <div class="payback-item">
                <div class="payback-label">Доход платформы:</div>
                <div class="payback-value">${formatNumber(paybackPlatformRevenue)}</div>
                <div class="payback-percentage">${paybackPlatformPercentage}% от общего дохода</div>
              </div>
            </div>
        `;
        paybackInfoDiv.style.display = 'block';
      } else if (paybackInfoDiv) {
        paybackInfoDiv.style.display = 'none';
      }
    } catch (error) {
      console.error("Error updating UI with calculation results:", error);
    }
  }
}

// Add class initialization at the end of the file for the module
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOMContentLoaded event fired, initializing Revenue Calculator");
  try {
    window.revenueCalculator = new RevenueCalculator();
    window.revenueCalculator.init();
  } catch (error) {
    console.error("Failed to initialize Revenue Calculator:", error);
  }
});
