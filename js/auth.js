/**
 * Authentication Functions
 * This file contains functions for user authentication
 */

// Auth state listener
auth.onAuthStateChanged(user => {
  if (user) {
    // User is signed in
    console.log("User is signed in:", user);
    showUserInfo(user);
    hideAuthButtons();
    showUserControls();
    fetchUserData(user.uid);
  } else {
    // User is signed out
    console.log("User is signed out");
    hideUserControls();
    showAuthButtons();
    resetUserInfo();
  }
});

// Update UI when user is authenticated
function updateUIOnAuth(user) {
  // Hide login controls, show logged in controls
  document.querySelector('.user-controls-auth').style.display = 'none';
  document.querySelector('.user-controls-logged-in').style.display = 'flex';
  
  // Update user display name
  const displayName = user.displayName || user.email.split('@')[0];
  document.getElementById('user-display-name').textContent = displayName;
  
  // Update avatar if user has a photo
  if (user.photoURL) {
    const avatar = document.getElementById('user-avatar');
    avatar.innerHTML = `<img src="${user.photoURL}" alt="${displayName}" />`;
  }
  
  // Get user data from Firestore
  getUserData(user.uid);
}

// Update UI when user signs out
function updateUIOnSignOut() {
  // Show login controls, hide logged in controls
  document.querySelector('.user-controls-auth').style.display = 'flex';
  document.querySelector('.user-controls-logged-in').style.display = 'none';
  
  // Reset avatar
  document.getElementById('user-avatar').innerHTML = '<i class="fas fa-user"></i>';
  document.getElementById('user-display-name').textContent = 'User';
  
  // Reset wallet display
  document.getElementById('wallet-balance-value').textContent = '0.00';
}

// Sign in with email and password
async function signInWithEmail(email, password) {
  try {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    return cred.user;
  } catch (err) {
    console.error('Error signing in with email:', err);
    throw err;
  }
}

// Sign up with email and password
async function signUpWithEmail(email, password, displayName) {
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    
    // Update profile with display name
    await cred.user.updateProfile({
      displayName: displayName
    });
    
    // Create user document in Firestore
    await createUserDocument(cred.user, { displayName });
    
    return cred.user;
  } catch (err) {
    console.error('Error signing up with email:', err);
    throw err;
  }
}

// Sign in with Google
async function signInWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const cred = await auth.signInWithPopup(provider);
    
    // Check if this is a new user
    const isNewUser = cred.additionalUserInfo.isNewUser;
    
    if (isNewUser) {
      // Create user document in Firestore for new users
      await createUserDocument(cred.user);
    }
    
    return cred.user;
  } catch (err) {
    console.error('Error signing in with Google:', err);
    throw err;
  }
}

// Sign out
async function signOut() {
  try {
    await auth.signOut();
  } catch (err) {
    console.error('Error signing out:', err);
    throw err;
  }
}

// Reset password
async function resetPassword(email) {
  try {
    await auth.sendPasswordResetEmail(email);
  } catch (err) {
    console.error('Error resetting password:', err);
    throw err;
  }
}

// Create user document in Firestore
async function createUserDocument(user, additionalData = {}) {
  if (!user) return;
  
  const userRef = db.collection('users').doc(user.uid);
  const snapshot = await userRef.get();
  
  if (!snapshot.exists) {
    const { email, displayName, photoURL } = user;
    const createdAt = firebase.firestore.FieldValue.serverTimestamp();
    
    try {
      await userRef.set({
        uid: user.uid,
        email,
        displayName: displayName || additionalData.displayName || email.split('@')[0],
        photoURL: photoURL || null,
        createdAt,
        wallet: {
          address: '',
          balance: 0.0,
          isConnected: false
        },
        ...additionalData
      });
    } catch (err) {
      console.error('Error creating user document:', err);
    }
  }
  
  return userRef;
}

// Get user data from Firestore
async function getUserData(userId) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      
      // Update wallet balance if wallet is connected
      if (userData.wallet && userData.wallet.isConnected) {
        document.getElementById('wallet-balance-value').textContent = 
          userData.wallet.balance.toFixed(2);
      }
      
      return userData;
    }
  } catch (err) {
    console.error('Error getting user data:', err);
  }
  
  return null;
}

// Fetch user data from Firestore
function fetchUserData(userId) {
  return db.collection("users").doc(userId).get()
    .then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        updateUIWithUserData(userData);
        return userData;
      } else {
        console.log("No such document!");
        return null;
      }
    });
}

// UI update functions
function showUserInfo(user) {
  const userDisplayName = document.getElementById('user-display-name');
  if (userDisplayName) {
    userDisplayName.textContent = user.displayName || user.email;
  }
  
  // Update profile page if it exists
  const profileName = document.querySelector('#profile .profile-info h2');
  const profileEmail = document.querySelector('#profile .profile-info p');
  
  if (profileName) {
    profileName.textContent = user.displayName || 'User';
  }
  
  if (profileEmail) {
    profileEmail.textContent = user.email || '';
  }
}

function updateUIWithUserData(userData) {
  // Update wallet balance
  const walletBalance = document.querySelector('.wallet-balance');
  if (walletBalance && userData.walletBalance !== undefined) {
    walletBalance.innerHTML = userData.walletBalance.toFixed(2) + ' <span class="wallet-currency">ETH</span>';
  }
  
  // Update other UI elements with user data as needed
}

function resetUserInfo() {
  const userDisplayName = document.getElementById('user-display-name');
  if (userDisplayName) {
    userDisplayName.textContent = '';
  }
}

function showUserControls() {
  const userControls = document.querySelector('.user-controls-logged-in');
  const authButtons = document.querySelector('.user-controls-auth');
  
  if (userControls) userControls.style.display = 'flex';
  if (authButtons) authButtons.style.display = 'none';
}

function hideUserControls() {
  const userControls = document.querySelector('.user-controls-logged-in');
  const authButtons = document.querySelector('.user-controls-auth');
  
  if (userControls) userControls.style.display = 'none';
  if (authButtons) authButtons.style.display = 'flex';
}

function showAuthButtons() {
  const authButtons = document.querySelector('.user-controls-auth');
  if (authButtons) authButtons.style.display = 'flex';
}

function hideAuthButtons() {
  const authButtons = document.querySelector('.user-controls-auth');
  if (authButtons) authButtons.style.display = 'none';
}

// Form event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Sign in form
  const signInForm = document.getElementById('sign-in-form');
  if (signInForm) {
    signInForm.addEventListener('submit', e => {
      e.preventDefault();
      
      const email = document.getElementById('sign-in-email').value;
      const password = document.getElementById('sign-in-password').value;
      
      signInWithEmail(email, password)
        .then(() => {
          closeModal('auth-modal');
          showNotification('Вход выполнен успешно', 'success');
        })
        .catch(error => {
          showNotification('Ошибка входа: ' + error.message, 'error');
        });
    });
  }
  
  // Sign up form
  const signUpForm = document.getElementById('sign-up-form');
  if (signUpForm) {
    signUpForm.addEventListener('submit', e => {
      e.preventDefault();
      
      const name = document.getElementById('sign-up-name').value;
      const email = document.getElementById('sign-up-email').value;
      const password = document.getElementById('sign-up-password').value;
      
      signUpWithEmail(email, password, name)
        .then(() => {
          closeModal('auth-modal');
          showNotification('Регистрация успешна', 'success');
        })
        .catch(error => {
          showNotification('Ошибка регистрации: ' + error.message, 'error');
        });
    });
  }
  
  // Reset password form
  const resetPasswordForm = document.getElementById('reset-password-form');
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', e => {
      e.preventDefault();
      
      const email = document.getElementById('reset-email').value;
      
      resetPassword(email)
        .then(() => {
          closeModal('auth-modal');
          showNotification('Инструкции по сбросу пароля отправлены на вашу почту', 'success');
        })
        .catch(error => {
          showNotification('Ошибка сброса пароля: ' + error.message, 'error');
        });
    });
  }
  
  // Sign out button
  const signOutBtn = document.getElementById('sign-out-btn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
      signOut()
        .then(() => {
          showNotification('Вы вышли из системы', 'success');
        })
        .catch(error => {
          showNotification('Ошибка выхода: ' + error.message, 'error');
        });
    });
  }
  
  // Google sign in
  const googleSignInBtn = document.getElementById('google-sign-in');
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', () => {
      signInWithGoogle()
        .then(() => {
          closeModal('auth-modal');
          showNotification('Авторизация через Google выполнена успешно', 'success');
        })
        .catch(error => {
          showNotification('Ошибка авторизации через Google: ' + error.message, 'error');
        });
    });
  }
  
  // Auth tabs switching
  const authTabs = document.querySelectorAll('.auth-tab');
  if (authTabs.length) {
    authTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Hide all tab contents
        document.querySelectorAll('.auth-tab-content').forEach(content => {
          content.classList.remove('active');
        });
        
        // Remove active class from all tabs
        authTabs.forEach(t => {
          t.classList.remove('active');
        });
        
        // Show the selected tab content
        const target = tab.getAttribute('data-target');
        document.getElementById(target).classList.add('active');
        
        // Add active class to clicked tab
        tab.classList.add('active');
      });
    });
  }
}); 