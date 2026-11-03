---
name: antoshkin-reanimate
description: Reverse-engineer an animation, interaction or section from a reference (live URL, screen recording, mp4/mov/webm, gif, Lottie) and rebuild it inside the antoshkin.tech site in its house style (black fog-and-glass, soft breathing gradients, large tight Google Sans type, single mint accent, --ease cubic-bezier(0.22,1,0.36,1), vanilla HTML/CSS + motion.js). Records the reference and the clone the same way, compares frame by frame and iterates until timing, easing and sequence match. Use when Andrey says "сделай как тут", "склонируй анимацию", "хочу такой hover/hero/reveal/marquee на сайт", "reanimate", or drops a link/gif/video and wants that motion on antoshkin.tech.
---

# antoshkin-reanimate

Адаптация скилла [reanimate](https://github.com/NiazMorshed2007/reanimate) (MIT, Niaz Morshed) под сайт antoshkin.tech и Cursor. Механика та же: **записать референс → разложить в спек → собрать → записать клон так же → сравнить → чинить, 2–5 раундов**. Отличие: по умолчанию клон переносит **движение** референса, а **вид** берёт из дом-стиля сайта (`references/antoshkin-style.md`). Результат — код в репо сайта плюс доказательства (цифры и side-by-side листы), а не «вроде похоже».

Отвечай Андрею по-русски, коротко.

## Уровни точности
| Уровень | Когда | Совпадает | Отличается |
|---|---|---|---|
| **house-style** (по умолчанию) | «хочу такое же на сайт», «как у них, но у нас» | триггер, порядок, стаггер, тайминг каждого шага (±80 ms), семейство кривой, дистанции | цвета, шрифты, стекло, акцент — из токенов сайта; кривая может стать `var(--ease)` |
| **motion-faithful** | «движение один в один» | всё выше, кривая — как у референса | вид — из дом-стиля |
| **pixel-faithful** | «точно как там», «1:1» (для прототипа/исследования, не для прода) | всё + шрифты, цвета, отступы; средний mismatch ≤ 2 % | ничего |

Уровень назови в первом сообщении.

## Процесс
Артефакты кладутся в `.reanimate/<name>/` в корне репо сайта (добавь в `.gitignore`). `<skill>` — папка с этим SKILL.md (обычно `.cursor/skills/antoshkin-reanimate` или `~/.cursor/skills/antoshkin-reanimate`).

### 0. Скоуп
Вверху `.reanimate/<name>/spec.md` три строки: **Target** (URL + селектор / таймкоды), **Destination** (какая страница/блок сайта, какие файлы: обычно `style.css`, `motion.js`, html-шаблон), **Fidelity**. Прочитай `references/antoshkin-style.md` и реальные `style.css`/`motion.js` в репо. Спрашивай, только если две трактовки ведут к разной работе.

### 1. Сетап (один раз)
```bash
bash <skill>/scripts/setup.sh   # нужен Bun ≥1.1; ставит playwright chromium, ffmpeg, pixelmatch (~250 MB)
```
Все скрипты: `bun <skill>/scripts/<name>.ts --help`. Правило: референс и клон снимаются с **одинаковыми** viewport, кропом, триггером, длительностью и fps.

### 2. Запись референса
См. `references/capture.md`.
- **Сайт**: `bun <skill>/scripts/capture.ts --url … --out .reanimate/<name>/ref --selector <блок> --trigger load|scroll|hover|click|none --duration … --track "<движущиеся элементы>"`. Получишь `video.webm`, `frames/`, `inspect.json` (точные CSS/WAAPI длительности, задержки, кривые), `track.json`.
- **Видео/gif**: `frames.ts --probe`, затем `frames.ts --in file --out ref/frames --fps 10..30 --start … --end … --crop …`.
- **Canvas/WebGL/three.js**: добавь `--clock virtual --gl --assets`, читай `gl.ts summary` и `references/webgl.md`.
- **Lottie/Rive**: файл и есть спек.

Собери листы `sheet.ts filmstrip --frames ref/frames --out ref/sheets` и **просмотри каждый** (в Cursor — открой PNG / прочитай как изображение).

### 3. Спек движения
Шаблон в `references/analysis.md`: строка на элемент × свойство — триггер, старт, длительность, стаггер, from → to, кривая. Источники по приоритету: `inspect.json` → `easing.ts` по `track.json` → чтение кадров. Строка с «?» = кадры не дочитаны.

Добавь колонку **«на сайте»**: во что превращается значение по `antoshkin-style.md` (например `ease-out 400ms` → `var(--ease) 600ms`, `#635bff` → `var(--mint)`, белая карточка → стекло).

### 4. Сборка (в стеке сайта)
- Ванильные HTML/CSS + отдельный IIFE-блок в `motion.js` с проверкой `reduced`. Новые фреймворки не тащи.
- Токены вместо хардкода; анимируй только `transform`/`opacity`/`filter`.
- Повторно используй существующие паттерны: `.in` + `--d` стаггер, `word`-блюр, `breathe`, flip-кнопки.
- Обязательная ветка `prefers-reduced-motion`.
- Детали — `references/implementation.md` (кривые, стаггер, scroll/hover-триггеры).
- Сделай страницу для съёмки клона (локальный сервер сайта или standalone `.reanimate/<name>/clone.html` с подключёнными `style.css`/`motion.js`).

### 5. Проверка → правка → повтор
Сними клон той же командой, поменяв только `--url` и `--out clone-N`, затем:
```bash
bun <skill>/scripts/compare.ts --ref ref/frames --clone clone-N/frames --out compare-N
bun <skill>/scripts/sheet.ts compare --ref ref/frames --clone clone-N/frames --diff compare-N/diff --out compare-N/sheets --every 2
bun <skill>/scripts/easing.ts --track clone-N/track.json --selector "<el>" --prop translateY --compare-track ref/track.json
```
Критерии — `references/verify.md`.

**Как судить в house-style и motion-faithful (проверено на прогоне):** когда вид клона намеренно другой (чёрный фон, стекло), `compare.ts` показывает mismatch ~95 % и путает окно движения и автосдвиг кадров (`clone offset`) — это **не** провал. Главный критерий — трек: `easing.ts --compare-track ref/track.json` по каждому ключевому элементу и свойству (`translateY`, `opacity`, `scale`). Pass: `meanAbsDiff` ≲ 1 px (для opacity ≲ 0.02), `delayMs` каждого элемента в пределах ±80 ms от спека, кривая в verdict той же семьи (или `easeOutQuint` = `var(--ease)`, если ты осознанно её заменил). Compare-листы всё равно смотри глазами: порядок и стаггер видны там сразу. `compare.ts` с порогом пикселей используй только для pixel-faithful.

Чтобы кроп совпадал, у блока клона те же ширина/высота, что у референса (иначе compare рескейлит кадры). Локальные файлы снимаются через `--url file:///abs/path.html`. Reduced-motion: `capture.ts … --reduced-motion reduce`, затем `easing.ts` должен сказать `no motion`. Для house-style пиксельный mismatch **не** критерий (цвета намеренно другие): смотри тайминги, порядок, кривые, дистанции. Если ты заменил кривую на `var(--ease)` — запиши в спек как осознанное отклонение с цифрой.

Каждый раунд меняй самое маленькое, на что указывают данные. Максимум 5 раундов; что не сошлось — в отчёт с числом и причиной, порог не занижай.

### 6. Финальная проверка дом-стиля
Перед отчётом пройди чеклист:
- [ ] Только токены `--bg/--card/--glass/--line/--text/--muted/--mint`, шрифт `--sans`.
- [ ] Один акцент (mint), стекло = `blur(40px) saturate(1.6)`.
- [ ] Появления 500–900 ms, стаггер 50–70 ms, без резких пружин.
- [ ] reduced-motion работает (`--reduced-motion reduce` → `easing.ts` пишет `no motion`).
- [ ] Нет чужих логотипов/текстов/иллюстраций.
- [ ] Mobile 390px: не ломается, нет горизонтального скролла.

### 7. Отчёт (по-русски)
- Уровень, что склонировано, что адаптировано под стиль.
- Файлы и как вызвать анимацию.
- Таблица последнего раунда: ошибка тайминга, совпадение кривой, pass/fail по ключевым элементам.
- Пути к compare-листам.
- Остаточные отклонения — с числом и причиной.

## Грабли
- Разный viewport/кроп у референса и клона — чини съёмку, а не код.
- Кривая живёт в средних кадрах — читай листы целиком.
- Google Sans vs фолбэк меняет все пиксели — в house-style игнорируй пиксели текста.
- Скролл-анимации сравнивай по `scrollY` (`--scroll-steps`, `--scroll-ms`), не по времени.
- GSAP/Framer-пружины не замедляются `--playback-rate` — используй `track.json` + `easing.ts`.
- Canvas/WebGL — только `--clock virtual` и одинаковый `--seed`.
- `backdrop-filter` в headless Chromium может рендериться иначе — проверь глазами в обычном браузере.
