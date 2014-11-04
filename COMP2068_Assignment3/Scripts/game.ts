var stage: createjs.Stage;
var queue;

// Game Objects
var plane: Plane;
var island: Island;
var ocean: Ocean;
var scoreboard: Scoreboard;

// Cloud Array
var clouds = [];

// Game Constants
var CLOUD_NUM: number = 1;
var GAME_FONT: string = "40px Consolas";
var FONT_COLOUR: string = "#FFFF00";
var PLAYER_LIVES: number = 3;

function preload(): void {
    queue = new createjs.LoadQueue();
    queue.installPlugin(createjs.Sound);
    queue.addEventListener("complete", init);
    queue.loadManifest([
        { id: "plane", src: "images/plane.png" },
        { id: "diver", src: "images/diver.png" },
        { id: "bubble", src: "images/bubble.png" },
        { id: "island", src: "images/island.png" },
        { id: "cloud", src: "images/cloud.png" },
        { id: "ocean", src: "images/ocean.png" },
        { id: "shark", src: "images/shark.png" },
        { id: "yay", src: "sounds/yay.ogg" },
        { id: "thunder", src: "sounds/thunder.ogg" },
        { id: "engine", src: "sounds/engine.ogg" }
        
    ]);
}

function init(): void {
    stage = new createjs.Stage(document.getElementById("canvas"));
    stage.enableMouseOver(20);
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", gameLoop);
    gameStart();
}

// Game Loop
function gameLoop(event): void {
    ocean.update();
    island.update();
    plane.update();

    
    for (var count = 0; count < CLOUD_NUM; count++) {
        clouds[count].update();
        collisionCheck(clouds[count]);
    }
    
    scoreboard.update();

    stage.update();
}



// Main Game Function
function gameStart(): void {

    var point1: createjs.Point = new createjs.Point();
    var point2: createjs.Point = new createjs.Point();

    ocean = new Ocean();
    island = new Island();
    plane = new Plane();

    for (var count = 0; count < CLOUD_NUM; count++) {
        clouds[count] = new Shark();
    }

    scoreboard = new Scoreboard();
}

// Plane Class
class Plane {
    image: createjs.Bitmap;
    width: number;
    height: number;
    constructor() {
        this.image = new createjs.Bitmap(queue.getResult("diver"));
        this.width = this.image.getBounds().width;
        this.height = this.image.getBounds().height;
        this.image.regX = this.width * 0.5;
        this.image.regY = this.height * 0.5;
        this.image.x = 20;

        stage.addChild(this.image);
        // Play engine sound forever
        createjs.Sound.play("engine", 0, 0, 0, -1, 1, 0);
    }

    update() {
        this.image.y = stage.mouseY;
        this.image.x = stage.mouseX;
    }
}

// Island Class
class Island {
    image: createjs.Bitmap;
    width: number;
    height: number;
    dx: number;
    constructor() {
        this.image = new createjs.Bitmap(queue.getResult("bubble"));
        this.width = this.image.getBounds().width;
        this.height = this.image.getBounds().height;
        this.image.regX = this.width * 0.5;
        this.image.regY = this.height * 0.5;
        this.dx = 5;
        stage.addChild(this.image);
        this.reset();
    }

    reset() {
        this.image.x = stage.canvas.width + this.width;
        this.image.y = Math.floor(Math.random() * stage.canvas.height);
    }

    update() {
        this.image.x -= this.dx;
        if (this.image.x <= (0 - this.width)) {
            this.reset();
        }
    }
}

// Cloud Class
class Shark {
    image: createjs.Bitmap;
    width: number;
    height: number;
    dy: number;
    dx: number;
    constructor() {
        this.image = new createjs.Bitmap(queue.getResult("shark"));
        this.width = this.image.getBounds().width;
        this.height = this.image.getBounds().height;
        this.image.regX = this.width * 0.5;
        this.image.regY = this.height * 0.5;
        stage.addChild(this.image);
        this.reset();
    }

    reset() {
        this.image.x = stage.canvas.width + this.width;
        this.image.y = Math.floor(Math.random() * stage.canvas.height);
        this.dy = Math.floor(Math.random() * 3 -2);
        this.dx = Math.floor(Math.random() * 3 + 5);
        //
       // 
    }

    update() {
        this.image.x -= this.dx;
        this.image.y -= this.dy;
        if (this.image.x <= (0 - this.width)) {
            this.reset();
        }
    }
}

// Ocean Class
class Ocean {
    image: createjs.Bitmap;
    width: number;
    height: number;
    dw: number;
    constructor() {
        this.image = new createjs.Bitmap(queue.getResult("ocean"));
        this.width = this.image.getBounds().width;
        this.height = this.image.getBounds().height;
        this.dw = 5;
        stage.addChild(this.image);
        this.reset();
    }

    reset() {
        this.image.x = 0;
    }

    update() {
        this.image.x -= this.dw;
        if (this.image.x <= -1280) {
            this.reset();
        }
    }
}

// The Distance Utility Function
function distance(p1: createjs.Point, p2: createjs.Point): number {
    var firstPoint: createjs.Point;
    var secondPoint: createjs.Point;
    var theXs: number;
    var theYs: number;
    var result: number;

    firstPoint = new createjs.Point();
    secondPoint = new createjs.Point();

    firstPoint.x = p1.x;
    firstPoint.y = p1.y;

    secondPoint.x = p2.x;
    secondPoint.y = p2.y;

    theXs = secondPoint.x - firstPoint.x;
    theYs = secondPoint.y - firstPoint.y;

    theXs = theXs * theXs;
    theYs = theYs * theYs;

    result = Math.sqrt(theXs + theYs);

    return result;
}

// Check Collision between Plane and Island
function planeAndIsland() {
    var point1: createjs.Point = new createjs.Point();
    var point2: createjs.Point = new createjs.Point();

    point1.x = plane.image.x;
    point1.y = plane.image.y;
    point2.x = island.image.x;
    point2.y = island.image.y;
    if (distance(point1, point2) < ((plane.height * 0.5) + (island.height * 0.5))) {
        createjs.Sound.play("yay");
        scoreboard.score += 100;
        island.reset();
    }
}

// Check Collision between Plane and Cloud
function planeAndCloud(theCloud: Shark) {
    var point1: createjs.Point = new createjs.Point();
    var point2: createjs.Point = new createjs.Point();
    var cloud: Shark = new Shark();

    cloud = theCloud;

    point1.x = plane.image.x;
    point1.y = plane.image.y;
    point2.x = cloud.image.x;
    point2.y = cloud.image.y;
    if (distance(point1, point2) < ((plane.height * 0.5) + (cloud.height * 0.5))) {
        createjs.Sound.play("thunder");
        scoreboard.lives -= 1;
        cloud.reset();
    }
}

// Collision Check Utility Function 
function collisionCheck(theShark: Shark) {
    /*planeAndIsland();

    for (var count = 0; count < CLOUD_NUM; count++) {
        planeAndCloud(clouds[count]);
    class
    */
    var shark: Shark = new Shark();
    shark = theShark;
    for (var count = 0; count < clouds.length; count++) {
        var collision = ndgmr.checkPixelCollision(clouds[count].image, plane.image, 0);
        if (collision) {
                
            createjs.Sound.play("yay");
            shark.reset();
            
            }
        }
    }
    


    class Scoreboard {
    label: createjs.Text;
    labelString: string = "";
    lives: number = PLAYER_LIVES;
    score: number = 0;
    width: number;
    height: number;
    constructor() {
        this.label = new createjs.Text(this.labelString, GAME_FONT, FONT_COLOUR);
        this.update();
        this.width = this.label.getBounds().width;
        this.height = this.label.getBounds().height;

        stage.addChild(this.label);
    }

    update() {
        this.labelString = "Lives: " + this.lives.toString() + " Score: " + this.score.toString();
        this.label.text = this.labelString;
    }

}