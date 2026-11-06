// Dream Car House - Iconic Supercar Sound Engine
// Featuring 3 Legendary Marques: Porsche GT3, Ferrari V12, and Bugatti W16
// High-fidelity PCM Audio Playback with Web Audio API Physical Synthesis Fallback

export interface SupercarSoundProfile {
  id: "porsche" | "ferrari" | "bugatti";
  marque: string;
  model: string;
  tagline: string;
  engine: string;
  icon: string;
  audioPath: string;
  accentColor: string;
}

export const SUPERCAR_SOUND_PROFILES: SupercarSoundProfile[] = [
  {
    id: "porsche",
    marque: "PORSCHE",
    model: "911 GT3 RS",
    tagline: "Gated Transmission & 9,000 RPM Flat-6",
    engine: "4.0L Naturally Aspirated Boxer",
    icon: "🏁",
    audioPath: "/assets/sounds/porsche_gt3_shift.wav",
    accentColor: "#f59e0b",
  },
  {
    id: "ferrari",
    marque: "FERRARI",
    model: "812 Superfast",
    tagline: "Open-Gated Shifter & Screaming V12",
    engine: "6.5L 65° High-Pitch V12 F1",
    icon: "🐎",
    audioPath: "/assets/sounds/ferrari_v12_shift.wav",
    accentColor: "#ef4444",
  },
  {
    id: "bugatti",
    marque: "BUGATTI",
    model: "Chiron Super Sport",
    tagline: "Quad-Turbo W16 & DSG Shift Bang",
    engine: "8.0L Quad-Turbocharged W16",
    icon: "⚡",
    audioPath: "/assets/sounds/bugatti_w16_shift.wav",
    accentColor: "#38bdf8",
  },
];

let currentSoundIndex = 0;

/**
 * Plays the next iconic supercar sound in sequential rotation:
 * 1st: Porsche 911 GT3 (Mechanical Gated Shifter & Flat-6)
 * 2nd: Ferrari V12 (Open-Gated Metallic Clack & Screaming V12)
 * 3rd: Bugatti Chiron (Quad-Turbo W16 Roar & DSG Shift Pop)
 * Then loops back.
 * Returns the active profile for HUD display.
 */
export function playNextSupercarSound(): SupercarSoundProfile {
  const profile = SUPERCAR_SOUND_PROFILES[currentSoundIndex];
  // Advance rotation for the next click
  currentSoundIndex = (currentSoundIndex + 1) % SUPERCAR_SOUND_PROFILES.length;

  if (typeof window !== "undefined") {
    try {
      const audio = new Audio(profile.audioPath);
      audio.volume = 0.95;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback to legacy path or Web Audio physical synthesis
          try {
            const fallbackAudio = new Audio("/assets/supercar_engine_rev.wav");
            fallbackAudio.volume = 0.9;
            fallbackAudio.play().catch(() => {
              synthesizeWebAudioSupercar(profile.id);
            });
          } catch {
            synthesizeWebAudioSupercar(profile.id);
          }
        });
      }
    } catch {
      synthesizeWebAudioSupercar(profile.id);
    }
  }

  return profile;
}

/**
 * Legacy compatibility helper
 */
export function playSupercarRevSound(): void {
  playNextSupercarSound();
}

/**
 * Web Audio API Acoustic Synthesis Engine for Porsche, Ferrari, and Bugatti
 */
export function synthesizeWebAudioSupercar(marque: "porsche" | "ferrari" | "bugatti"): void {
  if (typeof window === "undefined") return;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  try {
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const t0 = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.01, t0);
    masterGain.gain.exponentialRampToValueAtTime(0.4, t0 + 0.12);
    masterGain.gain.exponentialRampToValueAtTime(0.55, t0 + 0.55);
    masterGain.gain.exponentialRampToValueAtTime(0.001, t0 + 1.35);
    masterGain.connect(ctx.destination);

    if (marque === "porsche") {
      // PORSCHE 911 GT3: Raspy Flat-6 rev + mechanical clutch engagement
      const osc1 = ctx.createOscillator();
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(150, t0);
      osc1.frequency.exponentialRampToValueAtTime(440, t0 + 0.55);
      osc1.frequency.exponentialRampToValueAtTime(270, t0 + 1.25);
      osc1.connect(masterGain);
      osc1.start(t0);
      osc1.stop(t0 + 1.35);

      const osc2 = ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(300, t0);
      osc2.frequency.exponentialRampToValueAtTime(880, t0 + 0.55);
      osc2.frequency.exponentialRampToValueAtTime(540, t0 + 1.25);
      osc2.connect(masterGain);
      osc2.start(t0);
      osc2.stop(t0 + 1.35);
    } else if (marque === "ferrari") {
      // FERRARI V12: High-pitch screaming F1 V12 + metallic open-gated clack
      // Metallic shifter click
      const clackOsc = ctx.createOscillator();
      clackOsc.type = "sine";
      clackOsc.frequency.setValueAtTime(2800, t0 + 0.05);
      clackOsc.frequency.exponentialRampToValueAtTime(4200, t0 + 0.12);
      const clackGain = ctx.createGain();
      clackGain.gain.setValueAtTime(0.4, t0 + 0.05);
      clackGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.18);
      clackOsc.connect(clackGain);
      clackGain.connect(masterGain);
      clackOsc.start(t0 + 0.05);
      clackOsc.stop(t0 + 0.2);

      // High soprano V12 scream
      const v12Osc = ctx.createOscillator();
      v12Osc.type = "sawtooth";
      v12Osc.frequency.setValueAtTime(240, t0);
      v12Osc.frequency.exponentialRampToValueAtTime(680, t0 + 0.55);
      v12Osc.frequency.exponentialRampToValueAtTime(450, t0 + 1.25);
      v12Osc.connect(masterGain);
      v12Osc.start(t0);
      v12Osc.stop(t0 + 1.35);

      const harmonic = ctx.createOscillator();
      harmonic.type = "triangle";
      harmonic.frequency.setValueAtTime(480, t0);
      harmonic.frequency.exponentialRampToValueAtTime(1360, t0 + 0.55);
      harmonic.frequency.exponentialRampToValueAtTime(900, t0 + 1.25);
      harmonic.connect(masterGain);
      harmonic.start(t0);
      harmonic.stop(t0 + 1.35);
    } else {
      // BUGATTI CHIRON W16: Deep menacing sub-bass growl + DSG shift pop & turbo blowoff
      const w16Bass = ctx.createOscillator();
      w16Bass.type = "sawtooth";
      w16Bass.frequency.setValueAtTime(55, t0);
      w16Bass.frequency.exponentialRampToValueAtTime(130, t0 + 0.58);
      w16Bass.frequency.exponentialRampToValueAtTime(80, t0 + 1.3);
      w16Bass.connect(masterGain);
      w16Bass.start(t0);
      w16Bass.stop(t0 + 1.4);

      // Sub-harmonic
      const subBass = ctx.createOscillator();
      subBass.type = "triangle";
      subBass.frequency.setValueAtTime(35, t0);
      subBass.frequency.exponentialRampToValueAtTime(75, t0 + 0.58);
      subBass.frequency.exponentialRampToValueAtTime(50, t0 + 1.3);
      subBass.connect(masterGain);
      subBass.start(t0);
      subBass.stop(t0 + 1.4);

      // DSG Shift Bang at t=0.55
      const bangBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
      const data = bangBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const bangSource = ctx.createBufferSource();
      bangSource.buffer = bangBuffer;
      const bangGain = ctx.createGain();
      bangGain.gain.setValueAtTime(0.5, t0 + 0.52);
      bangGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.67);
      bangSource.connect(bangGain);
      bangGain.connect(masterGain);
      bangSource.start(t0 + 0.52);
      bangSource.stop(t0 + 0.7);
    }
  } catch (e) {
    console.warn("Web Audio synthesis error:", e);
  }
}
