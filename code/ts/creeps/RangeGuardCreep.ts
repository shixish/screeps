/// <reference path="../vars/Globals.ts" />
/// <reference path="../creeps/BaseCreep.ts" />
"use strict";

class RangeGuardCreep extends BaseCreep {
    public creep: Creep;

    constructor(creep: Creep) {
        super(creep);
    }

    retarget() {
        super.retarget();
        if (!super.try_to('GoOffice')) {
            if (!super.try_to('Attack')) {

            }
        }
        super.try_to('Rest');
    }

    work() {
        super.work();
        if (this.creep.hits < this.creep.hitsMax && this.creep.getActiveBodyparts(HEAL) > 0) {
            this.creep.heal(this.creep);
        }
    }

    static creep_tiers = [
        {
            'cost': 150 * 4 + 50 * 5 + 250,
            'body': [
                MOVE, 
                RANGED_ATTACK, //150
                MOVE, 
                RANGED_ATTACK, 
                MOVE, 
                HEAL, //250
                MOVE, 
                RANGED_ATTACK, 
                MOVE,
                RANGED_ATTACK, 
            ],
        },
    ];

}
CreepControllers['RangeGuard'] = RangeGuardCreep;