
export default {
	
	models: {
		
		arrow: new GLTFShape("models/arrow.glb"),
		ground: new GLTFShape("models/ground.glb"),
		inmate: new GLTFShape("models/inmate.glb"),
		zombieinmate: new GLTFShape("models/zombieinmate.glb"),
		oilbarrel: new GLTFShape("models/oilbarrel.glb"),
		rangerinmate: new GLTFShape("models/rangerinmate.glb")
	},
	textures: {
		spell_fire: new Texture("models/fire_ui.png"),
		explosion: new Texture("models/explosion.png"),
		fireball: new Texture("models/fireball.png"),
		fire: new Texture("models/fire.png"),
		clock: new Texture("models/clock.png"),
		manaoutline: new Texture("models/manaoutline.png"),
		logo : new Texture("models/logo.png"),
		emptyblock: new Texture("models/emptyblock_ui.png"),
		oilbarrel: new Texture("models/oilbarrel_ui.png"),
		virus: new Texture("models/virus_ui.png"),
		selectionring: new Texture("models/selectionring.png")

	},

	sounds: {
		whoosh: new AudioClip("sounds/whoosh.mp3"),
		explosion: new AudioClip("sounds/explosion.mp3"),
		electricshock: new AudioClip("sounds/electricshock.mp3"),
		arrowshoot: new AudioClip("sounds/arrowshoot.mp3"),
		arrowhit:new AudioClip("sounds/arrowhit.mp3"),
		swordhit:new AudioClip("sounds/swordhit.mp3"),
		organicdie: new AudioClip("sounds/organicdie.mp3"),
		skeletonhit: new AudioClip("sounds/skeletonhit.mp3"),
		punch: new AudioClip("sounds/punch.mp3"),
		destruction: new AudioClip("sounds/destruction.mp3"),
		spawn: new AudioClip("sounds/spawn.mp3"),
		scream:new AudioClip("sounds/scream.mp3"),
		buttonclick:new AudioClip("sounds/buttonclick.mp3"),
		denied: new AudioClip("sounds/denied.mp3"),
		horse: new AudioClip("sounds/horse.mp3"),
		gargoyle: new AudioClip("sounds/gargoyle.mp3"),
		pig: new AudioClip("sounds/pig.mp3"),
		burp:new AudioClip("sounds/burp.mp3"),
		pop:new AudioClip("sounds/pop.mp3"),
		powerup:new AudioClip("sounds/powerup.mp3"),
		zombiedie:new AudioClip("sounds/zombiedie.mp3"),
		zombieroar:new AudioClip("sounds/zombieroar.mp3"),
		zombieattack:new AudioClip("sounds/zombieattack.mp3"),
		runmeme:new AudioClip("sounds/runmeme.mp3"),
		attention:new AudioClip("sounds/attention.mp3"),
		welcome:new AudioClip("sounds/welcome.mp3"),
		success:new AudioClip("sounds/success.mp3"),
		missionfailed:new AudioClip("sounds/missionfailed.mp3"),
		gameover:new AudioClip("sounds/gameover.mp3"),
		applause:new AudioClip("sounds/applause.mp3"),
		intro:new AudioClip("sounds/intro.mp3")
	},


	texts: {
		spell_virus: "Zombie Virus:\nContagious virus that can turn human into zombie.\n\nTo use, click on a tile, nearby human subjects \nwithin 1.5 tile of radius will be infected and turn into zombies.\nZombies will attack other human subjects randomly\nand have 50% chance of turning others into Zombies.\nA zombie has 15 seconds lifespan",
		emptyblock: "Empty Block.\nUseful for blocking.\nDeployment: 1x1 Tile",
		oilbarrel: "Oil Barrel\nWill explode if ignited.\nDeployment: 1x1 Tile\nExplosion radius 2.5 tiles",
		spell_fire:"Fire Blast\nSmall area combustion that ignites\nnearby human subjects or oilbarrels.\nRadius:1.2 tile\nClick at the floor to set fire."
		arrowtrap: "Shoots arrow when triggered.\nDeployment:1x1 Tile"
	}


	
};



		









