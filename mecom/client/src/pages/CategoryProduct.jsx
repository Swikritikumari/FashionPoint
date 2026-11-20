import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaCartPlus, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { signOutSuccess } from '../redux/user/userSlice';
import { FaHeart } from 'react-icons/fa';
import chooseProductSize from '../utils/chooseProductSize.js';
import getProductSizes from '../utils/getProductSizes.js';

export default function CategoryProduct() {

    const [categoryProducts, setcategoryProducts] = useState({ 
        category: {}, 
        products: [] 
    });
    const params = useParams();
    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const [wishlistIds, setWishlistIds] = useState([]);

    useEffect(() => {
        try {
            const fetchProduct = async () => {
                const res = await fetch(`/api/product/productByCategory/${params.categoryId}`);
                const data = await res.json();
                if (res.ok) {
                    setcategoryProducts(data)
                }
            }
            fetchProduct();
        } catch (error) {
            console.log(error.message);
        }
        
    }, [params.categoryId]);

    useEffect(() => {
        if (!currentUser) {
            setWishlistIds([]);
            return;
        }
        fetch('/api/user/wishlist', { credentials: 'include' })
            .then((res) => res.ok ? res.json() : [])
            .then((items) => setWishlistIds(items.map((item) => item._id)))
            .catch(() => setWishlistIds([]));
    }, [currentUser]);

    const handleProductPage = (productId) => {
        navigate(`/product/${productId}`)
    }

    const handleAddToCart = async (event, product) => {
        event.stopPropagation();
        if (!currentUser) {
            toast.info('Please sign in to add products to your cart.');
            navigate('/sign-in');
            return;
        }
        const availableSizes = getProductSizes(product);
        const size = availableSizes.length ? await chooseProductSize(availableSizes, product.name) : '';
        if (availableSizes.length && !size) return;
        try {
            const res = await fetch('/api/cart/addToCart', {
                credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser._id, productId: product._id, quantity: 1, ...(size ? { size } : {}) })
            });
            const data = await res.json();
            if (res.status === 401) {
                dispatch(signOutSuccess());
                toast.info('Your session expired. Please sign in again.');
                navigate('/sign-in');
                return;
            }
            if (!res.ok) throw new Error(data.message || 'Could not add product to cart');
            toast.success('Product added to cart');
            navigate('/cart');
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleWishlist = async (event, product) => {
        event.stopPropagation();
        if (!currentUser) {
            toast.info('Please sign in to save products to your wishlist.');
            navigate('/sign-in');
            return;
        }
        try {
            const res = await fetch('/api/user/wishlist', {
                credentials: 'include', method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product._id })
            });
            const data = await res.json();
            if (res.status === 401) {
                dispatch(signOutSuccess());
                toast.info('Your session expired. Please sign in again.');
                navigate('/sign-in');
                return;
            }
            if (!res.ok) throw new Error(data.message || 'Could not update wishlist');
            setWishlistIds((ids) => data.isWishlisted
                ? [...new Set([...ids, product._id])]
                : ids.filter((id) => id !== product._id));
            toast.success(data.isWishlisted ? 'Added to wishlist' : 'Removed from wishlist');
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleBuyNow = (event, product) => {
        event.stopPropagation();
        if (!currentUser) {
            toast.info('Please sign in to buy products.');
            navigate('/sign-in');
            return;
        }
        const continueToCheckout = async () => {
            const availableSizes = getProductSizes(product);
            const size = availableSizes.length ? await chooseProductSize(availableSizes, product.name) : '';
            if (availableSizes.length && !size) return;
            navigate(`/checkout/${product._id}${size ? `?size=${encodeURIComponent(size)}` : ''}`);
        };
        continueToCheckout();
    };
    

  return (
    <div className='max-w-6xl mx-auto p-3 min-h-screen'>
        <h1 className='text-3xl font-semibold border-b pb-4 mt-3'>{categoryProducts.category.name}</h1>

        <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {categoryProducts.products.map((product) => (
                <div className='flex min-w-0 w-full overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg sm:flex-col' onClick={() => handleProductPage(product._id)} key={product._id}>
                  <img src={product.imageUrls[0]} alt={product.name} loading='lazy' className='aspect-square h-auto w-2/5 max-w-[160px] shrink-0 object-cover transition-transform duration-300 hover:scale-105 sm:h-auto sm:w-full sm:max-w-none'/>
                  <div className='mt-0 flex min-w-0 w-3/5 flex-col gap-2 p-2 sm:mt-3 sm:w-full sm:p-3'>
                    <div className='flex items-start justify-between gap-2'>
                      <h3 className='text-lg font-semibold text-slate-700 line-clamp-1'>{product.name}</h3>
                      <button type='button' aria-label={wishlistIds.includes(product._id) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`} title={wishlistIds.includes(product._id) ? 'Remove from wishlist' : 'Add to wishlist'} onClick={(event) => handleWishlist(event, product)} className={`shrink-0 p-1 hover:text-rose-700 ${wishlistIds.includes(product._id) ? 'text-red-600' : 'text-slate-400'}`}>
                        {wishlistIds.includes(product._id) ? <FaHeart /> : <FaRegHeart />}
                      </button>
                    </div>
                    <p className='text-sm text-gray-600 line-clamp-2'>{product.description}</p>
                    {product.offer ? (
                      <div className='flex items-center gap-2'>
                        <p className='text-red-600 line-through text-sm'>₹{product.regularPrice.toLocaleString('en-US')}</p>
                        <p className='text-green-600 font-semibold'>₹{product.discountPrice.toLocaleString('en-US')}</p>
                      </div>
                    ) : (
                        <p className='font-semibold'>₹{product.regularPrice.toLocaleString('en-US')}</p>
                    )}
                    <button type='button' onClick={(event) => handleAddToCart(event, product)} className='mt-1 flex items-center justify-center gap-2 rounded-md bg-[#3d52a0] px-3 py-2 font-semibold text-white hover:bg-[#4f62aa]'>
                      <FaCartPlus /> Add to Cart
                    </button>
                    <button type='button' onClick={(event) => handleBuyNow(event, product)} className='flex items-center justify-center gap-2 rounded-md border border-amber-500 px-3 py-2 font-semibold text-amber-800 hover:bg-amber-50'>
                      Buy Now
                    </button>
                  </div>
                </div>
            ))}
        </div>
    </div>
  )
}
