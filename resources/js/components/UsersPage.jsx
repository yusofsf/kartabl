import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';

const EMPTY = { name: '', mobile: '', email: '', password: '123456789', role: 'user', post: '', unit: '', permissions: [] };

const PERMISSIONS = [
    { key: 'send_letter', label: 'ارسال نامه' },
    { key: 'create_correspondence', label: 'ثبت مراوده داخلی' },
    { key: 'create_chat_group', label: 'ایجاد گروه چت' },
    { key: 'send_chat_message', label: 'ارسال پیام در چت' },
];

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState(EMPTY);
    const [editingId, setEditingId] = useState(null);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const load = useCallback(() => {
        api.get('/users').then(({ data }) => setUsers(data)).catch(() => {});
    }, []);

    useEffect(load, [load]);

    const save = async (e) => {
        e.preventDefault();
        setMsg('');
        setError('');
        try {
            if (editingId) {
                await api.put(`/users/${editingId}`, form);
                setMsg('اطلاعات کاربر به‌روزرسانی شد.');
            } else {
                await api.post('/users', form);
                setMsg('کاربر جدید ایجاد شد. رمز پیش‌فرض: 123456789');
            }
            setForm(EMPTY);
            setEditingId(null);
            load();
        } catch (err) {
            setError(err.response?.data?.message
                || Object.values(err.response?.data?.errors || {})[0]?.[0]
                || 'خطا در ذخیره کاربر.');
        }
    };

    const edit = (u) => {
        setEditingId(u.id);
        setForm({
            name: u.name, mobile: u.mobile, email: u.email || '', password: '',
            role: u.role, post: u.post || '', unit: u.unit || '',
            permissions: u.permissions || [],
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    // رابطه مدل User::can — مدیر همه مجوزها را دارد
    const hasPerm = (u, key) => u.role === 'admin' || (u.permissions || []).includes(key);
    const permCount = (u) => u.role === 'admin' ? 4 : (u.permissions || []).length;

    const remove = async (u) => {
        if (!window.confirm(`حذف کاربر «${u.name}»؟`)) return;
        try {
            await api.delete(`/users/${u.id}`);
            load();
        } catch (err) {
            setError(err.response?.data?.message || 'حذف ناموفق بود.');
        }
    };

    const togglePerm = (key) => {
        setForm((f) => ({
            ...f,
            permissions: f.permissions.includes(key)
                ? f.permissions.filter((p) => p !== key)
                : [...f.permissions, key],
        }));
    };

    return (
        <div>
            <header className="page-head">
                <h2>مدیریت کاربران</h2>
                <p className="muted">ایجاد، ویرایش و غیرفعال‌سازی حساب همکاران — ورود همه با شماره موبایل انجام می‌شود.</p>
            </header>

            {msg && <div className="alert alert-success">{msg}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            <form className="panel form-grid" onSubmit={save}>
                <h3>{editingId ? 'ویرایش کاربر' : 'کاربر جدید'}</h3>
                <label className="field"><span>نام و نام خانوادگی *</span>
                    <input value={form.name} onChange={set('name')} required /></label>
                <label className="field"><span>شماره موبایل *</span>
                    <input dir="ltr" placeholder="09xxxxxxxxx" value={form.mobile} onChange={set('mobile')} required /></label>
                <label className="field"><span>ایمیل (اختیاری)</span>
                    <input dir="ltr" type="email" value={form.email} onChange={set('email')} /></label>
                <label className="field"><span>رمز عبور {editingId ? '(خالی = بدون تغییر)' : '*'}</span>
                    <input dir="ltr" value={form.password} onChange={set('password')} required={!editingId} /></label>
                <label className="field"><span>سمت</span>
                    <input value={form.post} onChange={set('post')} placeholder="مثلاً: کارشناس مالی" /></label>
                <label className="field"><span>واحد سازمانی</span>
                    <input value={form.unit} onChange={set('unit')} placeholder="مثلاً: مالی" /></label>
                <label className="field"><span>نقش</span>
                    <select value={form.role} onChange={set('role')}>
                        <option value="user">کاربر</option>
                        <option value="admin">مدیر</option>
                    </select></label>

                <div className="field span-2">
                    <span>مجوزها {form.role === 'admin' ? '(مدیر همیشه همه مجوزها را دارد)' : ''}</span>
                    <div className="member-picker" style={{ pointerEvents: form.role === 'admin' ? 'none' : 'auto', opacity: form.role === 'admin' ? .55 : 1 }}>
                        {PERMISSIONS.map((p) => (
                            <label key={p.key} className={`member-chip ${form.permissions.includes(p.key) ? 'selected' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={form.role === 'admin' || form.permissions.includes(p.key)}
                                    disabled={form.role === 'admin'}
                                    onChange={() => togglePerm(p.key)}
                                />
                                {p.label}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-actions">
                    <button className="btn btn-primary">{editingId ? 'ذخیره تغییرات' : 'افزودن کاربر'}</button>
                    {editingId && <button type="button" className="btn btn-ghost" onClick={() => { setEditingId(null); setForm(EMPTY); }}>انصراف</button>}
                </div>
            </form>

            <div className="panel" style={{ marginTop: 20 }}>
                <h3>کاربران ({users.length})</h3>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr><th>نام</th><th>موبایل</th><th>سمت</th><th>نقش</th><th>مجوزها</th><th>وضعیت</th><th></th></tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td>{u.name}</td>
                                    <td dir="ltr">{u.mobile}</td>
                                    <td>{u.post || '—'}</td>
                                    <td>{u.role === 'admin' ? 'مدیر' : 'کاربر'}</td>
                                    <td>
                                        {u.role === 'admin' ? (
                                            <span className="badge badge-blue">همه مجوزها</span>
                                        ) : permCount(u) === 0 ? (
                                            <span className="badge badge-gray">بدون مجوز</span>
                                        ) : (
                                            <div className="badges">
                                                {PERMISSIONS.filter((p) => hasPerm(u, p.key)).map((p) => (
                                                    <span key={p.key} className="badge badge-green">{p.label}</span>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td>{u.is_active ? <span className="badge badge-green">فعال</span> : <span className="badge badge-red">غیرفعال</span>}</td>
                                    <td className="row-actions">
                                        <button className="btn btn-sm" onClick={() => edit(u)}>ویرایش</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => remove(u)}>حذف</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
