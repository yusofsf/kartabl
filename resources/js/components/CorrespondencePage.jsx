import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { can, NoPermissionHint } from '../permissions.jsx';

const STATUS_LABELS = { pending: 'در انتظار', in_progress: 'در حال پیگیری', done: 'انجام شده', archived: 'بایگانی' };
const PRIORITY_LABELS = { low: 'کم', normal: 'معمولی', high: 'زیاد', urgent: 'فوری' };
const STATUS_COLORS = { pending: 'badge-amber', in_progress: 'badge-blue', done: 'badge-green', archived: 'badge-gray' };

export default function CorrespondencePage({ user }) {
    const [items, setItems] = useState([]);
    const [users, setUsers] = useState([]);
    const [openId, setOpenId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', body: '', assignee_id: '', priority: 'normal', due_date: '' });
    const [reply, setReply] = useState({ body: '', status: '' });

    const load = useCallback(() => {
        api.get('/correspondences').then(({ data }) => setItems(data)).catch(() => {});
    }, []);
    useEffect(load, [load]);

    useEffect(() => {
        api.get('/chat/users').then(({ data }) => setUsers(data)).catch(() => {});
    }, []);

    const create = async (e) => {
        e.preventDefault();
        try {
            await api.post('/correspondences', {
                ...form,
                assignee_id: form.assignee_id || null,
                due_date: form.due_date || null,
            });
            setForm({ title: '', body: '', assignee_id: '', priority: 'normal', due_date: '' });
            setShowForm(false);
            load();
        } catch {}
    };

    const sendReply = async (id) => {
        if (!reply.body.trim()) return;
        try {
            await api.post(`/correspondences/${id}/reply`, {
                body: reply.body,
                status: reply.status || undefined,
            });
            setReply({ body: '', status: '' });
            load();
        } catch {}
    };

    const setStatus = async (id, status) => {
        await api.patch(`/correspondences/${id}/status`, { status }).catch(() => {});
        load();
    };

    return (
        <div>
            <header className="page-head">
                <h2>مراودات داخلی</h2>
                <p className="muted">ثبت، ارجاع و پیگیری درخواست‌ها و امور بین همکاران.</p>
                {can(user, 'create_correspondence') && (
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'بستن فرم' : '＋ مراوده جدید'}
                    </button>
                )}
            </header>

            {!can(user, 'create_correspondence') && <NoPermissionHint permission="create_correspondence" />}

            {can(user, 'create_correspondence') && showForm && (
                <form className="panel form-grid" onSubmit={create}>
                    <label className="field"><span>موضوع *</span>
                        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
                    <label className="field"><span>ارجاع به</span>
                        <select value={form.assignee_id} onChange={(e) => setForm({ ...form, assignee_id: e.target.value })}>
                            <option value="">— بدون ارجاع —</option>
                            {users.filter((u) => u.id !== user.id).map((u) => (
                                <option key={u.id} value={u.id}>{u.name}{u.post ? ` — ${u.post}` : ''}</option>
                            ))}
                        </select></label>
                    <label className="field"><span>اولویت</span>
                        <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                            {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select></label>
                    <label className="field"><span>مهلت اقدام</span>
                        <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></label>
                    <label className="field span-2"><span>شرح *</span>
                        <textarea rows="4" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required /></label>
                    <div className="form-actions">
                        <button className="btn btn-primary">ثبت مراوده</button>
                    </div>
                </form>
            )}

            <div className="corr-list">
                {items.map((c) => (
                    <article key={c.id} className="panel corr-item">
                        <div className="corr-head" onClick={() => setOpenId(openId === c.id ? null : c.id)}>
                            <div>
                                <strong>{c.title}</strong>
                                <div className="ann-meta muted">
                                    شماره {c.number} • ثبت: {c.creator?.name}
                                    {c.assignee ? ` • ارجاع: ${c.assignee.name}` : ''}
                                    {c.due_date ? ` • مهلت: ${new Date(c.due_date).toLocaleDateString('fa-IR')}` : ''}
                                </div>
                            </div>
                            <div className="badges">
                                <span className={`badge ${STATUS_COLORS[c.status]}`}>{STATUS_LABELS[c.status]}</span>
                                <span className="badge badge-gray">اولویت: {PRIORITY_LABELS[c.priority]}</span>
                            </div>
                        </div>

                        {openId === c.id && (
                            <div className="corr-detail">
                                <p className="corr-body">{c.body}</p>

                                {c.replies?.length > 0 && (
                                    <div className="replies">
                                        <h4>پیگیری‌ها</h4>
                                        {c.replies.map((r) => (
                                            <div key={r.id} className="reply">
                                                <div className="msg-sender">
                                                    {r.user?.name}
                                                    {r.status && <span className={`badge ${STATUS_COLORS[r.status]}`}>{STATUS_LABELS[r.status]}</span>}
                                                    <span className="muted"> • {new Date(r.created_at).toLocaleString('fa-IR')}</span>
                                                </div>
                                                <div className="reply-body">{r.body}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="reply-form">
                                    <textarea
                                        rows="2"
                                        placeholder="پاسخ / پیگیری خود را بنویسید…"
                                        value={openId === c.id && reply.for === c.id ? reply.body : ''}
                                        onChange={(e) => setReply({ for: c.id, body: e.target.value, status: reply.for === c.id ? reply.status : '' })}
                                    />
                                    <div className="reply-actions">
                                        <select
                                            value={reply.for === c.id ? reply.status : ''}
                                            onChange={(e) => setReply({ for: c.id, body: reply.for === c.id ? reply.body : '', status: e.target.value })}
                                        >
                                            <option value="">بدون تغییر وضعیت</option>
                                            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                        <button className="btn btn-primary" onClick={() => sendReply(c.id)}>ثبت پاسخ</button>
                                    </div>
                                </div>

                                <div className="row-actions">
                                    {['in_progress', 'done', 'archived'].map((s) => (
                                        <button key={s} className="btn btn-sm" onClick={() => setStatus(c.id, s)}>
                                            {s === 'in_progress' ? 'شروع پیگیری' : s === 'done' ? 'اتمام' : 'بایگانی'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </article>
                ))}
                {!items.length && <p className="muted">مراوده‌ای ثبت نشده است.</p>}
            </div>
        </div>
    );
}
