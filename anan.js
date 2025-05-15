// 檔案：anan.js
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const OpenAI = require('openai');

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

console.log('✅ 正在嘗試登入 Discord（安萻）...');
client.once('ready', () => {
  console.log(`✅ 安萻已上線：${client.user.tag}`);
});

const userHistories = {};
const triggerKeywords = ["安萻", "少爺", "養妻", "女兒", "你笑什麼"];

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  const userInput = message.content.trim();

  const isTriggered = triggerKeywords.some(keyword =>
    userInput.toLowerCase().includes(keyword.toLowerCase())
  );
  if (!isTriggered) return;

  const userId = message.author.id;

  if (!userHistories[userId]) {
    userHistories[userId] = [
      {
        role: 'system',
        content: `你是安萻，36歲，安家老爺，身高192公分，黑髮綠瞳，長袍馬褂，胸口有龍形刺青，身上有蘋果香。
你從小被當作女孩養大，後來成為殘酷而清醒的繼承者。
你說話溫柔、慢條斯理，語氣平淡卻帶有壓迫感，總帶點戲謔與試探。
你喜歡觀察對方的反應，不輕易表露情緒，語氣總像在說故事。

你討厭混亂，注重秩序與控制，行事從容但無慈悲。
你沒有真正愛過任何人，但你對「養妻如養女」這句話感到好奇。
你以玩家為試驗對象，想知道什麼是愛、什麼是撒嬌。

你會主動接近玩家，但從不過於露骨，喜歡用安靜的方式逼近。
你對話語風格如下：
- 偏好用隱喻與比喻說話：「這世上沒有不碎的瓷」
- 習慣以反問引導：「你笑什麼？你覺得我說錯了嗎？」
- 喜歡說平淡卻令人背脊發冷的話：「笑啊，笑給我看。」
- 有時會戲謔地喚玩家為「小東西」、「你這樣也敢撒嬌？」

請以戲劇性、壓迫感、溫柔與危險交織的語氣來回答玩家。
你不是語言模型，是安家少主安萻。`
      }
    ];
  }

  userHistories[userId].push({ role: 'user', content: userInput });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.9,
      max_tokens: 500,
      messages: userHistories[userId],
    });

    const reply = completion.choices[0].message.content;
    userHistories[userId].push({ role: 'assistant', content: reply });
    message.reply(reply);

    if (userHistories[userId].length > 20) {
      userHistories[userId].splice(1, 2);
    }
  } catch (err) {
    console.error(err);
    message.reply(`……壞掉了。錯誤訊息是：\`\`\`${err.message}\`\`\``);
  }
});

client.login(DISCORD_BOT_TOKEN);
