/// <reference path="../vars/Globals.ts" />
"use strict";
class BaseCreep { //Abstract class
    public creep: Creep;
    protected target;
    protected action_name;

    constructor(creep: Creep) {
        this.creep = creep;
        this.target = Game.getObjectById(this.creep.memory.target_id);
        this.action_name = this.creep.memory.action_name;
    }

    //This should be extended...
    static creep_tiers = [
        {
            'cost': 50,
            'body': [],
        },
    ];

    // static get_creep_flag(creep: Creep){
    //     if (!creep.memory.flag) {
    //         //if not set, initialize the creep's flag based on it's room of birth.
    //         creep.memory.flag = creep.room.name + '_runner';
    //         return <Flag>Game.flags[creep.memory.flag];
    //     }else{
    //         return <Flag>Game.flags[creep.memory.flag];
    //     }
    // }

    static creep_is_obsolete(creep:Creep, room:Room){
        if (this.creep_tiers) {
            //If it's not the highest tier creep and the room budget supports a higher tier:
            return this.creep_tiers[0].cost > creep.memory.cost && room.energyCapacityAvailable > creep.memory.cost;
        }
    }

    static get_heighest_tier(room:Room){
        let budget = room.energyCapacityAvailable;
        for (let t in this.creep_tiers) {
            let tier = this.creep_tiers[t];
            // console.log(tier, tier.cost, room.energyCapacityAvailable);
            if (tier.cost < budget){
                return tier;
            }
        }
    }

    static produce_new(room:Room){
        if (this.creep_tiers) {
            return this.get_heighest_tier(room);
        }
        // else if (this.create){
        //     let body = this.create(room.energyCapacityAvailable);
        //     return {
        //         'cost': _.reduce(body, (a,b) => { return a+BODYPART_COST[b] }, 0),
        //         'body': body,
        //     }
        // }
    }

    retarget() {
        //needs to be extended
        this.creep.memory.target_id = null;
        this.creep.memory.action_name = null;
    }

    try_targeting(type: string) {
        let target_obj = this.find_target(this.creep, type);
        if (target_obj.target) {
            this.creep.memory.target_id = target_obj.target.id;
            this.creep.memory.target_path = Room.serializePath(target_obj.path);
            this.creep.memory.action_name = type;
            return true;
        }
        // if (type == "transferring")
        //     console.log(!!target_obj.target)
        return false;
    }

    work(is_retry) {
        // let target = Game.getObjectById(this.creep.memory.target_id),
        //     action_name = this.creep.memory.action_name,
        //     action_function = this[action_name];

        this.target = Game.getObjectById(this.creep.memory.target_id);
        this.action_name = this.creep.memory.action_name;
        let action_function = this[this.action_name];

        // if (is_retry) {
        //     console.log(action_name, target);
        // }

        if (this.action_name) this.creep.say(this.action_name);
        else this.creep.say(this.creep.memory.role + ' idle');

        if (this.action_name !== "renewing" && !this.creep.room.memory.under_attack && !this.creep.memory.obsolete && this.creep.ticksToLive < Globals.MIN_TICKS_TO_LIVE) {
            this.try_targeting('renewing');
        } else if (!this.target || !action_function) {
            this.retarget();
        }

        //if we're under attack, don't sit there renewing yourself:
        if (this.action_name === "renewing" && (this.creep.room.memory.under_attack || this.creep.memory.obsolete)){
            this.retarget();
        }

        // console.log(this.action_name, target, action_function);
        if (this.target && action_function) {
            let applied = action_function.apply(this, []);
            // console.log(applied, is_retry);
            if (!applied && is_retry !== true) {
                //if not, try again. but only once.
                this.retarget();
                // console.log(this.retarget);
                this.work(true);
            }
        }
    }

    getDirectionFrom(from, to) {
        var x = from.x
        var y = from.y
        // Node is to the left
        if (to.x < x) {
            // Node is to the top
            if (to.y < y) return 8;

            // Node is on the same level
            if (to.y == y) return 7;

            // Node is to the bottom
            if (to.y > y) return 6;
        }

        if (to.x == x) {
            // Node is to the top
            if (to.y < y) return 1;

            // Node is to the bottom
            if (to.y > y) return 5;
        }

        // Node is to the right
        if (to.x > x) {
            // Node is to the top
            if (to.y < y) return 2;

            // Node is on the same level
            if (to.y == y) return 3;

            // Node is to the bottom
            if (to.y > y) return 4;
        }
    }

    getClosestByPath(targets, range?) {
        let target;
        let target_path = [];
        range = range == undefined ? 1 : range;

        let goals = _.map(targets, function(obj) {
            // We can't actually walk on sources-- set `range` to 1 so we path next to it.
            return { pos: obj.pos, range: range };
        });
        let results = PathFinder.search(this.creep.pos, goals);
        // console.log(goals[0].pos, Object.keys(path), path.path, path.ops);

        if (results.path) {
            let parent = this.creep.pos;
            for (let step of results.path) {
                let dx = step.x - parent.x;
                let dy = step.y - parent.y;
                let direction = this.getDirectionFrom(parent, step)
                target_path.push({
                    'x': step.x,
                    'y': step.y,
                    'dx': dx,
                    'dy': dy,
                    'direction': direction
                })
                parent = step;
            }
            for (let i in targets) {
                // console.log(parent.x, parent.y, targets[i].pos.x, targets[i].pos.y)
                // console.log(i, targets[i], targets[i].pos.x, targets[i].pos.y)
                if (Math.abs(parent.x - targets[i].pos.x) <= range && Math.abs(parent.y - targets[i].pos.y) <= range) {
                    target = targets[i];
                    break;
                }
            }
        }

        return {
            target: target,
            path: target_path
        };
    }
    
    find_target(creep:Creep, type: string) {
        let ret;
        let targets = [];
        switch (type) {
            //Energy spending:
            case 'transferring':
                targets = creep.room.find(FIND_MY_STRUCTURES, {
                    filter: function(obj) {
                        return (
                            (
                                obj.structureType == STRUCTURE_SPAWN ||
                                obj.structureType == STRUCTURE_EXTENSION
                            )
                            && obj.energy < obj.energyCapacity
                        );
                    }
                });
                if (!targets.length) {
                    targets = creep.room.find(FIND_MY_STRUCTURES, {
                        filter: function(obj) {
                            return (
                                (
                                    obj.structureType == STRUCTURE_TOWER ||
                                    obj.structureType == STRUCTURE_LAB
                                )
                                && obj.energy < obj.energyCapacity
                            );
                        }
                    });
                }
                // console.log('transferring targets:', targets);
                break;
            case 'storing':
                targets = creep.room.find<Structure>(FIND_MY_STRUCTURES, {
                    filter: function(obj) {
                        return (
                            obj.structureType == STRUCTURE_STORAGE && obj.store.energy < obj.storeCapacity
                        );
                    }
                });
                break;
            case 'building':
                targets = creep.room.find(FIND_CONSTRUCTION_SITES/*, {
                    filter: (obj:ConstructionSite) => { 
                        return obj.structureType == STRUCTURE_RAMPART;
                    }
                }*/);
                
                break;
            case 'upgrading':
                if (creep.room.controller && (creep.room.controller.progress != creep.room.controller.progressTotal || creep.room.controller.ticksToDowngrade < 30000)){
                    targets = [creep.room.controller];
                }
                break;
            //Energy gaining:
            case 'picking':
                // let total_carrying = _.sum(this.creep.carry),
                //     free_space = this.creep.carryCapacity - total_carrying;

                targets = creep.room.find(FIND_DROPPED_RESOURCES, {
                    filter: (obj) => {
                        return true;// return obj.amount <= free_space;
                    }
                });
                // console.log(this.target);
                
                break;
            case 'harvesting':
            case 'extracting':
                targets = creep.room.find(FIND_SOURCES, {
                    // filter: { owner: { username: 'Invader' } }
                    filter: function(obj:Source) {
                        return obj.energy > 0 && obj.room.controller.owner && obj.room.controller.owner.username == Globals.USERNAME;
                    }
                });
                
                break;
            case 'claiming':
                if (this.creep.getActiveBodyparts(CLAIM) > 0) {
                    targets = this.creep.room.find<Structure>(FIND_STRUCTURES, {
                        filter: function(obj) {
                            return obj.structureType == STRUCTURE_CONTROLLER && (!obj.owner || obj.owner.username != Globals.USERNAME)
                        }
                    });
                    
                }
                break;
            case 'energizing':
                targets = creep.room.find(FIND_MY_STRUCTURES, {
                    filter: function(obj) {
                        return (
                            obj.structureType == STRUCTURE_STORAGE
                            && obj.store.energy > 0
                        );
                    }
                });
                
                break;
            case 'tenergizing':
                targets = creep.room.find(FIND_MY_STRUCTURES, {
                    filter: function(obj:Storage) {
                        return (
                            obj.structureType == STRUCTURE_STORAGE
                            && obj.store.energy > obj.storeCapacity * 0.25
                        );
                    }
                });
                
                break;
            case 'renewing':
                targets = this.creep.room.find<Structure>(FIND_MY_STRUCTURES, {
                    filter: function(obj) {
                        return (
                            obj.structureType == STRUCTURE_SPAWN
                        );
                    }
                });
                if (targets.length) { 
                    console.log('Renewing ' + this.creep.memory.role + ' creep ' + this.creep.name);
                }                
                break;
            case 'fighting':
                // if (this.creep.room.memory.)
                targets = creep.room.find(FIND_HOSTILE_CREEPS);
                break;
            case 'kiting':
                let priority = Game.getObjectById('56ff84af595eb14a422bc4d8');
                if (!targets) {
                    targets = creep.room.find(FIND_HOSTILE_CREEPS);
                } else {
                    targets = [priority];
                }
                
                break;
            // case 'sieging':
            //     targets = creep.room.find(FIND_HOSTILE_SPAWNS, {
                
            //     });
            //     if (!targets) {
            //         targets = creep.room.find(FIND_HOSTILE_STRUCTURES, {
            //             filter: function(obj) {
            //                 return obj.structureType == STRUCTURE_TOWER && obj.structureType != STRUCTURE_CONTROLLER;
            //             }
            //         });
            //     }
            //     if (!targets) {
            //         targets = creep.room.find(FIND_HOSTILE_STRUCTURES, {
            //             filter: function(obj) {
            //                 return obj.structureType != STRUCTURE_RAMPART && obj.structureType != STRUCTURE_CONTROLLER;
            //             }
            //         });
            //     }
                
            //     break;
            case 'assaulting':
                // target = Game.getObjectById('56ff84af595eb14a422bc4d8');
                if (!targets) {
                    targets = creep.room.find(FIND_HOSTILE_CREEPS, {
                        filter: function(obj) {
                            let structure = <Structure>obj.pos.lookFor('structure');
                            return !(structure && structure.structureType == STRUCTURE_RAMPART);
                        }
                    });
                }
                // if (!targets) {
                //     targets = creep.room.find(FIND_HOSTILE_SPAWNS, {

                //     });
                // }
                // if (!targets) {
                //     targets = creep.room.find(FIND_HOSTILE_STRUCTURES, {
                //         filter: function(obj) {
                //             return obj.structureType == STRUCTURE_TOWER && obj.structureType != STRUCTURE_CONTROLLER;
                //         }
                //     });
                // }
                // if (!targets) {
                //     targets = creep.room.find(FIND_HOSTILE_STRUCTURES, {
                //         filter: function(obj) {
                //             return obj.structureType != STRUCTURE_RAMPART && obj.structureType != STRUCTURE_CONTROLLER;
                //         }
                //     });
                // }
                // if (!targets) {
                //     targets = creep.room.find(FIND_HOSTILE_STRUCTURES, {
                //         filter: function(obj) {
                //             return obj.structureType != STRUCTURE_CONTROLLER;
                //         }
                //     });
                // }
                break;
            case 'resting':
                if (!this.creep.memory.target_id && Game.flags[this.creep.room.name+'_resting']) {
                    targets = [Game.flags[this.creep.room.name + '_resting']];
                }
                break;
        }
        return this.getClosestByPath(targets);
    }


    harvesting() {
        let total_carrying = _.sum(this.creep.carry);
        if (total_carrying == this.creep.carryCapacity) {
            // this.creep.say('Harvested');
            // this.retarget();
            return false;
        } else {
            return this.extracting();
        }
    }

    //drops the resources on the floor for lesser creeps to pick up...
    extracting() {
        let action = this.creep.harvest(this.target);
        if (action == ERR_NOT_IN_RANGE) {
            this.move();
        } else if (action == ERR_BUSY) {//The creep is still being spawned.
            //just wait
        } else if (action == ERR_NOT_ENOUGH_RESOURCES) {
            // console.log('Depleted an energy source.');
            // this.retarget();
            return false;
        } else if (action != 0) {
            console.log('harvesting error:', action, this.creep.name);
            // this.retarget();
            // return false;
        }
        return true;
    }

    claiming() {
        if ((<Controller>this.target).owner && (<Controller>this.target).owner.username == Globals.USERNAME) {
            return false;
        } else {
            let action = this.creep.claimController(this.target);
            // console.log('claiming', action);
            if (action == ERR_NOT_IN_RANGE) {
                this.move();
            } else if (action != 0) {
                console.log('claiming error:', action);
                // this.retarget();
                return false;
            }
            return true;
        }
    }

    //This works for energy and minerals
    storing() {
        let total_carrying = _.sum(this.creep.carry);
        if (total_carrying == 0) {
            this.creep.say('Stored');
            // this.retarget();
            return false;
        } else {
            let transferring, transfer_type;
            let empty_space = (<Storage>this.target).storeCapacity - _.sum((<Storage>this.target).store);
            for (let t in this.creep.carry) {
                let amount = this.creep.carry[t];
                if (amount > 0) {
                    amount = Math.min(empty_space, amount);
                    if (amount > 0) {
                        transferring = amount;
                        transfer_type = t;
                        break;
                    }
                }
            }
            if (transferring > 0) {
                let action = this.creep.transfer(this.target, transfer_type, transferring);
                // if (transfer_type != RESOURCE_ENERGY)
                //     console.log(this.creep.name + ' transferring ' + transferring + ' ' + transfer_type + ' to ' + this.target);
                if (action == ERR_NOT_IN_RANGE) {
                    this.move();
                } else if (action != 0) {
                    console.log('storing error:', action);
                    // this.retarget();
                    // return false;
                }
            } else {
                // this.retarget();
                return false;
            }
            return true;
        }
    }

    //This only transfers energy, not minerals
    transferring() {
        if (this.creep.carry.energy == 0) {
            this.creep.say('Transfered');
            // this.retarget();
            return false;
        } else {
            let transferring;
            if ((<Storage>this.target).store) {
                transferring = Math.min((<Storage>this.target).storeCapacity - (<Storage>this.target).store.energy, this.creep.carry.energy);
            } else {
                transferring = Math.min(this.target.energyCapacity - this.target.energy, this.creep.carry.energy);
            }
            if (transferring > 0) {
                let action = this.creep.transfer(this.target, RESOURCE_ENERGY, transferring);
                if (action == ERR_NOT_IN_RANGE) {
                    this.move();
                } else if (action != 0) {
                    console.log('transferring error:', action);
                    // this.retarget();
                    // return false;
                }
            } else {
                // this.retarget();
                return false;
            }
            return true;
        }
    }

    energizing() {//only works on storage tanks
        if (this.creep.carry.energy == this.creep.carryCapacity || this.target.energy == 0) {//end condition:
            this.creep.say('Energized');
            // this.retarget();
            return false;
        } else {
            if (this.target.energy > 0 || (this.target.store && this.target.store.energy > 0)) { //Storage uses .store, others don't
                let action = this.target.transferEnergy(this.creep);
                // if (target.energy <= 5){
                //     this.retarget(this);
                // }
                if (action == ERR_NOT_IN_RANGE) {
                    this.move();
                } else if (action != 0) {
                    console.log('energizing error:', action);
                    // this.retarget();
                    // return false;
                }
            } else {
                // this.retarget();
                return false;
            }
            return true;
        }
    }

    tenergizing() {//only works on storage tanks
        this.energizing();
    }

    building() {
        if (this.creep.carry.energy == 0) {//end condition:
            this.creep.say('Built');
            // this.retarget();
            return false;
        } else {
            let action = this.creep.build(this.target);
            if (action == ERR_NOT_IN_RANGE) {
                this.move();
            } else if (action == ERR_BUSY) {//The creep is still being spawned.
                //just wait
                // }else if (action == ERR_INVALID_TARGET){
            } else if (action != 0) {
                console.log('building error:', action);
                // this.retarget();
                // return false;
            }
            return true;
        }
    }

    upgrading() {
        // console.log(this.creep)
        if (this.creep.carry.energy == 0) {//end condition:
            this.creep.say('Built');
            // this.retarget();
            return false;
        } else {
            let action = this.creep.upgradeController(this.target);
            if (action == ERR_NOT_IN_RANGE) {
                this.move();
            } else if (action == ERR_BUSY) {//The creep is still being spawned.
                //just wait
                // }else if (action == ERR_INVALID_TARGET){
            } else if (action != 0) {
                console.log('upgrading error:', action);
                // this.retarget();
                // return false;
            }
            return true;
        }
    }

    picking() {
        let action = this.creep.pickup(this.target);
        if (action == ERR_NOT_IN_RANGE) {
            this.move();
        } else if (action == ERR_BUSY) {//The creep is still being spawned.
            //just wait
        } else if (action == ERR_INVALID_TARGET) {
            // this.retarget();
            return false;
        } else if (action == ERR_FULL) {
            return false;
        } else if (action != 0) {
            console.log('picking error:', action);
            // this.retarget();
            // return false;
        }
        return true;
    }

    fighting() {
        let action;
        if (this.creep.getActiveBodyparts(ATTACK) > 0) {
          action = this.creep.attack(this.target);
        } else {
            action = this.creep.rangedAttack(this.target);
        }
        if (action == ERR_NOT_IN_RANGE) {
            this.move();
        } else if (action == ERR_BUSY) {//The creep is still being spawned.
            //just wait
        } else if (action == ERR_INVALID_TARGET) {
            // this.retarget();
            return false;
        } else if (action != 0) {
            console.log('fighting error:', action);
            // this.retarget();
            // return false;
        }
        return true;
    }
    
    assaulting() {
        this.fighting();
    }

    kiting() {
        let action = this.creep.rangedAttack(this.target);
        if (action == ERR_NOT_IN_RANGE) {
            this.move();
        } else if (action == ERR_BUSY) {//The creep is still being spawned.
            //just wait
        } else if (action == ERR_INVALID_TARGET) {
            // this.retarget();
            return false;
        } else if (action != 0) {
            console.log('fighting error:', action);
            // this.retarget();
            // return false;
        }
        return true;
    }

    sieging() {
        this.kiting();
        return false;
    }

    renewing() {
        if (this.creep.ticksToLive < 1400) {
            if (this.creep.carry.energy > 0) {
                let action = this.creep.transfer(this.target, RESOURCE_ENERGY);
                if (action != 0) {
                    this.move();
                }
            }else{
                this.move();
            }
            // let action = target.renewCreep(this.creep);
            // if (action == ERR_NOT_IN_RANGE) {
            //     this.move();
            // } else if (action == ERR_BUSY) {//The spawn is busy
            //     //just wait
            // } else if (action != 0) {
            //     console.log('renewing error:', action);
                // this.retarget();
            // return false;
            // }
            return true;
        } else {
            // this.retarget();
            return false;
        }
    }

    resting() {
        return this.moving();
    }

    // experimental_move() {
    //     let ret = PathFinder.search(
    //         this.creep.pos,
    //         { pos: this.target, range: 1 },
    //         {
    //             // We need to set the defaults costs higher so that we
    //             // can set the road cost lower in `roomCallback`
    //             plainCost: 2,
    //             swampCost: 10,

    //             roomCallback: function(roomName) {
    //                 let room = Game.rooms[roomName];
    //                 // In this example `room` will always exist, but since PathFinder 
    //                 // supports searches which span multiple rooms you should be careful!
    //                 if (!room) return;
    //                 let costs = new PathFinder.CostMatrix;
    //                 room.find(FIND_STRUCTURES).forEach(function(structure) {
    //                     if (structure.structureType === STRUCTURE_ROAD) {
    //                         // Favor roads over plain tiles
    //                         costs.set(structure.pos.x, structure.pos.y, 1);
    //                     } else if (structure.structureType !== STRUCTURE_RAMPART ||
    //                         !structure.my) {
    //                         // Can't walk through buildings, except for our own ramparts
    //                         costs.set(structure.pos.x, structure.pos.y, 0xff);
    //                     }
    //                 });
    //                 // Avoid creeps in the room
    //                 room.find(FIND_CREEPS).forEach(function(creep) {
    //                     costs.set(creep.pos.x, creep.pos.y, 0xff);
    //                 });
    //                 return costs;
    //             },
    //         }
    //     );
    //     let pos = ret.path[0];
    //     return this.creep.move(this.creep.pos.getDirectionTo(pos));
    // }

    moving() {
        // console.log(this.creep);
        // let action = this.experimental_move(this.target);
        // var path = this.creep.pos.findPathTo(this.target);
        // console.log(Object.keys(path[0]));
        // console.log(path[0].x, path[0].y, path[0].dx, path[0].dy, path[0].direction);
        let action = this.move();
        if (action == ERR_TIRED) {
            this.creep.say('tired');
        } else if(action == ERR_BUSY) {
            //just wait
        } else if (action == ERR_NO_PATH) {
            console.log(this.creep.name, "unable to find a path to", this.target);
            // this.creep.move(this.creep.pos.getDirectionTo(this.target));
            // action = this.experimental_move(this.target);
            // if (action == ERR_TIRED) {
            //     this.creep.say('tired');
            // } else if (action == ERR_BUSY) {
            //     //just wait
            // } else if (action == ERR_NO_PATH) {
            //     console.log(this.creep.name, "unable to find a path to", target);
            // }else if (action != 0) {
            //     console.log('Error moving:', action);
            // }
        }else if (action != 0) {
            console.log('Error moving:', action);
        }
        // console.log(this.creep.name, 'moving', action);
        // this.retarget();
        return false;
    }

    move() {
        // if (this.creep.memory.target_path){
        //     let path = Room.deserializePath(this.creep.memory.target_path);
        //     console.log(this.creep.memory.target_path, Object.keys(path[0]), path[0].x);
        // }
        if (false && this.target.id == this.creep.memory.target_id && this.creep.memory.target_path) {
            let path = Room.deserializePath(this.creep.memory.target_path);
            let test = this.creep.moveByPath(path);
            if (test == ERR_NOT_FOUND) {
                // console.log('ERR_NOT_FOUND', Object.keys(path[0]), path[0].x, path[0].y);
                // var ezpath = this.creep.pos.findPathTo(this.target);
                // // if (ezpath.length) {
                // //     console.log('ERR_NOT_FOUND2', Object.keys(ezpath[0]), ezpath[0].x, ezpath[0].y);
                // // } else { 
                // //     console.log('no path found');
                // // }
                // test = this.creep.moveByPath(ezpath);
                // console.log('ezpath', test);
                return this.creep.moveTo(this.target);
            }else if (test == 0) {
                // console.log('excellent');
            }
            return test;
        } else {
            return this.creep.moveTo(this.target);
        }
    }


}