// GAME SETTING
var ONLY_AI = true;
var BALL_SPEED = 11;
var PADDLE_SPEED = 12;
var BRICK_SPEED = 2;
var COUNT_DOWN_SECONDS = 5;
var paddleCollideSound = new Audio("sound/paddle_collide.wav");
var brickCollideSound = new Audio("sound/brick_collide.wav");
var gameOverSound = new Audio("sound/game_over.wav");
var tickSound = new Audio("sound/tick.wav")
var startSound = new Audio("sound/start.wav")



function startGame() {
	var context = document.getElementById("myGameWorld").getContext("2d");
    var gameEngine = new GameEngine(context);
    gameEngine.init();
    gameEngine.ready();
}

function Brick(game, destroyed, color, brickSide, x, y) {
    this.game = game;
    this.ctx = game.ctx;
    this.brickSide = brickSide;
    this.destroyed = destroyed;
    this.color = color;
    this.x = x;
    this.y = y;
    this.width = 80;
    this.height = 15;
    this.padding = 35;
}

Brick.prototype.draw = function () {
    var context = this.ctx;
    context.beginPath();
    context.rect(this.x, this.y, this.width, this.height);
    context.fillStyle = this.color;
    context.fill();
    context.closePath();
}

Brick.prototype.update = function() {
	// move bricks
	if (this.brickSide == "top") {
	    this.x += BRICK_SPEED;
	    if (this.x > this.ctx.canvas.width + this.width) {
	    	this.x = -this.width;
	    }
	} else {
		this.x -= BRICK_SPEED;
		if (this.x < 0 - this.width) {
			this.x = this.ctx.canvas.width + this.width;
		}
	}

    // check collision with ball
    var radius = this.game.ball.radius;
    if (this.game.ball.x + radius > this.x
        && this.game.ball.x + radius < this.x + this.width + this.padding
        && this.game.ball.y + radius > this.y
        && this.game.ball.y + radius < this.y + this.height + this.padding) {
        this.game.ball.dy = -this.game.ball.dy;
        this.destroyed = true;
        brickCollideSound.play();
        if (this.brickSide === "top") {
            this.game.topBrickCount--;
        } else {
            this.game.bottomBrickCount--;
        }
        if (this.game.topBrickCount == 0) {
            this.game.gameOver = true;
            this.game.winnerSide = "Top";
        } else if (this.game.bottomBrickCount == 0) {
            this.game.gameOver = true;
            this.game.winnerSide = "Bottom";
        }
    }
}

function Paddle(game, color, isAI, paddleSide) {
    this.game = game;
    this.ctx = game.ctx;
    this.color = color;
    this.paddleSide = paddleSide;
    this.isAI = isAI;
    // if (isAI) {
    //     this.speed = 7;
    // } else {
    //     this.speed = 7;
    // }   
    // this.speed = PADDLE_SPEED;
    this.width = 100;
    this.height = 15;
    this.x = 0;
    this.y = 0;
}

Paddle.prototype.draw = function () {
    var context = this.ctx;
    context.beginPath();
    context.rect(this.x, this.y, this.width, this.height);
    context.fillStyle = this.color;
    context.fill();
    context.closePath();
}

Paddle.prototype.update = function() {
    var canvasWidth = this.ctx.canvas.width;
    var canvasHeight = this.ctx.canvas.height;
    var currentBallX = this.game.ball.x;
    var currentBallY = this.game.ball.y;
    var radius = this.game.ball.radius;
    if (!this.isAI) {
        if (this.game.paddleLeft && (this.x - PADDLE_SPEED) >= 0) {
            this.x -= PADDLE_SPEED;
        } 

        if (this.game.paddleRight && (this.x + this.width + PADDLE_SPEED) <= canvasWidth) {
            this.x += PADDLE_SPEED;
        }
    } else {
        // var relativeHitDistance = radius * (5 / 3);
        // var relativeHitDistance = this.width * (1 / 10);
        var relativeHitDistance = this.width * (Math.random() * ((3 / 7) - (1 / 15)) +  (1 / 15)); // 1/15 to 3/7
        var relativeMoveHeight = canvasHeight / 5;
        if (currentBallY > canvasHeight / 2 - relativeMoveHeight && this.paddleSide === "bottom") {
            if (currentBallX  + relativeHitDistance < this.x + (this.width / 2) && (this.x - PADDLE_SPEED) >= 0) {
                this.x -= PADDLE_SPEED;
            }

            if (currentBallX - relativeHitDistance > this.x + (this.width / 2) && (this.x + this.width + PADDLE_SPEED) <= canvasWidth) {
                this.x += PADDLE_SPEED;
            }
        } else if (currentBallY < canvasHeight / 2 + relativeMoveHeight && this.paddleSide === "top") {
            if (currentBallX + relativeHitDistance < this.x + (this.width / 2) && (this.x - PADDLE_SPEED) >= 0) {
                this.x -= PADDLE_SPEED;
            }

            if (currentBallX - relativeHitDistance > this.x + (this.width / 2) && (this.x + this.width + PADDLE_SPEED) <= canvasWidth) {
                this.x += PADDLE_SPEED;
            }  
        }
    }

    // check collision with ball on paddle
    var reverseCoefficient = -1;
    if (this.paddleSide === "top") {
        radius = -radius;
        reverseCoefficient = 1;
    }
    if (this.game.ball.x + radius > this.x 
        && this.game.ball.x + radius < this.x + this.width
        && this.game.ball.y + radius > this.y
        && this.game.ball.y + radius < this.y + this.height) {
        // thanks to stackexchange for the calculate rebounce explanation
        // http://gamedev.stackexchange.com/questions/4253/in-pong-how-do-you-calculate-the-balls-direction-when-it-bounces-off-the-paddle 
        var relativeCollisionX = ((this.x + (this.width / 2)) - this.game.ball.x) * reverseCoefficient; // **
        var collisionX = (relativeCollisionX / (this.width / 2));
        var bounceAngle = collisionX * (5 * Math.PI / 12);
        this.game.ball.dx = BALL_SPEED * Math.sin(bounceAngle) * reverseCoefficient;
        this.game.ball.dy = BALL_SPEED * Math.cos(bounceAngle) * reverseCoefficient;
        paddleCollideSound.play();
    }
}

function Ball(game, color) {
    this.game = game;
    this.ctx = game.ctx;
    this.color = color;
    this.radius = 10;
    // this.speed = BALL_SPEED;
    this.dx = Math.random() * (7 - (-7)) - 7; // -7 to 7
    this.dy = BALL_SPEED;
    this.x = 0;
    this.y = 0;
}

Ball.prototype.draw = function () {
    var context = this.ctx;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = this.color;
    context.fill();
    context.closePath();
}

Ball.prototype.update = function () {
    var canvasWidth = this.ctx.canvas.width;
    var canvasHeight = this.ctx.canvas.height;

    if (this.y + this.dy < 0) {
        this.game.gameOver = true;
        this.game.winnerSide = "Bottom";
    } else if (this.y + this.dy > canvasHeight) {
        this.game.gameOver = true;
        this.game.winnerSide = "Top";
    }

    if (this.x + this.dx < this.radius || this.x + this.dx > canvasWidth - this.radius) {
        this.dx = -this.dx;
    }
    this.x += this.dx;
    this.y += this.dy;
}

startGame();