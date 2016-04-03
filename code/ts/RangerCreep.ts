/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
/// <reference path="Globals.ts" />
/// <reference path="BaseCreep.ts" />
"use strict";

class RangerCreep extends BaseCreep {
    public creep: Creep;
    public flag: Flag;

    constructor(creep: Creep) {
        super(creep);

        if (!this.creep.memory.flag) {
            this.creep.memory.flag = this.creep.room.name + '_ranger';
            this.flag = <Flag>Game.flags[this.creep.memory.flag];
        } else {
            this.flag = <Flag>Game.flags[this.creep.memory.flag];
        }
        // console.log(this.creep, this.flag);
        // this.retarget();
    }

    retarget() {
        super.retarget();
        // this.flag.remove();
        // this.creep.room.memory.under_attack

        if (!super.try_targeting('assaulting')) {
            if (this.flag) {
                this.creep.memory.target_id = this.flag.id;
                this.creep.memory.action_name = 'moving';
            }
        }
    }

    static create(budget: number) {
        if (budget >= 50 * 10 + 150 * 10)
            return [
                // TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK,
                MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK,
                MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK,
                MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK,
                MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK,
            ];
        // if (budget >= 10*10 + 50*10 + 150*10)
        //     return [
        //         TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
        //         MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK,
        //         MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK,
        //         MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK,
        //         MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK,
        //         MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK,
        //     ];
        if (budget >= 50*5 + 150*5)
            return [
                MOVE, RANGED_ATTACK,
                MOVE, RANGED_ATTACK,
                MOVE, RANGED_ATTACK,
                MOVE, RANGED_ATTACK,
                MOVE, RANGED_ATTACK,
            ];
    }

}