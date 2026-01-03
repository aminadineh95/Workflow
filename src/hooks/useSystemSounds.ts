import { useCallback, useEffect, useState } from 'react';

type SoundType = 
  | 'startup'
  | 'shutdown'
  | 'error'
  | 'notification'
  | 'click'
  | 'minimize'
  | 'maximize'
  | 'close'
  | 'open'
  | 'recycle'
  | 'empty-recycle'
  | 'login'
  | 'logout'
  | 'message'
  | 'email';

const SETTINGS_KEY = 'workflow-os-sound-settings';

interface SoundSettings {
  enabled: boolean;
  volume: number;
}

// AudioContext for generating sounds
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Sound generation functions using Web Audio API
const sounds: Record<SoundType, (volume: number) => void> = {
  startup: (volume) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Ascending chord
    [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.1 * volume, now + i * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.5);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.5);
    });
  },
  
  shutdown: (volume) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Descending chord
    [523.25, 392.00, 329.63, 261.63].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.1 * volume, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.4);
    });
  },
  
  error: (volume) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.setValueAtTime(300, now + 0.1);
    osc.type = 'square';
    gain.gain.setValueAtTime(0.08 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  },
  
  notification: (volume) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    [880, 1100].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.08 * volume, now + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.15);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.15);
    });
  },
  
  click: (volume) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1000;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.05 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.start(now);
    osc.stop(now + 0.03);
  },
  
  minimize: (volume) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.06 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  },
  
  maximize: (volume) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.06 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  },
  
  close: (volume) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.05 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  },
  
  open: (volume) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.05 * volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  },
  
  recycle: (volume) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Paper crumple sound simulation
    [200, 150, 100].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.03 * volume, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.05);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.05);
    });
  },
  
  'empty-recycle': (volume) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Whoosh sound
    const noise = ctx.createOscillator();
    const noiseGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    noise.type = 'sawtooth';
    noise.frequency.setValueAtTime(100, now);
    noise.frequency.exponentialRampToValueAtTime(50, now + 0.3);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.3);
    
    noiseGain.gain.setValueAtTime(0.08 * volume, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    noise.start(now);
    noise.stop(now + 0.3);
  },
  
  login: (volume) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Welcoming chime
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.08 * volume, now + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.3);
    });
  },
  
  logout: (volume) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    [783.99, 659.25, 523.25].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.07 * volume, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.25);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.25);
    });
  },
  
  message: (volume) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    [1046.50, 1318.51].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, now + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.06 * volume, now + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.12);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.12);
    });
  },
  
  email: (volume) => {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Email swoosh sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.2);
    osc.type = 'sine';
    
    filter.type = 'lowpass';
    filter.frequency.value = 3000;
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.07 * volume, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc.start(now);
    osc.stop(now + 0.2);
  },
};

export function useSystemSounds() {
  const [settings, setSettings] = useState<SoundSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      return stored ? JSON.parse(stored) : { enabled: true, volume: 0.5 };
    } catch {
      return { enabled: true, volume: 0.5 };
    }
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const playSound = useCallback((type: SoundType) => {
    if (!settings.enabled) return;
    
    try {
      // Ensure AudioContext is resumed (required after user interaction)
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      sounds[type](settings.volume);
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  }, [settings.enabled, settings.volume]);

  const setEnabled = useCallback((enabled: boolean) => {
    setSettings(prev => ({ ...prev, enabled }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  return {
    playSound,
    enabled: settings.enabled,
    volume: settings.volume,
    setEnabled,
    setVolume,
  };
}
