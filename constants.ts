
import { NavLink, Category, PetSkin, BuiltInGame } from './types';

// Palette based on the reference image (Jinx style: Hot Pink, Cyan, Acid Green)
export const COLORS = [
  'bg-jinx-pink',
  'bg-jinx-blue',
  'bg-neon-green',
  'bg-purple-500',
  'bg-yellow-400',
  'bg-gray-800',
];

export const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'ALL', label: '全部', icon: '🔥' },
  { id: 'AI', label: 'AI', icon: '🧠' },
  { id: 'DESIGN', label: '艺术', icon: '🎨' },
  { id: 'FRONTEND', label: '代码', icon: '💻' },
  { id: 'MEDIA', label: '娱乐', icon: '🎮' },
  { id: 'TOOLS', label: '工具', icon: '🛠️' },
  { id: 'GAME', label: '街机', icon: '🕹️' },
];

export const PET_SKINS: PetSkin[] = [
  { id: 'girl-white', name: '暴走蓝发', avatarColor: '#00E5FF', description: '蓝发双马尾的疯狂少女' },
  { id: 'girl-pink', name: '粉红魔女', avatarColor: '#FF0055', description: '处于过载状态' },
  { id: 'cat-orange', name: '墨水猫', avatarColor: '#FDBA74', description: '打翻了墨水瓶' },
];

export const BUILT_IN_GAMES: BuiltInGame[] = [
  { id: 'tetris3d', name: '微型积木', description: 'BUILDER', icon: '🧱', color: 'bg-yellow-400' },
  { id: 'snake', name: '贪吃蛇', description: 'CLASSIC', icon: '🐍', color: 'bg-neon-green' },
  { id: 'tictactoe', name: '井字棋', description: 'VS', icon: '❌', color: 'bg-jinx-pink' },
];

export const SEARCH_ENGINES = [
  { id: 'google', name: 'GO', url: 'https://www.google.com/search?q=' },
  { id: 'baidu', name: 'DU', url: 'https://www.baidu.com/s?wd=' },
  { id: 'bilibili', name: 'BILI', url: 'https://search.bilibili.com/all?keyword=' },
  { id: 'github', name: 'GIT', url: 'https://github.com/search?q=' },
];

export const DEFAULT_LINKS: NavLink[] = [
  { id: '1', title: 'Google', url: 'https://www.google.com', color: 'bg-jinx-blue', icon: '🔍', category: 'TOOLS' },
  { id: '2', title: 'GitHub', url: 'https://github.com', color: 'bg-black text-white', icon: '🐙', category: 'FRONTEND' },
  { id: '3', title: 'YouTube', url: 'https://www.youtube.com', color: 'bg-red-600 text-white', icon: '▶️', category: 'MEDIA' },
  { id: '4', title: 'Bilibili', url: 'https://www.bilibili.com', color: 'bg-jinx-pink', icon: '📺', category: 'MEDIA' },
  { id: '5', title: 'Twitter', url: 'https://twitter.com', color: 'bg-blue-400', icon: '🕊️', category: 'MEDIA' },
  { id: '6', title: 'ChatGPT', url: 'https://chat.openai.com', color: 'bg-neon-green', icon: '🧠', category: 'AI' },
  { id: '7', title: 'Figma', url: 'https://www.figma.com', color: 'bg-purple-600 text-white', icon: '🎨', category: 'DESIGN' },
  { id: '8', title: 'Dribbble', url: 'https://dribbble.com', color: 'bg-pink-400', icon: '🏀', category: 'DESIGN' },
];

// Character-specific dialogs
export const CHARACTER_DIALOGS = {
  'girl-white': { // Jinx Style: Chaotic, Manic, Explosive
    idle: [
      "真无聊... 炸点什么吧？",
      "我不疯，只是有点... 有创意！",
      "你看见我的枪了吗？",
      "嘘... 它们在跟我说话。",
      "我有新主意了！可能会很痛哦！",
      "嘿！看这里！这里！"
    ],
    morning: ["醒醒！太阳晒屁股了！", "早起的鸟儿... 被枪打！"],
    afternoon: ["想喝汽水！要嘶嘶响的那种！", "这地方太安静了..."],
    evening: ["霓虹灯亮了，好戏开场！", "荧光色才是最棒的颜色！"],
    night: ["谁睡觉啊？我们要通宵！", "熬夜会让眼睛发光哦！"],
    happy: ["太棒了！哈哈哈哈！", "完美！爆炸！", "YES! 就这样！"],
    sleep: ["没电了...", "Zzz... 别吵...", "关机..."],
    surprised: ["哇哦！你认真的？", "什么鬼？！", "吓我一跳！"],
    angry: ["别碰我！", "烦死了！走开！💢", "想尝尝子弹吗？"],
    love: ["你这人还不错。", "❤️", "嘿嘿... 我们是朋友了？"]
  },
  'girl-pink': { // Magical Girl / Idol Style: Cute, Tsundere, Energetic
    idle: [
      "要来点魔法吗？✨",
      "别一直盯着我看啦...",
      "今天的运势是大吉哦！",
      "我想吃草莓蛋糕~",
      "哼，勉强陪你一会儿。",
      "要加油哦！"
    ],
    morning: ["早安~ 又是元气满满的一天！", "快起床啦笨蛋！"],
    afternoon: ["下午茶时间到了吗？", "有点困了呢..."],
    evening: ["晚风很舒服呢~", "要把星星摘下来吗？"],
    night: ["还不睡吗？会有黑眼圈的。", "晚安... 呼..."],
    happy: ["好耶！✨", "最喜欢这个了！", "Magic~!"],
    sleep: ["呼... 呼...", "好梦...", "晚安..."],
    surprised: ["诶？！", "真的假的？！", "哇啊！"],
    angry: ["不要！", "笨蛋！💢", "不理你了！"],
    love: ["最喜欢你了！❤️", "啾~", "永远在一起哦。"]
  },
  'cat-orange': { // Cat Style: Lazy, Food-motivated, Aloof
    idle: [
      "喵...",
      "呼噜... 呼噜...",
      "（盯着你看）",
      "（伸懒腰）",
      "这里有个红点...",
      "我要小鱼干。"
    ],
    morning: ["喵？（早饭呢？）", "（踩你的脸）"],
    afternoon: ["（在阳光下打滚）", "Zzz..."],
    evening: ["（疯狂跑酷）", "喵！喵！"],
    night: ["（盯着虚空看）", "呼..."],
    happy: ["呼噜呼噜~", "喵~（蹭蹭）", "❤️"],
    sleep: ["Zzz...", "（缩成一团）"],
    surprised: ["哈？！（炸毛）", "喵嗷！"],
    angry: ["哈——！", "（咬你一口）", "走开。"],
    love: ["喵~ ❤️", "（舔手）", "呼噜..."]
  }
};
