const adjectives = [
  "Swift",
  "Bright",
  "Bold",
  "Cosmic",
  "Digital",
  "Electric",
  "Stellar",
  "Quantum",
  "Cyber",
  "Neon",
  "Turbo",
  "Ultra",
  "Mega",
  "Super",
  "Hyper",
];

const nouns = [
  "Phoenix",
  "Dragon",
  "Tiger",
  "Eagle",
  "Falcon",
  "Wolf",
  "Lion",
  "Panther",
  "Hawk",
  "Viper",
  "Ninja",
  "Samurai",
  "Warrior",
  "Knight",
];

// Minimal, fast MD5 implementation to synchronously produce a hex digest
// Adapted from public-domain compact implementations for portability.
function md5cycle(x: number[], k: number[]) {
  let [a, b, c, d] = x;
  function ff(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ) {
    a = (a + ((b & c) | (~b & d)) + x + t) | 0;
    return (((a << s) | (a >>> (32 - s))) + b) | 0;
  }
  function gg(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ) {
    a = (a + ((b & d) | (c & ~d)) + x + t) | 0;
    return (((a << s) | (a >>> (32 - s))) + b) | 0;
  }
  function hh(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ) {
    a = (a + (b ^ c ^ d) + x + t) | 0;
    return (((a << s) | (a >>> (32 - s))) + b) | 0;
  }
  function ii(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    t: number
  ) {
    a = (a + (c ^ (b | ~d)) + x + t) | 0;
    return (((a << s) | (a >>> (32 - s))) + b) | 0;
  }

  // Round 1
  a = ff(a, b, c, d, k[0], 7, -680876936);
  d = ff(d, a, b, c, k[1], 12, -389564586);
  c = ff(c, d, a, b, k[2], 17, 606105819);
  b = ff(b, c, d, a, k[3], 22, -1044525330);
  a = ff(a, b, c, d, k[4], 7, -176418897);
  d = ff(d, a, b, c, k[5], 12, 1200080426);
  c = ff(c, d, a, b, k[6], 17, -1473231341);
  b = ff(b, c, d, a, k[7], 22, -45705983);
  a = ff(a, b, c, d, k[8], 7, 1770035416);
  d = ff(d, a, b, c, k[9], 12, -1958414417);
  c = ff(c, d, a, b, k[10], 17, -42063);
  b = ff(b, c, d, a, k[11], 22, -1990404162);
  a = ff(a, b, c, d, k[12], 7, 1804603682);
  d = ff(d, a, b, c, k[13], 12, -40341101);
  c = ff(c, d, a, b, k[14], 17, -1502002290);
  b = ff(b, c, d, a, k[15], 22, 1236535329);

  // Round 2
  a = gg(a, b, c, d, k[1], 5, -165796510);
  d = gg(d, a, b, c, k[6], 9, -1069501632);
  c = gg(c, d, a, b, k[11], 14, 643717713);
  b = gg(b, c, d, a, k[0], 20, -373897302);
  a = gg(a, b, c, d, k[5], 5, -701558691);
  d = gg(d, a, b, c, k[10], 9, 38016083);
  c = gg(c, d, a, b, k[15], 14, -660478335);
  b = gg(b, c, d, a, k[4], 20, -405537848);
  a = gg(a, b, c, d, k[9], 5, 568446438);
  d = gg(d, a, b, c, k[14], 9, -1019803690);
  c = gg(c, d, a, b, k[3], 14, -187363961);
  b = gg(b, c, d, a, k[8], 20, 1163531501);
  a = gg(a, b, c, d, k[13], 5, -1444681467);
  d = gg(d, a, b, c, k[2], 9, -51403784);
  c = gg(c, d, a, b, k[7], 14, 1735328473);
  b = gg(b, c, d, a, k[12], 20, -1926607734);

  // Round 3
  a = hh(a, b, c, d, k[5], 4, -378558);
  d = hh(d, a, b, c, k[8], 11, -2022574463);
  c = hh(c, d, a, b, k[11], 16, 1839030562);
  b = hh(b, c, d, a, k[14], 23, -35309556);
  a = hh(a, b, c, d, k[1], 4, -1530992060);
  d = hh(d, a, b, c, k[4], 11, 1272893353);
  c = hh(c, d, a, b, k[7], 16, -155497632);
  b = hh(b, c, d, a, k[10], 23, -1094730640);
  a = hh(a, b, c, d, k[13], 4, 681279174);
  d = hh(d, a, b, c, k[0], 11, -358537222);
  c = hh(c, d, a, b, k[3], 16, -722521979);
  b = hh(b, c, d, a, k[6], 23, 76029189);
  a = hh(a, b, c, d, k[9], 4, -640364487);
  d = hh(d, a, b, c, k[12], 11, -421815835);
  c = hh(c, d, a, b, k[15], 16, 530742520);
  b = hh(b, c, d, a, k[2], 23, -995338651);

  // Round 4
  a = ii(a, b, c, d, k[0], 6, -198630844);
  d = ii(d, a, b, c, k[7], 10, 1126891415);
  c = ii(c, d, a, b, k[14], 15, -1416354905);
  b = ii(b, c, d, a, k[5], 21, -57434055);
  a = ii(a, b, c, d, k[12], 6, 1700485571);
  d = ii(d, a, b, c, k[3], 10, -1894986606);
  c = ii(c, d, a, b, k[10], 15, -1051523);
  b = ii(b, c, d, a, k[1], 21, -2054922799);
  a = ii(a, b, c, d, k[8], 6, 1873313359);
  d = ii(d, a, b, c, k[15], 10, -30611744);
  c = ii(c, d, a, b, k[6], 15, -1560198380);
  b = ii(b, c, d, a, k[13], 21, 1309151649);
  a = ii(a, b, c, d, k[4], 6, -145523070);
  d = ii(d, a, b, c, k[11], 10, -1120210379);
  c = ii(c, d, a, b, k[2], 15, 718787259);
  b = ii(b, c, d, a, k[9], 21, -343485551);

  x[0] = (x[0] + a) | 0;
  x[1] = (x[1] + b) | 0;
  x[2] = (x[2] + c) | 0;
  x[3] = (x[3] + d) | 0;
}

function md5blk(s: string) {
  const md5blks: number[] = [];
  for (let i = 0; i < s.length; i += 4) {
    md5blks[i >> 2] =
      s.charCodeAt(i) +
      (s.charCodeAt(i + 1) << 8) +
      (s.charCodeAt(i + 2) << 16) +
      (s.charCodeAt(i + 3) << 24);
  }
  return md5blks;
}

function rhex(n: number) {
  let s = "",
    j = 0;
  for (; j < 4; j++) {
    s += ("0" + ((n >> (j * 8 + 4)) & 0x0f).toString(16)).slice(-2);
    s += ("0" + ((n >> (j * 8)) & 0x0f).toString(16)).slice(-2);
  }
  return s;
}

function hex(x: number[]) {
  return rhex(x[0]) + rhex(x[1]) + rhex(x[2]) + rhex(x[3]);
}

export function md5(str: string): string {
  let i;
  const x = [1732584193, -271733879, -1732584194, 271733878];
  let k = md5blk(str + "\u0000");

  // simple block processing for small strings (suitable for ids)
  if (!k.length) k = [0];
  md5cycle(x, k.concat(new Array(16 - (k.length % 16)).fill(0)));

  return hex(x);
}

export function generateDisplayName(userId: string): string {
  // Use md5(userId), take first 8 hex chars -> 32-bit int for even distribution
  const digest = md5(userId);
  const intVal = parseInt(digest.slice(0, 8), 16) >>> 0;

  const adjIndex = intVal % adjectives.length;
  const nounIndex = (intVal * 7) % nouns.length;
  const num = (intVal % 9000) + 1000;

  return `${adjectives[adjIndex]}${nouns[nounIndex]}${num}`;
}
