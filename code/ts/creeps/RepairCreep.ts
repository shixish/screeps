/// <reference path="../vars/Globals.ts" />
/// <reference path="../utils/Inventory.ts" />
/// <reference path="../creeps/BaseCreep.ts" />
/// <reference path="../utils/Debug.ts" />
"use strict";

class RepairCreep extends BaseCreep {
    public creep: Creep;

    constructor(creep: Creep) {
        super(creep);
    }

    retarget() {
        super.retarget();

        if (!super.try_to('GoOffice')) {
            if (this.creep.carry.energy > 0) {
                if (!super.try_to('Build')) {
                    if (!super.try_to('Repair')) {

                    }
                }
            } else {
                super.try_to('Take');
            }
        }
    }

    static creep_tiers = [
        {
            'cost': 500,
            'body': [
                CARRY, CARRY, CARRY,
                WORK, WORK,
                MOVE, MOVE, MOVE,
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
CreepControllers['Repair'] = RepairCreep;