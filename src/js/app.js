;(function() {
  var Game = function(canvasId) {
    var canvas = document.getElementById(canvasId); //get the cavas into the game
    var screen = canvas.getContext('2d'); //getting a 'drawing context' -> a bundle of functions you can use to draw on the canvas
    var gameSize = { x: canvas.width, y: canvas.height } //store width/height of canvas for later

    this.bodies = [new Player(this, gameSize)]; //create array containing all bodies in the game (player, invader, and bullets)
    //for new Player instance, pass in the game and gameSize for correct placement

    var self = this;
    var tick = function()  { //a function to run all the game logic
      self.update(); //contains all the game logic
      self.draw(screen, gameSize); //game is drawn to screen when invoked.
      requestAnimationFrame(tick); //tells browser to run it 60x per second
    };
    tick();
  };
  Game.prototype = {
    update: function() {
    },

    draw: function(screen, gameSize) { //lets you draw to the screen
      for (var i = 0; i < this.bodies.length; i++) { //iterate thru bodies array, and invoke the drawRect function.
        drawRect(screen, this.bodies[i]); //pass in screen to draw to, and current item (either player, invader, or bullets)
      }
    }
  };

  var Player = function(game, gameSize) { //create a new constructor function called Player
    this.game = game; //define game inside player for later use
    this.size = { x: 15, y: 15 };
    this.center = { x: gameSize.x / 2, y: gameSize.y - this.size.x }; //tells game where the player is at the moment
    //starting x position is center, starting y is almost at bottom
  };

  Player.prototype = {
    update: function() { //called everytime master update function is

    }
  };

  var drawRect = function(screen, body) { //draw the 3 rectangles (bodies)
    screen.fillRect(body.center.x - body.size.x / 2, //x position
                    body.center.y - body.size.y / 2, //y position
                    body.size.x, // width
                    body.size.y); // height draws a rectangle. takes(x, y, width height)
  };

  window.onload = function() {
    new Game("screen"); //where we are drawing to
  };
})();
