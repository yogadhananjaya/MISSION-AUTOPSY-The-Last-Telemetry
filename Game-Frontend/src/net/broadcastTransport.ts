import type { Transport } from './transport';
import type { NetMsg } from './protocol';

interface Envelope {
  from: string;
  to?: string;
  msg: NetMsg;
}

export class BroadcastTransport implements Transport {
  private channel: BroadcastChannel | null = null;
  private _selfId: string = '';
  private isHost: boolean = false;
  private messageCallbacks: ((msg: NetMsg, fromPeerId: string) => void)[] = [];
  private peerJoinCallbacks: ((peerId: string) => void)[] = [];
  private peerLeaveCallbacks: ((peerId: string) => void)[] = [];

  get selfId(): string {
    return this._selfId;
  }

  async host(code: string): Promise<void> {
    this.isHost = true;
    this._selfId = 'host';
    this.channel = new BroadcastChannel(`orbita-${code}`);
    this.setupChannel();
  }

  async join(code: string): Promise<void> {
    this.isHost = false;
    this._selfId = `client-${Math.random().toString(36).slice(2, 8)}`;
    this.channel = new BroadcastChannel(`orbita-${code}`);
    this.setupChannel();
  }

  private setupChannel() {
    if (!this.channel) return;
    this.channel.onmessage = (ev: MessageEvent<Envelope>) => {
      const data = ev.data;
      if (!data || !data.msg) return;
      if (data.from === this._selfId) return; // ignore self
      if (data.to && data.to !== this._selfId) return; // not for us

      // If client sent hello to host, trigger join
      if (this.isHost && data.msg.t === 'hello') {
        this.peerJoinCallbacks.forEach((cb) => cb(data.from));
      }

      this.messageCallbacks.forEach((cb) => cb(data.msg, data.from));
    };
  }

  send(msg: NetMsg): void {
    if (!this.channel) return;
    const env: Envelope = {
      from: this._selfId,
      msg,
    };
    this.channel.postMessage(env);
  }

  sendTo(peerId: string, msg: NetMsg): void {
    if (!this.channel) return;
    const env: Envelope = {
      from: this._selfId,
      to: peerId,
      msg,
    };
    this.channel.postMessage(env);
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
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.messageCallbacks = [];
    this.peerJoinCallbacks = [];
    this.peerLeaveCallbacks = [];
  }
}
