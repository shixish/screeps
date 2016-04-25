/// <reference path="../vars/Globals.ts" />
/// <reference path="../utils/Inventory.ts" />
/// <reference path="../creeps/BaseCreep.ts" />
/// <reference path="../creeps/HarvesterCreep.ts" />
/// <reference path="../utils/Debug.ts" />
"use strict";

class RangeHarvesterCreep extends HarvesterCreep {
    public creep: Creep;
    public container: Container;

    constructor(creep: Creep) {
        super(creep);
    }

    retarget() {
        super.retarget();

        // this.creep.memory.target_id = this.flag.id;
        // this.creep.memory.action_name = 'moving';

        if (!super.try_to('GoOffice')) {
            if (this.creep.carry.energy > 0) {
                if (this.container) {
                    super.set_target(this.container, 'Store');
                } else { //if (!super.try_to('Store')) {
                    console.log('ranged harvester found no container?!');
                    super.set_target(this.source, 'Extract');
                }
            } else {
                super.set_target(this.source, 'Harvest');
                // if (!super.try_to('Harvest')) {

                // }
            }
        }
    }

    static creep_tiers = [
        {
            'cost': 100 * 6 + 50 * 6 + 50 * 6, //1200
            'body': [
                MOVE, MOVE, MOVE,
                WORK, WORK, WORK, WORK, WORK, WORK,
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                MOVE, MOVE, MOVE,
            ],
        },
        {
            'cost': 100 * 3 + 50 * 5 + 50 * 5, //800
            'body': [
                WORK, WORK, WORK,
                CARRY, CARRY, CARRY, CARRY, CARRY,
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
        
        // {//Path Testing
        //     'cost': 50,
        //     'body': [
        //         MOVE,
        //     ],
        // },
    ];

}
CreepControllers['RangeHarvester'] = RangeHarvesterCreep;