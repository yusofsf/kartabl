// مجوزهای سامانه — باید با User::PERMISSIONS در بک‌اند هم‌گام باشد
export const PERMISSIONS = {
    send_letter: 'ارسال نامه',
    create_correspondence: 'ثبت مراوده داخلی',
    create_chat_group: 'ایجاد گروه چت',
    send_chat_message: 'ارسال پیام در چت',
};

// مدیر همیشه همه مجوزها را دارد
export function can(user, permission) {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return (user.permissions || []).includes(permission);
}

// پیام واحد برای بخش بدون مجوز
export function NoPermissionHint({ permission }) {
    return (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
            برای «{PERMISSIONS[permission]}» مجوز ندارید. برای دریافت مجوز با مدیر سامانه هماهنگ کنید.
        </div>
    );
}
