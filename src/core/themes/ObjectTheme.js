/**
 * ObjectTheme - Gestiona los diferentes temas/packs de objetos del juego.
 * 
 * Según Modelo de Datos §27-29:
 * - Cada objeto tiene type + color que forman su identidad
 * - La representación visual es consecuencia de los datos
 * - Permite cambiar entre diferentes conjuntos de objetos
 */

/**
 * Clase que representa un tema de objetos
 */
export class ObjectTheme {
  /**
   * @param {string} id - Identificador del tema (ej: 'peluches_01', 'peluches_02')
   * @param {string} name - Nombre visible del tema
   * @param {Array<Object>} objects - Lista de objetos disponibles
   * @param {Object} metadata - Metadatos adicionales
   */
  constructor(id, name, objects, metadata = {}) {
    this.id = id;
    this.name = name;
    this.objects = objects;
    this.metadata = metadata;
    
    // Validar que haya al menos 3 tipos diferentes
    const types = new Set(objects.map(o => o.type));
    const colors = new Set(objects.map(o => o.color));
    
    if (types.size < 3) {
      throw new Error(`Tema ${id}: Se requieren al menos 3 tipos diferentes (hay ${types.size})`);
    }
    
    // NOTA: No exigimos 3 colores si el tema usa un color fijo único (ej. '01').
    // La identidad del objeto es `type + color`. 
    // Por tanto, 15 tipos con 1 color = 15 identidades únicas, lo cual es perfectamente válido 
    // para formar tríos (necesitamos 3 objetos con la MISMA identidad type+color).
    if (colors.size < 3 && colors.size !== 1) {
      throw new Error(`Tema ${id}: Se requieren al menos 3 colores diferentes (hay ${colors.size}), a menos que se use un único color fijo como '01'.`);
    }
    
    console.log(`✅ Tema cargado: ${name} (${objects.length} objetos, ${types.size} tipos, ${colors.size} colores)`);
  }

  /**
   * Obtiene un objeto aleatorio del tema
   * @returns {Object} {type, color, glyph}
   */
  getRandomObject() {
    const index = Math.floor(Math.random() * this.objects.length);
    return { ...this.objects[index] };
  }

  /**
   * Obtiene todos los tipos disponibles
   * @returns {Set<string>}
   */
  getTypes() {
    return new Set(this.objects.map(o => o.type));
  }

  /**
   * Obtiene todos los colores disponibles
   * @returns {Set<string>}
   */
  getColors() {
    return new Set(this.objects.map(o => o.color));
  }

  /**
   * Obtiene la representación visual (glyph) para un tipo y color
   * @param {string} type 
   * @param {string} color 
   * @returns {string}
   */
  getGlyph(type, color) {
    const obj = this.objects.find(o => o.type === type && o.color === color);
    return obj ? obj.glyph : '';
  }

  /**
   * Obtiene todos los glyphs del tema
   * @returns {Object} Mapa type -> color -> glyph
   */
  getAllGlyphs() {
    const glyphs = {};
    for (const obj of this.objects) {
      if (!glyphs[obj.type]) {
        glyphs[obj.type] = {};
      }
      glyphs[obj.type][obj.color] = obj.glyph;
    }
    return glyphs;
  }

  /**
   * Serialización
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      objects: this.objects,
      metadata: this.metadata
    };
  }

  /**
   * Reconstrucción desde JSON
   */
  static fromJSON(data) {
    return new ObjectTheme(data.id, data.name, data.objects, data.metadata);
  }
}

/**
 * Registro global de temas disponibles
 */
export class ThemeRegistry {
  constructor() {
    this.themes = new Map();
    this.currentTheme = null;
  }

  /**
   * Registra un tema
   * @param {ObjectTheme} theme 
   */
  register(theme) {
    if (this.themes.has(theme.id)) {
      console.warn(`⚠️ El tema '${theme.id}' ya está registrado. Se sobrescribirá.`);
    }
    this.themes.set(theme.id, theme);
    console.log(`📝 Tema registrado: ${theme.name}`);
  }

  /**
   * Obtiene un tema por ID
   * @param {string} themeId 
   * @returns {ObjectTheme|null}
   */
  get(themeId) {
    return this.themes.get(themeId) || null;
  }

  /**
   * Establece el tema actual
   * @param {string} themeId 
   * @returns {boolean}
   */
  setCurrent(themeId) {
    const theme = this.get(themeId);
    if (theme) {
      this.currentTheme = theme;
      console.log(`🎨 Tema activo: ${theme.name}`);
      return true;
    }
    console.error(`❌ Tema '${themeId}' no encontrado. Temas disponibles: ${Array.from(this.themes.keys()).join(', ')}`);
    return false;
  }

  /**
   * Obtiene el tema actual
   * @returns {ObjectTheme|null}
   */
  getCurrent() {
    return this.currentTheme;
  }

  /**
   * Lista todos los temas disponibles
   * @returns {Array<{id: string, name: string}>}
   */
  listThemes() {
    return Array.from(this.themes.values()).map(t => ({
      id: t.id,
      name: t.name
    }));
  }

  /**
   * Obtiene un objeto del tema actual
   * @returns {Object|null}
   */
  getRandomObject() {
    return this.currentTheme ? this.currentTheme.getRandomObject() : null;
  }
}

// Instancia global del registro
export const themeRegistry = new ThemeRegistry();