import { Font, Texture } from "../(types)/three";
import * as THREE from "three";
import { CreateParticles } from "./CreateParticules";
import { CONFIG } from "./config";

export class Environment {
  threeText: string;
  xOffset: number;
  yOffset: number;
  textSize: number;
  font: Font;
  particle: Texture;
  container: HTMLElement;
  scene: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  createParticles: any;
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  config = CONFIG;

  constructor(
    font: Font,
    particle: Texture,
    container: HTMLElement,
    threeText: string,
    xOffset: number,
    yOffset: number,
    textSize: number
  ) {
    this.font = font;
    this.threeText = threeText;
    this.xOffset = xOffset;
    this.yOffset = yOffset;
    this.textSize = textSize;
    this.particle = particle;
    this.container = container;
    this.scene = new THREE.Scene();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-200, 200);

    this.createCamera();
    this.createRenderer();
    this.setup();
    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener("resize", this.onWindowResize.bind(this));
  }

  setup() {
    this.createParticles = new CreateParticles(
      this.scene,
      this.font,
      this.particle,
      this.camera,
      this.renderer,
      this.threeText,
      this.xOffset,
      this.yOffset,
      this.textSize,
      this.config
    );
  }

  render() {
    if (this.createParticles) {
      this.createParticles.render();
    }
    this.renderer.render(this.scene, this.camera);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      65,
      this.container.clientWidth / this.container.clientHeight,
      1,
      10000
    );
    this.camera.position.set(0, 0, 100);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.renderer.setAnimationLoop(() => {
      this.render();
    });
  }

  onWindowResize() {
    this.camera.aspect =
      this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
  }

  dispose() {
    // Remove event listeners
    window.removeEventListener("resize", this.onWindowResize.bind(this));

    // Dispose of Three.js objects
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.scene) {
      this.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          } else if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          }
        }
      });
    }
    if (this.createParticles) {
      this.createParticles.dispose();
    }
  }
}
