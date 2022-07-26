/* eslint-disable class-methods-use-this */
// there is an error: "Layout width error: Parent=GridSizer, Child=Label"
// in original code from RexUI "https://codepen.io/rexrainbow/pen/YMyBom?editors=0010"
// there is a similar error appears: "Layout height error: Parent=y, Child=k"

class R_UI {
  createPanel(scene, data) {
    const sizer = scene.rexUI.add.sizer({
      orientation: 'y',
      space: { item: 10 },
    })
      .add(
        this.createTable(scene, data, 'artworks', 1), // child
        { expand: true }, // the black border in the Table
      );
    return sizer;
  }

  createTable(scene, data, key, columns) {
    const items = data[key];
    const rows = Math.ceil(items.length / columns);
    const table = scene.rexUI.add.gridSizer({
      column: columns,
      row: rows,

      columnProportions: 1,
      space: { column: 10, row: 10 },
      name: key, // Search this name to get table back
    });

    let item; let r; let
      c;
    const iconSize = (columns === 1) ? 80 : 40;
    for (let i = 0; i < items.length; i += 1) {
      item = items[i];
      c = i % columns;
      r = (i - c) / columns;
      table.add(
        this.createIcon(scene, item, iconSize, iconSize),
        c,
        r,
        'top',
        5, // distance between artworks
        true,
      );
    }

    return scene.rexUI.add.sizer({
      orientation: 'y',
      space: {
        left: 10, right: 10, top: 10, bottom: 10, item: 10,
      },
    })
      .addBackground(
        scene.rexUI.add.roundRectangle(0, 0, 0, 0, 0, undefined).setStrokeStyle(4, 0x000000, 1),
      )
      .add(
        table, // child
        1, // proportion
        'center', // align
        0, // paddingConfig
        true, // expand
      );
  }

  createIcon(scene, item) {
    const label = scene.rexUI.add.label({
      orientation: 'y',
      // icon: scene.rexUI.add.roundRectangle(0, 0, iconWidth, iconHeight, 5, COLOR_LIGHT),
      icon: scene.add.image(0, 0, item.name),

      space: { icon: 3 },
    });

    return label;
  }
}

export default new R_UI();
