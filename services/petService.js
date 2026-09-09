import { pets as fallbackPets } from '../data/petdata';
import storageService from './storageService';

// Default MockAPI endpoint for PawDate pets
// Users/evaluators can configure a custom URL in SettingsScreen.
const DEFAULT_API_BASE_URL = 'https://6a9956dc53c0481726b92709.mockapi.io/api/v1';
const PETS_RESOURCE = '/pets';
const NETWORK_TIMEOUT_MS = 10000;

/**
 * Helper to execute fetch with a timeout
 */
const fetchWithTimeout = async (url, options = {}, timeout = NETWORK_TIMEOUT_MS) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const petService = {
  /**
   * Get the active API Base URL (custom configured or default)
   */
  async getApiUrl() {
    const settings = await storageService.getUserSettings();
    const baseUrl =
      settings.customApiUrl && settings.customApiUrl.trim() !== ''
        ? settings.customApiUrl.trim().replace(/\/+$/, '')
        : DEFAULT_API_BASE_URL;
    return `${baseUrl}${PETS_RESOURCE}`;
  },

  /**
   * Normalizes pet object schema
   */
  normalizePet(item) {
    if (!item) return null;
    const parsedAge = Number(item.age);
    return {
      id: String(item.id ?? ''),
      name: item.name ? String(item.name).trim() : 'Unnamed Pet',
      breed: item.breed ? String(item.breed).trim() : 'Mixed Breed',
      age: !isNaN(parsedAge) && parsedAge > 0 ? parsedAge : 1,
      location: item.location ? String(item.location).trim() : 'Local Area',
      playStyle: item.playStyle ? String(item.playStyle).trim() : 'Friendly & energetic',
      bio: item.bio ? String(item.bio).trim() : 'Looking for friends to play with!',
      emoji: item.emoji || '🐾',
      createdAt: item.createdAt || new Date().toISOString(),
    };
  },

  /**
   * GET all pets from MockAPI
   * Falls back to AsyncStorage cache if offline or on network error.
   * @returns {Promise<{ data: Array, isOffline: boolean, fromCache: boolean, error?: string }>}
   */
  async getAllPets() {
    let url;
    try {
      url = await this.getApiUrl();
      const response = await fetchWithTimeout(url, { method: 'GET' });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Normalize data to ensure fields are consistent
      const formatted = Array.isArray(data)
        ? data.map((p) => this.normalizePet(p)).filter(Boolean)
        : [];

      // Update local AsyncStorage cache
      await storageService.setCachedPets(formatted);

      return { data: formatted, isOffline: false, fromCache: false };
    } catch (error) {
      console.warn(`[PetService] Network fetch failed (${error.message}). Loading local cache...`);

      // Offline fallback: try reading from AsyncStorage cache
      const cached = await storageService.getCachedPets();
      if (cached && Array.isArray(cached) && cached.length > 0) {
        return { data: cached, isOffline: true, fromCache: true, error: error.message };
      }

      // If no local cache exists either, seed with initial local dataset
      const normalizedFallback = fallbackPets.map((p) => this.normalizePet(p));
      await storageService.setCachedPets(normalizedFallback);
      return { data: normalizedFallback, isOffline: true, fromCache: true, error: error.message };
    }
  },

  /**
   * GET single pet by ID
   */
  async getPetById(id) {
    const idStr = String(id);
    try {
      const url = await this.getApiUrl();
      const response = await fetchWithTimeout(`${url}/${idStr}`, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: Failed to fetch pet #${idStr}`);
      }
      const data = await response.json();
      return this.normalizePet(data);
    } catch (error) {
      console.warn(`[PetService] getPetById failed for id ${idStr}, attempting cache lookup:`, error);
      const cached = await storageService.getCachedPets();
      const found = cached?.find((p) => String(p.id) === idStr);
      if (found) return found;
      throw error;
    }
  },

  /**
   * POST - Create a new pet profile on MockAPI
   */
  async createPet(petData) {
    const parsedAge = Number(petData.age);
    const payload = {
      name: String(petData.name || '').trim(),
      breed: String(petData.breed || '').trim(),
      age: !isNaN(parsedAge) && parsedAge > 0 ? parsedAge : 1,
      location: String(petData.location || '').trim(),
      playStyle: String(petData.playStyle || '').trim(),
      bio: String(petData.bio || '').trim(),
      emoji: petData.emoji || '🐾',
      createdAt: new Date().toISOString(),
    };

    try {
      const url = await this.getApiUrl();
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to create pet (${response.status} ${response.statusText})`);
      }

      const created = await response.json();
      const normalized = this.normalizePet(created);

      // Update local cache
      const cached = (await storageService.getCachedPets()) || [];
      await storageService.setCachedPets([normalized, ...cached]);

      return normalized;
    } catch (error) {
      console.error('[PetService] createPet error:', error);
      // If network fails, generate local temporary ID and save to cache
      const localPet = { ...payload, id: 'local_' + Date.now() };
      const cached = (await storageService.getCachedPets()) || [];
      await storageService.setCachedPets([localPet, ...cached]);
      return localPet;
    }
  },

  /**
   * PUT - Update an existing pet on MockAPI
   */
  async updatePet(id, petData) {
    const idStr = String(id);
    const parsedAge = Number(petData.age);
    const payload = {
      name: String(petData.name || '').trim(),
      breed: String(petData.breed || '').trim(),
      age: !isNaN(parsedAge) && parsedAge > 0 ? parsedAge : 1,
      location: String(petData.location || '').trim(),
      playStyle: String(petData.playStyle || '').trim(),
      bio: String(petData.bio || '').trim(),
      emoji: petData.emoji || '🐾',
    };

    try {
      const url = await this.getApiUrl();
      const response = await fetchWithTimeout(`${url}/${idStr}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to update pet #${idStr} (${response.status})`);
      }

      const updated = await response.json();
      const normalized = this.normalizePet(updated);

      // Sync local cache
      const cached = (await storageService.getCachedPets()) || [];
      const updatedCache = cached.map((p) => (String(p.id) === idStr ? normalized : p));
      await storageService.setCachedPets(updatedCache);

      return normalized;
    } catch (error) {
      console.error('[PetService] updatePet error:', error);
      // Update locally in cache
      const cached = (await storageService.getCachedPets()) || [];
      const updatedCache = cached.map((p) =>
        String(p.id) === idStr ? { ...p, ...payload, id: idStr } : p
      );
      await storageService.setCachedPets(updatedCache);
      return { ...payload, id: idStr };
    }
  },

  /**
   * DELETE - Remove a pet from MockAPI
   */
  async deletePet(id) {
    const idStr = String(id);
    try {
      const url = await this.getApiUrl();
      const response = await fetchWithTimeout(`${url}/${idStr}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to delete pet #${idStr} (${response.status})`);
      }

      // Remove from local cache
      const cached = (await storageService.getCachedPets()) || [];
      const filtered = cached.filter((p) => String(p.id) !== idStr);
      await storageService.setCachedPets(filtered);

      return true;
    } catch (error) {
      console.error('[PetService] deletePet error:', error);
      // Remove locally from cache
      const cached = (await storageService.getCachedPets()) || [];
      const filtered = cached.filter((p) => String(p.id) !== idStr);
      await storageService.setCachedPets(filtered);
      return true;
    }
  },

  /**
   * Seed MockAPI with initial sample pets (Utility for demo/testing)
   */
  async seedInitialPets() {
    const url = await this.getApiUrl();
    const created = [];
    for (const pet of fallbackPets) {
      try {
        const { id, ...data } = pet;
        const res = await fetchWithTimeout(url, {
          method: 'POST',
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const item = await res.json();
          created.push(this.normalizePet(item));
        }
      } catch (e) {
        console.warn('Seed item skipped:', e.message);
      }
    }

    // Sync newly seeded items to local storage cache
    if (created.length > 0) {
      await storageService.setCachedPets(created);
    }

    return created;
  },
};

export default petService;
