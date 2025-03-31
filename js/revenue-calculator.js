/**
 * Калькулятор распределения доходов от токенов
 * TODO: добавить конструктор с параметрами комиссии и процентов
 */

class RevenueCalculator {
  constructor(params = {}) {
    // Default values
    this.PLATFORM_FEE = params.platformFee || 10;
    this.TIER_1_END = params.tier1End || 1000;
    this.TIER_2_END = params.tier2End || 3000;
    this.TIER_3_START = params.tier3Start || 10000;
    this.TIER_1_SHARE = params.tier1Share || 80;
    this.TIER_2_SHARE = params.tier2Share || 50;
    this.TIER_3_SHARE = params.tier3Share || 10;
    // Параметры скользящего окна
    this.WINDOW_SIZE = params.windowSize || 5000;
    this.WINDOW_FACTOR = params.windowFactor || 1.5;
    this.MIN_WEIGHT = params.minWeight || 0.1;
  }

  // Расчет доли издателя в зависимости от количества транзакций
  calculateIssuerShare(transactions) {
    if (transactions <= this.TIER_1_END) {
      return this.TIER_1_SHARE / 100;
    } else if (transactions <= this.TIER_2_END) {
      return this.TIER_2_SHARE / 100;
    } else if (transactions >= this.TIER_3_START) {
      return this.TIER_3_SHARE / 100;
    } else {
      const progress = (transactions - this.TIER_2_END) / (this.TIER_3_START - this.TIER_2_END);
      return (this.TIER_2_SHARE - (this.TIER_2_SHARE - this.TIER_3_SHARE) * progress) / 100;
    }
  }

  // Расчет веса токена в зависимости от его положения в скользящем окне
  calculateTokenWeight(tokenNumber, numTransactions) {
    // Если токен вне окна (старые токены)
    if (tokenNumber < numTransactions - this.WINDOW_SIZE) {
      return this.MIN_WEIGHT;
    }
    
    // Вычисляем вес для токенов в скользящем окне
    const position = numTransactions - tokenNumber + 1;
    const weight = this.WINDOW_FACTOR * (position / this.WINDOW_SIZE);
    
    // Максимальный вес не должен превышать 1
    return Math.min(weight, 1);
  }

  // Расчет распределения доходов
  calculateDistribution(tokenPrice, numTransactions, tokenNumber) {
    const platformShare = this.PLATFORM_FEE / 100;
    let totalRevenue = 0;
    let issuerRevenue = 0;
    let platformRevenue = 0;
    let individualTokenRevenue = 0;
    let totalTokenWeights = 0;
    
    // Сначала рассчитываем сумму весов всех токенов
    for (let i = 1; i <= numTransactions; i++) {
      totalTokenWeights += this.calculateTokenWeight(i, numTransactions);
    }
    
    // Расчет дохода для каждой транзакции
    for (let i = 1; i <= numTransactions; i++) {
      const currentSaleRevenue = tokenPrice;
      const currentIssuerShare = this.calculateIssuerShare(i);
      
      totalRevenue += currentSaleRevenue;
      const currentIssuerRevenue = currentSaleRevenue * currentIssuerShare;
      const currentPlatformRevenue = currentSaleRevenue * platformShare;
      const currentHoldersRevenue = currentSaleRevenue - currentIssuerRevenue - currentPlatformRevenue;
      
      issuerRevenue += currentIssuerRevenue;
      platformRevenue += currentPlatformRevenue;
      
      // Если эта транзакция после нашего номера токена, мы получаем долю
      if (i > tokenNumber) {
        // Вес нашего токена определяет его долю в распределении
        const tokenWeight = this.calculateTokenWeight(tokenNumber, i);
        individualTokenRevenue += (currentHoldersRevenue * tokenWeight) / totalTokenWeights;
      }
    }

    const currentIssuerShare = this.calculateIssuerShare(numTransactions);
    const holdersShare = 1 - currentIssuerShare - platformShare;
    const tokenWeight = this.calculateTokenWeight(tokenNumber, numTransactions);

    return {
      issuerShare: (currentIssuerShare * 100).toFixed(1),
      platformShare: this.PLATFORM_FEE,
      holdersShare: (holdersShare * 100).toFixed(1),
      totalRevenue: totalRevenue.toFixed(2),
      issuerRevenue: issuerRevenue.toFixed(2),
      platformRevenue: platformRevenue.toFixed(2),
      individualRevenue: individualTokenRevenue.toFixed(2),
      tokenWeight: tokenWeight.toFixed(2)
    };
  }

  // Создание HTML калькулятора
  createCalculator() {
    const calculatorHTML = `
      <div class="calculator-container card">
        <div class="card-header">
          <h3 class="card-title">Калькулятор распределения доходов</h3>
        </div>
        <div class="card-body">
          <div class="settings-section">
            <h4>Параметры распределения</h4>
            <div class="form-group">
              <label for="platform-fee">Комиссия платформы (%)</label>
              <input type="number" id="platform-fee" value="${this.PLATFORM_FEE}" min="0" max="100" step="0.1">
            </div>
            <div class="distribution-tiers">
              <div class="tier">
                <h5>Уровень 1 (до ${this.TIER_1_END} транзакций)</h5>
                <input type="number" id="tier-1-share" value="${this.TIER_1_SHARE}" min="0" max="100" step="1">
                <span class="percent">%</span>
              </div>
              <div class="tier">
                <h5>Уровень 2 (${this.TIER_1_END + 1}-${this.TIER_2_END} транзакций)</h5>
                <input type="number" id="tier-2-share" value="${this.TIER_2_SHARE}" min="0" max="100" step="1">
                <span class="percent">%</span>
              </div>
              <div class="tier">
                <h5>Уровень 3 (${this.TIER_3_START}+ транзакций)</h5>
                <input type="number" id="tier-3-share" value="${this.TIER_3_SHARE}" min="0" max="100" step="1">
                <span class="percent">%</span>
              </div>
            </div>
            
            <div class="sliding-window-section">
              <h4>Параметры скользящего окна</h4>
              <div class="form-group">
                <label for="window-size">Размер окна (кол-во токенов)</label>
                <input type="number" id="window-size" value="${this.WINDOW_SIZE}" min="1000" max="100000" step="1000">
                <div class="form-hint">Последние N токенов получают увеличенную долю</div>
              </div>
              <div class="form-group">
                <label for="window-factor">Коэффициент усиления</label>
                <input type="number" id="window-factor" value="${this.WINDOW_FACTOR}" min="1" max="5" step="0.1">
                <div class="form-hint">Насколько увеличивается вес последних токенов</div>
              </div>
              <div class="form-group">
                <label for="min-weight">Минимальный вес</label>
                <input type="number" id="min-weight" value="${this.MIN_WEIGHT}" min="0.01" max="1" step="0.01">
                <div class="form-hint">Доля для ранних токенов вне окна</div>
              </div>
            </div>
          </div>

          <div class="calculation-section">
            <h4>Параметры расчета</h4>
            <div class="form-group">
              <label for="token-price">Цена токена (RUB)</label>
              <input type="number" id="token-price" value="200" min="1">
            </div>
            <div class="form-group">
              <label for="num-transactions">Количество транзакций</label>
              <input type="number" id="num-transactions" value="2000" min="1">
            </div>
            <div class="form-group">
              <label for="token-number">Номер вашего токена</label>
              <input type="number" id="token-number" value="100" min="1">
            </div>
          </div>

          <div class="results-section">
            <h4>Текущее распределение</h4>
            <div class="distribution-cards">
              <div class="distribution-card issuer">
                <div class="card-icon"><i class="fas fa-user-tie"></i></div>
                <div class="card-value" id="issuer-share">80%</div>
                <div class="card-label">Доля издателя</div>
                <div class="card-amount" id="issuer-revenue">0 RUB</div>
              </div>
              
              <div class="distribution-card platform">
                <div class="card-icon"><i class="fas fa-building"></i></div>
                <div class="card-value" id="platform-share">2.5%</div>
                <div class="card-label">Комиссия платформы</div>
                <div class="card-amount" id="platform-revenue">0 RUB</div>
              </div>
              
              <div class="distribution-card holders">
                <div class="card-icon"><i class="fas fa-users"></i></div>
                <div class="card-value" id="holders-share">17.5%</div>
                <div class="card-label">Доля держателей</div>
                <div class="card-amount" id="total-revenue">0 RUB</div>
              </div>
            </div>

            <div class="token-revenue-card">
              <div class="card-header">
                <i class="fas fa-coins"></i>
                <h5>Доход токена #<span id="token-number-display">100</span></h5>
              </div>
              <div class="card-body">
                <div class="revenue-amount" id="token-revenue">0 RUB</div>
                <div class="revenue-details">
                  <div class="detail">
                    <span class="label">Общий оборот:</span>
                    <span class="value" id="total-turnover">0 RUB</span>
                  </div>
                  <div class="detail">
                    <span class="label">Вес токена:</span>
                    <span class="value" id="token-weight">0</span>
                  </div>
                  <div class="detail">
                    <span class="label">Доля в обороте:</span>
                    <span class="value" id="token-share">0%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="sliding-window-visualization">
              <h5>Визуализация скользящего окна</h5>
              <div class="window-visualization-container" id="window-visualization"></div>
              <div class="window-labels">
                <div class="window-label">Ранние токены</div>
                <div class="window-label">Окно повышенной доходности</div>
                <div class="window-label">Ваш токен</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    return calculatorHTML;
  }

  updateCalculations() {
    // Update calculator parameters
    this.PLATFORM_FEE = parseFloat(document.getElementById('platform-fee').value);
    this.TIER_1_SHARE = parseFloat(document.getElementById('tier-1-share').value);
    this.TIER_2_SHARE = parseFloat(document.getElementById('tier-2-share').value);
    this.TIER_3_SHARE = parseFloat(document.getElementById('tier-3-share').value);
    // Обновляем параметры скользящего окна
    this.WINDOW_SIZE = parseInt(document.getElementById('window-size').value);
    this.WINDOW_FACTOR = parseFloat(document.getElementById('window-factor').value);
    this.MIN_WEIGHT = parseFloat(document.getElementById('min-weight').value);

    const tokenPrice = parseFloat(document.getElementById('token-price').value);
    const numTransactions = parseInt(document.getElementById('num-transactions').value);
    const tokenNumber = parseInt(document.getElementById('token-number').value);

    const distribution = this.calculateDistribution(tokenPrice, numTransactions, tokenNumber);

    // Update distribution shares and amounts
    document.getElementById('issuer-share').textContent = distribution.issuerShare + '%';
    document.getElementById('platform-share').textContent = distribution.platformShare + '%';
    document.getElementById('holders-share').textContent = distribution.holdersShare + '%';

    document.getElementById('issuer-revenue').textContent = formatCurrency(distribution.issuerRevenue);
    document.getElementById('platform-revenue').textContent = formatCurrency(distribution.platformRevenue);
    document.getElementById('total-revenue').textContent = formatCurrency(distribution.totalRevenue);
    document.getElementById('token-revenue').textContent = formatCurrency(distribution.individualRevenue);
    
    document.getElementById('token-number-display').textContent = tokenNumber;
    document.getElementById('total-turnover').textContent = formatCurrency(distribution.totalRevenue);
    document.getElementById('token-weight').textContent = distribution.tokenWeight;
    document.getElementById('token-share').textContent = 
      ((distribution.individualRevenue / distribution.totalRevenue) * 100).toFixed(2) + '%';
    
    // Обновляем визуализацию скользящего окна
    this.updateWindowVisualization(numTransactions, tokenNumber);
  }
  
  // Визуализация скользящего окна
  updateWindowVisualization(numTransactions, tokenNumber) {
    const container = document.getElementById('window-visualization');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Создаем элементы для визуализации
    const totalBars = 30; // Количество полосок для отображения
    const windowStart = Math.max(1, numTransactions - this.WINDOW_SIZE);
    
    for (let i = 0; i < totalBars; i++) {
      const position = Math.floor(1 + (i / totalBars) * numTransactions);
      const bar = document.createElement('div');
      bar.className = 'window-bar';
      
      // Определяем высоту бара в зависимости от веса токена
      const weight = this.calculateTokenWeight(position, numTransactions);
      bar.style.height = (weight * 100) + '%';
      
      // Определяем цвет бара в зависимости от положения
      if (position === tokenNumber) {
        bar.classList.add('your-token');
        bar.setAttribute('title', `Ваш токен #${position}, вес: ${weight.toFixed(2)}`);
      } else if (position >= windowStart) {
        bar.classList.add('in-window');
        bar.setAttribute('title', `Токен #${position}, вес: ${weight.toFixed(2)}`);
      } else {
        bar.classList.add('out-window');
        bar.setAttribute('title', `Токен #${position}, вес: ${weight.toFixed(2)}`);
      }
      
      container.appendChild(bar);
    }
  }

  init() {
    // Add calculator to Revenue Share and Documentation pages
    const revenueContent = document.querySelector('#revenue .content-area.active');
    const docsContent = document.querySelector('#docs .card');

    if (revenueContent) {
      revenueContent.insertAdjacentHTML('afterbegin', this.createCalculator());
    }

    if (docsContent) {
      docsContent.insertAdjacentHTML('beforeend', this.createCalculator());
    }

    // Add event listeners to all inputs
    const inputs = [
      'platform-fee', 'tier-1-share', 'tier-2-share', 'tier-3-share',
      'window-size', 'window-factor', 'min-weight',
      'token-price', 'num-transactions', 'token-number'
    ];

    inputs.forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('input', () => this.updateCalculations());
      }
    });

    // Initial calculation
    this.updateCalculations();
    
    // Добавляем стили для скользящего окна
    this.addSlidingWindowStyles();
  }
  
  // Добавляем CSS стили для элементов скользящего окна
  addSlidingWindowStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .sliding-window-section {
        margin-top: 20px;
        padding: 15px;
        background-color: rgba(0,0,0,0.03);
        border-radius: 8px;
      }
      
      .form-hint {
        font-size: 0.8rem;
        color: #666;
        margin-top: 2px;
      }
      
      .sliding-window-visualization {
        margin-top: 20px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 15px;
        background-color: #f9f9f9;
      }
      
      .window-visualization-container {
        display: flex;
        height: 150px;
        align-items: flex-end;
        padding: 10px 0;
        border-bottom: 1px solid #ddd;
      }
      
      .window-bar {
        flex: 1;
        margin: 0 1px;
        border-radius: 3px 3px 0 0;
        background-color: #ccc;
        transition: height 0.3s ease;
      }
      
      .window-bar.out-window {
        background-color: #b0bec5;
      }
      
      .window-bar.in-window {
        background-color: #4fc3f7;
      }
      
      .window-bar.your-token {
        background-color: #f44336;
        border: 2px solid #d32f2f;
      }
      
      .window-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        font-size: 0.85rem;
        color: #555;
      }
      
      .window-label {
        padding: 2px 8px;
        border-radius: 4px;
      }
    `;
    
    document.head.appendChild(style);
  }
}

// Helper function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(amount);
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const calculator = new RevenueCalculator();
  calculator.init();
}); 