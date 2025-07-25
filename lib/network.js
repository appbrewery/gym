import { getDB } from './db';

// Default network settings
const DEFAULT_SETTINGS = {
  id: 'network_config',
  enabled: false,  // Disabled by default - students can enable later
  minDelay: 500,
  maxDelay: 2000,
  failureRate: 0.1
};

// Get network settings from database
async function getNetworkSettings() {
  try {
    const db = await getDB();
    const settings = await db.get('systemSettings', 'network_config');
    return settings || DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to get network settings:', error);
    return DEFAULT_SETTINGS;
  }
}

// Save network settings to database
export async function updateNetworkSettings(settings) {
  const db = await getDB();
  await db.update('systemSettings', { ...settings, id: 'network_config' });
}

// Calculate random delay within configured range
function calculateDelay(minDelay, maxDelay) {
  return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
}

// Simulate network delay
export async function simulateNetworkDelay() {
  const settings = await getNetworkSettings();
  
  if (!settings.enabled) {
    return;
  }
  
  const delay = calculateDelay(settings.minDelay, settings.maxDelay);
  await new Promise(resolve => setTimeout(resolve, delay));
}

// Simulate network request with potential failure
export async function simulateNetworkRequest(operation) {
  const settings = await getNetworkSettings();
  
  // Apply delay
  if (settings.enabled) {
    const delay = calculateDelay(settings.minDelay, settings.maxDelay);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Check for random failure
    if (Math.random() < settings.failureRate) {
      throw new Error('Network request failed. Please try again.');
    }
  }
  
  // Execute the operation
  return await operation();
}

// Wrapper for common operations with network simulation
export async function withNetworkSimulation(operation, options = {}) {
  const { 
    showLoading = true, 
    errorMessage = 'Operation failed. Please try again.',
    successMessage = null 
  } = options;
  
  try {
    if (showLoading) {
      // In a real app, this would trigger a loading state
      console.log('Loading...');
    }
    
    const result = await simulateNetworkRequest(operation);
    
    if (successMessage) {
      console.log(successMessage);
    }
    
    return result;
  } catch (error) {
    console.error(errorMessage, error);
    throw error;
  }
}

// Initialize network settings on first load
export async function initializeNetworkSettings() {
  const db = await getDB();
  const existingSettings = await db.get('systemSettings', 'network_config');
  
  if (!existingSettings) {
    await db.add('systemSettings', DEFAULT_SETTINGS);
  }
}