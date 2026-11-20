import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { signOutSuccess } from '../redux/user/userSlice.js';

export default function Wishlist() {
  const { currentUser } = useSelector((state) => state.user);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    fetch('/api/user/wishlist', { credentials: 'include' })
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 401) {
          dispatch(signOutSuccess());
          navigate('/sign-in');
          return;
        }
        if (!res.ok) throw new Error(data.message || 'Could not load wishlist');
        setProducts(data);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [currentUser, dispatch, navigate]);

  const removeProduct = async (productId) => {
    try {
      const res = await fetch('/api/user/wishlist', {
        credentials: 'include', method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not update wishlist');
      setProducts((items) => items.filter((item) => item._id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-4 min-h-screen">
      <h1 className="text-3xl font-semibold border-b pb-4 mt-3 flex items-center gap-2">Your Wishlist <FaHeart className="text-rose-500" /></h1>
      {loading ? <p className="mt-8 text-slate-600">Loading wishlist...</p> : !currentUser ? (
        <p className="mt-8">Please <Link className="text-blue-700 underline" to="/sign-in">sign in</Link> to view your wishlist.</p>
      ) : products.length === 0 ? (
        <p className="mt-8 text-slate-600">Your wishlist is empty. Save products you would like to revisit.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
          {products.map((product) => (
            <article key={product._id} className="border rounded-lg overflow-hidden shadow-sm bg-white">
              <Link to={`/product/${product._id}`}>
                <img src={product.imageUrls?.[0]} alt={product.name} className="w-full h-56 object-cover" />
                <div className="p-3">
                  <h2 className="font-semibold text-slate-700 line-clamp-1">{product.name}</h2>
                  <p className="mt-2 font-semibold">₹{(product.offer ? product.discountPrice : product.regularPrice)?.toLocaleString('en-IN')}</p>
                </div>
              </Link>
              <button type="button" onClick={() => removeProduct(product._id)} className="m-3 mt-0 flex items-center gap-2 text-rose-600 hover:text-rose-800"><FaRegHeart /> Remove</button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
