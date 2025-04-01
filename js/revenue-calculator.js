/**
 * Revenue Distribution Calculator for Co-Intent Platform
 * Calculates ACCRUED revenue over a number of sales based on a payback model,
 * including an initial investment phase.
 * Uses precise step-by-step simulation.
 */

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
      return Math.ceil(this.initialInvestment / tokenPrice);
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
            // Добавляем поля для финансовых показателей
            paybackPoint: null,
            totalRevenueAtPayback: 0,
            creatorRevenueAtPayback: 0,
            platformRevenueAtPayback: 0
        };
    }

    // Calculate derived values
    const initialInvestment = parseFloat(this.initialInvestment);
    const numPrepayers = this.calculateNumPrepayers(tokenPrice);

    if (totalSales < numPrepayers) {
        return {
            creator: initialInvestment,
            platform: 0,
            promotion: 0,
            buyer: 0,
            prepayersCount: numPrepayers,
            paidBackCount: 0,
            // Добавляем поля для финансовых показателей
            paybackPoint: null,
            totalRevenueAtPayback: 0,
            creatorRevenueAtPayback: 0,
            platformRevenueAtPayback: 0
        };
    }

    // Shares for post-prepayment phase
    const creatorSharePercent = parseFloat(this.creatorShare);
    const platformSharePercent = parseFloat(this.platformShare);
    const promotionSharePercent = parseFloat(this.promotionShare);
    const buyersSharePercent = 100 - creatorSharePercent - platformSharePercent - promotionSharePercent;
    
    // Payback model parameters
    const paybackRatio = parseFloat(this.paybackRatio);
    const nonPaybackPoolSharePercent = parseFloat(this.nonPaybackPoolSharePercent);
    const sharedPoolSharePercent = 100 - nonPaybackPoolSharePercent;
    
    // Goal to reach for buyers
    const paybackGoal = tokenPrice * paybackRatio;
    
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
            const nonPaybackPoolShare = buyersShare * (nonPaybackPoolSharePercent / 100);
            const sharedPoolShare = buyersShare * (sharedPoolSharePercent / 100);
            
            // 3. Calculate per-token shares
            const nonPaybackSharePerToken = notPaidBackCount > 0 ? nonPaybackPoolShare / notPaidBackCount : 0;
            const sharedSharePerToken = sharedPoolShare / numTokensInDistribution;
            
            // 4. Distribute earnings
            paidBackCount = 0; // Reset counter for this iteration
            for (let i = 1; i <= numTokensInDistribution; i++) {
                // Every token gets a share from the shared pool
                let earning = sharedSharePerToken;
                
                // Tokens that haven't reached payback also get a share from the non-payback pool
                if (tokenEarnings[i] < paybackGoal) {
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
        // Добавляем информацию о моменте окупаемости
        paybackPoint: paybackPoint,
        totalRevenueAtPayback: totalRevenueAtPayback,
        creatorRevenueAtPayback: creatorRevenueAtPayback,
        platformRevenueAtPayback: platformRevenueAtPayback
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
          <h3 class="card-title">Калькулятор Накопленного Дохода (Точная Симуляция)</h3>
        </div>
        <div class="card-body">
          <!-- Sections: Initial Investment, Distribution Params, Payback Params -->
          <div class="settings-section">
             <h4>Этап 1: Первоначальные Инвестиции</h4>
              <div class="grid-2-col">
            <div class="form-group">
                    <label for="initial-investment">Сумма Начальных Инвестиций</label>
                    <input type="number" id="initial-investment" value="${this.initialInvestment}" min="0" step="1000">
            </div>
                   <div class="form-group">
                    <label for="token-price">Цена Токена</label>
                    <input type="number" id="token-price" value="300" min="1">
              </div>
              </div>
               <div class="form-group readonly-group">
                    <label>Расчетное Кол-во Заказчиков (Предоплата):</label>
                    <span id="calc-num-prepayers" class="calculated-value">${defaultNumPrepayers}</span>
                    <div class="form-hint">= ОкруглениеВверх(Сумма Инвестиций / Цена Токена). Они покрывают сумму для Создателя.</div>
              </div>
            </div>
            
           <div class="settings-section">
              <h4>Этап 2: Параметры Распределения (для продаж ПОСЛЕ Заказчиков)</h4>
              <div class="grid-3-col">
                <div class="form-group">
                  <label for="creator-share">Доля Создателя (%)</label>
                  <input type="number" id="creator-share" value="${this.creatorShare}" min="0" max="100" step="1">
                </div>
                <div class="form-group">
                  <label for="platform-share">Доля Платформы (%)</label>
                  <input type="number" id="platform-share" value="${this.platformShare}" min="0" max="100" step="1">
                </div>
              <div class="form-group">
                  <label for="promotion-share">Доля Продвижения (%)</label>
                  <input type="number" id="promotion-share" value="${this.promotionShare}" min="0" max="100" step="1">
                </div>
              </div>
              <div class="form-group readonly-group">
                  <label>Доля Покупателей (%):</label>
                  <span id="calc-buyers-share" class="calculated-value">${this.buyersShare.toFixed(2)}%</span>
                  <div class="form-hint">= 100% - остальные доли. Распределяется между ВСЕМИ токенами (#1 и далее).</div>
              </div>
              
              <h4>Параметры Окупаемости Покупателей</h4>
               <div class="grid-2-col">
                  <div class="form-group">
                    <label for="payback-ratio">Множитель Окупаемости (X)</label>
                    <input type="number" id="payback-ratio" value="${this.paybackRatio}" min="1" step="0.1">
                    <div class="form-hint">Цель: вернуть цену * X</div>
              </div>
              <div class="form-group">
                    <label for="non-payback-pool-share">Приоритет "Не Окупившихся" (%)</label>
                    <input type="number" id="non-payback-pool-share" value="${this.nonPaybackPoolSharePercent}" min="0" max="100" step="1">
                    <div class="form-hint">% от доли покупателей, идущий только им</div>
                  </div>
            </div>
          </div>

          <!-- Section: Calculation Inputs (Sliders/Numbers) -->
          <div class="calculation-section">
            <h4>Параметры Расчета (Общее Число Продаж)</h4>
             <div class="form-group slider-group">
              <label for="total-sales">Общее Количество Продаж (включая Заказчиков)</label>
              <input type="range" id="total-sales-slider" value="${defaultSales}" min="1" max="${MAX_SIMULATED_SALES}" step="${salesStep}">
              <input type="number" id="total-sales-input" value="${defaultSales}" min="1" max="${MAX_SIMULATED_SALES}">
               <div class="form-hint">Минимум = Расчетное Кол-во Заказчиков (<span id="min-sales-hint">${defaultNumPrepayers}</span>). Максимум = ${MAX_SIMULATED_SALES} (для производительности).</div>
            </div>
             <div class="form-group slider-group">
              <label for="your-token-number">Номер Вашего Токена</label>
              <input type="range" id="your-token-number-slider" value="${defaultYourToken}" min="1" max="${defaultSales}" step="1">
              <input type="number" id="your-token-number-input" value="${defaultYourToken}" min="1" max="${defaultSales}">
               <div class="form-hint">Максимум = Общее Кол-во Продаж</div>
            </div>
          </div>

          <!-- Section: Results -->
          <div class="results-section">
            <h4>Результат: Накопленный Доход</h4>
             <div id="calculation-error" class="error-message" style="display: none;"></div>
            <div class="distribution-cards results-accrued">
               <div class="distribution-card creator">
                 <div class="card-label">Создатель</div>
                 <div class="card-amount" id="acc-creator-revenue">0</div>
                 <div class="card-detail" id="creator-revenue-detail">(0 + 0)</div>
              </div>
              <div class="distribution-card platform">
                 <div class="card-label">Платформа</div>
                 <div class="card-amount" id="acc-platform-revenue">0</div>
              </div>
              <div class="distribution-card promotion">
                 <div class="card-label">Продвижение</div>
                 <div class="card-amount" id="acc-promotion-revenue">0</div>
              </div>
              <div class="distribution-card buyers">
                 <div class="card-label">Покупатели (Распределено)</div>
                 <div class="card-amount" id="acc-total-buyers-revenue">0</div>
                 <div class="card-detail">(Доход от продаж после Заказчиков)</div>
              </div>
            </div>

            <div class="token-revenue-card your-token-card-accrued">
              <div class="card-header">
                <i class="fas fa-coins"></i>
                <h5>Накопленный Доход Токена #<span id="your-token-number-display">${defaultYourToken}</span></h5>
              </div>
              <div class="card-body">
                  <div class="revenue-amount" id="acc-your-token-revenue">0</div>
                <div class="revenue-details">
                  <div class="detail">
                          <span class="label">Цель окупаемости (<span id="payback-ratio-display">${this.paybackRatio}</span>x):</span>
                          <span class="value" id="your-token-payback-goal">0</span>
                  </div>
                  <div class="detail">
                          <span class="label">Достиг цели?</span>
                          <span class="value" id="your-token-payback-status">Нет</span>
                  </div>
                  <div class="detail">
                          <span class="label">Точно окупившихся токенов (всего):</span>
                          <span class="value" id="final-paid-back-estimate">0</span>
                      </div>
                  </div>
              </div>
            </div>
          </div>

          <div class="results-container">
                <h3>Результаты расчета</h3>
                <div class="results-grid">
                    <div class="result-group">
                        <h4>Накопленный доход</h4>
                        <div class="result-row">
                            <span>Создатель:</span>
                            <span id="acc-creator-revenue">0</span>
                            <span id="creator-revenue-detail" class="detail-text"></span>
                        </div>
                        <div class="result-row">
                            <span>Платформа:</span>
                            <span id="acc-platform-revenue">0</span>
                        </div>
                        <div class="result-row">
                            <span>Продвижение:</span>
                            <span id="acc-promotion-revenue">0</span>
                        </div>
                        <div class="result-row">
                            <span>Всего распределено покупателям:</span>
                            <span id="acc-total-buyers-revenue">0</span>
                        </div>
                    </div>
                    
                    <div class="result-group">
                        <h4>Статус вашего токена #<span id="your-token-display">0</span></h4>
                        <div class="result-row">
                            <span>Накопленный доход:</span>
                            <span id="acc-your-token-revenue">0</span>
                        </div>
                        <div class="result-row">
                            <span>Цель окупаемости:</span>
                            <span id="your-token-payback-goal">0</span>
                        </div>
                        <div class="result-row">
                            <span>Цель достигнута:</span>
                            <span id="your-token-payback-status">Нет</span>
                        </div>
                    </div>
                    
                    <div class="result-group">
                        <h4>Общая статистика</h4>
                        <div class="result-row">
                            <span>Предоплаченных токенов:</span>
                            <span id="num-prepayers-display">0</span>
                        </div>
                        <div class="result-row">
                            <span>Токенов достигших окупаемости:</span>
                            <span id="final-paid-back-estimate">0</span>
                        </div>
                    </div>
                </div>
                
                <!-- Добавляем новый блок для отображения финансовых показателей в момент окупаемости -->
                <div id="payback-info" class="payback-metrics" style="display:none; margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
                </div>
            </div>
        </div>
      </div>
    `;
  }
  
  // Debounced calculation trigger
  triggerUpdateCalculations() {
      // Clear any existing pending calculation
      clearTimeout(this.calculationTimeout);
      // Schedule the actual calculation slightly later
      this.calculationTimeout = setTimeout(() => {
          this._updateCalculationsInternal();
      }, 150); // Adjust debounce time if needed (e.g., 200ms)
  }

  // Internal calculation logic, called by debounced trigger
  _updateCalculationsInternal() {
    // console.log("Updating calculations V3.3 (Precise)..."); 
    const errorDiv = document.getElementById('calculation-error');
    errorDiv.textContent = ''; // Clear previous errors
    errorDiv.style.display = 'none';
    let numPrepayers = 0; // Keep track for UI updates even on error
    let tokenPrice = 0; // Keep track for UI updates
    let currentTotalSales = 0;
    let currentYourToken = 0;
    
    try {
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
      // Read current values from inputs
      currentTotalSales = parseInt(totalSalesInput.value) || 0;
      currentYourToken = parseInt(yourTokenInput.value) || 1;

      // --- Basic Input Validation --- 
      if (tokenPrice <= 0) {
          this.showError(errorDiv, "Цена токена должна быть > 0.");
          this.clearResults(this.calculateNumPrepayers(tokenPrice), tokenPrice); // Update prepayers even on error
          return;
      }
      if (this.initialInvestment < 0) {
          this.showError(errorDiv, "Сумма инвестиций не может быть отрицательной.");
          this.clearResults(this.calculateNumPrepayers(tokenPrice), tokenPrice);
          return;
      }
       if (this.creatorShare < 0 || this.platformShare < 0 || this.promotionShare < 0 || 
           this.creatorShare > 100 || this.platformShare > 100 || this.promotionShare > 100 || 
           (this.creatorShare + this.platformShare + this.promotionShare) > 100) {
           this.showError(errorDiv, "Доли Создателя, Платформы, Продвижения должны быть 0-100% и в сумме не > 100%.");
           this.clearResults(this.calculateNumPrepayers(tokenPrice), tokenPrice);
           return;
       }
        if (this.paybackRatio < 1) {
            this.showError(errorDiv, "Множитель Окупаемости должен быть >= 1.");
            this.clearResults(this.calculateNumPrepayers(tokenPrice), tokenPrice);
            return;
        }
        if (this.nonPaybackPoolSharePercent < 0 || this.nonPaybackPoolSharePercent > 100) {
             this.showError(errorDiv, "Приоритет Не Окупившихся должен быть 0-100%.");
             this.clearResults(this.calculateNumPrepayers(tokenPrice), tokenPrice);
             return;
        }

      // --- Calculate Dependent Parameters & Update UI --- 
      this.updateBuyersShare();
      this.updatePaybackPoolSharePercent();
      document.getElementById('calc-buyers-share').textContent = `${this.buyersShare.toFixed(2)}%`;
      numPrepayers = this.calculateNumPrepayers(tokenPrice);
      document.getElementById('calc-num-prepayers').textContent = numPrepayers;
      
      // Update sliders' min/max and potentially value
      const totalSalesSlider = document.getElementById('total-sales-slider');
      const yourTokenSlider = document.getElementById('your-token-number-slider');
      const minSalesHint = document.getElementById('min-sales-hint');
      const effectiveMinSales = numPrepayers > 0 ? numPrepayers : 1;
      minSalesHint.textContent = numPrepayers; // Show calculated prepayers
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
       document.getElementById('your-token-number-display').textContent = currentYourToken;
       document.getElementById('payback-ratio-display').textContent = this.paybackRatio;
       
        // Update slider background gradient
       this.updateSliderBackground(totalSalesSlider, numPrepayers);

      const paybackGoalAmount = tokenPrice * this.paybackRatio;
      const paybackHint = document.querySelector('#payback-ratio + .form-hint');
      if(paybackHint) paybackHint.textContent = `Цель: ${formatNumber(tokenPrice)} * ${this.paybackRatio} = ${formatNumber(paybackGoalAmount)}`;
      
      // --- Perform Main Calculation --- 
      // Use the potentially adjusted values of totalSales and yourTokenNumber
      const results = this.calculateAccruedRevenue(tokenPrice, currentTotalSales, currentYourToken);
      
      // Check for errors returned from calculation function
      if (results.error) {
          this.showError(errorDiv, `Ошибка расчета: ${results.error}`);
          this.clearResults(results.numPrepayers, tokenPrice); // Use numPrepayers from results if available
          return;
      }

      // --- Update UI Elements with Results --- 
      document.getElementById('acc-creator-revenue').textContent = formatNumber(results.creator);
      document.getElementById('creator-revenue-detail').textContent = `(${formatNumber(results.actualInitialInvestment)} + ${formatNumber(results.creator - results.actualInitialInvestment)})`;
      document.getElementById('acc-platform-revenue').textContent = formatNumber(results.platform);
      document.getElementById('acc-promotion-revenue').textContent = formatNumber(results.promotion);
      document.getElementById('acc-total-buyers-revenue').textContent = formatNumber(results.buyer);
      document.getElementById('acc-your-token-revenue').textContent = formatNumber(results.buyer);
      document.getElementById('your-token-payback-goal').textContent = formatNumber(results.paybackGoal);
      document.getElementById('final-paid-back-estimate').textContent = results.paidBackCount;
      
      const achievedPayback = results.paybackGoal > 0 && results.buyer >= results.paybackGoal;
      document.getElementById('your-token-payback-status').textContent = achievedPayback ? 'Да' : 'Нет';
      const statusElement = document.getElementById('your-token-payback-status');
      statusElement.style.color = achievedPayback ? '#28a745' : '#dc3545'; 
      statusElement.style.fontWeight = 'bold';

      // Update results fields
      document.getElementById('total-creator-revenue').textContent = this.formatCurrency(results.creator);
      document.getElementById('total-platform-revenue').textContent = this.formatCurrency(results.platform);
      document.getElementById('total-promotion-revenue').textContent = this.formatCurrency(results.promotion);
      document.getElementById('total-buyer-revenue').textContent = this.formatCurrency(results.buyer);
      document.getElementById('num-paid-back').textContent = results.paidBackCount;
      
      // Обновляем информацию о моменте окупаемости
      const paybackInfoDiv = document.getElementById('payback-info');
      if (results.paybackPoint) {
          paybackInfoDiv.innerHTML = `
              <h4>Информация о достижении окупаемости</h4>
              <p>Токен #${currentYourToken} достиг ${this.paybackRatio}x окупаемости на продаже #${results.paybackPoint}</p>
              <p>Всего собрано на момент окупаемости: ${this.formatCurrency(results.totalRevenueAtPayback)}</p>
              <p>Выплачено автору: ${this.formatCurrency(results.creatorRevenueAtPayback)}</p>
              <p>Выплачено платформе: ${this.formatCurrency(results.platformRevenueAtPayback)}</p>
          `;
          paybackInfoDiv.style.display = 'block';
      } else {
          paybackInfoDiv.style.display = 'none';
      }

    } catch (error) {
        console.error("Unhandled error during calculation update:", error);
        this.showError(errorDiv, "Произошла непредвиденная ошибка при расчете.");
        // Attempt to clear results using potentially available numPrepayers
        this.clearResults(numPrepayers, tokenPrice); 
    }
  }
  
  // Helper to display errors
  showError(errorDiv, message) {
      if (errorDiv) {
          errorDiv.textContent = message;
          errorDiv.style.display = 'block';
      }
      console.warn("Calculation Error:", message); // Also log error
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
      document.getElementById('acc-total-buyers-revenue').textContent = '0.00';
      document.getElementById('acc-your-token-revenue').textContent = '0.00';
      // Calculate goal even when clearing, if possible
      const paybackGoal = (parseFloat(tokenPrice) || 0) * (this.paybackRatio || 1);
      document.getElementById('your-token-payback-goal').textContent = formatNumber(paybackGoal);
      document.getElementById('final-paid-back-estimate').textContent = '0';
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
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* General Layout, Form Groups */
      .calculator-container .card-body { padding: 20px; }
      .calculator-container .settings-section,
      .calculator-container .calculation-section,
      .calculator-container .results-section {
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid #e9ecef;
      }
      .calculator-container .results-section { border-bottom: none; }
      .calculator-container h4 {
        margin-bottom: 20px;
        color: #0056b3;
        font-weight: 600;
        border-bottom: 2px solid #007bff;
        padding-bottom: 5px;
        display: inline-block;
      }
      .grid-3-col, .grid-2-col {
        display: grid;
        gap: 20px; /* Increased gap slightly */
      }
      .grid-3-col { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
      .grid-2-col { grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
      
      .form-group { margin-bottom: 15px; }
      .form-group label { display: block; margin-bottom: 5px; font-weight: 500; color: #495057; }
      .form-group input[type="number"], .form-group input[type="range"] {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ced4da;
        border-radius: 4px;
        box-sizing: border-box; 
      }
       .form-group input[type="range"] { 
           padding: 0; 
           height: 10px; /* Slightly thicker track */
           cursor: pointer; 
           margin-top: 5px; margin-bottom: 5px;
           appearance: none; -webkit-appearance: none; 
           background: #e9ecef; /* Default track color */
           border-radius: 5px;
           outline: none; 
           position: relative; /* Needed for gradient */
       }
      .form-group .form-hint {
        font-size: 0.8rem;
        color: #6c757d;
        margin-top: 4px;
      }
      .readonly-group label { display: inline-block; margin-right: 5px; margin-bottom: 0;}
      .readonly-group .calculated-value {
          font-weight: bold;
          color: #0056b3; 
          font-size: 1.1em;
      }
      
      /* Slider Track Styling */
      #total-sales-slider {
          --prepayer-percentage: 0%; 
          /* Apply gradient via pseudo-element for better compatibility */
      }
      /* Webkit - Track Background */
      #total-sales-slider::-webkit-slider-runnable-track {
          height: 10px;
          border-radius: 5px;
          background: linear-gradient(to right, 
              #90ee90 var(--prepayer-percentage), /* Light green for prepayers */
              #e9ecef var(--prepayer-percentage) /* Default track color */
          );
      }
      /* Mozilla - Track Background */
       #total-sales-slider::-moz-range-track {
           height: 10px;
           border-radius: 5px;
           background: linear-gradient(to right, 
               #90ee90 var(--prepayer-percentage), 
               #e9ecef var(--prepayer-percentage)
           );
           border: none; /* Remove default border */
       }
       /* MS - Track Background (Might need adjustments) */
        #total-sales-slider::-ms-track {
            height: 10px;
            border-radius: 5px;
            background: transparent; /* Use background on fill elements */
            border-color: transparent;
            color: transparent;
        }
        #total-sales-slider::-ms-fill-lower {
            background: #90ee90; 
            border-radius: 5px;
        }
         #total-sales-slider::-ms-fill-upper {
            background: #e9ecef;
            border-radius: 5px;
        }

        /* Slider Thumb */
       input[type=range]::-webkit-slider-thumb {
         -webkit-appearance: none; appearance: none; 
         width: 20px; height: 20px; 
         background: #007bff; 
         border-radius: 50%; 
         cursor: pointer; 
         margin-top: -5px; /* Center thumb vertically */
       }
       input[type=range]::-moz-range-thumb {
         width: 20px; height: 20px; 
         background: #007bff; 
         border-radius: 50%; 
         cursor: pointer; 
         border: none;
       }
        input[type=range]::-ms-thumb {
            width: 20px; height: 20px; 
            background: #007bff; 
            border-radius: 50%; 
            cursor: pointer; 
            border: none;
            margin-top: 0; /* Adjust if needed */
        }

       /* Results Cards */
       .distribution-cards.results-accrued {
         display: grid;
         grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
         gap: 15px;
         margin-bottom: 25px;
       }
       .distribution-card {
         background-color: #f8f9fa;
         border: 1px solid #dee2e6;
         border-radius: 8px;
         padding: 15px; 
         text-align: center;
       }
       .distribution-card .card-label {
         font-size: 0.95em; 
         font-weight: 500;
         color: #495057;
         margin-bottom: 5px; 
       }
       .distribution-card .card-amount {
         font-size: 1.4em; 
         font-weight: bold;
         color: #0056b3; 
         margin-bottom: 3px; 
       }
        .distribution-card .card-detail {
            font-size: 0.75em;
            color: #6c757d;
        }
        .token-revenue-card.your-token-card-accrued {
          background-color: #eaf4ff;
          border: 1px solid #b8d7ff;
          border-left: 5px solid #007bff;
          border-radius: 8px;
          margin-top: 20px;
          overflow: hidden;
        }
        .token-revenue-card .card-header {
          background-color: #cce5ff;
          padding: 12px 15px;
          font-weight: 600;
          color: #004085;
          display: flex;
          align-items: center;
        }
        .token-revenue-card .card-header i {
          margin-right: 10px;
          font-size: 1.2em;
        }
        .token-revenue-card .card-body {
          padding: 15px 20px;
        }
        .token-revenue-card .revenue-amount {
          font-size: 2em;
          font-weight: bold;
          color: #28a745;
          text-align: center;
          margin-bottom: 15px;
        }
        .token-revenue-card .revenue-details {
          font-size: 0.95em;
        }
        .token-revenue-card .revenue-details .detail {
        display: flex;
        justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #cce5ff;
        }
        .token-revenue-card .revenue-details .detail:last-child {
          border-bottom: none;
        }
        .token-revenue-card .revenue-details .label {
          color: #343a40;
        }
        .token-revenue-card .revenue-details .value {
          font-weight: 600;
          color: #004085;
        }
        .error-message {
            color: #721c24; 
            font-weight: bold;
            margin-bottom: 15px;
            padding: 10px 15px;
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
        border-radius: 4px;
        }
         @media (max-width: 600px) {
            .grid-3-col, .grid-2-col {
                grid-template-columns: 1fr;
            }
             .distribution-cards.results-accrued {
                 grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); 
             }
             .distribution-card .card-amount {
                 font-size: 1.2em;
             }
         }
    `;
    document.head.appendChild(style);
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
                 errorDiv.textContent = "Ошибка при инициализации калькулятора.";
                 errorDiv.style.display = 'block';
             }
        }
    }, 250); 
    
    console.log("Revenue Calculator Initialized V3.3.");
  }

  /**
   * Test function to simulate revenue distribution and find payback points.
   * Can be run from the browser console: `new RevenueCalculator().runTestSimulation({...})`
   */
  runTestSimulation(params) {
    const { 
        initialInvestment = 100000, 
        tokenPrice = 100, 
        creatorShare = 10, 
        platformShare = 10, 
        promotionShare = 10, 
        nonPaybackPoolSharePercent = 60, 
        paybackRatio1 = 1, 
        paybackRatio2 = 2, 
        tokensToTrack = [1, 100, 1000],
        maxSalesToSimulate = MAX_SIMULATED_SALES 
    } = params;

    console.log(`--- Starting Test Simulation ---`);
    console.log(`Params: InitialInvestment=${initialInvestment}, TokenPrice=${tokenPrice}`);
    console.log(`Shares: Creator=${creatorShare}%, Platform=${platformShare}%, Promo=${promotionShare}%, NP Pool Exclusive=${nonPaybackPoolSharePercent}%`);
    console.log(`Tracking Tokens: ${tokensToTrack.join(', ')}`);
    console.log(`Simulation Limit: ${maxSalesToSimulate} sales`);

    const results = {}; // To store payback sale numbers
    
    const simulate = (paybackRatio) => {
        const calc = new RevenueCalculator({
            initialInvestment,
            creatorShare, platformShare, promotionShare,
            paybackRatio,
            nonPaybackPoolSharePercent
        });
        const numPrepayers = calc.calculateNumPrepayers(tokenPrice);
        const paybackGoal = tokenPrice * paybackRatio;
        console.log(`\nSimulating for Payback Ratio: ${paybackRatio} (Goal: ${paybackGoal})`);
        console.log(`Calculated Prepayers: ${numPrepayers}`);
        
        if (Math.max(...tokensToTrack) > maxSalesToSimulate) {
          console.warn(`Warning: Max sales to simulate (${maxSalesToSimulate}) is less than the highest tracked token number (${Math.max(...tokensToTrack)}). Results for higher tokens might be incomplete.`);
        }
        if (maxSalesToSimulate < numPrepayers) {
             console.error(`Error: Max sales (${maxSalesToSimulate}) must be >= Prepayers (${numPrepayers})`);
             return null;
        }
        
        let tokenEarnings = new Array(maxSalesToSimulate + 1).fill(0.0);
        let paybackFound = {}; // { tokenId: saleNumber }
        tokensToTrack.forEach(id => paybackFound[id] = null);
        let allTrackedFound = false;
        const nonPaybackPoolPercent = calc.nonPaybackPoolSharePercent / 100.0;
        const sharedPoolPercent = 1.0 - nonPaybackPoolPercent;

        for (let currentSaleNum = numPrepayers + 1; currentSaleNum <= maxSalesToSimulate; currentSaleNum++) {
          const saleTotalBuyersRevenue = tokenPrice * (calc.buyersShare / 100);
          const numTokensInDistribution = currentSaleNum - 1;

          if (numTokensInDistribution > 0) {
              let notPaidBackIndices = [];
              for (let i = 1; i <= numTokensInDistribution; i++) {
                  if (tokenEarnings[i] < paybackGoal) {
                      notPaidBackIndices.push(i);
                  }
              }
              const actualNotPaidBackCount = notPaidBackIndices.length;
              const exclusiveNPRevenue = saleTotalBuyersRevenue * nonPaybackPoolPercent;
              const sharedRevenue = saleTotalBuyersRevenue * sharedPoolPercent;
              const sharePerNPToken = actualNotPaidBackCount > 0 ? exclusiveNPRevenue / actualNotPaidBackCount : 0;
              const sharePerSharedToken = numTokensInDistribution > 0 ? sharedRevenue / numTokensInDistribution : 0;

              for (let i = 1; i <= numTokensInDistribution; i++) {
                  const wasPaidBackBefore = tokenEarnings[i] >= paybackGoal;
                  let increment = 0;
                  if (wasPaidBackBefore) {
                      increment = sharePerSharedToken;
                  } else {
                      increment = sharePerNPToken + sharePerSharedToken;
                  }
                  tokenEarnings[i] += increment;

                  // Check if a tracked token just achieved payback
                  if (tokensToTrack.includes(i) && !wasPaidBackBefore && tokenEarnings[i] >= paybackGoal) {
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
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
      try {
  const calculator = new RevenueCalculator();
  calculator.init();
      } catch (error) { 
          console.error("Failed to initialize Revenue Calculator:", error);
      }
  }, 300); 
}); 