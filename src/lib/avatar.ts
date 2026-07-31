import React from 'react';

export const HAIR_OPTIONS = [
  { value: 'shortFlat', label: 'Rambut Pendek Rapi 💇‍♂️' },
  { value: 'shortRound', label: 'Rambut Pendek Bulat 🧑' },
  { value: 'theCaesarAndSidePart', label: 'Rambut Belah Samping 🧑‍💼' },
  { value: 'theCaesar', label: 'Rambut Caesar 👨' },
  { value: 'frizzle', label: 'Rambut Keriting Pendek 🌀' },
  { value: 'shaggyMullet', label: 'Rambut Mullet Gaul 🤘' },
  { value: 'straight01', label: 'Rambut Panjang Lurus 👩' },
  { value: 'curly', label: 'Rambut Panjang Ikal 👩‍🦱' },
  { value: 'bob', label: 'Rambut Bob Klasik 💇‍♀️' },
  { value: 'bun', label: 'Rambut Sanggul Lucu 👱‍♀️' },
  { value: 'fro', label: 'Rambut Afro Kribo 🦁' },
  { value: 'hijab', label: 'Hijab Anggun 🧕' },
  { value: 'turban', label: 'Turban Cantik 👳‍♀️' },
  { value: 'hat', label: 'Topi Gaul 🧢' },
  { value: 'winterHat1', label: 'Topi Kupluk 🧶' }
];

export const HAIR_COLOR_OPTIONS = [
  { value: '2c1b18', label: 'Hitam 🖤' },
  { value: '4a312c', label: 'Cokelat Tua 🤎' },
  { value: '724133', label: 'Cokelat Jahe 🧡' },
  { value: 'c93305', label: 'Merah / Auburn ❤️' },
  { value: 'ecdcbf', label: 'Pirang (Blonde) 💛' },
  { value: 'e8e1e1', label: 'Abu-abu / Perak 🤍' },
  { value: 'f59797', label: 'Pastel Pink 🌸' }
];

export const EYE_OPTIONS = [
  { value: 'default', label: 'Biasa 👀' },
  { value: 'happy', label: 'Gembira 😊' },
  { value: 'wink', label: 'Berkedip 😉' },
  { value: 'hearts', label: 'Jatuh Cinta 😍' },
  { value: 'side', label: 'Melirik 😏' },
  { value: 'squint', label: 'Fokus/Sipit 🧐' },
  { value: 'closed', label: 'Terpejam 😌' },
  { value: 'surprised', label: 'Terkejut 😮' }
];

export const MOUTH_OPTIONS = [
  { value: 'default', label: 'Tersenyum Tipis 🙂' },
  { value: 'smile', label: 'Senyum Lebar 😀' },
  { value: 'twinkle', label: 'Senyum Bintang 🌟' },
  { value: 'tongue', label: 'Melet Lucu 😜' },
  { value: 'serious', label: 'Serius 😐' },
  { value: 'grimace', label: 'Nyengir 😬' },
  { value: 'concerned', label: 'Khawatir 😟' }
];

export const ACCESSORY_OPTIONS = [
  { value: 'none', label: 'Tanpa Kacamata ❌' },
  { value: 'prescription01', label: 'Kacamata Kotak 👓' },
  { value: 'prescription02', label: 'Kacamata Bulat 🤓' },
  { value: 'round', label: 'Kacamata Retro 😎' },
  { value: 'sunglasses', label: 'Kacamata Hitam 🕶️' },
  { value: 'wayfarers', label: 'Kacamata Wayfarer 🕶️' }
];

export const CLOTHING_OPTIONS = [
  { value: 'graphicShirt', label: 'Kaos Bergambar 👕' },
  { value: 'hoodie', label: 'Jaket Hoodie 🧥' },
  { value: 'blazerAndShirt', label: 'Kemeja & Blazer 👔' },
  { value: 'blazerAndSweater', label: 'Sweater & Blazer 🧶' },
  { value: 'collarAndSweater', label: 'Sweater Berkerah 🧣' },
  { value: 'overall', label: 'Baju Kodok/Overall 👨‍🔧' },
  { value: 'shirtCrewNeck', label: 'Kaos Polos 👕' },
  { value: 'shirtVNeck', label: 'Kaos Kerah V 👕' }
];

export const CLOTHING_COLOR_OPTIONS = [
  { value: 'ff4848', label: 'Merah Ceria ❤️' },
  { value: '65c9ff', label: 'Biru Cerah 💙' },
  { value: '51a09e', label: 'Toska Indah 💚' },
  { value: 'ffb848', label: 'Kuning Terang 💛' },
  { value: 'ff9eb5', label: 'Pink Pastel 🌸' },
  { value: '262e33', label: 'Hitam Keren 🖤' },
  { value: 'e6e6e6', label: 'Putih Bersih 🤍' }
];

export const SKIN_OPTIONS = [
  { value: 'edb98a', label: 'Putih Gading 🧑🏻' },
  { value: 'ffdbb4', label: 'Kuning Langsat 🧑🏼' },
  { value: 'd08b5b', label: 'Sawo Matang 🧑🏽' },
  { value: 'ae5d29', label: 'Cokelat Manis 🧑🏾' },
  { value: '614335', label: 'Gelap Eksotis 🧑🏿' }
];

export function getAvatarUrl(name: string, gender: 'L' | 'P' | string = 'L'): string {
  const seed = encodeURIComponent((name || 'Siswa').trim() + '_' + gender);
  if (gender === 'P') {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&top=straight01,straight02,bob,curly,dreads,frida,fro,froBand,hijab,turban,bun&facialHairProbability=0`;
  } else {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&top=shortFlat,shortRound,shortWaved,frizzle,shaggy,shaggyMullet,theCaesar,theCaesarAndSidePart`;
  }
}

import { formatImageUrl } from './utils';

/**
 * Helper to get student avatar src in priority order:
 * 1. student.photoUrl (Real photo URL e.g. /avatars/nama.webp or Cloud Storage URL)
 * 2. student.avatarUrl (Customized or saved DiceBear avatar URL)
 * 3. Default DiceBear fallback generated using student name and gender
 * 
 * Recommended avatar photo specs for performance:
 * - Dimensions: 300x300 or 512x512 px square
 * - Format: WebP preferred
 * - Size: 20KB - 80KB target size
 * - Storage path example: public/avatars/alkholifi.webp -> "/avatars/alkholifi.webp"
 */
export function getStudentAvatarSrc(student?: { photoUrl?: string; avatarUrl?: string; name?: string; gender?: string } | null): string {
  if (!student) return getAvatarUrl('Siswa', 'L');
  if (student.photoUrl && student.photoUrl.trim() !== '') {
    return formatImageUrl(student.photoUrl);
  }
  if (student.avatarUrl && student.avatarUrl.trim() !== '') {
    return formatImageUrl(student.avatarUrl);
  }
  return getAvatarUrl(student.name || 'Siswa', student.gender || 'L');
}

export function buildCustomAvatarUrl(options: any): string {
  const { seed, top, hairColor, eyes, mouth, accessories, clothing, clothingColor, skinColor } = options;
  const baseUrl = 'https://api.dicebear.com/7.x/avataaars/svg';
  const params = new URLSearchParams();
  
  if (seed) params.set('seed', seed);
  if (top) params.set('top', top);
  if (hairColor) params.set('hairColor', hairColor);
  if (eyes) params.set('eyes', eyes);
  if (mouth) params.set('mouth', mouth);
  
  if (accessories && accessories !== 'none') {
    params.set('accessories', accessories);
    params.set('accessoriesProbability', '100');
  } else {
    params.set('accessoriesProbability', '0');
  }
  
  if (clothing) params.set('clothing', clothing);
  if (clothingColor) params.set('clothingColor', clothingColor);
  if (skinColor) params.set('skinColor', skinColor);
  
  params.set('facialHairProbability', '0'); // Safety for kids
  
  return `${baseUrl}?${params.toString()}`;
}

export function parseAvatarUrl(url: string, name: string, gender?: string): any {
  const defaultOptions = {
    seed: encodeURIComponent((name || 'student').trim() + '_' + (gender || 'L')),
    top: gender === 'P' ? 'straight01' : 'shortFlat',
    hairColor: '2c1b18',
    eyes: 'default',
    mouth: 'default',
    accessories: 'none',
    clothing: 'graphicShirt',
    clothingColor: '262e33',
    skinColor: 'ffdbb4'
  };

  if (!url || !url.includes('api.dicebear.com')) {
    return defaultOptions;
  }

  try {
    const parsedUrl = new URL(url);
    const searchParams = parsedUrl.searchParams;
    const topVal = searchParams.get('top') || searchParams.get('topType');
    const accVal = searchParams.get('accessories') || 'none';
    const accProb = searchParams.get('accessoriesProbability');
    
    return {
      seed: searchParams.get('seed') || defaultOptions.seed,
      top: topVal || defaultOptions.top,
      hairColor: searchParams.get('hairColor') || defaultOptions.hairColor,
      eyes: searchParams.get('eyes') || defaultOptions.eyes,
      mouth: searchParams.get('mouth') || defaultOptions.mouth,
      accessories: accProb === '0' ? 'none' : accVal,
      clothing: searchParams.get('clothing') || defaultOptions.clothing,
      clothingColor: searchParams.get('clothingColor') || defaultOptions.clothingColor,
      skinColor: searchParams.get('skinColor') || defaultOptions.skinColor
    };
  } catch (e) {
    return defaultOptions;
  }
}

export function handleAvatarError(e: React.SyntheticEvent<HTMLImageElement, Event>, name?: string, gender?: string) {
  const target = e.currentTarget;
  target.src = getAvatarUrl(name || 'Siswa', gender || 'L');
}
