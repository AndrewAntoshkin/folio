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
          tip: 'Жёсткость задаёт скорость отклика, затухание: как долго пружина качается. После изменения пример перезапускается.' },
    en: { open: 'Open', close: 'Close', what: 'What it is', how: 'How to use it', set: 'Settings', reset: 'Reset',
          stiff: 'stiffness', damp: 'damping',
          tip: 'Stiffness sets how fast it responds, damping sets how long it wobbles. The study restarts after a change.' }
  }[LANG];

  var sp = function (key, ru, en, def) { return { type: 'spring', key: key, label: { ru: ru, en: en }, def: def }; };
  var nm = function (key, ru, en, def, min, max, step, unit) { return { type: 'num', key: key, label: { ru: ru, en: en }, def: def, min: min, max: max, step: step, unit: unit || '' }; };

  var INFO = {
    'focus-mode': {
      ru: { what: 'Фокус-режим. Уведомления приходят по одному, переключатель собирает их в стопку под панелью и показывает счётчик. Если выключить, они раскрываются обратно.', how: 'Играет само. Переключатель можно нажать самому.' },
      en: { what: 'A focus mode. Notifications arrive one by one, and the switch collapses them into a stack under the bar with a count. Switch it off and they spread out again.', how: 'Plays by itself. Flip the switch yourself.' },
      settings: [sp('t.--spring-soft', 'Перестроение карточек', 'Cards settling', [260, 24]), sp('t.--spring-pop', 'Всплеск счётчика', 'Counter pop', [520, 16]),
                 sp('t.--spring-fade', 'Появление и исчезание', 'Fade in and out', [420, 32]), sp('t.--spring-settle', 'Посадка переключателя', 'Switch settle', [280, 22])]
    },
    'plan-switch': {
      ru: { what: 'Карточка тарифа. Переключатель «месяц / год» двигает подсветку, цена прокручивается, снизу появляется строка с бонусом. Кнопка сжимается в круг со спиннером и возвращается уже зелёной.', how: 'Играет само. Нажмите на переключатель или на кнопку.' },
      en: { what: 'A pricing card. The monthly / yearly switch moves the highlight, the price rolls over and a bonus row opens below. The button shrinks to a circle with a spinner and comes back green.', how: 'Plays by itself. Click the switch or the button.' },
      settings: [sp('t.--spring-lead', 'Ведущий край подсветки', 'Leading edge of the highlight', [620, 36]), sp('t.--spring-trail', 'Отстающий край', 'Trailing edge', [190, 19]),
                 sp('t.--spring-pop', 'Всплеск галочки и плашки', 'Check and chip pop', [520, 16]), sp('t.--spring-soft', 'Раскрытие строки и кнопки', 'Row and button resize', [260, 24])]
    },
    'pull-cord': {
      ru: { what: 'Торшер со шнуром. Если потянуть за бусину, шнур растягивается, а торшер качается. После щелчка свет включается кругом от лампочки и заливает комнату.', how: 'Потяните за бусину или просто нажмите на неё.' },
      en: { what: 'A floor lamp with a pull cord. Pull the bead and the cord stretches while the lamp sways. After the click the light spreads from the bulb across the room.', how: 'Pull the bead, or just tap it.' },
      settings: [nm('p.gravity', 'Тяжесть шнура', 'Cord weight', 2600, 800, 4000, 100), nm('p.click', 'Растяжение для щелчка', 'Stretch that clicks', 22, 8, 50, 1, 'px'), nm('p.max', 'Предел растяжения', 'Most it gives', 54, 30, 100, 1, 'px')]
    },
    'morph-tooltip': {
      ru: { what: 'Одна подсказка на всю панель. Она переезжает от иконки к иконке и меняет ширину под новую надпись.', how: 'Наведите курсор на иконки. Нажатие выбирает инструмент.' },
      en: { what: 'One tooltip for the whole bar. It moves from icon to icon and resizes to fit the new label.', how: 'Hover the icons. A click picks the tool.' },
      settings: [sp('p.lead', 'Передний край', 'Leading edge', [620, 36]), sp('p.trail', 'Задний край', 'Trailing edge', [190, 19]), nm('p.walk', 'Шаг демо', 'Demo step', 1.05, .4, 3, .05, 's')]
    },
    'morph-island': {
      ru: { what: 'Чёрная пилюля меняет форму под состояние: пусто, таймер, экспорт, запрос на подтверждение. Ширина и высота на разных пружинах, поэтому сначала она расширяется, а потом оседает по высоте.', how: 'Играет сама. Кнопки снизу и сама пилюля переключают состояния.' },
      en: { what: 'A black pill that changes shape with its state: idle, timer, export, confirmation. Width and height run on separate springs, so it widens first and then settles in height.', how: 'Plays by itself. The buttons below, and the pill itself, switch states.' },
      settings: [sp('t.--island-w', 'Ширина', 'Width', [380, 24]), sp('t.--island-h', 'Высота', 'Height', [300, 22]), nm('t.--island-radius', 'Скругление', 'Corner radius', 32, 12, 40, 1, 'px'), nm('t.--island-cycle-ms', 'Шаг истории', 'Story step', 2800, 1200, 5000, 100, 'ms')]
    },
    'goo-menu': {
      ru: { what: 'Плюс, из которого выходят пузыри с действиями. Пока они рядом, фильтр SVG склеивает их, потом они отрываются как капли. Выбор действия сворачивает всё в уведомление.', how: 'Нажмите на плюс, потом на пузырь. Пузыри можно оттянуть и отпустить.' },
      en: { what: 'A plus button that releases bubbles with actions. An SVG filter merges them while they are close, then they separate like drops. Choosing an action folds everything into a notification.', how: 'Tap the plus, then a bubble. You can pull a bubble and let it go.' },
      settings: [sp('t.--goo-out', 'Вылет пузырей', 'Bubbles flying out', [230, 15]), sp('t.--goo-in', 'Возврат', 'Bubbles returning', [520, 34]), sp('t.--goo-release', 'Отскок после оттяжки', 'Snap back after a pull', [300, 12]),
                 sp('t.--goo-toast', 'Превращение в плашку', 'Morph into the toast', [260, 17]), nm('t.--goo-radius', 'Расстояние пузырей', 'Bubble distance', 112, 70, 150, 1, 'px'),
                 nm('t.--goo-stagger', 'Задержка между пузырями', 'Delay between bubbles', 45, 0, 120, 5, 'ms'), nm('t.--goo-toast-ms', 'Плашка висит', 'Toast stays', 2600, 1000, 5000, 100, 'ms'), nm('t.--goo-blur', 'Сила слияния', 'Goo strength', 10, 4, 16, 1)]
    },
    'jelly-slider': {
      ru: { what: 'Ползунок идёт за курсором с задержкой и растягивается, если двигать быстро. Над бегунком появляется капля со значением. У краёв шкалы бегунок упирается и отскакивает.', how: 'Тяните бегунок. Стрелки на клавиатуре тоже работают.' },
      en: { what: 'A slider that follows the pointer with a delay and stretches when you move fast. A drop with the value rises above the thumb. At the ends of the scale the thumb pushes against the limit and snaps back.', how: 'Drag the thumb. The arrow keys work too.' },
      settings: [sp('t.--slider-follow', 'Бегунок за курсором', 'Thumb following', [900, 50]), sp('t.--slider-bubble', 'Капля со значением', 'Value drop', [420, 22]), sp('t.--slider-release', 'Отскок от края', 'Snap back from the end', [300, 14]), nm('t.--slider-blur', 'Сила слияния', 'Goo strength', 8, 3, 14, 1)]
    },
    'hold-button': {
      ru: { what: 'Удаление, которое нельзя нажать случайно: кнопку нужно держать. Слева заливается красный, крышка корзины приоткрывается. Отпустите раньше, и заливка откатится, а кнопка мотнёт головой. Дожмёте, и она станет красным кругом с галочкой.', how: 'Нажмите на кнопку и держите.' },
      en: { what: 'A delete button you have to hold. Red fills in from the left and the lid of the bin lifts. Release early and the fill rolls back and the button shakes. Hold to the end and it becomes a red circle with a check.', how: 'Press the button and hold.' },
      settings: [nm('t.--hold-ms', 'Сколько держать', 'How long to hold', 1200, 500, 3000, 100, 'ms'), sp('t.--hold-release', 'Отскок заливки', 'Fill spring-back', [260, 14]), sp('t.--hold-morph', 'Превращение в круг', 'Morph into the circle', [320, 20]), nm('t.--hold-done-ms', 'Галочка висит', 'Check stays', 1700, 800, 4000, 100, 'ms')]
    },
    'swipe-deck': {
      ru: { what: 'Стопка карточек. Верхняя идёт за пальцем и наклоняется вокруг точки, за которую её взяли, нижние поднимаются. Если бросить далеко или быстро, карточка улетает в конец стопки.', how: 'Смахните карточку влево или вправо. Стрелки ← и → тоже работают.' },
      en: { what: 'A stack of cards. The top card follows your finger and tilts around the point you grabbed, and the cards below rise. Throw it far or fast enough and it goes to the back of the stack.', how: 'Swipe the card left or right. The ← and → keys work too.' },
      settings: [sp('t.--deck-drag', 'Карточка за курсором', 'Card following', [900, 50]), sp('t.--deck-return', 'Возврат на место', 'Return to the stack', [280, 16]), nm('t.--deck-threshold', 'Порог решения', 'Decision threshold', 110, 40, 200, 5, 'px')]
    },
    'rubber-dock': {
      ru: { what: 'Нижняя панель вкладок. Подсветка тянется между вкладками: передний край быстрый, задний отстаёт. Нажатие на активную вкладку раскрывает панель в карточку.', how: 'Нажмите на вкладку или перетащите подсветку. Повторное нажатие раскрывает карточку.' },
      en: { what: 'A bottom tab bar. The highlight stretches between tabs, with a quick front edge and a slower back edge. Tapping the active tab opens the bar into a card.', how: 'Click a tab or drag the highlight. Tap the active tab again to open the card.' },
      settings: [sp('t.--dock-lead', 'Передний край', 'Leading edge', [640, 38]), sp('t.--dock-trail', 'Задний край', 'Trailing edge', [150, 16]), sp('t.--dock-open-w', 'Раскрытие: ширина', 'Opening: width', [340, 21]),
                 sp('t.--dock-open-h', 'Раскрытие: высота', 'Opening: height', [230, 21]), sp('t.--dock-close', 'Закрытие', 'Closing', [420, 30]), sp('t.--dock-pop', 'Всплеск иконки', 'Icon pop', [520, 16])]
    },
    'parallax-ticket': {
      ru: { what: 'Визитка из голографической фольги. Фольгу рисует шейдер: в покое она серебряная, под курсором переливается радугой. Карточка наклоняется за курсором, фольга и текст расходятся по глубине. Клик переворачивает её: спереди имя и роль, сзади коротко обо мне и местах работы.', how: 'Водите курсором. Нажмите, чтобы перевернуть.' },
      en: { what: 'A business card in holographic foil. The foil is drawn by a shader: silver at rest, rainbow under the pointer. The card tilts toward the pointer and the foil and text move apart in depth. A click flips it: name and role on the front, a short note about me and where I have worked on the back.', how: 'Move the pointer. Click to flip.' },
      settings: [nm('t.--ticket-tilt', 'Наклон', 'Tilt', 14, 0, 30, 1, '°'), nm('t.--ticket-depth', 'Глубина слоёв', 'Layer depth', 12, 0, 30, 1, 'px'), sp('t.--ticket-flip', 'Переворот', 'Flip', [170, 15]), sp('t.--ticket-heat', 'Разогрев фольги', 'Foil heat-up', [90, 15])]
    },
    'glass-lens': {
      ru: { what: 'Лупа над листом. Внутри три копии листа с разным увеличением, поэтому края искривляются. Лупа немного отстаёт от курсора, а при нажатии увеличивает сильнее.', how: 'Водите курсором. Нажмите и держите для большего увеличения.' },
      en: { what: 'A magnifying lens over a sheet. Inside are three copies of the sheet at different zoom levels, so the edges bend. The lens trails the pointer slightly and zooms further when pressed.', how: 'Move the pointer. Press and hold to zoom in more.' },
      settings: [sp('t.--lens-follow', 'Погоня за курсором', 'Chasing the pointer', [180, 17]), nm('t.--lens-zoom', 'Увеличение', 'Zoom', 1.7, 1.1, 3, .1, '×'), nm('t.--lens-zoom-press', 'Увеличение при нажатии', 'Zoom when pressed', 2.4, 1.2, 4, .1, '×'), nm('t.--lens-size', 'Размер', 'Size', 150, 90, 220, 5, 'px')]
    },
    'pull-refresh': {
      ru: { what: 'Список, который тянется вниз с сопротивлением. Из шапки вытягивается капля, за порогом она отрывается и становится спиннером. Потом сверху появляется новая строка.', how: 'Потяните список вниз. Клавиша R обновляет без жеста.' },
      en: { what: 'A list you pull down against resistance. A drop stretches out of the header, separates past the threshold and becomes the spinner. Then a new row appears at the top.', how: 'Pull the list down. The R key refreshes without the gesture.' },
      settings: [nm('t.--pull-threshold', 'Порог обновления', 'Refresh threshold', 88, 40, 150, 2, 'px'), sp('t.--pull-return', 'Возврат списка', 'List returning', [260, 18]), nm('t.--pull-hold-ms', 'Сколько крутится спиннер', 'How long it spins', 1300, 500, 3500, 100, 'ms')]
    },
    'word-roll': {
      ru: { what: 'Последнее слово фразы уезжает вверх по буквам, а следующее въезжает снизу. Ширина под слово меняется на пружине.', how: 'Играет само. Клик или Enter переключает слово.' },
      en: { what: 'The last word of a line rolls up letter by letter and the next one rolls in from below. The space for the word resizes on a spring.', how: 'Plays by itself. Click or Enter turns it now.' },
      settings: [nm('p.hold', 'Пауза на слове', 'Pause on a word', 2.4, .8, 5, .1, 's'), sp('p.letter', 'Буквы', 'Letters', [420, 26]), sp('p.width', 'Ширина места', 'Slot width', [320, 30])]
    },
    'weight-wave': {
      ru: { what: 'Толщина каждой буквы зависит от расстояния до курсора, поэтому по строке бежит волна жирности. Нужен вариативный шрифт с осью толщины.', how: 'Водите курсором вдоль строки.' },
      en: { what: 'The weight of each letter depends on its distance from the pointer, so a wave of bold runs along the line. It needs a variable font with a weight axis.', how: 'Move the pointer along the line.' },
      settings: [nm('p.light', 'Тонкое начертание', 'Light weight', 300, 100, 500, 10), nm('p.bold', 'Жирное начертание', 'Bold weight', 820, 500, 900, 10), nm('p.spread', 'Ширина волны', 'Width of the swell', .13, .05, .3, .01), sp('p.letter', 'Буквы', 'Letters', [260, 22]), sp('p.swell', 'Волна за курсором', 'Swell following', [150, 22])]
    },
    'goo-morph': {
      ru: { what: 'Одно слово перетекает в другое. Обе версии размываются в разные стороны, пороговый фильтр склеивает их в одну форму. Когда слово стоит на месте, края у него чёткие.', how: 'Играет само. Клик по слову переключает его.' },
      en: { what: 'One word turns into the next. Both versions blur in opposite directions and a threshold filter joins them into one shape. When the word is still, its edges are sharp.', how: 'Plays by itself. Click the word to melt now.' },
      settings: [nm('p.melt', 'Длительность перетекания', 'Melt time', 1.05, .4, 2.5, .05, 's'), nm('p.hold', 'Пауза на слове', 'Pause on a word', 1.6, .5, 4, .1, 's'), nm('p.blur', 'Сила размытия', 'Blur strength', 8, 2, 16, 1, 'px')]
    },
    'scramble-text': {
      ru: { what: 'Буквы мерцают случайными символами и по очереди встают на место слева направо. Моноширинный шрифт не даёт строке прыгать.', how: 'Играет само. Наведите курсор на строку, чтобы расшифровать заново.' },
      en: { what: 'Letters flicker through random characters and settle one by one from left to right. A monospace font keeps the line from jumping.', how: 'Plays by itself. Hover the line to decode again.' },
      settings: [nm('p.hold', 'Пауза на фразе', 'Pause on a phrase', 2.6, .8, 5, .1, 's'), nm('p.flicker', 'Скорость мерцания', 'Flicker interval', .055, .02, .15, .005, 's'), nm('p.step', 'Сдвиг между буквами', 'Delay between letters', .035, .01, .1, .005, 's')]
    },
    'magnetic-button': {
      ru: { what: 'Кнопка тянется к курсору, когда он рядом, а подпись тянется чуть дальше. Курсор ушёл, и они возвращаются на пружине. Пока курсора нет, его роль играет маленькая точка.', how: 'Подведите курсор к кнопке.' },
      en: { what: 'The button leans toward the pointer when it is near, and the label leans a bit further. When the pointer leaves they spring back. Until you bring your own pointer, a small dot plays that part.', how: 'Bring the pointer close to the button.' },
      settings: [nm('p.radius', 'Радиус притяжения', 'Pull radius', 130, 60, 240, 5, 'px'), nm('p.pull', 'Сила притяжения', 'Pull strength', .32, .05, .6, .01), sp('p.button', 'Кнопка', 'Button', [170, 13]), sp('p.label', 'Подпись', 'Label', [220, 15])]
    },
    'like-burst': {
      ru: { what: 'Звезда сжимается, заливается золотым и выбрасывает кольцо точек, а счётчик прибавляет единицу. Второй клик откатывает всё назад.', how: 'Нажмите на звезду.' },
      en: { what: 'The star squashes, fills with gold and throws out a ring of dots while the counter goes up by one. A second click undoes it.', how: 'Click the star.' },
      settings: [sp('p.pop', 'Всплеск звезды', 'Star pop', [520, 13]), sp('p.count', 'Счётчик', 'Counter', [260, 20]), nm('p.burst', 'Длина вспышки', 'Burst length', .55, .2, 1.2, .05, 's')]
    },
    'dynamic-menu': {
      ru: { what: 'Маленькая пилюля с двумя полосками. При открытии она растягивается в панель, полоски становятся крестиком, ссылки выезжают по очереди.', how: 'Нажмите на меню.' },
      en: { what: 'A small pill with two lines. On open it expands into a panel, the lines turn into a cross and the links slide in one by one.', how: 'Click the menu.' },
      settings: [sp('p.width', 'Ширина', 'Width', [320, 26]), sp('p.height', 'Высота', 'Height', [240, 22]), sp('p.toggle', 'Полоски в крестик', 'Lines into a cross', [380, 24]), nm('p.stagger', 'Задержка между ссылками', 'Delay between links', .05, 0, .2, .01, 's')]
    },
    'prompt-box': {
      ru: { what: 'Поле запроса с кнопкой отправки. Пока идёт ответ, стрелка превращается в квадрат «стоп», а над полем раскрывается строка состояния с меняющимися подписями.', how: 'Играет само. Напишите запрос и нажмите Enter или стрелку.' },
      en: { what: 'A prompt field with a send button. While a reply is running the arrow turns into a stop square, and a status row above the field cycles through captions.', how: 'Plays by itself. Type a prompt and press Enter or the arrow.' },
      settings: [sp('p.open', 'Раскрытие строки состояния', 'Status row opening', [260, 24]), sp('p.swap', 'Смена стрелки на стоп', 'Arrow to stop swap', [420, 26])]
    },
    'streaming-reply': {
      ru: { what: 'Вопрос, три точки ожидания и ответ, который появляется по словам: каждое проявляется из размытия и чуть поднимается. Пузыри вырастают на пружине.', how: 'Играет само. Нажмите, чтобы воспроизвести ответ заново.' },
      en: { what: 'A question, three waiting dots, then a reply that arrives word by word, each word coming out of a blur and rising slightly. The bubbles grow on a spring.', how: 'Plays by itself. Click to replay the reply.' },
      settings: [nm('p.rate', 'Слов в секунду', 'Words per second', 8, 2, 20, 1), sp('p.pop', 'Появление пузыря', 'Bubble pop', [420, 22]), sp('p.word', 'Появление слова', 'Word arrival', [300, 26])]
    },
    'ghost-suggestion': {
      ru: { what: 'Заметка сама предлагает продолжение: бледный текст появляется после последнего слова. Tab принимает его, Esc убирает.', how: 'Играет само. Нажмите Tab, чтобы принять подсказку, или Esc, чтобы убрать.' },
      en: { what: 'A note that suggests how to continue: pale text appears after the last word. Tab accepts it, Esc dismisses it.', how: 'Plays by itself. Press Tab to accept the suggestion or Esc to dismiss it.' },
      settings: [sp('p.ghost', 'Появление подсказки', 'Suggestion fade-in', [260, 26]), sp('p.accept', 'Принятие', 'Accepting', [420, 22])]
    },
    'command-palette': {
      ru: { what: 'Строка поиска раскрывается в палитру команд. Выделение переезжает между строками: передний край быстрый, задний отстаёт. При закрытии палитра сжимается обратно в строку.', how: 'Нажмите на строку или ⌘K (Ctrl+K). Стрелки двигают выделение, Enter запускает, Esc закрывает.' },
      en: { what: 'A search bar that opens into a command palette. The highlight moves between rows with a quick front edge and a lagging back edge. On close the palette shrinks back to the bar.', how: 'Click the bar or press ⌘K (Ctrl+K). Arrows move the highlight, Enter runs, Esc closes.' },
      settings: [sp('p.open', 'Раскрытие палитры', 'Palette opening', [300, 24]), sp('p.hl-lead', 'Передний край выделения', 'Leading edge of the highlight', [620, 36]), sp('p.hl-trail', 'Задний край', 'Trailing edge', [190, 19])]
    },
    'otp-code': {
      ru: { what: 'Шесть ячеек поверх одного настоящего поля ввода. Каждая цифра появляется с небольшим всплеском. Верный код красит ячейки в зелёный, неверный встряхивает ряд.', how: 'Играет само. Введите шесть цифр. Верный код в демо: 482916.' },
      en: { what: 'Six boxes over a single real input. Each digit lands with a small pop. A correct code turns the boxes green, a wrong one shakes the row.', how: 'Plays by itself. Type six digits. The demo\u2019s correct code is 482916.' },
      settings: [sp('p.pop', 'Всплеск цифры', 'Digit pop', [520, 15]), sp('p.shake', 'Встряска при ошибке', 'Error shake', [900, 14])]
    },
    'segmented-control': {
      ru: { what: 'Один бегунок под четырьмя сегментами. У него два края на разных пружинах: передний спешит, задний отстаёт, поэтому бегунок растягивается и садится. Число над подписью досчитывает до нового значения.', how: 'Нажмите на сегмент или двигайтесь стрелками.' },
      en: { what: 'One thumb under four segments. Its two edges run on different springs, the front one fast and the back one slow, so the thumb stretches and settles. The number counts up to the new value.', how: 'Click a segment or use the arrow keys.' },
      settings: [sp('p.lead', 'Ведущий край', 'Leading edge', [620, 36]), sp('p.trail', 'Задний край', 'Trailing edge', [190, 19]), sp('p.count', 'Счётчик', 'Counter', [150, 20])]
    },
    'step-progress': {
      ru: { what: 'Четыре шага на линии. Линия заполняется на пружине, пройденные шаги получают галочку, текущий немного увеличивается. На последнем шаге «Далее» превращается в «Сначала».', how: 'Играет само. Жмите «Далее» и «Назад» или переходите по кружкам.' },
      en: { what: 'Four steps on a line. The line fills on a spring, completed steps get a check and the current one swells slightly. On the last step Next becomes Start over.', how: 'Plays by itself. Use Next and Back or jump with the circles.' },
      settings: [sp('p.line', 'Заполнение линии', 'Line fill', [210, 24]), sp('p.pop', 'Всплеск галочки', 'Check pop', [520, 15])]
    },
    'stat-card': {
      ru: { what: 'Карточка с суммой, изменением и графиком. При смене периода двенадцать точек линии идут к новой высоте, каждая на своей пружине, а число досчитывает до нового значения.', how: 'Играет само. Переключайте период и ведите курсором по графику.' },
      en: { what: 'A card with a total, a change badge and a chart. When the range changes, the twelve points of the line move to their new heights, each on its own spring, and the number counts to its new value.', how: 'Plays by itself. Switch the range and move across the chart.' },
      settings: [sp('p.ripple', 'Движение точек', 'Point motion', [210, 17]), sp('p.count', 'Счётчик', 'Counter', [160, 20])]
    },
    'zip-confirm': {
      ru: { what: 'Подтверждение застёжкой-молнией. Зубцы за бегунком сцеплены, впереди раскрыты, и каждый на своей пружине, поэтому смыкаются волной. Дотянули до конца, и заказ оформлен. Отпустили раньше, и молния расстёгивается.', how: 'Играет само. Потяните бегунок вправо. С клавиатуры: стрелки, Home и End.' },
      en: { what: 'A confirmation built as a zipper. The teeth behind the tab are closed and those ahead are open, each on its own spring, so they close in a wave. Zip it all the way and the order goes through. Let go early and it opens again.', how: 'Plays by itself. Drag the tab to the right. Keys: arrows, Home and End.' },
      settings: [sp('p.follow', 'Бегунок за пальцем', 'Tab following', [900, 50]), sp('p.back', 'Возврат бегунка', 'Tab returning', [170, 16]), sp('p.teeth', 'Зубцы', 'Teeth', [560, 24])]
    },
    'slosh-level': {
      ru: { what: 'Стакан, где поверхность воды это ряд связанных пружин. Когда наливаете, середина прогибается, и волны бегут к стенкам и обратно. Уровень двигается вверх и вниз, а в стороны его можно расплескать. Отпустили, и он встаёт на ближайшие 250 мл.', how: 'Играет само. Нажмите «+ 250 мл» или потяните воду. Стрелки тоже работают.' },
      en: { what: 'A glass where the water surface is a row of connected springs. Pouring pushes the middle down and waves run to the walls and back. Drag up and down to set the level, sideways to slosh it. Let go and it settles on the nearest 250 ml.', how: 'Plays by itself. Press + 250 ml or drag the water. The arrow keys work too.' },
      settings: [sp('p.level', 'Уровень воды', 'Water level', [120, 15]), sp('p.sway', 'Качание у стенок', 'Sway at the walls', [38, 2.1]), nm('p.spread', 'Скорость волны', 'Wave speed', 1400, 400, 3000, 50)]
    },
    'detent-dial': {
      ru: { what: 'Ручка с одиннадцатью щелчками на 270 градусах. Она идёт за пальцем, но её тянет к ближайшему делению, поэтому щелчок чувствуется. На каждом делении риска вырастает, ручку слегка толкает, число прокручивается.', how: 'Играет само. Крутите ручку по кругу. Стрелки, PageUp, PageDown, Home и End тоже работают.' },
      en: { what: 'A knob with eleven notches over 270 degrees. It follows your finger but is pulled toward the nearest notch, so the click is noticeable. At each notch the tick swells, the knob gets a small nudge and the number rolls.', how: 'Plays by itself. Turn the knob around its centre. Arrows, PageUp, PageDown, Home and End work too.' },
      settings: [sp('p.knob', 'Поворот ручки', 'Knob turning', [520, 30])]
    },
    'ripple-field': {
      ru: { what: 'Сетка точек на простой модели волн: каждая точка стремится к среднему своих соседей, поэтому касание запускает кольцо, а кольца пересекаются и затухают. Точки меняют размер, цвет и наклон, и поле похоже на воду сверху.', how: 'Играет само. Коснитесь поля или проведите по нему пальцем.' },
      en: { what: 'A grid of dots on a simple wave model: each dot is pulled toward the average of its neighbours, so a tap sends out a ring, and rings cross and fade. The dots change size, colour and lean, which makes the field look like water from above.', how: 'Plays by itself. Tap the field or drag a finger through it.' },
      settings: [nm('p.speed', 'Скорость волны', 'Wave speed', .34, .1, .48, .02), nm('p.damp', 'Затухание', 'Damping', .991, .97, .999, .001), nm('p.lens', 'Наклон точек', 'Dot lean', 7, 0, 14, 1, 'px'), nm('p.cell', 'Шаг сетки', 'Grid step', 16, 10, 28, 1, 'px')]
    },
    'voice-room': {
      ru: { what: 'Одни и те же лица в двух раскладках. Закрытая комната это плашка: четыре лица внахлёст и «+3». Нажали, и плашка вырастает в карточку, лица по очереди переезжают на свои места в сетке, а скрытые выходят из «+3». Имена, заголовок и кнопка проявляются, когда лица уже на местах, а при закрытии пропадают сразу. У говорящего значок с полосками. Если присоединиться, вы займёте последнее место.', how: 'Играет само. Нажмите на плашку, потом «Join now». Закрывается крестиком или Esc.' },
      en: { what: 'The same faces in two layouts. Closed, the room is a pill with four overlapping faces and a +3. Tap it and the pill grows into a card, the faces move one by one to their seats in a grid, and the hidden ones come out of the +3. Names, header and button fade in once the faces are in place and disappear at once on close. Whoever is speaking gets a badge with moving bars. If you join, you take the last seat.', how: 'Plays by itself. Tap the pill, then Join now. Close with the cross or Esc.' },
      settings: [sp('p.morph', 'Перелёт лиц', 'Faces flying', [300, 26]), sp('p.box', 'Рост карточки', 'Card growing', [240, 26]), nm('p.stagger', 'Задержка между лицами', 'Delay between faces', .03, 0, .12, .005, 's')]
    },
    'flick-ruler': {
      ru: { what: 'Линейка веса с риской каждые 100 граммов. Пока тянете, лента идёт за пальцем. Бросили, и она сохраняет скорость, плавно тормозит и встаёт ровно на десятую. Риски у стрелки крупнее, к краям мельче. За краем шкалы лента тянется как резинка и возвращается.', how: 'Играет само. Смахните ленту в сторону. Стрелки двигают на 0,1, с Shift на целый килограмм, PageUp и PageDown на пять.' },
      en: { what: 'A weight ruler with a tick every 100 grams. While you drag, the tape follows your finger. Throw it and it keeps its speed, slows down smoothly and stops exactly on a tenth. Ticks are larger near the needle and smaller toward the edges. Past the end of the scale the tape stretches and comes back.', how: 'Plays by itself. Flick the tape sideways. Arrows move it by 0.1, Shift by a whole kilo, PageUp and PageDown by five.' },
      settings: [sp('p.settle', 'Остановка ленты', 'Tape settling', [120, 22]), nm('p.gap', 'Шаг рисок', 'Tick spacing', 10, 6, 18, 1, 'px'), nm('p.fisheye', 'Рост у стрелки', 'Growth near the needle', .55, 0, 1.2, .05)]
    },
    'metronome-slide': {
      ru: { what: 'Регулятор темпа в виде маятника. Он качается в том темпе, который показывает. Грузик выше, и темп медленнее, ниже, и быстрее, как у метронома. В конце хода загорается лампа с этой стороны. Грузик сидит на пружине, число идёт за ним.', how: 'Играет само. Двигайте грузик по стержню. Стрелки меняют темп, с Shift сразу на десять.' },
      en: { what: 'A tempo control shaped like a pendulum. It swings at the tempo it shows. A higher weight means a slower beat and a lower one a faster beat, as on a metronome. At the end of each swing the lamp on that side lights up. The weight sits on a spring and the number follows it.', how: 'Plays by itself. Slide the weight along the rod. Arrow keys change the tempo, Shift makes it ten at a time.' },
      settings: [sp('p.weight', 'Грузик', 'Weight', [220, 22]), nm('p.swing', 'Размах', 'Swing', 24, 8, 40, 1, '°'), nm('p.slow', 'Самый медленный', 'Slowest tempo', 40, 30, 80, 1), nm('p.fast', 'Самый быстрый', 'Fastest tempo', 208, 120, 240, 1)]
    },
    'sign-pad': {
      ru: { what: 'Кнопка раскрывается в поле для подписи, а потом складывается в зелёную плашку с маленькой копией того, что вы нарисовали. Линия сглаживается и становится тоньше, если рука идёт быстрее. Пустую подпись отправить нельзя, карточка качнётся.', how: 'Играет само. Нажмите «Start signing», распишитесь и нажмите «Finish signing». Кнопка с карандашом возвращает к подписи, стрелка сверху очищает поле.' },
      en: { what: 'The button opens into a signing area, then folds into a green pill with a small copy of what you drew. The line is smoothed and gets thinner when your hand moves faster. An empty signature cannot be sent, the card shakes instead.', how: 'Plays by itself. Press Start signing, sign, then Finish signing. The pencil button takes you back, the arrow at the top clears the pad.' },
      settings: [sp('p.box', 'Раскрытие карточки', 'Card opening', [260, 24]), nm('p.ink', 'Толщина линии', 'Line weight', 3.2, 1.5, 6, .1, 'px')]
    },
    'voice-memo': {
      ru: { what: 'Диктофон, у которого лента едет под красной головкой. Через каждые несколько пикселей записанного времени на ленте появляется столбик. Свежий столбик красный и по мере отъезда белеет. Пауза останавливает ленту, таймер при этом медленно мигает. Голос синтетический: слоги случайной длины и паузы между ними. Кнопка «Record» при старте делится на «Стоп» и «Паузу», после сохранения снова склеивается.', how: 'Играет само. Нажмите «Record», потом паузу или квадрат, чтобы сохранить.' },
      en: { what: 'A voice recorder where the tape runs under a red playhead. A bar is added to the tape every few pixels of recorded time. A new bar starts red and fades to white as it moves away. Pause stops the tape while the timer pulses slowly. The voice is synthetic: syllables of random length with short gaps. The Record button splits into Stop and Pause on start and joins back after saving.', how: 'Plays by itself. Press Record, then pause, or the square to save.' },
      settings: [nm('p.speed', 'Скорость ленты', 'Tape speed', 42, 20, 80, 1, 'px/s'), sp('p.split', 'Деление кнопки', 'Button split', [320, 24])]
    },
    'fm-tuner': {
      ru: { what: 'Карманное радио с маленьким слушателем. Шкалу можно бросить: она докатится и встанет на станцию, если та рядом, или на ближайшую десятую. Чем ближе стрелка к станции, тем сильнее сигнал. Без станции на экране шум, а человечек оглядывается. Поймали станцию, и он кивает в её темп, из наушников летят ноты. Рисунок 16×16 пикселей перерисовывается каждый кадр.', how: 'Играет само. Тяните шкалу, или жмите кнопки по краям, чтобы прыгнуть к соседней станции. Стрелки двигают на 0,1, PageUp и PageDown прыгают по станциям.' },
      en: { what: 'A pocket radio with a small listener. You can flick the scale: it coasts and stops on a station if one is near, or on the nearest tenth. The closer the needle is to a station, the stronger the signal. Without a station the screen shows static and the character looks around. Tune one in and he nods to its tempo while notes float from his headphones. The 16 by 16 pixel drawing is redrawn every frame.', how: 'Plays by itself. Drag the scale, or use the side buttons to jump to the next station. Arrows move by 0.1, PageUp and PageDown jump between stations.' },
      settings: [sp('p.settle', 'Остановка шкалы', 'Scale settling', [120, 22]), sp('p.sweep', 'Переход между станциями', 'Station sweep', [70, 16]), nm('p.gap', 'Шаг рисок', 'Tick spacing', 9, 6, 16, 1, 'px')]
    },
    'goo-split': {
      ru: { what: 'Панель и пузырь это две обычные фигуры под одним фильтром: их размывают вместе и обрезают по прозрачности. Пока они рядом, размытия складываются, и получается одна форма с перешейком. Включили, и пузырь вытягивается из конца панели, перешеек тонеет и рвётся, панель сдвигается, чтобы пара осталась по центру. Выключили, и пузырь втягивается обратно.', how: 'Играет само. Нажимайте «On» и «Off». Кнопки на панели тоже нажимаются.' },
      en: { what: 'The toolbar and the bubble are two plain shapes under one filter: they are blurred together and cut by alpha. While they are close the blurs add up and read as one shape with a neck. Switch it on and the bubble pulls out of the end of the toolbar, the neck thins and breaks, and the toolbar shifts so the pair stays centred. Switch it off and the bubble is drawn back in.', how: 'Plays by itself. Press On and Off. The toolbar buttons press too.' },
      settings: [sp('p.split', 'Отрыв пузыря', 'Bubble split', [150, 13]), sp('p.slide', 'Сдвиг панели', 'Toolbar slide', [170, 20])]
    },
    'shape-filters': {
      ru: { what: 'Кнопки, у которых форма показывает состояние. Без нажатия кнопка круглая. Зажали, и углы стягиваются в скруглённый квадрат. Выбрали, и она остаётся квадратной, но мягче, поэтому выбор виден даже без цвета. Углами управляет отдельная пружина с небольшим перелётом. Кнопка Filter работает так же: пилюля, пока ничего не выбрано, и скруглённый прямоугольник, когда выбрано. Счётчик на ней ставится по текущему радиусу угла.', how: 'Играет само. Зажимайте и отпускайте кружки, затем нажмите Filter.' },
      en: { what: 'Buttons where the shape shows the state. Untouched, a button is a circle. Hold it and the corners pull into a rounded square. Select it and it stays square but softer, so the choice is visible even without colour. The corners run on their own spring with a slight overshoot. The Filter button works the same way: a pill while nothing is chosen, a rounded rectangle once something is. Its counter is positioned from the current corner radius.', how: 'Plays by itself. Hold and release the circles, then press Filter.' },
      settings: [sp('p.shape', 'Пружина формы', 'Shape spring', [300, 18]), sp('p.wobble', 'Покачивание', 'Wobble', [420, 9])]
    },
    'distortion-wave': {
      ru: { what: 'Цветная волна меняет содержимое одной и той же карточки. Нажимаете Proceed to Payment: волна выходит из кнопки, наклоняется в её сторону, оставляет цвет по краям и на ходу превращает счёт в квитанцию: «Subtotal» становится «Total», скидка уходит, появляется карта и «Paid». Кнопка лежит в overlay и не искажается, она только меняет подпись и цвет. Undo payment сворачивает волну обратно.', how: 'Играет само. Нажмите Proceed to Payment.' },
      en: { what: 'A colour wave changes the contents of one and the same card. Press Proceed to Payment: the wave starts at the button, leans toward it, leaves colour at the edges and turns the bill into a receipt on its way: Subtotal becomes Total, the discount goes, the card and Paid appear. The button sits in the overlay, so it is not distorted; it only changes its label and colour. Undo payment collapses the wave.', how: 'Plays by itself. Press Proceed to Payment.' },
      settings: [nm('p.amp', 'Высота волны', 'Wave height', 1, .2, 2, .05), nm('p.travel', 'Длительность', 'Travel', .95, .4, 2.2, .05, 's'), nm('p.lean', 'Крен к нажатию', 'Lean toward the press', .85, 0, 1.5, .05)]
    },
    'thinking-orbs': {
      ru: { what: 'Четыре состояния орба в одной карточке: Searching, Thinking, Solving и Listening. Каждый орб рисуется на canvas.', how: 'Играет само, когда карточка на экране.' },
      en: { what: 'Four orb states in one card: Searching, Thinking, Solving and Listening. Each orb is drawn on a canvas.', how: 'Plays by itself while the card is on screen.' },
      settings: []
    },
    'reorder-list': {
      ru: { what: 'Список, строки которого можно переставлять. Взятая строка идёт за пальцем и чуть наклоняется, если вести её в сторону, а остальные расступаются, каждая на своей пружине. Отпущенная строка садится в свой слот с небольшим отскоком.', how: 'Играет само. Перетащите строку вверх или вниз. С клавиатуры: стрелки вверх и вниз на выбранной строке.' },
      en: { what: 'A list with rows you can reorder. The row you hold follows your finger and leans a little when you move it sideways, and the other rows make room, each on its own spring. When you let go it lands in its slot with a small overshoot.', how: 'Plays by itself. Drag a row up or down. With the keyboard: the up and down arrows on a focused row.' },
      settings: [sp('t.--reorder-follow', 'Строка за пальцем', 'Row following', [900, 50]), sp('t.--reorder-slide', 'Остальные строки', 'Other rows', [260, 24]), sp('t.--reorder-settle', 'Посадка строки', 'Row landing', [300, 20]), nm('t.--reorder-tilt', 'Наклон', 'Tilt', 3, 0, 8, .5, '°')]
    },
    'peel-sticker': {
      ru: { what: 'Наклейка, которую отклеивают за уголок. Угол, за который тянете, и его исходное место задают линию сгиба: по одну сторону остаётся лицевая часть, другая отражается поверх и показывает оборот. Если оттянуть достаточно далеко, наклейка отлетает и открывает код. Если отпустить раньше, угол возвращается на пружине.', how: 'Играет само. Потяните за уголок. Если наклейка отлетела, нажмите на карточку, и она вернётся. С клавиатуры: Enter.' },
      en: { what: 'A sticker you peel by its corner. The corner you hold and its starting place define the fold line: the front stays on one side and the other side is mirrored over it to show the back. Pull far enough and the sticker comes off and shows the code. Let go early and the corner springs back.', how: 'Plays by itself. Pull the corner. If the sticker came off, click the card to put it back. Keyboard: Enter.' },
      settings: [sp('t.--peel-follow', 'Угол за пальцем', 'Corner following', [520, 34]), sp('t.--peel-back', 'Возврат угла', 'Corner returning', [240, 15]), sp('t.--peel-away', 'Отлёт наклейки', 'Sticker leaving', [90, 17]), nm('t.--peel-threshold', 'Порог отрыва', 'Tear-off distance', .62, .3, .9, .02)]
    },
    'image-fx': {
      ru: { what: 'Квадратная картинка, которая «генерируется» на глазах. Пока изображения нет, шейдер на WebGL гоняет мозаику из пикселей, потом она растворяется и проявляет настоящую картинку, а через пару секунд картинка снова рассыпается. Три вида мозаики переключаются таблетками под квадратом: Organic, Mechanic и Sweep.', how: 'Играет само. Выберите вид внизу. Нажмите на квадрат: если картинка видна, она рассыпется и проявится новая, если нет, проявится сразу.' },
      en: { what: 'A square picture that appears to be generated in front of you. While there is no image, a WebGL shader churns a mosaic of pixels, then the mosaic dissolves into a real picture, and a few seconds later the picture breaks apart again. Three mosaic styles switch with the pills under the square: Organic, Mechanic and Sweep.', how: 'Plays by itself. Pick a style below. Tap the square: if a picture is showing it breaks up and a new one comes in, otherwise one comes in right away.' },
      settings: []
    },
    'cursor-trail': {
      ru: { what: 'Фотографии, которые остаются за курсором. Каждые несколько пикселей на месте указателя появляется карточка: она выскакивает, наклоняется по направлению движения и чуть сдвигается вперёд, а через пару секунд уходит. Старые исчезают первыми.', how: 'Играет само, пока по карточке водит призрачный курсор. Проведите указателем или пальцем по полю.' },
      en: { what: 'Photos that stay behind the cursor. Every few pixels a card is dropped where the pointer is: it pops in, leans the way you are moving and slides a little further along it, then leaves after a couple of seconds. The oldest ones go first.', how: 'Plays by itself while a ghost cursor walks across the card. Move your pointer or finger over the field.' },
      settings: [nm('p.spacing', 'Шаг между фото', 'Distance between photos', 68, 30, 160, 2, 'px'), nm('p.keep', 'Сколько держится', 'Photos on screen', 7, 3, 12, 1), nm('p.life', 'Время жизни', 'Lifetime', 1.7, .6, 4, .1, 's'), sp('t.--trail-pop', 'Появление', 'Pop in', [380, 20]), sp('t.--trail-exit', 'Уход', 'Leaving', [260, 30])]
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
