/**
 * Tema: Peluches 01
 * Objetos: Osos, búhos, hámsters, perros, gatos
 * Colores consistentes: BROWN, WHITE, GRAY
 */
import { ObjectTheme } from '../ObjectTheme.js';

export const Peluches01 = new ObjectTheme(
  'peluches_01',
  'Peluches 01',
  [
    // Oso
    { type: 'BEAR', color: 'BROWN', glyph: '' },
    { type: 'BEAR', color: 'WHITE', glyph: '🐻‍❄️' },
    { type: 'BEAR', color: 'GRAY', glyph: '🐨' },
    
    // Búho
    { type: 'OWL', color: 'BROWN', glyph: '🦉' },
    { type: 'OWL', color: 'WHITE', glyph: '🦢' },
    { type: 'OWL', color: 'GRAY', glyph: '🦤' },
    
    // Hámster
    { type: 'HAMSTER', color: 'BROWN', glyph: '🐹' },
    { type: 'HAMSTER', color: 'WHITE', glyph: '🐭' },
    { type: 'HAMSTER', color: 'GRAY', glyph: '🐁' },
    
    // Perro
    { type: 'DOG', color: 'BROWN', glyph: '🐕' },
    { type: 'DOG', color: 'WHITE', glyph: '🐩' },
    { type: 'DOG', color: 'GRAY', glyph: '🐕‍🦺' },
    
    // Gato
    { type: 'CAT', color: 'BROWN', glyph: '' },
    { type: 'CAT', color: 'WHITE', glyph: '🐈‍⬛' },
    { type: 'CAT', color: 'GRAY', glyph: '' }
  ],
  {
    category: 'peluches',
    difficulty: 1,
    description: 'Adorables peluches de animales'
  }
);