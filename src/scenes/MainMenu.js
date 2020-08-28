import Phaser from 'phaser';

const lbMock = [
    {name:'Player1', score:0},
    {name:'Player2', score:10},
    {name:'Player3', score:100},
    {name:'Player4', score:1000},
    {name:'Player5', score:10000},
    {name:'Player6', score:50},
    {name:'Player7', score:500},
    {name:'Player8', score:5000},
    {name:'Player9', score:50000}
]


export default class MainMenu extends Phaser.Scene{

    constructor(){
        super('menu-scene')
        this.playerName = undefined;
        this.leaderBoard = lbMock;
    
    }

    init(data){
        if(data.length){
            this.leaderBoard = data;
        }
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
    }
    
    loadData(){

        this.playerName = (localStorage.getItem('name'));
        
        this.leaderBoard.sort((a,b)=>{
            return b.score-a.score;
        });

    }
    
    createTitle(){
        var title = this.add.text(this.cameras.main.centerX, 60, 'Asteroids', { color: 'white', fontSize: '80px '}).setOrigin(0.5,0);
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
        
        
        var element = this.add.dom(this.cameras.main.centerX, this.cameras.main.height*0.35,'test',).createFromCache('InputField');
        var text = this.add.text(this.cameras.main.centerX, this.cameras.main.height*0.35 - (element.height/2), 'Enter your name:', { color: 'white', fontSize: '32px '}).setOrigin(0.5);
        
        if(this.playerName){
            element.getChildByName('nameField').setAttribute('placeholder',this.playerName);
        }

        element.getChildByName('playButton').setAttribute('class','btn');
        element.getChildByName('nameField').setAttribute('class','input-field');


        
        element.addListener('click');
        var parent = this;

        element.on('click', function (event) {
            
            console.log(parent.playerName)
            if (event.target.name === 'playButton'){

                console.log(parent.playerName)
                var inputText = this.getChildByName('nameField');
                if (inputText.value !== ''){

                    this.removeListener('click');
                    this.setVisible(false);
                    parent.playerName = inputText.value;
                    localStorage.setItem('name',parent.playerName);
                    text.setText(inputText.value + ', Get Ready!!');
                    parent.time.delayedCall(2000,parent.advance,null,parent);

                }else if(parent.playerName){
                        
                    this.removeListener('click');
                    this.setVisible(false);
                    text.setText('Welcome back ' + parent.playerName + ', Get Ready!!');
                    parent.time.delayedCall(2000,parent.advance,null,parent);

                }else{
                    
                        this.scene.tweens.add({
                        targets: text,
                        alpha: 0.2,
                        duration: 250,
                        ease: 'Power3',
                        yoyo: true

                    });
            
                }

            }

        });
    
    
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

    advance(){
        this.scene.start('game-scene',{player : this.playerName , lb : this.leaderBoard});
    }
}