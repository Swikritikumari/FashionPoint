import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaTimesCircle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { signOutSuccess } from '../redux/user/userSlice.js';
import Swal from 'sweetalert2';

export default function MyOrders() {
  const { currentUser } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    fetch('/api/orders/mine', { credentials: 'include' })
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 401) {
          dispatch(signOutSuccess());
          navigate('/sign-in');
          return;
        }
        if (!res.ok) throw new Error(data.message || 'Could not load your orders');
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [currentUser, dispatch, navigate]);

  const cancelProductOrder = async (orderId, itemId) => {
    const confirmation = await Swal.fire({
      title: 'Cancel this product order?',
      text: 'This product will be marked as cancelled.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Cancel order',
      cancelButtonText: 'Keep order',
      confirmButtonColor: '#dc2626'
    });
    if (!confirmation.isConfirmed) return;

    try {
      const res = await fetch(`/api/orders/${orderId}/items/${itemId}/cancel`, {
        credentials: 'include',
        method: 'PATCH'
      });
      const data = await res.json();
      if (res.status === 401) {
        dispatch(signOutSuccess());
        navigate('/sign-in');
        return;
      }
      if (!res.ok) throw new Error(data.message || 'Could not cancel this order');
      setOrders((currentOrders) => currentOrders.map((order) => order._id !== orderId ? order : {
        ...order,
        status: data.status,
        items: order.items.map((item) => item._id === itemId ? { ...item, status: data.itemStatus } : item)
      }));
      toast.success('Product order cancelled');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl p-4">
      <h1 className="mt-3 flex items-center gap-2 border-b pb-4 text-3xl font-semibold">My Order <FaBoxOpen /></h1>
      <p className="mt-3 text-slate-600">Products you have ordered are listed below.</p>
      {loading ? <p className="mt-8 text-slate-600">Loading your orders...</p> : orders.length === 0 ? (
        <div className="mt-8 rounded-lg border bg-white p-8 text-center">
          <p className="text-lg text-slate-600">You haven’t placed any orders yet.</p>
          <Link to="/products" className="mt-4 inline-block rounded bg-[#3d52a0] px-5 py-2 font-semibold text-white hover:bg-[#4f62aa]">Browse products</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {orders.map((order) => (
            <article key={order._id} className="overflow-hidden rounded-lg border bg-white shadow-sm">
              <header className="flex flex-wrap justify-between gap-3 border-b bg-slate-50 p-4 text-sm">
                <div><span className="text-slate-500">Order placed</span><p className="font-medium">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
                <div><span className="text-slate-500">Order ID</span><p className="font-medium">{order._id}</p></div>
                <div><span className="text-slate-500">Status</span><p className="font-semibold capitalize text-[#3d52a0]">{order.status}</p></div>
                <div><span className="text-slate-500">Total</span><p className="font-semibold">₹{Number(order.total || 0).toLocaleString('en-IN')}</p></div>
              </header>
              <div className="divide-y px-4">
                {(order.items || []).map((item, index) => (
                  <div key={`${order._id}-${item.productId || index}`} className="flex items-center gap-4 py-4">
                    {item.productId ? <Link to={`/product/${item.productId}`} className="shrink-0"><img src={item.imageUrl || '/placeholder.jpg'} alt={item.name} className="h-20 w-20 rounded object-cover" /></Link> : <img src={item.imageUrl || '/placeholder.jpg'} alt={item.name} className="h-20 w-20 rounded object-cover" />}
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.size ? `Size: ${item.size} · ` : ''}Quantity: {item.quantity} · ₹{Number(item.unitPrice || 0).toLocaleString('en-IN')} each</p>
                      {item.status === 'cancelled' ? (
                        <p className="mt-2 text-sm font-semibold text-red-600">Product order cancelled</p>
                      ) : order.status === 'placed' && order.paymentStatus !== 'paid' ? (
                        <button type="button" onClick={() => cancelProductOrder(order._id, item._id)} className="mt-2 inline-flex items-center gap-2 rounded border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                          <FaTimesCircle /> Cancel Order
                        </button>
                      ) : (
                        <p className="mt-2 text-sm text-slate-500">
                          {order.paymentStatus === 'paid' ? 'This order is paid and cannot be cancelled online.' : `This order is ${order.status} and can no longer be cancelled.`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
