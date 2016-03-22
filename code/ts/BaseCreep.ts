/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
var Globals = require('Globals');

declare var module: any;
(module).exports = class BaseCreep { //Abstract class
    public creep: Creep;

    constructor(creep: Creep) {
        this.creep = creep;
    }

    retarget() {
        //needs to be extended
    }

    try_targeting(type: string) {
        var target = this.find_target(this.creep, type);
        if (target) {
            this.creep.memory.target_id = target.id;
            this.creep.memory.action_name = type;
        }
        return !!target;
    }
    
    find_target(creep:Creep, type: string) {
        var target;
        switch (type) {
            //Energy spending:
            case 'transferring':
                target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: function(obj) {
                        return (
                            (
                                obj.structureType == STRUCTURE_SPAWN ||
                                obj.structureType == STRUCTURE_EXTENSION ||
                                obj.structureType == STRUCTURE_TOWER
                            )
                            && obj.energy < obj.energyCapacity
                        );
                    }
                });
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
                if (creep.room.controller) {
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
            case 'renewing':
                // console.log('max creep cost:' + creep.room.memory.highest_creep_cost);
                // if (creep.ticksToLive < Globals.MIN_TICKS_TO_LIVE){
                //     console.log(creep.memory.cost, creep.room.memory.highest_creep_cost-50);
                // }
                if (
                    creep.ticksToLive < Globals.MIN_TICKS_TO_LIVE &&
                    creep.memory.cost &&
                    creep.room.memory.highest_creep_cost &&
                    creep.memory.cost >= creep.room.memory.highest_creep_cost - 50
                ) {
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
        if (this.creep.carry.energy == this.creep.carryCapacity || target.energy == 0) {
            this.creep.say('Harvested');
            this.retarget();
        } else {
            var action = this.creep.harvest(target);
            if (action == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(target);
            } else if (action == ERR_BUSY) {//The creep is still being spawned.
                //just wait
            } else if (action == ERR_NOT_ENOUGH_RESOURCES) {//The creep is still being spawned.
                // console.log('Depleted an energy source.');
                this.retarget();
            } else if (action != 0) {
                console.log('harvesting error:', action);
                this.retarget();
            }
        }
    }

    storing(target) {
        if (this.creep.carry.energy == 0) {
            this.creep.say('Stored');
            this.retarget();
        } else {
            var transferring = Math.min(target.storeCapacity - target.store.energy, this.creep.carry.energy);
            if (transferring > 0) {
                var action = this.creep.transfer(target, RESOURCE_ENERGY, transferring);
                if (action == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(target);
                } else if (action != 0) {
                    console.log('storing error:', action);
                    this.retarget();
                }
            } else {
                this.retarget();
            }
        }
    }

    transferring(target) {
        if (this.creep.carry.energy == 0) {
            this.creep.say('Transfered');
            this.retarget();
        } else {
            var transferring = Math.min(target.energyCapacity - target.energy, this.creep.carry.energy);
            if (transferring > 0) {
                var action = this.creep.transfer(target, RESOURCE_ENERGY, transferring);
                if (action == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(target);
                } else if (action != 0) {
                    console.log('transferring error:', action);
                    this.retarget();
                }
            } else {
                this.retarget();
            }
        }
    }

    energizing(target) {//only works on storage tanks
        if (this.creep.carry.energy == this.creep.carryCapacity || target.energy == 0) {//end condition:
            this.creep.say('Energized');
            this.retarget();
        } else {
            if (target.store.energy > 0) {
                var action = target.transfer(this.creep, RESOURCE_ENERGY);
                // if (target.energy <= 5){
                //     this.retarget(this);
                // }
                if (action == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(target);
                } else if (action != 0) {
                    console.log('energizing error:', action);
                    this.retarget();
                }
            } else {
                this.retarget();
            }
        }
    }

    building(target) {
        if (this.creep.carry.energy == 0) {//end condition:
            this.creep.say('Built');
            this.retarget();
        } else {
            var action = this.creep.build(target);
            if (action == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(target);
            } else if (action == ERR_BUSY) {//The creep is still being spawned.
                //just wait
                // }else if (action == ERR_INVALID_TARGET){
            } else if (action != 0) {
                console.log('building error:', action);
                this.retarget();
            }
        }
    }

    upgrading(target) {
        if (this.creep.carry.energy == 0) {//end condition:
            this.creep.say('Built');
            this.retarget();
        } else {
            var action = this.creep.upgradeController(target);
            if (action == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(target);
            } else if (action == ERR_BUSY) {//The creep is still being spawned.
                //just wait
                // }else if (action == ERR_INVALID_TARGET){
            } else if (action != 0) {
                console.log('upgrading error:', action);
                this.retarget();
            }
        }
    }

    picking(target) {
        var action = this.creep.pickup(target);
        if (action == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target);
        } else if (action == ERR_BUSY) {//The creep is still being spawned.
            //just wait
        } else if (action == ERR_INVALID_TARGET) {
            this.retarget();
        } else if (action != 0) {
            console.log('picking error:', action);
            this.retarget();
        }
    }

    fighting(target) {
        var action = this.creep.attack(target);
        if (action == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target);
        } else if (action == ERR_BUSY) {//The creep is still being spawned.
            //just wait
        } else if (action == ERR_INVALID_TARGET) {
            this.retarget();
        } else if (action != 0) {
            console.log('fighting error:', action);
            this.retarget();
        }
    }

    renewing(target) {
        // if (target.)
        // this.creep.room.memory.highest_creep_cost
        // console.log(this.creep.room.memory.highest_creep_cost);
        // console.log('Renewing creep');
        if (
            this.creep.memory.cost &&
            this.creep.room.memory.highest_creep_cost &&
            this.creep.memory.cost > this.creep.room.memory.highest_creep_cost - 50
        ) {
            if (this.creep.ticksToLive < 1000) {
                var action = target.renewCreep(this.creep);
                if (action == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(target);
                } else if (action == ERR_BUSY) {//The spawn is busy
                    //just wait
                } else if (action != 0) {
                    console.log('renewing error:', action);
                    this.retarget();
                }
            } else {
                this.retarget();
            }
        } else {
            this.creep.moveTo(target);
        }
    }

    moving(target) {
        this.creep.moveTo(target);
        this.retarget();
    }
}