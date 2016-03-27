/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
"use strict";
var _ = require('lodash'),
    Globals = require('Globals');

declare var module: any;
(module).exports = class BaseCreep { //Abstract class
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

        if (!this.creep.memory.obsolete && action_name !== "renewing" && this.creep.ticksToLive < Globals.MIN_TICKS_TO_LIVE) {
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
                    // filter: { owner: { username: 'Invader' } }
                });
                break;
            case 'upgrading':
                if (creep.room.controller && creep.room.controller.progress != creep.room.controller.progressTotal) {
                    target = creep.room.controller;
                }
                break;

            //Energy gaining:
            case 'picking':
                target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
                break;
            case 'harvesting':
                target = creep.pos.findClosestByPath(FIND_SOURCES, {
                    // filter: { owner: { username: 'Invader' } }
                    filter: function(obj) {
                        return obj.energy > 0; //Sources can run out as well
                    }
                });
                break;
            case 'claiming':
                target = this.creep.pos.findClosestByPath<Structure>(FIND_STRUCTURES, {
                    filter: function(obj) {
                        return obj.structureType == STRUCTURE_CONTROLLER && !obj.owner;
                    }
                });
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
                            && obj.store.energy > obj.storeCapacity/2
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
                target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {

                });
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
    }

    claiming(target) {
        let action = this.creep.claimController(target);
        if (action == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target);
        } else if (action != 0) {
            console.log('claiming error:', action);
            // this.retarget();
            return false;
        }
        return true;
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
        } else if (action != 0) {
            console.log('picking error:', action);
            // this.retarget();
            // return false;
        }
        return true;
    }

    fighting(target) {
        let action = this.creep.attack(target);
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

    renewing(target) {
        if (this.creep.ticksToLive < 1400) {
            this.creep.moveTo(target);
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

    moving(target) {
        let action = this.creep.moveTo(target);
        // console.log('moving', action);
        // this.retarget();
        return false;
    }
}