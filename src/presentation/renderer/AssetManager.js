/**
 * AssetManager - Gestiona la carga y caché de imágenes
 * 
 * Según Modelo de Datos §86-87:
 * - La representación visual es consecuencia de los datos
 * - Separa la lógica del juego de la representación gráfica
 * 
 * Soporta dos modos:
 * 1. Modo simple: {type}.png (cuando color = "01")
 * 2. Modo completo: {type}_{color}.png (para temas con colores variables)
 */
export class AssetManager {
  constructor() {
    this.images = new Map();
    this.loadingPromises = new Map();
    this.basePath = 'assets/objects/';
  }

  /**
   * Obtiene la ruta de una imagen basada en tema, tipo y color
   * @param {string} themeId - ID del tema (peluches_01, peluches_02, etc.)
   * @param {string} type - Tipo de objeto (01, 02, BEAR, OWL, etc.)
   * @param {string} color - Color (01, BROWN, WHITE, etc.)
   * @returns {string} Ruta de la imagen
   */
  getImagePath(themeId, type, color) {
    // themeId se usa directamente como nombre de carpeta
    // peluches_02 → assets/objects/peluches_02/
    const themeFolder = themeId;
    const typeName = type.toLowerCase();
    const colorName = color.toLowerCase();
    
    // Si color es "01", usamos modo simple: {type}.png
    // Si no, usamos modo completo: {type}_{color}.png
    if (color === '01') {
      return `${this.basePath}${themeFolder}/${typeName}.png`;
    } else {
      return `${this.basePath}${themeFolder}/${typeName}_${colorName}.png`;
    }
  }

  /**
   * Carga una imagen y la almacena en caché
   * @param {string} key - Clave única (themeId:type:color)
   * @param {string} src - Ruta de la imagen
   * @returns {Promise<HTMLImageElement>}
   */
  async loadImage(key, src) {
    // Si ya está cargada, devolverla inmediatamente
    if (this.images.has(key)) {
      return this.images.get(key);
    }

    // Si ya se está cargando, esperar a esa promesa
    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key);
    }

    // Crear nueva promesa de carga
    const loadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(key, img);
        this.loadingPromises.delete(key);
        resolve(img);
      };
      img.onerror = () => {
        console.error(`❌ Error al cargar imagen: ${src}`);
        this.loadingPromises.delete(key);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });

    this.loadingPromises.set(key, loadPromise);
    return loadPromise;
  }

  /**
   * Obtiene una imagen cargada
   * @param {string} themeId 
   * @param {string} type 
   * @param {string} color 
   * @returns {HTMLImageElement|null}
   */
  getImage(themeId, type, color) {
    const key = `${themeId}:${type}:${color}`;
    return this.images.get(key) || null;
  }

  /**
   * Precarga un conjunto de imágenes
   * @param {Array<Object>} objects - Lista de objetos {themeId, type, color}
   * @returns {Promise<void>}
   */
  async preloadObjects(objects) {
    const promises = objects.map(obj => {
      const key = `${obj.themeId}:${obj.type}:${obj.color}`;
      const src = this.getImagePath(obj.themeId, obj.type, obj.color);
      return this.loadImage(key, src);
    });

    try {
      await Promise.all(promises);
      console.log(`✅ Assets precargados: ${objects.length} imágenes`);
    } catch (error) {
      console.warn('⚠️ Algunas imágenes no se pudieron cargar:', error);
    }
  }

  /**
   * Precarga todas las imágenes de un tema
   * @param {ObjectTheme} theme 
   * @returns {Promise<void>}
   */
  async preloadTheme(theme) {
    const objects = theme.objects.map(obj => ({
      themeId: theme.id,
      type: obj.type,
      color: obj.color
    }));

    await this.preloadObjects(objects);
    console.log(`✅ Tema "${theme.name}" precargado`);
  }

  /**
   * Limpia el caché de imágenes
   */
  clearCache() {
    this.images.clear();
    this.loadingPromises.clear();
  }

  /**
   * Obtiene estadísticas de uso
   */
  getStats() {
    return {
      loaded: this.images.size,
      loading: this.loadingPromises.size
    };
  }
}

// Instancia global
export const assetManager = new AssetManager();