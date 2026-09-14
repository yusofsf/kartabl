import React, { useState } from 'react';
import api from '../api';

export default function Login({ onLogin }) {
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/login', { mobile, password });
            onLogin(data.token, data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'خطا در ورود؛ دوباره تلاش کنید.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">🗂️</div>
                <h1>سامانه کارتابل</h1>
                <p className="login-sub">مدیریت ارتباطات، مکاتبات و گفتگوهای سازمانی</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={submit}>
                    <label className="field" style={{ marginBottom: 16 }}>
                        <span>شماره موبایل</span>
                        <input
                            type="tel"
                            dir="ltr"
                            placeholder="۰۹xxxxxxxxx"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            required
                        />
                    </label>
                    <label className="field" style={{ marginBottom: 22 }}>
                        <span>رمز عبور</span>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPass ? 'text' : 'password'}
                                style={{ paddingLeft: 46 }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                aria-label={showPass ? 'مخفی کردن رمز' : 'نمایش رمز'}
                                style={{
                                    position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem',
                                    padding: '4px 8px', opacity: .6,
                                }}
                            >
                                {showPass ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </label>
                    <button className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'در حال ورود…' : 'ورود به سامانه'}
                    </button>
                </form>

                <p className="login-hint">
                    ورود با شماره موبایل انجام می‌شود — در صورت فراموشی رمز با مدیر سامانه تماس بگیرید
                </p>
            </div>
        </div>
    );
}
