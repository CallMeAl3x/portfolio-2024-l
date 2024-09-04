export const CONFIG = {
  particleSize: 1,
  textColor: "#ffffff",
  particleColor: 0xe15b5b,
  particleAmount: 1400,
  area: 250,
  ease: 0.05,
  fontPath: (font: string) =>
    `/fonts/${font}/${font}_Regular_Spaced_Lined.json`,
  particleTexturePath: "/images/particules_white.png",
  cameraFOV: 65,
  cameraNear: 0,
  cameraFar: 10000,
  cameraPosition: [0, 0, 100] as [number, number, number],
};

export type Config = typeof CONFIG;
