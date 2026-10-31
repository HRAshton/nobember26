# Визуальные ориентиры

Ссылки для разработчика, на которые опирались при проектировании v0.5. В архиве **нет скопированных скриншотов или официальных игровых звуков**.

1. Инвентарь GW2: https://wiki.guildwars2.com/wiki/Inventory — стартовый рюкзак, слоты, боковая панель, Deposit All Materials и Compact.
2. Скриншот инвентаря: https://wiki.guildwars2.com/wiki/File:Inventory.jpg — фактура, сетка, рамки редкости и значки сумок.
3. Окно Black Lion Chest: https://wiki.guildwars2.com/wiki/File:Black_Lion_Chest_window_(original).jpg — центральный сундук, иконки ключа и сундука, кнопка Open.
4. Другие варианты окна: https://wiki.guildwars2.com/wiki/Black_Lion_Chest/historical — более поздняя компоновка и награды.
5. Текущая игровая механика сундука: https://wiki.guildwars2.com/wiki/Black_Lion_Chest — четыре предмета с вероятностью пятого; в нашем квесте намеренно **ровно четыре**.
6. Продажа мусора торговцу: https://wiki.guildwars2.com/wiki/Merchant — Sell Junk и Buyback.
7. Политика фан-контента ArenaNet: https://www.arena.net/en/legal/content-terms-of-use — проект обязан оставаться некоммерческим, не выдавать себя за официальный и содержать собственную творческую часть.

Базовые художественные элементы (сундук, книги, фон, гербы и т.д.) созданы для этого фан-квеста, а не выгружены из GW2. Изображения официальных источников в архив не включались.

## Дополнение v0.6 — публичные данные для игровых иконок

- API: https://wiki.guildwars2.com/wiki/API:2/items (метаданные содержат поле `icon` с URL).
- Render service: https://wiki.guildwars2.com/wiki/API:Render_service (URL оригинальных ресурсов).
- Сундук: https://wiki.guildwars2.com/wiki/Black_Lion_Chest — GW2 API ID **20316**.
- Ключ: https://wiki.guildwars2.com/wiki/Black_Lion_Chest_Key — GW2 API ID **19980**.
- Текущие правила ArenaNet: https://www.arena.net/en/legal/content-terms-of-use ; https://www.arena.net/en/legal/user-agreement .

Оригинальные изображения **не встроены в автономную сборку**: только браузерный запрос публичных URL в случае доступного API, с локальным SVG-фолбэком. В данной версии не производилась генерация новых изображений на основе игрового арта.
