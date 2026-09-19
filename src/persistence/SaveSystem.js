/**
 * SaveSystem - Gestiona la persistencia de la partida.
 */
import { SaveSlot } from './SaveSlot.js';

const SAVE_KEY_PREFIX = 'objetinos_save_';
const CURRENT_VERSION = '1.0.0';
const MAX_SLOTS = 3;

export class SaveSystem {
  constructor(storageKey = SAVE_KEY_PREFIX) {
    this.storageKey = storageKey;
    this.currentVersion = CURRENT_VERSION;
  }

  save(slotIndex, gameState, levelDefinition, remainingTime) {
    if (slotIndex < 0 || slotIndex >= MAX_SLOTS) {
      console.error(`SaveSystem: slot ${slotIndex} fuera de rango (0-${MAX_SLOTS - 1})`);
      return false;
    }

    try {
      const saveData = {
        gameState: gameState.toJSON(),
        levelDefinition: levelDefinition ? levelDefinition.toJSON() : null,
        remainingTime: remainingTime,
        savedAt: Date.now()
      };

      const slot = new SaveSlot(slotIndex, saveData, this.currentVersion);
      const key = this._getSlotKey(slotIndex);
      localStorage.setItem(key, JSON.stringify(slot.toJSON()));
      
      console.log(`SaveSystem: guardado exitoso en slot ${slotIndex}`);
      return true;
    } catch (error) {
      console.error('SaveSystem: error al guardar:', error);
      return false;
    }
  }

  load(slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_SLOTS) {
      console.error(`SaveSystem: slot ${slotIndex} fuera de rango`);
      return null;
    }

    try {
      const key = this._getSlotKey(slotIndex);
      const stored = localStorage.getItem(key);
      
      if (!stored) {
        console.log(`SaveSystem: slot ${slotIndex} vacío`);
        return null;
      }

      const slotData = JSON.parse(stored);
      const slot = SaveSlot.fromJSON(slotData);

      if (slot.version !== this.currentVersion) {
        console.warn(`SaveSystem: versión incompatible (${slot.version} vs ${this.currentVersion})`);
      }

      return slot.data;
    } catch (error) {
      console.error('SaveSystem: error al cargar:', error);
      return null;
    }
  }

  delete(slotIndex) {
    if (slotIndex < 0 || slotIndex >= MAX_SLOTS) {
      return false;
    }

    try {
      const key = this._getSlotKey(slotIndex);
      localStorage.removeItem(key);
      console.log(`SaveSystem: slot ${slotIndex} eliminado`);
      return true;
    } catch (error) {
      console.error('SaveSystem: error al eliminar:', error);
      return false;
    }
  }

  listSlots() {
    const slots = [];
    for (let i = 0; i < MAX_SLOTS; i++) {
      const key = this._getSlotKey(i);
      const stored = localStorage.getItem(key);
      
      if (stored) {
        try {
          const slotData = JSON.parse(stored);
          slots.push({
            slotIndex: i,
            hasData: true,
            timestamp: slotData.timestamp,
            version: slotData.version
          });
        } catch (e) {
          slots.push({ slotIndex: i, hasData: false, timestamp: null, version: null });
        }
      } else {
        slots.push({ slotIndex: i, hasData: false, timestamp: null, version: null });
      }
    }
    return slots;
  }

  hasSave(slotIndex) {
    const key = this._getSlotKey(slotIndex);
    return localStorage.getItem(key) !== null;
  }

  autoSave(gameState, levelDefinition, remainingTime) {
    return this.save(0, gameState, levelDefinition, remainingTime);
  }

  loadAutoSave() {
    return this.load(0);
  }

  clearAll() {
    try {
      for (let i = 0; i < MAX_SLOTS; i++) {
        this.delete(i);
      }
      console.log('SaveSystem: todos los slots eliminados');
      return true;
    } catch (error) {
      console.error('SaveSystem: error al limpiar:', error);
      return false;
    }
  }

  _getSlotKey(slotIndex) {
    return `${this.storageKey}${slotIndex}`;
  }
}