var game = new Phaser.Game(800, 600, Phaser.AUTO, null, {
    preload: preload, create: create, update: update
});

var ball;
var ballVelocity = 300;
var paddle;
var bricks;
var newBrick;
var brickInfo;
var scoreText;
var score = 0;
var lives = 3;
var livesText;
var lifeLostText;
var textStyle = { font: '18px Arial', fill: '#0095DD' };
var playing = false;
var startButton;

function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.stage.backgroundColor = '#eee';
    game.load.image('ball', 'img/ball.png');
    game.load.image('paddle', 'img/paddle.png');
    game.load.image('brick', 'img/brick.png');
    game.load.spritesheet('ball', 'img/wobble.png', 20, 20);
    game.load.spritesheet('button', 'img/button.png', 120, 40);
}

function create() {
    // start physics
    game.physics.startSystem(Phaser.Physics.ARCADE);
    
    // create ball
    ball = game.add.sprite(game.world.width*0.5, game.world.height-25, 'ball');
    ball.animations.add('wobble', [0,1,0,2,0,1,0,2,0], 24);
    game.physics.enable(ball, Phaser.Physics.ARCADE);
    ball.anchor.set(0.5,0.5);
    ball.body.collideWorldBounds = true;
    game.physics.arcade.checkCollision.down = false;
    ball.body.bounce.set(1);
    ball.body.velocity.set(0, 0);
    ball.checkWorldBounds = true;
    ball.events.onOutOfBounds.add(ballLeaveScreen, this);
    
    // create paddle
    paddle = game.add.sprite(game.world.width*0.5, game.world.height-5, 'paddle');
    game.physics.enable(paddle, Phaser.Physics.ARCADE);
    paddle.anchor.set(0.5, 1);
    paddle.body.immovable = true;
    
    initBricks();
    scoreText = game.add.text(5, 5, 'Points: 0', textStyle);
    livesText = game.add.text(game.world.width-5, 5, 'Lives: '+lives, textStyle);
    livesText.anchor.set(1,0);
    lifeLostText = game.add.text(game.world.width*0.5, game.world.height*0.5, 'Life lost, click to continue', textStyle);
    lifeLostText.anchor.set(0.5);
    lifeLostText.visible = false;
    startButton = game.add.button(game.world.width*0.5, game.world.height*0.5, 'button', startGame, this, 1, 0, 2);
    startButton.anchor.set(0.5);
}

function update() {
    game.physics.arcade.collide(ball, paddle, ballHitPaddle);
    game.physics.arcade.collide(ball, bricks, ballHitBrick);
    if(playing) {
        paddle.x = game.input.x || game.world.width*0.5;
    }
}

function initBricks() {
    brickInfo = {
        width: 50,
        height: 20,
        count: {
            row: 10,
            col: 14
        },
        offset: {
            top: 50,
            left: 40
        },
        padding: 5
    }
    bricks = game.add.group();
    for(c=0; c < brickInfo.count.col; c++) {
        for(r=0; r < brickInfo.count.row; r++) {
            var brickX = (c * (brickInfo.width + brickInfo.padding)) + brickInfo.offset.left;
            var brickY = (r * (brickInfo.height + brickInfo.padding)) + brickInfo.offset.top;
            newBrick = game.add.sprite(brickX, brickY, 'brick');
            game.physics.enable(newBrick, Phaser.Physics.ARCADE);
            newBrick.body.immovable = true;
            newBrick.anchor.set(0.5);
            bricks.add(newBrick);
        }
    }
}

function ballHitBrick(ball, brick) {
    var killTween = game.add.tween(brick.scale);
    killTween.to({x:0,y:0}, 200, Phaser.Easing.Linear.None);
    killTween.onComplete.addOnce(function(){
        brick.kill();
    }, this);
    killTween.start();

    score += 10;
    scoreText.setText('Points: '+score);
    if(score === brickInfo.count.row*brickInfo.count.col*10) {
        alert('You won the game, congratulations!');
        location.reload();
    }
}

function ballLeaveScreen() {
    lives--;
    playing: false;
    paddle.x = game.world.width*0.5;
    if(lives) {
        livesText.setText('Lives: '+lives);
        lifeLostText.visible = true;
        ball.reset(game.world.width*0.5, game.world.height-25);
        paddle.reset(game.world.width*0.5, game.world.height-5);
        game.input.onDown.addOnce(function() {
            playing: true;
            lifeLostText.visible = false;
            ball.body.velocity.set(ballVelocity, -ballVelocity);
        }, this);
    }
    else {
        alert('You lost, game over!');
        location.reload();
    }
}

function ballHitPaddle(ball, paddle) {
    ball.animations.play('wobble');
    ball.body.velocity.x = -1*5*(paddle.x-ball.x);
}

function startGame() {
    startButton.destroy();
    ball.body.velocity.set(ballVelocity, -ballVelocity);
    playing = true;
}