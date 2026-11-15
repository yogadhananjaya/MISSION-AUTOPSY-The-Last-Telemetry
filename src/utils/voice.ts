/* antislop: Browser-native Web Speech API synthesis for NOVA AI voice lines without third-party cloud dependencies */
import { FEATURES } from '../config/features';

class NovaVoiceEngine {
  private enabled: boolean = false;
  private isSpeaking: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('orbita:voice_nova');
      this.enabled = saved === 'true';
    }
  }

  public setEnabled(enable: boolean) {
    this.enabled = enable;
    if (typeof window !== 'undefined') {
      localStorage.setItem('orbita:voice_nova', String(enable));
      if (!enable && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }

  public isVoiceEnabled(): boolean {
    return this.enabled && FEATURES.voiceNova;
  }

  public isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  public speak(text: string, lang: 'id' | 'en' = 'en') {
    if (!this.enabled || !FEATURES.voiceNova) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // Interrupt previous voice line immediately
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'id' ? 'id-ID' : 'en-US';
      utterance.rate = 1.05;
      utterance.pitch = 1.2; // Cheerful robotic AI cadence

      utterance.onstart = () => { this.isSpeaking = true; };
      utterance.onend = () => { this.isSpeaking = false; };
      utterance.onerror = () => { this.isSpeaking = false; };

      window.speechSynthesis.speak(utterance);
    } catch {}
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }
}

export const novaVoice = new NovaVoiceEngine();
