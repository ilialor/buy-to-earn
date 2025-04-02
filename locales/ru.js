/**
 * Russian localization
 */
const ru = {
  // Navigation
  nav: {
    marketplace: "Маркетплейс",
    portfolio: "Моё портфолио",
    revenue: "Распределение доходов",
    docs: "Документация",
    support: "Поддержка"
  },
  
  // Auth
  auth: {
    signIn: "Вход",
    signUp: "Регистрация",
    resetPassword: "Сброс пароля",
    email: "Email",
    password: "Пароль",
    name: "Имя",
    forgotPassword: "Забыли пароль?",
    noAccount: "Нет аккаунта?",
    haveAccount: "Уже есть аккаунт?",
    signInWith: "Войти через",
    signUpWith: "Зарегистрироваться через",
    or: "или",
    enterEmail: "Введите email",
    enterPassword: "Введите пароль",
    enterName: "Введите имя",
    resetInstructions: "Укажите email для получения инструкций",
    sendInstructions: "Отправить инструкцию"
  },
  
  // Marketplace
  marketplace: {
    title: "Маркетплейс",
    subtitle: "Находите проекты, финансируйте идеи и зарабатывайте на будущих продажах.",
    explore: "Обзор",
    submit: "Создать заказ",
    executor: "Стать исполнителем",
    activeOrders: "Активные заказы",
    totalInvested: "Всего инвестировано",
    completedProducts: "Завершенные продукты",
    revenueGenerated: "Полученный доход",
    fundingProgress: "Прогресс финансирования",
    participate: "Участвовать",
    details: "Подробности"
  },
  
  // Portfolio
  portfolio: {
    title: "Моё портфолио",
    subtitle: "Отслеживайте инвестиции, собранные NFT и права собственности на продукты.",
    activeInvestments: "Активные инвестиции",
    completedProducts: "Завершенные продукты",
    totalInvested: "Всего инвестировано",
    totalReturns: "Общий доход",
    myNFTs: "Мои NFT",
    viewDetails: "Посмотреть детали",
    trackReturns: "Отслеживать доходы",
    accessProduct: "Доступ к продукту"
  },
  
  // Revenue
  revenue: {
    title: "Распределение доходов",
    subtitle: "Отслеживайте доходы от ваших инвестиций и выводите средства.",
    recentEarnings: "Недавние поступления",
    withdraw: "Вывод средств",
    availableBalance: "Доступный баланс",
    totalEarned: "Всего заработано",
    transactions: "Транзакции",
    recentTransactions: "Недавние транзакции распределения доходов",
    withdrawEarnings: "Вывод средств",
    availableToWithdraw: "Доступно для вывода",
    amountToWithdraw: "Сумма для вывода",
    walletAddress: "Адрес кошелька",
    withdrawFunds: "Вывести средства"
  },
  
  // Profile
  profile: {
    title: "Профиль",
    subtitle: "Управляйте информацией вашего аккаунта и настройками.",
    memberSince: "Участник с",
    investments: "Инвестиции",
    nfts: "NFT",
    totalEarnings: "Общий доход",
    accountSettings: "Настройки аккаунта",
    fullName: "Полное имя",
    email: "Email",
    bio: "О себе",
    updateProfile: "Обновить профиль",
    security: "Безопасность",
    currentPassword: "Текущий пароль",
    newPassword: "Новый пароль",
    confirmPassword: "Подтверждение нового пароля",
    changePassword: "Изменить пароль",
    notifications: "Уведомления",
    savePreferences: "Сохранить настройки"
  },
  
  // Wallet
  wallet: {
    title: "Кошелек",
    subtitle: "Управляйте вашими цифровыми активами и транзакциями.",
    myWallet: "Мой кошелек",
    deposit: "Пополнить",
    withdraw: "Вывести",
    transfer: "Перевести",
    transactionHistory: "История транзакций",
    connectWallet: "Подключить кошелек",
    connectExternalWallet: "Подключить внешний кошелек"
  },
  
  // Documentation
  docs: {
    title: "Документация платформы",
    subtitle: "Узнайте, как работает платформа Co-Intent и как извлечь из неё максимум пользы.",
    howItWorks: "Как это работает",
    howItWorksDescription: "Платформа Co-Intent позволяет клиентам совместно финансировать создание цифровых продуктов, получать NFT-токены владения и зарабатывать на будущих продажах. Вот как работает процесс:",
    orderSystem: "<strong>Система заказов:</strong> Клиенты размещают заказы; ИИ-ассистент группирует похожие запросы.",
    escrowPayments: "<strong>Эскроу-платежи:</strong> Предоплаты хранятся на счете эскроу.",
    executorWorkflow: "<strong>Рабочий процесс исполнителя:</strong> Исполнители принимают заказы, создают цифровые продукты (например, книги, ПО, видео) и получают поэтапные выплаты из эскроу.",
    tokenization: "<strong>Токенизация:</strong> Готовые продукты токенизируются; клиенты получают NFT с серийными номерами.",
    revenueSharing: "<strong>Распределение доходов:</strong> Выручка от будущих продаж делится (например, 10% создателю, 10% платформе, 10% на расходы, 70% покупателям — начальным и последующим — в разных пропорциях).",
    customerReturns: "<strong>Возврат инвестиций:</strong> Первоначальные клиенты возвращают свои вложения, получают продукт и зарабатывают 100% прибыли; последующие покупатели получают продукт и потенциальную компенсацию.",
    slidingIncomeWindow: "<strong>Скользящее окно доходов:</strong> Основной доход распределяется среди недавних покупателей (например, последних 5000), что позволяет большинству участников вернуть инвестиции.",
    forCustomers: "Для клиентов",
    customersDescription: "Как клиент, вы можете:",
    customersSubmit: "Размещать заказы на цифровые продукты, которые вы хотели бы видеть созданными",
    customersParticipate: "Участвовать в финансировании существующих заказов",
    customersReceiveNFTs: "Получать NFT, представляющие ваше право собственности на готовые продукты",
    customersEarn: "Зарабатывать на будущих продажах продуктов, в которые вы инвестировали",
    customersTrack: "Отслеживать ваши инвестиции и доходы через портфолио",
    forExecutors: "Для исполнителей",
    executorsDescription: "Как исполнитель, вы можете:",
    executorsBrowse: "Просматривать и принимать заказы, соответствующие вашим навыкам",
    executorsReceive: "Получать поэтапные выплаты по мере выполнения работы",
    executorsRetain: "Сохранять долю будущих доходов от создаваемых вами продуктов",
    executorsBuild: "Формировать портфолио и репутацию на платформе"
  },
  
  // Support
  support: {
    title: "Поддержка",
    subtitle: "Получите помощь и ответы на ваши вопросы о платформе Co-Intent.",
    faq: "Часто задаваемые вопросы",
    contactSupport: "Связаться с поддержкой",
    yourName: "Ваше имя",
    emailAddress: "Email адрес",
    subject: "Тема",
    message: "Сообщение",
    sendMessage: "Отправить сообщение"
  },
  
  // Common
  common: {
    loading: "Загрузка...",
    error: "Ошибка",
    success: "Успешно",
    cancel: "Отмена",
    confirm: "Подтвердить",
    close: "Закрыть",
    save: "Сохранить",
    edit: "Редактировать",
    delete: "Удалить",
    send: "Отправить",
    submit: "Отправить",
    back: "Назад",
    next: "Далее",
    yes: "Да",
    no: "Нет"
  },
  
  // Revenue Calculator
  calculator: {
    title: "Калькулятор Накопленного Дохода (Точная Симуляция)",
    initialInvestment: {
      title: "Этап 1: Первоначальные Инвестиции",
      amount: "Сумма Начальных Инвестиций",
      tokenPrice: "Цена Токена",
      prepaymentCustomers: "Расчетное Кол-во Заказчиков (Предоплата):",
      prepaymentHint: "= ОкруглениеВверх(Сумма Инвестиций / Цена Токена). Они покрывают сумму для Создателя."
    },
    distribution: {
      title: "Этап 2: Параметры Распределения (для продаж ПОСЛЕ Заказчиков)",
      creatorShare: "Доля Создателя (%)",
      platformShare: "Доля Платформы (%)",
      promotionShare: "Доля Продвижения (%)",
      buyersShare: "Доля Покупателей (%):",
      buyersShareHint: "= 100% - остальные доли. Распределяется между ВСЕМИ токенами (#1 и далее)."
    },
    payback: {
      title: "Параметры Окупаемости Покупателей",
      multiplier: "Множитель Окупаемости (X)",
      multiplierHint: "Цель: вернуть цену * X",
      nonPaybackPoolShare: "Приоритет \"Не Окупившихся\" (%)",
      nonPaybackPoolShareHint: "% от Доли покупателей, идущий только им"
    },
    calculation: {
      title: "Параметры Расчета (Общее Число Продаж)",
      totalSales: "Общее Количество Продаж (включая Заказчиков)",
      totalSalesHint1: "Минимум = Расчетное Кол-во Заказчиков",
      totalSalesHint2: "Максимум = {max} (для производительности).",
      yourTokenNumber: "Номер Вашего Токена",
      yourTokenNumberHint: "Максимум = Общее Кол-во Продаж"
    },
    results: {
      title: "Результат: Накопленный Доход",
      creator: "Создатель",
      creatorDetail: "100% начальных инвестиций + доля от продаж",
      platform: "Платформа",
      platformDetail: "Только от продаж после предоплаты",
      promotion: "Продвижение",
      buyers: "Покупатели (Распределено)",
      buyersDetail: "Доход от продаж после Заказчиков"
    },
    benefits: {
      title: "Выгодность для инвесторов",
      earlyInvestor: "Ранний инвестор",
      midInvestor: "Средний инвестор",
      lateInvestor: "Поздний инвестор",
      investmentPaysBack: "Инвестиция окупится через",
      sales: "продаж",
      at: "При",
      payback: "окупаемости"
    },
    yourToken: {
      title: "Ваш токен #",
      accruedIncome: "Накопленный доход:",
      paybackGoal: "Цель окупаемости (xX):",
      goalReached: "Достиг цели?"
    },
    overallStats: {
      title: "Общая статистика",
      totalRevenue: "Общий доход:",
      prepaidTokens: "Предоплаченных токенов:",
      tokensPaidBack: "Токенов, достигших окупаемости:"
    },
    paybackInfo: {
      title: "Информация о моменте окупаемости",
      saleNumber: "Продажа №:",
      totalRevenue: "Общий доход на момент окупаемости:",
      toCreator: "Автору:",
      toPlatform: "Платформе:"
    },
    comparison: {
      title: "Сравнение моделей распределения",
      highPriority: "Высокий приоритет неокупившихся (95%)",
      balanced: "Сбалансированный (80%)",
      equal: "Равноправный (60%)",
      highPriorityTitle: "Высокий приоритет (95%):",
      highPriorityDesc: "Ранние инвесторы окупаются очень быстро, поздние инвесторы - значительно медленнее. Создает \"волны окупаемости\".",
      balancedTitle: "Сбалансированный (80%):",
      balancedDesc: "Средняя скорость окупаемости ранних инвесторов, умеренные отличия между ранними и поздними инвесторами.",
      equalTitle: "Равноправный (60%):",
      equalDesc: "Менее выраженное преимущество ранних инвесторов. Более справедливое распределение, но медленнее окупаемость.",
      earlyTokens: "Токен #1-100:",
      midToken: "Токен #500:",
      lateToken: "Токен #1000:"
    },
    chart: {
      title: "График Окупаемости Разных Токенов"
    },
    errors: {
      calculationError: "Ошибка при расчётах. Проверьте введённые значения.",
      initError: "Ошибка при инициализации калькулятора.",
      tokenPriceError: "Цена токена должна быть > 0.",
      negativeInvestmentError: "Сумма инвестиций не может быть отрицательной.",
      sharesError: "Доли Создателя, Платформы, Продвижения должны быть 0-100% и в сумме не > 100%.",
      paybackRatioError: "Множитель Окупаемости должен быть >= 1.",
      nonPaybackPoolShareError: "Приоритет Не Окупившихся должен быть 0-100%.",
      unexpectedError: "Произошла непредвиденная ошибка при расчете."
    }
  }
};

export default ru; 