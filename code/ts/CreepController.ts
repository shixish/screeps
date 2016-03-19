/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
var Globals = require('Globals');

declare var module: any;
(module).exports = class CreepController {
    creep: Creep;

    retarget_count: number;

    // constructor(public firstname, public middleinitial, public lastname) {
    //     this.creep.fullname = firstname + " " + middleinitial + " " + lastname;
    // }

    constructor(creep: Creep) {
        this.creep = creep;
    }

    resetBodyCounts() {
        this.creep.memory.bodyCounts = {
            move: 0,
            work: 0,
            carry: 0,
            attack: 0,
            ranged_attack: 0,
            heal: 0,
            tough: 0,
        };
        for (var b in this.creep.body) {
            // console.log(this.creep.body[b].hits, this.creep.body[b].type);
            if (this.creep.body[b].hits > 0)
                this.creep.memory.bodyCounts[this.creep.body[b].type]++;
        }
    }

    canWork() {
        if (!this.creep.memory.bodyCounts) this.resetBodyCounts();
        return this.creep.memory.bodyCounts.work || 0;
    }

    canFight() {
        if (!this.creep.memory.bodyCounts) this.resetBodyCounts();
        return this.creep.memory.bodyCounts.attack || 0;
    }

    tryTargeting(type:string) {
        var target;
        switch (type) {
            //Energy spending:
            case 'transferring':
                target = this.creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
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
                target = this.creep.pos.findClosestByPath<Structure>(FIND_MY_STRUCTURES, {
                    filter: function(obj) {
                        return (
                            obj.structureType == STRUCTURE_STORAGE && obj.store.energy < obj.storeCapacity
                        );
                    }
                });
                break;
            case 'building':
                target = this.creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
                    // filter: { owner: { username: 'Invader' } }
                });
                break;
            case 'upgrading':
                if (this.creep.room.controller) {
                    target = this.creep.room.controller;
                }
                break;

            //Energy gaining:
            case 'picking':
                target = this.creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
                break;
            case 'harvesting':
                target = this.creep.pos.findClosestByPath(FIND_SOURCES, {
                    // filter: { owner: { username: 'Invader' } }
                    filter: function(obj) {
                        return obj.energy > 0; //Sources can run out as well
                    }
                });
                break;
            case 'energizing':
                target = this.creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: function(obj) {
                        return (
                            obj.structureType == STRUCTURE_STORAGE
                            && obj.store.energy > 0
                        );
                    }
                });
                break;
            case 'renewing':
                // console.log('max creep cost:' + this.creep.room.memory.highest_creep_cost);
                // if (this.creep.ticksToLive < Globals.MIN_TICKS_TO_LIVE){
                //     console.log(this.creep.memory.cost, this.creep.room.memory.highest_creep_cost-50);
                // }
                if (
                    this.creep.ticksToLive < Globals.MIN_TICKS_TO_LIVE &&
                    this.creep.memory.cost &&
                    this.creep.room.memory.highest_creep_cost &&
                    this.creep.memory.cost >= this.creep.room.memory.highest_creep_cost - 50
                ) {
                    target = this.creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                        filter: function(obj) {
                            return (
                                obj.structureType == STRUCTURE_SPAWN
                            );
                        }
                    });
                    console.log('Renewing ' + this.creep.memory.role + ' creep ' + this.creep.name + ' (' + this.creep.memory.cost + ')');
                }
                break;
            case 'resting':
                if (Game.flags['resting']) {
                    target = Game.flags['resting'];
                }
                type = 'moving';
                break;
            case 'waiting':
                if (Game.flags['resting']) {
                    target = Game.flags['attack'];
                }
                type = 'moving';
                break;
            case 'fighting':
                target = this.creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {

                });
                break;
        }
        if (target) {
            this.creep.memory.target_id = target.id;
            this.creep.memory.action_name = type;
        }
        return !!target;
    }

    retarget() {
        this.retarget_count++;
        if (this.retarget_count > 3) {
            console.log('CRITICAL: builder retargeting loop');
            return;
        }
        // this.resetBodyCounts();
        // console.log(Object.keys(this.creep.memory.bodyCounts));
        // console.log(this.creep.memory.bodyCounts.work);

        // spawn.memory.highest_creep_cost
        if (!this.tryTargeting('renewing')) {
            if (this.canWork()) {
                // console.log('worker!');
                if (this.creep.carry.energy > 0) {
                    if (!this.tryTargeting('transferring')) {
                        if (!this.tryTargeting('building')) {
                            // if (!this.tryTargeting('storing')){
                            //     if (!this.tryTargeting('upgrading')){
                            //         console.log('Creep is unable to spend energy!?');
                            //     }
                            // }
                            var coin = Math.round(Math.random() * 2);
                            // console.log(coin);
                            if (coin) { //Can either store the energy, or go upgrade with it.
                                if (!this.tryTargeting('storing')) {
                                    if (!this.tryTargeting('upgrading')) {
                                        console.log('Creep is unable to spend energy!?');
                                    }
                                }
                            } else {
                                if (!this.tryTargeting('upgrading')) {
                                    console.log('Creep is unable to spend energy!?');
                                }
                            }
                        }
                    }
                } else {
                    if (!this.tryTargeting('picking')) {
                        if (!this.tryTargeting('harvesting')) {
                            if (!this.tryTargeting('energizing')) {
                                // console.log('Creep is unable to find an energy source!');
                                // this.tryTargeting('moving');
                                if (Game.flags['resting']) {
                                    this.creep.memory.target_id = Game.flags['resting'].id;
                                    this.creep.memory.action_name = 'moving';
                                }
                            }
                        }
                    }
                }
            } else if (this.canFight()) {
                // console.log('fighter');
                // var targets = this.creep.room.find(FIND_HOSTILE_CREEPS);
                // if(targets.length) {
                //     var target = this.creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {
                //         // filter: function(obj){
                //         //     return (
                //         //         (obj.structureType == STRUCTURE_SPAWN || obj.structureType == STRUCTURE_EXTENSION)
                //         //         && obj.energy < obj.energyCapacity
                //         //     );
                //         // }
                //     });
                //     if(target) {
                //         if(this.creep.attack(target) == ERR_NOT_IN_RANGE) {
                //             this.creep.moveTo(target);
                //         }
                //     }
                // }
                // else{
                //     if (Game.flags['attack']){
                //         this.creep.memory.target_id = Game.flags['attack'].id;
                //         this.creep.memory.action_name = 'move';
                //         this.creep.moveTo(Game.flags['attack']);
                //     }
                //     // creep.moveTo(Game.flags['attack'])
                //     // creep.moveTo(creep.room.controller);
                // }

                if (!this.tryTargeting('fighting')) {
                    // console.log('Creep is unable to find an energy source!');
                    // this.tryTargeting('moving');
                    if (Game.flags['attack']) {
                        this.creep.memory.target_id = Game.flags['attack'].id;
                        this.creep.memory.action_name = 'moving';
                    }
                }
            }
        }
        // this.work();
    }

    work() {
        this.retarget_count = 0;
        var target = Game.getObjectById(this.creep.memory.target_id),
            action_name = this.creep.memory.action_name,
            action_function = this[action_name];

        // this.retarget();
        // this.creep.say(action_name);
        // console.log(action_name, target);

        //(Game.time%200 == 0)
        var targets = this.creep.room.find(FIND_HOSTILE_CREEPS);
        var auto_retarget = Math.round(Math.random() * 100) == 0;//Periodically force a retarget to hopefully unstuck things.
        // if (auto_retarget) console.log('unstucking');
        if (targets.length) {
            this.retarget()
        } else if (this.creep.ticksToLive < Globals.MIN_TICKS_TO_LIVE && action_name != 'renewing') {
            this.retarget();
        } else if (!target || !action_function || auto_retarget) {
            this.retarget();
        }

        if (target && action_function) {
            // action_function(target);
            action_function.apply(this, [target]);
        }
    }


    //
    //Targeting actions:
    //

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
                var action = target.transferEnergy(this);
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
                var action = target.renewCreep(this);
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