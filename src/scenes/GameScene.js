import Phaser from 'phaser';




const graphicAssets = {
    ship:{URL:'assets/ship.png', name:'ship'},
    shipAnim:{
        name:'thrust',
        f1:{URL:'assets/ship1.png', name:'ship1'},
        f2:{URL:'assets/ship2.png', name:'ship2'},
        f3:{URL:'assets/ship3.png', name:'ship3'}
    },
    bullet:{URL:'assets/bullet.png', name:'bullet'},
    
    asteroidLarge:{URL:'assets/asteroidLarge.png', name:'asteroidLarge'},
    asteroidMedium:{URL:'assets/asteroidMedium.png', name:'asteroidMedium'},
    asteroidSmall:{URL:'assets/asteroidSmall.png', name:'asteroidSmall'},
    
    particles:{
        ship:{URL:'assets/shrapnel.png', name:'shrap'},
        asteroid:{URL:'assets/asteroidFragment.png', name:'asteroidFrag'}
    },

    powerups:{
        quantum:{URL:'assets/powerupquantumb.png', name:'quantum',display:'Quantum Bullets'},
        quick:{URL:'assets/powerupquickb.png', name:'quick',display:'Quick Bullets'},
        triple:{URL:'assets/poweruptripleb.png', name:'triple',display:'Triple Bullets'}
    },

    enemies:{
        station:{URL:'assets/enemy1.png', name:'station'},
        shuttle:{URL:'assets/enemy2.png', name:'shuttle'},
        turret:{URL:'assets/enemy3.png', name:'turret'}
    }

    
};


const shipProperties = {
    acceleration: 300,
    drag: 0.98,
    maxVelocity: 300,
    angularVelocity: 200,
    startingLives: 3,
    timeToReset: 2,
    blinkDelay: 0.2,
};
const objState = {
    dead : 0,
    alive : 1,
};
const bulletProperties = {
    speed: 400,
    interval: 250,
    lifeSpan: 1200,
    maxCount: 30,
};

const asteroidProperties = {
    startingAsteroids: 4,
    maxAsteroids: 20,
    incrementAsteroids: 2,
    
    asteroidLarge: { minVelocity: 50, maxVelocity: 150, minAngularVelocity: 0, maxAngularVelocity: 200, score: 20,qScore:600, nextSize: graphicAssets.asteroidMedium.name, pieces: 2, explosion:8 },
    asteroidMedium: { minVelocity: 50, maxVelocity: 200, minAngularVelocity: 0, maxAngularVelocity: 200, score: 50,qScore:300, nextSize: graphicAssets.asteroidSmall.name, pieces: 2, explosion:4 },
    asteroidSmall: { minVelocity: 50, maxVelocity: 300, minAngularVelocity: 0, maxAngularVelocity: 200, score: 100,qScore:150, explosion:2 }, 
};


const enemyProperties = {
    
    respawn:15,
    
    bullet:{
        speed: 500,
        interval: 300,
        lifeSpan: 1000,
        maxCount: 30
    },
    
    station: { minVelocity: 50, maxVelocity: 150, minAngularVelocity: 0, maxAngularVelocity: 200, score: 100, explosion:8 },
    shuttle: { minVelocity: 100, maxVelocity: 200, minAngularVelocity: 0, maxAngularVelocity: 200, score: 150, explosion:4 },
    turret: { minVelocity: 150, maxVelocity: 300, minAngularVelocity: 0, maxAngularVelocity: 0,score: 200, explosion:2 },

};


const powerupType = {
    none:0,
    triple:1,
    quick:2,
    quantum:3,
};

const powerupProperties = {
    respawn:20,
    despawn:8,
    lifeSpan:7

}
const fontAssets = {
    counterFontStyle:{font: '20px Arial', fill: '#FFFFFF', align: 'center'},
};


export default class GameScene extends Phaser.Scene{

    constructor()
	{
        super('game-scene');
        this.player = undefined;
        this.playerAnim = undefined;
        this.playerIsInvulnerable = undefined;
        this.cursors = undefined;
        this.bulletGroup = undefined;
        this.asteroidGroup = undefined;
        this.enemyGroup = undefined;
        this.enemyBulletGroup = undefined;
        this.deathParticles = undefined;
        this.destroyParticles = undefined;
        this.powerup = powerupType.none;
        this.powerupGroup = undefined;
        this.ui_lives = undefined;
        this.ui_score = undefined;
        this.ui_name = undefined;
        this.ui_power = undefined;
        
	}


    init(data){
        this.playerName = data.player;
        this.leaderBoard = data.lb;
        this.bulletInterval = 0;
        this.enemyBulletInterval = 0;
        this.asteroidsCount = asteroidProperties.startingAsteroids;
        this.shipLives = shipProperties.startingLives;
        this.score = 0;
    }
    
    preload(){

        this.load.image(graphicAssets.asteroidLarge.name, graphicAssets.asteroidLarge.URL);
        this.load.image(graphicAssets.asteroidMedium.name, graphicAssets.asteroidMedium.URL);
        this.load.image(graphicAssets.asteroidSmall.name, graphicAssets.asteroidSmall.URL);
        
        this.load.image(graphicAssets.bullet.name, graphicAssets.bullet.URL);
        this.load.image(graphicAssets.ship.name,graphicAssets.ship.URL);

        this.load.image(graphicAssets.shipAnim.f1.name,graphicAssets.shipAnim.f1.URL);
        this.load.image(graphicAssets.shipAnim.f2.name,graphicAssets.shipAnim.f2.URL);

        this.load.image(graphicAssets.particles.ship.name,graphicAssets.particles.ship.URL);
        this.load.image(graphicAssets.particles.asteroid.name,graphicAssets.particles.asteroid.URL);
        
        this.load.image(graphicAssets.powerups.quantum.name,graphicAssets.powerups.quantum.URL);
        this.load.image(graphicAssets.powerups.quick.name,graphicAssets.powerups.quick.URL);
        this.load.image(graphicAssets.powerups.triple.name,graphicAssets.powerups.triple.URL);

        this.load.image(graphicAssets.enemies.station.name,graphicAssets.enemies.station.URL);
        this.load.image(graphicAssets.enemies.shuttle.name,graphicAssets.enemies.shuttle.URL);
        this.load.image(graphicAssets.enemies.turret.name,graphicAssets.enemies.turret.URL);
        
        
    };

    create(){
        this.createPlayer();
        this.createBulletGroup();
        this.createAsteroidGroup();
        this.createPowerupGroup();
        this.createEnemyBulletGroup();
        this.createEnemyGroup();
        this.createUI();
        this.cursors = this.input.keyboard.createCursorKeys()
        this.createParticles();
        this.shipReady();

    }

    
    update(){

        this.checkPlayerInput();
        this.wrapAround();
        this.enemyFire();
        
	}

    createPlayer(){

        /** @type {Phaser.Physics.Arcade.Sprite} */
        const player = this.physics.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY, graphicAssets.ship.name)
        
        player.angle = -90;
        player.setOrigin(0.5);
        player.setBodySize(player.height,player.height,true);
        player.body.maxVelocity.set(shipProperties.maxVelocity);
		player.body.useDamping = true;
        player.body.setDrag(shipProperties.drag);
        player.state = objState.alive;

        const config = {
            key: graphicAssets.shipAnim.name,
            frames: [
                { key: graphicAssets.shipAnim.f1.name },
                { key: graphicAssets.shipAnim.f2.name },
                { key: graphicAssets.shipAnim.f3.name }
            ],
            frameRate: 3,
            yoyo: true,
            repeat: -1
        };
        const config1 = {
            key: graphicAssets.ship.name,
            frames: [
                { key: graphicAssets.ship.name }
            ],
            repeat: 0
        };
    
        this.anims.create(config);
        this.anims.create(config1);
        player.anims.load(graphicAssets.shipAnim.name);
        player.anims.load(graphicAssets.ship.name);
        
        this.player = player;
        
    }

    createBulletGroup(){
        /** @type {Phaser.Physics.Arcade.Group} */
        this.bulletGroup = this.physics.add.group()
        
        this.bulletGroup.createMultiple({active:false, quantity:bulletProperties.maxCount, key : graphicAssets.bullet.name});
        //this.bulletGroup.propertyValueSet('state', objState.alive);
        this.bulletGroup.getChildren().forEach(function(sprite) {
            sprite.disableBody(true,true);
            sprite.state = objState.alive;
        }, this);
        //console.log(this.bulletGroup)

    }

    createAsteroidGroup(){
        /** @type {Phaser.Physics.Arcade.Group} */
        this.asteroidGroup = this.physics.add.group()
        
        
        this.resetAsteroids();

        this.physics.add.overlap(this.bulletGroup,this.asteroidGroup,this.asteroidCollision,null,this);
        
        this.physics.add.overlap(this.player,this.asteroidGroup,this.asteroidCollision,null,this);
    }

    createPowerupGroup(){
        this.powerupGroup = this.physics.add.group();
        this.powerupGroup.create(-5,-5,graphicAssets.powerups.quantum.name);
        this.powerupGroup.create(-5,-5,graphicAssets.powerups.quick.name);
        this.powerupGroup.create(-5,-5,graphicAssets.powerups.triple.name);

        this.powerupGroup.getChildren().forEach(function(sprite) {
            sprite.disableBody(true,true);
            sprite.state = objState.alive;
        }, this);

        this.physics.add.overlap(this.player,this.powerupGroup,this.PoweredUp,null,this);

        this.time.delayedCall(3000,this.respawnPowerup,null,this);

    }

    createEnemyBulletGroup(){
        /** @type {Phaser.Physics.Arcade.Group} */
        this.enemyBulletGroup = this.physics.add.group()
        
        this.enemyBulletGroup.createMultiple({active:false, quantity:100, key : graphicAssets.bullet.name});
        
        this.enemyBulletGroup.getChildren().forEach(function(sprite) {
            sprite.disableBody(true,true);
            sprite.state = objState.alive;
        }, this);

    }

    createEnemyGroup(){
        this.enemyGroup = this.physics.add.group();
        this.enemyGroup.create(-5,-5,graphicAssets.enemies.station.name);
        this.enemyGroup.create(-5,-5,graphicAssets.enemies.shuttle.name);
        this.enemyGroup.create(-5,-5,graphicAssets.enemies.turret.name);

        this.enemyGroup.getChildren().forEach(function(sprite) {
            sprite.disableBody(true,true);
            sprite.state = objState.alive;
        }, this);

        this.physics.add.overlap(this.player,this.enemyGroup,this.enemyCollision,null,this);
        this.physics.add.overlap(this.player,this.enemyBulletGroup,this.destroyedShip,null,this);
        this.physics.add.overlap(this.asteroidGroup,this.enemyGroup,this.enemyCollision,null,this);
        this.physics.add.overlap(this.bulletGroup,this.enemyGroup,this.enemyCollision,null,this);

        this.time.delayedCall(1000*enemyProperties.respawn,this.spawnEnemy,null,this);

    }


    resetAsteroids() {
        for (var i=0; i < this.asteroidsCount; i++ ) {
            const side = Math.round(Math.random());
            var x;
            var y;
            
            if (side) {
                x = Math.round(Math.random()) * this.game.canvas.width;
                y = Math.random() * this.game.canvas.height;
            } else {
                x = Math.random() * this.game.canvas.width;
                y = Math.round(Math.random()) * this.game.canvas.height;
            }
            
            this.createAsteroid(x, y, graphicAssets.asteroidLarge.name);
        }
    }

    createAsteroid(x, y, size, pieces) {
        var rnd = Phaser.Math.RND;
        if (pieces === undefined) { pieces = 1; }
        
        for (var i=0; i<pieces; i++) {
            /** @type {Phaser.Physics.Arcade.Sprite} */
            var asteroid = this.asteroidGroup.create(x, y, size);
            asteroid.setOrigin(0.5, 0.5);
            asteroid.body.angularVelocity = rnd.integerInRange(asteroidProperties[size].minAngularVelocity, asteroidProperties[size].maxAngularVelocity);
            
            var randomAngle = Phaser.Math.DegToRad(rnd.angle());
            var randomVelocity = rnd.integerInRange(asteroidProperties[size].minVelocity, asteroidProperties[size].maxVelocity);

            this.physics.velocityFromRotation(randomAngle, randomVelocity, asteroid.body.velocity);
        }
    }

    createUI(){

        this.ui_lives = this.add.text(20, 10, shipProperties.startingLives, fontAssets.counterFontStyle);
        this.ui_name = this.add.text(20, this.cameras.main.height-10, this.playerName, fontAssets.counterFontStyle).setOrigin(0,1);

        this.ui_power = this.add.text(this.cameras.main.width-20, 10, ' ', fontAssets.counterFontStyle).setOrigin(1,0);
        
        this.ui_score = this.add.text(this.cameras.main.centerX, 10, "0", fontAssets.counterFontStyle);
        this.ui_score.align = 'right';
        this.ui_score.setOrigin(0.5, 0);
    }

    createParticles(){

        this.deathParticles = this.add.particles(graphicAssets.particles.ship.name);
        this.deathParticles.createEmitter({
            on:false,
            speed: 50,
            gravity: { x: 0, y: 0 },
            scale: { start: 1, end: 0.5 },
            rotate: { onEmit: function () { return Phaser.Math.RND.integerInRange(0,360); } }
        });
        this.destroyParticles = this.add.particles(graphicAssets.particles.asteroid.name);
        this.destroyParticles.createEmitter({
            on:false,
            speed: 50,
            gravity: { x: 0, y: 0 },
            scale: { start: 1, end: 0.25 },
            rotate: { onEmit: function () { return Phaser.Math.RND.integerInRange(0,360); } }
        });

    }

    checkPlayerInput(){
        
        if(Math.abs(this.player.body.angularVelocity)>200){
            this.player.body.angularVelocity *= 0.9;
        }
		if (this.cursors.left.isDown)
		{
           
            this.player.body.angularVelocity = -shipProperties.angularVelocity;

		}
		else if (this.cursors.right.isDown)
		{
            this.player.body.angularVelocity = shipProperties.angularVelocity;
		}
		else
		{
			this.player.body.angularVelocity *= 0.95;
		}

		if (this.cursors.up.isDown){
            this.player.anims.play(graphicAssets.shipAnim.name);
			this.physics.velocityFromRotation(this.player.rotation,shipProperties.acceleration,this.player.body.acceleration);
		}else {
            this.player.body.acceleration.set(0);
            this.player.anims.play(graphicAssets.ship.name);
        }

        if(this.cursors.space.isDown){
            this.fire(); 
        }
    }

    fire() {
        
        if (!this.player.active) {
            return;
        }
        
        if (this.time.now > this.bulletInterval) {
            
            /** @type {Phaser.Physics.Arcade.Sprite} */
            var bullet1 = this.bulletGroup.getFirstNth(1,false)
            var bullet2 = this.bulletGroup.getFirstNth(2,false)
            var bullet3 = this.bulletGroup.getFirstNth(3,false)
            if (bullet1) {
                var length = this.player.width * 0.5;
                var x = this.player.x + (Math.cos(this.player.rotation) * length);
                var y = this.player.y + (Math.sin(this.player.rotation) * length);


                bullet1.enableBody(true,x,y,true,true);
                bullet1.rotation = this.player.rotation;
                this.physics.velocityFromRotation(this.player.rotation, bulletProperties.speed, bullet1.body.velocity);
                this.time.delayedCall(bulletProperties.lifeSpan,this.killMeNow,[bullet1],this);

                if(this.powerup == powerupType.triple && bullet2 && bullet2){
                    bullet2.enableBody(true,x,y,true,true);
                    bullet3.enableBody(true,x,y,true,true);
                    bullet2.rotation = this.player.rotation+15;
                    bullet3.rotation = this.player.rotation-15;
                    
                    this.physics.velocityFromRotation(this.player.rotation+15, bulletProperties.speed, bullet2.body.velocity);
                    this.physics.velocityFromRotation(this.player.rotation-15, bulletProperties.speed, bullet3.body.velocity);

                    this.time.delayedCall(bulletProperties.lifeSpan,this.killMeNow,[bullet2],this);
                    this.time.delayedCall(bulletProperties.lifeSpan,this.killMeNow,[bullet3],this);
                }
                
                this.bulletInterval = this.time.now + bulletProperties.interval;
                if(this.powerup==powerupType.quantum){
                    this.bulletInterval+=500;
                }else if(this.powerup==powerupType.quick){
                    this.bulletInterval-=200;
                }
            }
        }
    }

    wrapAround(obj){
        const padding=5;
        this.physics.world.wrap(this.player,padding);
        this.physics.world.wrap(this.bulletGroup,padding);
        this.physics.world.wrap(this.asteroidGroup,padding);


    }
    asteroidCollision(/** @type {Phaser.Physics.Arcade.Sprite} */target,asteroid){
        
        
        if(target== this.player){
            if (this.shipIsInvulnerable) {
                return;
            }else {
                //console.log("yes");
                this.killMeNow(target); 
                this.destroyShip();
            }
        }else{
            this.killMeNow(target);
            target.state = objState.dead;
        }
        
        asteroid.destroy();
        if(this.powerup!=powerupType.quantum){
            this.splitAsteroid(asteroid);
            this.updateScore(asteroidProperties[asteroid.texture.key].score);
        }else{
            this.updateScore(asteroidProperties[asteroid.texture.key].qScore);
        }

        if (!this.asteroidGroup.countActive()) {
            this.time.delayedCall(1000 * 3, this.nextLevel,[],this);
        }


        var particleCount = asteroidProperties[asteroid.texture.key].explosion;
        this.destroyParticles.emitParticleAt(asteroid.x,asteroid.y,particleCount);
    } 

    enemyCollision(target,enemy){
        if(this.asteroidGroup.contains(target)){
            this.asteroidCollision(enemy,target);
        }else if(target== this.player){
            if (this.shipIsInvulnerable) {
                return;
            }else {
                //console.log("yes");
                this.killMeNow(target); 
                this.destroyShip();
                this.killMeNow(enemy);
            }
        }else{
            this.killMeNow(target);
            target.state = objState.dead;
            this.killMeNow(enemy);
        }

        this.updateScore(enemyProperties[enemy.texture.key].score);
        this.deathParticles.emitParticleAt(enemy.x,enemy.y,enemyProperties[enemy.texture.key].explosion);

    }
    PoweredUp(target,/** @type {Phaser.Physics.Arcade.Sprite} */power){
        //console.log(power);
        this.powerup = powerupType[power.texture.key];
        this.ui_power.setText(graphicAssets.powerups[power.texture.key].display);

        this.killMeNow(power);
        power.state = objState.dead;

        this.time.delayedCall(1000 * powerupProperties.lifeSpan,this.resetPowerup,null,this);

    }

    resetPowerup(){
        this.powerup = powerupType.none;
        this.ui_power.setText(' ');
    }

    respawnPowerup(){
        var chosen = Phaser.Math.RND.integerInRange(0,2);
        if(chosen<this.powerupGroup.getLength()){
            var power = this.powerupGroup.getFirstNth(chosen,false)
            power.enableBody(true,Math.random() * this.game.canvas.width,Math.random() * this.game.canvas.height,true,true);
            this.time.delayedCall(1000*powerupProperties.despawn,this.killMeNow,[power],this);
        }
        //console.log(chosen);

        this.time.delayedCall(1000 * powerupProperties.respawn,this.respawnPowerup,null,this);
    }

    spawnEnemy(){
        const rnd =Phaser.Math.RND;
        var chosen = rnd.integerInRange(0,2);
        var x,y;

        if(rnd.integerInRange(0,1)){
            x = 1 + rnd.integerInRange(0,1)*(this.game.canvas.width -2);
            y = Math.random()*this.game.canvas.height;
        }else{
            y = 1 + rnd.integerInRange(0,1)*(this.game.canvas.height -2);
            x = Math.random()*this.game.canvas.width;
        }

        if(chosen<this.enemyGroup.getLength()){
            /** @type {Phaser.Physics.Arcade.Sprite} */
            var enemy = this.enemyGroup.getFirstNth(chosen,false)
            // console.log(enemy);
            var type = enemy.texture.key;
            
            enemy.enableBody(true,x,y,true,true);
            
            enemy.setOrigin(0.5, 0.5);

            enemy.body.angularVelocity = rnd.integerInRange(enemyProperties[type].minAngularVelocity, enemyProperties[type].maxAngularVelocity);
            var randomVelocity = rnd.integerInRange(enemyProperties[type].minVelocity, enemyProperties[type].maxVelocity);
            
            var Angle = Phaser.Math.Angle.BetweenPoints(enemy.body.position,{x:this.game.canvas.width/2,y:this.game.canvas.height/2});

            this.physics.velocityFromRotation(Angle, randomVelocity, enemy.body.velocity);
            

        }

        //console.log(chosen);

        this.time.delayedCall(1000 * enemyProperties.respawn,this.spawnEnemy,null,this);

    }

    enemyFire(){

        /** @type {Phaser.Physics.Arcade.Sprite} */
        var enemy = this.enemyGroup.getFirst(true);

        if(!enemy){
            return;
        }
        

        if(!Phaser.Geom.Rectangle.Overlaps(this.physics.world.bounds, enemy.getBounds())){
            // console.log('killed');
            this.killMeNow(enemy);
            return;
        }
        
        var type = enemy.texture.key;

        if (this.time.now > this.enemyBulletInterval) {
            
            /** @type {Phaser.Physics.Arcade.Sprite} */
            var bullet1 = this.enemyBulletGroup.getFirstNth(1,false)
            var bullet2 = this.enemyBulletGroup.getFirstNth(2,false)
            var bullet3 = this.enemyBulletGroup.getFirstNth(3,false)
            var bullet4 = this.enemyBulletGroup.getFirstNth(4,false)

            if (bullet1) {
                var length = enemy.width * 0.5;
                var x = enemy.x + (Math.cos(enemy.rotation) * length);
                var y = enemy.y + (Math.sin(enemy.rotation) * length);

                if(type==graphicAssets.enemies.turret.name){
                    enemy.rotation = Phaser.Math.Angle.BetweenPoints(enemy.body.position,this.player.body.position);
                }

                bullet1.enableBody(true,x,y,true,true);
                bullet1.rotation = enemy.rotation;
                this.physics.velocityFromRotation(enemy.rotation, enemyProperties.bullet.speed, bullet1.body.velocity);
                this.time.delayedCall(enemyProperties.bullet.lifeSpan,this.killMeNow,[bullet1],this);



                if(type!=graphicAssets.enemies.turret.name && bullet2 && bullet3){
                    bullet2.enableBody(true,x,y,true,true);
                    bullet3.enableBody(true,x,y,true,true);
                    bullet2.rotation = enemy.rotation+Phaser.Math.DegToRad(90);
                    bullet3.rotation = enemy.rotation-Phaser.Math.DegToRad(180);
                    
                    this.physics.velocityFromRotation(bullet2.rotation, enemyProperties.bullet.speed, bullet2.body.velocity);
                    this.physics.velocityFromRotation(bullet3.rotation, enemyProperties.bullet.speed, bullet3.body.velocity);

                    this.time.delayedCall(enemyProperties.bullet.lifeSpan,this.killMeNow,[bullet2],this);
                    this.time.delayedCall(enemyProperties.bullet.lifeSpan,this.killMeNow,[bullet3],this);
                }
                
                if(type==graphicAssets.enemies.station.name && bullet4){
                    bullet4.enableBody(true,x,y,true,true);
                    bullet4.rotation = enemy.rotation-Phaser.Math.DegToRad(90);;
                    this.physics.velocityFromRotation(bullet4.rotation, enemyProperties.bullet.speed, bullet4.body.velocity);
                    this.time.delayedCall(enemyProperties.bullet.lifeSpan,this.killMeNow,[bullet4],this);
                }

                this.enemyBulletInterval = this.time.now + enemyProperties.bullet.interval;
                
            }
        }

    }

    destroyedShip(target,bullet){
        if (this.shipIsInvulnerable) {
            return;
        }else {
            //console.log("yes");
            this.killMeNow(target); 
            this.destroyShip();
            this.killMeNow(bullet);
        }
    }

    destroyShip() {
        this.shipLives --;
        this.ui_lives.text = this.shipLives;

        if (this.shipLives>0) {
            this.deathParticles.emitParticleAt(this.player.x,this.player.y,3);
            this.time.delayedCall(1000 * shipProperties.timeToReset, this.shipReset,[],this);
        } else {
            this.time.delayedCall(1000 * shipProperties.timeToReset, this.endGame,[],this);
        }
    }
    shipReset(){
        this.shipIsInvulnerable = true;
        this.player.enableBody(true,this.cameras.main.centerX,this.cameras.main.centerY,true,true);

        this.time.delayedCall(1000 * shipProperties.timeToReset+2*shipProperties.blinkDelay, this.shipReady,[],this);

        this.tweens.add({
            targets : this.player,
            duration: 1000 *shipProperties.blinkDelay,
            ease: 'ease',
            yoyo: true,
            repeat: shipProperties.timeToReset/2*shipProperties.blinkDelay + 1,
            alpha:0
        })

    }
    shipReady() {
        this.player.visible = true;
        this.shipIsInvulnerable = false;
       //console.log("ready");
        
    }

    splitAsteroid(asteroid) {
        
        if (asteroidProperties[asteroid.texture.key].nextSize) {
            this.createAsteroid(asteroid.x, asteroid.y, asteroidProperties[asteroid.texture.key].nextSize, asteroidProperties[asteroid.texture.key].pieces);
        }
    }
    updateScore(score){
        this.score += score;
        this.ui_score.text = this.score;
    }

    nextLevel() {
        this.asteroidGroup.clear(true);
        
        if (this.asteroidsCount < asteroidProperties.maxAsteroids) {
            this.asteroidsCount += asteroidProperties.incrementAsteroids;
        }
        
        this.resetAsteroids();
    }

    killMeNow(/** @type {Phaser.Physics.Arcade.Sprite} */target){
        if(target.state == objState.alive && target.active){
            target.disableBody(true,true);
        }else{
            //console.log(target,target.texture.key);
            target.state = objState.alive;
        }
    }
     
    endGame(){
        var tester = -1;
        this.leaderBoard.forEach(element => {
            if(element.name==this.playerName){
                tester = element.score;
            }
        });

        if(tester<this.score){
            this.leaderBoard.push({name:this.playerName,score:this.score});
        }
        this.scene.start('game-over',{player : this.playerName , score : this.score,lB:this.leaderBoard});
    }
}