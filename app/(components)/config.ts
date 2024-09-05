export const CONFIG = {
  particleSize: 1, // Taille des particules
  textColor: "#ffffff", // Couleur du texte
  particleColor: 0xe15b5b, // Couleur des particules derrière le texte
  particleAmount: 1400, // Nombre de particules
  absorptionSpeed: 5, // Augmenter cette valeur pour accélérer l'absorption des particules
  area: 250, // Taille du rond autour de la souris qui vas attirer les particules
  ease: 0.05, // Vitesse de déplacement des particules
};

export type Config = typeof CONFIG;
