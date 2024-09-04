"use client";

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { ExtendedFont } from "../(types)/three";
import { CONFIG } from "./config";
import { Environment } from "./Environment";

type Font = ExtendedFont;
type Texture = THREE.Texture;

interface ThreeSceneProps {
  threeText: string;
  xOffset: number;
  yOffset: number;
  textSize: number;
  font: string;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({
  threeText,
  xOffset,
  yOffset,
  textSize,
  font,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const environmentRef = useRef<Environment | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let isMounted = true;

    const loadAssets = async () => {
      if (!containerRef.current || !isMounted) return;
      const fontLoader = new FontLoader();
      const textureLoader = new THREE.TextureLoader();

      try {
        const [loadedFont, particle] = await Promise.all([
          new Promise<Font>((resolve) =>
            fontLoader.load(CONFIG.fontPath(font), (loadedFont) => {
              resolve(loadedFont as unknown as Font);
            })
          ),
          new Promise<Texture>((resolve) =>
            textureLoader.load(CONFIG.particleTexturePath, resolve)
          ),
        ]);

        if (isMounted) {
          if (environmentRef.current) {
            environmentRef.current.dispose();
          }
          environmentRef.current = new Environment(
            loadedFont,
            particle,
            containerRef.current,
            threeText,
            xOffset,
            yOffset,
            textSize
          );

          if (environmentRef.current) {
            // Appliquer l'absorption maximale
            environmentRef.current.createParticles.setMaxAbsorption();

            // Attendre 1 seconde supplémentaire avant de relâcher les particules
            if (environmentRef.current) {
              environmentRef.current.createParticles.releaseParticles();

              // Attendre un peu plus longtemps pour réinitialiser la position de la souris
              environmentRef.current?.createParticles.resetMousePosition();
            }
          }
        }
      } catch (error) {
        console.error("Error loading assets:", error);
      }
    };

    loadAssets();

    return () => {
      isMounted = false;
      if (environmentRef.current) {
        environmentRef.current.dispose();
        environmentRef.current = null;
      }
    };
  }, [threeText, xOffset, yOffset, textSize, font]);

  return <div ref={containerRef} className="magic" />;
};

export default ThreeScene;
