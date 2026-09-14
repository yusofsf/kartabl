import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { can, NoPermissionHint } from '../permissions.jsx';

const TYPE_LABELS = { incoming: 'وارده', outgoing: 'صادره' };
const URGENCY_LABELS = { normal: 'عادی', urgent: 'فوری', very_urgent: 'خیلی فوری' };
const URGENCY_COLORS = { normal: 'badge-gray', urgent: 'badge-amber', very_urgent: 'badge-red' };

export default function LettersPage({ user }) {
    const [letters, setLetters] = useState([]);
    const [users, setUsers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [openId, setOpenId] = useState(null);
    const [form, setForm] = useState({
        type: 'outgoing', subject: '', body: '', sender_org: '', receiver_org: '',
        letter_date: new Date().toISOString().slice(0, 10), action: '', urgency: 'normal', recipients: [],
    });

    const load = useCallback(() => {
        api.get('/letters').then(({ data }) => setLetters(data)).catch(() => {});
    }, []);
    useEffect(load, [load]);

    useEffect(() => {
        api.get('/chat/users').then(({ data }) => setUsers(data)).catch(() => {});
    }, []);

    const create = async (e) => {
        e.preventDefault();
        try {
            await api.post('/letters', {
                ...form,
                sender_org: form.sender_org || null,
                receiver_org: form.receiver_org || null,
                action: form.action || null,
            });
            setForm({
                type: 'outgoing', subject: '', body: '', sender_org: '', receiver_org: '',
                letter_date: new Date().toISOString().slice(0, 10), action: '', urgency: 'normal', recipients: [],
            });
            setShowForm(false);
            load();
        } catch {}
    };

    const markRead = async (id) => {
        await api.post(`/letters/${id}/read`).catch(() => {});
        load();
    };

    const toggleRecipient = (id) => {
        setForm((f) => ({
            ...f,
            recipients: f.recipients.includes(id) ? f.recipients.filter((r) => r !== id) : [...f.recipients, id],
        }));
    };

    const today = new Date().toISOString().slice(0, 10);

    return (
        <div>
            <header className="page-head">
                <h2>نامه‌ها</h2>
                <p className="muted">ثبت و ارسال نامه‌های وارده و صادره به کاربران سامانه.</p>
                {can(user, 'send_letter') && (
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'بستن فرم' : '＋ نامه جدید'}
                    </button>
                )}
            </header>

            {!can(user, 'send_letter') && <NoPermissionHint permission="send_letter" />}

            {can(user, 'send_letter') && showForm && (
                <form className="panel form-grid" onSubmit={create}>
                    <label className="field"><span>نوع نامه *</span>
                        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                            <option value="outgoing">صادره (ارسالی)</option>
                            <option value="incoming">وارده (دریافتی)</option>
                        </select></label>
                    <label className="field"><span>تاریخ نامه *</span>
                        <input type="date" value={form.letter_date} onChange={(e) => setForm({ ...form, letter_date: e.target.value })} required /></label>
                    <label className="field"><span>موضوع *</span>
                        <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required /></label>
                    <label className="field"><span>فوریتی</span>
                        <select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
                            {Object.entries(URGENCY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select></label>
                    <label className="field"><span>فرستنده (سازمان/شخص)</span>
                        <input value={form.sender_org} onChange={(e) => setForm({ ...form, sender_org: e.target.value })} placeholder="مثلاً: شرکت نمونی" /></label>
                    <label className="field"><span>گیرنده (سازمان/واحد)</span>
                        <input value={form.receiver_org} onChange={(e) => setForm({ ...form, receiver_org: e.target.value })} placeholder="مثلاً: واحد مالی" /></label>
                    <label className="field span-2"><span>متن نامه *</span>
                        <textarea rows="5" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required /></label>
                    <label className="field span-2"><span>اقدام موردنظر</span>
                        <input value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })} placeholder="مثلاً: پیگیری و پاسخ تا ۳ روز" /></label>

                    <div className="field span-2">
                        <span>ارسال به کاربران (گیرندگان)</span>
                        <div className="member-picker">
                            {users.filter((u) => u.id !== user.id).map((u) => (
                                <label key={u.id} className={`member-chip ${form.recipients.includes(u.id) ? 'selected' : ''}`}>
                                    <input type="checkbox" checked={form.recipients.includes(u.id)} onChange={() => toggleRecipient(u.id)} />
                                    {u.name} {u.post ? `— ${u.post}` : ''}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button className="btn btn-primary">ثبت و ارسال نامه</button>
                    </div>
                </form>
            )}

            <div className="corr-list">
                {letters.map((l) => {
                    const meRecipient = l.recipients?.find((r) => r.id === user.id);
                    const unread = meRecipient && !meRecipient.pivot?.read_at;
                    return (
                        <article key={l.id} className={`panel corr-item ${unread ? 'unread' : ''}`}>
                            <div className="corr-head" onClick={() => setOpenId(openId === l.id ? null : l.id)}>
                                <div>
                                    <strong>
                                        {l.type === 'incoming' ? '📥' : '📤'} {l.subject}
                                        {unread && <span className="badge badge-red">خوانده‌نشده</span>}
                                    </strong>
                                    <div className="ann-meta muted">
                                        شماره {l.number} • {TYPE_LABELS[l.type]} • ثبت‌کننده: {l.creator?.name}
                                        {l.sender_org ? ` • فرستنده: ${l.sender_org}` : ''}
                                        {l.receiver_org ? ` • گیرنده: ${l.receiver_org}` : ''}
                                        {' • '}تاریخ: {new Date(l.letter_date).toLocaleDateString('fa-IR')}
                                    </div>
                                </div>
                                <div className="badges">
                                    <span className={`badge ${URGENCY_COLORS[l.urgency]}`}>{URGENCY_LABELS[l.urgency]}</span>
                                    <span className="badge badge-gray">{l.recipients?.length || 0} گیرنده</span>
                                </div>
                            </div>

                            {openId === l.id && (
                                <div className="corr-detail">
                                    <p className="corr-body">{l.body}</p>
                                    {l.action && <p className="muted">اقدام: {l.action}</p>}
                                    <div className="ann-meta muted">
                                        گیرندگان: {l.recipients?.map((r) => r.name).join('، ') || '—'}
                                    </div>
                                    {meRecipient && unread && (
                                        <div className="row-actions">
                                            <button className="btn btn-sm" onClick={() => markRead(l.id)}>خواندم</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </article>
                    );
                })}
                {!letters.length && <p className="muted">نامه‌ای ثبت نشده است.</p>}
            </div>
        </div>
    );
}
