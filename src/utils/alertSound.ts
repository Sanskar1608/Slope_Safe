// Web Audio API early-warning tone generator
let audioCtx: AudioContext | null = null;

export function playAlertChime(type: 'warning' | 'test' | 'critical' = 'test') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type === 'critical' ? 'sawtooth' : 'sine';

    if (type === 'critical') {
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.3);
      osc.frequency.setValueAtTime(880, now + 0.35);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.65);
    } else {
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.15); // A5
    }

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (type === 'critical' ? 0.7 : 0.45));

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + (type === 'critical' ? 0.75 : 0.5));
  } catch (err) {
    console.warn('Audio chime playback not allowed or failed:', err);
  }
}
