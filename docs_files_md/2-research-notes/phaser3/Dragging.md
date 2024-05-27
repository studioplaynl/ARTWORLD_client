## Via general purpose this.input.on(‘drag’

    var container = this.add.container(400, 300, [ bg, text ]);

    container.setSize(bg.width, bg.height);

    container.setInteractive();

    this.input.setDraggable(container);

    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {

    gameObject.x = dragX;
    gameObject.y = dragY;

    });

## 2. Via per object .setInteractive( { draggable: true })

    this.mario_star.setInteractive({ draggable: true })

    this.mario_star.on('dragstart', function (pointer) {
            this.setTint(0xff0000);
        })

    this.mario_star.on('drag', function (pointer, dragX, dragY) {
            this.x = dragX;
            this.y = dragY;
        })

    this.mario_star.on('dragend', function (pointer) {

            this.clearTint();

        })

## 3. Via general input check but with with checking, turning on/off listeners

**[https://www.youtube.com/watch?v=t56DvozbZX4&ab_channel=WClarkson](https://www.youtube.com/watch?v=t56DvozbZX4&ab_channel=WClarkson)**

    var dot = this.add.image(xx, yy, "dot" +i
    dot.setInteractive()
    }
    this.input.on('pointerdown', this.startDrag, this)
    }

    startDrag(pointer, targets){
    this.input.off('pointerdown', this.startDrag, this) // turn off input when there is already a target(!)
    this.dragObj = targets[0] //first gameObject that is hit by the mouse pointer
    this.input.on('pointermove', this.doDrag, this)
    this.input.on('pointerup', this.stopDrag, this)
    }

    doDrag(pointer) {
    this.dragObj.x = pointer.x
    this.dragObj.y = pointer.y
    }

    stopDrag(){
    this.input.on('pointerdown', this.startDrag, this) // turn back on input for pointerdown(!)
    this.input.off('pointermove', this.doDrag, this) // turn off drag
    this.input.off('pointerup', this.stopDrag, this)
    }
