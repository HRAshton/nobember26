# Проверки v1.2 — 31 октября 2026

Выполнено на Windows, Node.js 24.21.0, Python 3.12.10 и установленном Microsoft Edge через Playwright.

- npm test: 31 / 31 PASS. Экономика, N подарков, сохранения, конфигурация, сервер, отсутствие выдачи файлов Git, повреждённые URL.
- npm run validate: PASS, дополнительный ключ получается ровно один раз после секретного кода.
- python tools/finish_local.py --check --strict: PASS, 47 элементов, все шесть обязательных слоёв присутствуют.
- python tools/selftest.py: PASS, нарезка, приоритет готовых вырезок, карта иконок, CSS и отклонение выхода за каталог.
- python scripts/browser-smoke.py: PASS, весь квест, четыре награды в каждом сундуке, книга последней, клавиатура, звук, повторная загрузка, бонусный сундук, мобильный экран 390 × 844 и reduced motion. Подтверждено отсутствие внешних HTTP(S)-запросов автономной сборки и успешная загрузка изображений.
- python scripts/browser-backup-smoke.py: PASS, скачивание JSON, восстановление и отклонение несовместимого файла без потери прогресса.
- python scripts/browser-api-icons-smoke.py: PASS, необязательный прежний фолбэк проверен на имитированных ответах; официальный сервис не запрашивался.
- python scripts/release-shots.py: PASS, Merchant и Trading Company.
- node --check app.js: PASS.

Фактические снимки: previews/desktop.png, mobile.png, chest-window.png, chest-preview.png, loot-reveal.png, journal-spread.png, legendary-opening.png, legendary-rewards.png, secret-acquired.png, wallet-backup.png, merchant.png, trading-company.png.

Обнаруженная и исправленная исходная ошибка: клик Submit принимался за навигацию из-за data-screen у контейнера окна. Браузерный сценарий теперь использует настоящие клики и проходит ввод кода и обмен. Изменения движка, конфигурации и формата сохранения не потребовались.

Материальные ограничения: персональные подарки и места не сообщены — сохранены исходные демо-загадки. Клиентский квест не скрывает коды от DevTools. Декоративная мини-карта взята из учебного скриншота Queensdale; навыки не симулируют бой. Иконки низкого исходного разрешения не превращались в новые рисунки.
