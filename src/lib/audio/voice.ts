'use client';

import { AgentRole } from '../pipeline/stages';

interface VoiceConfig {
  pitch: number;
  rate: number;
}

const AGENT_VOICE_PROFILES: Record<AgentRole, VoiceConfig> = {
  orchestrator: { pitch: 0.95, rate: 1.05 }, // Quyết đoán, chỉ huy
  pm: { pitch: 1.05, rate: 1.0 },           // Nhẹ nhàng, rõ ràng
  dev: { pitch: 0.9, rate: 1.1 },            // Nhanh nhẹn, tập trung
  review: { pitch: 1.0, rate: 0.95 },        // Nghiêm nghị, tỉ mỉ
  qa: { pitch: 1.1, rate: 1.15 },            // Sôi nổi, sắc bén
  security: { pitch: 0.85, rate: 0.95 },      // Trầm ấm, cảnh giác
  devops: { pitch: 0.9, rate: 1.05 },        // Vững vàng, dứt khoát
  monitor: { pitch: 1.15, rate: 1.1 },       // Nhanh, radar phát thanh
};

class VoiceSynthesizer {
  private isSupported: boolean;
  private voices: SpeechSynthesisVoice[] = [];
  private speechQueue: { role: AgentRole; text: string }[] = [];
  private isSpeaking = false;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    if (this.isSupported) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.isSupported) return;
    this.voices = window.speechSynthesis.getVoices();
  }

  private cleanSpeechText(text: string): string {
    return text
      .replace(/---SPEECH---:\s*/gi, '')
      .replace(/^\[|\]$/g, '')
      .replace(/https?:\/\/\S+/gi, '')
      .replace(/[#*_`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private processQueue() {
    if (!this.isSupported || this.isSpeaking || this.speechQueue.length === 0) return;

    const item = this.speechQueue.shift();
    if (!item) return;

    this.isSpeaking = true;
    const utterance = new SpeechSynthesisUtterance(item.text);
    const profile = AGENT_VOICE_PROFILES[item.role] || { pitch: 1, rate: 1 };
    utterance.pitch = profile.pitch;
    utterance.rate = profile.rate;

    if (this.voices.length === 0) {
      this.loadVoices();
    }

    const viVoice = this.voices.find(
      (v) => v.lang.startsWith('vi') || v.name.toLowerCase().includes('vietnam')
    );

    if (viVoice) {
      utterance.voice = viVoice;
      utterance.lang = viVoice.lang;
    } else {
      // Khi không có bộ giọng tiếng Việt cài sẵn, sử dụng giọng mặc định hệ thống
      const defaultVoice = this.voices.find((v) => v.default) || this.voices[0];
      if (defaultVoice) {
        utterance.voice = defaultVoice;
        utterance.lang = defaultVoice.lang;
      }
    }

    utterance.onend = () => {
      this.isSpeaking = false;
      this.processQueue();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.processQueue();
    };

    window.speechSynthesis.speak(utterance);
  }

  public speak(role: AgentRole, rawText: string) {
    if (!this.isSupported || !rawText) return;

    const cleanText = this.cleanSpeechText(rawText);
    if (!cleanText) return;

    // Giữ tối đa 2 câu trong hàng đợi để tránh trễ âm thanh
    if (this.speechQueue.length >= 2) {
      this.speechQueue.shift();
    }

    this.speechQueue.push({ role, text: cleanText });
    this.processQueue();
  }

  public stop() {
    if (this.isSupported) {
      this.speechQueue = [];
      this.isSpeaking = false;
      window.speechSynthesis.cancel();
    }
  }
}

export const voiceSynth = new VoiceSynthesizer();
