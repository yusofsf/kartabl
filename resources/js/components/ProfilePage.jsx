import React, { useState } from 'react';
import api from '../api';

export default function ProfilePage({ user, onUserUpdate }) {
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [pwd, setPwd] = useState({ current_password: '', password: '', password_confirmation: '' });

    const changePassword = async (e) => {
        e.preventDefault();
        setMsg('');
        setError('');
        try {
            const { data } = await api.post('/change-password', pwd);
            setMsg(data.message);
            setPwd({ current_password: '', password: '', password_confirmation: '' });
        } catch (err) {
            setError(err.response?.data?.message
                || Object.values(err.response?.data?.errors || {})[0]?.[0]
                || 'خطا در تغییر رمز عبور.');
        }
    };

    return (
        <div>
            <header className="page-head">
                <h2>پروفایل من</h2>
            </header>

            <div className="panel">
                <div className="profile-grid">
                    <div className="avatar avatar-lg">{user.name.charAt(0)}</div>
                    <div>
                        <h3>{user.name}</h3>
                        <p className="muted">شماره موبایل: <span dir="ltr">{user.mobile}</span></p>
                        <p className="muted">سمت: {user.post || '—'} • واحد: {user.unit || '—'}</p>
                        <p className="muted">نقش: {user.role === 'admin' ? 'مدیر سامانه' : 'کاربر'}</p>
                    </div>
                </div>
            </div>

            <form className="panel" style={{ marginTop: 20 }} onSubmit={changePassword}>
                <h3>تغییر رمز عبور</h3>
                {msg && <div className="alert alert-success">{msg}</div>}
                {error && <div className="alert alert-error">{error}</div>}
                <label className="field"><span>رمز عبور فعلی *</span>
                    <input type="password" value={pwd.current_password} onChange={(e) => setPwd({ ...pwd, current_password: e.target.value })} required /></label>
                <label className="field"><span>رمز عبور جدید *</span>
                    <input type="password" minLength="6" value={pwd.password} onChange={(e) => setPwd({ ...pwd, password: e.target.value })} required /></label>
                <label className="field"><span>تکرار رمز جدید *</span>
                    <input type="password" value={pwd.password_confirmation} onChange={(e) => setPwd({ ...pwd, password_confirmation: e.target.value })} required /></label>
                <div className="form-actions">
                    <button className="btn btn-primary">تغییر رمز</button>
                </div>
            </form>
        </div>
    );
}
