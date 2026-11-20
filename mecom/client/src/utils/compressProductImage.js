const MAX_IMAGE_BYTES = 1_850_000;

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function loadImage(file) {
  if (typeof createImageBitmap === 'function') return createImageBitmap(file);

  const objectUrl = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('This image could not be opened.'));
      image.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default async function compressProductImage(file) {
  if (file.size <= MAX_IMAGE_BYTES) return file;
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    throw new Error('Please use an image under 2 MB or choose a JPEG, PNG, or WebP image to compress.');
  }

  const image = await loadImage(file);
  try {
    const largestSide = Math.max(image.width, image.height);
    let scale = Math.min(1, 1920 / largestSide);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image compression is not available in this browser.');

    for (let attempt = 0; attempt < 12; attempt += 1) {
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const quality = Math.max(0.48, 0.84 - (attempt % 4) * 0.1);
      let blob = await canvasToBlob(canvas, 'image/webp', quality);
      if (!blob || blob.type !== 'image/webp') blob = await canvasToBlob(canvas, 'image/jpeg', quality);
      if (blob && blob.size <= MAX_IMAGE_BYTES) {
        const extension = blob.type === 'image/webp' ? 'webp' : 'jpg';
        const baseName = file.name.replace(/\.[^.]+$/, '');
        return new File([blob], `${baseName}.${extension}`, { type: blob.type });
      }

      if (attempt % 3 === 2) scale *= 0.82;
    }

    throw new Error('This image could not be compressed below 2 MB. Please choose a smaller image.');
  } finally {
    image.close?.();
  }
}
