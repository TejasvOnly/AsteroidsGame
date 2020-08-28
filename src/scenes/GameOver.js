import Phaser from 'phaser';

export default class GameOver extends Phaser.Scene{

    constructor()
	{
        super('game-over')
        this.cursors = undefined;
	}

    init(data){
        this.playerName = data.player;
        this.playerScore = data.score;
        this.leaderBoard = data.lB;
    }

    preload(){
        this.load.html('InputField', 'assets/Input.html');
        this.load.css('test','assets/test.css');
    }

    create(){
        this.loadData();
        this.createTitle();
        this.createNameDialog();
        this.createLeaderBoard();
        
        this.cursors = this.input.keyboard.createCursorKeys();
    }
    
    loadData(){

        this.playerName = (localStorage.getItem('name'));
        
        this.leaderBoard.sort((a,b)=>{
            return b.score-a.score;
        })

    }
    
    createTitle(){
        var title = this.add.text(this.cameras.main.centerX, 60, 'Game Over', { color: 'white', fontSize: '80px '}).setOrigin(0.5,0);
        title.rotation = Phaser.Math.DegToRad(-3);
        this.tweens.add({
            targets: title,
            duration: 1000,
            ease: 'ease',
            yoyo: true,
            repeat: -1,
            rotation: Phaser.Math.DegToRad(3),
        });
    }

    createNameDialog(){
        
        
        
        var Score = this.add.text(this.cameras.main.centerX, this.cameras.main.height*0.35, this.playerScore.toString(), { color: 'white', fontSize: '80px '}).setOrigin(0.5,1);
        var text = this.add.text(this.cameras.main.centerX, Score.y-Score.height-40, 'Your Score:', { color: 'white', fontSize: '32px '}).setOrigin(0.5);
        var info = this.add.text(this.cameras.main.centerX, Score.y+Score.height, 'Press Space to Continue.', { color: 'white', fontSize: '25px '}).setOrigin(0.5);
        
    
    }

    createLeaderBoard(){
        const padding = 10;
        const entryHeight = 25;
        const xPos = this.cameras.main.centerX;
        var yPos = this.cameras.main.height*0.6 ;

        var lB = this.add.text(xPos,yPos,'LeaderBoard',{ color: 'white', fontSize: '40px' }).setOrigin(0.5,0);
        yPos += lB.height + padding*4;

        for (let index = 0; index < 5; index++) {
            this.add.text(xPos,yPos,this.leaderBoard[index].name + ' : ' + this.leaderBoard[index].score.toString(),{ color: 'white', fontSize: entryHeight.toString()+'px' }).setOrigin(0.5,0);
            yPos += padding+entryHeight;
        }
        

    }

    update(){

        if(this.cursors.space.isDown){
            this.advance();
        }

    }

    advance(){
        this.scene.start('menu-scene',this.leaderBoard);
    }
}