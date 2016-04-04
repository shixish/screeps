/// <reference path="../vars/Globals.ts" />
/// <reference path="../utils/Inventory.ts" />
/// <reference path="BaseCreep.ts" />
/// <reference path="../../dts/map.d.ts" />
"use strict";

class BuilderCreep extends BaseCreep {
    public creep: Creep;
    public hasStorage: boolean;

    static creep_tiers = [
        {
            'cost':50*20 + 100*10 + 50*10, //2500,
            'body': [
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
                MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            ],
        },
        {
            'cost': 50 * 10 + 100 * 5 + 50 * 5,
            'body': [
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                WORK, WORK, WORK, WORK, WORK,
                MOVE, MOVE, MOVE, MOVE, MOVE,
            ],
        },
        {
            'cost': 50 * 4 + 100 * 4 + 50 * 4, //800 //Walk Miner,
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

    constructor(creep: Creep) {
        super(creep);
        this.hasStorage = Inventory.room_structure_count('storage', this.creep.room) > 0;
        this.prices = new Map();
        var map = new Map([
            [new Date(), function today() { }],
            [() => 'key', { pony: 'foo' }],
            [Symbol('items'), [1, 2]]
        ])
    }

    retarget() {
        super.retarget();
        // this.creep.memory.target_id = this.creep.memory.action_name = null;
        if (this.creep.carry.energy > 0) {
            if (this.hasStorage || !super.try_targeting('transferring')) {
                if (!super.try_targeting('building')) {
                    if (!super.try_targeting('upgrading')) {

                    }
                }
            }
        } else {
            // if (!super.try_targeting('picking')) {
                if (!super.try_targeting('tenergizing')) {
                    if (!super.try_targeting('harvesting')) {

                    }
                }
            // }
        }
        super.try_targeting('resting');//get the little shits out of the way
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

}