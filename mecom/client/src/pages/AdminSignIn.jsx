import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaChartLine, FaShieldAlt } from 'react-icons/fa';
import { Spinner } from 'flowbite-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import OAuth from '../components/OAuth.jsx';
import { signInFailure, signInStart, signInSuccess, signOutSuccess } from '../redux/user/userSlice.js';

export default function AdminSignIn() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(signInStart());
    try {
      const res = await fetch('/api/auth/signin', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not sign in');

      if (!data.isAdmin) {
        await fetch('/api/auth/signout', { credentials: 'include', method: 'POST' });
        dispatch(signOutSuccess());
        toast.error('This account does not have admin access.');
        return;
      }

      dispatch(signInSuccess(data));
      navigate('/dashboard?tab=productLists');
    } catch (error) {
      dispatch(signInFailure(error.message));
      toast.error(error.message);
    }
  };

  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-slate-100 p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl md:grid-cols-2">
        <aside className="flex flex-col justify-between bg-gradient-to-br from-[#273b82] to-[#3d52a0] p-8 text-white sm:p-10">
          <div>
            <Link to="/" className="text-lg font-bold tracking-wide text-white">Fashion Point</Link>
            <div className="mt-12 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl"><FaShieldAlt /></div>
            <h1 className="mt-6 text-3xl font-bold">Admin workspace</h1>
            <p className="mt-3 max-w-sm leading-7 text-blue-100">Sign in to manage the product catalog, update prices, and keep your store up to date.</p>
          </div>
          <div className="mt-12 grid gap-3 text-sm text-blue-50 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-lg bg-white/10 p-3"><FaBoxOpen /> Product management</div>
            <div className="flex items-center gap-2 rounded-lg bg-white/10 p-3"><FaChartLine /> Price updates</div>
          </div>
        </aside>

        <section className="p-6 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#3d52a0]">Fashion Point</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-800">Admin sign in</h2>
          <p className="mt-2 text-sm text-slate-500">Use your authorized admin account to continue.</p>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">Email
              <input required type="email" autoComplete="username" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} placeholder="Admin email" className="rounded-lg border border-slate-300 p-3 outline-none focus:border-[#3d52a0] focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">Password
              <input required type="password" autoComplete="current-password" value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} placeholder="Password" className="rounded-lg border border-slate-300 p-3 outline-none focus:border-[#3d52a0] focus:ring-2 focus:ring-blue-100" />
            </label>
            <button type="submit" disabled={loading} className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#3d52a0] p-3 font-semibold text-white hover:bg-[#4f62aa] disabled:opacity-60">
              {loading ? <><Spinner size="sm" /> Signing in...</> : 'Enter admin dashboard'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-slate-400"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div>
          <OAuth adminOnly />
          <p className="mt-6 text-center text-sm text-slate-500">Not an admin? <Link to="/" className="font-semibold text-[#3d52a0] hover:underline">Return to store</Link></p>
        </section>
      </div>
    </main>
  );
}
