import { getDB } from './db';

const SESSION_KEY = 'gym_session';

export async function login(email, password) {
  const db = await getDB();
  const user = await db.getByIndex('users', 'email', email);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  if (user.password !== password) {
    throw new Error('Invalid password');
  }
  
  // Create session
  const session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    membershipType: user.membershipType,
    token: generateMockToken(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  };
  
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function register(userData) {
  const db = await getDB();
  
  // Check if user already exists
  const existingUser = await db.getByIndex('users', 'email', userData.email);
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  // Create new user
  const newUser = {
    id: generateUserId(),
    email: userData.email,
    password: userData.password,
    name: userData.name,
    memberSince: new Date().toISOString(),
    membershipType: 'standard'
  };
  
  await db.add('users', newUser);
  
  // Auto-login after registration
  return login(userData.email, userData.password);
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
  const sessionData = sessionStorage.getItem(SESSION_KEY);
  if (!sessionData) return null;
  
  const session = JSON.parse(sessionData);
  
  // Check if session is expired
  if (new Date(session.expiresAt) < new Date()) {
    logout();
    return null;
  }
  
  return session;
}

export function isAuthenticated() {
  return getCurrentUser() !== null;
}

export function requireAuth() {
  if (!isAuthenticated()) {
    throw new Error('Authentication required');
  }
  return getCurrentUser();
}

// Helper functions
function generateMockToken() {
  return 'mock_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function generateUserId() {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}