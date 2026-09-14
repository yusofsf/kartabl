import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import api, { apiError } from './api';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import UsersPage from './components/UsersPage';
import ChatPage from './components/ChatPage';
import AnnouncementsPage from './components/AnnouncementsPage';
import CorrespondencePage from './components/CorrespondencePage';
import LettersPage from './components/LettersPage';
import ProfilePage from './components/ProfilePage';
import './bootstrap';

// جلوگیری از crash کامل اپ هنگام خطای رندر
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    render() {
        if (this.state.error) {
            return (
                <div className="boot-screen" style={{ flexDirection: 'column', gap: 12 }}>
                    <h2>خطایی در نمایش صفحه رخ داد</h2>
                    <p className="muted">{String(this.state.error)}</p>
                    <button className="btn btn-primary" onClick={() => window.location.reload()}>
                        بارگذاری مجدد سامانه
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

function App() {
    const [user, setUser] = useState(null);
    const [booting, setBooting] = useState(true);
    const [bootError, setBootError] = useState('');
    const [page, setPage] = useState('dashboard');

    useEffect(() => {
        const saved = localStorage.getItem('kartabl_token');
        const savedUser = JSON.parse(localStorage.getItem('kartabl_user') || 'null');

        if (!saved || !savedUser) {
            setBooting(false);
            return;
        }

        // اعتبارسنجی توکن؛ در صورت خطا کاربر را به صفحه ورود برگردان، نه گیر دادن
        api.get('/me')
            .then(({ data }) => setUser(data))
            .catch((err) => {
                if (err?.response?.status === 401) return; // interceptor خودش redirect می‌کند
                // خطای سرور/شبکه: با داده ذخیره‌شده ادامه بده تا صفحه خالی نباشد
                setUser(savedUser);
            })
            .finally(() => setBooting(false));
    }, []);

    const login = (token, u) => {
        localStorage.setItem('kartabl_token', token);
        localStorage.setItem('kartabl_user', JSON.stringify(u));
        setUser(u);
        setPage('dashboard');
    };

    const logout = async () => {
        try { await api.post('/logout'); } catch {}
        localStorage.removeItem('kartabl_token');
        localStorage.removeItem('kartabl_user');
        setUser(null);
    };

    if (booting) return <div className="boot-screen">در حال بارگذاری سامانه کارتابل…</div>;

    if (!user) return <Login onLogin={login} />;

    const pages = {
        dashboard: <Dashboard user={user} onNavigate={setPage} />,
        users: user.role === 'admin' ? <UsersPage user={user} /> : null,
        chat: <ChatPage user={user} />,
        announcements: <AnnouncementsPage user={user} />,
        correspondences: <CorrespondencePage user={user} />,
        letters: <LettersPage user={user} />,
        profile: <ProfilePage user={user} onUserUpdate={setUser} />,
    };

    return (
        <Layout user={user} page={page} onNavigate={setPage} onLogout={logout}>
            {pages[page] ?? pages.dashboard}
        </Layout>
    );
}

createRoot(document.getElementById('app')).render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);
