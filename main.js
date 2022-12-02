import Phaser, {Game} from "phaser";

let config = {
  type: Phaser.AUTO,
  width: 1290,
  height: 640,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y:300 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
}

let platforms
let player
let cursors
let lollipops
let lollipop
let bombs
let enemies
let scoreText
let score = 0
let gameOver = false
let lollipopCollect
let killEnemy
let bombRelease
let gameOverSound
let gameSound

let musicConfig = {
  mute: false,
  volume: 0.3,
  rate: 1,
  dectune: 0,
  seek: 0,
  loop: true,
  delay: 0
}


const newGame = new Game(config) 
function preload () {
  this.load.image('sky', './assets/sky.png'),
  this.load.image('floor', './assets/floor.png')
  this.load.image('trees', './assets/trees.png')
  this.load.image('rocks', './assets/rocks.png')
  this.load.image('bomb', './assets/bomb.png')
  this.load.image('enemy', './assets/enemy.png')
  this.load.image('gameover', './assets/gameover.png')
  this.load.image('lollipop', './assets/lollipop.png')
  this.load.spritesheet('character', './assets/girl.png', {
    frameWidth: 370,
    frameHeight: 480
  },
  this.load.audio('coins', './assets/coinsound.wav'),
  this.load.audio('gamesound', './assets/gamesound.ogg')
)};



function create() {
  this.add.image(650, 300, 'sky').setScale(0.7)
  this.add.image(650, 300, 'rocks').setScale(0.7)
  

  platforms = this.physics.add.staticGroup()
  
  platforms.create(650, 244, 'floor').setScale(0.2).refreshBody()
  
  this.add.image(650, 284, 'trees').setScale(0.6)

  platforms.create(350, 550, 'floor')
  platforms.create(1050, 154, 'floor').setScale(0.15).refreshBody()
  
  cursors = this.input.keyboard.createCursorKeys()
  this.gameSound = this.sound.add('gamesound')
  // this.gameSound.loop = false

  player = this.physics.add.sprite(90, 364, 'character').setScale(0.15).refreshBody()
  player.setBounce(0.2)
  player.setCollideWorldBounds(true)

  

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('character', {start: 0, end: 4}),
    frameRate: 10,
    repeat: -1
  })
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('character', {start: 4, end: 0}),
    frameRate: 10,
    repeat: -1
  })
  this.anims.create({
    key: 'turn',
    frames: [ { key: 'character', frame: 3}],
    frameRate: 20
  })

  this.physics.add.collider(player, platforms, function (player, platforms) {
    if (player.body.touching.up && platforms.body.touching.down) {
      createLollipop (
        player.body.center.x,
        platforms.body.top - 16,
        player.body.velocity.x,
        player.body.velocity.y * -3,
        
      )
    }
  })

  lollipops = this.physics.add.group({
    key: 'lollipop',
    repeat: 11,
    setXY: { x: 20, y: 0, stepX: 100 }
  })
  

  lollipops.children.iterate(function(child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
  })

  function createLollipop (x, y, vx, vy) {
    lollipop = lollipops.get()
    if (!lollipop) return
    lollipop
    .enableBody(true, x, y, true, true)
    .setVelocity(vx, vy)
  }

  this.physics.add.collider(lollipops, platforms)
  this.physics.add.overlap(player, lollipops, collectLollipop, null, this)

  scoreText = this.add.text(16, 16, 'Score 0', { fontSize: '32px', fill: '#000' })
  

  function collectLollipop (player, lollipop) {
    lollipop.disableBody(true, true)

      score += 5
      scoreText.setText('Score: ' + score)
      lollipopCollect

      if(lollipops.countActive(true) === 0) {
        lollipops.children.iterate(function(child) {
          child.enableBody(true, child.x, 0, true, true)
        } 
    ) 

    let x = (player.x < 650) ? Phaser.Math.Between(650, 1290) : Phaser.Math.Between(0, 650)
      
    let bomb = bombs.create(x, 10, 'bomb')
    bomb.setBounce(1)
    bomb.setCollideWorldBounds(true)
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)

    let enemy = enemies.create(x, 16, 'enemy')
    enemy.setCollideWorldBounds(true)
    enemy.setVelocity(Phaser.Math.Between(-200, 200), 20)
    enemy.body.velocity.x * 3
    enemy.setScale(0.2)
    enemy.setBounceX(1)
  }
    
  }

  enemies = this.physics.add.group()
  this.physics.add.collider(enemies, platforms)
  this.physics.add.collider(player, enemies, bounceEnemy, null, this)  

  bombs = this.physics.add.group()
  this.physics.add.collider(bombs, platforms)
  this.physics.add.collider(player, bombs, hitBomb, null, this)

  function hitBomb (player, bomb) {
    this.physics.pause()
    player.setTint(0xFF00FF)
    player.anims.play('turn')
    gameOver = true
    this.add.image(650, 200, 'gameover')
  }

  function bounceEnemy (player, enemies) {
    if (player.body.touching.down && enemies.body.touching.up) {
      // player.setTint(0x0000FF)
      enemies.destroy()
    } else if (player.body.touching.left || player.body.touching.right) {
      this.physics.pause()
      gameOver = true
      this.add.image(650, 200, 'gameover')
    } 
      
  };
}

function update() {
  if (gameOver) {
    return 
  }


  if (cursors.left.isDown) {
    player.setVelocityX(-160)
    player.flipX = true
    player.anims.play('left', true)
  } 
    else if (cursors.right.isDown) {
    player.setVelocityX(160)
    player.flipX = false
    player.anims.play('right', true)
  } 
    else {
    player.setVelocityX(0)
    player.anims.play('turn')
  }
  

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-450)
  }

  // this.gameSound.play(musicConfig)

  
}
  
 
