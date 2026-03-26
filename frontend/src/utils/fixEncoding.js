/**
 * Fix lỗi encoding Â· → · thường gặp khi đọc CSV Latin-1 bị hiểu nhầm UTF-8
 */
export function fixText(text) {
  if (!text) return text;
  return text
    .replace(/Â·/g, '·')
    .replace(/Â /g, '')
    .replace(/\u00c2/g, '')
    .trim();
}

/**
 * Parse metadata string: "Beginner · Course · 1 - 4 Weeks"
 */
export function parseMetadata(metadata) {
  if (!metadata) return { level: '', type: '', duration: '' };
  const fixed = fixText(metadata);
  const parts = fixed.split('·').map(p => p.trim());
  return {
    level: parts[0] || '',
    type: parts[1] || '',
    duration: parts[2] || '',
  };
}
