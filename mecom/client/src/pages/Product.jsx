import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { IoIosStar } from "react-icons/io";
import { FaCartPlus, FaRegHeart, FaHeart, FaBolt } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux'
import { signOutSuccess } from '../redux/user/userSlice.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import getProductSizes from '../utils/getProductSizes.js';


export default function Product() {

    const params = useParams();
    const [product, setProduct] = useState({ imageUrls: [] });
    const [mainImage, setMainImage] = useState(product.imageUrls[0]);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [selectedSize, setSelectedSize] = useState('');
    const [sizeSelectorOpen, setSizeSelectorOpen] = useState(false);
    const [ratingLoading, setRatingLoading] = useState(false);
    const { currentUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const availableSizes = getProductSizes(product);

    useEffect(() => {
        try {
            const fetchProduct = async () => {
               const res = await fetch(`/api/product/${params.productId}`);
               const data = await res.json();
               if (res.ok) {
                setSelectedSize('');
                setSizeSelectorOpen(false);
                setProduct(data);
               }
            }
            
            fetchProduct();
        } catch (error) {
            toast.error(error.message);
        }
    }, [params.productId]);

    useEffect(() => {
        if (!currentUser) {
            setIsWishlisted(false);
            return;
        }
        fetch('/api/user/wishlist', { credentials: 'include' })
            .then((res) => res.ok ? res.json() : [])
            .then((items) => setIsWishlisted(items.some((item) => item._id === params.productId)))
            .catch(() => setIsWishlisted(false));
    }, [currentUser, params.productId]);

    useEffect(() => {
        if (product.imageUrls.length > 0) {
            setMainImage(product.imageUrls[0]);
        }
    }, [product]);


    const handleAddToCart = async (buyNow = false) => {
        if (!currentUser) {
            toast.info('Please sign in to add products to your cart.');
            navigate('/sign-in');
            return;
        }
        if (!product._id) return;
        if (availableSizes.length && !selectedSize) {
            setSizeSelectorOpen(true);
            toast.info('Choose a size, then continue.');
            return;
        }
        if (buyNow) {
            navigate(`/checkout/${product._id}${selectedSize ? `?size=${encodeURIComponent(selectedSize)}` : ''}`);
            return;
        }
        try {
            const res = await fetch('/api/cart/addToCart', {
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: currentUser._id,
                    productId: product._id,
                    quantity: 1,
                    ...(selectedSize ? { size: selectedSize } : {})
                })
            });
            const data = await res.json()
            if (res.status === 401) {
                dispatch(signOutSuccess());
                toast.info('Your session expired. Please sign in again.');
                navigate('/sign-in');
                return;
            }
            if (!res.ok) throw new Error(data.message || 'Could not add product to cart');
            toast.success(buyNow ? 'Added to cart. Review your order to continue.' : 'Product added to cart');
            navigate('/cart');
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleWishlist = async () => {
        if (!currentUser) {
            toast.info('Please sign in to save products to your wishlist.');
            navigate('/sign-in');
            return;
        }
        setWishlistLoading(true);
        try {
            const res = await fetch('/api/user/wishlist', {
                credentials: 'include', method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product._id })
            });
            const data = await res.json();
            if (res.status === 401) {
                dispatch(signOutSuccess());
                navigate('/sign-in');
                return;
            }
            if (!res.ok) throw new Error(data.message || 'Could not update wishlist');
            setIsWishlisted(data.isWishlisted);
            toast.success(data.isWishlisted ? 'Added to wishlist' : 'Removed from wishlist');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleRateProduct = async (rating) => {
        if (!currentUser) {
            toast.info('Please sign in to rate this product.');
            navigate('/sign-in');
            return;
        }
        if (ratingLoading) return;
        setRatingLoading(true);
        try {
            const res = await fetch(`/api/product/${product._id}/rating`, {
                credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating })
            });
            const data = await res.json();
            if (res.status === 401) {
                dispatch(signOutSuccess());
                toast.info('Your session expired. Please sign in again.');
                navigate('/sign-in');
                return;
            }
            if (!res.ok) throw new Error(data.message || 'Could not save your rating');
            setProduct((current) => ({ ...current, ...data }));
            toast.success('Your rating has been saved.');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setRatingLoading(false);
        }
    };

  return (
    <div className='max-w-6xl mx-auto'>
        <div className="p-3">
            <h1 className='text-3xl font-semibold pb-3 border-b'>Product Details</h1>
            <div className="flex flex-col md:flex-row gap-5 mt-5 overflow-hidden">

                <div className="flex md:flex-1 lg:flex-none flex-col sm:flex-row md:flex-col gap-2 w-full lg:w-96 sm:h-[30rem] sm:ml-9 md:ml-0 md:h-full ">

                    <div className="relative">
                        <img src={mainImage} alt='' className="w-full sm:h-[30rem] lg:w-[25rem] md:h-full sm:order-2 md:order-1 "/>
                        {product.trending && (
                            <span className="bg-orange-500 text-white font-semibold rounded-2xl text-center text-xs absolute px-2 py-1 start-3 top-3 z-10">HOT</span>
                        )}
                    </div>

                    <div className="flex sm:flex-col md:flex-row gap-1 overflow-x-auto sm:order-1 md:order-2 custom-scrollbar">
                        {product.imageUrls.map((image, index) => (
                            <img src={image} alt="product images" key={index} className="w-16 sm:w-32 lg:w-20" onClick={() => setMainImage(image)}/>
                        ))}
                    </div>

                </div>

                <div className="mt-4 flex-1 max-w-xl sm:ml-9 md:ml-0">
                    <h3 className="text-2xl font-semibold text-slate-700">{product.name}</h3>
                    {product.offer ? (
                        <div className="text-xl mt-7 flex gap-3 items-center font-semibold">
                            <p className="text-lg text-red-600 line-through mt-1">Rs. {product.regularPrice}</p>
                            <p>Rs. {product.discountPrice}</p>
                        </div>
                    ) : <p className="text-xl mt-7 font-semibold">Rs. {product.regularPrice}</p>}
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                        <div role="radiogroup" aria-label="Rate this product" className="flex items-center">
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                    key={rating}
                                    type="button"
                                    role="radio"
                                    aria-checked={product.userRating === rating}
                                    aria-label={`${rating} star${rating === 1 ? '' : 's'}`}
                                    title={`Rate ${rating} out of 5`}
                                    disabled={!product._id || ratingLoading}
                                    onClick={() => handleRateProduct(rating)}
                                    className="rounded p-1 text-2xl text-amber-400 transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-wait"
                                >
                                    <IoIosStar className={rating <= (product.userRating || 0) ? 'text-amber-400' : 'text-slate-300'} />
                                </button>
                            ))}
                        </div>
                        <span className="text-sm text-slate-600">
                            {product.ratingCount ? `${Number(product.ratingAverage).toFixed(1)} (${product.ratingCount} ${product.ratingCount === 1 ? 'rating' : 'ratings'})` : 'No ratings yet'}
                        </span>
                        <span className="w-full text-xs text-slate-500 sm:w-auto">{product.userRating ? 'Your rating is saved. Select a star to update it.' : 'Select a star to rate'}</span>
                    </div>

                    {!!availableSizes.length && sizeSelectorOpen && <label className="mt-6 flex flex-col gap-2 text-sm font-semibold text-slate-700">Select size
                        <select value={selectedSize} onChange={(event) => setSelectedSize(event.target.value)} className="rounded-md border border-slate-300 bg-white p-2 font-normal">
                            <option value="">Choose a size</option>
                            {availableSizes.map((size) => <option key={size} value={size}>{size}</option>)}
                        </select>
                    </label>}
                    
                    <div className="flex flex-col gap-3 mt-7 w-56">
                        <button type="button" disabled={!product._id} className="p-2 border bg-[#3d52a0] text-white font-semibold rounded-md cursor-pointer hover:bg-[#4f62aa] disabled:opacity-60 flex items-center justify-center gap-1" onClick={() => handleAddToCart(false)}><FaCartPlus />Add to Cart</button>
                        <button type="button" disabled={!product._id || wishlistLoading} className={`p-2 border rounded-md font-semibold flex items-center justify-center gap-2 disabled:opacity-60 ${isWishlisted ? 'text-rose-600 border-rose-300' : 'text-slate-700 hover:text-rose-600'}`} onClick={handleWishlist}>{isWishlisted ? <FaHeart /> : <FaRegHeart />}{isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}</button>
                        <button type="button" disabled={!product._id} className="p-2 border border-amber-500 text-amber-800 font-semibold rounded-md hover:bg-amber-50 disabled:opacity-60 flex items-center justify-center gap-2" onClick={() => handleAddToCart(true)}><FaBolt />Buy Now</button>
                    </div>

                    <div className="mt-7">
                        <p className="text-lg">Product Description</p>
                        <p className="text-slate-500">{product.description}</p>                     
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
