import { dataClient, isDemoMode } from '../lib/dataClient';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 1000;

/**
 * Check an uploaded file before reading it.
 * @param {File} file
 * @returns {void}
 */
export function validateImageFile(file) {
  if (!file) throw new Error('Choose an image file.');
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error('Use a JPG, PNG or WebP image.');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('The image must be smaller than 5 MB.');
  }
}

/**
 * Downscale an image in the browser so uploads stay small.
 * @param {File} file
 * @returns {Promise<Blob>}
 */
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
      const width = Math.round(image.width * scale);
      const height = Math.round(image.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Could not process the image.'));
        return;
      }
      context.fillStyle = '#f6f6f3';
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Could not process the image.'))),
        'image/jpeg',
        0.85,
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read that image.'));
    };

    image.src = objectUrl;
  });
}

/**
 * Read a blob as a data URL (used by the offline demo backend).
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read that image.'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Upload a product image and return the URL to store on the product.
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function uploadProductImage(file) {
  validateImageFile(file);
  const compressed = await compressImage(file);
  if (isDemoMode) return blobToDataUrl(compressed);

  const named = new File([compressed], file.name.replace(/\.[^.]+$/, '') + '.jpg', {
    type: 'image/jpeg',
  });
  return dataClient.storage.uploadProductImage(named);
}
