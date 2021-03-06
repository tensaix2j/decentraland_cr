



import {b2Vec2} from "src/Box2D/Common/b2Math"
import {b2BodyType} from "src/Box2D/Dynamics/b2Body"
import {b2AABB}  from "src/Box2D/Collision/b2Collision"
import {b2QueryCallback} from "src/Box2D/Dynamics/b2WorldCallbacks";


import resources from "src/resources";


export class Txunit extends Entity {

	
	public id;
	public parent;
	public transform;


	public box2dbody;

	public visible_ypos;
	public visible = 1;
	public shapetype ;
	public type;


	public walking_queue = [];
	public speed = 10;
	public owner;
	
	public attackRange;
	public attackSpeed = 30;
	
	public aggroRange = 1.5;
	public isFlying = 0;
	public attack_building_only = 0;
	public isSpawner = 0;



	public attacking = 0;
	public attacktarget:Txunit = null;
	public movetarget:Txunit = null;


	public curhp:number;
	public maxhp:number;
	public curlvl:number = 1;

	public damage:number;
	
	public healthbar;

	public dead = 3;
	public tick;
	public wait_buffer;

	public clips = {};

	public skin_radius;
	
	public projectile_user = 0;
	
	public units_in_proximity = [];
	public box2daabb: b2AABB;
	public box2dcallback: b2QueryCallback;

	public box2d_transform_args;

	public levelbadge;
	public rage = 0;

	public prevtilepos = new Vector3(0,0,0);
	public prevtilepostick = 0;

	public haszombievirus = 0;
	
	public isPanic = 0;

	public deadtick = 0;
	public fire = null;




	constructor( id, parent , transform_args, box2d_transform_args,  model , type, shapetype , owner, isFlying, aggroRange , healthbar_y , wait_buffer, model2  ) {

		super();
		engine.addEntity(this);
		this.setParent( parent );


		this.id = id;
		this.parent = parent;
		this.transform = new Transform( transform_args );
		this.owner = owner;
		this.isFlying = isFlying ;
		this.aggroRange = aggroRange;
		this.type = type;
		this.shapetype = shapetype;
		this.dead = 3;

		this.box2d_transform_args = box2d_transform_args;
		

		this.addComponent( this.transform );
		this.addComponent( model );
		
	

        let healthbar_material = new Material();
        healthbar_material.specularIntensity = 0;
        healthbar_material.roughness = 1.0;
        let healthbar = new Entity();
        healthbar.setParent( this );
		healthbar.addComponent( new PlaneShape() );
		healthbar.addComponent( new Transform({
			position: new Vector3(  0,    healthbar_y,   0),
			scale   : new Vector3(1.5,   0.2,   0.2)
		}));
		healthbar.addComponent( this.parent.shared_billboard  );
		healthbar.addComponent( healthbar_material );
		this.healthbar = healthbar;



		
		
		this.skin_radius = box2d_transform_args.scale.x;
		
		this.addComponent( new Animator );

		

		if ( this.type == "emptyblock" || this.type == "oilbarrel" ) {
			this.healthbar.getComponent(Transform).position.y = 1.45;
			this.healthbar.getComponent(Transform).scale = new Vector3( 0.4,  0.05, 0.2);
		}



		
		this.createAnimationStates();


		let _this = this;
		this.box2daabb 		= new b2AABB();
		this.box2dcallback 	= new b2QueryCallback(); 
		this.box2dcallback.ReportFixture = function( evt ) { 

			if ( evt.m_body.m_userData != null ) {
				_this.units_in_proximity.push( evt.m_body.m_userData );
			}
			return true;
		};
		


		
		 if ( this.owner == 1 ) {
        	this.healthbar.getComponent( Material ).albedoColor = Color3.FromInts( 255, 0, 0 );
	    } else {
	    	this.healthbar.getComponent( Material ).albedoColor = Color3.FromInts( 0, 0, 200 );
	    }
		this.attacktarget = null ;
		this.movetarget   = null ;
		this.attacking    = 0;
		this.tick  		  = 0;
		this.wait_buffer  = wait_buffer;
		this.visible_ypos = this.transform.position.y;
		
	}


	public frame_index_to_frame_x = [ 4, 4,  0 , 1, 2, 3,    0, 1, 2, 3  ];
	public frame_index_to_frame_y = [ 4, 4,  1 , 1, 1, 1,    0, 0, 0, 0  ];

	//----------
	update_levelbadge_uv() {

		let frame_x = this.frame_index_to_frame_x[ this.curlvl ];
		let frame_y = this.frame_index_to_frame_y[ this.curlvl ];

		this.levelbadge.getComponent( PlaneShape ).uvs = [
			frame_x	/4				,	frame_y /2,
			(frame_x + 1 )/4		,	frame_y /2,
			(frame_x + 1 )/4		,	(frame_y + 1 )/2,
			frame_x	/4				,	(frame_y + 1 )/2 ,
			frame_x	/4				,	frame_y /2,
			(frame_x + 1 )/4		,	frame_y /2,
			(frame_x + 1 )/4		,	(frame_y + 1 )/2,
			frame_x	/4				,	(frame_y + 1 )/2 
		];

	}




	//-------------------
    createAnimationStates() {
        
		this.getComponent(Animator).addClip( new AnimationState("_idle") );
		this.getComponent(Animator).addClip( new AnimationState("Walking") );
		this.getComponent(Animator).addClip( new AnimationState("Punch") );
		this.getComponent(Animator).addClip( new AnimationState("Die") );
		this.getComponent(Animator).addClip( new AnimationState("Run") );
		
			
		this.stopAllClips();
		this.playAnimation("Walking", 1 );
		

    }



    //----------
    refresh_hp() {
    	
    	let hp_perc = this.curhp / this.maxhp ;
		this.healthbar.getComponent( Transform ).scale.x = hp_perc * 1.5;
		
			

    }

	

	//------------------
	// Bookmark
	update( dt ) {



		if ( this.visible == 1 ) {

			if ( this.dead == 0 ) {

				if ( this.parent.game_state == 1 ) {
					
					
					if ( this.shapetype == "static" ) {

						if ( this.attackRange > 0 ) {
							this.find_attack_target();
							this.attack_target(dt);
						}

					} else {
						
						
						if ( this.shapetype == "dynamic" ) {

							if ( this.type == "zombieinmate" || this.rage == 3 ) {

								if ( ( this.type == "inmate" || this.type == "rangerinmate" ) && this.rage == 3 ) {
									// On fire
									this.curhp -= 0.2;
								} else {
									// Zombie 
									this.curhp -= 1;
								}
								
								this.refresh_hp();
								if ( this.curhp <= 0 ) {
									this.die();
									return ;
								}
							}	

							if ( this.rage == 1 ) {
								
								// Rage mode =1 ,will attack any nearby enemy.
								this.find_attack_target();
								this.attack_target(dt);
								if ( this.attacking == 0 ) {
									this.find_move_target();
									this.move_self( dt );

								}

							} else if ( this.rage == 2 ) {

								if ( this.isPanic > 0 ) {
									this.isPanic -= 1;
									if ( this.isPanic == 0 ) {
										this.rage = 0;
									}
								}
								// Rage mode =2 , panic run
								this.find_random_move_target();
								this.move_self( dt );
							
							} else if ( this.rage == 3 ) {

								// Rage mode = 3, on fire....
								this.ignite_nearby()
								this.find_random_move_target();
								this.move_self( dt );

							} else {

								// Normal
								this.check_zombie_around();
								this.find_random_move_target();
								this.move_self( dt );
							}
						}
						
						this.updatePosition_toBox2d();
					
					}
				
				}
			
			} else if ( this.dead == 3 ) {
				// Booting	
				this.tick += 1;
				if ( this.tick >= this.wait_buffer ) {

					this.reinstate_box2d( this.box2d_transform_args );
					this.dead = 0;
					this.tick = 0;
				}
 
			} else {
				// Dying
				this.die_and_rot();
			}

		} else {
			this.tick += 1;
			if ( this.tick > 100 ) {
				this.parent.removeUnit( this );
			}
		}
	}



	//---------
	check_zombie_around() {

		this.find_nearby_units( this.aggroRange );
			
		let i;
		for ( i = 0 ; i < this.units_in_proximity.length ; i++ ) {

			let u = this.units_in_proximity[i];
			if ( u != null && u.dead == 0 && u.owner != this.owner && u.type == "zombieinmate" ) {

				if ( this.type == "inmate" ) {
					this.rage = 2;
					this.isPanic = 100;
				} else if ( this.type == "rangerinmate" ) {
					this.rage = 1;
				}
			}
		}
	}

		//-----
	ignite_nearby() {

		this.find_nearby_units( 0.5 );
		let i;
		for ( i = 0 ; i < this.units_in_proximity.length ; i++ ) {

			let u = this.units_in_proximity[i];
			if ( u != null && u.dead == 0 &&  u.fire == null ) {
				
				if ( u.type == "oilbarrel" ) {
					u.die();
				}
			}
		}		
	}




	//----------------
	die_and_rot() {
		// Dead ones, move to below 
		if ( this.dead == 1 ) {

			if ( this.haszombievirus == 1  && ( this.type == "inmate" || this.type == "rangerinmate" ) ) {

				let u = this.parent.createUnit( "zombieinmate" , this.transform.position.x,  this.transform.position.z, 1 , 0) ;
				u.transform.rotation.eulerAngles = this.transform.rotation.eulerAngles ;
				u.rage = 1;

				u.stopAllClips();
				u.playAnimation("Run", 1 );


				this.dead = 2;
				this.stopAllClips();
				this.hide();


			} else {
				// Show dead body for at least 200 tick
				if ( this.deadtick > 200 ) {
					
					let dst       		=  this.transform.scale.y * -1;
					let start_remaining =  this.visible_ypos - dst;
					let remaining 		=  this.transform.position.y - dst;

					// show dead body slowly decays
					if ( remaining > 0 ) {
						this.transform.position.y -=  start_remaining / 100;
					} else {
						this.dead = 2;
						this.stopAllClips();
						this.hide();
					}

				} else {
					this.deadtick += 1;
				}	


			}
		}
	}


	//--------------------
	find_random_move_target( ) {
		
		if ( this.walking_queue.length == 0 ) {

			// if multiplayer, then let host do the randomization..
			if ( this.parent.game_mode == 1 || this.parent.isClient == 0 ) {

				let rx = Math.random() * 12 - 6;
				let rz = Math.random() * 12 - 6;
				this.walking_queue.push( new Vector3( rx , 0 , rz ) ) ;

				if ( this.parent.game_mode == 2 ) {
					this.parent.unit_on_find_move_target( this.id , this.transform.position.x, this.transform.position.z , rx, rz ) ;
				}
			}
		}
	}

	//--------------
	host_request_move_target( cur_x, cur_z, rx , rz ) {

		if ( this.parent.game_mode == 2 ) {
			
			this.box2dbody.SetPosition( new b2Vec2( cur_x, cur_z ) );
			this.updatePosition_toBox2d() ;

			this.walking_queue.length = 0;
			this.walking_queue.push( new Vector3( rx , 0 , rz ) ) ;
			this.prevtilepostick = 0;
		}
	}


	//----
	find_move_target() {

		// Dont have programmed route to go.
		if ( this.walking_queue.length == 0 ) {
			if ( this.attacktarget != null ) {
				this.walking_queue.push( this.attacktarget.transform.position );
			} else {
				this.find_random_move_target();
			}
		}
	}


	//-------------
	move_self( dt ) {


		

		if ( this.walking_queue.length > 0 ) {

			var target = this.walking_queue[0];
			
			let diff_x = target.x -  this.box2dbody.GetPosition().x;
	    	let diff_z = target.z -  this.box2dbody.GetPosition().y;
	    	
	    	var hyp = diff_x * diff_x + diff_z * diff_z ;

	    	if ( hyp > 0.25  ) {
	    		
	    		
	    		var rad	 = Math.atan2( diff_x, diff_z );
	    		var deg  = rad * 180.0 / Math.PI ;
	    		
	    		let use_speed = this.speed; 
	    		if ( ( this.type == "inmate" || this.type == "rangerinmate" ) && this.rage >= 2 ) {
	    			use_speed = 1.6 * this.speed;
	    		}
	    		var delta_x = use_speed * dt * Math.sin(rad);
	    		var delta_z = use_speed * dt * Math.cos(rad);

	    
	    		let tile_x = Math.round( ( this.box2dbody.GetPosition().x  ) / this.parent.grid_size_x ) >> 0 ;
				let tile_z = Math.round( ( this.box2dbody.GetPosition().y  ) / this.parent.grid_size_z ) >> 0 ;

				if ( tile_x == this.prevtilepos.x && tile_z == this.prevtilepos.z ) {
					
					this.prevtilepostick += 1;
				} else {
					
					this.prevtilepostick = 0;
					this.prevtilepos.x = tile_x;
					this.prevtilepos.z = tile_z;
				}

				if ( this.prevtilepostick > 100 ) {

					// If this unit is stuck in the same tile for > 100 ticks, try to find new move target random angle from current angle..

					
					// If multiplayer, let host do the randomization.
					if ( this.parent.game_mode == 1 || this.parent.isClient == 0 ) {
						delta_x = Math.sin(rad + Math.PI/4 * Math.random()*4  ) * 5 ;
		    			delta_z = Math.cos(rad + Math.PI/4 * Math.random()*4 )  * 5;
		    			this.walking_queue.length = 0;
		    			this.walking_queue.push( new Vector3( delta_x, 0 , delta_z ) );
		    			this.prevtilepostick = 0;

		    			if ( this.parent.game_mode == 2 ) {
							this.parent.unit_on_find_move_target( this.id ,  this.transform.position.x, this.transform.position.z , delta_x, delta_z ) ;
						}
		    		}

				} else {
				
					this.box2dbody.SetLinearVelocity( new b2Vec2( delta_x ,delta_z ) );
    				this.transform.rotation.eulerAngles = new Vector3( 0, deg ,0) ;


    				this.stopAllClips();
			

    				if ( this.type == "zombieinmate" || this.rage >= 2 ) {

    					this.playAnimation("Run", 1 );

    				} else {
    					this.playAnimation("Walking", 1);
					}
				}

	    	
	    	} else {

	    		this.walking_queue.shift();
	    		if ( this.walking_queue.length == 0 ) {
	    			
	    			this.movetarget = null;
	    			this.find_move_target();
	    		}
	    	}
	    	

	    } 
	}


	


	//----------------------
	// Move along pathfinder result's solution... USed in TD not here...
	move_along_path( dt ) {

		

		let tile_x = Math.round( ( this.box2dbody.GetPosition().x  ) / this.parent.grid_size_x ) >> 0 ;
		let tile_z = Math.round( ( this.box2dbody.GetPosition().y  ) / this.parent.grid_size_z ) >> 0 ;

		if ( this.walking_queue.length > 0 ) {

			var target = this.walking_queue[0];
			

			let togo_tile_x = Math.round( ( target.x  ) / this.parent.grid_size_x ) >> 0 ;
			let togo_tile_z = Math.round( ( target.z  ) / this.parent.grid_size_z ) >> 0 ;
			let node = this.parent.pathfinder.getNode( togo_tile_x, togo_tile_z );
			if (  node != null && node["walkable"] != 1 ) {
					
				this.walking_queue.length = 0;
				let pathfinderresult = this.parent.pathfinder.findPath( tile_x , tile_z , 7, 0 );

				if ( pathfinderresult == -1 ) {
					// Monster is trapped.
					this.rage = 1;

				}
				
			} else {

				let diff_x = target.x -  this.box2dbody.GetPosition().x;
		    	let diff_z = target.z -  this.box2dbody.GetPosition().y;
		    	
		    	var hyp = diff_x * diff_x + diff_z * diff_z ;

		    	if ( hyp > 0.25  ) {
		    		
		    		var rad	 = Math.atan2( diff_x, diff_z );
		    		var deg  = rad * 180.0 / Math.PI ;
		    		var delta_x = this.speed * dt * Math.sin(rad);
		    		var delta_z = this.speed * dt * Math.cos(rad);

		    		this.box2dbody.SetLinearVelocity( new b2Vec2( delta_x ,delta_z ) );

		    		this.transform.rotation.eulerAngles = new Vector3( 0, deg ,0) ;

		    		this.getComponent(Animator).getClip("Punch").playing = false;
					this.getComponent(Animator).getClip("Walking").playing = true;



		    	
		    	} else {

		    		

		    		this.walking_queue.shift();
		    		if ( this.walking_queue.length == 0 ) {
		    			
		    			this.movetarget = null;
		    			this.find_move_target();
		    		}
		    	}
	    	}

	    } 

	}

		
	//---
	die() {

		if ( this.parent.game_state == 1 ) {

			this.dead = 1;
			this.deadtick = 0;
			this.parent.world.DestroyBody( this.box2dbody );


			if ( this.parent.game_mode == 2 && this.parent.isClient == 0 ) {
				this.parent.unit_on_die( this );
			}

			this.stopAllClips();
			this.playAnimation("Die", 0 );

			if ( this.fire != null ) {
				
				this.fire.setParent( this.parent );
				this.fire.hide();
				
			}


			if ( this.type == "oilbarrel" ) {

				
				
				this.parent.createExplosion( 
	    			new Vector3( this.transform.position.x , this.transform.position.y + 1.5, this.transform.position.z ), 
	    			this.owner, 
	    			5,
	    			5,
	    			1,   //Type
	    			10,
	    			10,
	    			0
	    		);
	    		
	    		let tile_x = Math.round( ( this.box2dbody.GetPosition().x  ) / this.parent.grid_size_x ) >> 0 ;
				let tile_z = Math.round( ( this.box2dbody.GetPosition().y  ) / this.parent.grid_size_z ) >> 0 ;
				let node = this.parent.pathfinder.getNode( tile_x, tile_z );
				if ( node != null ) {
            		node["walkable"] = 1;
            	}

            	this.dead = 2;
				this.hide();

				
			}
				

			if ( this.shapetype == "static" ) {
				this.parent.sounds["destruction"].playOnce();
			} else {
				if ( this.type == "inmate" || this.type == "rangerinmate" ) {
					this.parent.sounds["scream"].playOnce();
				} else if ( this.type == "zombieinmate" ) {
				
					this.parent.sounds["zombiedie"].playOnce();
				}
				this.parent.sounds["organicdie"].playOnce();
			}
		}
	}


	//-----------
	setOnFire() {

		let fi = this.parent.createExplosion( new Vector3(0,2,0) ,  1 ,  1 , 1 , 4, 0 , 0 , 0 );
        fi.setParent( this );
        fi.transform.position.x = 0;
        fi.transform.position.y = 2.2;
        fi.transform.position.z = 0;
        fi.transform.scale.setAll(3.5);
        
        this.fire = fi;
        this.rage = 3
	}



	//----
	attack_target(dt) {

		// Has attack target.
		if ( this.attacktarget != null  ) {

			// attacktarget not dead.
			if ( this.attacktarget.dead == 0 ) {
				// has target
				// Check attack target is it in range.
				let diff_x =  this.attacktarget.transform.position.x - this.transform.position.x;
				let diff_z =  this.attacktarget.transform.position.z - this.transform.position.z;
				let hyp    =  diff_x * diff_x + diff_z * diff_z ;
				
				let use_attackRange  = this.attackRange + this.attacktarget.skin_radius + 0.2 ;


				if ( hyp <=  use_attackRange * use_attackRange ) {

					if ( this.attacking == 0 ) {
						
						// Attack target is in attack range, attack now.
						this.walking_queue.length = 0;
						this.box2dbody.SetLinearVelocity( new b2Vec2(0,0) );
						this.attacking = this.attackSpeed;
						this.tick = this.attackSpeed;

						var rad	 = Math.atan2( diff_x, diff_z );
						var deg  = rad * 180.0 / Math.PI ;
						var delta_x = this.speed * dt * Math.sin(rad);
						var delta_z = this.speed * dt * Math.cos(rad);

						this.box2dbody.SetLinearVelocity( new b2Vec2( delta_x ,delta_z ) );



					}


					
					// At t0
					if ( this.tick == this.attackSpeed ) {

						this.stopAllClips();
						this.playAnimation("Punch", 0 );
						this.lookat_target( diff_x , diff_z );
							
						// Projectile shooter
						if ( this.projectile_user == 1 ) {

							let srcx, srcy, srcz;

							srcx = this.transform.position.x;
							srcy = this.transform.position.y + 0.14;
							srcz = this.transform.position.z;
							

							let dstx = this.attacktarget.transform.position.x;
							let dsty = this.attacktarget.transform.position.y;
							let dstz = this.attacktarget.transform.position.z;

							let projectile_type = 1;
							


							//createProjectile( src_v3, dst_v3 , owner , projectile_type , attacktarget, damage , damage_building ) {

							let projectile = this.parent.createProjectile( 
									new Vector3( srcx, srcy, srcz) , 
									new Vector3( dstx, dsty, dstz) , 
									this.owner, 
									projectile_type,
									this.attacktarget,
									this.damage,
									this.damage,
									0
							);
							
							
						} 


					// At t 1/2
					} else if ( this.tick == ( this.attackSpeed / 2 ) >> 0 ) {

						if ( this.projectile_user == 0 ) {
							// Melee
							if ( this.type == "zombieinmate") {	

								this.parent.sounds["zombieattack"].playOnce();
								this.parent.sounds["punch"].playOnce();
							

							} else {
								this.parent.sounds["punch"].playOnce();
							
							}

							this.box2dbody.SetLinearVelocity( new b2Vec2(0,0 ) );
							this.box2dbody.ApplyLinearImpulse( new b2Vec2(0.001,  0) , this.box2dbody.GetWorldCenter() );

							// Melee
							this.inflict_damage();
						}

					} 


					// At t end	
					if ( this.tick <= 0 ) {
						this.tick = this.attackSpeed;
					} else {
						this.tick -= 1;
					}







				} else {

					// attack target not in range. need not to do anything.
					this.attacking = 0;

					this.stopAllClips();
					this.playAnimation("Run",1);
					//this.attacktarget = null ;
					if ( this.walking_queue.length == 0 ) {
						this.find_path_to_target();
					}

				}

			} else {
				// has attack target, but attack target isdead .

				if ( this.attacking > 0 ) {
					this.attacking -= 1;

				} else {
					this.attacktarget = null;
					this.movetarget = null;
					this.walking_queue.length = 0;
					this.attacking = 0;
					if ( this.shapetype == "dynamic" ) {
						
						this.stopAllClips();

						if ( this.type == "zombieinmate" ) {
							this.playAnimation("Run", 1 );
						} else {
							this.playAnimation("Walking", 1 );
						}
					}

					// Killed the wall try again
					if ( this.rage == 1 && this.owner == -1 )  {
						this.rage = 0;
					}
				}

			}
		} else {
			if ( this.attacking > 0 ) {
				this.attacking -= 1;
			}
		}

	}

	//---
	lookat_target( diff_x , diff_z ) {

		var rad	 = Math.atan2( diff_x, diff_z );
		var deg  = rad * 180.0 / Math.PI ;
				
		this.transform.rotation.eulerAngles = new Vector3( 0, deg ,0) ;

	}	

	//---
	inflict_damage() {

		//log( this.id, "inflict_damage ");

		if ( this.attacktarget != null ) {
			
			this.attacktarget.curhp -= this.damage;

			


			if ( this.attacktarget.curhp < 0 ) {
				this.attacktarget.curhp = 0;
			}

			//log( this.type, this.id , "hits " , this.attacktarget.type, this.attacktarget.id , " remaining hp = " , this.attacktarget.curhp , this.attacktarget.maxhp )

				
			this.attacktarget.refresh_hp();

			if ( this.attacktarget.curhp <= 0 ) {
				
				//log( this.id , "inflict damage, target killed.");
				//log( this.type, this.id , " kills " , this.attacktarget.type, this.attacktarget.id );
					
				// X percent chance to infect	
				if ( this.type == "zombieinmate" && ( this.attacktarget.type == "inmate" || this.attacktarget.type == "rangerinmate" ) ) {

					// let host do the randomization 
					if ( this.parent.game_mode == 1 || this.parent.isClient == 0 ) {

						let chance_of_infect = Math.random();
						if ( chance_of_infect > 0.5 ) {
							this.attacktarget.haszombievirus = 1;
							
							if ( this.parent.game_mode == 2  ){
								this.parent.unit_on_infect_other( this.id, this.attacktarget.id );
							}
						}
						

					}
				}

				this.attacktarget.die();
				this.attacktarget = null;
				this.movetarget   = null;


				

			}
		}
	}
	
	//------------------
	reinstate_box2d( box2d_transform_args ) {

		if ( this.parent.game_state == 1 ) {
			if ( this.shapetype == "static" ) {

				if ( this.type == "oilbarrel") { 

					this.box2dbody = this.parent.createStaticCircle( 
		    				this.transform.position.x ,  
		    				this.transform.position.z ,  
		    				box2d_transform_args.scale.x ,
		    				this.parent.world, 
		    		);

				} else {
					this.box2dbody = this.parent.createStaticBox(  
			    				this.transform.position.x ,  
			    				this.transform.position.z ,  
			    				box2d_transform_args.scale.x ,
			    				box2d_transform_args.scale.z , 
			    				this.parent.world
			    	);
		    	}

			} else {
				this.box2dbody = this.parent.createDynamicCircle(  
		    				this.transform.position.x ,  
		    				this.transform.position.z ,  
		    				box2d_transform_args.scale.x , 
		    				this.parent.world, 
		    				false 
		    	);

		    }
		   	this.box2dbody.m_userData = this ;


		   	// Box2d's collision grouping
	    	let categoryBits = 1;
	    	let maskBits 	 = 1;

		   	if ( this.isFlying == 1 ) {
	    		categoryBits = 2;
	    		maskBits     = 2;
	    	}
	    	this.box2dbody.m_fixtureList.m_filter.categoryBits = categoryBits;
			this.box2dbody.m_fixtureList.m_filter.maskBits     = maskBits;

		   	this.updatePosition_toBox2d();
		}
		
	}


	//------
	find_nearby_units( search_range ) {
		
		
		let _this = this;
		this.box2daabb.lowerBound = new b2Vec2( this.transform.position.x - search_range  , this.transform.position.z - search_range  );
		this.box2daabb.upperBound = new b2Vec2( this.transform.position.x + search_range  , this.transform.position.z + search_range  );
		this.units_in_proximity.length = 0;
		this.parent.world.QueryAABB( this.box2dcallback , this.box2daabb);
		
	}



	//----
	find_attack_target() {


		if ( this.attacktarget == null ) {
			
			//log( "units_in_proximity", this.units_in_proximity.length );	
				
			

			this.find_nearby_units( this.aggroRange );
			

			// No attack target ? look for one within aggro range. 
			let i;
			let nearest_u = null;
			let nearest_hypsqr = 999;
			

			for ( i = 0 ; i < this.units_in_proximity.length ; i++ ) {

				let u = this.units_in_proximity[i];

				let hit_flying_unit_check = 1;
				if ( u.isFlying == 1 ) {
					if ( this.projectile_user == 0 ) {
						hit_flying_unit_check = 0;	
					}
					if ( this.isFlying == 1 ) {
						hit_flying_unit_check = 1;
					}
				}

				let hit_building_check = 1;
				if ( this.attack_building_only == 1 ) {
					if ( u.shapetype == "dynamic" ) {
						hit_building_check = 0;
					}
				}


				if ( u != null && u.owner != this.owner && u.dead == 0 && hit_flying_unit_check == 1 &&  hit_building_check == 1 ) {

					let diff_x =  u.transform.position.x - this.transform.position.x;
					let diff_z =  u.transform.position.z - this.transform.position.z;
					let hypsqr    =  diff_x * diff_x + diff_z * diff_z ;

					if ( hypsqr <=  this.aggroRange * this.aggroRange ) {

						if ( hypsqr < nearest_hypsqr ) {
							nearest_u = u;
							nearest_hypsqr = hypsqr;
						}
					}
				}
			}
			if ( nearest_u != null ) {
				this.attacktarget = nearest_u;
				this.movetarget   = this.attacktarget;


				//log( this.id, "new target found" , this.attacktarget.id );
				
				this.find_path_to_target();
			}

		} else {
			// Already has attack target, no need to find another one.
		}
	}




	//-----
    find_path_to_target( ){

    	if ( this.movetarget == null ) {
    		return ;
    	}

    	this.walking_queue.length = 0 ;
    	let target = this.movetarget.transform.position;
    	this.walking_queue.push( target );

    }


	//------
	updatePosition_toBox2d()  {

		this.transform.position.x = this.box2dbody.GetPosition().x;
    	this.transform.position.z = this.box2dbody.GetPosition().y;
    	
    }






    
    public clip_names = ["_idle", "Walking", "Die", "Punch", "Run"];


    //------------
    playAnimation( action_name, loop ) {

    	let clip;
		clip = this.getComponent(Animator).getClip(action_name);
    				
		if ( loop == 1  ) {
    		clip.looping = true;
    	} else {
    		clip.looping = false;
    	}

    	if ( action_name == "Punch" ) {
    		clip.speed = 30.0 / this.attackSpeed ;
    	
    	} else if ( action_name == "Run" ) {
    		clip.speed = 2.0;

    	} else {
    		clip.speed = 1.0;
    	}

    	clip.reset();
		clip.playing = true;
		
		
    }

    stopAnimation( action_name ) {
    	
    	//log( this.type , this.id , "Attempt to stop" , action_name );
    	let clip;
    	clip = this.getComponent(Animator).getClip(action_name);
    	clip.playing = false;
    	
    }
	
    //--
	stopAllClips() {
		
		let i;
		for ( i = 0 ; i < this.clip_names.length ; i++ ) {
			this.stopAnimation( this.clip_names[i]);
		}
	}


     //---
    hide() {
    	this.transform.position.y = -999;
    	this.visible = 0;
    	this.tick = 0;
    	
    }
    
}