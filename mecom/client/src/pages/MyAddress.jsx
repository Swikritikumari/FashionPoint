import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { Spinner } from 'flowbite-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { signOutSuccess } from '../redux/user/userSlice.js';

const emptyAddress = { fullName: '', phoneNumber: '', address: '', city: '', state: '', postalCode: '' };
const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
  'Lakshadweep', 'Puducherry'
];

export default function MyAddress() {
  const { currentUser } = useSelector((state) => state.user);
  const [address, setAddress] = useState(emptyAddress);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    fetch('/api/user/address', { credentials: 'include' })
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 401) {
          dispatch(signOutSuccess());
          navigate('/sign-in');
          return;
        }
        if (!res.ok) throw new Error(data.message || 'Could not load your address');
        const savedDigits = String(data.phone || '').replace(/\D/g, '').slice(-10);
        setAddress({ ...emptyAddress, ...data, phoneNumber: savedDigits });
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, [currentUser, dispatch, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/user/address', {
        credentials: 'include',
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address)
      });
      const data = await res.json();
      if (res.status === 401) {
        dispatch(signOutSuccess());
        navigate('/sign-in');
        return;
      }
      if (!res.ok) throw new Error(data.message || 'Could not save your address');
      setAddress({ ...emptyAddress, ...data, phoneNumber: String(data.phone || '').replace(/\D/g, '').slice(-10) });
      toast.success('My Address saved');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-3xl p-4">
      <h1 className="mt-3 flex items-center gap-2 border-b pb-4 text-3xl font-semibold">My Address <FaMapMarkerAlt className="text-[#3d52a0]" /></h1>
      <p className="mt-3 text-slate-600">Save your delivery details to prefill them at checkout.</p>
      {loading ? <p className="mt-8 flex items-center gap-2 text-slate-600">Loading address... <Spinner size="sm" /></p> : (
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-lg border bg-white p-5 shadow-sm sm:p-6">
          <label className="grid gap-1 text-sm font-medium text-slate-700">Full name
            <input required maxLength="100" autoComplete="name" value={address.fullName} onChange={(event) => setAddress({ ...address, fullName: event.target.value })} className="rounded border p-3" />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">Phone number
            <div className="flex gap-2">
              <span className="flex items-center rounded border bg-slate-50 px-3 text-slate-700">+91</span>
              <input required type="tel" inputMode="numeric" autoComplete="tel-national" pattern="[0-9]{10}" maxLength={10} placeholder="10-digit phone number" value={address.phoneNumber} onChange={(event) => setAddress({ ...address, phoneNumber: event.target.value.replace(/\D/g, '').slice(0, 10) })} className="min-w-0 flex-1 rounded border p-3" />
            </div>
            <span className="text-xs font-normal text-slate-500">Enter exactly 10 digits. The +91 country code is added automatically.</span>
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">Delivery address
            <textarea required maxLength="300" autoComplete="street-address" rows="3" value={address.address} onChange={(event) => setAddress({ ...address, address: event.target.value })} className="rounded border p-3" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-medium text-slate-700">City
              <input required maxLength="100" autoComplete="address-level2" value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} className="rounded border p-3" />
            </label>
            <label className="grid gap-1 text-sm font-medium text-slate-700">State / union territory
              <select required autoComplete="address-level1" value={address.state} onChange={(event) => setAddress({ ...address, state: event.target.value })} className="w-full min-w-0 max-w-full rounded border bg-white p-3">
                <option value="">Select state / union territory</option>
                {indianStates.map((state) => <option key={state} value={state}>{state}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium text-slate-700">Postal code
              <input required maxLength="20" autoComplete="postal-code" value={address.postalCode} onChange={(event) => setAddress({ ...address, postalCode: event.target.value })} className="rounded border p-3" />
            </label>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" disabled={saving} className="rounded-md bg-[#3d52a0] px-5 py-3 font-semibold text-white hover:bg-[#4f62aa] disabled:opacity-60">{saving ? 'Saving...' : 'Save Address'}</button>
            <Link to="/orders" className="rounded-md border px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">My Orders</Link>
          </div>
        </form>
      )}
    </main>
  );
}
