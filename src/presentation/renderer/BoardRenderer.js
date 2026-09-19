/**
 * BoardRenderer - Transforma el LevelState en elementos DOM.
 * 
 * Según Modelo de Datos §86-87:
 * - La interfaz representa el estado, no lo define.
 * - Integrado con AssetManager para renderizar imágenes personalizadas.
 */
import { LayerState } from '../../core/model/Layer.js';
import { themeRegistry } from '../../core/themes/ObjectTheme.js';
import { assetManager } from './AssetManager.js';

export class BoardRenderer {
  constructor(boardElement, ghostElement) {
    this.boardElement = boardElement;
    this.ghostElement = ghostElement;
    this.useImages = true; // Cambiar a false para usar emojis como fallback
  }

  render(levelState) {
    if (!this.boardElement) {
      console.error('❌ BoardRenderer: boardElement no definido');
      return;
    }
    
    if (!levelState || !levelState.board) {
      console.error('❌ BoardRenderer: levelState o board no definido');
      return;
    }

    console.log('🎨 BoardRenderer.render: Iniciando renderizado de', levelState.board.structures.length, 'estructuras');
    
    this.boardElement.innerHTML = '';

    levelState.board.structures.forEach((structure, structIdx) => {
      const structDiv = document.createElement('div');
      structDiv.className = 'structure';
      structDiv.dataset.structureIndex = structIdx;

      structure.shelves.forEach((shelf, shelfIdx) => {
        const shelfDiv = document.createElement('div');
        shelfDiv.className = 'shelf';
        shelfDiv.dataset.shelfIndex = shelfIdx;
        shelfDiv.dataset.behavior = shelf.behavior;
        shelfDiv.dataset.type = shelf.type;

        if (shelf.collapsed) {
          shelfDiv.classList.add('collapsed-placeholder');
        } else {
          shelf.layers.forEach((layer, layerIdx) => {
            const layerDiv = document.createElement('div');
            layerDiv.className = `layer ${layer.state.toLowerCase()}`;
            layerDiv.dataset.layerIndex = layerIdx;

            layer.slots.forEach((slot, slotIdx) => {
              const slotDiv = document.createElement('div');
              slotDiv.className = 'slot';
              slotDiv.dataset.slotId = slot.id;
              slotDiv.dataset.slotIndex = slotIdx;

              if (slot.objectId && levelState.dynamicState.has(slot.objectId)) {
                const obj = levelState.dynamicState.get(slot.objectId);
                const objDiv = this._createObjectElement(obj, layer);
                slotDiv.appendChild(objDiv);
              }

              layerDiv.appendChild(slotDiv);
            });

            shelfDiv.appendChild(layerDiv);
          });
        }

        structDiv.appendChild(shelfDiv);
      });

      this.boardElement.appendChild(structDiv);
    });
    
    console.log('🎨 BoardRenderer.render: Renderizado completado. Elementos en board:', this.boardElement.children.length);
  }

  /**
   * Crea un elemento de objeto (imagen o emoji)
   * @param {Object} obj - Objeto del juego
   * @param {Layer} layer - Capa del objeto
   * @returns {HTMLElement}
   */
  _createObjectElement(obj, layer) {
    const objDiv = document.createElement('div');
    objDiv.className = 'object';
    objDiv.dataset.objectId = obj.id;
    
    if (obj.blocked) {
      objDiv.classList.add('blocked');
    }
    
    if (layer.state === LayerState.TOP && !obj.blocked) {
      objDiv.dataset.interactive = 'true';
      objDiv.style.cursor = 'grab';
    } else {
      objDiv.style.cursor = 'default';
    }

    // Intentar usar imagen personalizada
    if (this.useImages) {
      const currentTheme = themeRegistry.getCurrent();
      if (currentTheme) {
        const img = assetManager.getImage(currentTheme.id, obj.type, obj.color);
        
        if (img) {
          // Usar imagen cargada
          const imgElement = img.cloneNode();
          imgElement.className = 'object-image';
          imgElement.alt = `${obj.type} ${obj.color}`;
          objDiv.appendChild(imgElement);
        } else {
          // Imagen no cargada aún - mostrar placeholder o emoji
          objDiv.textContent = this._getFallbackGlyph(obj);
          console.warn(`⚠️ Imagen no cargada: ${currentTheme.id}:${obj.type}:${obj.color}`);
        }
      } else {
        objDiv.textContent = this._getFallbackGlyph(obj);
      }
    } else {
      // Fallback a emojis
      objDiv.textContent = this._getFallbackGlyph(obj);
    }
    
    return objDiv;
  }

  /**
   * Obtiene un emoji de fallback si la imagen no está disponible
   * @param {Object} obj 
   * @returns {string}
   */
  _getFallbackGlyph(obj) {
    const currentTheme = themeRegistry.getCurrent();
    if (currentTheme) {
      return currentTheme.getGlyph(obj.type, obj.color) || '❓';
    }
    return '❓';
  }

  showGhost(glyph, x, y) {
    if (!this.ghostElement) return;
    this.ghostElement.textContent = glyph;
    this.ghostElement.style.display = 'block';
    this.ghostElement.style.left = `${x}px`;
    this.ghostElement.style.top = `${y}px`;
  }

  moveGhost(x, y) {
    if (!this.ghostElement) return;
    this.ghostElement.style.left = `${x}px`;
    this.ghostElement.style.top = `${y}px`;
  }

  hideGhost() {
    if (!this.ghostElement) return;
    this.ghostElement.style.display = 'none';
  }

  highlightSlot(slotId) {
    document.querySelectorAll('.slot.highlight').forEach(el => el.classList.remove('highlight'));
    if (slotId) {
      const el = document.querySelector(`.slot[data-slot-id="${slotId}"]`);
      if (el) el.classList.add('highlight');
    }
  }
}