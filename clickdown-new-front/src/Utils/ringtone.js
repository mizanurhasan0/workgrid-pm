// Incoming-call ringtone generated with the Web Audio API (original tone, no audio file).
// play() / stop() are safe to call repeatedly and when audio is unsupported.
let ctx = null;
let timer = null;

function beep(context, freq, start, duration) {
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.2, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(context.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function ringOnce() {
  if (!ctx) {return;}
  const t = ctx.currentTime;
  beep(ctx, 880, t, 0.35);
  beep(ctx, 660, t + 0.45, 0.35);
}

export function playRingtone() {
  try {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {return;}
      ctx = new AudioCtx();
    }
    if (ctx.state === 'suspended') {ctx.resume().catch(() => {});}
    if (timer) {return;}
    ringOnce();
    timer = setInterval(ringOnce, 2000);
  } catch {
    // Autoplay policies or missing audio support must not break the call UI.
  }
}

export function stopRingtone() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
