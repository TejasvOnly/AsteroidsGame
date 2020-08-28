import Phaser from 'phaser';

import MainMenu from './scenes/MainMenu';
import GameScene from './scenes/GameScene';
import GameOver from './scenes/GameOver';

const config = {
	type: Phaser.AUTO,
	width: window.innerWidth - 20,
    height: window.innerHeight- 20,
    backgroundColor: '#2d2d2d',
	physics: {
		default: 'arcade',
		arcade: {
            gravity: { y: 0 },
            debug:false
		}
	},
	parent: 'phaser',
	dom: {
		createContainer: true
	},
	scene: [MainMenu,GameScene,GameOver]
}

export default new Phaser.Game(config);
