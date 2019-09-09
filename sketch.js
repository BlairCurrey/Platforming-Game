/*

Blair Currey - GAME PROJECT FINAL SUBMISSION

Extensions Chosen: (1) Add Sounds, (2) Create Platforms

    (1) Add Sounds
            + What I Found Difficult
            
                I initially had trouble playing some sounds within the draw loop. They played constantly and it had an undesirable echo effect. I also encountered the problem of sounds playing into the next game session. For example, the game won sound continuing to play even when a new game session had started.
            
            + Skills Learnt/Practiced by Implementing it

                In order to resolve the above issues, I practiced referring to documentation, debugging, and writing elegant code. Initially I found a way to set a timeout for a function which worked with the specific timing of events at the time, but it didn't seem very elegant nor scalable so I dug a bit deeper. The first step I took was to read the p5 documentation on sound and see if there were any built-in functions that solved my problems. That in conjunction with debugging by trying different things and noting the result, I began to understand my problem more at which point I could see possible solutions. Ultimately I ended up adding a restart game function (that would be useful for other features too) and a boolean to track whether or not the game over sound had been played.
            
    (2) Create Platforms
            + What I Found Difficult
            
                I had trouble getting the physica of the platform to function as intended. At different points in this extension, I could not land on the platform, jump from the platform, and get platforms beyond the first one to work as intended. 
            
            + Skills Learnt/Practiced by Implementing it
            
                All of the above issues were the result of me not sufficiently understanding how the code I wanted to reference was structured. At this point I felt like the project had gotten quite big and I did not understand how everything worked together after the breaks between working on the game. In order to understand the moving peices better, I did a lot of debugging. I did this in the form of printing to console to verify whether or not certain code was executed and when, and following the flow of the code in the 'Sources' tab in the chrome. Through these methods I discovered the bits of code that were not doing what I was expecting them to which showed me where I needed to make changes. 
                
Additional Notes: 
    I also began to add advanced graphics and enemies, although I didn't complete them to the extent I had originally intended. 
        
    For the enemies, I used the constructor function to make birds. These birds are randomly generated in the trees, with the first two trees always having birds to familiarize the player with them before continuing on in the level. I wanted to take this idea further and have them throw rocks or something but ran out of time to implement this feature.

    Some of the more advanced graphics are evident in the shading of the scenery objects, which is particularly evident with the mountains. Additionaly, I added some animation. The collectable worms wiggle around. This was achieved by updating their position randomly within a certain range. The birds are also animated. When the player dies, they start laughing. Their beaks move, which was accomplished in the same way as the worms. Their eyes also change based of where they player is in relation to them. Finally, I added advanced graphics in the form of the frog at the end of the level. The character submerges in the water and the green and blue are blended

*/

var character;
var floorYPos;
var scrollPos;
var gameCharWorldX;

var trees;
var worms;
var clouds;
var mountains;
var canyons;
var pond;
var birds;
var catTails

var platforms;

var gameScore;
var lives;

var sounds;
var gameOverPlayed;

function preload()
{
    soundFormats('mp3','wav');
      
    //load sounds
    sounds =
    {
        jump: loadSound('assets/jump.wav'),
        collect: loadSound('assets/collectable.mp3'),
        plummet: loadSound('assets/plummeting.wav'),
        menu: loadSound('assets/menu1.wav'),
        splash: loadSound('assets/splash.wav'),
        gameOver: loadSound('assets/laughing_birds.mp3'),
        gameWon: loadSound('assets/gamewon.mp3')
    }
    
    //set volumes
    sounds.jump.setVolume(0.1);
    sounds.collect.setVolume(0.1);
    sounds.plummet.setVolume(0.1);
    sounds.menu.setVolume(0.1);
    sounds.splash.setVolume(0.5);
    sounds.gameOver.setVolume(0.3);
    sounds.gameWon.setVolume(0.1);
    
    //track whether or not sound has been played so we can prevent it from repeating in draw function
    gameOverPlayed = false;
}

function setup()
{
    createCanvas(1024, 576);
    floorYPos = height * 3/4;
    lives = 3;
    
    startGame();

}

function startGame()
{
    // Variable to control the background scrolling.
    scrollPos = 0;
    
    gameScore = 0;
    
    character = 
    {
        xPos: width/2,
        yPos: floorYPos,
        isLeft: false,
        isRight: false,
        isFalling: false,
        isPlummeting: false,
        playerDead: false,
    }
    
    // Variable to store the real position of the gameChar in the game world.
    // Needed for collision detection.
    gameCharWorldX = character.xPos - scrollPos;
    
    // End of Level
    pond = 
    {   
        xPos: 6500, width: 400, isReached: false,
        draw: function()
        {
            noStroke();
            fill(25, 25, 200);
            triangle(this.xPos, floorYPos, this.xPos, height, this.xPos - 40, height);
            triangle(this.xPos + this.width, floorYPos, this.xPos + this.width, height, this.xPos + this.width + 40, height);
            rect(this.xPos, floorYPos, this.width, height - floorYPos);
            
            if(pond.isReached)
            {   
                //splash variables
                var splashRadius = 150
                var splashX = this.xPos + this.width * 0.5
                var splashY = floorYPos + splashRadius * 0.33

                //splash
                for(i = 0; i < splashRadius; i ++)
                {
                    fill(25, 25 + (i *0.75),200 - (i * 0.5));
                    ellipse(splashX, splashY, splashRadius - i , (splashRadius * 0.5) - (i * 0.5));  
                }

                //eyes
                fill(255);
                ellipse(splashX - 6, splashY - 10, 14, 14);
                ellipse(splashX + 6, splashY - 10, 14, 14);
                fill(0);
                ellipse(splashX - 5, splashY - 10, 3, 3);
                ellipse(splashX + 5, splashY - 10, 3, 3);
            }
        },
        check: function()
        {
            if(abs(gameCharWorldX - this.xPos - this.width / 2) < 20 && !this.isReached)
            {
                this.isReached = true;
                sounds.splash.play();
                sounds.gameWon.play();
            }
        }
    }
    
    //make platform array
    platforms = [];
    
    //use factory pattern function to make playforms
    platforms.push(createPlatforms(1510, floorYPos - 50 , 140));
    platforms.push(createPlatforms(2355, floorYPos - 45 , 100));
    platforms.push(createPlatforms(2500, floorYPos - 105, 130));
    platforms.push(createPlatforms(2925, floorYPos - 45, 100));
    platforms.push(createPlatforms(4710, floorYPos - 65, 100));
    platforms.push(createPlatforms(4870, floorYPos - 125, 75));
    platforms.push(createPlatforms(4950, floorYPos - 35, 100));
    platforms.push(createPlatforms(5030, floorYPos - 165, 75));
    platforms.push(createPlatforms(5410, floorYPos - 140, 75));
    platforms.push(createPlatforms(5625, floorYPos - 160, 75));
    
    //Collectible worms
    worms = 
{
    info:
    [
        {xPos: 950, yPos: floorYPos + 5, size: 12, isFound: false},
        {xPos: 2650, yPos: floorYPos + 5, size: 10, isFound: false},
        {xPos: 3470, yPos: floorYPos + 5, size: 12, isFound: false},
        {xPos: 4100, yPos: floorYPos + 5, size: 10, isFound: false}  
    
    ],
    draw: function()
    {
        for(var i = 0; i < this.info.length; i++)
        {
            //mound
            noStroke();
            fill(90, 80, 10);
            ellipse(this.info[i].xPos, this.info[i].yPos + 2, this.info[i].size * 1.33, this.info[i].size * 0.7)
            stroke(0);
            strokeWeight(1);

            //hole
            fill(100, 50, 15);
            ellipse(this.info[i].xPos, this.info[i].yPos, this.info[i].size * 0.5, this.info[i].size * 0.15)
            
            if(!this.info[i].isFound)
            {
                var x = wiggle(3,2)

                //worm body
                stroke(255, 125, 155);
                strokeWeight(4);
                line(random(this.info[i].xPos + x, this.info[i].xPos - x), this.info[i].yPos, random(this.info[i].xPos + x, this.info[i].xPos - x), this.info[i].yPos - this.info[i].size * 0.5)
                line(random(this.info[i].xPos + x, this.info[i].xPos - x), this.info[i].yPos - this.info[i].size * 0.5, random(this.info[i].xPos + x, this.info[i].xPos - x), this.info[i].yPos - this.info[i].size * 0.8)

                //worm head
                noStroke();
                fill(255, 125, 155)
                ellipse(this.info[i].xPos, this.info[i].yPos - this.info[i].size * 0.8, this.info[i].size * 0.5, this.info[i].size);    
            }
        }
        
    },
    check: function()
    {
        for(var i = 0; i < this.info.length; i++)
        {
            if(dist(gameCharWorldX, character.yPos, this.info[i].xPos, this.info[i].yPos) < this.info[i].size && !this.info[i].isFound)
            {
                this.info[i].isFound = true;
                gameScore += 1;
                sounds.collect.play();
            }
        }
    }
}

    // Initialise arrays of scenery objects. 
    trees =
    {
        info:
        [ 
            {xPos: 110},
            {xPos: 1250},
            {xPos: 1900},
            {xPos: 2050},
            {xPos: 3400},
            {xPos: 3525}, 
            {xPos: 3675},
            {xPos: 4000},
            {xPos: 4200},
            {xPos: 5300},
            {xPos: 5200}
        ],
        draw: function()
        {
            for(var i = 0; i < this.info.length; i++)
            {
                noStroke();
                fill(255);
                fill(100, 50, 0);
                rect(this.info[i].xPos,floorYPos - 200, 25, 200);
                fill(140,70,20);
                rect(this.info[i].xPos,floorYPos - 200, 43/2, 200);
                fill(0, 125, 0);
                triangle(
                    this.info[i].xPos +25/2, floorYPos - 300,this.info[i].xPos - 30, floorYPos - 165, this.info[i].xPos + 60 , floorYPos - 165
                );
                triangle(
                    this.info[i].xPos +25/2, floorYPos - 225, this.info[i].xPos - 40, floorYPos - 100, this.info[i].xPos + 70, floorYPos - 100
                );
                triangle(
                    this.info[i].xPos +25/2, floorYPos - 150, this.info[i].xPos - 45, floorYPos - 50, this.info[i].xPos + 75, floorYPos - 50
                );
                fill(0, 75, 0);
                triangle(
                    this.info[i].xPos +25/2, floorYPos - 300, this.info[i].xPos + 25, floorYPos - 165, this.info[i].xPos + 60 , floorYPos - 165
                );
                triangle(
                    this.info[i].xPos +25/2, floorYPos - 225, this.info[i].xPos + 25, floorYPos - 100, this.info[i].xPos + 70, floorYPos - 100
                );
                triangle(
                    this.info[i].xPos +25/2, floorYPos - 150, this.info[i].xPos + 30, floorYPos - 50, this.info[i].xPos + 75, floorYPos - 50
                );    
            }
        }
    }

    canyons = 
    {
        info:    
        [
            {xPos: -700, width: 800},
            {xPos: 750, width: 100},
            {xPos: 1450, width: 250},
            {xPos: 2250, width: 300},
            {xPos: 2750, width: 375},
            {xPos: 3750, width: 170},
            {xPos: 4300, width: 150},
            {xPos: 4650, width: 515},
            {xPos: 5400, width: 600}
        ],
        draw: function()
        {
            for(var i = 0; i < this.info.length; i++)
            {    
                fill(140,70,20);
                triangle(this.info[i].xPos, floorYPos, this.info[i].xPos, height, this.info[i].xPos - 40, height);
                triangle(this.info[i].xPos + this.info[i].width, floorYPos, this.info[i].xPos + this.info[i].width, height, this.info[i].xPos + this.info[i].width + 40, height);
                fill(100, 50, 15);    
                rect(this.info[i].xPos, floorYPos, this.info[i].width, height - floorYPos);
                noStroke();
            }
        },
        check: function()
        {
            //pixels beyond canyon x pos before character starts falling - character starts falling a little too early without this
            canyonFallOffset = 10

            for(var i = 0; i < this.info.length; i++)
            {
                if(gameCharWorldX > this.info[i].xPos + canyonFallOffset && gameCharWorldX < (this.info[i].xPos + this.info[i].width - canyonFallOffset) && character.yPos >= floorYPos && !character.isPlummeting)
                {
                    character.isPlummeting = true;
                    sounds.plummet.play();
                }
            }
        }
    }
    clouds =
    {
        info:
        [
            {xPos: 100, yPos: 125, size: 150},
            {xPos: 600, yPos: 100, size: 70},
            {xPos: 900, yPos: 150, size: 100},
            {xPos: 1300, yPos: 100 , size: 120},
            {xPos: 1800, yPos: 150, size: 150},
            {xPos: 2400, yPos: 125, size: 90},
            {xPos: 2800, yPos: 150, size: 130},
            {xPos: 3600, yPos: 80, size: 200}
        ],
        draw: function()
        {
            for(var i = 0; i < this.info.length; i++)
            {
                fill(200);
                rect(clouds.info[i].xPos - clouds.info[i].size * 1.2222, clouds.info[i].yPos + clouds.info[i].size * .2778, clouds.info[i].size * 1.6667, clouds.info[i].size * .5556);
                ellipse(clouds.info[i].xPos - clouds.info[i].size * 1.2222, clouds.info[i].yPos + clouds.info[i].size * .5556, clouds.info[i].size * .8333, clouds.info[i].size * .5556);
                ellipse(clouds.info[i].xPos + clouds.info[i].size * .4444, clouds.info[i].yPos + clouds.info[i].size * .5556, clouds.info[i].size * .8333, clouds.info[i].size * .5556);
                ellipse(clouds.info[i].xPos + clouds.info[i].size * .0556, clouds.info[i].yPos + clouds.info[i].size * .0556, clouds.info[i].size, clouds.info[i].size);
                fill(255);
                rect(clouds.info[i].xPos - clouds.info[i].size * 1.278, clouds.info[i].yPos + clouds.info[i].size * .2222, clouds.info[i].size * 1.6667, clouds.info[i].size * .5556);
                ellipse(clouds.info[i].xPos - clouds.info[i].size * 1.278, clouds.info[i].yPos + clouds.info[i].size * .5, clouds.info[i].size * .8333, clouds.info[i].size * .5556);
                ellipse(clouds.info[i].xPos + clouds.info[i].size * .3889, clouds.info[i].yPos + clouds.info[i].size * .5, clouds.info[i].size * .8333, clouds.info[i].size * .5556); ellipse(clouds.info[i].xPos,clouds.info[i].yPos,clouds.info[i].size,clouds.info[i].size);
                ellipse(clouds.info[i].xPos - clouds.info[i].size * .7778, clouds.info[i].yPos + clouds.info[i].size * .2222, clouds.info[i].size * .8333, clouds.info[i].size * .7222);
            }
        }
    }

    mountains = 
    { 
        info:
        [
            {xPos: 60, yPos: floorYPos, size: 150},
            {xPos: 1200, yPos: floorYPos, size: 100},
            {xPos: 1600, yPos: floorYPos, size: 160},
            {xPos: 1800, yPos: floorYPos, size: 80},
            {xPos: 3200, yPos: floorYPos, size: 175},
        ],
        draw: function() 
        {
            for(var i = 0; i < this.info.length; i++)
            {
                fill(160, 0, 160);
                triangle(this.info[i].xPos, this.info[i].yPos, this.info[i].xPos + this.info[i].size, this.info[i].yPos - this.info[i].size * 1.32, this.info[i].xPos + this.info[i].size * 2, this.info[i].yPos);

                fill(100,0,100);
                triangle(this.info[i].xPos + this.info[i].size, this.info[i].yPos - this.info[i].size * 1.32, this.info[i].xPos + this.info[i].size * .66, this.info[i].yPos, this.info[i].xPos + this.info[i].size * 2, this.info[i].yPos);

                fill(160, 0, 160);
                triangle(this.info[i].xPos + this.info[i].size * 2.75,this.info[i].yPos - this.info[i].size * 2.57,this.info[i].xPos + this.info[i].size,this.info[i].yPos, this.info[i].xPos + this.info[i].size * 4.5,this.info[i].yPos);

                fill(100, 0, 100);
                triangle(this.info[i].xPos + this.info[i].size * 2.75, this.info[i].yPos - this.info[i].size * 2.57, this.info[i].xPos + this.info[i].size * 2.15, this.info[i].yPos, this.info[i].xPos + this.info[i].size * 4.5, this.info[i].yPos);

                fill(255)
                triangle(this.info[i].xPos + this.info[i].size, this.info[i].yPos - this.info[i].size * 1.32, this.info[i].xPos + this.info[i].size * .84, this.info[i].yPos - this.info[i].size * 1.12, this.info[i].xPos + this.info[i].size * 1.16, this.info[i].yPos - this.info[i].size * 1.12);
                triangle(this.info[i].xPos + this.info[i].size * 2.75, this.info[i].yPos - this.info[i].size * 2.57, this.info[i].xPos + this.info[i].size * 2.47, this.info[i].yPos - this.info[i].size * 2.17, this.info[i].xPos + this.info[i].size * 3.03, this.info[i].yPos - this.info[i].size * 2.17);

                fill(180)
                triangle(this.info[i].xPos + this.info[i].size, this.info[i].yPos - this.info[i].size * 1.32, this.info[i].xPos + this.info[i].size * .95, this.info[i].yPos - this.info[i].size * 1.12, this.info[i].xPos + this.info[i].size * 1.16, this.info[i].yPos - this.info[i].size * 1.12);
                triangle(this.info[i].xPos + this.info[i].size * 2.75,this.info[i].yPos - this.info[i].size * 2.57,this.info[i].xPos + this.info[i].size * 2.65,this.info[i].yPos - this.info[i].size * 2.17,this.info[i].xPos + this.info[i].size * 3.03,this.info[i].yPos - this.info[i].size * 2.17);
            }
        }
    }
    
    //create catTail array
    catTails = []
    
    //create cat tails of random size according to pond width
    for (i = 0; i < pond.width * 0.125; i ++)
    {
        var x = random(pond.xPos, pond.xPos + pond.width);
        var y = random(floorYPos, floorYPos + 25);
        var size = random(150,210);
        
        catTails.push(new MakeCatTails(x, y, size));
    }
    
    //create birds array
    birds =[]
    
    //generate random number for every tree and make a bird if below the threshold
    for(i = 0; i < trees.info.length; i ++)
        {
            var r = random();
            
            //puts birds in first two trees to show player 
            if(i == 0 || i == 1)
            {
                birds.push(new MakeBirds(trees.info[i].xPos, 125, 75));
            }
            
            if(r < .4 && i > 1)
            {
                birds.push(new MakeBirds(trees.info[i].xPos, 125, 75));
            }
        }  
}

function draw()
{    
    drawSkyGround();

    //save the current state of the program
    push();
    
    //scroll mountains and clouds slowly
    translate(scrollPos /4,0);
    
    // Draw clouds.
    clouds.draw()

    // Draw mountains.
    mountains.draw()
    
    pop();
    
    //save the current state of the program
    push();
    
    //scroll foreground faster than above scenery
    translate(scrollPos,0);
    
    // Draw trees.
    trees.draw();
    
    // Draw birds
    for(i = 0; i < birds.length; i ++)
    {
        birds[i].draw();
    }

    // Draw canyons and check if player is in them
    canyons.draw();
    canyons.check();
    
    // Draw platforms
    for(i = 0; i < platforms.length; i ++)
    {
        platforms[i].draw();
    }
    
    // Draw worm holes, unfound collectables, and check if collectables are found
    
    worms.draw();
    worms.check();

    // Draw pond
    pond.draw();
    
    // Draw cat tails
    for(i = 0; i < catTails.length; i ++)
    {
        catTails[i].draw();
    }
    
    //Pop
    pop();

    //Check if game has ended
    if(checkGameOver())
    {
        gameOver();
    }
    else if(checkGameWon())
    {
        gameWon();
    }
    
    // Draw game character and let move if game is not over/won
    if(checkGameWon() == false && checkGameOver() == false)
    {
        drawGameChar();
        movement();
        drawStatus();
    }  
    
    // Make character rise, fall, and plummet
    
    gravity();
    
    // Update real position of gameChar for collision detection.
    
    gameCharWorldX = character.xPos - scrollPos;
    
    
    // Check if pond has been reached
    
    if(pond.isReached == false)
    {
        pond.check();
    }
    
    //Check if player is dead
    
    if(character.playerDead == false)
    {
        checkPlayerDie();
    }
}

// ---------------------
// Game logic functions
// ---------------------

// Logic to make the game character move or the background scroll.
    
function movement()
{   
     if(character.isLeft && !character.isPlummeting)
    {
        if(character.xPos > width * 0.35)
        {
            character.xPos -= 5;
        }
        else
        {
            scrollPos += 5;
        }
    }

    if(character.isRight && !character.isPlummeting)
    {
        if(character.xPos < width * 0.65)
        {
            character.xPos  += 5;
        }
        else
        {
            scrollPos -= 5; // negative for moving against the background
        }
    }
}

// Logic to make the game character rise and fall.
function gravity()
{
    if(character.yPos < floorYPos)
    {
        var isContact = false
        for(var i = 0; i < platforms.length; i ++)
        {
            if(platforms[i].checkContact(gameCharWorldX, character.yPos))
            {
                character.isFalling = false;
                isContact = true;
                break;
            }
        }
        if(!isContact)
        {
            character.yPos += 2;
            character.isFalling = true;    
        }
    }
    else
    {
        character.isFalling = false;    
    }
    
    if(character.isPlummeting)
    {
        character.yPos += 10;
        character.isLeft = false;
        character.isRight = false;
    }

}

// ---------------------
// Key control functions
// ---------------------

function keyPressed()
{

//    console.log("press" + keyCode);
//    console.log("press" + key);
    
    if(key == "a" || keyCode == 37)
    {
        character.isLeft = true;
    }
    
    if(key == "d" || keyCode == 39)
    {
        character.isRight = true;
    }
    
    if(key == " " || key== "w")
    {
        if(!character.isFalling && !character.isPlummeting && !checkGameOver() && !checkGameWon())    
        {
            character.yPos -= 100;
            sounds.jump.play();
        }
        else if(checkGameOver() || checkGameWon())
        {
            restartGame();
        }
    }
}

function keyReleased()
{

//    console.log("release" + keyCode);
//    console.log("release" + key);
    
    if(key == "a" || keyCode == 37)
    {
        character.isLeft = false;
    }
    
    if(key == "d" || keyCode == 39)
    {
        character.isRight = false;
    }

}

// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.

function drawGameChar()
{
    if(character.isLeft && character.isFalling)
    {
        strokeWeight(1)
        stroke(0);
        fill(0, 255, 0);
        ellipse(character.xPos + 6, character.yPos - 21, 13, 8);
        ellipse(character.xPos, character.yPos - 43, 25, 30);
        ellipse(character.xPos + 9, character.yPos - 16, 13, 8);
        fill(255);
        ellipse(character.xPos - 4, character.yPos - 60, 14, 14);
        fill(0);
        ellipse(character.xPos - 9, character.yPos - 62, 3, 3);
        line(character.xPos -11, character.yPos - 48, character.xPos - 7, character.yPos - 48);
    }
    else if(character.isRight && character.isFalling)
    {   
        strokeWeight(1)
        stroke(0);
        fill(0, 255, 0);
        ellipse(character.xPos -6, character.yPos - 21, 13, 8);
        ellipse(character.xPos, character.yPos - 43, 25, 30);
        ellipse(character.xPos - 9, character.yPos - 16, 13, 8);
        fill(255);
        ellipse(character.xPos + 4, character.yPos - 60, 14, 14);
        fill(0);
        ellipse(character.xPos + 9, character.yPos - 62, 3, 3);
        line(character.xPos +11, character.yPos - 48, character.xPos + 7, character.yPos - 48);
    }
    else if(character.isLeft)
    {
        strokeWeight(1)
        stroke(0);
        fill(0, 255, 0);
        ellipse(character.xPos + 7, character.yPos + 2, 13, 8);
        ellipse(character.xPos, character.yPos - 18, 25, 30);
        ellipse(character.xPos -11, character.yPos - 3, 13, 8);
        fill(255);
        ellipse(character.xPos - 4, character.yPos - 35, 14, 14);
        fill(0);
        ellipse(character.xPos - 8, character.yPos - 35, 3, 3);
        line(character.xPos -12, character.yPos - 23, character.xPos - 8, character.yPos - 23);
    }
    else if(character.isRight)
    {
        strokeWeight(1)
        stroke(0);
        fill(0, 255, 0);
        ellipse(character.xPos +11, character.yPos - 3, 13, 8);
        ellipse(character.xPos, character.yPos - 18, 25, 30);
        ellipse(character.xPos - 7, character.yPos + 2, 13, 8);
        fill(255);
        ellipse(character.xPos + 4, character.yPos - 35, 14, 14);
        fill(0);
        ellipse(character.xPos + 8, character.yPos - 35, 3, 3);
        line(character.xPos +11, character.yPos - 23, character.xPos + 7, character.yPos - 23);
    }
    else if(character.isFalling || character.isPlummeting)
    {
        strokeWeight(1)
        stroke(0);
        fill(0, 255, 0);
        ellipse(character.xPos, character.yPos - 45, 26, 35);
        line(character.xPos - 4, character.yPos - 52, character.xPos + 4, character.yPos - 52);
        fill(255);
        ellipse(character.xPos - 6, character.yPos - 62, 14, 14);
        ellipse(character.xPos + 6, character.yPos - 62, 14, 14);
        fill(0);
        ellipse(character.xPos - 5, character.yPos - 65, 3, 3);
        ellipse(character.xPos + 5, character.yPos - 65, 3, 3);
        fill(0,255,0);
        ellipse(character.xPos - 10, character.yPos - 22, 8, 13);
        ellipse(character.xPos + 10, character.yPos - 22, 8, 13);
    }
    else    // front-facing
    {
        strokeWeight(1);
        stroke(0);
        fill(0, 255, 0);
        //body
        ellipse(character.xPos, character.yPos - 15, 30, 30);
        line(character.xPos - 4, character.yPos - 21, character.xPos + 4, character.yPos - 21);
        //feet
        ellipse(character.xPos - 10, character.yPos - 2, 13, 8);
        ellipse(character.xPos + 10, character.yPos - 2, 13, 8);
        //eyes
        fill(255);
        ellipse(character.xPos - 6, character.yPos - 32, 14, 14);
        ellipse(character.xPos + 6, character.yPos - 32, 14, 14);
        fill(0);
        ellipse(character.xPos - 5, character.yPos - 32, 3, 3);
        ellipse(character.xPos + 5, character.yPos - 32, 3, 3);
        
    }
}

// ----------------------
// Draw Assist functions
// ----------------------

// function that returns a specified number every given number of frames (for use with randomizing x, y drawing coordinates)

function wiggle(frames, amount)
{   
    if(frameCount % frames == 0)
    {  
        var a = amount
    }
    else
    {
        a = 0
    }
    
    return a;
}

// ----------------------------
// Factory Patter for Platforms
// ----------------------------
function createPlatforms(x, y, size)
{
    var p = 
    {
        xPos: x,
        yPos: y,
        size: size,
        draw: function()
        {
            var thickness = 10
            var roundness = 10
            
            noStroke();
            fill(0, 155, 0);
            rect(this.xPos, this.yPos - thickness * 0.1, this.size, thickness + thickness * 0.1, roundness); 
            fill(140,70,20);
            triangle(this.xPos + roundness * 0.4, this.yPos + thickness, this.xPos + this.size - roundness * 0.4, this.yPos + thickness, (this.xPos + this.xPos + this.size) / 2,  this.yPos + thickness + size / 5);
            fill(100, 50, 15);
            triangle(this.xPos + size * 0.67, this.yPos + thickness, this.xPos + this.size - roundness * 0.4, this.yPos + thickness, (this.xPos + this.xPos + this.size) / 2,  this.yPos + thickness + size / 5);
        },
        checkContact: function(gc_x, gc_y) // determines if game char is over platform
        {
            var edgeFallOffset = 5 //helps graphics match physics
            
            if(gc_x > this.xPos - edgeFallOffset && gc_x < this.xPos + this.size + edgeFallOffset)
            {
                var d = this.yPos - character.yPos;
                if(d >= 0 && d < 3)
                {
                    return true;   
                }
            }
            return false;    
        }
    }
    return p;
}

// ----------------------
// Bird draw functions
// ----------------------

// Function to draw birds

function MakeBirds(x, y, size) 
{
    this.xPos = x;
    this.yPos = y;
    this.size = size;
    this.alert = false;
    this.laughing = false;
    this.draw = function()
    {
        //body
        fill(0);
        ellipse(this.xPos + this.size * 0.05, this.yPos + this.size * 0.4, this.size * 0.3, this.size * 0.75)

        //head
        noStroke();
        fill(0);
        ellipse(this.xPos, this.yPos, this.size * 0.3, this.size * 0.5);

        //disinterested eyes if character is far, alert if he is close, laughing if he is dead
        if(abs(gameCharWorldX - this.xPos) < 175 && checkGameOver() == false) //alert state
        {
            //beak
            stroke(0);
            strokeWeight(1);
            fill(255,165,0);
            triangle(this.xPos - this.size * 0.3, this.yPos + this.size * 0.15, this.xPos, this.yPos, this.xPos + this.size * 0.1, this.yPos + this.size * 0.15)
            noStroke();

            //eye whites
            stroke(0);
            strokeWeight(1);
            fill(255);
            ellipse(this.xPos - this.size * 0.1, this.yPos - this.size *0.1, this.size * 0.25, this.size * 0.25)
            ellipse(this.xPos + this.size * 0.1, this.yPos - this.size *0.1, this.size * 0.25, this.size * 0.25)

            //pupils
            fill(0);
            ellipse(this.xPos - this.size * 0.1, this.yPos - this.size *0.1, this.size * 0.05, this.size * 0.05)
            ellipse(this.xPos + this.size * 0.1, this.yPos - this.size * 0.1, this.size * 0.05, this.size * 0.05)
            noStroke();
        }
        else if(checkGameOver() == true) //laughing state
        {
            x = wiggle(5,3) // controls frequency/amount of beak movement

            //eyelids
            stroke(0);
            strokeWeight(1);
            fill(255);
            ellipse(this.xPos - this.size * 0.1, this.yPos - this.size *0.1, this.size * 0.25, this.size * 0.25)
            ellipse(this.xPos + this.size * 0.1, this.yPos - this.size *0.1, this.size * 0.25, this.size * 0.25)

            //eye whites
            fill(0);
            arc(this.xPos - this.size * 0.1, this.yPos - this.size *0.1, 18, 18, 0, PI, CHORD);
            arc(this.xPos + this.size * 0.1, this.yPos - this.size *0.1, 18, 18, 0, PI, CHORD);

            //pupils
            fill(0);
            ellipse(this.xPos - this.size * 0.1, this.yPos - this.size *0.12, this.size * 0.05, this.size * 0.05)
            ellipse(this.xPos + this.size * 0.1, this.yPos - this.size * 0.12, this.size * 0.05, this.size * 0.05)

            //beak - laughing
            stroke(0);
            strokeWeight(1);
            fill(255,165,0);
            //top beak
            triangle(random(this.xPos - this.size * 0.42 + x, this.xPos - this.size * 0.42 - x), random(this.yPos - this.size * 0.1 + x, this.yPos - this.size * 0.1 - x), this.xPos, this.yPos - this.size * 0.05, this.xPos + this.size * 0.1, this.yPos + this.size * 0.1)
            //bottom beak
            triangle(random(this.xPos - this.size * 0.37 + x, this.xPos - this.size * 0.37 - x), random(this.yPos + this.size * 0.1 + x, this.yPos + this.size * 0.1 - x), this.xPos - this.size * 0.1, this.yPos + this.size * 0.03, this.xPos + this.size * 0.1, this.yPos + this.size * 0.1)
            //tongue
            noStroke();
            fill(255, 50, 100)
            triangle(this.xPos - this.size * 0.22, this.yPos + this.size * 0.08, this.xPos - this.size * 0.1, this.yPos + this.size * 0.05, this.xPos + this.size * 0.1, this.yPos + this.size * 0.1)
        }
        else //disinterested
        {
            //beak
            stroke(0);
            strokeWeight(1);
            fill(255,165,0);
            triangle(this.xPos - this.size * 0.3, this.yPos + this.size * 0.15, this.xPos, this.yPos, this.xPos + this.size * 0.1, this.yPos + this.size * 0.15)
            noStroke();
            //eyelids
            fill(0);
            ellipse(this.xPos - this.size * 0.1, this.yPos - this.size *0.1, this.size * 0.25, this.size * 0.25)
            ellipse(this.xPos + this.size * 0.1, this.yPos - this.size *0.1, this.size * 0.25, this.size * 0.25)
            //eye whites
            stroke(0);
            strokeWeight(1);
            fill(255);
            arc(this.xPos - this.size * 0.1, this.yPos - this.size *0.1, 18, 18, 0, PI, CHORD);
            arc(this.xPos + this.size * 0.1, this.yPos - this.size *0.1, 18, 18, 0, PI, CHORD);
            //pupils
            fill(0);
            ellipse(this.xPos - this.size * 0.1, this.yPos - this.size *0.1, this.size * 0.05, this.size * 0.05)
            ellipse(this.xPos + this.size * 0.1, this.yPos - this.size * 0.1, this.size * 0.05, this.size * 0.05)
            noStroke();

        }
    }
}
   
// --------------------
// Cat Tail Constructor
// --------------------
function MakeCatTails(x, y, size) 
{
    this.xPos = x;
    this.yPos = y;
    this.size = size;
    this.draw = function()
    {
        stroke(25, 175, 25);
        strokeWeight(5);
        line(this.xPos, this.yPos, this.xPos, this.yPos - this.size);
        noStroke();
        fill(140, 70, 20);
        rect(this.xPos - 5, this.yPos - this.size +20, 10, 30, 20);
        noStroke(); 
    }
}

// -------------------------------------
// Background and Scenery draw functions
// -------------------------------------

function drawSkyGround()
    {
        background(100, 155, 255); // fill the sky blue

        noStroke();
        fill(0,155,0);
        rect(0, floorYPos, width, height/4); // draw some green ground   
    }

// -------------------------------
// Game information draw functions
// -------------------------------


// Function to draw entire HUD
function drawStatus()
{
    drawLives();
    drawGameScore();
}

// Function to draw lives
function drawLives()
{
    for(i = 0; i < lives; i++)    
    {
        strokeWeight(1);
        stroke(0);
        fill(0, 255, 0);
        ellipse(40 * i + 30, 45, 30, 35);
    }
}
// Function to draw game score
function drawGameScore()
{
    fill(255);
    noStroke();
    textSize(18);
    textFont('consolas');
    text("score: " + gameScore, 20, 20);
}

// --------------------
// Game State functions
// --------------------

// Function to check if the player dies
    
function checkPlayerDie()
{   
    if(character.yPos > height + 70)
    {
        character.playerDead = true;
        lives -= 1;
        
        if(lives > 0)
        {
            startGame();
        }
    }
}

// Function to check if game is over and return true/false

function checkGameOver()
{
    if(lives < 1)
    {
        return true;
    }
    else
    {
        return false;
    }
}

function gameOver()
{
    if(gameOverPlayed == false)
    {
        sounds.gameOver.loop();
        gameOverPlayed = true;
    }
    
    push();
    fill(255);
    noStroke();
    textStyle(BOLD);
    textAlign(CENTER);
    textSize(22);
    text('Game over. Press space to replay.', width/2, height/2);
    text("Final score: " + gameScore, width/2, height * .6);
    pop();
    
}

// Function to check if game is won and return true/false

function checkGameWon()
{
    if(pond.isReached)
    {
        return true;
    }
    else
    {
        return false;
    }
}

function gameWon()
{   
    push();
    fill(255);
    noStroke();
    textStyle(BOLD);
    textAlign(CENTER)
    textSize(22);
    text('You won! Press space to replay.', width/2, height/2);
    text("Final score: " + gameScore, width/2, height * .6);
    pop();
}

// Acts as the setup function between ended games and new games
function restartGame()
{   
    //stops any sounds that are playing
    for (var prop in sounds) 
    {
        sounds[prop].stop();
    }
    
    //resets boolean tracking whether or not game over sound has been played
    gameOverPlayed = false;
    
    
    sounds.menu.play();
    
    lives = 3;
    startGame();
}