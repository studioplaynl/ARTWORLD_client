We want to get a list of all Network Players. getChildren() can be called

Groups can be used to get the members with getChildren()
Children of the group can’t be moved with the grouping

Containers can be used to move members.

does not work:

- this.getChildren()
- this.scene.getChildren()
- this.Scene.getChildren()
  Works:
- Group.getChildren()

---

```
group.create(400, 300, ‘phaser’);
//  The above is a short-cut for:
//  var sprite = this.add.sprite(400, 300, 'phaser');
//  group.add(sprite);
```

---

Sprite pool example

https://phaser.io/examples/v3/view/game-objects/group/sprite-pool

Group createCallback

```
group = this.add.group({
defaultKey: ‘alien’,
maxSize: 100,
createCallback: function (alien) {
alien.setName(‘alien’ + this.getLength());
console.log(‘Created’, alien.name);
},
removeCallback: function (alien) {
console.log(‘Removed’, alien.name);
}
```

```
this.time.addEvent({
delay: 100,
loop: true,
callback: addAlien
});
```

---

**group.children.iterate**

```
// Find first inactive sprite in group or add new sprite, and set position
const alien = group.get(x, y);
```
