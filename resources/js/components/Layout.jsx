import React from 'react';

const NAV = [
    { key: 'dashboard', label: 'کارتابل', icon: '🗂️', admin: false },
    { key: 'letters', label: 'نامه‌ها', icon: '✉️', admin: false },
    { key: 'correspondences', label: 'مراودات داخلی', icon: '📋', admin: false },
    { key: 'chat', label: 'چت گروهی', icon: '💬', admin: false },
    { key: 'announcements', label: 'پیام کلی / اطلاعیه', icon: '📢', admin: false },
    { key: 'users', label: 'مدیریت کاربران', icon: '👥', admin: true },
    { key: 'profile', label: 'پروفایل', icon: '👤', admin: false },
];

export default function Layout({ user, page, onNavigate, onLogout, children }) {
    const items = NAV.filter((n) => !n.admin || user.role === 'admin');

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="brand">
                    <span className="brand-icon">🗂️</span>
                    <div>
                        <div className="brand-title">کارتابل</div>
                        <div className="brand-sub">سامانه ارتباطات سازمانی</div>
                    </div>
                </div>
                <nav>
                    {items.map((n) => (
                        <button
                            key={n.key}
                            className={`nav-item ${page === n.key ? 'active' : ''}`}
                            onClick={() => onNavigate(n.key)}
                        >
                            <span className="nav-icon">{n.icon}</span>
                            {n.label}
                        </button>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <div className="user-chip">
                        <div className="avatar">{user.name.charAt(0)}</div>
                        <div>
                            <div className="user-name">{user.name}</div>
                            <div className="user-post">{user.post || (user.role === 'admin' ? 'مدیر سامانه' : 'کاربر')}</div>
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-block" onClick={onLogout}>خروج از حساب</button>
                </div>
            </aside>
            <main className="content">{children}</main>
        </div>
    );
}
