/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
/// <reference path="BaseCreep.ts" />
"use strict";
var _ = require('lodash'),
    Globals = require('Globals'),
    BaseCreep = require('BaseCreep');

declare var module: any;
(module).exports = class MinerCreep extends BaseCreep {
    public creep: Creep;

    constructor(creep: Creep) {
        super(creep);
    }

    retarget() {
        super.retarget();
        if (_.sum(this.creep.carry) > 0) {
            if (!super.try_targeting('storing')) {

            }
        } else {
            var target = <Mineral>this.creep.pos.findClosestByPath(FIND_MINERALS);
            if (target){
                this.creep.memory.target_id = target.id;
                this.creep.memory.action_name = 'harvesting';
            }
        }
    }

    // work() {
    //     var target = Game.getObjectById(this.creep.memory.target_id),
    //         action_name = this.creep.memory.action_name,
    //         action_function = this[action_name];

    //     this.creep.say(action_name);
    //     if (action_name !== "renewing" && this.creep.ticksToLive < Globals.MIN_TICKS_TO_LIVE) {
    //         target = <Spawn>this.creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
    //             filter: function(obj) {
    //                 return (
    //                     obj.structureType == STRUCTURE_SPAWN
    //                 );
    //             }
    //         });
    //         if (target) {
    //             action_function = this['renewing'];
    //             this.creep.memory.target_id = (<Spawn>target).id;
    //             this.creep.memory.action_name = 'renewing';
    //             console.log('Renewing ' + this.creep.memory.role + ' creep ' + this.creep.name);
    //         } else {
    //             console.log('cannot renew. spawn is busy...');
    //         }
    //     }else if (!target || !action_function) {
    //         this.retarget();
    //     }

    //     if (target && action_function) {
    //         action_function.apply(this, [target]);
    //     }
    // }

    // work() {
    //     if (this.creep.carry.energy == this.creep.carryCapacity) {
    //         super.transferring(this.link);
    //     }
    //     super.harvesting(this.mineral);
    // }

    static create(budget: number) {
        if (budget >= 50*5 + 100*5 + 50*10)
            return [
                MOVE, MOVE, MOVE, MOVE, MOVE,
                WORK, WORK, WORK, WORK, WORK,
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, 
            ];
        else
            return [MOVE, WORK, CARRY, CARRY, CARRY];
    }

}