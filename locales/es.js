/**
 * Spanish localization
 */
const es = {
  // Navigation
  nav: {
    marketplace: "Mercado",
    portfolio: "Mi Portafolio",
    revenue: "Distribución de Ingresos",
    docs: "Documentación",
    support: "Soporte"
  },
  
  // Auth
  auth: {
    signIn: "Iniciar Sesión",
    signUp: "Registrarse",
    resetPassword: "Restablecer Contraseña",
    email: "Correo electrónico",
    password: "Contraseña",
    name: "Nombre",
    forgotPassword: "¿Olvidó su contraseña?",
    noAccount: "¿No tiene cuenta?",
    haveAccount: "¿Ya tiene cuenta?",
    signInWith: "Iniciar sesión con",
    signUpWith: "Registrarse con",
    or: "o",
    enterEmail: "Ingrese correo electrónico",
    enterPassword: "Ingrese contraseña",
    enterName: "Ingrese nombre",
    resetInstructions: "Ingrese su correo para recibir instrucciones de restablecimiento",
    sendInstructions: "Enviar Instrucciones"
  },
  
  // Marketplace
  marketplace: {
    title: "Mercado",
    subtitle: "Descubra y participe en proyectos, financie ideas y gane con ventas futuras.",
    explore: "Explorar",
    interestOnly: "Interesante",
    submit: "Enviar Orden",
    executor: "Convertirse en Ejecutor",
    applyExecutor: "Aplicar como Ejecutor",
    activeOrders: "Órdenes Activas",
    totalInvested: "Total Invertido",
    completedProducts: "Productos Completados",
    revenueGenerated: "Ingresos Generados",
    fundingProgress: "Progreso de Financiación",
    participate: "Participar",
    details: "Detalles",
    yourOrders: "Sus Órdenes",
    allActiveOrders: "Todas las Órdenes Activas",
    viewDetails: "Ver Detalles",
    yourOrder: "Su Orden",
    noActiveOrders: "No hay órdenes activas",
    pendingOrders: "Órdenes Pendientes"
  },
  
  // Portfolio
  portfolio: {
    title: "Mi Portafolio",
    overview: "Resumen",
    investments: "Mis Inversiones",
    revenue: "Ingresos",
    transactions: "Transacciones",
    myOrders: "Mis Pedidos",
    noOrders: "Aún no tienes ningún pedido",
    statisticsTitle: "Estadísticas",
    subtitle: "Haga seguimiento de sus inversiones, NFTs y propiedad de productos.",
    activeInvestments: "Inversiones Activas",
    completedProducts: "Productos Completados",
    totalInvested: "Total Invertido",
    totalReturns: "Retornos Totales",
    myNFTs: "Mis NFTs",
    viewDetails: "Ver Detalles",
    trackReturns: "Seguir Retornos",
    accessProduct: "Acceder al Producto"
  },
  
  // Revenue
  revenue: {
    title: "Distribución de Ingresos",
    subtitle: "Supervise los retornos de sus inversiones y retire sus ganancias.",
    recentEarnings: "Ganancias Recientes",
    withdraw: "Retirar",
    availableBalance: "Saldo Disponible",
    totalEarned: "Total Ganado",
    transactions: "Transacciones",
    recentTransactions: "Transacciones Recientes de Distribución",
    withdrawEarnings: "Retirar Ganancias",
    availableToWithdraw: "Disponible para Retirar",
    amountToWithdraw: "Cantidad a Retirar",
    walletAddress: "Dirección de Billetera",
    withdrawFunds: "Retirar Fondos"
  },
  
  // Profile
  profile: {
    title: "Perfil",
    subtitle: "Administre su información de cuenta y configuración.",
    memberSince: "Miembro desde",
    investments: "Inversiones",
    nfts: "NFTs",
    totalEarnings: "Ganancias Totales",
    accountSettings: "Configuración de Cuenta",
    fullName: "Nombre Completo",
    email: "Correo electrónico",
    bio: "Biografía",
    updateProfile: "Actualizar Perfil",
    security: "Seguridad",
    currentPassword: "Contraseña Actual",
    newPassword: "Nueva Contraseña",
    confirmPassword: "Confirmar Nueva Contraseña",
    changePassword: "Cambiar Contraseña",
    notifications: "Notificaciones",
    savePreferences: "Guardar Preferencias"
  },
  
  // Wallet
  wallet: {
    title: "Billetera",
    subtitle: "Administre sus activos digitales y transacciones.",
    myWallet: "Mi Billetera",
    deposit: "Depositar",
    withdraw: "Retirar",
    transfer: "Transferir",
    transactionHistory: "Historial de Transacciones",
    connectWallet: "Conectar Billetera",
    connectExternalWallet: "Conectar Billetera Externa",
    deposit_success: "Depositado con éxito {amount} USD",
    deposit_error: "Error al depositar fondos"
  },
  
  // Documentation
  docs: {
    title: "Documentación de la Plataforma",
    subtitle: "Aprenda cómo funciona la plataforma Co-Intent y cómo aprovecharla al máximo.",
    howItWorks: "Cómo Funciona",
    howItWorksDescription: "La plataforma Co-Intent permite a los clientes financiar conjuntamente la creación de productos digitales, recibir NFTs de propiedad y ganar ingresos de ventas futuras. Así es cómo funciona el proceso:",
    orderSystem: "Sistema de Pedidos: Los clientes envían pedidos; un asistente de IA agrupa solicitudes similares.",
    escrowPayments: "Pagos en Custodia: Los pagos anticipados se almacenan en una cuenta de custodia.",
    executorWorkflow: "Flujo de Trabajo del Ejecutor: Los ejecutores aceptan pedidos, crean productos digitales (ej. libros, software, videos) y reciben pagos por hitos desde la custodia.",
    tokenization: "Tokenización: Los productos completados son tokenizados; los clientes reciben NFTs con números de serie.",
    revenueSharing: "Distribución de Ingresos: Los ingresos de ventas futuras se dividen (ej. 10% al creador, 10% a la plataforma, 10% a costos, 70% a compradores—iniciales y posteriores—en proporciones variables).",
    customerReturns: "Retornos del Cliente: Los clientes iniciales recuperan su inversión, reciben el producto y ganan 100% de beneficio; los compradores posteriores obtienen el producto y posible compensación.",
    slidingIncomeWindow: "Ventana Móvil de Ingresos: El ingreso principal se distribuye entre compradores recientes (ej. últimos 5,000), asegurando que la mayoría de participantes puedan recuperar inversiones.",
    forCustomers: "Para Clientes",
    customersDescription: "Como cliente, usted puede:",
    customersSubmit: "Enviar pedidos para productos digitales que le gustaría ver creados",
    customersParticipate: "Participar en la financiación de pedidos existentes",
    customersReceiveNFTs: "Recibir NFTs que representan su propiedad de productos completados",
    customersEarn: "Ganar ingresos de ventas futuras de productos en los que ha invertido",
    customersTrack: "Seguir sus inversiones y ganancias a través de su portafolio",
    forExecutors: "Para Ejecutores",
    executorsDescription: "Como ejecutor, usted puede:",
    executorsBrowse: "Explorar y aceptar pedidos que coincidan con sus habilidades",
    executorsReceive: "Recibir pagos basados en hitos a medida que completa el trabajo",
    executorsRetain: "Retener una parte de los ingresos futuros de los productos que crea",
    executorsBuild: "Construir un portafolio y reputación en la plataforma",
    // Ecosistema Ateira
    ecosystem: "Ecosistema Ateira",
    ecosystemDescription: "Ateira es un ecosistema unificado de proyectos, que incluye Co-Intent y otras plataformas interconectadas:",
    ecosystemNoosits: " un juego con un compañero de IA donde los usuarios pueden desarrollar su asistente digital.",
    ecosystemLoreland: " una plataforma para aprender a través del juego, permitiendo la adquisición de conocimientos de forma interactiva.",
    ecosystemCoIntent: " una plataforma de economía cooperativa donde los usuarios financian conjuntamente y se benefician de productos digitales.",
    ecosystemIntegration: "Interconexión entre proyectos",
    ecosystemIntegrationDescription: "Todos los proyectos del ecosistema Ateira están conectados, permitiendo la transferencia de valor y capacidades entre plataformas. Los usuarios pueden utilizar logros y habilidades obtenidos en un proyecto en otros proyectos del ecosistema.",
    ecosystemBenefits: "Beneficios del ecosistema",
    ecosystemBenefitsDescription: "La participación en el ecosistema Ateira proporciona a los usuarios mayores oportunidades para aprender, ganar y desarrollarse, así como acceso a tecnologías innovadoras y una comunidad de personas afines.",
    escrowSystem: "Procesamiento seguro de pagos y liberación de fondos basada en hitos.",
    nftTokenization: "Conversión de productos digitales en tokens de propiedad con derechos de ingresos.",
    revenueDistribution: "Sistema automatizado para compartir los ingresos de ventas entre las partes interesadas.",
    marketplace: "Donde los productos completados se venden a nuevos clientes, generando ingresos.",
    // Asistente de IA Ailock
    ailock: "Asistente de IA Ailock",
    ailockDescription: "Ailock es un compañero de IA en evolución que se desarrolla en un entorno de juego y se convierte en un asistente digital real para el usuario.",
    ailockStatus: "Estado actual de desarrollo",
    ailockStatusDescription: "El desarrollo activo del MVP está en marcha con la implementación de funciones clave: generación de contenido, establecimiento y seguimiento de tareas, búsqueda inteligente, comunicación y aprendizaje.",
    ailockTechnology: "Tecnología",
    ailockTechnologyDescription: "Ailock utiliza tecnologías de inteligencia artificial de vanguardia (SotA) y proporciona almacenamiento de datos local y en cadena para máxima privacidad y seguridad.",
    ailockBenefits: "Beneficios para los usuarios",
    ailockBenefitsDescription: "Ailock garantiza un alto nivel de privacidad, interacción personalizada e integración con la plataforma Co-Intent, ampliando las capacidades de los usuarios en la economía cooperativa.",
    ailockUseCases: "Casos de uso",
    ailockUseCasesDescription: "Los usuarios pueden entrenar a Ailock en el juego Noosits y luego usar sus habilidades para automatizar tareas en Co-Intent, encontrar proyectos relevantes y comunicarse con otros participantes del ecosistema."
  },
  
  // Support
  support: {
    title: "Soporte",
    subtitle: "Obtenga ayuda y respuestas a sus preguntas sobre la plataforma Co-Intent.",
    faq: "Preguntas Frecuentes",
    contactSupport: "Contactar Soporte",
    yourName: "Su Nombre",
    emailAddress: "Correo Electrónico",
    subject: "Asunto",
    message: "Mensaje",
    sendMessage: "Enviar Mensaje",
    // FAQ preguntas y respuestas
    faq_what_is_cointent_q: "¿Qué es Co-Intent?",
    faq_what_is_cointent_a: "Co-Intent es una plataforma que permite la financiación colaborativa de productos digitales. Los usuarios pueden enviar o financiar ideas de productos, mientras que los ejecutores crean estos productos. Una vez completados, los productos se tokenizan como NFT, y los ingresos de ventas futuras se comparten entre todos los participantes.",
    faq_how_earn_q: "¿Cómo gano con mis inversiones?",
    faq_how_earn_a: "Cuando inviertes en un producto, recibes un NFT que representa tu propiedad. A medida que el producto se vende a nuevos clientes, recibes una parte de los ingresos. El modelo de distribución de ingresos asigna el 70% de las ventas a los titulares de NFT, y el resto se divide entre creadores y la plataforma.",
    faq_products_types_q: "¿Qué tipos de productos se pueden crear?",
    faq_products_types_a: "La plataforma admite varios productos digitales, incluidos libros, software, cursos en línea, trabajos de investigación, diseños y más. Cualquier producto digital que pueda ser tokenizado y distribuido es elegible.",
    faq_become_executor_q: "¿Cómo me convierto en ejecutor?",
    faq_become_executor_a: "Para convertirte en ejecutor, debes aplicar a través de la sección \"Convertirse en Ejecutor\". Se te pedirá que proporciones detalles sobre tus habilidades, experiencia y los tipos de proyectos que puedes ejecutar. Una vez aprobado, puedes comenzar a aceptar pedidos."
  },
  
  // Common
  common: {
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    cancel: "Cancelar",
    confirm: "Confirmar",
    close: "Cerrar",
    save: "Guardar",
    edit: "Editar",
    delete: "Eliminar",
    send: "Enviar",
    submit: "Enviar",
    back: "Atrás",
    next: "Siguiente",
    yes: "Sí",
    no: "No"
  },
  
  // Escrow
  escrow: {
    createGroupOrder: 'Crear Orden Grupal',
    depositFunds: 'Depositar Fondos',
    participateInOrder: 'Participar en Orden',
    votingForRepresentative: 'Votar por Representante',
    milestones: 'Hitos',
    addMilestone: 'Añadir Hito',
    selectContractor: 'Seleccionar Contratista (Opcional)',
    orderTitle: 'Título de la Orden',
    orderDescription: 'Descripción de la Orden',
    totalCost: 'Costo Total',
    currentFunding: 'Financiación Actual',
    contributionAmount: 'Monto de Contribución',
    required_fields: 'Por favor, complete todos los campos requeridos',
    invalid_amount: 'Monto no válido',
    order_created: 'Orden creada con éxito',
    error_creating: 'Error al crear la orden',
    error_exception: 'Excepción al crear la orden',
    user_not_found: 'Usuario no encontrado en el sistema'
  },
  
  // Order
  order: {
    createTitle: "Crear Orden Grupal",
    title: "Título de la Orden",
    titlePlaceholder: "Ingrese un título descriptivo",
    description: "Descripción",
    descriptionPlaceholder: "Describa lo que desea crear",
    selectContractor: "Seleccionar Contratista (Opcional)",
    selectContractorPlaceholder: "-- Seleccione un contratista --",
    milestones: "Hitos",
    milestonesHelp: "Defina las etapas de su proyecto y sus costos",
    addMilestone: "Añadir Hito",
    createOrder: "Crear Orden",
    cancel: "Cancelar",
    max_milestones: "El número máximo de hitos es 10",
    milestone_description: "Descripción del Hito",
    amount: "Monto",
    add_milestone: "Por favor, añada al menos un hito",
    invalid_milestone_data: "Los datos del hito no son válidos",
    enter_valid_amount: "El monto del hito debe ser positivo",
    joined_success: "Se unió con éxito a la orden",
    join_error: "Error al unirse a la orden"
  },
  
  // Revenue Calculator
  calculator: {
    title: "Calculadora de Ingresos Acumulados (Simulación Precisa)",
    initialInvestment: {
      title: "Paso 1: Inversión Inicial",
      amount: "Cantidad de Inversión Inicial",
      tokenPrice: "Precio del Token",
      prepaymentCustomers: "Número Estimado de Prepagadores:",
      prepaymentHint: "= Techo(Cantidad de Inversión / Precio del Token). Cubren el pago del Creador."
    },
    distribution: {
      title: "Paso 2: Parámetros de Distribución (para ventas DESPUÉS de los Prepagadores)",
      creatorShare: "Participación del Creador (%)",
      platformShare: "Participación de la Plataforma (%)",
      promotionShare: "Participación para Promoción (%)",
      buyersShare: "Participación de Compradores (%):",
      buyersShareHint: "= 100% - otras participaciones. Distribuido entre TODOS los tokens (#1 y siguientes)."
    },
    payback: {
      title: "Parámetros de Recuperación del Comprador",
      multiplier: "Multiplicador de Recuperación (X)",
      multiplierHint: "Meta: devolver precio * X",
      nonPaybackPoolShare: "Prioridad de No-Recuperados (%)",
      nonPaybackPoolShareHint: "% de la participación de Compradores destinado solo a ellos"
    },
    calculation: {
      title: "Parámetros de Cálculo (Número Total de Ventas)",
      totalSales: "Número Total de Ventas (incluyendo Prepagadores)",
      totalSalesHint1: "Mínimo = Número Estimado de Prepagadores",
      totalSalesHint2: "Máximo = {max} (por rendimiento).",
      yourTokenNumber: "Número de Su Token",
      yourTokenNumberHint: "Máximo = Número Total de Ventas"
    },
    results: {
      title: "Resultado: Ingresos Acumulados",
      creator: "Creador",
      creatorDetail: "100% de inversión inicial + participación de ventas",
      platform: "Plataforma",
      platformDetail: "Solo de ventas después del prepago",
      promotion: "Promoción",
      buyers: "Compradores (Distribuido)",
      buyersDetail: "Ingresos de ventas después de Prepagadores"
    },
    benefits: {
      title: "Beneficios para Inversores",
      earlyInvestor: "Inversor Temprano",
      midInvestor: "Inversor Medio",
      lateInvestor: "Inversor Tardío",
      investmentPaysBack: "La inversión se recuperará después de",
      sales: "ventas",
      at: "Con",
      payback: "recuperación"
    },
    yourToken: {
      title: "Su token #",
      accruedIncome: "Ingresos acumulados:",
      paybackGoal: "Meta de recuperación (X):",
      goalReached: "¿Meta alcanzada?"
    },
    overallStats: {
      title: "Estadísticas Generales",
      totalRevenue: "Ingresos totales:",
      prepaidTokens: "Tokens prepagados:",
      tokensPaidBack: "Tokens que alcanzaron recuperación:"
    },
    paybackInfo: {
      title: "Información del Momento de Recuperación",
      saleNumber: "Venta #:",
      totalRevenue: "Ingresos totales en el momento de recuperación:",
      toCreator: "Al Creador:",
      toPlatform: "A la Plataforma:"
    },
    comparison: {
      title: "Comparación de Modelos de Distribución",
      highPriority: "Alta Prioridad para No-Recuperados (95%)",
      balanced: "Equilibrado (80%)",
      equal: "Igualitario (60%)",
      highPriorityTitle: "Alta Prioridad (95%):",
      highPriorityDesc: "Los inversores tempranos recuperan muy rápidamente, los tardíos mucho más lento. Crea 'olas de recuperación'.",
      balancedTitle: "Equilibrado (80%):",
      balancedDesc: "Velocidad media de recuperación para inversores tempranos, diferencias moderadas entre inversores tempranos y tardíos.",
      equalTitle: "Igualitario (60%):",
      equalDesc: "Ventaja menos pronunciada para inversores tempranos. Distribución más justa, pero recuperación más lenta.",
      earlyTokens: "Token #1-100:",
      midToken: "Token #500:",
      lateToken: "Token #1000:"
    },
    chart: {
      title: "Gráfico de Recuperación para Diferentes Tokens"
    },
    errors: {
      calculationError: "Error de cálculo. Por favor, verifique sus valores de entrada.",
      initError: "Error al inicializar la calculadora.",
      tokenPriceError: "El precio del token debe ser > 0.",
      negativeInvestmentError: "La cantidad de inversión no puede ser negativa.",
      sharesError: "Las participaciones del Creador, Plataforma y Promoción deben ser 0-100% y sumar <= 100%.",
      paybackRatioError: "El Multiplicador de Recuperación debe ser >= 1.",
      nonPaybackPoolShareError: "La Prioridad de No-Recuperados debe ser 0-100%.",
      unexpectedError: "Ocurrió un error inesperado durante el cálculo."
    }
  }
};

export default es;