import Peer, { type DataConnection } from 'peerjs';
import type { Transport } from './transport';
import type { NetMsg } from './protocol';
import { peerIdFromCode } from './code';

export class PeerTransport implements Transport {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private hostConn: DataConnection | null = null;
  private isHost: boolean = false;
  private _selfId: string = '';

  private messageCallbacks: ((msg: NetMsg, fromPeerId: string) => void)[] = [];
  private peerJoinCallbacks: ((peerId: string) => void)[] = [];
  private peerLeaveCallbacks: ((peerId: string) => void)[] = [];

  get selfId(): string {
    return this._selfId;
  }

  host(code: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.isHost = true;
      const targetPeerId = peerIdFromCode(code);
      this._selfId = 'host';

      try {
        this.peer = new Peer(targetPeerId);
      } catch (err) {
        reject(err);
        return;
      }

      let opened = false;

      this.peer.on('open', (id) => {
        opened = true;
        this._selfId = id;
        resolve();
      });

      this.peer.on('error', (err: any) => {
        if (!opened) {
          if (err.type === 'unavailable-id') {
            reject(new Error('Kode sudah dipakai. Coba kode lain.'));
          } else {
            reject(new Error(err.message || 'Gagal membuat lobi PeerJS.'));
          }
        }
      });

      this.peer.on('connection', (conn) => {
        conn.on('open', () => {
          this.connections.set(conn.peer, conn);
          this.peerJoinCallbacks.forEach((cb) => cb(conn.peer));
        });

        conn.on('data', (data) => {
          this.messageCallbacks.forEach((cb) => cb(data as NetMsg, conn.peer));
        });

        conn.on('close', () => {
          this.connections.delete(conn.peer);
          this.peerLeaveCallbacks.forEach((cb) => cb(conn.peer));
        });

        conn.on('error', () => {
          this.connections.delete(conn.peer);
          this.peerLeaveCallbacks.forEach((cb) => cb(conn.peer));
        });
      });
    });
  }

  join(code: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.isHost = false;
      const hostPeerId = peerIdFromCode(code);

      let peer: Peer;
      try {
        peer = new Peer();
        this.peer = peer;
      } catch (err) {
        reject(err);
        return;
      }

      let timeoutTimer: ReturnType<typeof setTimeout> | null = null;
      let connected = false;

      timeoutTimer = setTimeout(() => {
        if (!connected) {
          this.close();
          reject(new Error('Lobi tidak ditemukan atau jaringan memblokir koneksi (timeout 10s).'));
        }
      }, 10000);

      peer.on('open', (myId) => {
        this._selfId = myId;
        const conn = peer.connect(hostPeerId, { reliable: true });
        this.hostConn = conn;

        conn.on('open', () => {
          connected = true;
          if (timeoutTimer) clearTimeout(timeoutTimer);
          resolve();
        });

        conn.on('data', (data) => {
          this.messageCallbacks.forEach((cb) => cb(data as NetMsg, hostPeerId));
        });

        conn.on('close', () => {
          this.peerLeaveCallbacks.forEach((cb) => cb(hostPeerId));
        });

        conn.on('error', (err) => {
          if (!connected) {
            if (timeoutTimer) clearTimeout(timeoutTimer);
            reject(new Error('Koneksi ke host gagal: ' + err.message));
          }
        });
      });

      peer.on('error', (err) => {
        if (!connected) {
          if (timeoutTimer) clearTimeout(timeoutTimer);
          reject(new Error('PeerJS error: ' + (err.message || 'Lobi tidak ditemukan.')));
        }
      });
    });
  }

  send(msg: NetMsg): void {
    if (this.isHost) {
      // Broadcast to all clients
      this.connections.forEach((conn) => {
        if (conn.open) {
          conn.send(msg);
        }
      });
    } else {
      // Send to host
      if (this.hostConn && this.hostConn.open) {
        this.hostConn.send(msg);
      }
    }
  }

  sendTo(peerId: string, msg: NetMsg): void {
    if (this.isHost) {
      const conn = this.connections.get(peerId);
      if (conn && conn.open) {
        conn.send(msg);
      }
    } else {
      if (this.hostConn && this.hostConn.open) {
        this.hostConn.send(msg);
      }
    }
  }

  onMessage(cb: (msg: NetMsg, fromPeerId: string) => void): void {
    this.messageCallbacks.push(cb);
  }

  onPeerJoin(cb: (peerId: string) => void): void {
    this.peerJoinCallbacks.push(cb);
  }

  onPeerLeave(cb: (peerId: string) => void): void {
    this.peerLeaveCallbacks.push(cb);
  }

  close(): void {
    if (this.hostConn) {
      this.hostConn.close();
      this.hostConn = null;
    }
    this.connections.forEach((conn) => conn.close());
    this.connections.clear();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.messageCallbacks = [];
    this.peerJoinCallbacks = [];
    this.peerLeaveCallbacks = [];
  }
}
