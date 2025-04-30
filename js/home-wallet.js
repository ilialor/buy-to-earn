// js/home-wallet.js
// Handles Escrow wallet connect and balance display
import { escrowApi } from './api/index.js';

document.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('connect-wallet-btn');
  const balanceDisplay = document.getElementById('wallet-balance-display');
  const balanceValue = document.getElementById('wallet-balance-value');

  if (connectBtn) {
    connectBtn.addEventListener('click', async () => {
      // Prompt user for name and email
      const name = prompt('Введите имя для Escrow');
      const email = prompt('Введите email для Escrow');
      if (!name || !email) return;
      try {
        const user = await escrowApi.createUser({ name, email });
        localStorage.setItem('escrowUserId', user.id);
        alert('Escrow user created with ID: ' + user.id);
      } catch (error) {
        console.error('Escrow createUser error:', error);
        alert('Не удалось создать пользователя Escrow');
      }
    });
  }

  if (balanceDisplay) {
    balanceDisplay.addEventListener('click', async () => {
      const id = localStorage.getItem('escrowUserId');
      if (!id) {
        alert('Сначала подключите Escrow учетную запись');
        return;
      }
      try {
        const data = await escrowApi.getUserById(id);
        if (balanceValue) {
          balanceValue.textContent = data.balance;
        }
      } catch (error) {
        console.error('Escrow getUserById error:', error);
        alert('Не удалось получить баланс');
      }
    });
  }
});
