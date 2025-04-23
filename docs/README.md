# Ateira:CoIntent - Documentation

## Overview
Ateira:CoIntent is the 'Buy-to-Earn' project is a platform for group orders using escrow functionality, ensuring secure transactions between customers and contractors. The platform allows you to:
- Create group orders with work stages
- Join group orders by contributing your share of funds
- Select a representative among the order participants
- Monitor the execution of work by stages
- Check the quality of work and sign certificates of completion


## Project structure
```
/
├── index.html # Main HTML file of the application
├── styles/ # CSS styles
│ ├── main.css # Main styles
│ └── escrow.css # Styles for escrow components
├── js/ # JavaScript files
│ ├── local-auth.js # Local authorization
│ ├── db.js # Interaction with the database
│ └── escrow/ # Modules for escrow functionality
│ ├── constants.js # Constants and enumerations
│ ├── models.js # Data models
│ ├── local-storage.js # Local storage
│ ├── application.js # Main logic
│ ├── ui.js # User interface
│ └── index.js # Entry point for the escrow module
└── docs/ # Project documentation
├── README.md # Documentation overview
└── ... # Other documentation files
```

## Installation and launch
For local development:
1. Clone the repository
2. Open index.html in a browser (some APIs may require a local server for full functionality)

For testing individual components:
- `test-notifications.html` - testing the notification system

## Project features
- Modular architecture with the possibility of expansion
- Support for local development without mandatory connection to the server
- Notification system for interactive interaction with the user
- Escrow functionality for ensuring the security of transactions

## Update: Optional selection of the performer

In the latest The update added the functionality of creating group orders without specifying an executor. This allows users to create group orders even if there are no available executors in the system.

### Changes:
1. The contractor selection field is now optional when creating an order
2. The corresponding translation has been added for the interface in Russian, English and Spanish
3. The business logic has been modified to ensure that orders without a contractor work correctly

### How it works:
- The user can create an order without selecting a contractor
- Such an order will have the PENDING status until the contractor is assigned
- The contractor can be assigned later by the administrator or through a vote by representatives

### Limitations:
- For orders without a contractor, it is impossible to mark stages as completed until the contractor is assigned
- All other functions (fundraising, voting for a representative, etc.) are available without restrictions

## Interface update

The following changes have been made to the interface to unify and simplify user interaction with the system:

### Unification of order creation
1. The separate "Create a group order" button has been removed, since all orders in the system are group orders
2. The existing order creation form on the tab "Submit Order" has been modified to use escrow functionality
3. The form has been updated to work with milestones and optional performer selection

### Fund Management
1. Fund management functionality has been moved to the "Wallet" section
2. The ability to top up the escrow balance from the wallet has been added
3. The balance button in the site header now also opens a modal window for replenishing the account
4. The escrow account balance is displayed both in the portfolio section and in the wallet

### Benefits of the modification
- Simplification of the interface by eliminating duplication of functionality
- More intuitive placement of fund management functions in the "Wallet" section
- A single order creation process that is understandable to the user
- A clearer division of functionality into the relevant sections of the site

## Latest updates

### Order interface update and UX improvement (2023-04-xx)

#### What has been updated
- Fixed issues with duplicate notifications when creating an order
- Added a check for a positive stage amount (milestone) when creating an order
- Improved the appearance of order cards in the marketplace
- Added correct localization of section titles for all supported languages ​​(RU, EN, ES)
- Improved functionality for participating in orders for other users
- Added "Participate" buttons for joining group orders

#### How it works
1. **Order creation**
- When creating an order, the system checks that all stage amounts are positive
- Validation prevents creating an order with incorrect data
- The user receives clear error messages in their language

2. **Order display**
- Orders are divided into two categories: "Your orders" and "All active orders"
- Styles and animations have been added to improve the user experience
- Order cards contain all the necessary information and buttons for actions

3. **Participation in orders**
- Any authorized user can join the order via the "Participate" button
- When clicked, a modal window opens for depositing funds
- After successful participation, the user becomes a co-investor in the order

4. **Order execution**
- Performers can take orders for execution if they have sufficient funds
- When completing work stages, funds are automatically transferred to the performer
- Customers can track the progress of the order

#### Technical details
- Improved process order creation form validation
- Added event handlers for participation and view details buttons
- Fixed issues with localization and display of text in different languages
- Optimized the process of creating and displaying order cards

#### Limitations
- To participate in an order, you must be authorized in the system
- The participation amount must be positive and not exceed the user's balance
- The contractor must be registered in the system as a contractor

## Ateira Ecosystem and AI Assistant Ailock
Ateira is an ecosystem of interconnected projects:
- **Ateira:Noosits** is a game where you train the AI ​​companion Ailock, who can become your real assistant.
- **Ateira:Loreland** is an educational play-to-learn game with AI mentors and AI students.
- **Ateira:Co-Intent** is a cooperative economic system that allows you to jointly create value and share income.

The AI ​​assistant **Ailock** is actively developed: it evolves in the game and integrates into real applications, helps with tasks, search, content and communication. All data is protected and can be stored locally or in user ICP canisters. Integration with Co-Intent provides privacy, personalization and new opportunities for users.
