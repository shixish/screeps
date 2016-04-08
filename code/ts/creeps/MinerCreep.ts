/// <reference path="../vars/Globals.ts" />
/// <reference path="../creeps/BaseCreep.ts" />
"use strict";

class MinerCreep extends BaseCreep {
    public creep: Creep;

    constructor(creep: Creep) {
        super(creep);
    }

    retarget() {
        super.retarget();
        if (_.sum(this.creep.carry) > 0) {
            super.try_to('Store');
        } else {
            super.try_to('Mine');
        }
    }

    // static create(budget: number) {
    //     if (budget >= 50*10 + 100*5 + 50*5)
    //         return [
    //             CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
    //             WORK, WORK, WORK, WORK, WORK,
    //             MOVE, MOVE, MOVE, MOVE, MOVE,
    //         ];
    //     else
    //         return [
    //             CARRY, CARRY, CARRY,
    //             WORK,
    //             MOVE,
    //         ];
    // }

    static creep_tiers = [
        {
            'cost': 50 * 10 + 100 * 5 + 50 * 5,
            'body': [
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                WORK, WORK, WORK, WORK, WORK,
                MOVE, MOVE, MOVE, MOVE, MOVE,
            ],
        },
        {
            'cost': 300,
            'body': [
                CARRY, CARRY, CARRY,
                WORK,
                MOVE,
            ],
        },
    ];

}
CreepControllers['Miner'] = MinerCreep;