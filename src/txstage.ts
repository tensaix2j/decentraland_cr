


import {b2Vec2} from "src/Box2D/Common/b2Math"
import {b2World} from "src/Box2D/Dynamics/b2World"
import {b2QueryCallback} from "src/Box2D/Dynamics/b2WorldCallbacks";


import {b2BodyDef}  from "src/Box2D/Dynamics/b2Body"
import {b2FixtureDef}  from "src/Box2D/Dynamics/b2Fixture"
import {b2PolygonShape}  from "src/Box2D/Collision/Shapes/b2PolygonShape"
import {b2CircleShape}  from "src/Box2D/Collision/Shapes/b2CircleShape"
import {b2BodyType} from "src/Box2D/Dynamics/b2Body"
import {b2RevoluteJointDef} from "src/Box2D/Dynamics/Joints/b2RevoluteJoint"
import {b2DistanceJointDef} from "src/Box2D/Dynamics/Joints/b2DistanceJoint"
import {b2ContactListener} from "src/Box2D/Dynamics/b2WorldCallbacks"
import {b2AABB}  from "src/Box2D/Collision/b2Collision"


import resources from "src/resources";
import { Txunit } from "src/txunit";
import { Txcard } from "src/txcard";
import { Txprojectile } from "src/txprojectile";
import { Txexplosion } from "src/txexplosion" ;
import { Txclock } from "src/txclock";
import { Txscoreboard } from "src/txscoreboard";
import { Txclickable_box} from "src/txclickable_box";
import { Txsound } from "src/txsound";
import { EmitArg } from "src/txemit_args";
import {PathFinder} from "src/pathfinder";

import {Utils} from "src/utils"
import { getUserAccount, RPCSendableMessage  } from '@decentraland/EthereumController'


import * as mana from '../node_modules/@dcl/crypto-utils/mana/index'


export class Txstage extends Entity {

	public id;
	public userID;
	public transform;
	public camera;
	public world;
	public units = [];
	public battleground;
	public playerindex = 1;

	public card_sel_highlight;
	public card_sel_index = 0;

    public projectiles = [];
    public explosions = [];
    public clocks = [];

    
    public shared_fireball_shape;
    public shared_fireball_material;
    public shared_box;

    public shared_explosion_material;
    public shared_clock_material;
    public shared_zap_material;
    public shared_fire_material;
    public shared_billboard;
    public shared_selectionring_material;


    public uitxt_life ;
    public uitxt_instruction;
    public uitxt_time ;
    public uitxt_mana;
    public uiimg_selected_card;
    public uitxt_selected_card_mana;

    public uiimg_selected_unit_photo;


   


    public buttons = {};

    public uiimage_manabar ;

    public game_state = 0;
    public game_mode  = 0;
        

    public menu_page  = 0;
    public menu_labels = {};

    
    public ui3d_root;


    public card_sel_parent ;
    public player_cards_collection = [];
    public player_cards_in_use    = [];
    public txcard_selected:Txcard = null ;

    public animate_button_tick = 0;
    public animate_button_callback_id = "";
    public animate_button_userdata = "";


    public sounds = {};

   

    public cards_dealt_in_game = 8;
    public level_initial_time = 300;

    public scoreboard;

    public tick = 0;
    public globaltick = 0;

    

    public messageBus ;
    public emitBus      = [];
    public isHost       = 0;
    public isClient     = 0;
    public opponent     = "";
    public available_gamehosts = {}    
    public isReady      = 0;
    public isOpponentReady = 0;
    public synctick     = 0;

    public need_select_n_card = 4;
    
    public pathfinder;


    public current_wave = 0; 

    public current_selected_unit;
    public current_selected_unit_highlight;

    public difficulty = 0.1;


    public time_start     = 0;    
    public time_remaining = this.level_initial_time;
    

    public tile_x_size = 1;
    public tile_z_size = 1;
    public tile_x_gap  = 0.075;
    public tile_z_gap  = 0.075;

    public grid_size_x =  this.tile_x_size + this.tile_x_gap;
    public grid_size_z =  this.tile_z_size + this.tile_z_gap;



    public address = "0x478849Da9C519dEd12d04EC6E896Af6aDf3cDD73";
    public paymentAmount = 12;



	constructor( id, userID , transform_args , camera ) {

		super();
		engine.addEntity(this);

		this.id = id;
		this.userID = userID;
		this.transform = new Transform( transform_args );
		this.camera = camera;

		this.addComponent(  this.transform );
	   
	   
        let ground = new Entity();
        ground.setParent(this );
        ground.addComponent( resources.models.ground );
        ground.addComponent( new Transform(
            {
                position: new Vector3( 0, 1.41 ,0 ),
                scale   : new Vector3( 1, 1, 1 )
            }
        ));
        this.battleground = ground;
            

        let gravity   = new b2Vec2(0, 0);
        this.world     = new b2World( gravity );

        
        let _this = this;



        this.construct_box2d_shapes();
       
    	
    	
        this.battleground.addComponent( 
			new OnPointerDown((e) => {
				_this.global_input_down( e );	
			})
		);
		this.battleground.addComponent( 
			new OnPointerUp((e) => {
				_this.global_input_up( e );	
			})
		);


        this.current_selected_unit_highlight = new Entity();
        this.current_selected_unit_highlight.setParent( this );
        this.current_selected_unit_highlight.addComponent( new PlaneShape() );
        this.current_selected_unit_highlight.addComponent( new Transform( 
            {
                position: new Vector3(0, 1.5 ,0),
                scale   : new Vector3( 1.1, 1.1, 1.1)
            }
        ));
        this.current_selected_unit_highlight.getComponent(Transform).rotation.eulerAngles = new Vector3(-90,0,0);
        let material = new Material();
        material.emissiveColor = Color3.FromInts(0,255,0);
        material.emissiveIntensity = 4.0;
        this.current_selected_unit_highlight.addComponent( material );
        this.current_selected_unit_highlight.getComponent( PlaneShape).visible = false;
        this.current_selected_unit_highlight.getComponent( Transform ).position.y = -999;




        this.init_ui_2d();
        this.init_ui_3d();
        this.init_shared_material();
        this.init_sound();
        this.init_player_cards_collection();
        this.init_MessageBus();
        this.init_pathfinder();
        this.update_button_ui();
        this.preload_glb();
        this.reset_game();


    }   




   






    //-------------------------
    //
    //
    //          Updates
    //
    //
    //-----------------------------



    //----------------
	step(dt:number) {
    	
    	this.world.Step( 0.05  , 10, 10 );
    	
    }


    //--
    // Bookmark update()

    update(dt) {
    	
            

        if ( this.game_state == 1 || this.game_state == 2 ) {
    
            this.step(dt);
            
            let u;
            for ( u = 0 ; u < this.units.length ; u++) {
                let unit = this.units[u];
                if ( unit != null  ) {
                    unit.update(dt);
                } 
            }

            let p;
            for ( p = 0 ; p < this.projectiles.length ; p++ ) {
                let projectile = this.projectiles[p];
                if ( projectile != null  ) {
                    projectile.update(dt);
                }
            }

            let exp;
            for ( exp = 0 ; exp < this.explosions.length ; exp++ ) {
                let explosion = this.explosions[exp];
                if ( explosion != null  ) {
                    explosion.update(dt);
                }
            }
             

            let cl;
            for ( cl = 0 ; cl < this.clocks.length ; cl++ ) {
                let clock = this.clocks[cl];
                if ( clock != null  ) {
                    clock.update(dt);
                }
            }

        
            if ( this.game_state == 1 ) {
                this.update_time();
            }
            
            if ( this.game_mode == 1 && this.game_state == 1  ) {
                
                


            } else if ( this.game_mode == 2 && this.game_state == 1 ) {

                this.synctick += 1;
                if ( this.synctick > 100 ) {    
                    let params  = {
                        userID      : this.userID,
                        recipient   : this.opponent,
                        data: [ this.globaltick, this.time_remaining ]
                    }
                    this.messageBus.emit( "sync", params );
                    this.synctick = 0;
                }
            }

        } 
             


        this.update_animate_button();
        

        this.globaltick += 1;

        
        // Emit here, not in onData of messageBus
        if ( this.emitBus.length > 0 ) {

            let msg = this.emitBus.shift();
            let params  = {
                userID      : this.userID,
            }
            if ( msg.length >= 2 ) {
                params["recipient"] = msg[1];
            }
            if ( msg.length >= 3 ) {
                params["data"] = msg[2];
            }
            this.messageBus.emit( msg[0], params );
        }

    }



   

    update_time() {

        if ( this.game_state == 1 ) {
            
            if ( this.time_start == 1 ) {
                
                this.tick += 1 ;
                
                if ( this.tick > 30 ) {
                    this.tick = 0 ;


                    if ( this.time_remaining > 0 ) {
                        this.time_remaining -= 1;
                    } 
                }

                this.uitxt_time.value = "Time Remaining : " + this.format_timeremaining();  
                
                
                // Let host dictate pass or not
                if ( this.game_mode == 1 || this.isClient == 0 ) {
                    
                    if ( this.time_remaining > 0 ) {
                        let alive_inmates = this.count_remaining_inmates();
                        if ( alive_inmates == 0 ) {
                            this.level_complete();
                        
                        } else {
                           
                        }

                    } else {
                        this.level_failed();
                    }
                } 
            }
        }
    }


    //--------------------------
    format_timeremaining() {

        let minutes_rem = (this.time_remaining / 60 ) >> 0;
        let seconds_rem = this.time_remaining % 60;

        let zeropad = ""
        if ( (seconds_rem).toString().length == 1 ) {
            zeropad = "0";
        }
        return  minutes_rem + ":" + zeropad +  seconds_rem ;
    }




    //------------------------------------
    // Bookmark update_button_ui

    update_button_ui( ) {

        let b;
        for ( b in this.buttons ) {
            this.buttons[b].hide();
        }
        for ( b in this.menu_labels ) {
            this.menu_labels[b].getComponent( TextShape ).value = "";
        }
        this.card_sel_parent.getComponent(Transform).position.y  = -999;
        this.uiimg_selected_unit_photo.getComponent( PlaneShape ).visible = false;
        


        
        if ( this.game_state == 0 ) { 

            this.uiimg_selected_card.visible = false;
            this.current_selected_unit_highlight.getComponent( PlaneShape).visible = false;
            this.current_selected_unit_highlight.getComponent( Transform ).position.y = -999;
                        

            if  ( this.menu_page == 0 ) {
            
                this.buttons["singleplayer"].show();
                this.buttons["multiplayer"].show();

                 this.sounds["welcome"].playOnce();
                this.sounds["intro"].playOnce();

                 this.displayHighscores();

            
            } else if ( this.menu_page == 1  ) {

                this.card_sel_parent.getComponent(Transform).position.y = -2;
                this.menu_labels["lbl1"].getComponent(TextShape).value = "Please Select "+ this.need_select_n_card +" cards to use"
                this.buttons["confirm"].show();

                this.buttons["cancel"].show();
                
            }  else if ( this.menu_page == 2 ) {

                // For battle starting.
            }  else if ( this.menu_page == 3 ) {

                this.menu_labels["lbl1"].getComponent( Transform ).position.y = 4.25;
                this.menu_labels["lbl1"].getComponent(TextShape).value = "Host or Join Game."
                
                this.buttons["cancel"].show();
                this.buttons["hostgame"].show();
                
                // Multiplayer page 
                this.refresh_available_games_ifneeded();





            } else if ( this.menu_page == 4 ) {

                this.menu_labels["lbl1"].getComponent(TextShape).value = "Waiting for others to join....."

                this.buttons["cancel"].show();

            } else if ( this.menu_page == 5 ) {

                this.menu_labels["lbl1"].getComponent(TextShape).value = "Joining the host..."
                
                this.buttons["cancel"].show();
                
            }

        } else if ( this.game_state == 1 ) {

            
            
            if ( this.menu_page == 0 ) {
            
                this.card_sel_parent.getComponent(Transform).position.y = 2;

                this.buttons["leavegame"].show();
                this.buttons["topup"].show();

                this.menu_labels["lbl1"].getComponent( Transform ).scale.setAll( 0.27 )
                this.menu_labels["lbl1"].getComponent( TextShape ).color = Color3.White();
                this.menu_labels["lbl1"].getComponent(TextShape).value = "Eliminate all human subjects in the containment\nwithin the time limit using the provided items"

                
                this.menu_labels["lbl2"].getComponent( Transform ).scale.setAll( 0.25 )
                this.menu_labels["lbl2"].getComponent( TextShape ).color = Color3.White();
                this.menu_labels["lbl2"].getComponent(TextShape).value = ""
                    

            } else if ( this.menu_page == 12 ) {

                this.menu_labels["lbl1"].getComponent( Transform ).scale.setAll( 0.27 )
                this.menu_labels["lbl1"].getComponent( TextShape ).color = Color3.White();
                this.menu_labels["lbl1"].getComponent(TextShape).value = "Top Up with "+ this.paymentAmount + " Mana and You Get:\n\nZombie Virus x 2\nEmpty Block x 10\nOil Barrel x 10\nFire Blast x 5"


                this.buttons["paynow"].show();  
               
                this.buttons["cancel"].show(); 
                this.buttons["cancel"].transform.position.y = -2;
                

            }


        } else if ( this.game_state == 2 ) {


            this.buttons["leavegame"].show();
        }
    }


    //-------
    get_txcard_by_type( type ) {
        let i;
        for ( i = 0 ; i < this.player_cards_collection.length ; i++ ) {
            let txcard = this.player_cards_collection[i];
            if ( txcard.type == type ) {
                return txcard;
            }
        }    
        return null;
    }




    //----------------------
    displayHighscores() {

        let url = "https://tensaistudio.xyz/homicidetestlab/get_highscore.tcl";
        let fetchopt = {
            headers: {
              'content-type': 'application/json'
            },
            method: 'GET'
        };

        executeTask(async () => {
            try {
                let resp = await fetch(url, fetchopt ).then(response => response.json())
            
                log("sent request to URL", url , "SUCCESS", resp );
                let str = "";
                let i;
                for ( i = 0 ; i < resp.length ; i++ ) {
                    str += ( i + 1 ) + "." + " " + resp[i]["username"] + "     " + resp[i]["score"] + "\n";
                }
                this.menu_labels["lbl5"].getComponent(TextShape).value = "Highscores"
                this.menu_labels["lbl6"].getComponent(TextShape).value = str;
            } catch(err) {
                log("error to do", url, fetchopt, err );
            }
        });
    }


    //----------------------
    async submitHighscores() {

        let url = "https://tensaistudio.xyz/homicidetestlab/update_highscore.tcl";
       
        const myaddress = await getUserAccount()
        log("myaddress is " , myaddress);

        let username = this.userID;
        let useraddr = myaddress;
        let score    = this.current_wave;

        let sig      = Utils.sha256(useraddr + "wibble" + score );

        let fetchopt = {
            headers: {
              'content-type': 'application/json'
            },
            body: "username="+ username + "&score="+ score + "&useraddr=" + useraddr+ "&sig=" + sig,
            method: 'POST'
        };
        let _this = this;
        try {
            let resp = await fetch(url, fetchopt ).then(response => response.text())
            log("sent request to URL", url , "SUCCESS", resp );
            _this.displayHighscores();

        } catch(err) {
            log("error to do", url, fetchopt, err );
        }
   
    }




    //------------------------------------
    refresh_available_games_ifneeded() {

        if ( this.game_state == 0 && this.menu_page == 3 ) {

            let i;
            for ( i = 0 ; i < 5 ; i++ ) {
                 this.buttons["playButton" + i ].hide();
            }
            let hostid ;
            i = 0;
            for ( hostid in this.available_gamehosts ) {

                if ( i >= 5 ) {
                    break;
                }

                this.buttons["playButton" + i ].show();
                this.buttons["playButton" + i ].text_shape.value = hostid;
                this.buttons["playButton" + i ].userData = hostid;
                i += 1;
                
            }
        }
    }






















    //---------------------------
    //
    //         INPUTS
    //
    //---------------------------
    // 


    global_input_down(e) {


       

        if ( e.buttonId == 0 ) {

            if ( this.game_state == 1 ) {
            	if ( e.hit ) {

    				let hitEntity = engine.entities[e.hit.entityId];
    				
    				if (  hitEntity == this.battleground ) {
    					
                        
    					let mouse_x = e.hit.hitPoint.x - this.transform.position.x;
    					let mouse_z = e.hit.hitPoint.z - this.transform.position.z;


                        let tile_x = Math.round( ( mouse_x  ) / this.grid_size_x ) >> 0 ;
                        let tile_z = Math.round( ( mouse_z  ) / this.grid_size_z ) >> 0 ;

                        let place_x = tile_x * this.grid_size_x;
                        let place_z = tile_z * this.grid_size_z;

                        //log( "mouse", mouse_x , mouse_z );



                        if ( this.txcard_selected != null ) {
    						
                            if ( this.txcard_selected.manaCost > 0 ) {
                                
                                let placement_allowed_ret = this.placement_is_allowed( tile_x , tile_z ) ;

                                if ( this.txcard_selected.isSpell == 1 || placement_allowed_ret == 1  ) {


                                    this.txcard_selected.manaCost -= 1;
                                    this.txcard_selected.uitxt_manaCost.getComponent(TextShape).value = this.txcard_selected.manaCost;
                                    this.uitxt_selected_card_mana.value = this.txcard_selected.manaCost;
                                    

                                    this.queue_command( [ "spawnUnit", this.txcard_selected.type , place_x , place_z , this.playerindex ] );

                                    
                                     this.uitxt_instruction.value = "";

                                } else {
                                    if ( placement_allowed_ret == -1 ) {
                                        this.uitxt_instruction.value = "Cannot build here. Something is walking on it."

                                    } else if ( placement_allowed_ret == -2 ) {
                                        this.uitxt_instruction.value = "Cannot build here. This will block the path."
                                        
                                    } else if ( placement_allowed_ret == -3 ) {

                                        this.uitxt_instruction.value = "Tile Already placed."

                                    } else {
                                        this.uitxt_instruction.value = "Not allowed to place there."
                                    
                                    }
                                    this.sounds["denied"].playOnce();

                                }
                            } else {
                                this.uitxt_instruction.value = "Out of stock";
                                this.sounds["denied"].playOnce();

                            }
    								
    					} else {
                            this.uitxt_instruction.value = "No card selected.";
                            this.sounds["denied"].playOnce();

                        }
                        

    				}
    			}
            }

        } else if ( e.buttonId == 1  ) {
        	

            // E button
        	

        } else if ( e.buttonId == 2 ) {
        	// F button 	
        	
        }	
     }



     //----------------------
    global_input_up(e) {

        if ( e.buttonId == 0 ) {
      	
        } else if ( e.buttonId == 1 ) {
            

        } else if ( e.buttonId == 2 ) {


        }
     }



    //------------------
    txclickable_button_onclick( id , userData ) {
        
        this.animate_button_tick = 20;
        this.animate_button_callback_id = id;
        this.animate_button_userdata = userData;
        this.sounds["buttonclick"].playOnce();

   }



   //-------------------------
   update_animate_button() {
        
        if ( this.animate_button_callback_id != "" ) {
            

            if ( this.animate_button_tick > 0 ) {

                if ( this.animate_button_callback_id == "battlebegin" ) {
                    this.ui3d_root.getComponent( Transform ).position.y = 5.5;      
                } else {
                    this.ui3d_root.getComponent( Transform ).position.y -= 0.75;
                }

                this.animate_button_tick -= 1;
                 
            } else {

                if ( this.animate_button_callback_id == "battlebegin" ) {
                    
                    this.uitxt_instruction.value = "";

                } 
                
                this.ui3d_root.getComponent( Transform ).position.y = 5.5;
                
                let use_id = this.animate_button_callback_id;
                let userData = this.animate_button_userdata;

                this.animate_button_callback_id  = "";
                this.animate_button_userdata = "";
                this.txclickable_button_onclick_animate_done_continue( use_id , userData );

            }
        }
   }



   //--------------
   // Bookmark button_onclick
   txclickable_button_onclick_animate_done_continue( id , userData ) {

        if ( id == "singleplayer" ) {

            this.game_mode = 1;
            this.round_start();
            
        } else if ( id == "round_start" ) {

            this.round_start();

        } else if ( id == "endinggame" ) {

            this.endgame();     


        } else if ( id == "multiplayer" ) {

            this.menu_page = 3;
            this.game_mode = 2;
            this.opponent = "";
            

            this.update_button_ui();

            let params  = {
                userID      : this.userID
            }
            this.messageBus.emit( "whohost", params );


        } else if ( id == "hostgame" ) {

            this.menu_page = 4;
            this.game_mode = 2;
            this.opponent = "";
            this.isOpponentReady = 0;
            this.isReady = 0;

            this.update_button_ui();

            this.isHost   = 1;
            this.isClient = 0;

            let params  = {
                userID      : this.userID,
            }
            this.messageBus.emit( "iamhost", params );
            


        } else if ( id == "play" ) {

            this.menu_page = 5;
            this.game_mode = 2;
            this.opponent = "";
            this.isOpponentReady = 0;
            this.isReady = 0;

            this.update_button_ui();

            if ( userData != "" ) {
                let params  = {
                    userID      : this.userID,
                    recipient   : userData
                }
                this.messageBus.emit( "join", params );
            }



        } else if ( id == "cancel" ) {

            if ( this.menu_page == 4 ) {
                // I host then click cancel.
                this.menu_page = 3;
                let params  = {
                    userID      : this.userID,
                }
                this.messageBus.emit( "gametaken", params );

            
            } else if ( this.menu_page == 1 && this.game_mode == 2 ) {
            
                let params  = {
                    userID      : this.userID,
                    recipient   : this.opponent
                }
                this.messageBus.emit( "leave", params );
                this.isHost = 0;
                this.isClient = 0;
                this.opponent = "";
                this.game_mode = 0;
                this.menu_page = 0;

            } else {
                this.menu_page = 0;
            }
            this.update_button_ui();


        

        } else if ( id == "battlebegin" ) {

            this.select_all_cards();
            this.fill_player_cards_selected();
            this.rearrange_cards_selected(); 

            this.game_state = 1;
            this.menu_page  = 0;

            this.update_button_ui();
            

            let inmate_count = this.inmate_count_by_level();
            let ranger_inmate_count = this.ranger_inmate_count_by_level();

            if ( this.game_mode == 1 || this.isClient == 0 ) {
                this.init_inmates( inmate_count );
                this.init_rangerinmates( ranger_inmate_count );
            }
            
            this.time_start  = 1;    
                    

        } else if ( id == "leavegame" ) {

            this.game_state = 0;
            this.menu_page = 0;
            this.uitxt_instruction.value = "";

            this.menu_labels["lbl1"].getComponent( Transform ).scale.setAll( 0.25 )
            this.menu_labels["lbl2"].getComponent( Transform ).scale.setAll( 0.25 )
            this.menu_labels["lbl3"].getComponent( Transform ).scale.setAll( 0.25 )
            
            this.menu_labels["lbl1"].getComponent( TextShape ).color = Color3.White();
            this.menu_labels["lbl3"].getComponent( TextShape ).color = Color3.White();

            this.menu_labels["lbl1"].getComponent( Transform ).position.y = 4.25;
            this.menu_labels["lbl2"].getComponent( Transform ).position.y = 3.9;
            this.menu_labels["lbl3"].getComponent( Transform ).position.y = 3.55;
            
            
            if ( this.game_mode == 2 ) {

                 let params  = {
                    userID      : this.userID,
                    recipient   : this.opponent
                }
                this.messageBus.emit( "leave", params );
            }


            this.isHost = 0;
            this.isClient = 0;
            this.opponent = "";
            this.game_mode = 0;
                 

            this.reset_game();
            this.update_button_ui();
        
        } else if ( id == "topup" ) {

            this.menu_page = 12;
            this.update_button_ui();


        } else if ( id == "paynow" ) {

            let _this = this;            
            mana.send(this.address, this.paymentAmount, true).then(() => {
                
                log("Success purchase");

                this.player_cards_collection[0].manaCost += 2;
                this.player_cards_collection[1].manaCost += 10;
                this.player_cards_collection[2].manaCost += 10;
                this.player_cards_collection[3].manaCost += 5;
                let i; 
                for ( i = 0 ; i < this.player_cards_collection.length ; i++ ) {
                    this.player_cards_collection[i].refresh_manaCost();
                }
                this.menu_page = 0;
                this.update_button_ui();
            })
        }
   }



    //---------------------------
    card_input_down( e, txcard ) {

        this.sounds["buttonclick"].playOnce();
        
        if ( this.game_state == 0 ) {


        } else if ( this.game_state == 1 ) {
    	      
            let i;
            for ( i = 0 ; i < this.player_cards_collection.length ; i++ ) {
                let txcard = this.player_cards_collection[i];
                if ( typeof txcard != "undefined" ) {
                    txcard.turnoff();
                }
            }

            txcard.turnon(); 
            this.txcard_selected = txcard ;

            this.uiimg_selected_card.source = txcard.getComponent(Material).albedoTexture;
            this.uiimg_selected_card.visible = true;
            this.uitxt_selected_card_mana.value = txcard.manaCost;

            this.uitxt_instruction.value = "";



            this.menu_labels["lbl1"].getComponent(Transform).position.y = 4.25;
            this.menu_labels["lbl2"].getComponent(Transform).position.y = 2.5;
            this.menu_labels["lbl2"].getComponent(Transform).scale.setAll(0.23);
            
            this.menu_labels["lbl2"].getComponent(TextShape).value = resources.texts[txcard.type];
                
            
        }   

    }



    //---------------------------
    card_input_up( e, type ) {
    
    }



    //---------
    unit_input_down( e, unit ) {

        
    }





































    //---------------
    //         MessageBus
    //--------------
  


    init_MessageBus() {

        let _this = this;
        this.messageBus = new MessageBus();
        this.messageBus.on("join", (info: EmitArg) => {
            if ( this.userID != info.userID && this.userID == info.recipient ) {
                
                log("bus: join", info);
                        
                // Somebody join me    
                // Reason for using emitBus is because we dont want to use messageBus to send in onData handler. 
                // We let the update() to send instead.
                if ( _this.opponent == "" ) { 
                    _this.emitBus.push( [ "join_resp" , info.userID ] );
                    _this.emitBus.push( [ "gametaken" ] );
                    _this.opponent = info.userID;
                    _this.game_mode = 2;
                    _this.round_start();

                
                    
                } else {
                    _this.emitBus.push( [ "join_reject" , info.userID ] );
                }

                
            }
        });
        this.messageBus.on("join_resp", (info: EmitArg) => {

            // Host resp my join
            if ( this.userID != info.userID  && this.userID == info.recipient ) {
                log("bus: join_resp", info );
                
                _this.opponent = info.userID;
                _this.isClient = 1;
                _this.game_mode = 2;
                _this.round_start();
            }
        });

        this.messageBus.on("join_reject", (info: EmitArg) => {

            // Host resp my join
            if ( this.userID != info.userID  && this.userID == info.recipient ) {
                
                log("bus: join_reject", info );
                _this.menu_page = 3;
                _this.update_button_ui();

            }
        });

        this.messageBus.on("iamhost", (info: EmitArg) => {
            log("buso iamhost", info );
            if ( this.userID != info.userID ) {
                
                log("bus: iamhost", info );
                _this.available_gamehosts[ info.userID ] = 1;
                _this.refresh_available_games_ifneeded();
                
            }
        });

        this.messageBus.on("whohost", (info: EmitArg) => {
            if ( this.userID != info.userID ) {
                log("bus: whohost", info );
                
                if ( _this.isHost == 1 && _this.opponent == "" ) {
                    _this.emitBus.push( [ "iamhost" , info.userID ] );
                }
                
            }
        });

        

        this.messageBus.on("gametaken", (info: EmitArg) => {
            if ( this.userID != info.userID ) {
                log("bus: gametaken", info );
                
                delete  _this.available_gamehosts[ info.userID ] ;
                _this.refresh_available_games_ifneeded();
                
            }
        });

        this.messageBus.on("leave", (info: EmitArg) => {
            if ( this.userID != info.userID    && this.userID == info.recipient  ) {
                
                log("bus: leave", info );
                

                if ( this.game_state == 0 ) {
                    
                    // Opponent left at menu stage, i m still host can take other opponent
                    this.menu_labels["lbl1"].getComponent( Transform ).position.y = 4.25;
            
                    if ( _this.isHost == 1 ) {
                        _this.menu_page = 4;
                        _this.update_button_ui();
                        _this.emitBus.push( [ "iamhost" ] );
                        _this.menu_labels["lbl1"].getComponent( TextShape ).value = info.userID + " left. Waiting for another challenger...." ;
                    
                    } else { 
                        _this.menu_page = 3;
                        _this.update_button_ui();
                         _this.menu_labels["lbl1"].getComponent( TextShape ).value = info.userID + " has left. Host or Join Game." ;
                    
                    } 

                } else if ( _this.game_state == 1 ) {

                    if ( _this.opponent == info.userID ) {
                        _this.uitxt_instruction.value = "CO-OP partner has left the game. You can continue playing...";

                    }
                }
                _this.opponent = "";
                _this.isOpponentReady = 0;
                _this.isClient = 0;

                
            }
        });


        

        this.messageBus.on("gamecmd", (info: EmitArg) => {

            if ( this.userID == info.userID  || this.opponent == info.userID  ) {
                log("bus: gamecmd", info );

                let emit_data  = info.data;
                if ( emit_data[0] == "spawnUnit" ) {

                    let spawn_absolute_tick = emit_data[5];
                    let wait_buffer         = spawn_absolute_tick - _this.globaltick;


                    if ( wait_buffer < 0 ) {
                        // Missed out the spawn absolute tick..We are way too late
                        wait_buffer = 0;
                    }
                    if ( wait_buffer > 40 ) {
                        // We are way too ahead..
                        wait_buffer = 40;
                    }

                    log("recv spawn cmd:", emit_data[1], "now ",this.globaltick , "tospawn_at", spawn_absolute_tick  );

                    _this.spawnUnit( 
                        emit_data[1],
                        emit_data[2],
                        emit_data[3],
                        emit_data[4],
                        wait_buffer
                    );
                }    
            }
        });

        this.messageBus.on("sync", (info: EmitArg) => {

            if ( this.userID != info.userID    && this.userID == info.recipient  ) {
                log("bus: sync", info );

                let oppo_globaltick     = info.data[0];
                let oppo_time_remaining  = info.data[1];
                if ( _this.globaltick < oppo_globaltick ) {
                    
                    log( "Syncing my globaltick to opponent's globaltick", _this.globaltick , oppo_globaltick );
                    _this.globaltick = oppo_globaltick;

                }
                if ( _this.time_remaining > oppo_time_remaining ) {
                    log("Syncing my time_remaining to opponent's time rem", _this.time_remaining, oppo_time_remaining);
                    _this.time_remaining = oppo_time_remaining;
                }
                    
            }
        });



        this.messageBus.on("unit_on_find_move_target", (info: EmitArg) => {

            if ( this.userID != info.userID    && this.userID == info.recipient  ) {
                log("bus: unit_on_find_move_target", info );

                let id      = info.data[0];
                let cur_x   = info.data[1];
                let cur_z   = info.data[2];
                let rx      = info.data[3];
                let rz      = info.data[4];

                if ( this.units[id] != null && ( this.units[id].dead == 0 || this.units[id].dead == 3 ) ) {
                    this.units[id].host_request_move_target( cur_x, cur_z, rx, rz );   
                }
            }
        });


        this.messageBus.on("unit_on_infect_other", (info: EmitArg) => {

            if ( this.userID != info.userID    && this.userID == info.recipient  ) {
                log("bus: unit_on_infect_other", info );

                let id                  = info.data[0];
                let attacktarget_id     = info.data[1];
                
                if ( this.units[attacktarget_id] != null && this.units[attacktarget_id].dead == 0 ) {
                    this.units[attacktarget_id].haszombievirus = 1;  
                }
            }
        });


        this.messageBus.on("unit_on_die", (info: EmitArg) => {

            if ( this.userID != info.userID    && this.userID == info.recipient  ) {
                log("bus: unit_on_die", info );

                let id                  = info.data[0];
                                    
                if ( this.units[id] != null && this.units[id].dead == 0 ) {
                    this.units[id].die();
                }
            }
        });



        this.messageBus.on("level_complete", (info: EmitArg) => {

            if ( this.userID != info.userID    && this.userID == info.recipient  ) {
                log("bus: level_complete", info );
                this.level_complete();
            }
        });

        this.messageBus.on("level_failed", (info: EmitArg) => {

            if ( this.userID != info.userID    && this.userID == info.recipient  ) {
                log("bus: level_failed", info );
                this.level_failed();
            }
        });
        

    }















    //-----------
    queue_command( cmd_arr ) {

        if ( cmd_arr[0] == "spawnUnit" ) {

            let spawn_absolute_tick = this.globaltick + 50;
            cmd_arr[5] = spawn_absolute_tick ;          

            //log( "spawn_absolute_tick ", cmd_arr[1] , spawn_absolute_tick );
            
            let params  = {
                userID      : this.userID,
                data        : cmd_arr
            }
            this.messageBus.emit( "gamecmd", params ); 
        }
    }

    




    //-------------------
    //
    //      Navigation
    //
    //-----------------------


    //-----------
    reset_game() {

        this.current_wave   =  0;
        this.reset_level();

    }

    //--------------
    reset_level() {
        
        this.time_remaining = this.level_initial_time;
        

        // Clear everything.
        let u;
        for ( u = this.units.length - 1 ; u >= 0 ;  u--) {
            let unit = this.units[u];
            if ( unit != null ) {
                this.removeUnit( unit ); 
            }
        }

        let p;
        for ( p = this.projectiles.length - 1 ; p >= 0 ; p-- ) {
            let projectile = this.projectiles[p];
            if ( projectile != null  ) {
                this.removeProjectile( projectile );
            }
        }

        let exp;
        for ( exp = this.explosions.length - 1 ; exp >= 0 ; exp-- ) {
            let explosion = this.explosions[exp];
            if ( explosion != null  ) {
               this.removeExplosion( explosion );
            }
        }
        
        let cl;
        for ( cl = this.clocks.length - 1 ; cl >= 0 ; cl-- ) {
            let clock = this.clocks[cl];
            if ( clock != null  ) {
                this.removeClock( clock );
            }
        }

        this.reset_pathfinder_obstacles();
        

    }



    //-------------
    // Bookmark endgame
    endgame( ) {
        
        this.sounds["applause"].playOnce();
        this.time_start  = 0;
        this.game_state = 2;
        let final_txt = "CONGRATULATION. YOU WON!\n";

        this.submitHighscores();


        final_txt += "\n\nLeave game to restart again";
        this.uitxt_instruction.value = final_txt;
        this.uitxt_time.value = "";

        this.update_button_ui();
    }



    //--------------------
    round_start() {
        
        this.menu_page = 2;
        this.update_button_ui();
        

        this.animate_button_callback_id = "battlebegin";
        this.animate_button_tick = 150;

        let cur_level = this.current_wave + 1;
        this.uitxt_instruction.value = "LEVEL " + cur_level + " Loading.\n Please Standby...";
        this.sounds["attention"].playOnce();

        this.init_resources_by_level();

        this.time_remaining = this.timeduration_by_level();


        this.menu_labels["lbl1"].getComponent(TextShape).value =  "LEVEL " + cur_level + ":\n\n";
        this.menu_labels["lbl1"].getComponent(TextShape).value += "Objective: Eliminate All Human Test Subjects\n\n";


        let inmate_count = this.inmate_count_by_level();
        let ranger_inmate_count = this.ranger_inmate_count_by_level();


        this.menu_labels["lbl1"].getComponent(TextShape).value += ( inmate_count + ranger_inmate_count ) + " Human Subjects\n\n";
        this.menu_labels["lbl1"].getComponent(TextShape).value += "Time: " + this.format_timeremaining()  + "\n";

        let i; 
        for ( i = 0 ; i < this.player_cards_collection.length ; i++ ) {
            let txcard = this.player_cards_collection[i];
            this.menu_labels["lbl1"].getComponent(TextShape).value += txcard.description + " x " + txcard.manaCost + "\n" ; 
        }

        this.menu_labels["lbl1"].getComponent(Transform).position.y = 2.8;

    }


    //--------------------
    level_complete() {

        if ( this.game_mode == 2 && this.isClient == 0 ) {
            
            let params  = {
                userID      : this.userID,
                recipient   : this.opponent
            }
            this.messageBus.emit( "level_complete", params );
        }   

        this.time_start  = 0;
        this.sounds["success"].playOnce();

        this.current_wave += 1;


        if ( this.current_wave < 10 ) {
            this.animate_button_callback_id = "round_start";
        } else {
             this.animate_button_callback_id = "endinggame";
        }   


        this.animate_button_tick = 100;
        this.uitxt_instruction.value = "LEVEL COMPLETED!"
        this.reset_level();
       
       this.submitHighscores();
        

    }





    //----
    level_failed() {
        
        if ( this.game_mode == 2 && this.isClient == 0 ) {
            
            let params  = {
                userID      : this.userID,
                recipient   : this.opponent
            }
            this.messageBus.emit( "level_failed", params );
        }

        this.time_start = 0;
        this.sounds["missionfailed"].playOnce();
        this.sounds["gameover"].playOnce();
        
        this.uitxt_instruction.value = "LEVEL FAILED!\nLeave The Game Now."
        this.reset_level();
        this.game_state = 2;

    }



    //----------
    count_remaining_inmates() {
        

        let i;
        let alivecount = 0;
        for ( i = 0 ; i < this.units.length ; i++ ) {
            let u = this.units[i];
            if ( u != null && ( u.dead == 0 || u.dead == 3 ) && ( u.type == "inmate" || u.type == "zombieinmate" || u.type == "rangerinmate" )) { 
                alivecount += 1;
                break;
            }
        }
        return alivecount;
    }


    //------------------
    count_remaining_resources() {
        let i;
        for ( i = 0 ; i < this.player_cards_collection.length ; i++ ) {
            if ( this.player_cards_collection[i].manaCost > 0 ) {
                return 1;
            }
        }
        return 0;
    }





    //---------
    get_txcard_selected_index() {
        let i;
        for ( i = 0 ; i < 4 ; i++ ) {
            if ( this.player_cards_in_use[i] == this.txcard_selected ) {
                return i;
            }
        }
        return -1;   
    }





    //---------------
    select_all_cards() {
        let i;
        for ( i = 0 ; i < this.player_cards_collection.length ; i++ ) {
            let txcard = this.player_cards_collection[i];
            txcard.turnon();
        }
    }

    //--------------------
    fill_player_cards_selected() {

        let i;
        this.player_cards_in_use.length = 0;
        for ( i = 0 ; i < this.player_cards_collection.length ; i++ ) {

            if ( this.player_cards_collection[i].isSelected ) {
                let txcard = this.player_cards_collection[i];
                this.player_cards_in_use.push( txcard );
            }
        }


    }



    //------------------
    rearrange_cards_selected() {

        let i;

        for ( i = 0 ; i < this.player_cards_collection.length ; i++ ) {
            let txcard = this.player_cards_collection[i];
            txcard.hide();
        }
        

        for ( i = 0 ; i < this.cards_dealt_in_game && i < this.player_cards_collection.length ; i++ ) {
            
            let x =  ( i % 4 ) * 1.2 - 2;
            let y = ((i / 4)  >> 0 ) * 1.2 - 2;
            
            let txcard = this.player_cards_in_use[i];
            if ( typeof txcard != "undefined" ) {
                txcard.reposition( x,y );
                txcard.show();
                txcard.turnoff();
            }
            
        }
    }




    //-----------------------------------------------------
    placement_is_allowed(  tile_x , tile_z ) {

        // Check boundary
        if ( tile_x >= -6 && tile_x <= 6 && 
             tile_z >= -6 && tile_z <= 6 ) {
            // Can   
        } else {
            // Cannot
            return 0;
        }

        // Check tower on tile already or not.
        var node;
        node = this.pathfinder.getNode( tile_x , tile_z );
        if ( node != null && node["walkable"] == 0 ) {
            return -3;
        }   


        // Check mob on tile or not
        let i;
        for ( i = 0 ; i < this.units.length ; i++ ) {
            let u = this.units[i];
            if ( u != null && u.dead == 0 && u.owner == -1 && u.isFlying == 0 ) {
                let u_tile_x = Math.round( ( u.box2dbody.GetPosition().x  ) / this.grid_size_x ) >> 0 ;
                let u_tile_z = Math.round( ( u.box2dbody.GetPosition().y  ) / this.grid_size_z ) >> 0 ;
                if ( u_tile_x == tile_x && u_tile_z == tile_z ) {

                    // Mob stepping on it..
                    return -1;
                }
            }
        }

        return 1;
    }







    //-----------
    unit_on_die( unit ) {
        
        let params  = {
            userID      : this.userID,
            recipient   : this.opponent,
            data: [ unit.id ]
        }
        this.messageBus.emit( "unit_on_die", params );
    }


    //---------
    unit_on_find_move_target( id, cur_x, cur_z, rx, rz ) {

        let params  = {
            userID      : this.userID,
            recipient   : this.opponent,
            data: [ id, cur_x, cur_z, rx, rz ]
        }
        this.messageBus.emit( "unit_on_find_move_target", params );

    }

    


    //----
    unit_on_infect_other( id, attacktarget_id  ) {

            let params  = {
                userID      : this.userID,
                recipient   : this.opponent,
                data: [ id, attacktarget_id  ]
            }
            this.messageBus.emit( "unit_on_infect_other", params );
        
    }










    init_inmates( inmate_count ) {
        
        let i;
        for ( i = 0 ; i < inmate_count ; i++ ) {
            this.queue_command( [ "spawnUnit", "inmate" , Math.random() * 12 - 6 , Math.random() * 12 - 6 , -1 ] );
        }

    }

    init_rangerinmates( inmate_count ) {

        let i;
        for ( i = 0 ; i < inmate_count ; i++ ) {
            this.queue_command( [ "spawnUnit", "rangerinmate" , Math.random() * 12 - 6 , Math.random() * 12 - 6 , -1 ] );
        }
    }



    kill_all_units() {

        let i;
        for ( i = 0 ; i < this.units.length ; i++ ) {
            let u = this.units[i];
            if ( u != null && u.dead == 0 && ( u.type == "inmate" || u.type == "zombieinmate" || u.type == "rangerinmate" ) )  { 
                u.die();
            }
        }
    }


























    //---------------
    //
    // Init section
    //
    //---------------

    inmate_count_by_level() {

        // Level1
        let inmate_count = 40;
        
        if ( this.current_wave == 1 ) {
            // Level2
            inmate_count = 30;
        } else if ( this.current_wave == 2 ) {

            // Level 3
            inmate_count = 5;
        
        } else if ( this.current_wave == 3 ) {
            // Level 4
            inmate_count = 10;
        
        } else if ( this.current_wave == 4 ) {

            // Level 5
            inmate_count = 50;

        }  else if ( this.current_wave == 5 ) {

            // LEvel 6
            inmate_count = 25;
        
        } else if ( this.current_wave == 6 ) {
        
            // Level 7
            inmate_count = 15;
        

        } else if ( this.current_wave == 7 ) {

            //level 8
            inmate_count = 20;


        } else if ( this.current_wave == 8 ) {

            //level 8
            inmate_count = 20;


        } else if ( this.current_wave == 9 ) {

            //level 8
            inmate_count = 20;
                       
        }

        return inmate_count;
    }





    //-------------------------
    ranger_inmate_count_by_level() {
        
        let ranger_inmate_count = 0;
        if ( this.current_wave == 5 ) {
            ranger_inmate_count = 5;
        } else if ( this.current_wave == 6 ) {

            ranger_inmate_count = 15;
        
        } else if ( this.current_wave == 7 ) {
            ranger_inmate_count = 20;

        } else if ( this.current_wave == 8 ) {
            ranger_inmate_count = 20;

        } else if ( this.current_wave == 9 ) {
            ranger_inmate_count = 20;

        }
        return ranger_inmate_count;
    }




    //-------------------------
    timeduration_by_level() {


        let time_remaining = 300;

        if ( this.current_wave == 1 ) {
            time_remaining = 300;
        } else if ( this.current_wave == 2 ) {
            time_remaining = 90;

        } else if ( this.current_wave == 3 ) {
            time_remaining = 200;
        
        } else if ( this.current_wave == 4 ) {
            time_remaining = 200;
        } else if ( this.current_wave == 5 ) {
            time_remaining = 200;
        } else if ( this.current_wave == 6 ) {
            time_remaining = 200;
        } else if ( this.current_wave == 7 ) {
            time_remaining = 200;
        } else if ( this.current_wave == 8 ) {
            time_remaining = 200;
        } else if ( this.current_wave == 9 ) {
            time_remaining = 200;
        } 

        return time_remaining;

    }

    init_resources_by_level() {

        // This code is ported from Mana Royale. The manaCost is used as Quantity here..

        // Level 1 : 15 inmates
        this.player_cards_collection[0].manaCost = 1;
        this.player_cards_collection[1].manaCost = 0;
        this.player_cards_collection[2].manaCost = 0;
        this.player_cards_collection[3].manaCost = 0;
        
        let inmate_count = this.inmate_count_by_level();

        if ( this.current_wave == 1 ) {
            // Level 2, 30 inms
            this.player_cards_collection[0].manaCost = 0;
            this.player_cards_collection[1].manaCost = 0;
            this.player_cards_collection[2].manaCost = 10;
            this.player_cards_collection[3].manaCost = 10;
            

        }  else if ( this.current_wave == 2 ) {
            // Level 3, 5 inmates, trap them
            this.player_cards_collection[0].manaCost = 0;
            this.player_cards_collection[1].manaCost = 40;
            this.player_cards_collection[2].manaCost = 3;
            this.player_cards_collection[3].manaCost = 3;
        
        }  else if ( this.current_wave == 3 ) {
            // Level 4, 40 inmates mix of resources
            this.player_cards_collection[0].manaCost = 1;
            this.player_cards_collection[1].manaCost = 10;
            this.player_cards_collection[2].manaCost = 0;
            this.player_cards_collection[3].manaCost = 1;
                

        }  else if ( this.current_wave == 4 ) {
            // Level 5, 50 inmates mix of resources
            this.player_cards_collection[0].manaCost = 0;
            this.player_cards_collection[1].manaCost = 10;
            this.player_cards_collection[2].manaCost = 20;
            this.player_cards_collection[3].manaCost = 1;        
        
        }  else if ( this.current_wave == 5 ) {
            // Level 6, 50 inmates mix of resources
            this.player_cards_collection[0].manaCost = 5;
            this.player_cards_collection[1].manaCost = 0;
            this.player_cards_collection[2].manaCost = 0;
            this.player_cards_collection[3].manaCost = 0;     


        }  else if ( this.current_wave == 6 ) {
            // Level 7, 50 inmates mix of resources
            this.player_cards_collection[0].manaCost = 2;
            this.player_cards_collection[1].manaCost = 0;
            this.player_cards_collection[2].manaCost = 0;
            this.player_cards_collection[3].manaCost = 0;               


        }  else if ( this.current_wave == 7 ) {
            // Level 8, 50 inmates mix of resources
            this.player_cards_collection[0].manaCost = 2;
            this.player_cards_collection[1].manaCost = 0;
            this.player_cards_collection[2].manaCost = 10;
            this.player_cards_collection[3].manaCost = 5;                   


        }  else if ( this.current_wave == 8 ) {
            // Level 9, 50 inmates mix of resources
            this.player_cards_collection[0].manaCost = 1;
            this.player_cards_collection[1].manaCost = 0;
            this.player_cards_collection[2].manaCost = 15;
            this.player_cards_collection[3].manaCost = 5;               

        }  else if ( this.current_wave == 9 ) {
            // Level 10, 50 inmates mix of resources
            this.player_cards_collection[0].manaCost = 10;
            this.player_cards_collection[1].manaCost = 50;
            this.player_cards_collection[2].manaCost = 50;
            this.player_cards_collection[3].manaCost = 50;               
        }   







        let i; 
        for ( i = 0 ; i < this.player_cards_collection.length ; i++ ) {
            this.player_cards_collection[i].refresh_manaCost();
        }

    }



    //-----------------------------------------------------------
    // Bookmark txcard
    public all_available_cards              = [ "spell_virus"  , "emptyblock" , "oilbarrel" , "spell_fire" ];
    public all_available_cards_mana         = [           100  ,           3  ,         100  ,          100  ];
    public all_available_cards_isspell      = [             1  ,           0  ,          0  ,           1  ];
    public all_available_cards_modelname    = [             "" ,          ""  , "oilbarrel" ,          ""   ];
    public all_available_cards_texturename  = [        "virus" , "emptyblock" , "oilbarrel" ,  "spell_fire" ];
    public all_available_cards_desc         = [ "Zombie Virus", "Empty Block", "Oil Barrel", "Fire Blast" ];
     //----
    init_player_cards_collection() {

        this.player_cards_collection.length = 0;

        
        let i;
       
       
        let card_sel_parent = new Entity();
        card_sel_parent.addComponent( new Transform( {
            position: new Vector3( 0 , 0 ,  0 )
        }));
        card_sel_parent.setParent( this.ui3d_root );
       
        this.card_sel_parent = card_sel_parent;
        

        // So that can rotate 180 independantly of billboard
        let card_sel_3d_ui = new Entity();
        card_sel_3d_ui.setParent(card_sel_parent);
        
        let card_sel_3d_ui_transform = new Transform( {
            position: new Vector3( 0, 0, 0 ),
        });
        card_sel_3d_ui.addComponent( card_sel_3d_ui_transform );  
        card_sel_3d_ui_transform.rotation.eulerAngles = new Vector3( 0 , 180, 0 );


        
        // Card selected highlight 
        let card_sel_highlight_material = new Material();
        card_sel_highlight_material.emissiveColor = Color3.Green();
        card_sel_highlight_material.emissiveIntensity = 3;
        

        // Individual cards
        for ( i = 0 ; i < this.all_available_cards.length ; i++ ) {

            let x = (( i % 4 ) - 2 ) * 1.2;
            let y = ((i / 4)  >> 0 ) * 1.2;
            let z = 0;

            let card_type   = this.all_available_cards[i];
            let card_mana   = this.all_available_cards_mana[i];
            let modelname   = this.all_available_cards_modelname[i];
            let texturename = this.all_available_cards_texturename[i];
            let desc        = this.all_available_cards_desc[i];

            let txcard = new Txcard(
                i ,
                card_sel_3d_ui,
                {
                    position: new Vector3( x, y, z),
                    scale   : new Vector3(1, 1, 1)
                },
                card_type,
                this,
                card_sel_highlight_material,
                card_mana,
                modelname,
                texturename
            );

            txcard.isSpell = this.all_available_cards_isspell[i] ;
            txcard.description = desc;


            this.player_cards_collection.push( txcard );


             // Pre-load so that later can visible faster.
            
        }

       
        

     }


    //--------
    //
    public preload_glb_list = ["inmate", "zombieinmate","rangerinmate", "oilbarrel"];

    preload_glb() {

        let i;
        for (  i = 0 ; i < this.preload_glb_list.length ; i++ ) {
            let preload_glb_model = new Entity();
            preload_glb_model.setParent( this );
            preload_glb_model.addComponent( new Transform(
                {
                    position: new Vector3( 0, -999 , 0 ),
                    scale   : new Vector3( 0.5,0.5,0.5)
                }
            ));
            let modelname = this.preload_glb_list[i];
            preload_glb_model.addComponent( resources.models[modelname] );
        }
        
    }



    //----
    init_ui_3d() {

        
        this.ui3d_root = new Entity();
        this.ui3d_root.setParent( this );
        this.ui3d_root.addComponent( new Transform(
            {   
                position: new Vector3( -2 , 4.5 , 7.5 )
            }
        ) );

        // HEre doesn''t control , go to update_button_ui
        //this.ui3d_root.addComponent( new Billboard() );
        this.ui3d_root.getComponent( Transform ).rotation.eulerAngles = new Vector3(0 , 180 , 0 );


        let backboard = new Entity();
        backboard.setParent( this.ui3d_root );
        backboard.addComponent( new BoxShape() );
        backboard.addComponent( new Transform( 
            {
                position: new Vector3( 0 , 1 , -0.1  ),
                scale   : new Vector3( 7.4, 13,  0.1 ) 
            }
        ));
        let material = new Material();
        material.albedoColor = Color3.FromInts(102, 77, 51);
        backboard.addComponent( material );


        let backboard2 = new Entity();
        backboard2.setParent( this.ui3d_root );
        backboard2.addComponent( new BoxShape() );
        backboard2.addComponent( new Transform( 
            {
                position: new Vector3(-6.2 , 1 , -0.1  ),
                scale   : new Vector3( 5, 13,  0.1 ) 
            }
        ));
        let material2 = new Material();
        material2.albedoColor = Color3.FromInts(32, 18, 13);
        backboard2.addComponent( material2 );




        let logo = new Entity();


        logo.setParent( this.ui3d_root );
        logo.addComponent( new PlaneShape() );
        logo.addComponent( new Transform( 
            {
                position: new Vector3( 0 , 6, 0 ),
                scale   : new Vector3( 8,  4, 4 )
            }
        ));
        material = new Material();
        material.albedoTexture = resources.textures.logo;
        material.specularIntensity = 0;
        material.roughness = 1;
        material.transparencyMode = 2;
        logo.addComponent( material );
        logo.getComponent( PlaneShape ).uvs = [
            0, 0 ,
            1, 0 ,
            1, 1 ,
            0, 1 ,
            0, 0 ,
            1, 0 ,
            1, 1 ,
            0, 1 ,
        ];




        this.menu_labels["lbl1"] = new Entity();
        this.menu_labels["lbl1"].addComponent( new TextShape() );
        this.menu_labels["lbl1"].addComponent( new Transform(
            {
                position:new Vector3( 0,  4.25 , 0 ),
                scale   :new Vector3( 0.25, 0.25, 0.25 )
            }
        ));
        this.menu_labels["lbl1"].getComponent( TextShape ).color = Color3.White();
        this.menu_labels["lbl1"].getComponent( Transform ).rotation.eulerAngles = new Vector3(0,180,0);
        this.menu_labels["lbl1"].setParent( this.ui3d_root );


        this.menu_labels["lbl2"] = new Entity();
        this.menu_labels["lbl2"].addComponent( new TextShape() );
        this.menu_labels["lbl2"].addComponent( new Transform(
            {
                position:new Vector3( 0,  2.5 , 0 ),
                scale   :new Vector3( 0.25, 0.25, 0.25 )
            }
        ));
        this.menu_labels["lbl2"].getComponent( TextShape ).color = Color3.White();
        this.menu_labels["lbl2"].getComponent( Transform ).rotation.eulerAngles = new Vector3(0,180,0);
        this.menu_labels["lbl2"].setParent( this.ui3d_root );


        this.menu_labels["lbl3"] = new Entity();
        this.menu_labels["lbl3"].addComponent( new TextShape() );
        this.menu_labels["lbl3"].addComponent( new Transform(
            {
                position:new Vector3( 0,  3.55 , 0 ),
                scale   :new Vector3( 0.25, 0.25, 0.25 )
            }
        ));
        this.menu_labels["lbl3"].getComponent( TextShape ).color = Color3.White();
        this.menu_labels["lbl3"].getComponent( Transform ).rotation.eulerAngles = new Vector3(0,180,0);
        this.menu_labels["lbl3"].setParent( this.ui3d_root );








        let selected_unit_photo = new Entity();
        selected_unit_photo.setParent( this.ui3d_root );
        selected_unit_photo.addComponent( new PlaneShape() );
        selected_unit_photo.addComponent( new Transform(
            {
                position: new Vector3( 1.5, 2.5 ,0),
                scale : new Vector3(  2,  2 , 2 )
            }
        ));
        selected_unit_photo.getComponent( PlaneShape ).visible = false;
        selected_unit_photo.getComponent( PlaneShape ).uvs = [
            0, 0 ,
            1, 0 ,
            1, 1 ,
            0, 1 ,
            0, 0 ,
            1, 0 ,
            1, 1 ,
            0, 1 
        ];
        material = new Material();
        material.albedoTexture = resources.textures["archer"];
        material.specularIntensity = 0;
        material.roughness = 1;
        selected_unit_photo.addComponent( material );

        this.uiimg_selected_unit_photo = selected_unit_photo;
        





        this.menu_labels["lbl4"] = new Entity();
        this.menu_labels["lbl4"].addComponent( new TextShape() );
        this.menu_labels["lbl4"].addComponent( new Transform(
            {
                position:new Vector3( 1.5, 0.5 , 0 ),
                scale   :new Vector3( 0.25, 0.25, 0.25 )
            }
        ));

        this.menu_labels["lbl4"].getComponent( TextShape ).color = Color3.White();
        this.menu_labels["lbl4"].getComponent( Transform ).rotation.eulerAngles = new Vector3(0,180,0);
        this.menu_labels["lbl4"].setParent( this.ui3d_root );

        

        // Highscores
        this.menu_labels["lbl5"] = new Entity();
        this.menu_labels["lbl5"].addComponent( new TextShape() );
        this.menu_labels["lbl5"].addComponent( new Transform(
            {
                position:new Vector3( -6.2, 6.2 , 0 ),
                scale   :new Vector3( 0.45, 0.45, 0.45 )
            }
        ));

        this.menu_labels["lbl5"].getComponent( TextShape ).color = Color3.White();
        this.menu_labels["lbl5"].getComponent( Transform ).rotation.eulerAngles = new Vector3(0,180,0);
        this.menu_labels["lbl5"].setParent( this.ui3d_root );


        this.menu_labels["lbl6"] = new Entity();
        this.menu_labels["lbl6"].addComponent( new TextShape() );
        this.menu_labels["lbl6"].addComponent( new Transform(
            {
                position:new Vector3( -4.5, 5.0 , 0 ),
                scale   :new Vector3( 0.3, 0.3, 0.3 )
            }
        ));

        this.menu_labels["lbl6"].getComponent( TextShape ).color = Color3.White();
        this.menu_labels["lbl6"].getComponent( Transform ).rotation.eulerAngles = new Vector3(0,180,0);
        this.menu_labels["lbl6"].setParent( this.ui3d_root );
        this.menu_labels["lbl6"].getComponent( TextShape ).hTextAlign = "left";
        this.menu_labels["lbl6"].getComponent( TextShape ).vTextAlign = "top";



        this.init_buttons();
    }   






    //-----------------
    init_buttons() {

        this.buttons["singleplayer"] = new Txclickable_box(
            "Single Player" , 
            "singleplayer",
            {
                position: new Vector3( 0, 1.5,  0),
                scale   : new Vector3(0.5,0.5,0.5)
            },
            this.ui3d_root,
            this
        );


        
        this.buttons["multiplayer"] = new Txclickable_box(
            "Multi Player",
            "multiplayer", 
            {
                 position: new Vector3( 0, 0.5 ,  0),
                 scale   : new Vector3(0.5,0.5,0.5)
            },
            this.ui3d_root,
            this
        );


        

        this.buttons["confirm"] = new Txclickable_box(
            "Confirm" , 
            "confirm",
            {
                position: new Vector3( 1.5 , 3, 0),
                scale   : new Vector3(0.5,0.5,0.5)
            },
            this.ui3d_root,
            this
        );
        this.buttons["confirm"].hide();


        this.buttons["cancel"] = new Txclickable_box(
            "Cancel" , 
            "cancel",
            {
                position: new Vector3( -1.5 , 3,  0),
                scale   : new Vector3(0.5,0.5,0.5)
            },
           this.ui3d_root,
            this
        );
        this.buttons["cancel"].hide();




        this.buttons["leavegame"] = new Txclickable_box(
            "Leave Game" ,
            "leavegame", 
            {
                position: new Vector3(-1.5, -2, 0),
                scale   : new Vector3(0.5,0.5,0.5)
            },
            this.ui3d_root,
            this
        );
        this.buttons["leavegame"].hide();


        this.buttons["topup"] = new Txclickable_box(
            "Topup Items" ,
            "topup", 
            {
                position: new Vector3(1.5, -2, 0),
                scale   : new Vector3(0.5,0.5,0.5)
            },
            this.ui3d_root,
            this
        );
        this.buttons["topup"].hide();


         this.buttons["paynow"] = new Txclickable_box(
            "Pay Now" ,
            "paynow", 
            {
                position: new Vector3(1.5, -2, 0),
                scale   : new Vector3(0.5,0.5,0.5)
            },
            this.ui3d_root,
            this
        );
        this.buttons["paynow"].hide();

        
            

        // host game 
         this.buttons["hostgame"] = new Txclickable_box(
            "Host Game" , 
            "hostgame",
            {
                position: new Vector3( 1.5 , 3, 0),
                scale   : new Vector3(0.5,0.5,0.5)
            },
            this.ui3d_root,
            this
        );
        this.buttons["hostgame"].hide();


        // This one is for joining game.
        let i;
        let itemcount = 5;
        for ( i = 0 ; i < itemcount;  i++ ) {

            this.buttons["playButton" + i ] = new Txclickable_box(
                "Play", 
                "play",
                {
                    position: new Vector3( 1.5 , 1.5 - i * 0.9  ,  0 ),
                    scale   : new Vector3(0.5,0.5, 0.5)
                },
                this.ui3d_root,
                this
            );

            this.buttons["playButton" + i ].hide();
            this.buttons["playButton" + i ].box_transform.scale.x = 4.2;
        }


        this.buttons["upgrade"] = new Txclickable_box(
            "Upgrade" , 
            "upgrade",
            {
                position: new Vector3( -1.5 , 1.5,  0),
                scale   : new Vector3(0.5,0.5,0.5)
            },
           this.ui3d_root,
            this
        );
        this.buttons["upgrade"].hide();


        this.buttons["sell"] = new Txclickable_box(
            "Sell" , 
            "sell",
            {
                position: new Vector3( -1.5 , 0.5,  0),
                scale   : new Vector3(0.5,0.5,0.5)
            },
           this.ui3d_root,
            this
        );
        this.buttons["sell"].hide();
    }   


    


    //--------------
    init_ui_2d() {


        let ui_2d_canvas = new UICanvas();
        

        let ui_2d_text = new UIText( ui_2d_canvas );
        ui_2d_text.value = "3:00";
        ui_2d_text.vAlign = "bottom";
        ui_2d_text.fontSize = 16;
        ui_2d_text.positionX = 30;
        ui_2d_text.positionY = 10;
        this.uitxt_time = ui_2d_text;
        

        ui_2d_text = new UIText( ui_2d_canvas );
        ui_2d_text.value = "" ;
        ui_2d_text.vAlign = "center";
        ui_2d_text.fontSize = 16;
        ui_2d_text.positionX = -50;
        ui_2d_text.positionY = 40;
        this.uitxt_instruction = ui_2d_text;








        // Selected card 2d ui

        let ui_2d_image = new UIImage(ui_2d_canvas , resources.textures.virus );
        ui_2d_image.vAlign = "bottom";
        ui_2d_image.hAlign = "left";
        
        ui_2d_image.sourceWidth = 256;
        ui_2d_image.sourceHeight = 256;
        
        ui_2d_image.width = 64;
        ui_2d_image.height = 64;
        
        ui_2d_image.positionX = 0;
        ui_2d_image.positionY = 40;
        this.uiimg_selected_card = ui_2d_image;



        ui_2d_image = new UIImage( this.uiimg_selected_card , resources.textures.manaoutline );
        ui_2d_image.vAlign = "bottom";
        ui_2d_image.hAlign = "right";
            
        ui_2d_image.sourceWidth = 128;
        ui_2d_image.sourceHeight = 128;
        
        ui_2d_image.width = 32;
        ui_2d_image.height = 32;
        ui_2d_image.positionX = 10;
        ui_2d_image.positionY = -10;
        


        ui_2d_text = new UIText(  this.uiimg_selected_card );
        ui_2d_text.value = "20";
        ui_2d_text.vAlign = "bottom";
        ui_2d_text.hAlign = "right";
        ui_2d_text.fontSize = 12;
        ui_2d_text.positionX =  50;
        ui_2d_text.positionY =   -2;
        this.uitxt_selected_card_mana = ui_2d_text;

        this.uiimg_selected_card.visible = false;
        












        

    }




    //---
    init_shared_material() {

        let material = new Material();
        material.albedoTexture = resources.textures.explosion;
        material.roughness = 1.0;
        material.specularIntensity = 0;
        material.transparencyMode  = 2;
        material.emissiveIntensity = 4.5;
        material.emissiveColor = Color3.FromInts(252, 164, 23);
        this.shared_explosion_material = material;



        material = new Material();
        material.albedoTexture = resources.textures.zap;
        material.roughness = 1.0;
        material.specularIntensity = 0;
        material.transparencyMode  = 2;
        material.emissiveIntensity = 10.5;
        material.emissiveColor = Color3.FromInts(155, 155, 255);
        this.shared_zap_material = material;




        material = new Material();
        material.albedoTexture = resources.textures.fire;
        material.roughness = 1.0;
        material.specularIntensity = 0;
        material.transparencyMode  = 2;
        material.emissiveIntensity = 10.5;
        material.emissiveColor = Color3.FromInts(252, 164, 23);
        this.shared_fire_material = material;

        

        
        material = new Material();
        material.albedoTexture = resources.textures.selectionring;
        material.roughness = 1.0;
        material.specularIntensity = 0;
        material.transparencyMode  = 2;
        material.emissiveIntensity = 10.5;
        material.emissiveColor = Color3.FromInts(255, 0, 0);
        this.shared_selectionring_material = material;




        material = new Material();
        material.albedoTexture = resources.textures.fireball;
        material.roughness = 1.0;
        material.specularIntensity = 0;
        material.transparencyMode  = 2;
        material.emissiveIntensity = 4.5;
        material.emissiveColor = Color3.FromInts(252, 164, 23);
        this.shared_fireball_material = material;
        this.shared_fireball_shape = new PlaneShape();
        this.shared_fireball_shape.uvs = [
            0, 0 ,
            1/4, 0 ,
            1/4, 1/4 ,
            0, 1/4 ,
            0, 0 ,
            1/4, 0 ,
            1/4, 1/4 ,
            0, 1/4 ,
        ];






        material = new Material();
        material.albedoTexture = resources.textures.clock;
        material.roughness = 1.0;
        material.specularIntensity = 0;
        material.transparencyMode  = 2;
        this.shared_clock_material = material; 

        this.shared_box = new BoxShape();


        
        this.shared_billboard = new Billboard();

    }




    init_sound( ) {

        let snd ;
        for ( snd in resources.sounds ) {
            this.sounds[snd]     = new Txsound(this, resources.sounds[snd] );
        }    
       

        
    }







    //---------
    init_pathfinder()  {

        let grid        = {};
        let solution    = {};
        this.pathfinder = new PathFinder(grid , -6, -6, 6, 6, solution );
        this.reset_pathfinder_obstacles();
    }



    //-----------------
    reset_pathfinder_obstacles() {

        this.pathfinder.reset() ;
    }



    getTowerUnitName( type ) {

        let remove_tower_prefix = type.replace("tower","")
        return remove_tower_prefix.charAt(0).toUpperCase() + remove_tower_prefix.slice(1);

    }




















    //--------------------------

    //        Game objects instantiation: Clock, Explosion, Projectiles, Unit

    //--------------------------



    //-------------
    removeClock( cl ) {

        engine.removeEntity( this.clocks[ cl.id ] );
        this.clocks[ cl.id ] = null ;

        

        let i;
        for ( i =  this.clocks.length - 1 ; i >= 0 ; i-- ) {
            // Shorten array if possible
            if ( this.clocks[i] == null ) {
                this.clocks.length = i;
            } else {
                break;
            }
        }

        //log( "clock removed ", cl.id  , this.clocks.length );

    }

    //------------
    getRecyclableClockIndex( ) {

        let i;
        for ( i = 0 ; i < this.clocks.length ; i++ ) {
            if ( this.clocks[i] == null ) {
                return i;
            }
        }
        return -1;
    }


    //------------
    getRecyclableClock( ) {

        return -1;
        let i;
        for ( i = 0 ; i < this.clocks.length ; i++ ) {
            if ( this.clocks[i] != null  && this.clocks[i].visible == 0 ) {
                return i;
            }
        }
        return -1;
    }

    //---------
    createClock( location_v3 , wait_buffer  ) {

        let clock:Txclock;
        let recyclable_index = this.getRecyclableClock( );


        if ( recyclable_index >= 0 ) {

            // Reuse entity
            clock                                   = this.clocks[recyclable_index];
            clock.getComponent(Transform).position  = location_v3;
            clock.tick                              = 0;
            clock.endtick                           = wait_buffer;
            
            clock.frame_index                       = 0;
            clock.frame_tick                        = 0;
            clock.frame_tick_per_frame              = ( wait_buffer / 16 ) >> 0;
            if ( clock.frame_tick_per_frame < 1 ) {
                clock.frame_tick_per_frame = 1;
            }

            clock.getComponent( PlaneShape ).uvs    = clock.getUV_coord();
            clock.visible                           = 1;
            
            //log( "clock reuse entity" , clock.id , " arr len", this.clocks.length );

        } else {
        
            clock = new Txclock(
                this.clocks.length,
                this,
                {
                    position: location_v3
                },
                this.shared_clock_material,
                wait_buffer
            ) ;
            
            recyclable_index = this.getRecyclableClockIndex();

            if ( recyclable_index == -1 ) {
                this.clocks.push( clock );

            } else {
                // Reuse index.
                clock.id = recyclable_index;
                this.clocks[recyclable_index] = clock;
            }

           // log( "Clock " , clock.id , " inited. arr len", this.clocks.length );
        }

       
            
        return clock;
    }







    //------------------
    removeExplosion( ex ) {

        engine.removeEntity( this.explosions[ ex.id ] );
        this.explosions[ ex.id ] = null;

        let i;
        for ( i =  this.explosions.length - 1 ; i >= 0 ; i-- ) {
            // Shorten array if possible
            if ( this.explosions[i] == null ) {
                this.explosions.length = i;
            } else {
                break;
            }
        }
    }



    //------------
    getRecyclableExplosionIndex( ) {

        let i;
        for ( i = 0 ; i < this.explosions.length ; i++ ) {
            if ( this.explosions[i] == null ) {
                return i;
            }
        }
        return -1;
    }


    //------------
    getRecyclableExplosion( type ) {

        let i;
        for ( i = 0 ; i < this.explosions.length ; i++ ) {
            if ( this.explosions[i] != null && this.explosions[i].type == type && this.explosions[i].visible == 0 ) {
                return i;
            }
        }
        return -1;
    }



    //---------
    createExplosion( location_v3 ,  owner ,  scale_x , scale_y , explosion_type, damage , damage_building , wait_buffer ) {

        let explosion:Txexplosion;
        let recyclable_index = this.getRecyclableExplosion( explosion_type );

        let material = this.shared_explosion_material;

        if ( explosion_type == 1 ) {
            material = this.shared_explosion_material;
            
        } else if ( explosion_type == 2 ) {
            material = this.shared_zap_material;
            
        } else if ( explosion_type == 3 ) {
            material = this.shared_selectionring_material;
        
        } else if ( explosion_type == 4 ) {
            material = this.shared_fire_material ;
        } 



        
        if ( recyclable_index >= 0 ) {

            if ( explosion_type == 4 ) {
                log("using recycle fire");
            }

            // Reuse entity
            explosion = this.explosions[recyclable_index];
            explosion.getComponent(Transform).position = location_v3;
            explosion.getComponent(Transform).scale.x    = scale_x ;
            explosion.getComponent(Transform).scale.y    = scale_y ;
            explosion.getComponent(Transform).scale.z    = scale_y ;
                
            explosion.damage = damage;
            explosion.owner  = owner;
            explosion.tick = explosion.tick_per_frame;
            explosion.frame_index = 0;

            explosion.visible = 1;
            

        } else {
            
            // constructor( id, parent , transform_args  , shared_material , owner, type,  damage ,  damage_building ) 

            explosion = new Txexplosion(
                this.explosions.length,
                this,
                {
                    position: location_v3,
                    scale   : new Vector3( scale_x, scale_y , scale_y )
                },
                material,
                owner,
                explosion_type,
                damage,
                damage_building
            ) ;
            
            recyclable_index = this.getRecyclableExplosionIndex();

            if ( recyclable_index == -1 ) {
                this.explosions.push( explosion );

            } else {
                // Reuse index.
                explosion.id = recyclable_index;
                this.explosions[recyclable_index] = explosion;
            }
        }

        explosion.dead = 3;
        explosion.wait_buffer = wait_buffer;
        explosion.getComponent( PlaneShape ).uvs = explosion.getUV_coord();

        
       // log( "Explosion " , explosion.id , " inited. arr len", this.explosions.length );
            
        return explosion;
    }

















    //------------------
    removeProjectile( p ) {

        engine.removeEntity( this.projectiles[ p.id ] );
        this.projectiles[ p.id ] = null;

        let i;
        for ( i =  this.projectiles.length - 1 ; i >= 0 ; i-- ) {
            // Shorten array if possible
            if ( this.projectiles[i] == null ) {
                this.projectiles.length = i;
            } else {
                break;
            }
        }
    }





     //------------
    getRecyclableProjectileIndex() {

        let i;
        for ( i = 0 ; i < this.projectiles.length ; i++ ) {
            if ( this.projectiles[i] == null ) {
                return i;
            }
        }
        return -1;
    
    }

    //--------
    getRecyclableProjectile( type ) {

        let i;
        for ( i = 0 ; i < this.projectiles.length ; i++ ) {
            if ( this.projectiles[i] != null  && this.projectiles[i].type == type && this.projectiles[i].visible == 0 ) {
                return i;
            }
        }
        return -1;
    
    }



    //------------
    createProjectile( src_v3, dst_v3 , owner , projectile_type , attacktarget, damage , damage_building , wait_buffer ) {


        let projectile:Txprojectile;
        
        let shape ;
        if ( projectile_type == 1 ) {

            shape = resources.models.arrow;
            
        } else if ( projectile_type == 2  ) {

            shape = this.shared_fireball_shape;
            

        } else if ( projectile_type == 3 ) {

            shape = this.shared_fireball_shape;
            
        }


        let recyclable_index = this.getRecyclableProjectile( projectile_type );
        
        if ( recyclable_index >= 0 ) {

            // Reuse entity
            projectile = this.projectiles[recyclable_index];
            projectile.getComponent(Transform).position = src_v3;
            projectile.src_v3                           = src_v3;
            projectile.dst_v3                           = dst_v3;
            projectile.attacktarget = attacktarget;
            projectile_type = projectile_type;
            projectile.damage = damage;
            projectile.damage_building = damage_building;
            projectile.owner  = owner;
            projectile.tick   = 0;
            projectile.visible = 1;
            

           // log("Reusing projectile" , "type", projectile.type, "id" , projectile.id , "arrlen", this.projectiles.length );

        } else {

            //  constructor( id, parent , shape, src_v3, dst_v3  , owner,  type, attacktarget ,  damage , damage_building ) {

            projectile = new Txprojectile(
                this.projectiles.length,
                this,
                shape,
                src_v3, 
                dst_v3,
                owner,
                projectile_type,
                attacktarget,
                damage,
                damage_building,
            );

            if ( projectile_type == 1 ) {
                // Arrow
                projectile.speed = 4.5;

            } else if ( projectile_type == 2 ) {
                // Fireball
                projectile.speed = 3.5;
                projectile.getComponent( Transform ).scale.setAll(0.5);
                projectile.addComponent( this.shared_fireball_material );
                projectile.addComponent( new Billboard() );
            
            } else if ( projectile_type == 3 ) {
                // Spell fireball
                projectile.speed = 10;
                projectile.getComponent( Transform ).scale.setAll(1.5);
                projectile.addComponent( this.shared_fireball_material );
                projectile.addComponent( new Billboard() );
            
            }
            

            recyclable_index = this.getRecyclableProjectileIndex();
            if ( recyclable_index == -1 ) {    
                this.projectiles.push( projectile );

             //   log("Initing new projectile" , "type", projectile.type, "id" , projectile.id , "arrlen", this.projectiles.length );

            
            } else {
                // Reuse index
                projectile.id = recyclable_index;
                this.projectiles[recyclable_index] = projectile 

            //    log("Initing new projectile reusing index" , "type", projectile.type, "id" , projectile.id , "arrlen", this.projectiles.length );

            
            }
        }

        projectile.dead = 3;
        projectile.wait_buffer = wait_buffer;
        if ( projectile_type == 2 || projectile_type == 3 ) {
            projectile.getComponent( PlaneShape ).uvs = projectile.getUV_coord();
        }

        //log( "Projectile " , "type:", projectile.type, "id:", projectile.id , " inited. arr len", this.projectiles.length );
        return projectile;
    }















    //------------
    getRecyclableUnitIndex( ) {
        let i;
        for ( i = 6 ; i < this.units.length ; i++ ) {
            if ( this.units[i] == null ) {
                return i;
            }
        }
        return -1;
    }


    //------------
    getRecyclableUnit( type ) {
        let i;
        for ( i = 6 ; i < this.units.length ; i++ ) {
            if ( this.units[i] != null && this.units[i].visible == 0 && this.units[i].type == type ) {
                return i;
            }
        }
        return -1;
    }






    //------------------
    removeUnit( u ) {

        log( "Removing unit", u.id );

        try {
            this.world.DestroyBody( u.box2dbody );
        } catch (error) {
            log( u.id, "Error this.world.DestroyBody", error, "nvm continue.");
        }
        
        engine.removeEntity( this.units[ u.id ] );
        this.units[ u.id ] = null;


        let i;
        for ( i =  this.units.length - 1 ; i >= 0 ; i-- ) {
            // Shorten array if possible
            if ( this.units[i] == null ) {
                this.units.length = i;
            } else {
                break;
            }
        }
    }
 

    //---------------------
    spawnUnit( type , x, z , owner , wait_buffer ) {




        this.createClock( new Vector3(x, 3.0 ,z ) , wait_buffer );
                
       if ( type == "spell_fireball" ) {
            
            // createProjectile( src_v3, dst_v3 , owner , projectile_type , attacktarget, damage , damage_building ) {

            this.createProjectile(  
                new Vector3(0,  10 , 0),
                new Vector3(x,   2, z),
                owner,
                3,
                null,
                572,
                172,
                wait_buffer
            );

        } else if ( type == "spell_zap" ) {
            
            this.createExplosion( 
                    new Vector3( x , 1.5 , z ), 
                    owner, 

                    3,
                    3,

                    2,
                    159,
                    48,
                    wait_buffer
                );

        } else if ( type == "spell_fire" ) {

           this.createExplosion( 
                    new Vector3( x , 2.25 , z ), 
                    owner, 
                    
                    2,
                    2,

                    1,
                    1,
                    0,
                    0
                );

        } else if ( type == "spell_virus" ) {

            this.createExplosion( 
                    new Vector3( x , 1.5 , z ), 
                    owner, 
                    3,
                    3,
                    3,
                    159,
                    48,
                    wait_buffer
                );

            
       
        } else { 
            this.createUnit( type, x  , z , owner, wait_buffer );
        }
        
    }


    

    //---------------------
    createUnit( type , x, z , owner, wait_buffer  ) {

    	//log( "createUnit" , type, owner, "wait_buffer", wait_buffer, "gtick", this.globaltick );

    	let y ;
    	let modelsize;
    	let b2dsize;
    	let model;
        let model2 = null;
    	
        let isFlying     = 0;
        let isSpawner     = 0;

        let speed        = 5;
        let maxhp:number = 67;
        
        let attackSpeed  = 30;
        let damage:number = 67;

        let healthbar_y  = 3;
        let projectile_user = 0;

        let attack_building_only = 0;

        let attackRange = 0.3;
        let aggrorange  = 3.0;

        let shapetype   = "dynamic";
    	

    	if ( type == "inmate" ) {


            y            = 1.6;
            modelsize   = 0.15;
            b2dsize     = 0.15;
            model       = resources.models.inmate;

            damage      = 7;
            maxhp       = 270;
            attackSpeed = 30;
            aggrorange  = 1.0;

            speed       = 10;


         } else if ( type == "rangerinmate" ) {


            y            = 1.6;
            modelsize   = 0.15;
            b2dsize     = 0.15;
            model       = resources.models.rangerinmate;

            damage      = 200;
            maxhp       = 1500;
            attackSpeed = 30;
            aggrorange  = 2.0;

            speed       = 10;    
            attackRange = 3.0;
            projectile_user = 1;


        
        } else if ( type == "zombieinmate" ) {


            y            = 1.6;
            modelsize   = 0.15;
            b2dsize     = 0.15;
            model       = resources.models.zombieinmate;

            damage      = 135;
            maxhp       = 450;

            aggrorange  = 1.5;

            attackSpeed = 30;
            attackRange = 0.4;
            speed       = 25;
    
            this.sounds["zombieroar"].playOnce();

        
        } else if ( type == "emptyblock" ) {

            y           = 1.41;
            modelsize   = 1.0;
            b2dsize     = 1.0;
            
            model       = this.shared_box;
            model2      = "";
            damage      = 0;
            maxhp       = 1000;
            attackSpeed = 0;
            speed       = 0;
            attackRange = 0;
            projectile_user = 0;
            shapetype = "static";
        
        } else if ( type == "oilbarrel" ) {

            y           = 1.9;
            modelsize   = 0.8;
            b2dsize     = 0.4;
                
            model       = resources.models.oilbarrel;
            model2      = "";
            damage      = 0;
            maxhp       = 1000;
            attackSpeed = 0;
            speed       = 0;
            attackRange = 0;
            projectile_user = 0;
            shapetype = "static";
        }







        

        let unit:Txunit;
        let recyclable_index = this.getRecyclableUnit( type );

        if ( recyclable_index >= 0 ) {

            unit = this.units[recyclable_index];
            unit.transform.position = new Vector3( x, y, z );
            unit.transform.scale    = new Vector3( modelsize, modelsize, modelsize );
            unit.owner = owner;
            
            unit.isFlying = isFlying;
            unit.aggroRange = aggrorange;
                
            if ( unit.owner == 1 ) {
                unit.healthbar.getComponent( Material ).albedoColor = Color3.FromInts( 255, 0, 0 );
            } else {
                unit.healthbar.getComponent( Material ).albedoColor = Color3.FromInts( 0, 0, 200 );
            }
            unit.tick = 0;
            unit.wait_buffer = wait_buffer;
            unit.dead = 3;
            unit.attacktarget = null ;
            unit.movetarget   = null ;
            unit.attacking    = 0;
            
            unit.stopAllClips();
            unit.playAnimation("Walking",1);
            
            unit.visible = 1;



            //log( "reuse unit entity " , unit.type, unit.id , " inited. arr len", this.units.length );

        } else {

           

            unit = new Txunit(
                        this.units.length,
                        this,
                        {
                            position: new Vector3( x , y ,  z ),
                            scale   : new Vector3( modelsize, modelsize, modelsize )
                        },
                        {
                            scale   : new Vector3( b2dsize , b2dsize , b2dsize )
                        },
                        model,
                        type,
                        shapetype,
                        owner,
                        isFlying,
                        aggrorange,
                        healthbar_y,
                        wait_buffer,
                        model2
                    );

            
            recyclable_index = this.getRecyclableUnitIndex();

            if ( recyclable_index == -1 ) {
                this.units.push( unit );
            } else {
                unit.id = recyclable_index;
                this.units[recyclable_index] = unit;
            }	
        
           // log( "Unit " , unit.type, unit.id , " inited. arr len", this.units.length );
        
        }



        if ( unit.owner == -1 ) {
            
            let ori_maxhp = maxhp;
            let extra_hp  = 0;

            let ori_speed = speed; 
            let extra_speed = 0;

            extra_hp = ori_maxhp * (  Math.pow(2, this.current_wave / 10)  )  ;
            
            if ( this.current_wave >= 10 ) {
                extra_speed = this.current_wave / 10 * this.difficulty ;
            }
            
            maxhp = (ori_maxhp + extra_hp )   * this.difficulty;
            speed = (ori_speed + extra_speed) ;
        }





        unit.curhp       = maxhp;
        unit.maxhp       = maxhp;
        unit.curlvl      = 1;
    	unit.attackRange = attackRange;
    	unit.speed 		 = speed;
        unit.attackSpeed = attackSpeed;
        unit.damage      = damage;
        unit.projectile_user = projectile_user;
        unit.attack_building_only = attack_building_only;
        unit.dead       = 3;
        unit.isSpawner  = isSpawner;
        unit.rage       = 0;
        unit.walking_queue.length = 0;
        unit.fire       = null;


        if ( unit.owner == -1 ) {
            unit.transform.rotation.eulerAngles = new Vector3( 0, 180 ,0) ;
        } else {
            unit.transform.rotation.eulerAngles = new Vector3( 0, 0 ,0) ;
        }        

        if ( unit.shapetype == "static" ) {

            let tile_x = Math.round(   x  / this.grid_size_x ) >> 0 ;
            let tile_z = Math.round(   z  / this.grid_size_z ) >> 0 ;
            let node = this.pathfinder.createNode( tile_x, tile_z );
            node["walkable"] = 0;
            
        }

        this.sounds["spawn"].playOnce();

		
    	return unit;
    }
































    //--------------------------
    //
    //      Box2D Section
    //
    //--------------------------


	//-----------------
	construct_box2d_shapes( ) {

    	let vertices = [];	
    	let xoffset = 0;
    	let yoffset = 0;
		
        vertices.length = 0 ;
        vertices.push(  new b2Vec2(   -7* this.grid_size_x,   -7 * this.grid_size_z  ) ); 
        vertices.push(  new b2Vec2(  -6.5* this.grid_size_x,  -7 * this.grid_size_z  ) );   
        vertices.push(  new b2Vec2(  -6.5* this.grid_size_x,    7 * this.grid_size_z  ) );   
        vertices.push(  new b2Vec2(   -7* this.grid_size_x,     7 * this.grid_size_z  ) );   
        
        this.createStaticShape( xoffset , yoffset , vertices , this.world );


        vertices.length = 0 ;
        vertices.push(  new b2Vec2(   6.5* this.grid_size_x,   -7 * this.grid_size_z  ) ); 
        vertices.push(  new b2Vec2(    7* this.grid_size_x,    -7 * this.grid_size_z  ) );   
        vertices.push(  new b2Vec2(    7* this.grid_size_x,     7 * this.grid_size_z  ) );   
        vertices.push(  new b2Vec2(   6.5* this.grid_size_x,    7 * this.grid_size_z  ) );   


        this.createStaticShape( xoffset , yoffset , vertices , this.world );



        vertices.length = 0 ;
        vertices.push(  new b2Vec2(   -7* this.grid_size_x,    6.5 * this.grid_size_z  ) ); 
        vertices.push(  new b2Vec2(    7* this.grid_size_x,    6.5 * this.grid_size_z  ) );   
        vertices.push(  new b2Vec2(    7* this.grid_size_x,     7 * this.grid_size_z  ) );   
        vertices.push(  new b2Vec2(   -7* this.grid_size_x,     7 * this.grid_size_z  ) );   
        
        this.createStaticShape( xoffset , yoffset , vertices , this.world );


        vertices.length = 0 ;
        vertices.push(  new b2Vec2(   -7* this.grid_size_x,   -7 * this.grid_size_z  ) ); 
        vertices.push(  new b2Vec2(    7* this.grid_size_x,   -7 * this.grid_size_z  ) );   
        vertices.push(  new b2Vec2(    7* this.grid_size_x,   -6.5 * this.grid_size_z  ) );   
        vertices.push(  new b2Vec2(   -7* this.grid_size_x,   -6.5 * this.grid_size_z  ) );   
        
        this.createStaticShape( xoffset , yoffset , vertices , this.world );
        
       

	}

	//----------
    createStaticShape( x, y , vertices, world ) {
    	return this.createShape( x, y, world,  b2BodyType.b2_staticBody, vertices );
    }

     //------------
    createShape( x, y, world, body_type , vertices  ) {

    	let bodyDef   = new b2BodyDef();
        bodyDef.position.Set( x , y );
        bodyDef.type 	= body_type;
		
        let fixDef          = new b2FixtureDef();
        fixDef.density      = 10;
        fixDef.friction     = 100;
        fixDef.restitution  = 0.5;
        fixDef.shape        = new b2PolygonShape();

        fixDef.shape.Set( vertices , vertices.length );

        let b2body = world.CreateBody(bodyDef);
        b2body.CreateFixture(fixDef);
        return b2body;
    }

    //-------------
    createDynamicBox( x, y , width , height , world  ) {
    	return this.createBox( x,y,width,height, world,  b2BodyType.b2_dynamicBody );
    }	
    //------------------
    createStaticBox( x, y , width , height , world  ) {
    	return this.createBox( x,y,width,height, world,  b2BodyType.b2_staticBody );
    }
    //-------------------
    createBox( x, y , width , height , world , body_type ) {
    	
    	let bodyDef   = new b2BodyDef();
        bodyDef.position.Set( x , y );
        bodyDef.type 	= body_type;
		
        let fixDef          = new b2FixtureDef();
        fixDef.density      = 1.0;
        fixDef.friction     = 0.00;
        fixDef.restitution  = 0.1;
        fixDef.shape        = new b2PolygonShape();
        fixDef.shape.SetAsBox( width/2 , height/2 );

        let b2body = world.CreateBody(bodyDef);
        b2body.CreateFixture(fixDef);

        return b2body;
    }

      //-------------
    createDynamicCircle( x, y , radius , world , ccd  ) {
    	return this.createCircle( x,y, radius , world,  b2BodyType.b2_dynamicBody , ccd );
    }		
	
	 //-------------
    createStaticCircle( x, y , radius , world  ) {
    	return this.createCircle( x,y, radius , world,  b2BodyType.b2_staticBody , false );
    }		

    //----------------
    createCircle( x,y, radius , world, body_type , ccd ) {

    	// Box2D
    	let bodyDef   = new b2BodyDef();
        bodyDef.position.Set( x , y );
        bodyDef.type 	= body_type;
        bodyDef.bullet  = ccd;
		
        let fixDef          = new b2FixtureDef();
        fixDef.density      = 20;
        fixDef.friction     = 100;
        fixDef.restitution  = 0.3;
       

        fixDef.shape        = new b2CircleShape(radius);
        
        let b2body = world.CreateBody(bodyDef);
        b2body.CreateFixture(fixDef);
        b2body.SetLinearDamping(1);
		b2body.SetAngularDamping(1);


        return b2body;

    }

    //-------------
    createDynamicSensorCircle( x,y, radius , world, sensorid ) {

    	// Box2D
    	let bodyDef   = new b2BodyDef();
        bodyDef.position.Set( x , y );
        bodyDef.type 	= b2BodyType.b2_dynamicBody;
        bodyDef.userData  = sensorid;
		
        let fixDef          = new b2FixtureDef();
        fixDef.density      = 0.0;
        fixDef.friction     = 0.0;
        fixDef.restitution  = 0.0;
        fixDef.shape        = new b2CircleShape(radius);
        fixDef.isSensor 	= true;
        
        let b2body = world.CreateBody(bodyDef);
        b2body.CreateFixture(fixDef);

        return b2body;

	}
}



