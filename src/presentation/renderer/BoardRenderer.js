/**
 * BoardRenderer - Transforma el LevelState en elementos DOM.
 * 
 * Integrado con AssetManager para renderizar imágenes personalizadas.
 */
import { LayerState } from '../../core/model/Layer.js';
import { themeRegistry } from '../../core/themes/ObjectTheme.js';
import { assetManager } from './AssetManager.js';

export class BoardRenderer {
  constructor(boardElement, ghostElement) {
    this.boardElement = boardElement;
    this.ghostElement = ghostElement;
    this.useImages = true;
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
  }

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

    if (this.useImages) {
      const currentTheme = themeRegistry.getCurrent();
      if (currentTheme) {
        const img = assetManager.getImage(currentTheme.id, obj.type, obj.color);
        
        if (img) {
          const imgElement = img.cloneNode();
          imgElement.className = 'object-image';
          imgElement.alt = `${obj.type} ${obj.color}`;
          objDiv.appendChild(imgElement);
        } else {
          objDiv.textContent = this._getFallbackGlyph(obj);
        }
      } else {
        objDiv.textContent = this._getFallbackGlyph(obj);
      }
    } else {
      objDiv.textContent = this._getFallbackGlyph(obj);
    }
    
    return objDiv;
  }

  _getFallbackGlyph(obj) {
    const currentTheme = themeRegistry.getCurrent();
    if (currentTheme) {
      return currentTheme.getGlyph(obj.type, obj.color) || '';
    }
    return '❓';
  }

  /**
   * CORRECCIÓN: Muestra el ghost clonando la imagen real del objeto
   * @param {HTMLElement} sourceElement - El elemento .object original
   * @param {number} x - Posición X
   * @param {number} y - Posición Y
   */
  showGhostFromElement(sourceElement, x, y) {
    if (!this.ghostElement) return;
    
    // Limpiar contenido anterior
    this.ghostElement.innerHTML = '';
    this.ghostElement.textContent = '';
    
    // Buscar la imagen dentro del elemento origen
    const sourceImage = sourceElement.querySelector('.object-image');
    
    if (sourceImage) {
      // Clonar la imagen real
      const clonedImage = sourceImage.cloneNode(true);
      clonedImage.className = 'ghost-image';
      clonedImage.style.pointerEvents = 'none';
      clonedImage.style.userSelect = 'none';
      this.ghostElement.appendChild(clonedImage);
    } else {
      // Fallback a texto/emoji si no hay imagen
      this.ghostElement.textContent = sourceElement.textContent || '❓';
    }
    
    this.ghostElement.style.display = 'block';
    this.ghostElement.style.left = `${x}px`;
    this.ghostElement.style.top = `${y}px`;
  }

  showGhost(glyph, x, y) {
    if (!this.ghostElement) return;
    this.ghostElement.innerHTML = '';
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
    this.ghostElement.innerHTML = '';
  }

  highlightSlot(slotId) {
    document.querySelectorAll('.slot.highlight').forEach(el => el.classList.remove('highlight'));
    if (slotId) {
      const el = document.querySelector(`.slot[data-slot-id="${slotId}"]`);
      if (el) el.classList.add('highlight');
    }
  }
}