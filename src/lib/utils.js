/**
 * Safely adds opacity to a hex color string.
 * Prevents crashes on Android when invalid color strings are passed to native components.
 */
export const addOpacity = (hex, opacityHex = '22') => {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
    return '#88888822'; // Safe fallback
  }
  // Remove existing alpha if present (e.g., #RRGGBBAA)
  const baseHex = hex.length > 7 ? hex.substring(0, 7) : hex;
  return baseHex + opacityHex;
};

/**
 * Safely formats currency for the Philippine Peso.
 */
export const formatPeso = (amount) => {
  const value = Number(amount);
  if (isNaN(value)) return '₱0.00';
  return '₱' + value.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Safely formats dates to avoid crashes on Android devices with limited Intl support.
 */
export const formatDate = (dateStr) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Invalid date';
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  } catch (e) {
    return 'Invalid date';
  }
};

export const formatTime = (dateStr) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '--:--';
    
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
  } catch (e) {
    return '--:--';
  }
};
