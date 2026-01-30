
import type { Order } from './types';

/**
 * Clean Firestore data from circular references and non-serializable objects.
 */
export const stripFirestore = (data: any, seen = new WeakSet()): any => {
  if (data === null || data === undefined) return data;
  const type = typeof data;
  if (type !== 'object') return data;
  if (seen.has(data)) return undefined;

  if (typeof data.toMillis === 'function') return data.toMillis();
  if (typeof data.toDate === 'function') return data.toDate().getTime();

  if (data.id && data.path && typeof data.path === 'string') {
    return data.path;
  }

  if (data.nodeType || data.target || data.srcElement) return undefined;

  seen.add(data);

  if (Array.isArray(data)) {
    return data
      .map((item) => stripFirestore(item, seen))
      .filter((val) => val !== undefined);
  }

  const toStringTag = Object.prototype.toString.call(data);
  if (toStringTag !== '[object Object]') {
    if (typeof data.toString === 'function' && data.toString() !== '[object Object]') {
      return data.toString();
    }
    return undefined;
  }

  const stripped: any = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      if (key.startsWith('_') || key.startsWith('$')) continue;
      const value = data[key];
      if (typeof value === 'function') continue;
      const cleanedValue = stripFirestore(value, seen);
      if (cleanedValue !== undefined) stripped[key] = cleanedValue;
    }
  }

  return stripped;
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};

export const getRouteGeometry = async (lat1: number, lon1: number, lat2: number, lon2: number): Promise<[number, number][]> => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.code === 'Ok' && data.routes?.length > 0) {
      return data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
    }
    return [[lat1, lon1], [lat2, lon2]];
  } catch (error) {
    return [[lat1, lon1], [lat2, lon2]];
  }
};

export const getRoadDistance = async (lat1: number, lon1: number, lat2: number, lon2: number): Promise<{ distance: number, duration: number }> => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return { distance: 0, duration: 0 };
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.code === 'Ok' && data.routes?.length > 0) {
      return {
        distance: parseFloat((data.routes[0].distance / 1000).toFixed(1)),
        duration: Math.ceil(data.routes[0].duration / 60)
      };
    }
    throw new Error('OSRM Fallback');
  } catch (error) {
    const straight = calculateDistance(lat1, lon1, lat2, lon2);
    return { distance: parseFloat((straight * 1.3).toFixed(1)), duration: Math.ceil(straight * 3) };
  }
};

export const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith('data:image')) { resolve(base64Str); return; }
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width; let height = img.height;
      if (width > height) { if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; } }
      else { if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; } }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => resolve(base64Str);
  });
};
