Run a function on a timer, optionally looped

```
timedEvent = this.time.addEvent({ delay: 50, callback: reduceHealth, callbackScope: this, loop: true });
```

Remove the timed event:

```
timedEvent.remove();
```

Pass extra arguments to the timed event:

```
this.time.addEvent({ delay: 2000, callback: this.enterLocationDialogBox, args: [player, location, show], loop: false })
```

standard javascript delay:

```
setTimeout(this.enterLocationDialogBox(player, location, show), 5000);
```

Rex Plugin:
https://rexrainbow.github.io/phaser3-rex-notes/docs/site/timer/
