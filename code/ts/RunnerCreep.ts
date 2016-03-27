/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
/// <reference path="BaseCreep.ts" />
"use strict";
var _ = require('lodash'),
    Globals = require('Globals'), 
    BaseCreep = require('BaseCreep');

declare var module: any;
(module).exports = class RunnerCreep extends BaseCreep {
    public creep: Creep;

    constructor(creep: Creep) {
        super(creep);
        this.creep.memory.obsolete = true;//can't repair creeps that have CLAIM
        // this.retarget();
    }

    retarget() {
        super.retarget();
        if (Game.flags['running']) {
            if (this.creep.room.name != (<Flag>Game.flags['running']).room.name) {
                this.creep.memory.target_id = Game.flags['running'].id;
                this.creep.memory.action_name = 'moving';
            } else {
                if (!super.try_targeting('claiming')) {
                    if (this.creep.carry.energy > 0) {
                        if (!super.try_targeting('building')) {
                            if (!super.try_targeting('upgrading')) {
                                console.log('Creep is unable to spend energy!?');
                            }
                        }
                    } else {
                        if (!super.try_targeting('harvesting')) {

                        }
                    }
                }
            }
        }
    }

    static create(budget:number) {
        // return [CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
        return [WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
    }

}