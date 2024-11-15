const FPS = 30;
 
let canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let speed = 0;

class BG{
    constructor(){
        this.x = 0;
        this.img = new Image();
        this.img.src = 'bg/bg.png';
        this.img.onload = () => {
            this.draw();
        }
    }

    draw(){
        this.x -= speed;
        if(this.x <= -canvas.width){
            this.x = 0;
        }
        ctx.drawImage(this.img,this.x,0,canvas.width,canvas.height);
        ctx.drawImage(this.img,this.x+canvas.width,0,canvas.width,canvas.height);
    }
}

const bg = new BG();

class Player{
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.speedX = 0;
        this.speedY = 0;
        this.width = 250;
        this.height = 250;
        this.frame = 0;
        this.animation = 'Idle';
        this.animations = {
            Dead: {
                frames: 15,
                images: []
            },
            Idle: {
                frames: 15,
                images: []
            },
            Jump: {
                frames: 15,
                images: []
            },
            Run: {
                frames: 15,
                images: []
            },
            Walk: {
                frames: 15,
                images: []
            }
        }

        this.loadImages();

        //------------------
        this.runningSound = new Audio();  
        this.runningSound.src = "sounds/running.mp3";

        this.jumpSound = new Audio();
        this.jumpSound.src = "sounds/jump.mp3";

        this.deadSound = new Audio();
        this.deadSound.src = "sounds/dead.mp3";
    }

    loadImages(){
        Object.entries(this.animations).forEach((animation) => {
            for(let i = 1; i<= animation[1].frames; i++){
                let img = new Image();
                img.src = `player/${animation[0]} (${i}).png`;
                this.animations[animation[0]].images.push(img);
            }   
        })
    }

    draw(){
        if(!(this.animation == 'Dead' && this.frame == 14)){
            this.frame++;
        }
        if(this.frame >= this.animations[this.animation].frames){
            this.frame = 0;
        }

        if(this.speedY>0 && this.y < 160){
            this.y += this.speedY
        }

        if(this.speedY<0 && this.y > 40){
            this.y += this.speedY
        }

        let zoom = this.y-40;
        this.width = 200+zoom;
        this.height = 200+zoom;
        this.runningSound.volume = 0.2 + (zoom/400);

        ctx.drawImage(this.animations[this.animation].images[this.frame],
            this.x,
            this.y,
            this.width,
            this.height
        );

        /*
        ctx.strokeStyle = "red";
        ctx.strokeRect(this.x, this.y+this.height/1.3, this.width/3, this.height/8);

        let x = this.x;
        let x2 = this.x + this.width/3;
        let y = this.y + this.height/1.3;
        let y2 = this.y + this.height/1.3 + this.height/8;
        */

        if( this.x + this.width/3 > obstacle.x &&
            this.x < obstacle.x+obstacle.width &&
            this.y + this.height/1.3 < obstacle.y + obstacle.height &&
            this.y + this.height/1.3 + this.height/8 > obstacle.y
        ){
            speed = 0;
            if(this.animation != 'Dead'){
                this.animation = "Dead";
                this.runningSound.pause();
                this.deadSound.play();
            }
        }

        //Play sound
        if(this.animation == 'Run'){
            this.runningSound.loop = true;
            this.runningSound.play();
        }
    }
}

const player = new Player (100,100);

class Button{
    constructor(){
        this.show = true;
        this.width = 200;
        this.height = 100;
        this.img = new Image();
        this.img.src = "bg/start.png";
        this.img.onload = () => {
            this.draw();
        }
    }

    draw(){
        if(this.show){
            ctx.drawImage(
                this.img,
                canvas.width/2-this.width/2,
                canvas.height/2-this.height/2,
                this.width,
                this.height
            )
        }
    }
}

const startButton = new Button();

// Obstacle
class Obstacle{
    constructor(){
        this.x = canvas.width;
        this.y = 300;
        this.width = 100;
        this.height = 100;
        this.imgs = [];
        this.currentImage = 0;
        this.loadImages();
    }

    loadImages(){
        for (let i = 1; i <=4; i++){
            let img = new Image();
            img.src = `Stone/Stone ${i}.png`;
            this.imgs.push(img);
        }
    }

    randomNumber(min,max){
        return Math.floor(Math.random()*(max-min + 1) + min);
    }

    draw(){
        this.x -= speed;

        if(this.x< 0 - this.width){
            this.x = canvas.width;
            this.y = 300 + this.randomNumber(-200,100);
            this.currentImage = this.randomNumber(0,3);
            speed++;
            score.points++;
        }

        ctx.drawImage(this.imgs[this.currentImage], this.x, this.y, this.width, this.height);
    }
}

const obstacle = new Obstacle();

const score = {
    points: 0,
    draw: function(){
        ctx.fillStyle = 'black';
        ctx.font = "30px Arial";
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${this.points}`,30, 480);

        if(player.animation == "Dead"){
            ctx.textAlign = "center";
            ctx.font = "50px Arial";
            ctx.fillText("Game Over",canvas.width/2,canvas.height/2);

        }
    }
}

//------------------

setInterval(() => {
    ctx.clearRect(0,0,canvas.width,canvas.height)
    bg.draw();
    obstacle.draw();
    player.draw();
    startButton.draw();
    score.draw();
},1000/FPS)

document.addEventListener('keydown', (e) => {
    if(e.key == "ArrowUp"){
        player.speedY = -10;
    }
    if(e.key == "ArrowDown"){
        player.speedY = 10;
    }
    if(e.key == " "){
        player.animation = 'Jump';
        player.jumpSound.play();
        player.y -= 20;
        player.frame = 0;
        setTimeout(() => {
            player.y += 20;
            player.animation = "Run";
        },500)
    }
})

document.addEventListener('keyup', (e) => {
    if(e.key == "ArrowUp"){
        player.speedY = 0;
    }
    if(e.key == 'ArrowDown'){
        player.speedY = 0;
    }
})

canvas.addEventListener('click', (e) => {
    let x = e.clientX - canvas.getBoundingClientRect().left;
    let y = e.clientY - canvas.getBoundingClientRect().top;

    if( x > canvas.width/2 - startButton.width/2 &&
        x < canvas.width/2 + startButton.width/2 &&
        y > canvas.height/2 - startButton.height/2 &&
        y < canvas.height/2 + startButton.height/2){
            speed = 10;
            startButton.show = false;
            player.animation = "Run";
    }
})