var game = new Phaser.Game(800, 600, Phaser.AUTO, null, {
    preload: preload, create: create, update: update
});

var gravity = 200;
var ball;
var ballVelocityX = -75;
var ballVelocityY = -300;
var paddle;
var bricks;
var newBrick;
var brickRows = 4;
var brickCols = 12;
var brickInfo;
var scoreText;
var score = 0;
var lives = 3;
var livesText;
var lifeLostText;
var textStyle = { font: '18px Arial', fill: '#0095DD' };
var playing = false;
var startButton;

var ballOnPaddle = true;

function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.stage.backgroundColor = '#eee';
    game.load.image('ball', 'assets/img/ballgrey.png');
    game.load.image('paddle', 'assets/img/paddleBlu.png');
    game.load.image('brickRed', 'assets/img/element_red_rectangle.png');
}

function create() {
    //  Enable P2 physics
    game.physics.startSystem(Phaser.Physics.P2JS);
    
    game.physics.p2.gravity.y = gravity;
    
    paddle = game.add.sprite(game.world.width*0.5, game.world.height-30, 'paddle');
    game.physics.p2.enable(paddle);
    
    // create world material to collide with
    var worldMaterial = game.physics.p2.createMaterial('worldMaterial');
    //  4 trues = the 4 faces of the world in left, right, top, bottom order
    game.physics.p2.setWorldMaterial(worldMaterial, true, true, true, false);

    var paddleMaterial = game.physics.p2.createMaterial('paddleMaterial', paddle.body);
    
    //  Here is the contact material. It's a combination of 2 materials, so whenever shapes with
    //  those 2 materials collide it uses the following settings.
    //  A single material can be used by as many different sprites as you like.
    var contactMaterialPaddle = game.physics.p2.createContactMaterial(paddleMaterial, worldMaterial);


    
    //  Turn on impact events for the world, without this we get no collision callbacks
    //game.physics.p2.setImpactEvents(true);
    
    // create paddle
    
    //paddle.anchor.set(0.5, 1);
    //paddle.body.collideWorldBounds = true;
    //paddle.body.bounce.set(1);
    //paddle.body.immovable = true;
    
    // create ball
    /*
    ball = game.add.sprite(game.world.width*0.5, 0, 'ball');
    ball.anchor.set(0.5,0.5);
    ball.y = game.world.height - paddle.height - 20 - ball.height / 2;
    ball.animations.add('wobble', [0,1,0,2,0,1,0,2,0], 24);
    game.physics.enable(ball, Phaser.Physics.ARCADE);
    ball.body.collideWorldBounds = true;
    game.physics.arcade.checkCollision.down = false;
    ball.body.bounce.set(1);
    ball.checkWorldBounds = true;
    ball.events.onOutOfBounds.add(ballLeaveScreen, this);
    */
    
//    initBricks();
//    scoreText = game.add.text(5, 5, 'Points: 0', textStyle);
//    livesText = game.add.text(game.world.width-5, 5, 'Lives: '+lives, textStyle);
//    livesText.anchor.set(1,0);
//    
//    introText = game.add.text(game.world.centerX, 400, '- click to start -', { font: "40px Arial", fill: "#ffffff", align: "center" });
//    introText.anchor.setTo(0.5, 0.5);
//    
//    game.input.onDown.add(releaseBall, this);
}

function update() {
    paddle.x = game.input.x;
    if(paddle.x > game.width - paddle.width / 2) {
        paddle.x = game.width - paddle.width / 2;
    } 
    else if(paddle.x < paddle.width / 2) {
        paddle.x = paddle.width / 2;
    }
    
    if (ballOnPaddle) {
        ball.body.x = paddle.x;
    } else {
        game.physics.arcade.collide(ball, paddle, ballHitPaddle, null, this);
        game.physics.arcade.collide(ball, bricks, ballHitBrick, null, this);
    }
}

function releaseBall () {
    if (ballOnPaddle) {
        ballOnPaddle = false;
        ball.body.velocity.x = ballVelocityX;
        ball.body.velocity.y = ballVelocityY;
    }
    introText.visible = false;
}


function initBricks() {
    brickWidth = 50;
    brickHeight = 20;
    brickPadding = 5;
    brickLeftOffset = (game.width - brickCols * brickWidth - (brickCols - 1) * brickPadding) / 2 + brickWidth / 2;
    brickInfo = {
        width: brickWidth,
        height: brickHeight,
        count: {
            row: brickRows,
            col: brickCols
        },
        offset: {
            top: 80,
            left: brickLeftOffset,
            row: 30
        },
        padding: brickPadding
    }
    bricks = game.add.group();
    for(c=0; c < brickInfo.count.col; c++) {
        for(r=0; r < brickInfo.count.row; r++) {
            var brickX = (c * (brickInfo.width + brickInfo.padding)) + brickInfo.offset.left;
            var brickY = (r * (brickInfo.height + brickInfo.padding)) + brickInfo.offset.top + brickInfo.offset.row * r;
            newBrick = game.add.sprite(brickX, brickY, 'brick');
            game.physics.enable(newBrick, Phaser.Physics.ARCADE);
            newBrick.body.immovable = true;
            newBrick.anchor.set(0.5);
            bricks.add(newBrick);
        }
    }
}

function ballHitBrick(ball, brick) {
    brick.kill();
    score += 10;
    scoreText.setText('Points: '+score);

    if(score === brickInfo.count.row*brickInfo.count.col*10) {
        alert('You won the game, congratulations!');
        location.reload();
    }
}

function ballLeaveScreen() {
    lives--;
    if(lives) {
        livesText.setText('Lives: '+lives);
        ballOnPaddle = true;
        ball.reset(paddle.body.x, paddle.y - paddle.height - ball.height / 2);
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
    ball.body.velocity.set(ballVelocityX, ballVelocityY);
    playing = true;
}