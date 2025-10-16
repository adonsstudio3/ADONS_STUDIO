import mapping from './imageMapping.json';

// Returns a srcSet string for a given mapping key and format ('avif'|'webp'|'original')
export function getSrcSet(key, format) {
  if (!mapping || !mapping[key]) return '';
  const entry = mapping[key];
  if (format === 'original') {
    return entry.original || '';
  }
  const group = entry[format];
  if (!group) return '';
  // group is an object with size keys (strings) -> path
  // produce entries sorted by numeric size ascending
  const sizes = Object.keys(group).map(s => parseInt(s, 10)).filter(n => !isNaN(n)).sort((a,b)=>a-b);
  const parts = sizes.map(s => `${group[String(s)]} ${s}w`);
  return parts.join(', ');
}

export default getSrcSet;
