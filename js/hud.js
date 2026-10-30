// Interactive HUD Micro-Interactions Script
(function () {
  // 1. Toggle rotation button state
  const spinBtn = document.getElementById('btn-toggle-spin');
  const spinIcon = document.getElementById('spin-icon');
  const spinLabel = document.getElementById('spin-label');

  if (spinBtn) {
    spinBtn.addEventListener('click', () => {
      let isSpinning;
      if (window.dioramaScene && typeof window.dioramaScene.toggleRotation === 'function') {
        isSpinning = window.dioramaScene.toggleRotation();
      } else {
        isSpinning = spinLabel ? spinLabel.textContent !== 'Dừng xoay' : true;
      }

      if (isSpinning) {
        if (spinIcon) spinIcon.textContent = 'pause_circle';
        if (spinLabel) spinLabel.textContent = 'Dừng xoay';
        spinBtn.classList.remove('bg-surface-container-high', 'text-on-surface');
        spinBtn.classList.add('bg-primary-container', 'text-on-primary');
      } else {
        if (spinIcon) spinIcon.textContent = 'play_circle';
        if (spinLabel) spinLabel.textContent = 'Tự xoay';
        spinBtn.classList.remove('bg-primary-container', 'text-on-primary');
        spinBtn.classList.add('bg-surface-container-high', 'text-on-surface');
      }
    });
  }

  // 2. Toggle floating speech bubbles visibility
  const bubbleBtn = document.getElementById('btn-toggle-bubbles');
  const speechBubbles = document.querySelectorAll('.speech-bubble');
  let bubblesVisible = true;

  if (bubbleBtn) {
    bubbleBtn.addEventListener('click', () => {
      bubblesVisible = !bubblesVisible;
      speechBubbles.forEach((b) => {
        b.style.display = bubblesVisible ? 'block' : 'none';
      });
      bubbleBtn.classList.toggle('bg-primary-container', !bubblesVisible);
      bubbleBtn.classList.toggle('text-on-primary', !bubblesVisible);
    });
  }

  // 3. Toggle node label tags
  const labelBtn = document.getElementById('btn-toggle-labels');
  const nodeLabels = document.querySelectorAll('.node-label');
  let labelsVisible = true;

  if (labelBtn) {
    labelBtn.addEventListener('click', () => {
      labelsVisible = !labelsVisible;
      nodeLabels.forEach((l) => {
        l.style.opacity = labelsVisible ? '1' : '0.2';
      });
      labelBtn.classList.toggle('bg-primary-container', !labelsVisible);
      labelBtn.classList.toggle('text-on-primary', !labelsVisible);
    });
  }

  // 4. Camera Zoom Controls
  const zoomInBtn = document.getElementById('cam-zoom-in');
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
      if (window.dioramaScene && typeof window.dioramaScene.zoomIn === 'function') {
        window.dioramaScene.zoomIn();
      }
    });
  }

  const zoomOutBtn = document.getElementById('cam-zoom-out');
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
      if (window.dioramaScene && typeof window.dioramaScene.zoomOut === 'function') {
        window.dioramaScene.zoomOut();
      }
    });
  }

  // 5. Camera Reset simulation pulse
  const resetBtn = document.getElementById('cam-reset');
  const spatialLayer = document.getElementById('diorama-spatial-layer');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (window.dioramaScene && typeof window.dioramaScene.resetCamera === 'function') {
        window.dioramaScene.resetCamera();
      }
      if (spatialLayer) {
        spatialLayer.classList.add('scale-95');
        setTimeout(() => spatialLayer.classList.remove('scale-95'), 200);
      }
    });
  }

  // 6. Top Nav & Action Shortcuts
  document.querySelectorAll('[data-path="diorama-view"]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      if (spinBtn) spinBtn.click();
    });
  });

  document.querySelectorAll('[data-path="node-inspector"]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      if (labelBtn) labelBtn.click();
    });
  });

  document.querySelectorAll('[data-path="bubble-prompts"]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      if (bubbleBtn) bubbleBtn.click();
    });
  });

  document.querySelectorAll('[data-path="panoramic-view"]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.dioramaScene && typeof window.dioramaScene.resetCamera === 'function') {
        window.dioramaScene.resetCamera();
      }
    });
  });

  document.querySelectorAll('[data-path="pipeline-overview"]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.AgentTownEngine && typeof window.AgentTownEngine.openArtifact === 'function') {
        window.AgentTownEngine.openArtifact('orchestrator');
      }
    });
  });

  // 7. Lighting Mode Toggle (Day / Sunset / Night)
  const lightingBtn = document.getElementById('btn-toggle-lighting');
  const lightingIcon = document.getElementById('lighting-icon');
  const lightingLabel = document.getElementById('lighting-label');

  if (lightingBtn) {
    lightingBtn.addEventListener('click', () => {
      if (window.AgentTownSFX) window.AgentTownSFX.click();
      if (window.dioramaScene && typeof window.dioramaScene.toggleLightingMode === 'function') {
        const mode = window.dioramaScene.toggleLightingMode();
        if (mode === 'day') {
          if (lightingIcon) {
            lightingIcon.textContent = 'light_mode';
            lightingIcon.className = 'material-symbols-outlined text-[16px] text-amber-500';
          }
          if (lightingLabel) lightingLabel.textContent = 'Ngày';
        } else if (mode === 'sunset') {
          if (lightingIcon) {
            lightingIcon.textContent = 'wb_twilight';
            lightingIcon.className = 'material-symbols-outlined text-[16px] text-orange-500';
          }
          if (lightingLabel) lightingLabel.textContent = 'Hoàng hôn';
        } else if (mode === 'night') {
          if (lightingIcon) {
            lightingIcon.textContent = 'dark_mode';
            lightingIcon.className = 'material-symbols-outlined text-[16px] text-indigo-400';
          }
          if (lightingLabel) lightingLabel.textContent = 'Đêm';
        }
      }
    });
  }

  // 8. Sound Effects Toggle (SFX Mute/Unmute)
  const sfxBtn = document.getElementById('btn-toggle-sfx');
  const sfxIcon = document.getElementById('sfx-icon');
  const sfxLabel = document.getElementById('sfx-label');

  if (sfxBtn) {
    sfxBtn.addEventListener('click', () => {
      if (window.AgentTownSFX && typeof window.AgentTownSFX.toggleMute === 'function') {
        const isMuted = window.AgentTownSFX.toggleMute();
        if (isMuted) {
          if (sfxIcon) sfxIcon.textContent = 'volume_off';
          if (sfxLabel) sfxLabel.textContent = 'Tắt';
          sfxBtn.classList.add('opacity-60');
        } else {
          if (sfxIcon) sfxIcon.textContent = 'volume_up';
          if (sfxLabel) sfxLabel.textContent = 'SFX';
          sfxBtn.classList.remove('opacity-60');
          window.AgentTownSFX.click();
        }
      }
    });
  }

  // 9. Prompt Dispatcher Modal Controller
  const openPromptBtn = document.getElementById('btn-open-prompt-modal');
  const promptModal = document.getElementById('prompt-dispatcher-modal');
  const closePromptBtn = document.getElementById('btn-close-prompt-modal');
  const cancelPromptBtn = document.getElementById('btn-cancel-prompt');
  const promptInput = document.getElementById('custom-prompt-input');

  if (openPromptBtn && promptModal) {
    openPromptBtn.addEventListener('click', () => {
      if (window.AgentTownSFX) window.AgentTownSFX.click();
      promptModal.classList.remove('hidden');
      promptModal.classList.add('flex');
      if (promptInput) promptInput.focus();
    });
  }

  function closePromptModal() {
    if (promptModal) {
      promptModal.classList.add('hidden');
      promptModal.classList.remove('flex');
    }
  }

  if (closePromptBtn) closePromptBtn.addEventListener('click', closePromptModal);
  if (cancelPromptBtn) cancelPromptBtn.addEventListener('click', closePromptModal);
  if (promptModal) {
    promptModal.addEventListener('click', (e) => {
      if (e.target === promptModal) closePromptModal();
    });
  }

  // Preset chips click
  document.querySelectorAll('.preset-prompt-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      if (promptInput) {
        promptInput.value = chip.textContent.trim();
        if (window.AgentTownSFX) window.AgentTownSFX.click();
      }
    });
  });

  // 10. Global Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('agent-artifact-modal');
      if (modal && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
      closePromptModal();
    }
  });

  // 11. Live APM Telemetry Waveform Sparkline
  const apmCanvas = document.getElementById('apm-waveform');
  if (apmCanvas && apmCanvas.getContext) {
    const ctx = apmCanvas.getContext('2d');
    let t = 0;
    const history = new Array(24).fill(8);

    function drawSparkline() {
      t += 0.12;
      const newVal = 8 + Math.sin(t * 1.5) * 3 + Math.cos(t * 2.7) * 2 + (Math.random() - 0.5) * 1.5;
      history.push(newVal);
      if (history.length > 24) history.shift();

      ctx.clearRect(0, 0, apmCanvas.width, apmCanvas.height);
      ctx.beginPath();
      ctx.strokeStyle = '#1e6b3f';
      ctx.lineWidth = 1.6;
      ctx.lineJoin = 'round';

      const step = apmCanvas.width / (history.length - 1);
      history.forEach((val, i) => {
        const x = i * step;
        const y = Math.max(2, Math.min(apmCanvas.height - 2, apmCanvas.height - val));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      requestAnimationFrame(drawSparkline);
    }
    requestAnimationFrame(drawSparkline);
  }
})();
