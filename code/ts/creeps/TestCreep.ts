/// <reference path="../vars/Globals.ts" />
/// <reference path="../utils/Inventory.ts" />
/// <reference path="../creeps/BaseCreep.ts" />
/// <reference path="../utils/Debug.ts" />
"use strict";

class TestCreep extends BaseCreep {
    public creep: Creep;

    constructor(creep: Creep) {
        super(creep);
    }

    retarget() {
        super.retarget();
        if (!super.try_to('GoOffice')) {

        }
    }

    static creep_tiers = [
        {//Path Testing
            'cost': 50,
            'body': [
                MOVE,
            ],
        },
    ];

}
CreepControllers['Test'] = TestCreep;