import React, { useEffect, useState, useRef, useCallback } from 'react';
import api from '../api';
import { can, NoPermissionHint } from '../permissions.jsx';

export default function ChatPage({ user }) {
    const [groups, setGroups] = useState([]);
    const [active, setActive] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [showNew, setShowNew] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: '', description: '', members: [] });
    const bottomRef = useRef(null);
    const lastIdRef = useRef(0);

    const loadGroups = useCallback(() => {
        api.get('/chat/groups').then(({ data }) => {
            setGroups(data);
            if (!active && data.length) setActive(data[0]);
        }).catch(() => {});
    }, [active]);

    useEffect(() => {
        api.get('/chat/users').then(({ data }) => setAllUsers(data)).catch(() => {});
    }, []);

    useEffect(loadGroups, [loadGroups]);

    const loadMessages = useCallback((poll = false) => {
        if (!active) return;
        const after = poll ? lastIdRef.current : 0;
        api.get(`/chat/groups/${active.id}/messages`, { params: poll && after ? { after } : {} })
            .then(({ data }) => {
                if (data.length) {
                    lastIdRef.current = data[data.length - 1].id;
                    setMessages((prev) => (poll ? [...prev, ...data] : data));
                } else if (!poll) {
                    setMessages([]);
                }
            })
            .catch(() => {});
    }, [active]);

    useEffect(() => {
        lastIdRef.current = 0;
        loadMessages();
        const t = setInterval(() => loadMessages(true), 4000);
        return () => clearInterval(t);
    }, [loadMessages]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = async (e) => {
        e.preventDefault();
        if (!text.trim() || !active) return;
        try {
            const { data } = await api.post(`/chat/groups/${active.id}/messages`, { message: text.trim() });
            lastIdRef.current = data.id;
            setMessages((prev) => [...prev, data]);
            setText('');
        } catch {}
    };

    const createGroup = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/chat/groups', newGroup);
            setShowNew(false);
            setNewGroup({ name: '', description: '', members: [] });
            loadGroups();
            setActive(data.group);
        } catch {}
    };

    const toggleMember = (id) => {
        setNewGroup((g) => ({
            ...g,
            members: g.members.includes(id) ? g.members.filter((m) => m !== id) : [...g.members, id],
        }));
    };

    return (
        <div className="chat-page">
            <aside className="chat-sidebar">
                {can(user, 'create_chat_group')
                    ? <button className="btn btn-primary btn-block" onClick={() => setShowNew(true)}>＋ گروه جدید</button>
                    : <NoPermissionHint permission="create_chat_group" />}
                <div className="chat-group-list">
                    {groups.map((g) => (
                        <button
                            key={g.id}
                            className={`chat-group-item ${active?.id === g.id ? 'active' : ''}`}
                            onClick={() => setActive(g)}
                        >
                            <span className="chat-group-avatar">{g.name.charAt(0)}</span>
                            <span>
                                <span className="chat-group-name">{g.name}</span>
                                <span className="chat-group-meta">{g.users?.length || 0} عضو</span>
                            </span>
                        </button>
                    ))}
                    {!groups.length && <p className="muted" style={{ padding: 12 }}>هنوز گروهی ندارید؛ یک گروه بسازید.</p>}
                </div>
            </aside>

            <section className="chat-main">
                {active ? (
                    <>
                        <div className="chat-head">
                            <strong>{active.name}</strong>
                            <span className="muted">{active.description}</span>
                        </div>
                        <div className="chat-messages" dir="rtl">
                            {messages.map((m) => (
                                <div key={m.id} className={`msg ${m.sender_id === user.id ? 'mine' : ''}`}>
                                    {m.sender_id !== user.id && <div className="msg-sender">{m.sender?.name}</div>}
                                    <div className="msg-bubble">{m.message}</div>
                                    <div className="msg-time">
                                        {new Date(m.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            ))}
                            {!messages.length && <p className="muted chat-empty">پیامی در این گروه نیست — اولین نفر باشید!</p>}
                            <div ref={bottomRef} />
                        </div>
                        <form className="chat-input" onSubmit={send}>
                            {can(user, 'send_chat_message') ? (
                                <>
                                    <input
                                        placeholder="پیام خود را بنویسید…"
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                    />
                                    <button className="btn btn-primary">ارسال</button>
                                </>
                            ) : (
                                <div className="chat-no-perm muted" style={{ padding: '8px 4px', fontSize: '.85rem' }}>
                                    برای «ارسال پیام در چت» مجوز ندارید؛ با مدیر سامانه هماهنگ کنید.
                                </div>
                            )}
                        </form>
                    </>
                ) : (
                    <div className="chat-empty"><p className="muted">یک گروه را انتخاب کنید یا گروه جدیدی بسازید.</p></div>
                )}
            </section>

            {showNew && (
                <div className="modal-backdrop" onClick={() => setShowNew(false)}>
                    <form className="modal panel" onClick={(e) => e.stopPropagation()} onSubmit={createGroup}>
                        <h3>گروه چت جدید</h3>
                        <label className="field"><span>نام گروه *</span>
                            <input value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} required /></label>
                        <label className="field"><span>توضیح</span>
                            <input value={newGroup.description} onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })} /></label>
                        <div className="field">
                            <span>اعضا</span>
                            <div className="member-picker">
                                {allUsers.filter((u) => u.id !== user.id).map((u) => (
                                    <label key={u.id} className={`member-chip ${newGroup.members.includes(u.id) ? 'selected' : ''}`}>
                                        <input type="checkbox" checked={newGroup.members.includes(u.id)} onChange={() => toggleMember(u.id)} />
                                        {u.name} {u.post ? `— ${u.post}` : ''}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="form-actions">
                            <button className="btn btn-primary">ایجاد گروه</button>
                            <button type="button" className="btn btn-ghost" onClick={() => setShowNew(false)}>انصراف</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
