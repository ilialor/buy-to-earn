/**
 * English localization
 */
const en = {
  // Navigation
  nav: {
    marketplace: "Marketplace",
    portfolio: "My Portfolio",
    revenue: "Revenue Sharing",
    docs: "Documentation",
    support: "Support",
    home: "Ailock"
  },
  
  // Auth
  auth: {
    signIn: "Sign In",
    signUp: "Sign Up",
    resetPassword: "Reset Password",
    email: "Email",
    password: "Password",
    name: "Name",
    forgotPassword: "Forgot password?",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    signInWith: "Sign in with",
    signUpWith: "Sign up with",
    or: "or",
    enterEmail: "Enter email",
    enterPassword: "Enter password",
    enterName: "Enter name",
    resetInstructions: "Enter your email to receive reset instructions",
    sendInstructions: "Send Instructions",
    serviceUnavailable: "Authentication service is unavailable",
    signingIn: "Signing in...",
    registering: "Registering...",
    emptyCredentials: "Please enter email and password",
    fillAllFields: "Please fill all fields",
    loginError: "Login error",
    registerError: "Registration error",
    authRequired: "Authentication required",
    logout: "Logout",
    profile: "Profile",
    wallet: "Wallet",
    portfolio: "Portfolio"
  },
  
  // Marketplace
  marketplace: {
    title: "Marketplace",
    subtitle: "Discover and participate in co-intent projects, fund ideas, and earn from future sales.",
    explore: "Explore",
    submit: "Submit Order",
    executor: "Become Executor",
    applyExecutor: "Apply as Executor",
    activeOrders: "Active Orders",
    totalInvested: "Total Invested",
    completedProducts: "Completed Products",
    revenueGenerated: "Revenue Generated",
    fundingProgress: "Funding Progress",
    participate: "Participate",
    details: "Details",
    yourOrders: "Your Orders",
    allActiveOrders: "All Active Orders",
    viewDetails: "View Details",
    yourOrder: "Your Order",
    noActiveOrders: "No active orders",
    pendingOrders: "Pending Orders"
  },
  
  // Portfolio
  portfolio: {
    title: "My Portfolio",
    overview: "Overview",
    investments: "My Investments",
    revenue: "Revenue",
    transactions: "Transactions",
    myOrders: "My Orders",
    noOrders: "You don't have any orders yet",
    statisticsTitle: "Statistics",
    subtitle: "Track your investments, collected NFTs, and product ownership.",
    activeInvestments: "Active Investments",
    completedProducts: "Completed Products",
    totalInvested: "Total Invested",
    totalReturns: "Total Returns",
    myNFTs: "My NFTs",
    trackReturns: "Track Returns",
    accessProduct: "Access Product"
  },
  
  // Revenue
  revenue: {
    title: "Revenue Sharing",
    subtitle: "Monitor the returns from your product investments and withdraw your earnings.",
    recentEarnings: "Recent Earnings",
    withdraw: "Withdraw",
    availableBalance: "Available Balance",
    totalEarned: "Total Earned",
    transactions: "Transactions",
    recentTransactions: "Recent Revenue Share Transactions",
    withdrawEarnings: "Withdraw Earnings",
    availableToWithdraw: "Available to Withdraw",
    amountToWithdraw: "Amount to Withdraw",
    walletAddress: "Wallet Address",
    withdrawFunds: "Withdraw Funds"
  },
  
  // Profile
  profile: {
    title: "Profile",
    subtitle: "Manage your account information and settings.",
    memberSince: "Member since",
    investments: "Investments",
    nfts: "NFTs",
    totalEarnings: "Total Earnings",
    accountSettings: "Account Settings",
    fullName: "Full Name",
    email: "Email",
    bio: "Bio",
    updateProfile: "Update Profile",
    security: "Security",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    changePassword: "Change Password",
    notifications: "Notifications",
    savePreferences: "Save Preferences"
  },
  
  // Wallet
  wallet: {
    title: "Wallet",
    subtitle: "Manage your digital assets and transactions.",
    myWallet: "My Wallet",
    deposit: "Deposit",
    withdraw: "Withdraw",
    transfer: "Transfer",
    transactionHistory: "Transaction History",
    connectWallet: "Connect Wallet",
    connectExternalWallet: "Connect External Wallet",
    deposit_success: "Successfully deposited {amount} USD",
    deposit_error: "Error depositing funds"
  },
  
  // Documentation
  docs: {
    title: "Platform Documentation",
    subtitle: "Learn how the Co-Intent platform works and how to make the most of it.",
    howItWorks: "How It Works",
    howItWorksDescription: "The Co-Intent platform allows customers to jointly fund the creation of digital products, receive ownership NFTs, and earn from future sales revenue. Here's how the process works:",
    orderSystem: "Order System: Customers submit orders; an AI assistant groups similar requests.",
    escrowPayments: "Escrow Payments: Prepayments are stored in an escrow account.",
    executorWorkflow: "Executor Workflow: Executors accept orders, create digital products (e.g., books, software, videos), and receive milestone-based payments from escrow.",
    tokenization: "Tokenization: Completed products are tokenized; customers receive NFTs with serial numbers.",
    revenueSharing: "Revenue Sharing: Future sales revenues are split (e.g., 10% to creator, 10% to platform, 10% to costs, 70% to buyers—initial and subsequent—in varying proportions).",
    customerReturns: "Customer Returns: Initial customers recover their investment, receive the product, and earn 100% profit; subsequent buyers get the product and potential compensation.",
    slidingIncomeWindow: "Sliding Income Window: Main revenue is distributed among recent buyers (e.g., last 5,000), ensuring most participants can recoup investments.",
    forCustomers: "For Customers",
    customersDescription: "As a customer, you can:",
    customersSubmit: "Submit orders for digital products you'd like to see created",
    customersParticipate: "Participate in funding existing orders",
    customersReceiveNFTs: "Receive NFTs representing your ownership of completed products",
    customersEarn: "Earn revenue from future sales of products you've invested in",
    customersTrack: "Track your investments and earnings through your portfolio",
    forExecutors: "For Executors",
    executorsDescription: "As an executor, you can:",
    executorsBrowse: "Browse and accept orders that match your skills",
    executorsReceive: "Receive milestone-based payments as you complete work",
    executorsRetain: "Retain a share of future revenue from products you create",
    executorsBuild: "Build a portfolio and reputation on the platform",
    // Ateira Ecosystem
    ecosystem: "Ateira Ecosystem",
    ecosystemDescription: "Ateira is a unified ecosystem of projects, including Co-Intent and other interconnected platforms:",
    ecosystemNoosits: " a game with an AI companion where users can develop their digital assistant.",
    ecosystemLoreland: " a platform for learning through gaming, allowing knowledge acquisition in an interactive form.",
    ecosystemCoIntent: " a cooperative economy platform where users jointly fund and benefit from digital products.",
    ecosystemIntegration: "Interconnection between projects",
    ecosystemIntegrationDescription: "All projects in the Ateira ecosystem are connected, enabling the transfer of value and capabilities between platforms. Users can utilize achievements and skills gained in one project across other projects in the ecosystem.",
    ecosystemBenefits: "Ecosystem benefits",
    ecosystemBenefitsDescription: "Participation in the Ateira ecosystem provides users with enhanced opportunities for learning, earning, and development, as well as access to innovative technologies and a community of like-minded individuals.",
    escrowSystem: "Secure payment processing and milestone-based fund release.",
    nftTokenization: "Converting digital products into ownership tokens with revenue rights.",
    revenueDistribution: "Automated system for sharing sales proceeds among stakeholders.",
    marketplace: "Where completed products are sold to new customers, generating revenue.",
    // AI Assistant Ailock
    ailock: "AI Assistant Ailock",
    ailockDescription: "Ailock is an evolving AI companion that develops in a gaming environment and becomes a real digital assistant for the user.",
    ailockStatus: "Current development status",
    ailockStatusDescription: "Active development of the MVP is underway with implementation of key functions: content generation, task setting and tracking, intelligent search, communication, and learning.",
    ailockTechnology: "Technology",
    ailockTechnologyDescription: "Ailock uses state-of-the-art artificial intelligence technologies and provides local and on-chain data storage for maximum privacy and security.",
    ailockBenefits: "Benefits for users",
    ailockBenefitsDescription: "Ailock ensures a high level of privacy, personalized interaction, and integration with the Co-Intent platform, expanding user capabilities in the cooperative economy.",
    ailockUseCases: "Use cases",
    ailockUseCasesDescription: "Users can train Ailock in the Noosits game and then use its skills to automate tasks in Co-Intent, find relevant projects, and communicate with other ecosystem participants."
  },
  
  // Support
  support: {
    title: "Support",
    subtitle: "Get help and answers to your questions about the Co-Intent platform.",
    faq: "Frequently Asked Questions",
    contactSupport: "Contact Support",
    yourName: "Your Name",
    emailAddress: "Email Address",
    subject: "Subject",
    message: "Message",
    sendMessage: "Send Message",
    // FAQ questions and answers
    faq_what_is_cointent_q: "What is Co-Intent?",
    faq_what_is_cointent_a: "Co-Intent is a platform that enables collaborative funding of digital products. Users can submit or fund product ideas, while executors create these products. Once completed, products are tokenized as NFTs, and future sales revenue is shared among all participants.",
    faq_how_earn_q: "How do I earn from my investments?",
    faq_how_earn_a: "When you invest in a product, you receive an NFT representing your ownership. As the product sells to new customers, you receive a share of the revenue. The revenue sharing model allocates 70% of sales to NFT holders, with the remaining split between creators and the platform.",
    faq_products_types_q: "What types of products can be created?",
    faq_products_types_a: "The platform supports various digital products including books, software, online courses, research papers, designs, and more. Any digital product that can be tokenized and distributed is eligible.",
    faq_become_executor_q: "How do I become an executor?",
    faq_become_executor_a: "To become an executor, you need to apply through the \"Become Executor\" section. You'll be asked to provide details about your skills, experience, and the types of projects you can execute. Once approved, you can start accepting orders."
  },
  
  // Common
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    send: "Send",
    submit: "Submit",
    back: "Back",
    next: "Next",
    yes: "Yes",
    no: "No"
  },
  
  // Revenue Calculator
  calculator: {
    title: "Accrued Revenue Calculator (Precise Simulation)",
    initialInvestment: {
      title: "Step 1: Initial Investment",
      amount: "Initial Investment Amount",
      tokenPrice: "Token Price",
      prepaymentCustomers: "Estimated Number of Prepayers:",
      prepaymentHint: "= Ceiling(Investment Amount / Token Price). They cover the Creator's fee."
    },
    distribution: {
      title: "Step 2: Distribution Parameters (for sales AFTER Prepayers)",
      creatorShare: "Creator Share (%)",
      platformShare: "Platform Share (%)",
      promotionShare: "Promotion Share (%)",
      buyersShare: "Buyers Share (%):",
      buyersShareHint: "= 100% - other shares. Distributed among ALL tokens (#1 and beyond)."
    },
    payback: {
      title: "Buyer Payback Parameters",
      multiplier: "Payback Multiplier (X)",
      multiplierHint: "Goal: return price * X",
      nonPaybackPoolShare: "Non-Payback Priority (%)",
      nonPaybackPoolShareHint: "% of Buyers share going only to them"
    },
    calculation: {
      title: "Calculation Parameters (Total Number of Sales)",
      totalSales: "Total Number of Sales (including Prepayers)",
      totalSalesHint1: "Minimum = Estimated Number of Prepayers",
      totalSalesHint2: "Maximum = {max} (for performance).",
      yourTokenNumber: "Your Token Number",
      yourTokenNumberHint: "Maximum = Total Number of Sales"
    },
    results: {
      title: "Result: Accrued Revenue",
      creator: "Creator",
      creatorDetail: "100% of initial investment + share from sales",
      platform: "Platform",
      platformDetail: "Only from sales after prepayment",
      promotion: "Promotion",
      buyers: "Buyers (Distributed)",
      buyersDetail: "Revenue from sales after Prepayers"
    },
    benefits: {
      title: "Investor Benefits",
      earlyInvestor: "Early Investor",
      midInvestor: "Mid Investor",
      lateInvestor: "Late Investor",
      investmentPaysBack: "Investment will pay back after",
      sales: "sales",
      at: "With",
      payback: "payback"
    },
    yourToken: {
      title: "Your token #",
      accruedIncome: "Accrued revenue:",
      paybackGoal: "Payback goal (X):",
      goalReached: "Goal reached?",
      yes: "Yes",
      no: "No"
    },
    overallStats: {
      title: "Overall Statistics",
      totalRevenue: "Total revenue:",
      prepaidTokens: "Prepaid tokens:",
      tokensPaidBack: "Tokens that reached payback:"
    },
    paybackInfo: {
      title: "Payback Moment Information",
      saleNumber: "Sale #:",
      totalRevenue: "Total revenue at payback moment:",
      toCreator: "To Creator:",
      toPlatform: "To Platform:"
    },
    comparison: {
      title: "Distribution Model Comparison",
      highPriority: "High Non-Payback Priority (95%)",
      balanced: "Balanced (80%)",
      equal: "Equal (60%)",
      highPriorityTitle: "High Priority (95%):",
      highPriorityDesc: "Early investors receive payback very quickly, later investors much slower. Creates 'waves of payback'.",
      balancedTitle: "Balanced (80%):",
      balancedDesc: "Medium payback speed for early investors, moderate differences between early and late investors.",
      equalTitle: "Equal (60%):",
      equalDesc: "Less pronounced advantage for early investors. More fair distribution, but slower payback.",
      earlyTokens: "Token #1-100:",
      midToken: "Token #500:",
      lateToken: "Token #1000:"
    },
    chart: {
      title: "Payback Chart for Different Tokens"
    },
    errors: {
      calculationError: "Calculation error. Please check your input values.",
      initError: "Error initializing the calculator.",
      tokenPriceError: "Token price must be > 0.",
      negativeInvestmentError: "Investment amount cannot be negative.",
      sharesError: "Creator, Platform, and Promotion shares must be 0-100% and sum to <= 100%.",
      paybackRatioError: "Payback Multiplier must be >= 1.",
      nonPaybackPoolShareError: "Non-Payback Priority must be 0-100%.",
      unexpectedError: "An unexpected error occurred during calculation."
    }
  },
  
  // Escrow
  escrow: {
    createGroupOrder: 'Create Group Order',
    depositFunds: 'Deposit Funds',
    participateInOrder: 'Participate in Order',
    votingForRepresentative: 'Vote for Representative',
    milestones: 'Milestones',
    addMilestone: 'Add Milestone',
    selectContractor: 'Select Contractor (Optional)',
    orderTitle: 'Order Title',
    orderDescription: 'Order Description',
    totalCost: 'Total Cost',
    currentFunding: 'Current Funding',
    contributionAmount: 'Contribution Amount',
    required_fields: 'Please fill in all required fields',
    invalid_amount: 'Invalid amount',
    order_created: 'Order created successfully',
    error_creating: 'Error creating order',
    error_exception: 'Exception when creating order',
    user_not_found: 'User not found in the system'
  },
  
  // Order
  order: {
    createTitle: "Create Group Order",
    title: "Order Title",
    titlePlaceholder: "Enter a descriptive title",
    description: "Description",
    descriptionPlaceholder: "Describe what you want to create",
    selectContractor: "Select Contractor (Optional)",
    selectContractorPlaceholder: "-- Select a contractor --",
    milestones: "Milestones",
    milestonesHelp: "Define the steps of your project and their costs",
    addMilestone: "Add Milestone",
    createOrder: "Create Order",
    cancel: "Cancel",
    max_milestones: "Maximum number of milestones is 10",
    milestone_description: "Milestone Description",
    amount: "Amount",
    add_milestone: "Please add at least one milestone",
    invalid_milestone_data: "Milestone data is invalid",
    enter_valid_amount: "Milestone amount must be positive",
    joined_success: "Successfully joined the order",
    join_error: "Error joining order"
  },

  // Hero
  hero: {
    title: "Buy to Earn",
    quote: "Buy to earn is a new way to earn money by buying products and services. It is a way to earn money by buying products and services. It is a way to earn money by buying products and services.",
  }
};

export default en;