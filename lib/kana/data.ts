export type Syllabary = 'hiragana' | 'katakana'
export type KanaType = 'base' | 'dakuten' | 'handakuten' | 'yōon' | 'sokuon'

export interface KanaChar {
  glyph: string
  romaji: string
  syllabary: Syllabary
  type: KanaType
  row: string
  column: number
}

// Row names used in the Gojūon grid
const ROWS = [
  'あ-row', 'か-row', 'さ-row', 'た-row', 'な-row',
  'は-row', 'ま-row', 'や-row', 'ら-row', 'わ-row',
] as const

function char(
  glyph: string,
  romaji: string,
  syllabary: Syllabary,
  type: KanaType,
  row: string,
  column: number,
): KanaChar {
  return { glyph, romaji, syllabary, type, row, column }
}

// ── Base Gojūon ──────────────────────────────────────────────
// 46 base characters per syllabary

const baseHiragana: KanaChar[] = [
  // あ-row (vowels)
  char('あ', 'a', 'hiragana', 'base', 'あ-row', 1),
  char('い', 'i', 'hiragana', 'base', 'あ-row', 2),
  char('う', 'u', 'hiragana', 'base', 'あ-row', 3),
  char('え', 'e', 'hiragana', 'base', 'あ-row', 4),
  char('お', 'o', 'hiragana', 'base', 'あ-row', 5),
  // か-row
  char('か', 'ka', 'hiragana', 'base', 'か-row', 1),
  char('き', 'ki', 'hiragana', 'base', 'か-row', 2),
  char('く', 'ku', 'hiragana', 'base', 'か-row', 3),
  char('け', 'ke', 'hiragana', 'base', 'か-row', 4),
  char('こ', 'ko', 'hiragana', 'base', 'か-row', 5),
  // さ-row
  char('さ', 'sa', 'hiragana', 'base', 'さ-row', 1),
  char('し', 'shi', 'hiragana', 'base', 'さ-row', 2),
  char('す', 'su', 'hiragana', 'base', 'さ-row', 3),
  char('せ', 'se', 'hiragana', 'base', 'さ-row', 4),
  char('そ', 'so', 'hiragana', 'base', 'さ-row', 5),
  // た-row
  char('た', 'ta', 'hiragana', 'base', 'た-row', 1),
  char('ち', 'chi', 'hiragana', 'base', 'た-row', 2),
  char('つ', 'tsu', 'hiragana', 'base', 'た-row', 3),
  char('て', 'te', 'hiragana', 'base', 'た-row', 4),
  char('と', 'to', 'hiragana', 'base', 'た-row', 5),
  // な-row
  char('な', 'na', 'hiragana', 'base', 'な-row', 1),
  char('に', 'ni', 'hiragana', 'base', 'な-row', 2),
  char('ぬ', 'nu', 'hiragana', 'base', 'な-row', 3),
  char('ね', 'ne', 'hiragana', 'base', 'な-row', 4),
  char('の', 'no', 'hiragana', 'base', 'な-row', 5),
  // は-row
  char('は', 'ha', 'hiragana', 'base', 'は-row', 1),
  char('ひ', 'hi', 'hiragana', 'base', 'は-row', 2),
  char('ふ', 'fu', 'hiragana', 'base', 'は-row', 3),
  char('へ', 'he', 'hiragana', 'base', 'は-row', 4),
  char('ほ', 'ho', 'hiragana', 'base', 'は-row', 5),
  // ま-row
  char('ま', 'ma', 'hiragana', 'base', 'ま-row', 1),
  char('み', 'mi', 'hiragana', 'base', 'ま-row', 2),
  char('む', 'mu', 'hiragana', 'base', 'ま-row', 3),
  char('め', 'me', 'hiragana', 'base', 'ま-row', 4),
  char('も', 'mo', 'hiragana', 'base', 'ま-row', 5),
  // や-row
  char('や', 'ya', 'hiragana', 'base', 'や-row', 1),
  char('ゆ', 'yu', 'hiragana', 'base', 'や-row', 3),
  char('よ', 'yo', 'hiragana', 'base', 'や-row', 5),
  // ら-row
  char('ら', 'ra', 'hiragana', 'base', 'ら-row', 1),
  char('り', 'ri', 'hiragana', 'base', 'ら-row', 2),
  char('る', 'ru', 'hiragana', 'base', 'ら-row', 3),
  char('れ', 're', 'hiragana', 'base', 'ら-row', 4),
  char('ろ', 'ro', 'hiragana', 'base', 'ら-row', 5),
  // わ-row
  char('わ', 'wa', 'hiragana', 'base', 'わ-row', 1),
  char('を', 'wo', 'hiragana', 'base', 'わ-row', 5),
  // ん
  char('ん', 'n', 'hiragana', 'base', '', 0),
]

const baseKatakana: KanaChar[] = [
  // あ-row (vowels)
  char('ア', 'a', 'katakana', 'base', 'あ-row', 1),
  char('イ', 'i', 'katakana', 'base', 'あ-row', 2),
  char('ウ', 'u', 'katakana', 'base', 'あ-row', 3),
  char('エ', 'e', 'katakana', 'base', 'あ-row', 4),
  char('オ', 'o', 'katakana', 'base', 'あ-row', 5),
  // か-row
  char('カ', 'ka', 'katakana', 'base', 'か-row', 1),
  char('キ', 'ki', 'katakana', 'base', 'か-row', 2),
  char('ク', 'ku', 'katakana', 'base', 'か-row', 3),
  char('ケ', 'ke', 'katakana', 'base', 'か-row', 4),
  char('コ', 'ko', 'katakana', 'base', 'か-row', 5),
  // さ-row
  char('サ', 'sa', 'katakana', 'base', 'さ-row', 1),
  char('シ', 'shi', 'katakana', 'base', 'さ-row', 2),
  char('ス', 'su', 'katakana', 'base', 'さ-row', 3),
  char('セ', 'se', 'katakana', 'base', 'さ-row', 4),
  char('ソ', 'so', 'katakana', 'base', 'さ-row', 5),
  // た-row
  char('タ', 'ta', 'katakana', 'base', 'た-row', 1),
  char('チ', 'chi', 'katakana', 'base', 'た-row', 2),
  char('ツ', 'tsu', 'katakana', 'base', 'た-row', 3),
  char('テ', 'te', 'katakana', 'base', 'た-row', 4),
  char('ト', 'to', 'katakana', 'base', 'た-row', 5),
  // な-row
  char('ナ', 'na', 'katakana', 'base', 'な-row', 1),
  char('ニ', 'ni', 'katakana', 'base', 'な-row', 2),
  char('ヌ', 'nu', 'katakana', 'base', 'な-row', 3),
  char('ネ', 'ne', 'katakana', 'base', 'な-row', 4),
  char('ノ', 'no', 'katakana', 'base', 'な-row', 5),
  // は-row
  char('ハ', 'ha', 'katakana', 'base', 'は-row', 1),
  char('ヒ', 'hi', 'katakana', 'base', 'は-row', 2),
  char('フ', 'fu', 'katakana', 'base', 'は-row', 3),
  char('ヘ', 'he', 'katakana', 'base', 'は-row', 4),
  char('ホ', 'ho', 'katakana', 'base', 'は-row', 5),
  // ま-row
  char('マ', 'ma', 'katakana', 'base', 'ま-row', 1),
  char('ミ', 'mi', 'katakana', 'base', 'ま-row', 2),
  char('ム', 'mu', 'katakana', 'base', 'ま-row', 3),
  char('メ', 'me', 'katakana', 'base', 'ま-row', 4),
  char('モ', 'mo', 'katakana', 'base', 'ま-row', 5),
  // や-row
  char('ヤ', 'ya', 'katakana', 'base', 'や-row', 1),
  char('ユ', 'yu', 'katakana', 'base', 'や-row', 3),
  char('ヨ', 'yo', 'katakana', 'base', 'や-row', 5),
  // ら-row
  char('ラ', 'ra', 'katakana', 'base', 'ら-row', 1),
  char('リ', 'ri', 'katakana', 'base', 'ら-row', 2),
  char('ル', 'ru', 'katakana', 'base', 'ら-row', 3),
  char('レ', 're', 'katakana', 'base', 'ら-row', 4),
  char('ロ', 'ro', 'katakana', 'base', 'ら-row', 5),
  // わ-row
  char('ワ', 'wa', 'katakana', 'base', 'わ-row', 1),
  char('ヲ', 'wo', 'katakana', 'base', 'わ-row', 5),
  // ん
  char('ン', 'n', 'katakana', 'base', '', 0),
]

// ── Dakuten (゛) ─────────────────────────────────────────────

const dakutenHiragana: KanaChar[] = [
  // が-row (k→g)
  char('が', 'ga', 'hiragana', 'dakuten', 'か-row', 1),
  char('ぎ', 'gi', 'hiragana', 'dakuten', 'か-row', 2),
  char('ぐ', 'gu', 'hiragana', 'dakuten', 'か-row', 3),
  char('げ', 'ge', 'hiragana', 'dakuten', 'か-row', 4),
  char('ご', 'go', 'hiragana', 'dakuten', 'か-row', 5),
  // ざ-row (s→z)
  char('ざ', 'za', 'hiragana', 'dakuten', 'さ-row', 1),
  char('じ', 'ji', 'hiragana', 'dakuten', 'さ-row', 2),
  char('ず', 'zu', 'hiragana', 'dakuten', 'さ-row', 3),
  char('ぜ', 'ze', 'hiragana', 'dakuten', 'さ-row', 4),
  char('ぞ', 'zo', 'hiragana', 'dakuten', 'さ-row', 5),
  // だ-row (t→d)
  char('だ', 'da', 'hiragana', 'dakuten', 'た-row', 1),
  char('ぢ', 'ji', 'hiragana', 'dakuten', 'た-row', 2),
  char('づ', 'zu', 'hiragana', 'dakuten', 'た-row', 3),
  char('で', 'de', 'hiragana', 'dakuten', 'た-row', 4),
  char('ど', 'do', 'hiragana', 'dakuten', 'た-row', 5),
  // ば-row (h→b)
  char('ば', 'ba', 'hiragana', 'dakuten', 'は-row', 1),
  char('び', 'bi', 'hiragana', 'dakuten', 'は-row', 2),
  char('ぶ', 'bu', 'hiragana', 'dakuten', 'は-row', 3),
  char('べ', 'be', 'hiragana', 'dakuten', 'は-row', 4),
  char('ぼ', 'bo', 'hiragana', 'dakuten', 'は-row', 5),
]

const dakutenKatakana: KanaChar[] = [
  char('ガ', 'ga', 'katakana', 'dakuten', 'か-row', 1),
  char('ギ', 'gi', 'katakana', 'dakuten', 'か-row', 2),
  char('グ', 'gu', 'katakana', 'dakuten', 'か-row', 3),
  char('ゲ', 'ge', 'katakana', 'dakuten', 'か-row', 4),
  char('ゴ', 'go', 'katakana', 'dakuten', 'か-row', 5),
  char('ザ', 'za', 'katakana', 'dakuten', 'さ-row', 1),
  char('ジ', 'ji', 'katakana', 'dakuten', 'さ-row', 2),
  char('ズ', 'zu', 'katakana', 'dakuten', 'さ-row', 3),
  char('ゼ', 'ze', 'katakana', 'dakuten', 'さ-row', 4),
  char('ゾ', 'zo', 'katakana', 'dakuten', 'さ-row', 5),
  char('ダ', 'da', 'katakana', 'dakuten', 'た-row', 1),
  char('ヂ', 'ji', 'katakana', 'dakuten', 'た-row', 2),
  char('ヅ', 'zu', 'katakana', 'dakuten', 'た-row', 3),
  char('デ', 'de', 'katakana', 'dakuten', 'た-row', 4),
  char('ド', 'do', 'katakana', 'dakuten', 'た-row', 5),
  char('バ', 'ba', 'katakana', 'dakuten', 'は-row', 1),
  char('ビ', 'bi', 'katakana', 'dakuten', 'は-row', 2),
  char('ブ', 'bu', 'katakana', 'dakuten', 'は-row', 3),
  char('ベ', 'be', 'katakana', 'dakuten', 'は-row', 4),
  char('ボ', 'bo', 'katakana', 'dakuten', 'は-row', 5),
]

// ── Handakuten (゜) ──────────────────────────────────────────

const handakutenHiragana: KanaChar[] = [
  char('ぱ', 'pa', 'hiragana', 'handakuten', 'は-row', 1),
  char('ぴ', 'pi', 'hiragana', 'handakuten', 'は-row', 2),
  char('ぷ', 'pu', 'hiragana', 'handakuten', 'は-row', 3),
  char('ぺ', 'pe', 'hiragana', 'handakuten', 'は-row', 4),
  char('ぽ', 'po', 'hiragana', 'handakuten', 'は-row', 5),
]

const handakutenKatakana: KanaChar[] = [
  char('パ', 'pa', 'katakana', 'handakuten', 'は-row', 1),
  char('ピ', 'pi', 'katakana', 'handakuten', 'は-row', 2),
  char('プ', 'pu', 'katakana', 'handakuten', 'は-row', 3),
  char('ペ', 'pe', 'katakana', 'handakuten', 'は-row', 4),
  char('ポ', 'po', 'katakana', 'handakuten', 'は-row', 5),
]

// ── Yōon (contracted sounds with small ya/yu/yo) ─────────────

const yoonHiragana: KanaChar[] = [
  // きゃ行 (kya, kyu, kyo)
  char('きゃ', 'kya', 'hiragana', 'yōon', 'か-row', 1),
  char('きゅ', 'kyu', 'hiragana', 'yōon', 'か-row', 3),
  char('きょ', 'kyo', 'hiragana', 'yōon', 'か-row', 5),
  // ぎゃ行 (gya, gyu, gyo)
  char('ぎゃ', 'gya', 'hiragana', 'yōon', 'か-row', 1),
  char('ぎゅ', 'gyu', 'hiragana', 'yōon', 'か-row', 3),
  char('ぎょ', 'gyo', 'hiragana', 'yōon', 'か-row', 5),
  // しゃ行 (sha, shu, sho)
  char('しゃ', 'sha', 'hiragana', 'yōon', 'さ-row', 1),
  char('しゅ', 'shu', 'hiragana', 'yōon', 'さ-row', 3),
  char('しょ', 'sho', 'hiragana', 'yōon', 'さ-row', 5),
  // じゃ行 (ja, ju, jo)
  char('じゃ', 'ja', 'hiragana', 'yōon', 'さ-row', 1),
  char('じゅ', 'ju', 'hiragana', 'yōon', 'さ-row', 3),
  char('じょ', 'jo', 'hiragana', 'yōon', 'さ-row', 5),
  // ちゃ行 (cha, chu, cho)
  char('ちゃ', 'cha', 'hiragana', 'yōon', 'た-row', 1),
  char('ちゅ', 'chu', 'hiragana', 'yōon', 'た-row', 3),
  char('ちょ', 'cho', 'hiragana', 'yōon', 'た-row', 5),
  // ぢゃ行 (ja, ju, jo)
  char('ぢゃ', 'ja', 'hiragana', 'yōon', 'た-row', 1),
  char('ぢゅ', 'ju', 'hiragana', 'yōon', 'た-row', 3),
  char('ぢょ', 'jo', 'hiragana', 'yōon', 'た-row', 5),
  // にゃ行 (nya, nyu, nyo)
  char('にゃ', 'nya', 'hiragana', 'yōon', 'な-row', 1),
  char('にゅ', 'nyu', 'hiragana', 'yōon', 'な-row', 3),
  char('にょ', 'nyo', 'hiragana', 'yōon', 'な-row', 5),
  // ひゃ行 (hya, hyu, hyo)
  char('ひゃ', 'hya', 'hiragana', 'yōon', 'は-row', 1),
  char('ひゅ', 'hyu', 'hiragana', 'yōon', 'は-row', 3),
  char('ひょ', 'hyo', 'hiragana', 'yōon', 'は-row', 5),
  // びゃ行 (bya, byu, byo)
  char('びゃ', 'bya', 'hiragana', 'yōon', 'は-row', 1),
  char('びゅ', 'byu', 'hiragana', 'yōon', 'は-row', 3),
  char('びょ', 'byo', 'hiragana', 'yōon', 'は-row', 5),
  // ぴゃ行 (pya, pyu, pyo)
  char('ぴゃ', 'pya', 'hiragana', 'yōon', 'は-row', 1),
  char('ぴゅ', 'pyu', 'hiragana', 'yōon', 'は-row', 3),
  char('ぴょ', 'pyo', 'hiragana', 'yōon', 'は-row', 5),
  // みゃ行 (mya, myu, myo)
  char('みゃ', 'mya', 'hiragana', 'yōon', 'ま-row', 1),
  char('みゅ', 'myu', 'hiragana', 'yōon', 'ま-row', 3),
  char('みょ', 'myo', 'hiragana', 'yōon', 'ま-row', 5),
  // りゃ行 (rya, ryu, ryo)
  char('りゃ', 'rya', 'hiragana', 'yōon', 'ら-row', 1),
  char('りゅ', 'ryu', 'hiragana', 'yōon', 'ら-row', 3),
  char('りょ', 'ryo', 'hiragana', 'yōon', 'ら-row', 5),
]

const yoonKatakana: KanaChar[] = [
  char('キャ', 'kya', 'katakana', 'yōon', 'か-row', 1),
  char('キュ', 'kyu', 'katakana', 'yōon', 'か-row', 3),
  char('キョ', 'kyo', 'katakana', 'yōon', 'か-row', 5),
  char('ギャ', 'gya', 'katakana', 'yōon', 'か-row', 1),
  char('ギュ', 'gyu', 'katakana', 'yōon', 'か-row', 3),
  char('ギョ', 'gyo', 'katakana', 'yōon', 'か-row', 5),
  char('シャ', 'sha', 'katakana', 'yōon', 'さ-row', 1),
  char('シュ', 'shu', 'katakana', 'yōon', 'さ-row', 3),
  char('ショ', 'sho', 'katakana', 'yōon', 'さ-row', 5),
  char('ジャ', 'ja', 'katakana', 'yōon', 'さ-row', 1),
  char('ジュ', 'ju', 'katakana', 'yōon', 'さ-row', 3),
  char('ジョ', 'jo', 'katakana', 'yōon', 'さ-row', 5),
  char('チャ', 'cha', 'katakana', 'yōon', 'た-row', 1),
  char('チュ', 'chu', 'katakana', 'yōon', 'た-row', 3),
  char('チョ', 'cho', 'katakana', 'yōon', 'た-row', 5),
  char('ヂャ', 'ja', 'katakana', 'yōon', 'た-row', 1),
  char('ヂュ', 'ju', 'katakana', 'yōon', 'た-row', 3),
  char('ヂョ', 'jo', 'katakana', 'yōon', 'た-row', 5),
  char('ニャ', 'nya', 'katakana', 'yōon', 'な-row', 1),
  char('ニュ', 'nyu', 'katakana', 'yōon', 'な-row', 3),
  char('ニョ', 'nyo', 'katakana', 'yōon', 'な-row', 5),
  char('ヒャ', 'hya', 'katakana', 'yōon', 'は-row', 1),
  char('ヒュ', 'hyu', 'katakana', 'yōon', 'は-row', 3),
  char('ヒョ', 'hyo', 'katakana', 'yōon', 'は-row', 5),
  char('ビャ', 'bya', 'katakana', 'yōon', 'は-row', 1),
  char('ビュ', 'byu', 'katakana', 'yōon', 'は-row', 3),
  char('ビョ', 'byo', 'katakana', 'yōon', 'は-row', 5),
  char('ピャ', 'pya', 'katakana', 'yōon', 'は-row', 1),
  char('ピュ', 'pyu', 'katakana', 'yōon', 'は-row', 3),
  char('ピョ', 'pyo', 'katakana', 'yōon', 'は-row', 5),
  char('ミャ', 'mya', 'katakana', 'yōon', 'ま-row', 1),
  char('ミュ', 'myu', 'katakana', 'yōon', 'ま-row', 3),
  char('ミョ', 'myo', 'katakana', 'yōon', 'ま-row', 5),
  char('リャ', 'rya', 'katakana', 'yōon', 'ら-row', 1),
  char('リュ', 'ryu', 'katakana', 'yōon', 'ら-row', 3),
  char('リョ', 'ryo', 'katakana', 'yōon', 'ら-row', 5),
]

// ── Sokuon (gemination marker) ───────────────────────────────

const sokuonHiragana: KanaChar[] = [
  char('っ', 'tsu', 'hiragana', 'sokuon', '', 0),
]

const sokuonKatakana: KanaChar[] = [
  char('ッ', 'tsu', 'katakana', 'sokuon', '', 0),
]

// ── Aggregate ─────────────────────────────────────────────────

const ALL_CHARS: KanaChar[] = [
  ...baseHiragana,
  ...baseKatakana,
  ...dakutenHiragana,
  ...dakutenKatakana,
  ...handakutenHiragana,
  ...handakutenKatakana,
  ...yoonHiragana,
  ...yoonKatakana,
  ...sokuonHiragana,
  ...sokuonKatakana,
]

// ── Public API ────────────────────────────────────────────────

export function getAllChars(): KanaChar[] {
  return ALL_CHARS
}

export function getCharsBySyllabary(syllabary: Syllabary): KanaChar[] {
  return ALL_CHARS.filter(c => c.syllabary === syllabary)
}

export function getCharsByType(type: KanaType): KanaChar[] {
  return ALL_CHARS.filter(c => c.type === type)
}

export function getCharsByRow(row: string): KanaChar[] {
  return ALL_CHARS.filter(c => c.row === row)
}

export function getCharByGlyph(glyph: string): KanaChar | undefined {
  return ALL_CHARS.find(c => c.glyph === glyph)
}

export function getCharByRomaji(romaji: string): KanaChar | undefined {
  const normalized = romaji.toLowerCase().trim()
  return ALL_CHARS.find(c => c.romaji === normalized)
}
