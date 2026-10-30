/**
 * Agent Town 3D - Zero-Dependency Procedural Web Audio SFX
 * Synthesizes retro-modern micro-interactions without external mp3/wav files.
 */

(function () {
  'use strict';

  let audioCtx = null;
  let isMuted = localStorage.getItem('agent_town_sfx_muted') === 'true';

  function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, duration, type = 'sine', gainVal = 0.08, rampDown = true) {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      if (rampDown) {
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy catch
    }
  }

  const SFX = {
    click: function () {
      playTone(520, 0.04, 'triangle', 0.05);
    },

    step: function () {
      if (isMuted) return;
      playTone(440, 0.08, 'sine', 0.06);
      setTimeout(() => playTone(660, 0.12, 'sine', 0.06), 70);
    },

    success: function () {
      if (isMuted) return;
      playTone(523.25, 0.1, 'triangle', 0.07); // C5
      setTimeout(() => playTone(659.25, 0.1, 'triangle', 0.07), 80); // E5
      setTimeout(() => playTone(783.99, 0.14, 'triangle', 0.08), 160); // G5
      setTimeout(() => playTone(1046.5, 0.28, 'sine', 0.09), 240); // C6
    },

    fail: function () {
      if (isMuted) return;
      playTone(280, 0.15, 'sawtooth', 0.06);
      setTimeout(() => playTone(230, 0.25, 'sawtooth', 0.07), 100);
    },

    complete: function () {
      if (isMuted) return;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C E G C E
      notes.forEach((f, i) => {
        setTimeout(() => playTone(f, 0.22, 'triangle', 0.08), i * 90);
      });
    },

    isMuted: function () {
      return isMuted;
    },

    toggleMute: function () {
      isMuted = !isMuted;
      localStorage.setItem('agent_town_sfx_muted', isMuted);
      return isMuted;
    }
  };

  window.AgentTownSFX = SFX;
})();
