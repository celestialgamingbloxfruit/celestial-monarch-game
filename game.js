const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 700,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 400 },
            debug: false,
            enableBody: true
        }
    },
    scene: GameScene,
    render: { pixelArt: true }
};

const game = new Phaser.Game(config);

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        // Game Variables
        this.currentChapter = 1;
        this.playerHealth = 100;
        this.playerMaxHealth = 100;
        this.playerSpeed = 300;
        
        // Power-ups
        this.hasRumbleFruit = false;
        this.v4PowerActive = false;
        this.v4PowerDuration = 0;
        this.v4PowerMaxDuration = 4000; // 4 seconds
        this.sanguineArtActive = false;
        
        // Combat
        this.canAttack = true;
        this.attackCooldown = 500;
        this.lastAttackTime = 0;
        
        // Enemies & Bosses
        this.enemies = [];
        this.boss = null;
        this.bossHealth = 0;
        this.bossDamageDelay = 0;
        
        // Story
        this.witch = null;
        this.bestFriend = null;
        this.storyProgression = 0;
        this.gameOver = false;
        this.gameWon = false;
        
        // UI
        this.dialogueActive = false;
        this.currentDialogueIndex = 0;
    }

    preload() {
        this.showLoadingScreen();
    }

    create() {
        this.hideLoadingScreen();
        
        // Background
        this.cameras.main.setBackgroundColor('#0a0a1a');
        this.add.rectangle(600, 350, 1200, 700).setFillStyle(0x1a1a4d).setDepth(0);
        
        // Ground
        this.ground = this.add.rectangle(600, 670, 1200, 60).setFillStyle(0x2a2a5a);
        this.physics.add.existing(this.ground, true);
        
        // Player
        this.createPlayer();
        
        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = {
            a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            z: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
            x: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
            c: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C),
            f: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
            enter: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
        };
        
        // HUD
        this.createHUD();
        
        // Start Game
        this.startChapter(1);
    }

    update() {
        if (this.gameOver || this.gameWon) return;
        
        this.handlePlayerMovement();
        this.handlePlayerAttacks();
        this.updateEnemies();
        this.updateBoss();
        this.updateV4Power();
        this.updateHUD();
    }

    // ==================== LOADING ====================
    showLoadingScreen() {
        if (document.getElementById('loadingScreen')) return;
        
        const html = `
            <div id="loadingScreen" style="
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: linear-gradient(135deg, #0a0a1a 0%, #1a1a4d 100%);
                display: flex; flex-direction: column; justify-content: center; align-items: center;
                z-index: 9999; color: #e94560;
            ">
                <div style="font-size: 48px; font-weight: bold; margin-bottom: 40px; text-shadow: 0 0 20px #e94560;">
                    CELESTIAL<br>MONARCH
                </div>
                <div style="width: 300px; height: 30px; border: 2px solid #e94560; border-radius: 15px; overflow: hidden; margin-bottom: 20px;">
                    <div id="loadingFill" style="height: 100%; background: linear-gradient(90deg, #e94560, #ff6b9d); width: 0%; transition: width 0.2s;"></div>
                </div>
                <div>Loading... Chapter 1</div>
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', html);
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress > 100) progress = 100;
            const fill = document.getElementById('loadingFill');
            if (fill) fill.style.width = progress + '%';
            if (progress === 100) clearInterval(interval);
        }, 300);
    }

    hideLoadingScreen() {
        const screen = document.getElementById('loadingScreen');
        if (screen) {
            screen.style.opacity = '0';
            screen.style.transition = 'opacity 0.5s';
            setTimeout(() => screen.remove(), 500);
        }
    }

    // ==================== PLAYER ====================
    createPlayer() {
        this.player = this.add.rectangle(200, 550, 40, 60, 0xe94560);
        this.physics.add.existing(this.player);
        this.player.body.setBounce(0);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.onWorldBounds = true;
        this.physics.add.collider(this.player, this.ground);
        
        this.player.isAttacking = false;
    }

    handlePlayerMovement() {
        let moving = false;
        
        if (this.keys.a.isDown) {
            this.player.body.setVelocityX(-this.playerSpeed);
            moving = true;
        } else if (this.keys.d.isDown) {
            this.player.body.setVelocityX(this.playerSpeed);
            moving = true;
        } else {
            this.player.body.setVelocityX(0);
        }
        
        if (this.keys.space.isDown && this.player.body.touching.down) {
            this.player.body.setVelocityY(-500);
        }
    }

    handlePlayerAttacks() {
        const now = this.time.now;
        
        // Z - Normal Attack
        if (this.keys.z.isDown && (now - this.lastAttackTime > this.attackCooldown)) {
            this.performNormalAttack();
            this.lastAttackTime = now;
        }
        
        // X - Rumble Fruit (Lightning)
        if (this.hasRumbleFruit && this.keys.x.isDown) {
            this.performRumbleFruitAttack();
        }
        
        // C - V4 Power
        if (this.keys.c.isDown && !this.v4PowerActive && this.currentChapter >= 3) {
            this.activateV4Power();
        }
        
        // F - Sanguine Art
        if (this.keys.f.isDown && this.currentChapter >= 5) {
            this.performSanguineArt();
        }
    }

    performNormalAttack() {
        const attackHitbox = this.add.rectangle(this.player.x + 50, this.player.y, 60, 50, 0xff6b6b);
        this.physics.add.existing(attackHitbox);
        attackHitbox.setAlpha(0.5);
        
        // Damage enemies
        this.enemies.forEach(enemy => {
            const dist = Phaser.Math.Distance.Between(
                attackHitbox.x, attackHitbox.y,
                enemy.x, enemy.y
            );
            if (dist < 100) {
                enemy.health -= 30;
                enemy.setFillStyle(0xff0000);
                this.time.delayedCall(100, () => enemy.setFillStyle(0x00aa00));
            }
        });
        
        // Damage boss
        if (this.boss && this.bossHealth > 0) {
            const dist = Phaser.Math.Distance.Between(
                attackHitbox.x, attackHitbox.y,
                this.boss.x, this.boss.y
            );
            if (dist < 120) {
                this.bossHealth -= 25;
                this.boss.setFillStyle(0xff0000);
                this.time.delayedCall(100, () => this.boss.setFillStyle(0xff0000));
            }
        }
        
        this.time.delayedCall(100, () => attackHitbox.destroy());
    }

    performRumbleFruitAttack() {
        if (this.player.rumbleCooldown) return;
        
        this.showDialogue('PLAYER', 'RUMBLE FRUIT ATTACK!', 1000);
        
        for (let i = 0; i < 5; i++) {
            const lightning = this.add.rectangle(
                this.player.x + Phaser.Math.Between(-150, 150),
                this.player.y - 100,
                30, 100, 0xffff00
            );
            this.physics.add.existing(lightning);
            lightning.setAlpha(0.7);
            
            // Damage all enemies
            this.enemies.forEach(enemy => {
                const dist = Phaser.Math.Distance.Between(lightning.x, lightning.y, enemy.x, enemy.y);
                if (dist < 150) {
                    enemy.health -= 50;
                }
            });
            
            // Damage boss
            if (this.boss && this.bossHealth > 0) {
                const dist = Phaser.Math.Distance.Between(lightning.x, lightning.y, this.boss.x, this.boss.y);
                if (dist < 150) {
                    this.bossHealth -= 40;
                }
            }
            
            this.time.delayedCall(150, () => lightning.destroy());
        }
        
        this.player.rumbleCooldown = true;
        this.time.delayedCall(2000, () => {
            this.player.rumbleCooldown = false;
        });
    }

    activateV4Power() {
        this.v4PowerActive = true;
        this.v4PowerDuration = this.v4PowerMaxDuration;
        this.showDialogue('NAFISA', 'V4 POWER ACTIVATED!', 1000);
        
        this.player.setFillStyle(0xff00ff);
        this.playerSpeed = 450; // Faster movement
    }

    updateV4Power() {
        if (this.v4PowerActive) {
            this.v4PowerDuration -= 16; // ~60fps
            
            if (this.v4PowerDuration <= 0) {
                this.v4PowerActive = false;
                this.player.setFillStyle(0xe94560);
                this.playerSpeed = 300;
            }
        }
    }

    performSanguineArt() {
        if (this.player.sanguineCooldown) return;
        
        this.showDialogue('PLAYER', 'SANGUINE ART!', 1000);
        
        // Create ghost army
        for (let i = 0; i < 12; i++) {
            const ghost = this.add.rectangle(
                this.player.x + Phaser.Math.Between(-200, 200),
                this.player.y + Phaser.Math.Between(-150, 150),
                30, 40, 0x8b0000
            );
            ghost.setAlpha(0.6);
            
            // Massive damage
            this.enemies.forEach(enemy => {
                const dist = Phaser.Math.Distance.Between(ghost.x, ghost.y, enemy.x, enemy.y);
                if (dist < 200) {
                    enemy.health -= 100;
                }
            });
            
            if (this.boss && this.bossHealth > 0) {
                const dist = Phaser.Math.Distance.Between(ghost.x, ghost.y, this.boss.x, this.boss.y);
                if (dist < 200) {
                    this.bossHealth -= 80;
                }
            }
            
            this.time.delayedCall(400, () => ghost.destroy());
        }
        
        this.player.sanguineCooldown = true;
        this.time.delayedCall(3000, () => {
            this.player.sanguineCooldown = false;
        });
    }

    // ==================== ENEMIES ====================
    spawnZombie(x = 1000, count = 1) {
        for (let i = 0; i < count; i++) {
            const zombie = this.add.rectangle(
                x + Phaser.Math.Between(-100, 100),
                550,
                35, 60,
                0x00aa00
            );
            this.physics.add.existing(zombie);
            zombie.body.setBounce(0);
            zombie.body.setCollideWorldBounds(true);
            this.physics.add.collider(zombie, this.ground);
            
            zombie.health = 60;
            zombie.speed = Phaser.Math.Between(100, 180);
            zombie.moveDirection = -1;
            zombie.isEnemy = true;
            
            this.enemies.push(zombie);
        }
    }

    updateEnemies() {
        this.enemies = this.enemies.filter(e => e && e.active);
        
        this.enemies.forEach(enemy => {
            if (!enemy.active) return;
            
            // Movement
            enemy.body.setVelocityX(enemy.moveDirection * enemy.speed);
            
            // Change direction at screen edges
            if (enemy.x < 50) enemy.moveDirection = 1;
            if (enemy.x > 1150) enemy.moveDirection = -1;
            
            // Die if health <= 0
            if (enemy.health <= 0) {
                enemy.destroy();
                return;
            }
            
            // Damage player on contact
            const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
            if (dist < 60) {
                if (!this.lastPlayerDamageTime || this.time.now - this.lastPlayerDamageTime > 500) {
                    this.playerHealth -= 5;
                    this.lastPlayerDamageTime = this.time.now;
                }
            }
            
            // Check if player dead
            if (this.playerHealth <= 0) {
                this.playerHealth = 0;
                this.gameOver = true;
                this.showGameOver();
            }
        });
    }

    // ==================== BOSS ====================
    createBoss() {
        this.boss = this.add.rectangle(1000, 300, 100, 120, 0xff0000);
        this.physics.add.existing(this.boss);
        this.boss.body.setCollideWorldBounds(true);
        this.boss.body.setBounce(0.5);
        this.physics.add.collider(this.boss, this.ground);
        
        this.bossHealth = 500;
        this.boss.speed = 150;
        this.boss.moveDirection = -1;
        
        // Boss AI
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (this.boss && this.bossHealth > 0) {
                    this.boss.body.setVelocityX(this.boss.moveDirection * this.boss.speed);
                    
                    if (this.boss.x < 100) this.boss.moveDirection = 1;
                    if (this.boss.x > 1100) this.boss.moveDirection = -1;
                    
                    if (Math.random() > 0.5) {
                        this.boss.body.setVelocityY(-300);
                    }
                }
            },
            loop: true
        });
    }

    updateBoss() {
        if (!this.boss || this.bossHealth <= 0) return;
        
        // Damage player on contact
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.boss.x, this.boss.y);
        if (dist < 100) {
            if (!this.lastPlayerDamageTime || this.time.now - this.lastPlayerDamageTime > 1000) {
                this.playerHealth -= 15;
                this.lastPlayerDamageTime = this.time.now;
            }
        }
        
        // Boss defeated
        if (this.bossHealth <= 0) {
            this.boss.destroy();
            this.boss = null;
            this.time.delayedCall(1000, () => this.advanceChapter());
        }
    }

    // ==================== CHAPTER SYSTEM ====================
    startChapter(chapter) {
        this.currentChapter = chapter;
        this.enemies = [];
        
        switch(chapter) {
            case 1:
                this.showDialogue('NARRATOR', 'আপনি বিশ্বস্ত স্কোয়াডের সাথে একটি ট্র্যাভেল বাসে যাচ্ছেন... হঠাৎ একটি হিংস্র চেলা আপনাকে আক্রমণ করে!', 3000);
                this.time.delayedCall(3500, () => this.spawnZombie(1000, 2));
                this.time.delayedCall(6000, () => this.advanceChapter());
                break;
                
            case 2:
                this.showDialogue('NAFISA', 'সাহায্য করুন! আমি এই অন্ধকার কারাগারে বন্দি!', 3000);
                this.createWitch();
                this.time.delayedCall(3000, () => this.showDialogue('NAFISA', 'আপনি আমাকে বাঁচিয়েছেন! আমি Nafisa, একজন জাদুকরী।', 2000));
                this.time.delayedCall(5500, () => this.advanceChapter());
                break;
                
            case 3:
                this.showDialogue('NAFISA', 'এই Rumble Fruit নিন! এটি আপনাকে বিদ্যুৎ শক্তি দেবে!', 3000);
                this.hasRumbleFruit = true;
                this.time.delayedCall(3500, () => this.showDialogue('PLAYER', 'ধন্যবাদ! এখন আমরা একসাথে লড়াই করব!', 2000));
                this.time.delayedCall(5500, () => this.advanceChapter());
                break;
                
            case 4:
                this.showDialogue('NARRATOR', 'শত শত জম্বি আসছে! প্রস্তুত হোন!', 2000);
                this.time.delayedCall(2500, () => this.spawnZombie(1100, 8));
                this.time.delayedCall(8000, () => {
                    if (this.enemies.length > 0) {
                        this.time.delayedCall(3000, () => this.updateChapter4());
                    } else {
                        this.advanceChapter();
                    }
                });
                break;
                
            case 5:
                this.showDialogue('NARRATOR', 'চূড়ান্ত বস আসছে!', 2000);
                this.time.delayedCall(2500, () => {
                    this.createBoss();
                    this.showDialogue('BOSS', 'আমি আপনার নিয়তি!', 2000);
                });
                break;
                
            case 6:
                this.showDialogue('NARRATOR', 'বিস্ফোরণ! বস জীবিত আছে - এটি আসলে আপনার বন্ধু!', 3000);
                this.time.delayedCall(3500, () => this.showDialogue('BEST FRIEND', 'আমি বস-এর পেটের ভিতরে ছিলাম সব সময়!', 2000));
                this.time.delayedCall(5500, () => this.advanceChapter());
                break;
                
            case 7:
                this.showDialogue('NARRATOR', 'বিজয়! হেলিকপ্টার আসছে!', 2000);
                this.time.delayedCall(2500, () => {
                    this.gameWon = true;
                    this.showHappyEnding();
                });
                break;
        }
    }

    updateChapter4() {
        if (this.enemies.length === 0) {
            this.showDialogue('NAFISA', 'দুর্দান্ত! এখন চূড়ান্ত বসের সময়!', 2000);
            this.time.delayedCall(2500, () => this.advanceChapter());
        }
    }

    advanceChapter() {
        if (this.currentChapter < 7) {
            this.startChapter(this.currentChapter + 1);
        }
    }

    createWitch() {
        this.witch = this.add.rectangle(1000, 550, 35, 55, 0xff69b4);
        this.physics.add.existing(this.witch);
        this.witch.body.setBounce(0);
        this.physics.add.collider(this.witch, this.ground);
    }

    // ==================== HUD ====================
    createHUD() {
        if (document.getElementById('game-hud')) return;
        
        const hud = `
            <div id="game-hud" style="
                position: fixed; top: 20px; left: 20px;
                color: #e94560; font-size: 16px; z-index: 100;
                text-shadow: 0 0 10px rgba(0,0,0,0.8); font-family: Arial, sans-serif;
            ">
                <div style="margin-bottom: 10px; font-weight: bold;">❤️ Health:</div>
                <div style="width: 200px; height: 20px; border: 2px solid #e94560; background: rgba(0,0,0,0.5); border-radius: 10px; overflow: hidden; margin-bottom: 15px;">
                    <div id="health-bar-fill" style="height: 100%; background: linear-gradient(90deg, #ff6b6b, #ff8c8c); width: 100%; transition: width 0.2s;"></div>
                </div>
                <div style="margin-bottom: 5px;" id="chapter-text">Chapter 1</div>
                <div style="margin-bottom: 5px;" id="power-text">X: Rumble | C: V4 | F: Sanguine</div>
                <div id="boss-health" style="display: none; margin-top: 15px;">
                    <div style="margin-bottom: 5px;">BOSS HP:</div>
                    <div style="width: 200px; height: 15px; border: 2px solid #ff0000; background: rgba(0,0,0,0.5); border-radius: 5px; overflow: hidden;">
                        <div id="boss-bar-fill" style="height: 100%; background: #ff0000; width: 100%; transition: width 0.2s;"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', hud);
    }

    updateHUD() {
        // Health bar
        const healthPercent = Math.max(0, (this.playerHealth / this.playerMaxHealth) * 100);
        const healthFill = document.getElementById('health-bar-fill');
        if (healthFill) healthFill.style.width = healthPercent + '%';
        
        // Chapter text
        const chapterText = document.getElementById('chapter-text');
        if (chapterText) {
            const chapters = [
                'Chapter 1: Ambush',
                'Chapter 2: Prison',
                'Chapter 3: Rumble Fruit',
                'Chapter 4: Zombie Waves',
                'Chapter 5: Boss Fight',
                'Chapter 6: Twisted Truth',
                'Chapter 7: Rescue'
            ];
            chapterText.textContent = chapters[this.currentChapter - 1] || 'Game Over';
        }
        
        // Boss health
        if (this.boss && this.bossHealth > 0) {
            document.getElementById('boss-health').style.display = 'block';
            const bossPercent = Math.max(0, (this.bossHealth / 500) * 100);
            const bossFill = document.getElementById('boss-bar-fill');
            if (bossFill) bossFill.style.width = bossPercent + '%';
        } else {
            document.getElementById('boss-health').style.display = 'none';
        }
    }

    // ==================== DIALOGUE ====================
    showDialogue(character, text, duration = 3000) {
        let dialogueBox = document.querySelector('#game-dialogue');
        if (!dialogueBox) {
            dialogueBox = document.createElement('div');
            dialogueBox.id = 'game-dialogue';
            document.body.appendChild(dialogueBox);
        }
        
        dialogueBox.style.cssText = `
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.95); border: 2px solid #e94560;
            border-radius: 10px; padding: 20px; max-width: 600px;
            color: #fff; font-size: 16px; z-index: 100;
            box-shadow: 0 0 20px rgba(233, 69, 96, 0.6);
            font-family: Arial, sans-serif;
        `;
        
        dialogueBox.innerHTML = `
            <div style="color: #e94560; font-weight: bold; margin-bottom: 10px;">${character}</div>
            <div>${text}</div>
        `;
        
        dialogueBox.style.display = 'block';
        
        if (duration > 0) {
            this.time.delayedCall(duration, () => {
                dialogueBox.style.display = 'none';
            });
        }
    }

    // ==================== ENDINGS ====================
    showGameOver() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.95); display: flex;
            flex-direction: column; justify-content: center; align-items: center;
            color: #e94560; font-size: 28px; z-index: 10000; text-align: center;
            font-family: Arial, sans-serif;
        `;
        
        overlay.innerHTML = `
            <h1 style="font-size: 48px; margin-bottom: 30px;">💀 Game Over 💀</h1>
            <p style="margin-bottom: 30px;">আপনি পরাজিত হয়েছেন...</p>
            <button onclick="location.reload()" style="
                padding: 15px 40px; font-size: 18px; background: #e94560;
                border: none; color: white; border-radius: 10px;
                cursor: pointer; transition: 0.3s;
            " onmouseover="this.style.background='#ff6b9d'" onmouseout="this.style.background='#e94560'">
                Restart Game
            </button>
        `;
        
        document.body.appendChild(overlay);
    }

    showHappyEnding() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(233,69,96,0.3));
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            color: #e94560; z-index: 10000; text-align: center;
            font-family: Arial, sans-serif;
        `;
        
        overlay.innerHTML = `
            <h1 style="font-size: 56px; margin-bottom: 30px; animation: pulse 1s infinite;">🎊 Happy Ending! 🎊</h1>
            <p style="font-size: 24px; margin-bottom: 20px;">আপনি এবং Nafisa বিজয়ী!</p>
            <p style="font-size: 20px; margin-bottom: 20px; color: #ff69b4;">সব অন্ধকার শেষ হয়েছে...</p>
            <p style="font-size: 20px; margin-bottom: 30px; color: #ff69b4;">একটি নতুন সুন্দর জীবন শুরু হচ্ছে 💕</p>
            <button onclick="location.reload()" style="
                padding: 15px 40px; font-size: 18px; background: #e94560;
                border: none; color: white; border-radius: 10px;
                cursor: pointer; transition: 0.3s;
            " onmouseover="this.style.background='#ff6b9d'" onmouseout="this.style.background='#e94560'">
                Play Again
            </button>
        `;
        
        document.body.appendChild(overlay);
    }
}

// Pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
    }
`;
document.head.appendChild(style);
