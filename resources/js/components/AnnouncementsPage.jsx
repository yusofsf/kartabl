import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';

export default function AnnouncementsPage({ user }) {
    const [items, setItems] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', body: '', pinned: false });
    const [openId, setOpenId] = useState(null);
    const isAdmin = user.role === 'admin';

    const load = useCallback(() => {
        api.get('/announcements').then(({ data }) => setItems(data)).catch(() => {});
    }, []);
    useEffect(load, [load]);

    const publish = async (e) => {
        e.preventDefault();
        try {
            await api.post('/announcements', form);
            setForm({ title: '', body: '', pinned: false });
            setShowForm(false);
            load();
        } catch {}
    };

    const markRead = async (id) => {
        try { await api.post(`/announcements/${id}/read`); load(); } catch {}
    };

    const remove = async (id) => {
        if (!window.confirm('حذف این اطلاعیه؟')) return;
        await api.delete(`/announcements/${id}`).catch(() => {});
        load();
    };

    return (
        <div>
            <header className="page-head">
                <h2>پیام کلی / اطلاعیه‌ها</h2>
                <p className="muted">اطلاع‌رسانی عمومی برای همه کاربران سامانه.</p>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'بستن فرم' : '＋ پیام جدید'}
                    </button>
                )}
            </header>

            {isAdmin && showForm && (
                <form className="panel" onSubmit={publish}>
                    <label className="field"><span>عنوان *</span>
                        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
                    <label className="field"><span>متن پیام *</span>
                        <textarea rows="5" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required /></label>
                    <label className="check">
                        <input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} />
                        سنجاق کردن در بالای فهرست
                    </label>
                    <div className="form-actions">
                        <button className="btn btn-primary">انتشار برای همه کاربران</button>
                    </div>
                </form>
            )}

            <div className="ann-list">
                {items.map((a) => (
                    <article key={a.id} className={`panel ann-item ${a.pinned ? 'pinned' : ''} ${!a.is_read ? 'unread' : ''}`}>
                        <div className="ann-head">
                            <strong>
                                {a.pinned && '📌 '}
                                <button className="link-like" onClick={() => setOpenId(openId === a.id ? null : a.id)}>
                                    {a.title}
                                </button>
                            </strong>
                            {!a.is_read && <span className="badge badge-red">جدید</span>}
                            <div className="ann-meta muted">
                                {a.user?.name} • {new Date(a.published_at).toLocaleDateString('fa-IR')} • {a.reads_count} بازدید
                            </div>
                        </div>
                        {openId === a.id && <div className="ann-body">{a.body}</div>}
                        <div className="row-actions">
                            {!a.is_read && <button className="btn btn-sm" onClick={() => markRead(a.id)}>خواندم</button>}
                            {isAdmin && <button className="btn btn-sm btn-danger" onClick={() => remove(a.id)}>حذف</button>}
                        </div>
                    </article>
                ))}
                {!items.length && <p className="muted">اطلاعیه‌ای وجود ندارد.</p>}
            </div>
        </div>
    );
}
