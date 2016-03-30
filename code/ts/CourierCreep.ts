/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
/// <reference path="BaseCreep.ts" />
"use strict";
var _ = require('lodash'),
    Globals = require('Globals'), 
    BaseCreep = require('BaseCreep');

declare var module: any;
(module).exports = class CourierCreep extends BaseCreep {
    public creep: Creep;

    constructor(creep: Creep) {
        super(creep);
        // let lab = <Lab>Game.getObjectById('56f0d30a0bf3b09b7db115b5');
        // lab.mineralCapacity
    }

    retarget() {
        super.retarget();
        if (_.sum(this.creep.carry) > this.creep.carryCapacity/2) {
            if (this.creep.carry.energy > 0) {
                if (!super.try_targeting('transferring')) {

                }
            } else { //if it's not energy, it needs to be put into storage.
                if (!super.try_targeting('storing')) {

                }
            }
        } else {
            if (!super.try_targeting('picking')) { //picking isn't smart enough, it makes the screeps behave stupidly. chasing everything down... 
            //todo: Can make a routine that looks for nearest CARRY creep nearby the dropped resource and retarget it to pick it up
                if (!super.try_targeting('energizing')) {

                }
            }
        }
        super.try_targeting('resting');//get the little shits out of the way
    }

    // work() {
    //     // console.log(this.creep);
    //     this.retarget_count = 0;
    //     var target = Game.getObjectById(this.creep.memory.target_id),
    //         action_name = this.creep.memory.action_name,
    //         action_function = this[action_name];

    //     // this.retarget();
    //     this.creep.say(action_name);
    //     // console.log(action_name, target);

    //     // if (auto_retarget) console.log('unstucking');
    //     // if (this.creep.ticksToLive < Globals.MIN_TICKS_TO_LIVE && action_name != 'renewing') {
    //     //     this.retarget();
    //     // } else 
    //     if (!target || !action_function) {
    //         this.retarget();
    //     }

    //     if (target && action_function) {
    //         // action_function(target);
    //         action_function.apply(this, [target]);
    //     }
    // }

    static create(budget:number) {
        if (budget >= 50*10 + 50*3)
            return [
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                MOVE, MOVE, MOVE,
            ];
        else
            return [
                CARRY, CARRY, CARRY, CARRY,
                MOVE, MOVE, 
            ];
    }

}