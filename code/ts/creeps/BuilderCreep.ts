/// <reference path="../vars/Globals.ts" />
/// <reference path="../utils/Inventory.ts" />
/// <reference path="BaseCreep.ts" />
"use strict";

class BuilderCreep extends BaseCreep {
    public creep: Creep;

    constructor(creep: Creep) {
        super(creep);
    }

    retarget() {
        super.retarget();
        // this.creep.memory.target_id = this.creep.memory.action_name = null;
        if (this.creep.carry.energy > 0) {
            if (!super.try_to('GoOffice')) {
                if (!super.try_to('Sustain')) {
                    if (this.creep.room.memory.storage.energy > 20000 || !super.try_to('Store')) {
                        if (!super.try_to('Build')) {
                            if (!super.try_to('Upgrade')) {

                            }
                        }
                    }
                }
            }
        } else {
            // if (!super.try_to('picking')) {
                if (!super.try_to('Ask')) {
                    if (!super.try_to('Harvest')) {

                    }
                }
            // }
        }
        super.try_to('Rest');//get the little shits out of the way
    }

    // static create(budget: number) {
    //     if (budget >= 50*20 + 100*10 + 50*10) //2500
    //         return [
    //             CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
    //             CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
    //             WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
    //             MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
    //         ];
    //     else if (budget >= 50*10 + 100*5 + 50*5)
    //         return [
    //             CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
    //             WORK, WORK, WORK, WORK, WORK,
    //             MOVE, MOVE, MOVE, MOVE, MOVE,
    //         ];
    //     else if (budget >= 50*4 + 100*4 + 50*4) //800
    //         return [ //Walk Miner
    //             CARRY, CARRY, CARRY, CARRY,
    //             WORK, WORK, WORK, WORK,
    //             MOVE, MOVE, MOVE, MOVE,
    //         ];
    //     else if (budget >= 50*4 + 100*2 + 50*2) // 500
    //         return [
    //             CARRY, CARRY, CARRY, CARRY,
    //             WORK, WORK,
    //             MOVE, MOVE,
    //         ];
    //     else
    //         return [
    //             CARRY, CARRY, CARRY,
    //             WORK,
    //             MOVE,
    //         ];
    // }

    static creep_tiers = [// 2300
        //Unnecessarily badass:
        // {
        //     'cost': 50 * 25 + 100 * 15 + 50 * 10,
        //     'body': [
        //         CARRY, CARRY, CARRY, CARRY, CARRY, 
        //         CARRY, CARRY, CARRY, CARRY, CARRY,
        //         CARRY, CARRY, CARRY, CARRY, CARRY, 
        //         CARRY, CARRY, CARRY, CARRY, CARRY,
        //         CARRY, CARRY, CARRY, CARRY, CARRY, 
        //         WORK, WORK, WORK, WORK, WORK, 
        //         WORK, WORK, WORK, WORK, WORK,
        //         WORK, WORK, WORK, WORK, WORK,
        //         MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
        //     ],
        // },
        {
            'cost': 50 * 18 + 100 * 10 + 50 * 8, //2300 breakpoint
            'body': [
                CARRY, CARRY, CARRY, CARRY, CARRY, 
                CARRY, CARRY, CARRY, CARRY, CARRY,
                CARRY, CARRY, CARRY, CARRY, CARRY, 
                CARRY, CARRY, CARRY, 
                WORK, WORK, WORK, WORK, WORK, 
                WORK, WORK, WORK, WORK, WORK,
                MOVE, MOVE, MOVE, MOVE, MOVE, 
                MOVE, MOVE, MOVE,
            ],
        },
        {
            'cost': 50 * 10 + 100 * 5 + 50 * 5,
            'body': [
                CARRY, CARRY, CARRY, CARRY, CARRY, 
                CARRY, CARRY, CARRY, CARRY, CARRY,
                WORK, WORK, WORK, WORK, WORK,
                MOVE, MOVE, MOVE, MOVE, MOVE,
            ],
        },
        {
            'cost': 50 * 4 + 100 * 4 + 50 * 4, //800
            'body': [
                CARRY, CARRY, CARRY, CARRY,
                WORK, WORK, WORK, WORK,
                MOVE, MOVE, MOVE, MOVE,
            ],
        },
        {
            'cost': 50 * 4 + 100 * 2 + 50 * 2, // 500,
            'body': [
                CARRY, CARRY, CARRY, CARRY,
                WORK, WORK,
                MOVE, MOVE,
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
CreepControllers['Builder'] = BuilderCreep;