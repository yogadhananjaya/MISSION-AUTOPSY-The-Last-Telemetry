import type { NetMsg } from './protocol';
export interface Transport {
  /** Host: buat lobi dan mulai menerima koneksi. Resolve dengan kode lobi. */
  host(code: string): Promise<void>;
  /** Klien: gabung ke kode. Reject jika gagal dalam 10 detik. */
  join(code: string): Promise<void>;
  /** Klien -> host. Host -> semua klien. */
  send(msg: NetMsg): void;
  /** Host -> satu klien. */
  sendTo(peerId: string, msg: NetMsg): void;
  onMessage(cb: (msg: NetMsg, fromPeerId: string) => void): void;
  onPeerJoin(cb: (peerId: string) => void): void;
  onPeerLeave(cb: (peerId: string) => void): void;
  close(): void;
  readonly selfId: string;
}
