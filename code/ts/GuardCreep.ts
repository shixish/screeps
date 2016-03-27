/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
/// <reference path="BaseCreep.ts" />
"use strict";
var Globals = require('Globals'),
    BaseCreep = require('BaseCreep');

declare var module: any;
(module).exports = class GuardCreep extends BaseCreep {
    public creep: Creep;

    constructor(creep: Creep) {
        super(creep);
    }

    retarget() {
        super.retarget();
        // this.creep.memory.target_id = this.creep.memory.action_name = null;
        if (!super.try_targeting('fighting')) {
            if (Game.flags['attack']) {
                this.creep.memory.target_id = Game.flags['attack'].id;
                this.creep.memory.action_name = 'moving';
            }
        }
    }

    static create(budget: number) {
        if (budget >= 50*2 + 80 * 3 + 10 * 6)
            return [
                MOVE, MOVE,
                ATTACK, ATTACK, ATTACK,
                TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH
            ];
        else
            return [MOVE, MOVE, ATTACK, ATTACK, TOUGH, TOUGH, TOUGH, TOUGH];
    }

}