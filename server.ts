import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8612124409:AAETXqjPfeq3oWEwSFX3rarC3HQZ-D4kdpg';
const APP_URL = process.env.APP_URL || 'https://ais-dev-huqlabvztf7gbswjwdgurd-2013597706.europe-west1.run.app';

// In-memory data store for Telegram Bot subscribers and CRM
interface TgSubscriber {
  chatId: number;
  userId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  joinedAt: string;
  lastActive: string;
  interests: string[];
  ordersCount: number;
}

interface BotLog {
  id: string;
  timestamp: string;
  type: 'incoming_command' | 'incoming_link' | 'broadcast_sent' | 'notification_sent' | 'info';
  user: string;
  message: string;
}

interface CustomLeadRequest {
  id: string;
  chatId: number;
  username?: string;
  firstName: string;
  linkOrText: string;
  date: string;
  status: 'new' | 'processed' | 'quoted';
}

const subscribers: Map<number, TgSubscriber> = new Map([
  [
    741920194,
    {
      chatId: 741920194,
      userId: 741920194,
      username: 'ivan_moscow',
      firstName: 'Иван',
      lastName: 'Смирнов',
      joinedAt: '2026-10-01 10:15',
      lastActive: 'Сегодня',
      interests: ['Обувь', 'Зимняя одежда', '1688 премиум'],
      ordersCount: 2,
    },
  ],
  [
    892019481,
    {
      chatId: 892019481,
      userId: 892019481,
      username: 'mikhail_wear',
      firstName: 'Михаил',
      joinedAt: '2026-10-03 14:20',
      lastActive: 'Вчера',
      interests: ['Стритвир', 'Кроссовки', 'Худи 1688'],
      ordersCount: 1,
    },
  ],
  [
    629104819,
    {
      chatId: 629104819,
      userId: 629104819,
      username: 'daria_shop',
      firstName: 'Дарья',
      joinedAt: '2026-10-04 09:40',
      lastActive: '2 дня назад',
      interests: ['Кожаные сумки', 'Аксессуары'],
      ordersCount: 0,
    },
  ],
]);

const botLogs: BotLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-10-06 18:30:00',
    type: 'info',
    user: 'System',
    message: 'Telegram Bot @kitaidostavka_bot успешно инициализирован',
  },
];

const customLeadRequests: CustomLeadRequest[] = [];

// Helper to log bot events
function addBotLog(type: BotLog['type'], user: string, message: string) {
  const time = new Date().toLocaleTimeString('ru-RU');
  botLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: time,
    type,
    user,
    message,
  });
  if (botLogs.length > 50) botLogs.pop();
}

// Telegram Bot API helper methods
async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: any) {
  try {
    const payload: any = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
    };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }

    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Failed to send telegram message to', chatId, err?.message);
    return { ok: false, error: err?.message };
  }
}

async function sendTelegramPhoto(chatId: number, photoUrl: string, caption?: string, replyMarkup?: any) {
  try {
    const payload: any = {
      chat_id: chatId,
      photo: photoUrl,
      caption: caption || '',
      parse_mode: 'HTML',
    };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }

    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Failed to send telegram photo', err?.message);
    return { ok: false, error: err?.message };
  }
}

// Main Telegram Update Handler
async function handleTelegramMessage(message: any) {
  const chatId = message.chat?.id;
  const from = message.from;
  const text = (message.text || '').trim();

  if (!chatId || !from) return;

  // Save / update user in CRM subscribers
  const existingSub = subscribers.get(chatId);
  const now = new Date();
  const dateFormatted = `${now.toLocaleDateString('ru-RU')} ${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;

  const subscriber: TgSubscriber = {
    chatId,
    userId: from.id,
    username: from.username,
    firstName: from.first_name || 'Пользователь',
    lastName: from.last_name,
    joinedAt: existingSub ? existingSub.joinedAt : dateFormatted,
    lastActive: dateFormatted,
    interests: existingSub ? existingSub.interests : ['1688 Одежда', 'Обувь', 'Карго доставка'],
    ordersCount: existingSub ? existingSub.ordersCount : 0,
  };
  subscribers.set(chatId, subscriber);

  const senderName = from.username ? `@${from.username}` : from.first_name;
  console.log(`[TG BOT] Received "${text}" from ${senderName} (${chatId})`);

  // Handle /start
  if (text.startsWith('/start')) {
    addBotLog('incoming_command', senderName, '/start');

    const welcomeText = `👋 <b>Здравствуйте, ${from.first_name || 'друг'}!</b>

Добро пожаловать в официальный сервис выкупа <b>1688 CargoBuy</b> 🇨🇳

Мы выкупаем одежду, обувь и аксессуары напрямую с китайских оптовых фабрик <b>1688, Taobao и Poizon</b> по реальным заводским ценам Китая!

<b>Наши преимущества:</b>
• Курс юаня: <b>1¥ = 13.85 ₽</b>, комиссия сервиса всего <b>8%</b>
• Фотоотчет проверки и замеры стельки на нашем складе в Гуанчжоу
• Быстрая доставка Карго в РФ: <b>13–18 дней</b> до Москвы и отправка СДЭК
• Удобная оплата в рублях через СБП с официальным чеком
• Личный кабинет и онлайн-трекинг посылок в реальном времени

👇 <i>Нажмите кнопку ниже, чтобы запустить интерактивный каталог в Telegram:</i>`;

    const replyMarkup = {
      inline_keyboard: [
        [
          {
            text: '🛍 Открыть Каталог 1688',
            web_app: { url: APP_URL },
          },
        ],
        [
          { text: '🧮 Калькулятор доставки', callback_data: 'calc' },
          { text: '📦 Мои посылки', callback_data: 'track' },
        ],
        [
          { text: '🔗 Заявка по ссылке 1688', callback_data: 'custom' },
          { text: '💬 Чат с менеджером', callback_data: 'manager' },
        ],
      ],
    };

    await sendTelegramMessage(chatId, welcomeText, replyMarkup);
    return;
  }

  // Handle /catalog
  if (text.startsWith('/catalog')) {
    addBotLog('incoming_command', senderName, '/catalog');
    const catalogText = `🛍 <b>Каталог товаров с фабрик Китая</b>

В нашем каталоге собраны проверенные модели:
• 🧥 <b>Одежда:</b> пуховики 90/10 гусиный пух, худи 480g French Terry, брюки карго
• 👟 <b>Обувь:</b> дизайнерские кроссовки Chunky Runner, кеды, лоферы
• 👜 <b>Аксессуары:</b> сумки из натуральной кожи Nappa, очки UV400

Нажмите кнопку ниже, чтобы открыть витрину:`;

    await sendTelegramMessage(chatId, catalogText, {
      inline_keyboard: [
        [{ text: '🚀 Запустить Каталог WebApp', web_app: { url: APP_URL } }],
      ],
    });
    return;
  }

  // Handle /calc or calculation text
  if (text.startsWith('/calc') || text.toLowerCase().includes('доставк') || text.toLowerCase().includes('тариф')) {
    addBotLog('incoming_command', senderName, '/calc');

    // Parse weight if specified e.g. /calc 2.5
    const match = text.match(/[\d.,]+/);
    const weight = match ? parseFloat(match[0].replace(',', '.')) : 1.2;

    const fastUsd = +(weight * 4.6).toFixed(2);
    const fastRub = Math.round(fastUsd * 94.5) + 450;
    const regUsd = +(weight * 3.4).toFixed(2);
    const regRub = Math.round(regUsd * 94.5) + 450;
    const airUsd = +(weight * 7.8).toFixed(2);
    const airRub = Math.round(airUsd * 94.5) + 450;

    const calcText = `🧮 <b>Расчет стоимости доставки Карго (~${weight} кг):</b>

🚛 <b>Быстрое авто (13–18 дней):</b> ~$${fastUsd} (<b>~${fastRub} ₽</b>)
🚛 <b>Обычное авто (18–25 дней):</b> ~$${regUsd} (<b>~${regRub} ₽</b>)
✈️ <b>Авиа экспресс (7–10 дней):</b> ~$${airUsd} (<b>~${airRub} ₽</b>)

<i>* В стоимость включена надежная складская упаковка в коробку с влагозащитным мешком и страховка груза 2%.</i>`;

    await sendTelegramMessage(chatId, calcText, {
      inline_keyboard: [
        [{ text: '🧮 Открыть интерактивный калькулятор', web_app: { url: APP_URL } }],
      ],
    });
    return;
  }

  // Handle /track
  if (text.startsWith('/track')) {
    addBotLog('incoming_command', senderName, '/track');
    const trackText = `📦 <b>Отслеживание ваших посылок 1688</b>

Активные заказы в рейсе:
• <b>CN-92041:</b> 🚛 <i>В пути: Карго Китай -> РФ</i>
  Рейс: CARGO-GZ-849102-RU (Быстрое авто)
  Ориентировочное прибытие в Москву: 16 октября

• <b>CN-92038:</b> 📸 <i>Проверен и упакован (фотоотчет готов)</i>
  Склад: Гуанчжоу Консолидация

Нажмите кнопку, чтобы посмотреть фотоотчет замеров и историю движения:`;

    await sendTelegramMessage(chatId, trackText, {
      inline_keyboard: [
        [{ text: '🔎 Открыть трекинг и фотоотчет', web_app: { url: APP_URL } }],
      ],
    });
    return;
  }

  // Handle Link Submission (1688, Taobao, Poizon, Dewu)
  const isLink = text.includes('1688.com') || text.includes('taobao.com') || text.includes('poizon') || text.includes('dewu') || text.includes('http');
  if (isLink || text.startsWith('/custom')) {
    addBotLog('incoming_link', senderName, `Заявка по ссылке: ${text.slice(0, 50)}...`);

    const newLead: CustomLeadRequest = {
      id: `lead-${Date.now()}`,
      chatId,
      username: from.username,
      firstName: from.first_name || 'Клиент',
      linkOrText: text,
      date: dateFormatted,
      status: 'new',
    };
    customLeadRequests.unshift(newLead);

    const reply = `✅ <b>Ваша ссылка принята в обработку!</b>

Менеджер 1688 проверяет:
1. Фабрику-производителя и рейтинг надежности
2. Наличие нужного размера и цвета на складе в Китае
3. Точный расчет оптовой цены в юанях и доставку в рублях

Мы напишем вам прямо сюда, как только китайский поставщик подтвердит партию. Также вы можете открыть форму выкупа:`;

    await sendTelegramMessage(chatId, reply, {
      inline_keyboard: [
        [{ text: '📝 Заполнить детали выкупа (размер/цвет)', web_app: { url: APP_URL } }],
      ],
    });
    return;
  }

  // Handle /manager or help
  if (text.startsWith('/manager') || text.toLowerCase().includes('менеджер') || text.toLowerCase().includes('помощ')) {
    addBotLog('incoming_command', senderName, '/manager');
    const managerText = `💬 <b>Связь с менеджером 1688 CargoBuy</b>

Наш старший специалист по закупкам ответит на все вопросы по размерам, материалам, оптовым скидкам и срокам карго.

Напишите ваш вопрос прямо в этот диалог либо воспользуйтесь онлайн-чатом в приложении:`;

    await sendTelegramMessage(chatId, managerText, {
      inline_keyboard: [
        [{ text: '💬 Открыть чат заказов в WebApp', web_app: { url: APP_URL } }],
      ],
    });
    return;
  }

  // Default friendly reply
  const defaultReply = `👋 Спасибо за сообщение!

Вы можете:
• Нажать <b>«🛍 Каталог 1688»</b> в меню внизу экрана
• Прислать <b>ссылку на товар</b> с 1688 / Taobao / Poizon для бесплатного расчета
• Использовать команды: /catalog, /calc, /track, /manager`;

  await sendTelegramMessage(chatId, defaultReply, {
    inline_keyboard: [
      [{ text: '🛍 Открыть Каталог 1688', web_app: { url: APP_URL } }],
    ],
  });
}

// Handle Callback Queries (Inline Button clicks)
async function handleTelegramCallback(callbackQuery: any) {
  const chatId = callbackQuery.message?.chat?.id;
  const data = callbackQuery.data;
  const from = callbackQuery.from;

  if (!chatId) return;

  if (data === 'calc') {
    const calcText = `🧮 <b>Тарифы Карго доставки из Китая (Гуанчжоу/Иу -> РФ):</b>

• <b>Быстрое авто (13-18 дней):</b> $4.6/кг
• <b>Обычное авто (18-25 дней):</b> $3.4/кг
• <b>Авиа экспресс (7-10 дней):</b> $7.8/кг

Курс пересчета: $1 = 94.5 ₽, 1¥ = 13.85 ₽. В стоимость входит коробка + влагозащитный мешок со скотчем.`;

    await sendTelegramMessage(chatId, calcText, {
      inline_keyboard: [
        [{ text: '🧮 Интерактивный калькулятор в WebApp', web_app: { url: APP_URL } }],
      ],
    });
  } else if (data === 'track') {
    await sendTelegramMessage(chatId, '📦 Откройте WebApp, чтобы увидеть фотоотчет склада и детальный таймлайн:', {
      inline_keyboard: [
        [{ text: '🔎 Мои посылки и фотоотчет', web_app: { url: APP_URL } }],
      ],
    });
  } else if (data === 'custom') {
    await sendTelegramMessage(chatId, '🔗 Отправьте ссылку на товар с 1688 или Poizon прямо в этот чат, либо откройте форму заявки:', {
      inline_keyboard: [
        [{ text: '📝 Заполнить заявку по ссылке', web_app: { url: APP_URL } }],
      ],
    });
  } else if (data === 'manager') {
    await sendTelegramMessage(chatId, '💬 Менеджер подключился к диалогу. Задайте ваш вопрос!', {
      inline_keyboard: [
        [{ text: '🛍 Открыть чат в WebApp', web_app: { url: APP_URL } }],
      ],
    });
  }

  // Answer callback query so Telegram spinner stops
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackQuery.id }),
    });
  } catch (e) {
    // ignore
  }
}

// Telegram Long Polling Loop
let isPollingRunning = false;
let pollingOffset = 0;

async function startTelegramPolling() {
  if (isPollingRunning) return;
  isPollingRunning = true;
  console.log(`[TG BOT] Starting long polling for @kitaidostavka_bot...`);

  const poll = async () => {
    while (isPollingRunning) {
      try {
        const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getUpdates?offset=${pollingOffset}&timeout=20`;
        const res = await fetch(url);
        if (!res.ok) {
          await new Promise((r) => setTimeout(r, 3000));
          continue;
        }

        const data: any = await res.json();
        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            pollingOffset = update.update_id + 1;

            if (update.message) {
              await handleTelegramMessage(update.message);
            } else if (update.callback_query) {
              await handleTelegramCallback(update.callback_query);
            }
          }
        }
      } catch (err: any) {
        console.error('[TG BOT Polling Error]:', err?.message);
        await new Promise((r) => setTimeout(r, 4000));
      }
    }
  };

  poll();
}

// Start polling
startTelegramPolling();

// Healthcheck & Keep-Alive endpoints (for Railway, Render, UptimeRobot, and Docker healthchecks)
app.get(['/health', '/ping'], (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    keepAlive: 'active',
    telegramBot: {
      username: 'kitaidostavka_bot',
      id: 8612124409,
      isPollingRunning,
      subscribersCount: subscribers.size,
    },
  });
});

// Self-ping Anti-Sleep mechanism for Railway / Cloud deployment
function startAntiSleepKeepAlive() {
  const PING_INTERVAL_MS = 8 * 60 * 1000; // 8 minutes (well before any 15-30 min idle threshold)

  setInterval(async () => {
    try {
      const targetBase =
        process.env.RAILWAY_STATIC_URL
          ? `https://${process.env.RAILWAY_STATIC_URL}`
          : process.env.APP_URL || `http://localhost:${PORT}`;

      const pingUrl = `${targetBase.replace(/\/$/, '')}/health`;
      const res = await fetch(pingUrl, { headers: { 'User-Agent': 'RailwayKeepAliveBot/1.0' } });
      if (res.ok) {
        console.log(`[KeepAlive 24/7] Self-ping successful: ${pingUrl} (Status: ${res.status})`);
      }
    } catch (e: any) {
      // In local dev without network, ignore error
      console.log(`[KeepAlive Heartbeat] Bot process running. Memory: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`);
    }

    // Also verify Telegram polling watchdog
    if (!isPollingRunning) {
      console.warn('[Watchdog] Polling loop was not active, restarting polling...');
      startTelegramPolling();
    }
  }, PING_INTERVAL_MS);
}

// REST API Endpoints for Frontend (Admin & WebApp)

// 1. Bot status & CRM subscribers
app.get('/api/telegram/status', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    running: isPollingRunning,
    bot: {
      id: 8612124409,
      username: 'kitaidostavka_bot',
      name: 'Выкуп и Доставка из Китая',
      link: 'https://t.me/kitaidostavka_bot',
    },
    subscribersCount: subscribers.size,
    subscribers: Array.from(subscribers.values()),
    recentLogs: botLogs.slice(0, 20),
    incomingRequests: customLeadRequests,
  });
});

// 2. Send Broadcast to Real Telegram Users
app.post('/api/telegram/broadcast', async (req: Request, res: Response) => {
  const { title, messageText, discountCode, targetAudience } = req.body;

  if (!messageText) {
    return res.status(400).json({ ok: false, error: 'messageText is required' });
  }

  const subsList = Array.from(subscribers.values());
  let targetList = subsList;

  if (targetAudience === 'sneakers') {
    targetList = subsList.filter((s) => s.interests.some((i) => i.toLowerCase().includes('обувь') || i.toLowerCase().includes('кроссовк')));
  } else if (targetAudience === 'clothes') {
    targetList = subsList.filter((s) => s.interests.some((i) => i.toLowerCase().includes('одежд') || i.toLowerCase().includes('пуховик')));
  }

  // Format message
  let text = `📢 <b>${title || 'Новость от 1688 CargoBuy'}</b>\n\n${messageText}`;
  if (discountCode) {
    text += `\n\n🎁 <b>Промокод на скидку:</b> <code>${discountCode}</code>`;
  }

  const replyMarkup = {
    inline_keyboard: [
      [{ text: '🛍 Открыть Каталог 1688', web_app: { url: APP_URL } }],
    ],
  };

  let sentCount = 0;
  let failedCount = 0;

  for (const sub of targetList) {
    const result = await sendTelegramMessage(sub.chatId, text, replyMarkup);
    if (result.ok) {
      sentCount++;
    } else {
      failedCount++;
    }
  }

  addBotLog(
    'broadcast_sent',
    'Admin',
    `Рассылка "${title || 'Без названия'}": успешно отправлено ${sentCount}, ошибок ${failedCount}`
  );

  res.json({
    ok: true,
    sentCount,
    failedCount,
    totalTargeted: targetList.length,
  });
});

// 3. Send Order Status Notification to specific Telegram user
app.post('/api/telegram/send-order-update', async (req: Request, res: Response) => {
  const { chatId, orderNumber, newStatus, comment, cargoTrack, cdekTrack, photoUrl } = req.body;

  const targetChatId = chatId || Array.from(subscribers.keys())[0];
  if (!targetChatId) {
    return res.status(400).json({ ok: false, error: 'No target chat available' });
  }

  const statusLabels: Record<string, string> = {
    pending_payment: '⏳ Ожидает оплаты',
    paid: '💳 Оплачен, передан на выкуп в Китай',
    buying_1688: '🇨🇳 Выкуплен у поставщика 1688',
    warehouse_china: '🏢 Поступил на склад в Гуанчжоу',
    inspected_packed: '📸 Проверен и упакован (фотоотчет готов)',
    cargo_transit: '🚛 В пути: рейс Карго Китай -> РФ',
    customs_moscow: '🛃 Прибыл в Москву / Сортировка',
    cdek_transit: '📦 Передан в курьерскую службу СДЭК',
    delivered: '✅ Успешно доставлен и получен',
  };

  let caption = `🔔 <b>Обновление статуса заказа ${orderNumber}</b>\n\n`;
  caption += `Статус: <b>${statusLabels[newStatus] || newStatus}</b>\n`;
  if (comment) caption += `Комментарий: <i>${comment}</i>\n`;
  if (cargoTrack) caption += `Рейс Карго: <code>${cargoTrack}</code>\n`;
  if (cdekTrack) caption += `Накладная СДЭК: <code>${cdekTrack}</code>\n`;

  const replyMarkup = {
    inline_keyboard: [
      [{ text: '📦 Открыть статус в приложении', web_app: { url: APP_URL } }],
    ],
  };

  let result;
  if (photoUrl && photoUrl.startsWith('http')) {
    result = await sendTelegramPhoto(targetChatId, photoUrl, caption, replyMarkup);
  } else {
    result = await sendTelegramMessage(targetChatId, caption, replyMarkup);
  }

  addBotLog(
    'notification_sent',
    'Admin',
    `Уведомление по заказу ${orderNumber} отправлено в чат ${targetChatId}`
  );

  res.json({ ok: true, result });
});

// 4. Send direct message from Manager to User Telegram
app.post('/api/telegram/send-message', async (req: Request, res: Response) => {
  const { chatId, text } = req.body;
  const target = chatId || Array.from(subscribers.keys())[0];

  const result = await sendTelegramMessage(
    target,
    `💬 <b>Сообщение от менеджера 1688:</b>\n\n${text}`,
    {
      inline_keyboard: [
        [{ text: '💬 Ответить в чате', web_app: { url: APP_URL } }],
      ],
    }
  );

  res.json({ ok: true, result });
});

// Vite Middleware Integration (Dev) vs Static Files (Prod)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Telegram Bot @kitaidostavka_bot is active`);
    startAntiSleepKeepAlive();
  });
}

startServer();
