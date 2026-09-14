import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 15000, // اگر سرور پاسخ نداد، بعد از ۱۵ ثانیه خطا بده — نه hang بی‌پایان
    headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('kartabl_token');
    if (token) {
        // Authorization استاندارد؛ X-Auth-Token پشتیبان هاست‌های اشتراکی است که
        // هدر Authorization را به PHP نمی‌رسانند (Apache/FastCGI).
        config.headers.Authorization = `Bearer ${token}`;
        config.headers['X-Auth-Token'] = token;
    }
    return config;
});

api.interceptors.response.use(
    (r) => r,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('kartabl_token');
            localStorage.removeItem('kartabl_user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// تبدیل خطای axios به پیام فارسی قابل نمایش
export function apiError(err) {
    const status = err?.response?.status;
    if (status === 403) return err.response?.data?.message || 'شما به این بخش دسترسی ندارید.';
    if (status === 422) {
        const first = Object.values(err.response?.data?.errors || {})[0];
        return (first?.[0]) || err.response?.data?.message || 'اطلاعات ارسالی معتبر نیست.';
    }
    if (status >= 500) return 'خطای سرور؛ لطفاً بعداً تلاش کنید یا سرور را بررسی کنید.';
    if (err?.code === 'ECONNABORTED') return 'پاسخی از سرور دریافت نشد (اتصاد قطع یا کند است).';
    if (!err?.response) return 'ارتباط با سرور برقرار نشد؛ مطمئن شوید سرور در حال اجراست.';
    return err.response?.data?.message || 'خطای نامشخص رخ داد.';
}

export default api;
