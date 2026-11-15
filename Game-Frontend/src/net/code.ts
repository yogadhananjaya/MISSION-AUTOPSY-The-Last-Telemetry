const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function makeLobbyCode(): string {
  let s = '';
  const buf = new Uint32Array(4);
  crypto.getRandomValues(buf);
  for (const n of buf) s += ALPHABET[n % ALPHABET.length];
  return `NOVA-${s}`;
}
export const peerIdFromCode = (code: string) => `orbita-nova-${code.replace(/[^A-Z0-9]/gi, '').toUpperCase()}`;
export const normalizeCode = (raw: string) => {
  const t = raw.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  return t.startsWith('NOVA') ? `NOVA-${t.slice(4)}` : `NOVA-${t}`;
};
