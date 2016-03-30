/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
/// <reference path="BaseCreep.ts" />
"use strict";
var _ = require('lodash'),
    Globals = require('Globals'), 
    BaseCreep = require('BaseCreep');

declare var module: any;
(module).exports = class RunnerCreep extends BaseCreep {
    public creep: Creep;
    public flag: Flag;

    constructor(creep: Creep) {
        super(creep);
        // this.retarget();

        // console.log(this.creep, "exists already");
        if (!this.creep.memory.flag) {
            this.creep.memory.flag = this.creep.room.name + '_runner';
            this.flag = <Flag>Game.flags[this.creep.memory.flag];
            this.flag.memory.creep = this.creep.name;
        }else{
            this.flag = <Flag>Game.flags[this.creep.memory.flag];
        }
    }

    retarget() {
        super.retarget();
        
        if (this.flag && this.creep.room.name != this.flag.pos.roomName) {
            if (this.creep.carry.energy < this.creep.carryCapacity) {
                super.try_targeting('energizing');
            } else {
                this.creep.memory.target_id = this.flag.id;
                this.creep.memory.action_name = 'moving';
            }
        } else {
            // this.flag.remove();
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

    static create(budget:number) {
        return [
            // CLAIM, 
            WORK, WORK, WORK, WORK, WORK,
            CARRY, CARRY, CARRY, CARRY, CARRY,
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
        ];
        // return [
        //     // CLAIM, 
        //     WORK, WORK, 
        //     CARRY, CARRY, CARRY, CARRY, CARRY, 
        //     MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
        // ];
    }

}