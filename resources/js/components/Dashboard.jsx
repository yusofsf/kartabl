import React, { useEffect, useState } from 'react';
import api, { apiError } from '../api';

export default function Dashboard({ user, onNavigate }) {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([
            api.get('/letters'),
            api.get('/correspondences'),
            api.get('/announcements'),
            api.get('/chat/groups'),
        ])
            .then(([letters, corr, ann, groups]) => {
                setStats({
                    letters: letters.data.length,
                    unreadLetters: letters.data.filter(
                        (l) => l.recipients?.some((r) => r.id === user.id && !r.pivot?.read_at)
                    ).length,
                    correspondences: corr.data.filter((c) => c.status !== 'done' && c.status !== 'archived').length,
                    announcements: ann.data.filter((a) => !a.is_read).length,
                    chatGroups: groups.data.length,
                });
            })
            .catch((err) => {
                setStats({});
                setError(apiError(err));
            });
    }, [user.id]);

    const cards = [
        { label: 'نامه‌های خوانده‌نشده', value: stats?.unreadLetters ?? '—', icon: '✉️', page: 'letters', color: 'c-blue' },
        { label: 'مراودات باز', value: stats?.correspondences ?? '—', icon: '📋', page: 'correspondences', color: 'c-amber' },
        { label: 'اطلاعیه‌های جدید', value: stats?.announcements ?? '—', icon: '📢', page: 'announcements', color: 'c-rose' },
        { label: 'گروه‌های چت من', value: stats?.chatGroups ?? '—', icon: '💬', page: 'chat', color: 'c-green' },
    ];

    const quick = [
        { label: 'نامه جدید', icon: '📝', page: 'letters' },
        { label: 'مراوده جدید', icon: '➕', page: 'correspondences' },
        { label: 'گفتگو', icon: '💬', page: 'chat' },
        { label: 'اطلاعیه‌ها', icon: '📢', page: 'announcements' },
        ...(user.role === 'admin' ? [{ label: 'کاربر جدید', icon: '👤', page: 'users' }] : []),
    ];

    const today = new Date().toLocaleDateString('fa-IR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div>
            <header className="page-head" style={{ display: 'block', borderBottom: 'none', paddingBottom: 0 }}>
                <h2 style={{ fontSize: '1.6rem' }}>سلام {user.name} 👋</h2>
                <p className="muted">{today} — به کارتابل خود خوش آمدید</p>
            </header>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="stat-grid" style={{ marginTop: 18 }}>
                {cards.map((c) => (
                    <button key={c.label} className={`stat-card ${c.color}`} onClick={() => onNavigate(c.page)}>
                        <span className="stat-icon">{c.icon}</span>
                        <span className="stat-value">{c.value}</span>
                        <span className="stat-label">{c.label}</span>
                    </button>
                ))}
            </div>

            <div className="quick-grid">
                {quick.map((q) => (
                    <button key={q.label} className="quick-tile" onClick={() => onNavigate(q.page)}>
                        <span className="q-icon">{q.icon}</span>
                        {q.label}
                    </button>
                ))}
            </div>

            <div className="panel" style={{ marginTop: 20 }}>
                <h3>💡 راهنمای سریع</h3>
                <ul className="hint-list">
                    <li>✉️ در بخش <strong>نامه‌ها</strong> می‌توانید نامه وارده و صادره ثبت و برای همکاران ارسال کنید.</li>
                    <li>📋 <strong>مراودات داخلی</strong> برای ثبت و پیگیری درخواست‌های بین همکاران است.</li>
                    <li>💬 در <strong>چت گروهی</strong> گفتگوهای سازمانی را گروه‌بندی کنید.</li>
                    <li>📢 <strong>پیام کلی</strong> توسط مدیر برای اطلاع‌رسانی به همه منتشر می‌شود.</li>
                </ul>
            </div>
        </div>
    );
}
