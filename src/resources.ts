
export default {
	
	models: {
		
		skeleton: new GLTFShape("models/skeleton.glb"),
		giant: new GLTFShape("models/giant.glb"),
		knight: new GLTFShape("models/knight.glb"),
		archer: new GLTFShape("models/archer.glb"),
		wizard: new GLTFShape("models/wizard.glb"),
		goblin: new GLTFShape("models/goblin.glb"),
		gargoyle: new GLTFShape("models/gargoyle.glb"),
		goblinspear: new GLTFShape("models/goblinspear.glb"),
		prince: new GLTFShape("models/prince.glb"),
		hogrider: new GLTFShape("models/hogrider.glb"),
		pekka: new GLTFShape("models/pekka.glb"),
		goblinhut: new GLTFShape("models/goblinhut.glb"),
		tombstone: new GLTFShape("models/tombstone.glb"),
		arrow: new GLTFShape("models/arrow.glb"),
		scoreboard: new GLTFShape("models/scoreboard.glb"),
		ground: new GLTFShape("models/ground.glb"),
		inmate: new GLTFShape("models/inmate.glb"),
		zombieinmate: new GLTFShape("models/zombieinmate.glb"),
		oilbarrel: new GLTFShape("models/oilbarrel.glb")
	},
	textures: {
		skeleton: new Texture("models/skeleton_ui.png"),
		giant: new Texture("models/giant_ui.png"),
		knight: new Texture("models/knight_ui.png"),
		archer: new Texture("models/archer_ui.png"),
		wizard: new Texture("models/wizard_ui.png"),
		goblin: new Texture("models/goblin_ui.png"),
		gargoyle: new Texture("models/gargoyle_ui.png"),
		gargoylehorde: new Texture("models/gargoylehorde_ui.png"),
		spell_fireball: new Texture("models/spellfireball_ui.png"),
		spell_zap	  : new Texture("models/spellzap_ui.png"),
		spell_fire: new Texture("models/fire_ui.png"),

		prince: new Texture("models/prince_ui.png"),
		hogrider: new Texture("models/hogrider_ui.png"),
		goblinhut: new Texture("models/goblinhut_ui.png"),
		goblinspear: new Texture("models/goblinspear_ui.png"),
		tombstone: new Texture( "models/tombstone_ui.png"),
		pekka: new Texture("models/pekka_ui.png"),
		explosion: new Texture("models/explosion.png"),
		fireball: new Texture("models/fireball.png"),
		fire: new Texture("models/fire.png"),

		zap: new Texture("models/zap.png"),
		clock: new Texture("models/clock.png"),
		crown_r : new Texture("models/crown_r.png"),
		crown_b : new Texture("models/crown_b.png"),
		manabar: new Texture("models/manabar.png"),
		manaoutline: new Texture("models/manaoutline.png"),
		manaruler: new Texture("models/manaruler.png"),

		redflag: new Texture("models/redflag.png"),
		blueflag: new Texture("models/blueflag.png"),
		logo : new Texture("models/logo.png"),
		heart: new Texture("models/heart.png"),
		levelbadge: new Texture("models/levelbadge.png"),
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
		gameover:new AudioClip("sounds/gameover.mp3")
	},


	texts: {
		spell_virus: "Zombie Virus:\nContagious virus that can turn human into zombie.\n\nTo use, click on a tile, nearby human subjects \nwithin 1.5 tile of radius will be infected and turn into zombies.\nZombies will attack other human subjects randomly\nand have 50% chance of turning others into Zombies.\nA zombie has 15 seconds lifespan",
		emptyblock: "Empty Block.\nUseful for blocking.\nDeployment: 1x1 Tile",
		oilbarrel: "Oil Barrel\nWill explode if ignited.\nDeployment: 1x1 Tile",
		spell_fire:"Fire Blast\nSmall area combustion that ignites\nnearby human subjects or oilbarrels.\nRadius:1.2 tile"
		arrowtrap: "Shoots arrow when triggered.\nDeployment:1x1 Tile"
	}


	
};



		









