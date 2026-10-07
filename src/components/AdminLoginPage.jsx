import React, { useState } from 'react';
import { 
  auth, 
  rtdb, 
  ref, 
  set, 
  get, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signOut 
} from '../firebase';

import { imgBack } from '../assets/svgIcons';

export default function AdminLoginPage({
  onBack,
  onAdminAuthenticated
}) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const handleAdminSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if (name.trim()) {
        await updateProfile(res.user, { displayName: name });
      }

      // Save to /admins/{uid} with status: false (isAdmin: false) as requested
      const adminData = {
        uid: res.user.uid,
        name: name || 'Admin Applicant',
        email: res.user.email,
        role: 'Admin',
        status: false,
        isAdmin: false, // String/Boolean flag
        createdAt: Date.now(),
        updatedAt: new Date().toISOString()
      };

      await set(ref(rtdb, `admins/${res.user.uid}`), adminData);

      setInfoMsg('Admin registration submitted successfully! Status is currently isAdmin == false. An authorized Super Admin must enable isAdmin == true in database before you can access the dashboard.');
      await signOut(auth);
    } catch (err) {
      console.warn('Admin signup error:', err);
      setErrorMsg(err.message || 'Admin registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;

      // Check admin status in RTDB at /admins/{uid}
      const adminSnap = await get(ref(rtdb, `admins/${uid}`));
      const adminVal = adminSnap.exists() ? adminSnap.val() : null;

      const isApproved = adminVal && (adminVal.status === true || adminVal.isAdmin === true || adminVal.isAdmin === "true" || adminVal.role === "Super Admin");

      if (!isApproved) {
        await signOut(auth);
        setErrorMsg('Access Denied: Your account at /admins/' + uid + ' has status: false (isAdmin == false). Approval is required in database before login.');
        setLoading(false);
        return;
      }

      setInfoMsg('Admin verified (isAdmin == true)! Redirecting to Admin Dashboard...');
      setTimeout(() => {
        onAdminAuthenticated(res.user, adminVal);
      }, 600);
    } catch (err) {
      console.warn('Admin login error:', err);
      setErrorMsg(err.message || 'Admin authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '420px', margin: '0 auto', background: '#FFFFFF', position: 'relative', minHeight: '750px', paddingBottom: '40px', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #E5E7EB', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: '#111111', color: '#FFFFFF' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', filter: 'invert(1)' }}>
          <img src={imgBack} alt="Back" style={{ width: '22px', height: '22px' }} />
        </button>
        <p style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '18px', letterSpacing: '1px', textTransform: 'uppercase' }}>
          JERSIFY ADMIN PORTAL
        </p>
        <div style={{ width: '22px' }} />
      </div>

      <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <span style={{ fontFamily: 'Karla', fontSize: '11px', fontWeight: 700, color: '#DC2626', letterSpacing: '1px', textTransform: 'uppercase' }}>
            RESTRICTED ACCESS
          </span>
          <h1 style={{ fontFamily: 'Karla', fontWeight: 700, fontSize: '26px', color: '#111111', marginTop: '4px' }}>
            {mode === 'login' ? 'Admin Sign In' : 'Register Admin Account'}
          </h1>
          <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>
            {mode === 'login' ? 'Enter credentials to access inventory, image controls & orders.' : 'Create new admin record in RTDB at /admins/{uid}.'}
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px', fontSize: '13px', fontFamily: 'Karla', lineHeight: '18px' }}>
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', color: '#065F46', padding: '12px', fontSize: '13px', fontFamily: 'Karla', lineHeight: '18px' }}>
            {infoMsg}
          </div>
        )}

        <form onSubmit={mode === 'login' ? handleAdminLogin : handleAdminSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontFamily: 'Karla', fontSize: '12px', color: '#111111', fontWeight: 700 }}>ADMIN FULL NAME *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ravindra Murmu"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ height: '44px', padding: '0 12px', border: '1px solid #D1D5DB', fontFamily: 'Karla', fontSize: '14px' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontFamily: 'Karla', fontSize: '12px', color: '#111111', fontWeight: 700 }}>ADMIN EMAIL ADDRESS *</label>
            <input
              type="email"
              required
              placeholder="admin@jersify.online"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ height: '44px', padding: '0 12px', border: '1px solid #D1D5DB', fontFamily: 'Karla', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontFamily: 'Karla', fontSize: '12px', color: '#111111', fontWeight: 700 }}>PASSWORD *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ height: '44px', padding: '0 12px', border: '1px solid #D1D5DB', fontFamily: 'Karla', fontSize: '14px' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', height: '48px', background: '#111111', color: '#FFFFFF', fontFamily: 'Karla', fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer', marginTop: '8px' }}
          >
            {loading ? 'VERIFYING ADMIN STATUS...' : mode === 'login' ? 'SIGN IN AS ADMIN' : 'REGISTER AS ADMIN'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', textAlign: 'center' }}>
          {mode === 'login' ? (
            <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280' }}>
              Need a new admin account?{' '}
              <button onClick={() => setMode('signup')} style={{ background: 'none', border: 'none', color: '#111111', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', fontFamily: 'Karla' }}>
                Sign up as Admin
              </button>
            </p>
          ) : (
            <p style={{ fontFamily: 'Karla', fontSize: '13px', color: '#6B7280' }}>
              Already registered?{' '}
              <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: '#111111', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', fontFamily: 'Karla' }}>
                Sign in to Admin Dashboard
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
