/**
 * LevelGenerator - Genera la estructura base (esqueleto) de un nivel.
 * 
 * MODIFICACIÓN: Integración con ObjectTheme para usar diferentes packs de objetos
 */
import { LevelConfiguration } from '../configuration/LevelConfiguration.js';
import { LevelDefinition } from '../../core/definition/LevelDefinition.js';
import { StructureDefinition } from '../../core/definition/StructureDefinition.js';
import { ShelfDefinition } from '../../core/definition/ShelfDefinition.js';
import { LayerDefinition } from '../../core/definition/LayerDefinition.js';
import { LayerState } from '../../core/model/Layer.js';
import { ShelfType, ShelfBehavior } from '../../core/model/Shelf.js';
import { Orientation } from '../../core/model/Structure.js';
import { themeRegistry } from '../../core/themes/ObjectTheme.js';

export class LevelGenerator {
  /**
   * Máximo número de estantes por estructura para evitar desbordamiento visual.
   */
  static MAX_SHELVES_PER_STRUCTURE = 3;

  /**
   * Genera una LevelDefinition con la estructura base para un nivel.
   * 
   * @param {number} levelNumber 
   * @param {string} themeId - ID del tema a usar (opcional, usa el actual si es null)
   * @returns {LevelDefinition}
   */
  static generateBaseStructure(levelNumber, themeId = null) {
    const config = new LevelConfiguration(levelNumber);
    const { difficulty, scenarioId } = config;
    const limits = this.getDeviceLimits();
    const deviceType = this.detectDeviceType();

    // Obtener el tema
    const theme = themeId ? themeRegistry.get(themeId) : themeRegistry.getCurrent();
    if (!theme) {
      throw new Error(`Tema '${themeId}' no encontrado. Temas disponibles: ${themeRegistry.listThemes().map(t => t.id).join(', ')}`);
    }

    const structures = [];
    let structureIdCounter = 1;
    let shelfIdCounter = 1;
    let layerIdCounter = 1;

    const numStructures = [1, 2, 5, 10].includes(scenarioId) ? 1 : 2;
    const useCollapsible = [5, 10].includes(scenarioId);

    const totalShelvesNeeded = difficulty.trioCount;
    const shelvesPerStructure = Math.min(
      Math.ceil(totalShelvesNeeded / numStructures),
      LevelGenerator.MAX_SHELVES_PER_STRUCTURE
    );

    let actualNumStructures = Math.ceil(totalShelvesNeeded / shelvesPerStructure);
    actualNumStructures = Math.min(actualNumStructures, limits.maxStructures);

    console.log(`📱 Dispositivo: ${deviceType}`);
    console.log(`🎨 Tema: ${theme.name}`);
    console.log(` Estructuras: ${actualNumStructures}, Estantes por estructura: ${shelvesPerStructure}, Total estantes: ${totalShelvesNeeded}`);

    for (let i = 0; i < actualNumStructures; i++) {
      const structId = `struct_${structureIdCounter++}`;
      const orientation = Orientation.VERTICAL;
      
      const shelves = [];
      const remainingShelves = totalShelvesNeeded - (i * shelvesPerStructure);
      const shelvesCount = Math.min(shelvesPerStructure, remainingShelves);
      
      for (let j = 0; j < shelvesCount; j++) {
        const shelfId = `shelf_${shelfIdCounter++}`;
        const shelfType = ShelfType.NORMAL;
        const shelfBehavior = (useCollapsible && j === 0) ? ShelfBehavior.COLLAPSIBLE : ShelfBehavior.STANDARD;

        const layers = [];
        for (let k = 0; k < difficulty.layerCount; k++) {
          const layerId = `layer_${layerIdCounter++}`;
          const layerState = k === 0 ? LayerState.TOP : (k === 1 ? LayerState.SHADED : LayerState.INVISIBLE);
          
          const slots = [];
          for (let s = 0; s < 3; s++) {
            slots.push({ slotIndex: s, objectId: null });
          }
          
          layers.push(new LayerDefinition(layerId, layerState, slots));
        }

        shelves.push(new ShelfDefinition(shelfId, shelfType, shelfBehavior, layers));
      }

      structures.push(new StructureDefinition(structId, orientation, shelves));
    }

    const objects = {};

    return new LevelDefinition(
      levelNumber,
      structures,
      objects,
      difficulty.time,
      { 
        difficulty: difficulty, 
        scenarioId: scenarioId, 
        deviceType: deviceType,
        themeId: theme.id
      }
    );
  }

  /**
   * Genera un nivel completo con objetos del tema seleccionado
   * 
   * @param {number} levelNumber
   * @param {string} themeId - ID del tema (opcional)
   * @returns {LevelDefinition}
   */
  static generateCompleteLevel(levelNumber, themeId = null) {
    const baseDefinition = this.generateBaseStructure(levelNumber, themeId);
    const config = new LevelConfiguration(levelNumber);
    const { trioCount, layerCount } = config.difficulty;

    // Obtener el tema
    const theme = themeId ? themeRegistry.get(themeId) : themeRegistry.getCurrent();
    if (!theme) {
      throw new Error(`Tema '${themeId}' no encontrado`);
    }

    // Calcular total de huecos TOP disponibles
    let totalTopSlots = 0;
    for (const structure of baseDefinition.structures) {
      for (const shelf of structure.shelves) {
        for (const layer of shelf.layers) {
          if (layer.state === LayerState.TOP) {
            totalTopSlots += layer.slots.length;
          }
        }
      }
    }

    const totalObjectsRequested = trioCount * 3;
    const minimumEmptySlots = 2;
    const maxObjectsAllowed = totalTopSlots - minimumEmptySlots;
    const actualTrioCount = Math.floor(maxObjectsAllowed / 3);
    const actualObjectsToPlace = actualTrioCount * 3;

    if (actualTrioCount < trioCount) {
      console.warn(`⚠️ Nivel ${levelNumber}: Reduciendo tríos de ${trioCount} a ${actualTrioCount} para dejar huecos vacíos`);
    }

    // Crear lista de identidades usando el tema
    const identities = [];
    const types = Array.from(theme.getTypes());
    const colors = Array.from(theme.getColors());
    let identityIndex = 0;

    for (let i = 0; i < actualTrioCount; i++) {
      const type = types[identityIndex % types.length];
      const color = colors[identityIndex % colors.length];
      identityIndex++;

      for (let j = 0; j < 3; j++) {
        identities.push({ type, color });
      }
    }

    this.shuffleArray(identities);

    // Crear mapa de objetos
    const objects = {};
    let objectIdCounter = 1;
    let identityPointer = 0;

    for (const structure of baseDefinition.structures) {
      for (const shelf of structure.shelves) {
        for (const layer of shelf.layers) {
          if (layer.state === LayerState.INVISIBLE) continue;

          for (const slot of layer.slots) {
            if (identityPointer < identities.length) {
              const identity = identities[identityPointer];
              const objectId = `o${objectIdCounter++}`;

              objects[objectId] = {
                type: identity.type,
                color: identity.color,
                blocked: false,
                special: false,
                specialType: 'NONE'
              };

              slot.objectId = objectId;
              identityPointer++;
            } else {
              slot.objectId = null;
            }
          }
        }
      }
    }

    console.log(`📦 Nivel ${levelNumber}: ${actualTrioCount} tríos, ${actualObjectsToPlace} objetos, Tema: ${theme.name}`);

    return new LevelDefinition(
      baseDefinition.levelNumber,
      baseDefinition.structures,
      objects,
      baseDefinition.timer,
      baseDefinition.configuration
    );
  }

  static shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  static detectDeviceType() {
    const width = typeof window !== 'undefined' ? window.innerWidth : 800;
    if (width < 768) return 'mobile';
    else if (width < 1024) return 'tablet';
    else return 'desktop';
  }

  static getDeviceLimits() {
    const deviceType = this.detectDeviceType();
    const DEVICE_LIMITS = {
      mobile: { maxShelvesPerStructure: 2, maxStructures: 2 },
      tablet: { maxShelvesPerStructure: 3, maxStructures: 3 },
      desktop: { maxShelvesPerStructure: 2, maxStructures: 4 }
    };
    return DEVICE_LIMITS[deviceType] || DEVICE_LIMITS.desktop;
  }
}