/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
/// <reference path="Globals.ts" />
"use strict";

class BaseCreep { //Abstract class
    public creep: Creep;

    constructor(creep: Creep) {
        this.creep = creep;
    }

    retarget() {
        //needs to be extended
        this.creep.memory.target_id = null;
        this.creep.memory.action_name = null;
    }

    try_targeting(type: string) {
        let target = this.find_target(this.creep, type);
        if (target) {
            this.creep.memory.target_id = target.id;
            this.creep.memory.action_name = type;
        }
        return !!target;
    }

    work(is_retry) {
        let target = Game.getObjectById(this.creep.memory.target_id),
            action_name = this.creep.memory.action_name,
            action_function = this[action_name];

        // if (is_retry) {
        //     console.log(action_name, target);
        // }

        if (action_name) this.creep.say(action_name);
        else this.creep.say(this.creep.memory.role + ' idle');

        if (action_name !== "renewing" && !this.creep.room.memory.under_attack && !this.creep.memory.obsolete && this.creep.ticksToLive < Globals.MIN_TICKS_TO_LIVE) {
            target = this.creep.pos.findClosestByPath<Structure>(FIND_MY_STRUCTURES, {
                filter: function(obj) {
                    return (
                        obj.structureType == STRUCTURE_SPAWN
                    );
                }
            });
            if (target) {
                action_function = this['renewing'];
                this.creep.memory.target_id = (<Structure>target).id;
                this.creep.memory.action_name = 'renewing';
                console.log('Renewing ' + this.creep.memory.role + ' creep ' + this.creep.name);
            } else {
                // console.log('cannot renew. spawn is busy...');
            }
        } else if (!target || !action_function) {
            this.retarget();
        }

        //if we're under attack, don't sit there renewing yourself:
        if (action_name === "renewing" && (this.creep.room.memory.under_attack || this.creep.memory.obsolete)){
            this.retarget();
        }

        // console.log(action_name, target, action_function);
        if (target && action_function) {
            let applied = action_function.apply(this, [target]);
            // console.log(applied, is_retry);
            if (!applied && is_retry !== true) {
                //if not, try again. but only once.
                this.retarget();
                // console.log(this.retarget);
                this.work(true);
            }
        }
    }
    
    find_target(creep:Creep, type: string) {
        let target;
        switch (type) {
            //Energy spending:
            case 'transferring':
                target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
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
                if (!target) {
                    target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
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
                break;
            case 'storing':
                target = creep.pos.findClosestByPath<Structure>(FIND_MY_STRUCTURES, {
                    filter: function(obj) {
                        return (
                            obj.structureType == STRUCTURE_STORAGE && obj.store.energy < obj.storeCapacity
                        );
                    }
                });
                break;
            case 'building':
                target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
                    // filter: (obj:ConstructionSite) => { 
                    //     return obj.structureType == STRUCTURE_RAMPART;
                    // }
                });
                break;
            case 'upgrading':
                if (creep.room.controller && creep.room.controller.progress != creep.room.controller.progressTotal) {
                    target = creep.room.controller;
                }
                break;

            //Energy gaining:
            case 'picking':
                // let total_carrying = _.sum(this.creep.carry),
                //     free_space = this.creep.carryCapacity - total_carrying;

                target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                    filter: (obj) => {
                        return true;// return obj.amount <= free_space;
                    }
                });
                // console.log(target);
                break;
            case 'harvesting':
            case 'extracting':
                target = creep.pos.findClosestByPath(FIND_SOURCES, {
                    // filter: { owner: { username: 'Invader' } }
                    filter: function(obj:Source) {
                        return obj.energy > 0 && obj.room.controller.owner && obj.room.controller.owner.username == Globals.USERNAME;
                    }
                });
                break;
            case 'claiming':
                if (this.creep.getActiveBodyparts(CLAIM) > 0) {
                    target = this.creep.pos.findClosestByPath<Structure>(FIND_STRUCTURES, {
                        filter: function(obj) {
                            return obj.structureType == STRUCTURE_CONTROLLER && (!obj.owner || obj.owner.username != Globals.USERNAME)
                        }
                    });
                }
                break;
            case 'energizing':
                target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: function(obj) {
                        return (
                            obj.structureType == STRUCTURE_STORAGE
                            && obj.store.energy > 0
                        );
                    }
                });
                break;
            case 'tenergizing':
                target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: function(obj:Storage) {
                        return (
                            obj.structureType == STRUCTURE_STORAGE
                            && obj.store.energy > obj.storeCapacity*0.25
                        );
                    }
                });
                break;
            case 'renewing':
                // console.log('max creep cost:' + creep.room.memory.highest_creep_cost);
                // if (creep.ticksToLive < Globals.MIN_TICKS_TO_LIVE){
                //     console.log(creep.memory.cost, creep.room.memory.highest_creep_cost-50);
                // }
                if (creep.ticksToLive < Globals.MIN_TICKS_TO_LIVE) {
                    target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                        filter: function(obj) {
                            return (
                                obj.structureType == STRUCTURE_SPAWN
                            );
                        }
                    });
                    console.log('Renewing ' + creep.memory.role + ' creep ' + creep.name + ' (' + creep.memory.cost + ')');
                }
                break;
            case 'fighting':
            // if (this.creep.room.memory.)
                target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {

                });
                break;
            case 'kiting':
                target = Game.getObjectById('56ff84af595eb14a422bc4d8');
                if (!target) {
                    target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {

                    });
                }
                break;
            case 'sieging':
                target = creep.pos.findClosestByPath(FIND_HOSTILE_SPAWNS, {
                
                });
                if (!target) {
                    target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                        filter: function(obj) {
                            return obj.structureType == STRUCTURE_TOWER && obj.structureType != STRUCTURE_CONTROLLER;
                        }
                    });
                }
                if (!target) {
                    target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                        filter: function(obj) {
                            return obj.structureType != STRUCTURE_RAMPART && obj.structureType != STRUCTURE_CONTROLLER;
                        }
                    });
                }
                break;
            case 'assaulting':
                // target = Game.getObjectById('56ff84af595eb14a422bc4d8');
                if (!target) {
                    target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {
                        filter: function(obj) {
                            let structure = <Structure>obj.pos.lookFor('structure');
                            return !(structure && structure.structureType == STRUCTURE_RAMPART);
                        }
                    });
                }
                // if (!target) {
                //     target = creep.pos.findClosestByPath(FIND_HOSTILE_SPAWNS, {

                //     });
                // }
                // if (!target) {
                //     target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                //         filter: function(obj) {
                //             return obj.structureType == STRUCTURE_TOWER && obj.structureType != STRUCTURE_CONTROLLER;
                //         }
                //     });
                // }
                // if (!target) {
                //     target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                //         filter: function(obj) {
                //             return obj.structureType != STRUCTURE_RAMPART && obj.structureType != STRUCTURE_CONTROLLER;
                //         }
                //     });
                // }
                // if (!target) {
                //     target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                //         filter: function(obj) {
                //             return obj.structureType != STRUCTURE_CONTROLLER;
                //         }
                //     });
                // }
                break;
            case 'resting':
                if (!this.creep.memory.target_id && Game.flags[this.creep.room.name+'_resting']) {
                    target = Game.flags[this.creep.room.name + '_resting'];
                }
                break;
        }
        return target;
    }


    harvesting(target) {
        let total_carrying = _.sum(this.creep.carry);
        if (total_carrying == this.creep.carryCapacity) {
            // this.creep.say('Harvested');
            // this.retarget();
            return false;
        } else {
            return this.extracting(target);
        }
    }

    //drops the resources on the floor for lesser creeps to pick up...
    extracting(target) {
        let action = this.creep.harvest(target);
        if (action == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target);
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

    claiming(target) {
        if ((<Controller>target).owner && (<Controller>target).owner.username == Globals.USERNAME) {
            return false;
        } else {
            let action = this.creep.claimController(target);
            // console.log('claiming', action);
            if (action == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(target);
            } else if (action != 0) {
                console.log('claiming error:', action);
                // this.retarget();
                return false;
            }
            return true;
        }
    }

    //This works for energy and minerals
    storing(target) {
        let total_carrying = _.sum(this.creep.carry);
        if (total_carrying == 0) {
            this.creep.say('Stored');
            // this.retarget();
            return false;
        } else {
            let transferring, transfer_type;
            let empty_space = (<Storage>target).storeCapacity - _.sum((<Storage>target).store);
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
                let action = this.creep.transfer(target, transfer_type, transferring);
                // if (transfer_type != RESOURCE_ENERGY)
                //     console.log(this.creep.name + ' transferring ' + transferring + ' ' + transfer_type + ' to ' + target);
                if (action == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(target);
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
    transferring(target) {
        if (this.creep.carry.energy == 0) {
            this.creep.say('Transfered');
            // this.retarget();
            return false;
        } else {
            let transferring;
            if ((<Storage>target).store) {
                transferring = Math.min((<Storage>target).storeCapacity - (<Storage>target).store.energy, this.creep.carry.energy);
            } else {
                transferring = Math.min(target.energyCapacity - target.energy, this.creep.carry.energy);
            }
            if (transferring > 0) {
                let action = this.creep.transfer(target, RESOURCE_ENERGY, transferring);
                if (action == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(target);
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

    energizing(target) {//only works on storage tanks
        if (this.creep.carry.energy == this.creep.carryCapacity || target.energy == 0) {//end condition:
            this.creep.say('Energized');
            // this.retarget();
            return false;
        } else {
            if (target.energy > 0 || (target.store && target.store.energy > 0)) { //Storage uses .store, others don't
                let action = target.transferEnergy(this.creep);
                // if (target.energy <= 5){
                //     this.retarget(this);
                // }
                if (action == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(target);
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

    tenergizing(target) {//only works on storage tanks
        this.energizing(target);
    }

    building(target) {
        if (this.creep.carry.energy == 0) {//end condition:
            this.creep.say('Built');
            // this.retarget();
            return false;
        } else {
            let action = this.creep.build(target);
            if (action == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(target);
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

    upgrading(target) {
        if (this.creep.carry.energy == 0) {//end condition:
            this.creep.say('Built');
            // this.retarget();
            return false;
        } else {
            let action = this.creep.upgradeController(target);
            if (action == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(target);
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

    picking(target) {
        let action = this.creep.pickup(target);
        if (action == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target);
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

    fighting(target) {
        let action;
        if (this.creep.getActiveBodyparts(ATTACK) > 0) {
          action = this.creep.attack(target);
        } else {
            action = this.creep.rangedAttack(target);
        }
        if (action == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target);
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
    
    assaulting(target) {
        this.fighting(target);
    }

    kiting(target) {
        let action = this.creep.rangedAttack(target);
        if (action == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target);
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

    sieging(target) {
        this.kiting(target);
        return false;
    }

    renewing(target) {
        if (this.creep.ticksToLive < 1400) {
            if (this.creep.carry.energy > 0) {
                let action = this.creep.transfer(target, RESOURCE_ENERGY);
                if (action != 0) {
                    this.creep.moveTo(target);
                }
            }else{
                this.creep.moveTo(target);
            }
            // let action = target.renewCreep(this.creep);
            // if (action == ERR_NOT_IN_RANGE) {
            //     this.creep.moveTo(target);
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

    resting(target) {
        return this.moving(target);
    }

    experimental_move(target) {
        let ret = PathFinder.search(
            this.creep.pos,
            { pos: target, range: 1 },
            {
                // We need to set the defaults costs higher so that we
                // can set the road cost lower in `roomCallback`
                plainCost: 2,
                swampCost: 10,

                roomCallback: function(roomName) {
                    let room = Game.rooms[roomName];
                    // In this example `room` will always exist, but since PathFinder 
                    // supports searches which span multiple rooms you should be careful!
                    if (!room) return;
                    let costs = new PathFinder.CostMatrix;
                    room.find(FIND_STRUCTURES).forEach(function(structure) {
                        if (structure.structureType === STRUCTURE_ROAD) {
                            // Favor roads over plain tiles
                            costs.set(structure.pos.x, structure.pos.y, 1);
                        } else if (structure.structureType !== STRUCTURE_RAMPART ||
                            !structure.my) {
                            // Can't walk through buildings, except for our own ramparts
                            costs.set(structure.pos.x, structure.pos.y, 0xff);
                        }
                    });
                    // Avoid creeps in the room
                    room.find(FIND_CREEPS).forEach(function(creep) {
                        costs.set(creep.pos.x, creep.pos.y, 0xff);
                    });
                    return costs;
                },
            }
        );
        let pos = ret.path[0];
        return this.creep.move(this.creep.pos.getDirectionTo(pos));
    }

    moving(target) {
        // console.log(this.creep);
        // let action = this.experimental_move(target);
        // var path = this.creep.pos.findPathTo(target);
        // console.log(Object.keys(path[0]));
        // console.log(path[0].x, path[0].y, path[0].dx, path[0].dy, path[0].direction);
        let action = this.creep.moveTo(target);
        if (action == ERR_TIRED) {
            this.creep.say('tired');
        } else if(action == ERR_BUSY) {
            //just wait
        } else if (action == ERR_NO_PATH) {
            console.log(this.creep.name, "unable to find a path to", target);
            // this.creep.move(this.creep.pos.getDirectionTo(target));
            // action = this.experimental_move(target);
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
}