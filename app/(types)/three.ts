import * as THREE from "three";

export interface ExtendedFont extends THREE.BufferGeometry {
  generateShapes(text: string, size: number): THREE.Shape[];
}

export type Font = ExtendedFont;
export type Texture = THREE.Texture;

export interface ThreeSceneProps {
  threeText: string;
  xOffset: number;
  yOffset: number;
  textSize: number;
  font: string;
}
