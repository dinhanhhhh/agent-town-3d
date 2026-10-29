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
})();
