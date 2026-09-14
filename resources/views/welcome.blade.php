<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>کارتابل | سامانه مدیریت ارتباطات سازمانی</title>
    <link rel="preconnect" href="https://cdn.jsdelivr.net">
    <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet">
    <style>
        html, body {
            margin: 0; padding: 0;
            font-family: Vazirmatn, Tahoma, 'Segoe UI', sans-serif;
            background: #f1f5f9; color: #0f172a;
        }
        #app { min-height: 100vh; }
        #app:empty::before {
            content: 'در حال بارگذاری کارتابل...';
            display: flex; justify-content: center; align-items: center;
            min-height: 100vh; color: #64748b; font-size: 1.05rem;
        }
        #boot-failsafe { display: none; text-align: center; }
        #boot-failsafe .box {
            background: #fff; max-width: 460px; margin: 15vh auto 0;
            border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px;
            box-shadow: 0 10px 30px rgba(15,23,42,.12);
        }
        #boot-failsafe button {
            font: inherit; cursor: pointer; border: none; border-radius: 10px;
            padding: 10px 22px; background: #1d4ed8; color: #fff; margin-top: 14px;
        }
    </style>
</head>
<body>
    <div id="app"></div>

    <div id="boot-failsafe">
        <div class="box">
            <h2 style="margin:0 0 10px">🗂️ سامانه کارتابل بارگذاری نشد</h2>
            <p style="color:#64748b;line-height:2;margin:0" id="boot-failsafe-text">
                جاوااسکریپت سامانه در زمان مورد انتظار بارگذاری نشد.<br>
                روی دکمه زیر بزنید تا صفحه با اطلاعات جدید باز شود.
            </p>
            <button onclick="hardRefresh()">بارگذاری مجدد</button>
        </div>
    </div>

    {{-- لود مستقیم از manifest بیلد — عمداً از @vite استفاده نمی‌شود تا dev server (hot) هرگز صفحه را نشکند --}}
    @php
        $manifest = json_decode(file_get_contents(public_path('build/manifest.json')), true);
    @endphp
    <link rel="stylesheet" href="{{ asset('build/' . $manifest['resources/css/app.css']['file']) }}">
    <script type="module" src="{{ asset('build/' . $manifest['resources/js/app.jsx']['file']) }}"></script>

    <script>
        function hardRefresh() {
            // رفرش کامل با دور زدن کش مرورگر
            window.location.href = window.location.pathname + '?fresh=' + Date.now();
        }

        // اگر React ظرف ۱۰ ثانیه mount نشد، خودکار بازیابی کن
        setTimeout(function () {
            var app = document.getElementById('app');
            if (app && app.childElementCount === 0 && !window.__reactMounted) {
                // اگر صفحه به Vite dev مرده (5173) اشاره می‌کند، یک‌بار خودکار به نسخه build بازیابی کن
                var deadDev = [...document.querySelectorAll('script[src]')].some(function (s) {
                    return s.src.indexOf(':5173/') !== -1;
                });
                if (deadDev && !window.__autoRecovered) {
                    window.__autoRecovered = true;
                    hardRefresh();
                    return;
                }
                document.getElementById('boot-failsafe').style.display = 'block';
                app.style.display = 'none';
            }
        }, 10000);
    </script>
</body>
</html>
