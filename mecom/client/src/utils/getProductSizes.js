const clothingSizes = ['S', 'M', 'L', 'XL'];
const jeansSizes = ['30', '28', '26', '24'];
const shoeSizes = ['6', '7', '8', '9', '10', '11', '12'];

export default function getProductSizes(product) {
  if (Array.isArray(product?.sizes) && product.sizes.length) return product.sizes;

  const name = String(product?.name || '').toLowerCase();
  const category = typeof product?.categoryId === 'object'
    ? String(product.categoryId?.name || '').toLowerCase()
    : '';

  if (/\b(jeans?|denim|trousers?)\b/.test(name)) return jeansSizes;
  if (/(shoes?|footwear)/.test(category) || /\b(shoes?|sneakers?|trainers?|loafers?|sandals?|boots?)\b/.test(name)) return shoeSizes;
  if (/(wear|clothing|apparel)/.test(category) || /\b(tops?|shirts?|blouses?|dresses?|t-?shirts?|kurtas?)\b/.test(name)) return clothingSizes;
  return [];
}
