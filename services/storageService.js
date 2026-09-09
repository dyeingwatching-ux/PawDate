import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  CACHED_PETS: '@pawdate_cached_pets',
  PLAYDATE_REQUESTS: '@pawdate_playdate_requests',
  USER_SETTINGS: '@pawdate_user_settings',
  LAST_SYNC: '@pawdate_last_sync',
};

const DEFAULT_SETTINGS = {
  ownerName: 'Pet Parent',
  isDarkMode: false,
  customApiUrl: '',
};

export const storageService = {
  /**
   * Get cached pets from AsyncStorage for offline availability
   */
  async getCachedPets() {
    try {
      const json = await AsyncStorage.getItem(KEYS.CACHED_PETS);
      return json != null ? JSON.parse(json) : null;
    } catch (e) {
      console.error('[StorageService] Error loading cached pets:', e);
      return null;
    }
  },

  /**
   * Save pets to local cache
   */
  async setCachedPets(pets) {
    try {
      await AsyncStorage.setItem(KEYS.CACHED_PETS, JSON.stringify(pets));
      await AsyncStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
    } catch (e) {
      console.error('[StorageService] Error saving cached pets:', e);
    }
  },

  /**
   * Get all pet IDs that the user has sent playdate requests to
   */
  async getPlaydateRequests() {
    try {
      const json = await AsyncStorage.getItem(KEYS.PLAYDATE_REQUESTS);
      return json != null ? JSON.parse(json) : [];
    } catch (e) {
      console.error('[StorageService] Error loading playdate requests:', e);
      return [];
    }
  },

  /**
   * Check if a specific pet has a pending playdate request
   */
  async isPlaydateRequested(petId) {
    try {
      const requests = await this.getPlaydateRequests();
      return requests.includes(String(petId));
    } catch (e) {
      return false;
    }
  },

  /**
   * Toggle a playdate request for a pet ID (Local Persistence)
   */
  async togglePlaydateRequest(petId) {
    try {
      const idStr = String(petId);
      let requests = await this.getPlaydateRequests();
      let isNowRequested = false;

      if (requests.includes(idStr)) {
        requests = requests.filter((id) => id !== idStr);
        isNowRequested = false;
      } else {
        requests.push(idStr);
        isNowRequested = true;
      }

      await AsyncStorage.setItem(KEYS.PLAYDATE_REQUESTS, JSON.stringify(requests));
      return { isRequested: isNowRequested, count: requests.length, requests };
    } catch (e) {
      console.error('[StorageService] Error toggling playdate request:', e);
      throw e;
    }
  },

  /**
   * Load user preferences (Theme, Owner name, MockAPI URL)
   */
  async getUserSettings() {
    try {
      const json = await AsyncStorage.getItem(KEYS.USER_SETTINGS);
      if (json != null) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
      }
      return DEFAULT_SETTINGS;
    } catch (e) {
      console.error('[StorageService] Error loading user settings:', e);
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * Save user preferences to local storage
   */
  async saveUserSettings(newSettings) {
    try {
      const current = await this.getUserSettings();
      const updated = { ...current, ...newSettings };
      await AsyncStorage.setItem(KEYS.USER_SETTINGS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('[StorageService] Error saving user settings:', e);
      throw e;
    }
  },

  /**
   * Clear cached pet and request data
   */
  async clearCache() {
    try {
      await AsyncStorage.multiRemove([KEYS.CACHED_PETS, KEYS.LAST_SYNC]);
      return true;
    } catch (e) {
      console.error('[StorageService] Error clearing cache:', e);
      return false;
    }
  },
};

export default storageService;
