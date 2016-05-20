window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function ( /* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

function GameEngine(context) {
    this.ctx = context;
    this.gameOver = false;
    this.winnerSide = null;
    this.paddleRight = false;
    this.paddleLeft = false;
    this.userPaddle = null;
    this.aIPaddle = null;
    this.ball = null;
    this.userBricks = [];
    this.aIBricks = [];
    this.rowCount = 5;
    this.columnCount = 12;
    this.topBrickCount = 0;
    this.bottomBrickCount = 0;
}

GameEngine.prototype.init = function () {
    this.startInput();
    this.generateBricks();
    this.generatePaddles();
    this.generateBall();
}

GameEngine.prototype.ready = function () {
    var countDownTime = COUNT_DOWN_SECONDS;
    var that = this;
    var context = this.ctx;
    var countDown = window.setInterval(function() {
        if (countDownTime === 0) {
            clearInterval(countDown);
            startSound.play();
            that.start();
        } else {
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
            that.draw();
            context.beginPath();
            context.font = "bold 100px Arial";
            context.fillStyle = "#64FFDA";
            context.fillText(countDownTime, context.canvas.width / 2 - 20, context.canvas.height / 2 + 30);
            context.closePath();
            tickSound.play();
            countDownTime--;
        }
    }, 1000);
}

GameEngine.prototype.start = function () {
    var that = this;
    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

GameEngine.prototype.generateBall = function () {
    var newBall = new Ball(this, "#FFFFEE");
    newBall.x = this.ctx.canvas.width / 2;
    if (Math.random() < 0.5) {
        newBall.y = this.ctx.canvas.height - 50;
    } else {
        newBall.y = 50;
    }
    this.ball = newBall;
}

GameEngine.prototype.generatePaddles = function () {
    var newUserPaddle = new Paddle(this, "#3399FF", ONLY_AI, "bottom");
    newUserPaddle.x = (this.ctx.canvas.width - newUserPaddle.width) / 2;
    newUserPaddle.y = this.ctx.canvas.height - (newUserPaddle.height * 2);
    this.userPaddle = newUserPaddle;

    var newAIPaddle = new Paddle(this, "#c01b67", true, "top");
    newAIPaddle.x = (this.ctx.canvas.width - newAIPaddle.width) / 2;
    newAIPaddle.y = newAIPaddle.height;
    this.aIPaddle = newAIPaddle;
}

GameEngine.prototype.generateBricks = function() {
    var halfCanvasHeight = this.ctx.canvas.height / 2;
    var halfCanvasMargin = 20;
    var leftOffset = 85;
    for (var i = 0; i < this.rowCount; i++) {
        this.userBricks[i] = [];
        this.aIBricks[i] = [];
        for (var j = 0; j < this.columnCount; j += 2) {
            // create user bricks
            var newUserBrick = new Brick(this, false, "#00B8D4", "bottom");
            newUserBrick.x = (newUserBrick.width + newUserBrick.padding) * j + leftOffset;
            newUserBrick.y = halfCanvasHeight + halfCanvasMargin + (newUserBrick.height + newUserBrick.padding) * i;
            this.userBricks[i][j] = newUserBrick;
            this.bottomBrickCount++;

            // create AI bricks
            var newAIBrick = new Brick(this, false, "#F08080", "top");
            newAIBrick.x = (newAIBrick.width + newAIBrick.padding) * j + leftOffset;
            newAIBrick.y = + halfCanvasHeight - halfCanvasMargin - (newAIBrick.height + newAIBrick.padding) * i;
            this.aIBricks[i][j] = newAIBrick;
            this.topBrickCount++;
        }
    }
}

GameEngine.prototype.startInput = function () {
    var that = this;
    this.ctx.canvas.addEventListener("keydown", function (e) {
        if (e.keyCode == 39) {
            that.paddleRight = true;
        }

        if (e.keyCode == 37) {
            that.paddleLeft = true;
        }
    }, false);

    this.ctx.canvas.addEventListener("keyup", function (e) {
        if (e.keyCode == 39) {
            that.paddleRight = false;
        }

        if (e.keyCode == 37) {
            that.paddleLeft = false;
        }
    }, false);
}

GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();

    // display paddle
    this.userPaddle.draw();
    this.aIPaddle.draw();

    // display bricks 
    for (var i = 0; i < this.rowCount; i++) {
        for (var j = 0; j < this.columnCount; j += 2) {
          if (!this.userBricks[i][j].destroyed) {
            this.userBricks[i][j].draw();
          }
          if (!this.aIBricks[i][j].destroyed) {
            this.aIBricks[i][j].draw();
          }
        }
    }    

    // display ball
    this.ball.draw();

    // display game over
    if (this.gameOver) {
        var context = this.ctx;
        context.beginPath();
        context.font = "bold 30px Arial";
        context.fillStyle = "#64FFDA";
        context.fillText("Game Over - " + this.winnerSide + " Side Won!", context.canvas.width / 2 - 150, context.canvas.height / 2);
        context.closePath();
    }

    this.ctx.restore();

}

GameEngine.prototype.update = function () {
        this.userPaddle.isAI = ONLY_AI;
        this.userPaddle.update();
        this.aIPaddle.update();

        // update bricks
        for (var i = 0; i < this.rowCount; i++) {
            for (var j = 0; j < this.columnCount; j += 2) {
              if (!this.userBricks[i][j].destroyed) {
                this.userBricks[i][j].update();
              }
              if (!this.aIBricks[i][j].destroyed) {
                this.aIBricks[i][j].update();
              }
            }
        }    

        this.ball.update();
}

GameEngine.prototype.loop = function () {
    if (!this.gameOver) {
        this.update();
        this.draw();
        if (this.gameOver) {
            gameOverSound.play();
        }
    }
}
