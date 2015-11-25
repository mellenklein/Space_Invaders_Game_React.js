;(function() {
  var Game = function(canvasId) {
    var canvas = document.getElementById(canvasId); //get the cavas into the game
    var screen = canvas.getContext('2d'); //getting a 'drawing context' -> a bundle of functions you can use to draw on the canvas
    var gameSize = { x: canvas.width, y: canvas.height } //store width/height of canvas for later

    this.bodies = createInvaders(this)
    .concat(new Player(this, gameSize));
    //create array containing all bodies in the game (player, invader, and bullets)
    //for new Player instance, pass in the game and gameSize for correct placement

    var self = this;
    loadSound("shoot.wav", function(shootSound) {
      self.shootSound = shootSound;
      var tick = function()  { //a function to run all the game logic
        self.update(); //contains all the game logic
        self.draw(screen, gameSize); //game is drawn to screen when invoked.
        requestAnimationFrame(tick); //tells browser to run it 60x per second
      };
      tick();
    });
  };

  Game.prototype = {
    update: function() {
      var bodies = this.bodies;
      var notColliding = function(b1) {
        return bodies.filter(function(b2) {
          return colliding(b1, b2); }).length === 0;
        };

      this.bodies = this.bodies.filter(notColliding);

      for (var i = 0; i < this.bodies.length; i++) {
          this.bodies[i].update();
        }
    },

    draw: function(screen, gameSize) { //lets you draw to the screen
      screen.clearRect(0, 0, gameSize.x, gameSize.y);
      for (var i = 0; i < this.bodies.length; i++) { //iterate thru bodies array, and invoke the drawRect function.
        drawRect(screen, this.bodies[i]); //pass in screen to draw to, and current item (either player, invader, or bullets)
      }
    },
    addBody: function(body) { //create an addBody method to add bullets
      this.bodies.push(body);
    },
    invadersBelow: function(invader) {
      return this.bodies.filter(function(b) {
        return b instanceof Invader &&
          b.center.y > invader.center.y &&
          b.center.x - invader.center.x < invader.size.x;
      }).length > 0;
    }
  };

  /////////////////////////////
 //       CONSTRUCTORS      //
/////////////////////////////

  var Player = function(game, gameSize) { //create a new constructor function called Player
    this.game = game; //define game inside player for later use
    this.size = { x: 15, y: 15 };
    this.center = { x: gameSize.x / 2, y: gameSize.y - this.size.x }; //tells game where the player is at the moment
    //starting x position is center; starting y is almost at bottom
    this.keyboarder = new Keyboarder(); //create new instance of Keyboarder func
  };

  var Bullet = function(center, velocity) {
    this.size = { x: 3, y: 3 };
    this.center = center;
    this.velocity = velocity;
  };

  var Invader = function(game, center) {
    this.game = game;
    this.size = { x: 15, y: 15 };
    this.center = center;
    this.patrolX = 0; //keeps track of x position of patroler
    this.speedX = 0.3;
  };

  /////////////////////////////
 //        PROTOTYPES       //
/////////////////////////////

  Player.prototype = {
    update: function() { //called everytime master update function is
      if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) { //if left key is down,
        this.center.x -= 2; //move to the left.
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
        this.center.x += 2;
      }

      if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {
        var bullet = new Bullet({  //where to fire the bullet from
          x: this.center.x,
          y: this.center.y - this.size.x /2
        },
                  { x: 0, y: -6 }); //pass in a velocity for firing
          this.game.addBody(bullet); //add bullet to game
          this.game.shootSound.load();
          this.game.shootSound.play();
      }
    }
  };

  Bullet.prototype = {
    update: function() {
      this.center.x += this.velocity.x;
      this.center.y += this.velocity.y;
    }
  };

  Invader.prototype = {
    update: function() {
      if (this.patrolX < 0 || this.patrolX > 40) {
        this.speedX = -this.speedX; //reverse direction if out of boundaries of game
      }

      this.center.x += this.speedX; //move the invader
      this.patrolX += this.speedX; //keep track of invader position

      if (Math.random() > 0.995 && !this.game.invadersBelow(this)) {
        var bullet = new Bullet({
          x: this.center.x,
          y: this.center.y + this.size.x /2
        },
                  { x: Math.random() - 0.5, y: 2 }); //pass in a velocity for firing
          this.game.addBody(bullet); //add bullet to game
      }
    }
  };

  /////////////////////////////
 //        FUNCTIONS        //
/////////////////////////////

var createInvaders = function(game) {
  var invaders = []; //create empty array of invaders that will contain 24 invaders, in 8 columns
  for (var i = 0; i < 24; i++) {
    var x = 30 + (i % 8) * 30; //8 columns, spaced 30 apart
    var y = 30 + (i % 3) * 30; //3 rows, spaced 30 apart
    invaders.push(new Invader(game, { x: x, y: y }));
  }
  return invaders;
};

  var drawRect = function(screen, body) { //draw the 3 rectangles (bodies)
    screen.fillRect(body.center.x - body.size.x / 2, //x position
                    body.center.y - body.size.y / 2, //y position
                    body.size.x, // width
                    body.size.y); // height draws a rectangle. takes(x, y, width height)
  };

  var Keyboarder = function() { //handles keypresses to make bodies move
    var keyState = {}; //records current state (pressed or not pressed) of any key

    window.onkeydown = function(e) { //update state when a key is pressed
      keyState[e.keyCode] = true;
    };

    window.onkeyup = function(e) { //update state back to false when key goes back up
      keyState[e.keyCode] = false;
    };

    this.isDown = function(keyCode) { //check whether a key is being pressed rn
      return keyState[keyCode] === true;
    };
    this.KEYS = {LEFT: 37, RIGHT: 39, SPACE: 32}; //store keycode mappings to be readable
  };

  var colliding = function(b1, b2) { //where b means 'body'
    return !(b1 === b2 ||
             b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x /2 ||
             b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y /2 ||
             b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x /2 ||
             b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y /2);
  };

  var loadSound = function(url, callback) {
    var loaded = function() {
      callback(sound);
      sound.removeEventListener('canplaythrough', loaded);
    }

    var sound = new Audio(url);
    sound.addEventListener('canplaythrough', loaded);
    sound.load();
  };

  window.onload = function() {
    new Game("screen"); //where we are drawing to
  };
})(); //END of annonymous function
