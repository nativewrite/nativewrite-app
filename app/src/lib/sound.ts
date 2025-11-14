export const playSound = (file: string, volume = 0.15) => {
  if (typeof window === 'undefined') return;
  const audio = new Audio(`/sounds/${file}`);
  audio.volume = volume;
  audio.play().catch(() => {});
};



