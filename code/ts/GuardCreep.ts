/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
/// <reference path="BaseCreep.ts" />
"use strict";
var Globals = require('Globals'),
    BaseCreep = require('BaseCreep');

declare var module: any;
(module).exports = class GuardCreep extends BaseCreep {
    public creep: Creep;
    public flag: Flag;

    constructor(creep: Creep) {
        super(creep);

        if (!this.creep.memory.flag) {
            this.creep.memory.flag = this.creep.room.name + '_guard';
            this.flag = <Flag>Game.flags[this.creep.memory.flag];
            this.flag.memory.creep = this.creep.name;
        } else {
            this.flag = <Flag>Game.flags[this.creep.memory.flag];
        }
    }

    retarget() {
        super.retarget();
        // this.flag.remove();
        if (!super.try_targeting('fighting')) {
            if (this.flag) {
                this.creep.memory.target_id = this.flag.id;
                this.creep.memory.action_name = 'moving';
            }
        }
    }

    static create(budget: number) {
        if (budget >= 10*30 + 80*5 + 50*10)
            return [
                TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
                MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            ];
        else if (budget >= 10*10 + 80*5 + 50*5)
            return [
                TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                ATTACK, ATTACK, ATTACK, ATTACK,
                MOVE, MOVE, MOVE, MOVE, MOVE,
            ];
        else if (budget >= 10*6 + 80*3 + 50*3)
            return [
                TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, //60
                ATTACK, ATTACK, ATTACK, //240
                MOVE, MOVE, MOVE, //150
            ];
        else
            return [
                TOUGH, TOUGH, TOUGH, TOUGH,
                ATTACK, ATTACK, 
                MOVE, MOVE, 
            ];
    }

}