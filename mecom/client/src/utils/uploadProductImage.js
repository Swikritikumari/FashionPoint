import compressProductImage from './compressProductImage.js';

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.readAsDataURL(file);
  });
}

export default async function uploadProductImage(file) {
  const optimizedFile = await compressProductImage(file);
  const imageData = await readAsDataUrl(optimizedFile);
  const response = await fetch('/api/product/upload-image', {
    credentials: 'include',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageData })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Image upload failed');
  return data.url;
}
