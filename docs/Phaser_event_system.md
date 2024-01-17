subscribe to the event:    
`this.events.on('gameEditMode', this.gameEditModeSign, this)`

send the event with arguments:    
`scene.events.emit('gameEditMode', 'off')`

callbackFunction with arguments:    
`gameEditModeSign(arg) {`
   `console.log("gameEditMode received", arg)`
`}`


***

Use case: doubble click -> move player to specific location, an other object should also be able to subscribe on that moveTo

If you move a GameObject with a tween, then the progression of the tween event can be 'read', and calledback.

***

### Scene event senders and listeners

Here is our event listener, the 'handler' function. The 'this' argument is the context.

        this.events.on('chatsubo', this.handler, this)

We'll use the Scenes own EventEmitter to dispatch our event

        this.events.emit('chatsubo')

### Event arguments

The event sends 2 arguments: 200 and 300

    this.events.emit('addImage', 200, 300)

The event handles sends the arguments on to the handler function

```this.events.on('addImage', handler, this)

function handler (x, y)
{
    this.add.image(x, y, 'plush')
}
```

### Create Event Emitter

```
//  Create our own EventEmitter instance
var emitter = new Phaser.Events.EventEmitter();

//  Set-up an event handler
emitter.on('addImage', this.handler, this);

//  Emit it a few times with varying arguments
emitter.emit('addImage', 200, 300);
emitter.emit('addImage', 400, 300);
emitter.emit('addImage', 600, 300);
    }

handler (x, y)
    {
        this.add.image(x, y, 'plush');
    }
```

### Once vs On

This handler will only be called once, no matter how many times the event fires

        this.events.once('addImage', this.handler, this)


***
background info:


[Events dispatch class ](https://www.youtube.com/watch?v=vjlXPXLy5KU&ab_channel=WClarkson)

ONMOVE event example
https://labs.phaser.io/edit.html?src=src/input/game%20object/on%20move%20event.js&v=3.55.2

Object emits event
https://labs.phaser.io/edit.html?src=src/events/listen%20to%20game%20object%20event.js&v=3.55.2

Move gameObject to mouse click ("click to move" movement") using tween
https://stackoverflow.com/questions/69759621/phaser-3-move-gameobject-to-mouse-click-click-to-move-movement-using-twee

https://stackoverflow.com/questions/28522568/how-can-i-get-the-object-on-which-the-tween-in-acting-inside-the-oncomplete-call

Tween handlers
https://rexrainbow.github.io/phaser3-rex-notes/docs/site/tween/#play-task

https://phasergames.com/phaser-3-snippets/phaser-3-tween-snippets/