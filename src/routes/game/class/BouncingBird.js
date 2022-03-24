class BouncingBird {
  constructor() {}

  generate(scene, birdX, birdY, birdScale) {

    const container = scene.add.container();
    const leg1 = scene.add.isobox(415, 340, 10, 50, 0xffe31f, 0xf2a022, 0xf8d80b);
    const leg2 = scene.add.isobox(390, 350, 10, 50, 0xffe31f, 0xf2a022, 0xf8d80b);
    const body1 = scene.add.isobox(360, 288, 50, 22, 0x00b9f2, 0x016fce, 0x028fdf);
    const body2 = scene.add.isobox(400, 300, 80, 80, 0x00b9f2, 0x016fce, 0x028fdf);
    const beak = scene.add.isobox(430, 270, 40, 10, 0xffe31f, 0xf2a022, 0xf8d80b);
    const eye = scene.add.isobox(394, 255, 30, 15, 0xffffff, 0xffffff, 0xffffff).setFaces(false, true, false);
    const pupil = scene.add.isobox(391, 255, 15, 10, 0x000000, 0x000000, 0x000000).setFaces(false, true, false);
    const wing = scene.add.isobox(366, 300, 50, 10, 0x00b9f2, 0x016fce, 0x028fdf);
    container.add([leg1, leg2, body1, body2, beak, eye, pupil, wing]);
    container.x = birdX;
    container.y = birdY;
    container.setScale(birdScale);

    scene.tweens.add({
      targets: container,
      y: '-=160',
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }
}

export default new BouncingBird()