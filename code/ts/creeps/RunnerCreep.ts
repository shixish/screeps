/// <reference path="../vars/Globals.ts" />
/// <reference path="../utils/Inventory.ts" />
/// <reference path="../creeps/BaseCreep.ts" />
/// <reference path="../utils/Debug.ts" />
"use strict";

class RunnerCreep extends BaseCreep {
    public creep: Creep;
    public flag: Flag;

    constructor(creep: Creep) {
        super(creep);
        if (!this.creep.memory.flag) {
            this.creep.memory.flag = this.creep.room.name + '_runner';
            this.flag = <Flag>Game.flags[this.creep.memory.flag];
        }else{
            this.flag = <Flag>Game.flags[this.creep.memory.flag];
        }
        // this.retarget();
        // debug.log(this.flag);
        // debug.log('test2');
        // console.log('test');
    }

    // static get_heighest_tier(room: Room) {
    //     let flag = <Flag>Game.flags[room.name + '_runner'];
    //     // debug.log('runner', flag);

    //     let budget = room.energyCapacityAvailable;
    //     for (let t in this.creep_tiers) {
    //         let tier = this.creep_tiers[t];
    //         // console.log(tier, tier.cost, room.energyCapacityAvailable);
    //         if (tier.cost < budget) {
    //             return tier;
    //         }
    //     }
    // }

    retarget() {
        super.retarget();

        // this.creep.memory.target_id = this.flag.id;
        // this.creep.memory.action_name = 'moving';
        
        if (this.flag && this.creep.room.name != this.flag.pos.roomName) {
            // console.log(this.creep);
            if (Inventory.room_structure_count('storage', this.creep.room) > 0 && this.creep.carry.energy < this.creep.carryCapacity) {
                super.try_to('Take'); //fill up before leaving
            } else {
                super.set_target(this.flag); //set off on the journey
            }
        } else {
            // this.flag.remove();
            if (!super.try_to('Claim')) {
                if (this.creep.carry.energy > 0) {
                    if (!super.try_to('Give')) {
                        if (!super.try_to('Build')) {
                            if (!super.try_to('Upgrade')) {
                                if (!super.try_to('Store')) {
                                    // console.log('Creep is unable to spend energy!?');
                                }
                            }
                        }
                    }
                } else {
                    if (!super.try_to('Pickup')) {
                        if (!super.try_to('Harvest')) {

                        }
                    }
                }
            }
        }
    }

    // static create(budget:number) {
    //     // if (budget >= 600 * 5 + 50 * 10)
    //     //     return [
    //     //         MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
    //     //         CLAIM, CLAIM, CLAIM, CLAIM, CLAIM
    //     //     ];

    //     // if (budget >= 100 * 10 + 50 * 10 + 50 * 10)// + 600)
    //     //     return [
    //     //         WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
    //     //         CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
    //     //         MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
    //     //         // CLAIM, 
    //     //     ];
    //     if (budget >= 100 * 5 + 50 * 5 + 50 * 10)// + 600)
    //         return [
    //             WORK, WORK, WORK, WORK, WORK,
    //             CARRY, CARRY, CARRY, CARRY, CARRY,
    //             MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
    //             // CLAIM, 
    //         ];
    //     // else if (budget >= 100 * 2 + 50 * 4 + 50 * 2) // 500
    //     //     return [
    //     //         WORK, WORK,
    //     //         CARRY, CARRY, CARRY, CARRY,
    //     //         MOVE, MOVE,
    //     //     ];
        
    //     // return [
    //     //     // CLAIM, 
    //     //     WORK, WORK, 
    //     //     CARRY, CARRY, CARRY, CARRY, CARRY, 
    //     //     MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
    //     // ];
    // }

    static creep_tiers = [
        // // {
        // //     'cost': 100 * 5 + 50 * 5 + 50 * 10 + 600,
        // //     'body': [
        // //         WORK, WORK, WORK, WORK, WORK,
        // //         CARRY, CARRY, CARRY, CARRY, CARRY,
        // //         MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
        // //         CLAIM, 
        // //     ],
        // // },

        // {
        //     'cost': 100 * 10 + 50 * 10 + 50 * 10,
        //     'body': [
        //         WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
        //         CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        //         MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
        //         // CLAIM, 
        //     ],
        // },
        // {
        //     'cost': 100 * 5 + 50 * 5 + 50 * 10,
        //     'body': [
        //         WORK, WORK, WORK, WORK, WORK,
        //         CARRY, CARRY, CARRY, CARRY, CARRY,
        //         MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
        //         // CLAIM, 
        //     ],
        // },
        // {
        //     'cost': 300,
        //     'body': [
        //         CARRY, CARRY, CARRY,
        //         WORK,
        //         MOVE,
        //     ],
        // },
        
        {//Path Testing
            'cost': 50,
            'body': [
                MOVE,
            ],
        },
    ];

}
CreepControllers['Runner'] = RunnerCreep;