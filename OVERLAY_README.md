Grace OBS Overlay — Overlay (vanilla)

Файлы оверлея находятся в папке `overlay/` и готовы к хостингу как статический сайт.

Быстрый старт:

- В `overlay/overlay.js` замените `SUPABASE_URL` и `SUPABASE_ANON_KEY` на значения вашего проекта Supabase.
- Откройте `overlay/index.html?room=<ROOM_UUID>` в браузере или добавьте как Browser Source в OBS (разрешение страницы — 1920×1080). При открытии без `?room=` оверлей покажет сообщение об ошибке.

Realtime и воспроизведение:
- Оверлей подписывается на таблицы `sources` и `playback_commands` (фильтр по `room_id`).
- Для управления звуком/видео используйте вставку записей в `playback_commands` с полями `action` и `url`/`source_id`.

Схема БД: см. `supabase_schema.sql`.

Деплой:
- Хостинг статических файлов можно сделать на Vercel/Netlify/Cloudflare Pages — укажите build-путь в `overlay/`.
