/* UI Lab page: keeps the studies light and opens the study viewer.
   - Each study is its own small page in an iframe. They mount when they come near the screen,
     play by themselves while they are mostly visible (a few at a time, nearest the middle first),
     and unmount again once they are far away.
   - The viewer is one screen: the study large on the left, and on the right what it is, how to use it and its parameters (tuned live). */
(function () {
  'use strict';
  var LANG = document.documentElement.lang === 'ru' ? 'ru' : 'en';
  var T = {
    ru: { open: 'Открыть', close: 'Закрыть', what: 'Что это', how: 'Как пользоваться', set: 'Настройки', reset: 'Сбросить',
          stiff: 'жёсткость', damp: 'затухание',
          tip: 'Жёсткость задаёт скорость отклика, затухание\u00a0— как долго пружина качается. После изменения пример перезапускается.' },
    en: { open: 'Open', close: 'Close', what: 'What it is', how: 'How to use it', set: 'Settings', reset: 'Reset',
          stiff: 'stiffness', damp: 'damping',
          tip: 'Stiffness sets how fast it responds, damping sets how long it wobbles. The study restarts after a change.' }
  }[LANG];

  var sp = function (key, ru, en, def) { return { type: 'spring', key: key, label: { ru: ru, en: en }, def: def }; };
  var nm = function (key, ru, en, def, min, max, step, unit) { return { type: 'num', key: key, label: { ru: ru, en: en }, def: def, min: min, max: max, step: step, unit: unit || '' }; };

  var INFO = {
    'focus-mode': {
      ru: { what: 'Фокус-режим как на телефоне. Уведомления прилетают одно за другим, а переключатель прячет их стопкой под панель и показывает счётчик. Выключаете, и они разворачиваются обратно.', how: 'Играет само. Переключатель можно нажать самому.' },
      en: { what: 'A phone-style focus mode. Pings arrive one after another, and the switch tucks them into a stack under the bar and shows a count. Switch it off and they fan back out.', how: 'Plays by itself. Flip the switch yourself.' },
      settings: [sp('t.--spring-soft', 'Перестроение карточек', 'Cards settling', [260, 24]), sp('t.--spring-pop', 'Всплеск счётчика', 'Counter pop', [520, 16]),
                 sp('t.--spring-fade', 'Появление и исчезание', 'Fade in and out', [420, 32]), sp('t.--spring-settle', 'Посадка переключателя', 'Switch settle', [280, 22])]
    },
    'plan-switch': {
      ru: { what: 'Карточка тарифа. Переключатель «месяц / год» растягивает подсветку, цена прокручивается барабаном, раскрывается строка с бонусом. Кнопка сжимается в круг со спиннером и раскрывается обратно уже зелёной.', how: 'Играет само. Нажмите на переключатель или на кнопку.' },
      en: { what: 'A pricing card. The monthly / yearly switch stretches its highlight, the price rolls like a drum, and a bonus row opens. The button closes into a circle with a spinner and opens again, now green.', how: 'Plays by itself. Click the switch or the button.' },
      settings: [sp('t.--spring-lead', 'Ведущий край подсветки', 'Leading edge of the highlight', [620, 36]), sp('t.--spring-trail', 'Отстающий край', 'Trailing edge', [190, 19]),
                 sp('t.--spring-pop', 'Всплеск галочки и плашки', 'Check and chip pop', [520, 16]), sp('t.--spring-soft', 'Раскрытие строки и кнопки', 'Row and button resize', [260, 24])]
    },
    'pull-cord': {
      ru: { what: 'Торшер в комнате и шнур из цепочки точек с весом. Тянете за бусину, и шнур вытягивается как резина, а торшер качается на основании. За щелчком свет раскрывается кругом от лампочки и заливает комнату.', how: 'Потяните за бусину или просто нажмите на неё.' },
      en: { what: 'A floor lamp in a room, with a cord made of weighted points. Pull the bead and the cord stretches like rubber while the lamp rocks on its base. Past the click, the light opens as a circle from the bulb and fills the room.', how: 'Pull the bead, or just tap it.' },
      settings: [nm('p.gravity', 'Тяжесть шнура', 'Cord weight', 2600, 800, 4000, 100), nm('p.click', 'Растяжение для щелчка', 'Stretch that clicks', 22, 8, 50, 1, 'px'), nm('p.max', 'Предел растяжения', 'Most it gives', 54, 30, 100, 1, 'px')]
    },
    'morph-tooltip': {
      ru: { what: 'Одна подсказка на все иконки панели. Она не появляется заново, а перетекает от иконки к иконке и растягивается под ширину нового слова. Старая надпись уезжает, новая заезжает с другой стороны.', how: 'Наведите курсор на иконки. Нажатие выбирает инструмент.' },
      en: { what: 'One tooltip for every icon in the bar. It does not appear again, it travels from icon to icon and stretches to the width of the new label. The old label slides out, the new one slides in from the other side.', how: 'Hover the icons. A click picks the tool.' },
      settings: [sp('p.lead', 'Передний край', 'Leading edge', [620, 36]), sp('p.trail', 'Задний край', 'Trailing edge', [190, 19]), nm('p.walk', 'Шаг демо', 'Demo step', 1.05, .4, 3, .05, 's')]
    },
    'morph-island': {
      ru: { what: 'Чёрная пилюля меняет форму под состояние: пусто, таймер, экспорт, запрос на согласие. Ширина и высота на разных пружинах, поэтому форма сначала расширяется вбок и только потом оседает вниз.', how: 'Играет сама. Кнопки снизу и сама пилюля переключают состояния.' },
      en: { what: 'A black pill that changes shape with its state: idle, timer, export, approval request. Width and height are on different springs, so the shape widens first and only then drops into place.', how: 'Plays by itself. The buttons below, and the pill itself, switch states.' },
      settings: [sp('t.--island-w', 'Ширина', 'Width', [380, 24]), sp('t.--island-h', 'Высота', 'Height', [300, 22]), nm('t.--island-radius', 'Скругление', 'Corner radius', 32, 12, 40, 1, 'px'), nm('t.--island-cycle-ms', 'Шаг истории', 'Story step', 2800, 1200, 5000, 100, 'ms')]
    },
    'goo-menu': {
      ru: { what: 'Плюс, из которого выливаются пузыри с действиями. Фильтр SVG сливает их, пока они рядом, и они отрываются как капли. Выбранное действие сворачивает всё в плашку с уведомлением.', how: 'Нажмите на плюс, потом на пузырь. Пузыри можно оттянуть и отпустить.' },
      en: { what: 'A plus that pours out bubbles with actions. An SVG filter fuses them while they are close, so they peel off like drops. Picking an action folds everything into a toast pill.', how: 'Tap the plus, then a bubble. You can pull a bubble and let it go.' },
      settings: [sp('t.--goo-out', 'Вылет пузырей', 'Bubbles flying out', [230, 15]), sp('t.--goo-in', 'Возврат', 'Bubbles returning', [520, 34]), sp('t.--goo-release', 'Отскок после оттяжки', 'Snap back after a pull', [300, 12]),
                 sp('t.--goo-toast', 'Превращение в плашку', 'Morph into the toast', [260, 17]), nm('t.--goo-radius', 'Расстояние пузырей', 'Bubble distance', 112, 70, 150, 1, 'px'),
                 nm('t.--goo-stagger', 'Задержка между пузырями', 'Delay between bubbles', 45, 0, 120, 5, 'ms'), nm('t.--goo-toast-ms', 'Плашка висит', 'Toast stays', 2600, 1000, 5000, 100, 'ms'), nm('t.--goo-blur', 'Сила слияния', 'Goo strength', 10, 4, 16, 1)]
    },
    'jelly-slider': {
      ru: { what: 'Ползунок тянется за курсором как желе и вытягивается со скоростью. Над бегунком растёт капля со значением и отрывается от него. За край бегунок тянется с сопротивлением резины и отскакивает.', how: 'Тяните бегунок. Стрелки на клавиатуре тоже работают.' },
      en: { what: 'A slider that follows the pointer like jelly and stretches with its speed. A value drop grows out of the thumb and peels off it. Past either end the thumb meets rubber resistance and snaps back.', how: 'Drag the thumb. The arrow keys work too.' },
      settings: [sp('t.--slider-follow', 'Бегунок за курсором', 'Thumb following', [900, 50]), sp('t.--slider-bubble', 'Капля со значением', 'Value drop', [420, 22]), sp('t.--slider-release', 'Отскок от края', 'Snap back from the end', [300, 14]), nm('t.--slider-blur', 'Сила слияния', 'Goo strength', 8, 3, 14, 1)]
    },
    'hold-button': {
      ru: { what: 'Удаление, которое нельзя сделать случайно: кнопку нужно держать. Пока держите, слева едет красная заливка, подпись под ней темнеет, а крышка корзины понемногу приоткрывается. Отпустили раньше, и заливка отскакивает, крышка падает на место, а кнопка качает головой. Дожали, и кнопка схлопывается в красный круг с галочкой.', how: 'Нажмите на кнопку и держите.' },
      en: { what: 'A delete you can\u2019t do by accident: you have to hold it. While you hold, red fills in from the left, the label turns dark under it and the bin\u2019s lid lifts a little. Let go early and the fill springs back, the lid drops and the button shakes no. Hold to the end and it folds into a red circle with a check.', how: 'Press the button and hold.' },
      settings: [nm('t.--hold-ms', 'Сколько держать', 'How long to hold', 1200, 500, 3000, 100, 'ms'), sp('t.--hold-release', 'Отскок заливки', 'Fill spring-back', [260, 14]), sp('t.--hold-morph', 'Превращение в круг', 'Morph into the circle', [320, 20]), nm('t.--hold-done-ms', 'Галочка висит', 'Check stays', 1700, 800, 4000, 100, 'ms')]
    },
    'swipe-deck': {
      ru: { what: 'Стопка карточек. Верхняя едет за пальцем и наклоняется вокруг точки, за которую её взяли. Нижние поднимаются по мере сдвига. Бросили далеко или быстро, и карточка улетает и уходит в конец стопки.', how: 'Смахните карточку влево или вправо. Стрелки ← и → тоже работают.' },
      en: { what: 'A stack of cards. The top one follows the pointer and tilts around the point you grabbed. The ones below rise as you drag. Throw it far or fast enough and it flies off and goes to the back.', how: 'Swipe the card left or right. The ← and → keys work too.' },
      settings: [sp('t.--deck-drag', 'Карточка за курсором', 'Card following', [900, 50]), sp('t.--deck-return', 'Возврат на место', 'Return to the stack', [280, 16]), nm('t.--deck-threshold', 'Порог решения', 'Decision threshold', 110, 40, 200, 5, 'px')]
    },
    'rubber-dock': {
      ru: { what: 'Нижняя панель вкладок. При переходе подсветка тянется как резинка: передний край быстрый, задний ленивый. Нажатие на активную вкладку раскрывает всю панель в карточку с содержимым.', how: 'Нажмите на вкладку или перетащите подсветку. Повторное нажатие раскрывает карточку.' },
      en: { what: 'A bottom tab dock. The highlight stretches like rubber between tabs: the leading edge is quick, the trailing edge lazy. Tapping the active tab opens the whole dock into a card with content.', how: 'Click a tab or drag the highlight. Tap the active tab again to open the card.' },
      settings: [sp('t.--dock-lead', 'Передний край', 'Leading edge', [640, 38]), sp('t.--dock-trail', 'Задний край', 'Trailing edge', [150, 16]), sp('t.--dock-open-w', 'Раскрытие: ширина', 'Opening: width', [340, 21]),
                 sp('t.--dock-open-h', 'Раскрытие: высота', 'Opening: height', [230, 21]), sp('t.--dock-close', 'Закрытие', 'Closing', [420, 30]), sp('t.--dock-pop', 'Всплеск иконки', 'Icon pop', [520, 16])]
    },
    'parallax-ticket': {
      ru: { what: 'Визитка из голографической фольги. Фольга нарисована шейдером: шум, пропущенный сам через себя, даёт медленные жидкие складки, а свет на них считается по нормалям, как на мятом металле. В покое она серебряная с лёгким перламутром. Под курсором фольга разогревается до насыщенной радуги, которая ложится полосами по складкам, а наклон карточки сдвигает цвета. Сама карточка наклоняется за курсором, и фольга с текстом расходятся по глубине. Клик переворачивает билет на пружине: на лицевой стороне имя и роль, на обороте коротко про меня и места работы.', how: 'Водите курсором. Нажмите, чтобы перевернуть.' },
      en: { what: 'A business card in holographic foil. The foil is a shader: noise warped through itself gives slow liquid folds, and light falls on them by their normals, like on crumpled metal. At rest it is silver with a faint pearl sheen. Under the pointer the foil heats up into saturated rainbow bands that follow the folds, and tilting the card shifts the hues. The card itself tilts toward the pointer, and the foil and the type separate in depth. A click flips it on a spring, showing the name and role on the front and a short note about me and where I have worked on the back.', how: 'Move the pointer. Click to flip.' },
      settings: [nm('t.--ticket-tilt', 'Наклон', 'Tilt', 14, 0, 30, 1, '°'), nm('t.--ticket-depth', 'Глубина слоёв', 'Layer depth', 12, 0, 30, 1, 'px'), sp('t.--ticket-flip', 'Переворот', 'Flip', [170, 15]), sp('t.--ticket-heat', 'Разогрев фольги', 'Foil heat-up', [90, 15])]
    },
    'glass-lens': {
      ru: { what: 'Круглая лупа над листом. Внутри три копии листа с разным увеличением, поэтому края искривлены, как у настоящей линзы. Лупа немного отстаёт от курсора, как капля воды. Нажатие увеличивает сильнее.', how: 'Водите курсором. Нажмите и держите для большего увеличения.' },
      en: { what: 'A round magnifying glass over a sheet. Inside are three copies of the sheet at different zoom, so the edge bends like a real convex lens. The glass lags the pointer a little, like a drop of water. Pressing zooms in further.', how: 'Move the pointer. Press and hold to zoom in more.' },
      settings: [sp('t.--lens-follow', 'Погоня за курсором', 'Chasing the pointer', [180, 17]), nm('t.--lens-zoom', 'Увеличение', 'Zoom', 1.7, 1.1, 3, .1, '×'), nm('t.--lens-zoom-press', 'Увеличение при нажатии', 'Zoom when pressed', 2.4, 1.2, 4, .1, '×'), nm('t.--lens-size', 'Размер', 'Size', 150, 90, 220, 5, 'px')]
    },
    'pull-refresh': {
      ru: { what: 'Список, который тянется вниз с сопротивлением. Из шапки вытягивается капля, за порогом она отрывается и становится спиннером. Потом сверху появляется новая строка, и список возвращается на пружине.', how: 'Потяните список вниз. Клавиша R обновляет без жеста.' },
      en: { what: 'A list that pulls down with resistance. A drop stretches out of the header, pops off past the threshold and becomes the spinner. Then a new row lands at the top and the list springs home.', how: 'Pull the list down. The R key refreshes without the gesture.' },
      settings: [nm('t.--pull-threshold', 'Порог обновления', 'Refresh threshold', 88, 40, 150, 2, 'px'), sp('t.--pull-return', 'Возврат списка', 'List returning', [260, 18]), nm('t.--pull-hold-ms', 'Сколько крутится спиннер', 'How long it spins', 1300, 500, 3500, 100, 'ms')]
    },
    'word-roll': {
      ru: { what: 'Последнее слово фразы прокручивается вверх буква за буквой, а снизу так же въезжает следующее. Место под слово растягивается до ширины нового слова на пружине.', how: 'Играет само. Клик или Enter переключает слово.' },
      en: { what: 'The last word of a line rolls up and out letter by letter while the next one rolls in from below. The space it sits in stretches to the new width on a spring.', how: 'Plays by itself. Click or Enter turns it now.' },
      settings: [nm('p.hold', 'Пауза на слове', 'Pause on a word', 2.4, .8, 5, .1, 's'), sp('p.letter', 'Буквы', 'Letters', [420, 26]), sp('p.width', 'Ширина места', 'Slot width', [320, 30])]
    },
    'weight-wave': {
      ru: { what: 'Толщина каждой буквы тянется к колоколу вокруг курсора, и по строке катится волна жирности. Для этого нужен вариативный шрифт с осью толщины.', how: 'Водите курсором вдоль строки.' },
      en: { what: 'Each letter’s weight is pulled toward a bell curve around the pointer, so a swell of bold rolls through the line. It needs a variable font with a weight axis.', how: 'Move the pointer along the line.' },
      settings: [nm('p.light', 'Тонкое начертание', 'Light weight', 300, 100, 500, 10), nm('p.bold', 'Жирное начертание', 'Bold weight', 820, 500, 900, 10), nm('p.spread', 'Ширина волны', 'Width of the swell', .13, .05, .3, .01), sp('p.letter', 'Буквы', 'Letters', [260, 22]), sp('p.swell', 'Волна за курсором', 'Swell following', [150, 22])]
    },
    'goo-morph': {
      ru: { what: 'Одно слово перетекает в другое. Обе версии размываются в разные стороны, а пороговый фильтр склеивает размытие в одну жидкую форму. Пока слово стоит, края у него гладкие.', how: 'Играет само. Клик по слову переключает его.' },
      en: { what: 'One word melts into the next. Both words blur in opposite directions and a threshold filter turns the overlap into one liquid shape. At rest the word keeps smooth edges.', how: 'Plays by itself. Click the word to melt now.' },
      settings: [nm('p.melt', 'Длительность перетекания', 'Melt time', 1.05, .4, 2.5, .05, 's'), nm('p.hold', 'Пауза на слове', 'Pause on a word', 1.6, .5, 4, .1, 's'), nm('p.blur', 'Сила размытия', 'Blur strength', 8, 2, 16, 1, 'px')]
    },
    'scramble-text': {
      ru: { what: 'Каждая буква мерцает случайными символами и встаёт на место слева направо, с небольшим разбросом. Моноширинный шрифт не даёт строке дёргаться. Следующая фраза расшифровывается поверх прежней.', how: 'Играет само. Наведите курсор на строку, чтобы расшифровать заново.' },
      en: { what: 'Each letter flickers through random glyphs and settles on the right one, left to right with a little randomness. A monospace face keeps the line from jumping. The next phrase decodes over the last.', how: 'Plays by itself. Hover the line to decode again.' },
      settings: [nm('p.hold', 'Пауза на фразе', 'Pause on a phrase', 2.6, .8, 5, .1, 's'), nm('p.flicker', 'Скорость мерцания', 'Flicker interval', .055, .02, .15, .005, 's'), nm('p.step', 'Сдвиг между буквами', 'Delay between letters', .035, .01, .1, .005, 's')]
    },
    'magnetic-button': {
      ru: { what: 'Кнопка тянется к курсору, когда он рядом, а подпись тянется ещё дальше, поэтому появляется глубина. Курсор ушёл, и всё возвращается на пружине. Пока рядом никого нет, маленькая точка играет роль курсора.', how: 'Подведите курсор к кнопке.' },
      en: { what: 'The button leans toward a nearby pointer and its label leans further, which gives it depth. When the pointer leaves, both spring home. While nobody is there, a small dot plays the pointer.', how: 'Bring the pointer close to the button.' },
      settings: [nm('p.radius', 'Радиус притяжения', 'Pull radius', 130, 60, 240, 5, 'px'), nm('p.pull', 'Сила притяжения', 'Pull strength', .32, .05, .6, .01), sp('p.button', 'Кнопка', 'Button', [170, 13]), sp('p.label', 'Подпись', 'Label', [220, 15])]
    },
    'like-burst': {
      ru: { what: 'Звезда сплющивается, заливается золотым и выбрасывает кольцо точек, а счётчик прокручивается на единицу. Повторный клик откатывает всё назад, звезда пустеет с небольшим проседанием.', how: 'Нажмите на звезду.' },
      en: { what: 'The star squashes, fills gold and throws out a ring of dots while the count rolls up by one. A second click rolls it all back and the star empties with a small dip.', how: 'Click the star.' },
      settings: [sp('p.pop', 'Всплеск звезды', 'Star pop', [520, 13]), sp('p.count', 'Счётчик', 'Counter', [260, 20]), nm('p.burst', 'Длина вспышки', 'Burst length', .55, .2, 1.2, .05, 's')]
    },
    'dynamic-menu': {
      ru: { what: 'Пилюля с двумя полосками. Открываясь, она растягивается в панель, полоски встречаются посередине и превращаются в крестик, а ссылки выезжают по очереди.', how: 'Нажмите на меню.' },
      en: { what: 'A small pill with a two-line toggle. Open, it springs into a panel, the lines meet in the middle and turn into a cross, and the links rise in one by one.', how: 'Click the menu.' },
      settings: [sp('p.width', 'Ширина', 'Width', [320, 26]), sp('p.height', 'Высота', 'Height', [240, 22]), sp('p.toggle', 'Полоски в крестик', 'Lines into a cross', [380, 24]), nm('p.stagger', 'Задержка между ссылками', 'Delay between links', .05, 0, .2, .01, 's')]
    },
    'prompt-box': {
      ru: { what: 'Поле запроса с кнопкой отправки. Стрелка превращается в квадрат «стоп», пока идёт ответ, а над полем раскрывается строка состояния, и в ней по очереди меняются подписи.', how: 'Играет само. Напишите запрос и нажмите Enter или стрелку.' },
      en: { what: 'A prompt field with a send button. The arrow turns into a stop square while a reply is on its way, and a status row opens above the field and cycles through its captions.', how: 'Plays by itself. Type a prompt and press Enter or the arrow.' },
      settings: [sp('p.open', 'Раскрытие строки состояния', 'Status row opening', [260, 24]), sp('p.swap', 'Смена стрелки на стоп', 'Arrow to stop swap', [420, 26])]
    },
    'streaming-reply': {
      ru: { what: 'Вопрос, три точки ожидания и ответ, который выходит слово за словом: каждое слово проявляется из размытия и чуть приподнимается. Пузыри вырастают на пружине.', how: 'Играет само. Нажмите, чтобы воспроизвести ответ заново.' },
      en: { what: 'A question, three waiting dots, and a reply that arrives word by word: each word comes out of a blur and rises a little. The bubbles grow on a spring.', how: 'Plays by itself. Click to replay the reply.' },
      settings: [nm('p.rate', 'Слов в секунду', 'Words per second', 8, 2, 20, 1), sp('p.pop', 'Появление пузыря', 'Bubble pop', [420, 22]), sp('p.word', 'Появление слова', 'Word arrival', [300, 26])]
    },
    'ghost-suggestion': {
      ru: { what: 'Заметка дописывает фразу сама: бледная подсказка проявляется после последнего слова. Tab принимает её, и текст становится обычным, Esc убирает подсказку.', how: 'Играет само. Нажмите Tab, чтобы принять подсказку, или Esc, чтобы убрать.' },
      en: { what: 'A note that finishes your sentence: a pale suggestion fades in after the last word. Tab accepts it and the text turns solid, Esc waves it away.', how: 'Plays by itself. Press Tab to accept the suggestion or Esc to dismiss it.' },
      settings: [sp('p.ghost', 'Появление подсказки', 'Suggestion fade-in', [260, 26]), sp('p.accept', 'Принятие', 'Accepting', [420, 22])]
    },
    'command-palette': {
      ru: { what: 'Строка поиска вырастает в палитру команд. Выделение едет между строками как резинка: передний край быстрый, задний отстаёт. Закрываясь, палитра сжимается обратно в строку.', how: 'Нажмите на строку или ⌘K (Ctrl+K). Стрелки двигают выделение, Enter запускает, Esc закрывает.' },
      en: { what: 'A search bar that grows into a command palette. The highlight travels between rows like rubber: the leading edge is quick, the trailing edge lags. On close it shrinks back into the bar.', how: 'Click the bar or press ⌘K (Ctrl+K). Arrows move the highlight, Enter runs, Esc closes.' },
      settings: [sp('p.open', 'Раскрытие палитры', 'Palette opening', [300, 24]), sp('p.hl-lead', 'Передний край выделения', 'Leading edge of the highlight', [620, 36]), sp('p.hl-trail', 'Задний край', 'Trailing edge', [190, 19])]
    },
    'otp-code': {
      ru: { what: 'Шесть ячеек поверх одного настоящего поля ввода. Каждая цифра встаёт с небольшим всплеском. Верный код заливает ячейки зелёным, неверный встряхивает ряд.', how: 'Играет само. Введите шесть цифр. Верный код в демо: 482916.' },
      en: { what: 'Six boxes laid over one real input. Each digit lands with a small pop. A correct code turns the boxes green, a wrong one shakes the row.', how: 'Plays by itself. Type six digits. The demo\u2019s correct code is 482916.' },
      settings: [sp('p.pop', 'Всплеск цифры', 'Digit pop', [520, 15]), sp('p.shake', 'Встряска при ошибке', 'Error shake', [900, 14])]
    },
    'segmented-control': {
      ru: { what: 'Один бегунок под четырьмя сегментами. Его края идут на разных пружинах: ведущий спешит, задний отстаёт, поэтому бегунок растягивается и садится. Число над подписью дорастает до нового значения.', how: 'Нажмите на сегмент или двигайтесь стрелками.' },
      en: { what: 'One thumb under four segments. Its two edges are on separate springs: the leading edge hurries and the trailing edge lags, so the thumb stretches and settles. The number counts up to its new value.', how: 'Click a segment or use the arrow keys.' },
      settings: [sp('p.lead', 'Ведущий край', 'Leading edge', [620, 36]), sp('p.trail', 'Задний край', 'Trailing edge', [190, 19]), sp('p.count', 'Счётчик', 'Counter', [150, 20])]
    },
    'step-progress': {
      ru: { what: 'Четыре шага на линии. Линия заполняется на пружине, пройденные шаги всплывают галочкой, текущий слегка набухает. На последнем шаге «Далее» превращается в «Сначала».', how: 'Играет само. Жмите «Далее» и «Назад» или переходите по кружкам.' },
      en: { what: 'Four steps on a line. The line fills on a spring, passed steps pop a check, the current one swells a little. On the last step Next becomes Start over.', how: 'Plays by itself. Use Next and Back or jump with the circles.' },
      settings: [sp('p.line', 'Заполнение линии', 'Line fill', [210, 24]), sp('p.pop', 'Всплеск галочки', 'Check pop', [520, 15])]
    },
    'stat-card': {
      ru: { what: 'Карточка с суммой, дельтой и графиком. При смене периода двенадцать точек линии идут к новым высотам каждая на своей пружине, поэтому линия переливается, а число дорастает до нового значения.', how: 'Играет само. Переключайте период и ведите курсором по графику.' },
      en: { what: 'A card with a total, a delta chip and a chart. When the range changes, the twelve points of the line move to new heights, each on its own spring, so the line ripples while the number counts to its new value.', how: 'Plays by itself. Switch the range and move across the chart.' },
      settings: [sp('p.ripple', 'Движение точек', 'Point motion', [210, 17]), sp('p.count', 'Счётчик', 'Counter', [160, 20])]
    },
    'zip-confirm': {
      ru: { what: 'Подтверждение застёжкой-молнией. Зубцы за бегунком сцеплены, впереди открыты веером, и каждый зубец на своей пружине, поэтому они схлопываются волной вслед за бегунком. Дотянули до конца, и заказ оформлен, не дотянули, и молния расстёгивается обратно.', how: 'Играет само. Потяните бегунок вправо. С клавиатуры: стрелки, Home и End.' },
      en: { what: 'A confirmation made of a zipper. The teeth behind the tab are interlocked and the ones ahead are fanned open, each tooth on its own spring, so they snap shut in a ripple behind the tab. Zip all the way and the order goes through; let go early and it unzips.', how: 'Plays by itself. Drag the tab to the right. Keys: arrows, Home and End.' },
      settings: [sp('p.follow', 'Бегунок за пальцем', 'Tab following', [900, 50]), sp('p.back', 'Возврат бегунка', 'Tab returning', [170, 16]), sp('p.teeth', 'Зубцы', 'Teeth', [560, 24])]
    },
    'slosh-level': {
      ru: { what: 'Стакан, поверхность воды в котором это ряд связанных пружин. Когда наливаете, середина прогибается, а волны бегут к стенкам и обратно. Тяните уровень вверх и вниз, а в стороны, чтобы расплескать. Отпустили, и уровень встаёт на ближайшие 250 мл.', how: 'Играет само. Нажмите «+ 250 мл» или потяните воду. Стрелки тоже работают.' },
      en: { what: 'A glass whose water surface is a row of coupled springs. Pouring dents the middle and the waves run to the walls and back. Drag up and down to set the level, sideways to slosh it. Let go and the level settles on the nearest 250 ml.', how: 'Plays by itself. Press + 250 ml or drag the water. The arrow keys work too.' },
      settings: [sp('p.level', 'Уровень воды', 'Water level', [120, 15]), sp('p.sway', 'Качание у стенок', 'Sway at the walls', [38, 2.1]), nm('p.spread', 'Скорость волны', 'Wave speed', 1400, 400, 3000, 50)]
    },
    'detent-dial': {
      ru: { what: 'Ручка с одиннадцатью щелчками на 270 градусах. Пока тянете, она идёт за пальцем, но её тянет к ближайшему делению, поэтому чувствуется щелчок. На каждом делении вспухает риска, ручку слегка толкает, а число прокручивается.', how: 'Играет само. Крутите ручку по кругу. Стрелки, PageUp, PageDown, Home и End тоже работают.' },
      en: { what: 'A knob with eleven notches over 270 degrees. While you drag, it follows the pointer but is pulled toward the nearest notch, so you feel it click. Each notch makes its tick swell, nudges the knob and rolls the number.', how: 'Plays by itself. Turn the knob around its centre. Arrows, PageUp, PageDown, Home and End work too.' },
      settings: [sp('p.knob', 'Поворот ручки', 'Knob turning', [520, 30])]
    },
    'ripple-field': {
      ru: { what: 'Сетка точек на настоящей волновой модели: каждая точка тянется к среднему своих соседей, поэтому касание разгоняет кольцо, кольца пересекаются и затухают. Точки растут, меняют цвет и отклоняются от склона волны, и поверхность читается как вода сверху.', how: 'Играет само. Коснитесь поля или проведите по нему пальцем.' },
      en: { what: 'A grid of dots on a real wave simulation: each dot is pulled toward the average of its neighbours, so a tap sends a ring outward, rings cross and fade. The dots grow, change colour and lean away from the slope of the wave, so the surface reads like water from above.', how: 'Plays by itself. Tap the field or drag a finger through it.' },
      settings: [nm('p.speed', 'Скорость волны', 'Wave speed', .34, .1, .48, .02), nm('p.damp', 'Затухание', 'Damping', .991, .97, .999, .001), nm('p.lens', 'Наклон точек', 'Dot lean', 7, 0, 14, 1, 'px'), nm('p.cell', 'Шаг сетки', 'Grid step', 16, 10, 28, 1, 'px')]
    },
    'voice-room': {
      ru: { what: 'Одни и те же лица в двух раскладках. Закрытая комната это плашка: четверо внахлёст и «+3». Нажали, и плашка вырастает в карточку, а каждое лицо по очереди перелетает на своё место в сетке, спрятанные выходят из «+3». Имена, заголовок и кнопка проявляются, когда лица уже ушли, а при закрытии гаснут сразу. У того, кто говорит, значок с живыми полосками. Если присоединиться, вы занимаете последнее место.', how: 'Играет само. Нажмите на плашку, потом «Join now». Закрывается крестиком или Esc.' },
      en: { what: 'The same faces in two layouts. Closed, the room is a pill: four overlapping faces and a +3. Tap it and the pill grows into a card while each face, one after another, flies to its seat in the grid; the hidden ones come out of the +3. Names, the header and the button fade in once the faces have left, and vanish at once on close. Whoever is talking wears a badge with live bars. Join and you take the last seat.', how: 'Plays by itself. Tap the pill, then Join now. Close with the cross or Esc.' },
      settings: [sp('p.morph', 'Перелёт лиц', 'Faces flying', [300, 26]), sp('p.box', 'Рост карточки', 'Card growing', [240, 26]), nm('p.stagger', 'Задержка между лицами', 'Delay between faces', .03, 0, .12, .005, 's')]
    },
    'flick-ruler': {
      ru: { what: 'Линейка веса с риской на каждые 100 граммов. Пока тянете, лента идёт за пальцем один в один. Бросили, и она сохраняет скорость, плавно тормозит и встаёт точно на десятую, без перелёта. Риски у стрелки вырастают, к краям гаснут, а за пределами шкалы лента тянется как резинка и возвращается.', how: 'Играет само. Смахните ленту в сторону. Стрелки двигают на 0,1, с Shift на целый килограмм, PageUp и PageDown на пять.' },
      en: { what: 'A weight ruler with a tick every 100 grams. While you drag, the tape follows your finger one to one. Throw it and it keeps your speed, slows down smoothly and lands exactly on a tenth, without overshooting. Ticks grow near the needle and fade toward the ends, and past either end of the scale the tape stretches like rubber and comes back.', how: 'Plays by itself. Flick the tape sideways. Arrows move it by 0.1, Shift by a whole kilo, PageUp and PageDown by five.' },
      settings: [sp('p.settle', 'Остановка ленты', 'Tape settling', [120, 22]), nm('p.gap', 'Шаг рисок', 'Tick spacing', 10, 6, 18, 1, 'px'), nm('p.fisheye', 'Рост у стрелки', 'Growth near the needle', .55, 0, 1.2, .05)]
    },
    'metronome-slide': {
      ru: { what: 'Регулятор темпа, который и есть маятник. Он качается с тем темпом, что показывает. Грузик выше, и ритм медленнее, ниже, и быстрее, как у настоящего метронома. На краю хода мигает лампа с той стороны. Грузик на пружине, а число идёт за ним.', how: 'Играет само. Двигайте грузик по стержню. Стрелки меняют темп, с Shift сразу на десять.' },
      en: { what: 'A tempo control that is an actual pendulum, swinging at the tempo it shows. Weight higher and the beat slows, lower and it quickens, as on a real metronome. At each end of the swing the lamp on that side blinks. The weight sits on a spring and the number follows it.', how: 'Plays by itself. Slide the weight along the rod. Arrow keys change the tempo, Shift makes it ten at a time.' },
      settings: [sp('p.weight', 'Грузик', 'Weight', [220, 22]), nm('p.swing', 'Размах', 'Swing', 24, 8, 40, 1, '°'), nm('p.slow', 'Самый медленный', 'Slowest tempo', 40, 30, 80, 1), nm('p.fast', 'Самый быстрый', 'Fastest tempo', 208, 120, 240, 1)]
    },
    'sign-pad': {
      ru: { what: 'Мне всегда казалось странным, что подпись в интерфейсах ставится в пустом сером прямоугольнике. Здесь кнопка сама раскрывается в место для подписи, а потом складывается обратно в доказательство: зелёная плашка с маленькой копией того, что вы нарисовали. Линия сглаживается через середины отрезков и становится тоньше, когда рука идёт быстрее, как у настоящей ручки. Пустую подпись отправить нельзя: карточка просто качнёт головой.', how: 'Играет само. Нажмите «Start signing», распишитесь и нажмите «Finish signing». Кнопка с карандашом возвращает к подписи, стрелка сверху очищает поле.' },
      en: { what: 'It always felt odd to me that signing in an interface means drawing in a blank grey box. Here the button opens into a place to sign, then folds back into proof: a green pill with a tiny copy of what you drew. The line is smoothed through the midpoints and gets thinner the faster your hand moves, like a real pen. An empty signature cannot be sent: the card just shakes its head.', how: 'Plays by itself. Press Start signing, sign, then Finish signing. The pencil button takes you back, the arrow at the top clears the pad.' },
      settings: [sp('p.box', 'Раскрытие карточки', 'Card opening', [260, 24]), nm('p.ink', 'Толщина линии', 'Line weight', 3.2, 1.5, 6, .1, 'px')]
    },
    'voice-memo': {
      ru: { what: 'Диктофон, у которого лента едет под красной считывающей головкой. Каждые несколько пикселей записанного времени на ленте появляется столбик и вырастает с лёгким перелётом. Пунктир тоже принадлежит ленте и едет вместе с ней. Свежий столбик рождается красным и остывает до белого, пока отъезжает от головки. Пауза просто останавливает ленту, а таймер в это время медленно дышит. Голос выдуман: слоги случайной длины с мягкой огибающей и короткие паузы между ними. Одна большая кнопка «Record» при старте делится на «Стоп» и «Паузу», а после сохранения они снова сливаются.', how: 'Играет само. Нажмите «Record», потом паузу или квадрат, чтобы сохранить.' },
      en: { what: 'A recorder whose tape runs under a red playhead. Every few pixels of recorded time a bar is stamped on the tape and grows in with a small overshoot. The dotted track belongs to the tape as well and slides with it. A fresh bar is born red and cools to white as it moves away from the head. Pausing simply stops the tape, and the clock breathes slowly while it waits. The voice is made up: syllables of random length with a soft envelope and short silences between them. One big Record button splits into Stop and Pause when you start, and they join back once the memo is saved.', how: 'Plays by itself. Press Record, then pause, or the square to save.' },
      settings: [nm('p.speed', 'Скорость ленты', 'Tape speed', 42, 20, 80, 1, 'px/s'), sp('p.split', 'Деление кнопки', 'Button split', [320, 24])]
    },
    'fm-tuner': {
      ru: { what: 'Карманное радио с маленьким слушателем. Шкалу можно бросить: она докатывается и встаёт на станцию, если та рядом, или на ближайшую десятую. Сила сигнала зависит от того, насколько стрелка близко к станции. Пока станции нет, экран шумит, а человечек растерянно оглядывается. Поймали, и он кивает в темп этой станции, а из наушников вылетают ноты. Сам он нарисован 16×16 пикселей и перерисовывается каждый кадр.', how: 'Играет само. Тяните шкалу, или жмите кнопки по краям, чтобы прыгнуть к соседней станции. Стрелки двигают на 0,1, PageUp и PageDown прыгают по станциям.' },
      en: { what: 'A pocket radio with a tiny listener. The scale can be thrown: it coasts and lands on a station if one is close, otherwise on the nearest tenth. Signal strength is how close the needle is to a station. Without one the screen fills with static and the little guy looks around, lost. Catch one and he nods to its tempo while notes float off his headphones. He is drawn at 16 by 16 pixels and redrawn every frame.', how: 'Plays by itself. Drag the scale, or use the side buttons to jump to the next station. Arrows move by 0.1, PageUp and PageDown jump between stations.' },
      settings: [sp('p.settle', 'Остановка шкалы', 'Scale settling', [120, 22]), sp('p.sweep', 'Переход между станциями', 'Station sweep', [70, 16]), nm('p.gap', 'Шаг рисок', 'Tick spacing', 9, 6, 16, 1, 'px')]
    },
    'goo-split': {
      ru: { what: 'Хотелось, чтобы новая штука в интерфейсе не появлялась из ниоткуда, а рождалась из того, что уже есть. Панель и пузырь это две обычные фигуры под одним фильтром: их размывают вместе и резко обрезают по прозрачности. Пока они рядом, размытие одной добавляется к другой, и получается одно жидкое тело с перешейком. Включили, и пузырь вытягивается из конца панели, перешеек тянется, тонеет и рвётся, а панель отъезжает, чтобы пара осталась по центру. Выключили, и пузырь втягивается обратно.', how: 'Играет само. Нажимайте «On» и «Off». Кнопки на панели тоже нажимаются.' },
      en: { what: 'I wanted something new in an interface to be born out of what is already there instead of appearing from nowhere. The toolbar and the bubble are two plain shapes under one filter: they are blurred together and then cut sharply by alpha. While they are close, the blur of one adds to the other, so they read as one liquid body with a neck. Switch it on and the bubble pulls out of the toolbar\u2019s end, the neck stretches, thins and snaps, and the toolbar slides over to keep the pair centred. Switch it off and the bubble is swallowed again.', how: 'Plays by itself. Press On and Off. The toolbar buttons press too.' },
      settings: [sp('p.split', 'Отрыв пузыря', 'Bubble split', [150, 13]), sp('p.slide', 'Сдвиг панели', 'Toolbar slide', [170, 20])]
    },
    'shape-filters': {
      ru: { what: 'Мармеладные кнопки, у которых форма стала состоянием. Пока кнопку не трогают, она круг. Зажали, и углы стягиваются в плотный скруглённый квадрат, будто её сжали пальцами. Выбрали, и она остаётся квадратной, но мягче, чтобы выбранное читалось даже без цвета. Углами управляет отдельная пружина с небольшим перелётом, поэтому форма чуть проскакивает и садится. Кнопка с фильтром ведёт себя так же: пилюля, пока ничего не выбрано, и прямоугольник со скруглением, когда выбрано. Счётчик на ней ставится по текущему радиусу угла, ровно на дугу.', how: 'Играет само. Зажимайте и отпускайте кружки, затем нажмите Filter.' },
      en: { what: 'Gummy buttons where shape is a state. Untouched, a button is a circle. Hold it and the corners pull into a tight rounded square, as if pinched. Choose it and it stays square, only softer, so the choice reads even without colour. The corners run on their own spring with a little overshoot, so the shape skips past and settles. The Filter button does the same: a pill while nothing is chosen, a rounded rectangle once something is. Its counter is placed from the live corner radius, right on the arc.', how: 'Plays by itself. Hold and release the circles, then press Filter.' },
      settings: [sp('p.shape', 'Пружина формы', 'Shape spring', [300, 18]), sp('p.wobble', 'Покачивание', 'Wobble', [420, 9])]
    },
    'distortion-wave': {
      ru: { what: 'Цветная волна уносит один экран в другой: карточка тянется к кнопке, волна выходит из точки нажатия, кренится в её сторону и оставляет цвет на краях. Кнопка в overlay, поэтому не гнётся. Повторное нажатие сворачивает волну обратно.', how: 'Играет само. Нажмите Confirm. Undo возвращает первый экран.' },
      en: { what: 'A colour wave carries one screen into the next: the card pulls toward the button, the wave leaves from the press and leans that way, and the colour stays on the edges. The button sits in the overlay, so it stays sharp. Press again and the wave collapses back into it.', how: 'Plays by itself. Press Confirm. Undo brings the first screen back.' },
      settings: [nm('p.amp', 'Высота волны', 'Wave height', 1, .2, 2, .05), nm('p.travel', 'Длительность', 'Travel', .95, .4, 2.2, .05, 's'), nm('p.lean', 'Крен к нажатию', 'Lean toward the press', .85, 0, 1.5, .05)]
    },
    'thinking-orbs': {
      ru: { what: 'Четыре состояния орба в одной карточке: Searching, Thinking, Solving и Listening. Каждый орб рисуется на canvas, это не спиннер.', how: 'Играет само, когда карточка на экране.' },
      en: { what: 'Four orb states in one card: Searching, Thinking, Solving and Listening. Each orb is drawn on a canvas, not a spinner.', how: 'Plays by itself while the card is on screen.' },
      settings: []
    }
  };

  // ---------------------------------------------------------------- helpers
  var V = (function () { var c = document.currentScript, m = c && c.src.match(/[?&]v=(\d+)/); return m ? m[1] : ''; })();
  var withV = function (u) { return V ? u + (u.indexOf('?') < 0 ? '?' : '&') + 'v=' + V : u; };
  var cells = [].slice.call(document.querySelectorAll('.lab-cell'));
  var slugOf = function (cell) { return cell.querySelector('iframe').dataset.base.split('/').pop().replace('.html', ''); };
  var el = function (tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  var modal = null;

  // ---------------------------------------------------------------- mounting and playing
  var MAX = innerWidth > 1100 ? 6 : 4;       // how many studies may play at once
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ratios = new Map(), hovered = null, queued = false;

  function frameOf(cell) { return cell.querySelector('iframe'); }
  function post(cell, msg) { try { frameOf(cell).contentWindow.postMessage(msg, '*'); } catch (e) {} }
  function mount(cell) {
    var f = frameOf(cell);
    if (f.dataset.mounted === '1') return;
    f.dataset.mounted = '1'; f.dataset.booted = '';
    f.src = withV(f.dataset.base + '?still=1');
  }
  function unmount(cell) {
    var f = frameOf(cell);
    if (f.dataset.mounted !== '1') return;
    f.dataset.mounted = ''; f.dataset.booted = ''; cell._on = false;
    f.src = 'about:blank';
  }
  function apply() {
    queued = false;
    var mid = innerHeight / 2;
    var want = [];
    if (!modal && !document.hidden) {
      want = cells.filter(function (c) { return c === hovered || (!reduce && (ratios.get(c) || 0) >= 0.5); });
      want.sort(function (a, b) {
        if (a === hovered) return -1;
        if (b === hovered) return 1;
        var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        return Math.abs(ra.top + ra.height / 2 - mid) - Math.abs(rb.top + rb.height / 2 - mid);
      });
      want = want.slice(0, MAX);
    }
    cells.forEach(function (c) {
      var f = frameOf(c), on = want.indexOf(c) > -1;
      if (f.dataset.booted !== '1' || c._on === on) return;
      c._on = on;
      post(c, on ? 'lab:play' : 'lab:stop');
    });
  }
  function later() { if (!queued) { queued = true; requestAnimationFrame(apply); } }

  var near = new IntersectionObserver(function (es) {
    es.forEach(function (e) { var c = e.target.closest('.lab-cell'); if (e.isIntersecting) mount(c); });
  }, { rootMargin: '50% 0px' });
  var far = new IntersectionObserver(function (es) {
    es.forEach(function (e) { var c = e.target.closest('.lab-cell'); if (!e.isIntersecting) unmount(c); });
  }, { rootMargin: '70% 0px' });
  var seen = new IntersectionObserver(function (es) {
    es.forEach(function (e) { ratios.set(e.target.closest('.lab-cell'), e.isIntersecting ? e.intersectionRatio : 0); });
    later();
  }, { threshold: [0, 0.25, 0.5, 0.75, 1] });

  cells.forEach(function (cell) {
    var f = frameOf(cell);
    f.dataset.base = f.getAttribute('src').split('?')[0];
    f.dataset.mounted = f.getAttribute('src') !== 'about:blank' ? '1' : '';
    var stage = cell.querySelector('.lab-stage');
    near.observe(stage); far.observe(stage); seen.observe(stage);
    f.addEventListener('load', function () {
      if (f.getAttribute('src') === 'about:blank') return;
      f.dataset.booted = '1'; cell._on = false; later();
    });
    cell.addEventListener('pointerenter', function () { hovered = cell; later(); });
    cell.addEventListener('pointerleave', function () { if (hovered === cell) hovered = null; later(); });
    var open = function (e) { e.preventDefault(); openModal(cell); };
    var b = cell.querySelector('.lab-open'); if (b) b.addEventListener('click', open);
    var n = cell.querySelector('.lab-name'); if (n) n.addEventListener('click', open);
  });
  addEventListener('scroll', later, { passive: true });
  document.addEventListener('visibilitychange', later);

  // ---------------------------------------------------------------- the viewer
  var lastFocus = null;
  var ICON_X = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  function openModal(cell) {
    if (modal) return;
    var slug = slugOf(cell), info = INFO[slug];
    if (!info) return;
    lastFocus = document.activeElement;
    var title = (LANG === 'ru' ? 'Эксперимент ' : 'Experiment ') + (cell.querySelector('.lab-name') ? cell.querySelector('.lab-name').textContent : slug);
    var values = {};                         // key -> current value (number, or [k, c] for springs)
    info.settings.forEach(function (s) { values[s.key] = s.def.slice ? s.def.slice() : s.def; });

    var root = el('div', 'lab-modal');
    root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'lm-title');

    // left: the study, as large as the screen allows, centered by the study itself
    var stage = el('div', 'lm-stage');
    var frame = document.createElement('iframe'); frame.title = title;
    stage.appendChild(frame);

    // right: everything about it
    var panel = el('aside', 'lm-panel');
    var head = el('header', 'lm-head');
    var h = el('h2'); h.id = 'lm-title'; h.textContent = title;
    var close = el('button', 'lm-close', ICON_X); close.type = 'button'; close.setAttribute('aria-label', T.close);
    head.appendChild(h); head.appendChild(close);

    var body = el('div', 'lm-body');
    var what = el('section', 'lm-sec'); what.appendChild(el('h3', '', T.what)); what.appendChild(el('p', '', info[LANG].what));
    var how = el('section', 'lm-sec'); how.appendChild(el('h3', '', T.how)); how.appendChild(el('p', '', info[LANG].how));
    var set = el('section', 'lm-sec lm-set');
    var sh = el('div', 'lm-set-head'); sh.appendChild(el('h3', '', T.set));
    var reset = el('button', 'lm-reset', T.reset); reset.type = 'button'; reset.hidden = true; sh.appendChild(reset);
    set.appendChild(sh); set.appendChild(el('p', 'lm-tip', T.tip));
    var list = el('div', 'lm-controls'); set.appendChild(list);
    body.appendChild(what); body.appendChild(how); body.appendChild(set);
    panel.appendChild(head); panel.appendChild(body);

    root.appendChild(stage); root.appendChild(panel);

    // the study was drawn for a card-sized box: grow it to fill the stage, never below 1:1
    function fit() {
      var w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
      var s = Math.max(1, Math.min(1.6, w / 520, h / 480));
      frame.style.width = (w / s) + 'px'; frame.style.height = (h / s) + 'px';
      frame.style.transform = s === 1 ? '' : 'scale(' + s + ')';
    }
    var ro = new ResizeObserver(fit);

    var timer = null;
    function url() {
      var q = new URLSearchParams();
      info.settings.forEach(function (s) {
        var v = values[s.key], d = s.def, same = s.type === 'spring' ? (v[0] === d[0] && v[1] === d[1]) : v === d;
        if (!same) q.set(s.key, s.type === 'spring' ? v[0] + ' ' + v[1] : String(v));
      });
      var str = q.toString();
      reset.hidden = !str;
      return withV('/ui-lab/' + slug + '.html' + (str ? '?' + str : ''));
    }
    function reload() { frame.src = url(); }
    function later2() { clearTimeout(timer); timer = setTimeout(reload, 280); }

    var inputs = [];
    info.settings.forEach(function (s) {
      var row = el('section', 'lm-row');
      var t = el('h4'); t.textContent = s.label[LANG]; row.appendChild(t);
      function slider(label, min, max, step, get, put) {
        var wrap = el('label', 'lm-s');
        var cap = el('span', 'lm-cap'); cap.textContent = label;
        var out = el('output', 'lm-out');
        var r = document.createElement('input'); r.type = 'range'; r.min = min; r.max = max; r.step = step;
        r.setAttribute('aria-label', label ? s.label[LANG] + ', ' + label : s.label[LANG]);
        var sync = function () { r.value = get(); out.textContent = get() + (s.unit ? ' ' + s.unit : ''); r.style.setProperty('--fill', ((get() - min) / (max - min) * 100) + '%'); };
        r.addEventListener('input', function () { put(+r.value); sync(); later2(); });
        wrap.appendChild(cap); wrap.appendChild(out); wrap.appendChild(r); row.appendChild(wrap);
        sync(); inputs.push(sync);
      }
      if (s.type === 'spring') {
        slider(T.stiff, 40, 1200, 10, function () { return values[s.key][0]; }, function (v) { values[s.key][0] = v; });
        slider(T.damp, 4, 60, 1, function () { return values[s.key][1]; }, function (v) { values[s.key][1] = v; });
      } else {
        slider('', s.min, s.max, s.step, function () { return values[s.key]; }, function (v) { values[s.key] = v; });
        row.classList.add('lm-row-one');
      }
      list.appendChild(row);
    });
    reset.addEventListener('click', function () {
      info.settings.forEach(function (s) { values[s.key] = s.def.slice ? s.def.slice() : s.def; });
      inputs.forEach(function (f) { f(); });
      clearTimeout(timer); reload();
    });

    function shut() {
      clearTimeout(timer); ro.disconnect();
      document.removeEventListener('keydown', onKey, true);
      document.documentElement.classList.remove('lab-modal-open');
      root.remove(); modal = null;
      later();
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); shut(); return; }
      if (e.key !== 'Tab') return;
      var f = [].slice.call(root.querySelectorAll('button:not([hidden]), a[href], input')).filter(function (n) { return n.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    close.addEventListener('click', shut);
    document.addEventListener('keydown', onKey, true);
    // once you click inside the study the keyboard focus lives in the iframe: pass Escape up
    frame.addEventListener('load', function () {
      try { frame.contentWindow.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); shut(); } }); } catch (err) {}
    });

    modal = root;
    document.documentElement.classList.add('lab-modal-open');
    document.body.appendChild(root);
    ro.observe(stage);
    reload();
    apply();                       // the cards behind go quiet
    close.focus({ preventScroll: true });
  }
})();
