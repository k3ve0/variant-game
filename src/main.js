import Phaser from 'phaser';
import { SpinePlugin } from '@esotericsoftware/spine-phaser-v4';

const VIEW_W = 720;
const VIEW_H = 1280;

const DEMO_WALK = 'Walk';

class HelloScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HelloScene' });
    this.hero = null;
    this.fallingObjects = null;
    this.cursors = null;
  }

  preload() {
    // ⚠️ FIXED: use relative path (IMPORTANT for deployment)
    this.load.spineJson('man', 'spine/man/skeleton.json');
    this.load.spineAtlas('manAtlas', 'spine/man/skeleton.atlas', true);
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, 20, 'Use arrow keys to move', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // HERO
    this.hero = this.add.spine(width * 0.5, height * 0.75, 'man', 'manAtlas');
    this.hero.setScale(0.28);
    this.hero.animationState.setAnimation(0, DEMO_WALK, true);

    // KEYBOARD INPUT
    this.cursors = this.input.keyboard.createCursorKeys();

    // FALLING OBJECTS
    this.fallingObjects = this.add.group();

    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => this.spawnFallingObject()
    });
  }

  spawnFallingObject() {
    const x = Phaser.Math.Between(100, this.scale.width - 100);
    const obj = this.add.circle(x, -50, 20, 0xff4444);
    this.fallingObjects.add(obj);
  }

  handleHit() {
    this.hero.animationState.setAnimation(0, 'Hit', false);

    this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      'Game Over',
      {
        fontSize: '48px',
        color: '#fff'
      }
    ).setOrigin(0.5);

    this.scene.pause();
  }

  update(_, deltaMs) {
    if (!this.hero || !this.cursors) return;

    const dt = deltaMs / 1000;
    const w = this.scale.width;

    // MOVEMENT
    let dir = 0;

    if (this.cursors.left?.isDown) {
      dir = -1;
      this.hero.skeleton.scaleX = -Math.abs(this.hero.skeleton.scaleX);
    }

    if (this.cursors.right?.isDown) {
      dir = 1;
      this.hero.skeleton.scaleX = Math.abs(this.hero.skeleton.scaleX);
    }

    this.hero.x += dir * 300 * dt;

    // WALL LIMITS
    const margin = 72;

    if (this.hero.x > w - margin) this.hero.x = w - margin;
    if (this.hero.x < margin) this.hero.x = margin;

    // FALLING OBJECTS
    this.fallingObjects.getChildren().forEach((obj) => {
      obj.y += 300 * dt;

      if (obj.y > this.scale.height + 50) {
        obj.destroy();
        return;
      }

      const dx = obj.x - this.hero.x;
      const dy = obj.y - this.hero.y;

      if (Math.hypot(dx, dy) < 50) {
        this.handleHit();
      }
    });
  }
}

const config = {
  type: Phaser.WEBGL,
  parent: 'app',
  width: VIEW_W,
  height: VIEW_H,
  backgroundColor: '#2d2d44',
  scene: [HelloScene],
  plugins: {
    scene: [
      { key: 'SpinePlugin', plugin: SpinePlugin, mapping: 'spine' }
    ]
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);
