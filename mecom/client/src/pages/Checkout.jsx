import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const phoneCountries = [
  { country: 'India', code: '+91', digits: 10 },
  { country: 'United States', code: '+1', digits: 10 },
  { country: 'Canada', code: '+1', digits: 10 },
  { country: 'United Kingdom', code: '+44', digits: 10 },
  { country: 'Australia', code: '+61', digits: 9 },
  { country: 'New Zealand', code: '+64', digits: 9 },
  { country: 'United Arab Emirates', code: '+971', digits: 9 },
  { country: 'Singapore', code: '+65', digits: 8 },
  { country: 'Germany', code: '+49', digits: 11 },
  { country: 'France', code: '+33', digits: 9 },
  { country: 'Japan', code: '+81', digits: 10 },
  { country: 'China', code: '+86', digits: 11 },
  { country: 'Pakistan', code: '+92', digits: 10 },
  { country: 'Bangladesh', code: '+880', digits: 10 },
  { country: 'Sri Lanka', code: '+94', digits: 9 }
];
const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
  'Lakshadweep', 'Puducherry'
];
const emptyShipping = { fullName: '', phone: '', address: '', city: '', state: '', postalCode: '' };

export default function Checkout() {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const selectedSize = searchParams.get('size') || '';
  const { currentUser } = useSelector((state) => state.user);
  const [shipping, setShipping] = useState(emptyShipping);
  const [phoneCountry, setPhoneCountry] = useState(phoneCountries[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [upiPlatform, setUpiPlatform] = useState('phonepe');
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    fetch('/api/user/address', { credentials: 'include' })
      .then((res) => res.ok ? res.json() : null)
      .then((savedAddress) => {
        if (!savedAddress) return;
        setShipping((current) => ({ ...current, ...savedAddress, phone: '' }));
        const savedPhone = String(savedAddress.phone || '');
        const matchingCountry = [...phoneCountries]
          .sort((a, b) => b.code.length - a.code.length)
          .find((country) => savedPhone.startsWith(country.code) && savedPhone.slice(country.code.length).length === country.digits);
        if (matchingCountry) {
          setPhoneCountry(matchingCountry);
          setPhoneNumber(savedPhone.slice(matchingCountry.code.length));
        }
      })
      .catch(() => {});
  }, [currentUser]);

  const submitOrder = async (event) => {
    event.preventDefault();
    if (phoneNumber.length !== phoneCountry.digits) {
      toast.error(`Enter a ${phoneCountry.digits}-digit phone number for ${phoneCountry.country}.`);
      return;
    }
    if (!currentUser) {
      toast.info('Please sign in before placing your order.');
      navigate('/sign-in');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        credentials: 'include', method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, size: selectedSize, paymentMethod, ...(paymentMethod === 'upi' ? { upiPlatform } : {}), shipping: { ...shipping, phone: `${phoneCountry.code}${phoneNumber}` } })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not place order');

      setOrder(data);
      toast.success('Your order has been placed');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (order) {
    return (
      <main className="max-w-2xl mx-auto p-6 min-h-screen">
        <div className="mt-12 rounded-lg border bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-semibold text-green-700">Order placed</h1>
          <p className="mt-4 text-slate-700">Order reference: <span className="font-semibold">{order.orderId}</span></p>
          <p className="mt-2">Total: <span className="font-semibold">₹{order.total.toLocaleString('en-IN')}</span></p>
          <p className="mt-1">Payment method: <span className="font-semibold">{{ cash_on_delivery: 'Cash on Delivery', upi: `UPI (${({ phonepe: 'PhonePe', google_pay: 'Google Pay', paytm: 'Paytm', bhim: 'BHIM UPI', amazon_pay: 'Amazon Pay', other: 'Other UPI app' })[order.upiPlatform] || 'UPI'})`, pay_later: 'Pay Later' }[order.paymentMethod]}</span> · Payment pending</p>
          <Link to="/orders" className="mt-6 inline-block rounded-md bg-[#3d52a0] px-5 py-2 text-white">View My Order</Link>
          <Link to="/products" className="ml-3 mt-6 inline-block rounded-md border px-5 py-2 text-slate-700">Continue shopping</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-4 min-h-screen">
      <h1 className="mt-4 border-b pb-4 text-3xl font-semibold">Checkout</h1>
      {!currentUser && <p className="mt-5 rounded bg-amber-50 p-3">Please <Link to="/sign-in" className="text-blue-700 underline">sign in</Link> to place your order.</p>}
      <form onSubmit={submitOrder} className="mt-6 grid gap-4 rounded-lg border bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Delivery details</h2>
        {selectedSize && <p className="rounded bg-slate-50 p-3 text-slate-700">Selected size: <span className="font-semibold">{selectedSize}</span></p>}
        <input required maxLength="100" autoComplete="name" placeholder="Full name" value={shipping.fullName} onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })} className="rounded border p-3" />
        <label className="grid gap-1 text-sm font-medium text-slate-700">Phone number
          <div className="flex gap-2">
            <select aria-label="Country calling code" value={`${phoneCountry.country}|${phoneCountry.code}`} onChange={(event) => {
              const selected = phoneCountries.find((country) => `${country.country}|${country.code}` === event.target.value);
              setPhoneCountry(selected);
              setPhoneNumber((number) => number.slice(0, selected.digits));
            }} className="max-w-[52%] rounded border bg-white p-3">
              {phoneCountries.map((country) => <option key={country.country} value={`${country.country}|${country.code}`}>{country.country} ({country.code})</option>)}
            </select>
            <input required type="tel" inputMode="numeric" autoComplete="tel-national" pattern={`[0-9]{${phoneCountry.digits}}`} maxLength={phoneCountry.digits} placeholder={`${phoneCountry.digits} digits`} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, phoneCountry.digits))} className="min-w-0 flex-1 rounded border p-3" />
          </div>
          <span className="text-xs font-normal text-slate-500">Enter {phoneCountry.digits} digits, without the country code.</span>
        </label>
        <textarea required maxLength="300" autoComplete="street-address" placeholder="Delivery address" value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} className="rounded border p-3" rows="3" />
        <div className="grid gap-4 sm:grid-cols-2">
          <input required maxLength="100" autoComplete="address-level2" placeholder="City" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} className="rounded border p-3" />
          <select required autoComplete="address-level1" aria-label="Indian state or union territory" value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })} className="rounded border bg-white p-3">
            <option value="">Select state / union territory</option>
            {indianStates.map((state) => <option key={state} value={state}>{state}</option>)}
          </select>
          <input required maxLength="20" autoComplete="postal-code" placeholder="Postal code" value={shipping.postalCode} onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })} className="rounded border p-3" />
        </div>
        <fieldset className="grid gap-3">
          <legend className="text-xl font-semibold">Payment method</legend>
          <label className="flex cursor-pointer items-start gap-3 rounded border p-3">
            <input type="radio" name="paymentMethod" value="cash_on_delivery" checked={paymentMethod === 'cash_on_delivery'} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1" />
            <span><span className="font-medium">Cash on Delivery</span><span className="block text-sm text-slate-500">Pay when your order arrives.</span></span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded border p-3">
            <input type="radio" name="paymentMethod" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1" />
            <span><span className="font-medium">UPI</span><span className="block text-sm text-slate-500">UPI selected. Payment will remain pending until a payment provider is connected.</span></span>
          </label>
          {paymentMethod === 'upi' && <label className="grid gap-1 text-sm font-medium text-slate-700">Choose UPI app
            <select value={upiPlatform} onChange={(e) => setUpiPlatform(e.target.value)} className="rounded border bg-white p-3">
              <option value="phonepe">PhonePe</option>
              <option value="google_pay">Google Pay</option>
              <option value="paytm">Paytm</option>
              <option value="bhim">BHIM UPI</option>
              <option value="amazon_pay">Amazon Pay</option>
              <option value="other">Other UPI app</option>
            </select>
          </label>}
          <label className="flex cursor-pointer items-start gap-3 rounded border p-3">
            <input type="radio" name="paymentMethod" value="pay_later" checked={paymentMethod === 'pay_later'} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1" />
            <span><span className="font-medium">Pay Later</span><span className="block text-sm text-slate-500">Request deferred payment. Payment remains pending.</span></span>
          </label>
        </fieldset>
        <button disabled={submitting} className="rounded-md bg-[#3d52a0] p-3 font-semibold text-white hover:bg-[#4f62aa] disabled:opacity-60">{submitting ? 'Placing order...' : 'Place order'}</button>
      </form>
    </main>
  );
}
