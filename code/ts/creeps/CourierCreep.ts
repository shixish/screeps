/// <reference path="../vars/Globals.ts" />
/// <reference path="../creeps/BaseCreep.ts" />
"use strict";

class CourierCreep extends BaseCreep {
    public creep: Creep;

    constructor(creep: Creep) {
        super(creep);
        // let lab = <Lab>Game.getObjectById('56f0d30a0bf3b09b7db115b5');
        // lab.mineralCapacity
    }

    retarget() {
        super.retarget();
        if (_.sum(this.creep.carry) > this.creep.carryCapacity/2) {
            if (!super.try_to('GoHome')) {
                if (this.creep.carry.energy > 0 && this.creep.memory.home == this.creep.memory.office) {
                    !super.try_to('Give');
                } else { //if it's not energy, it needs to be put into storage.
                    super.try_to('Store');
                }
            }
        } else {
            if (!super.try_to('GoOffice')) {
                if (!super.try_to('Pickup')) { //picking isn't smart enough, it makes the screeps behave stupidly. chasing everything down... 
                    //todo: Can make a routine that looks for nearest CARRY creep nearby the dropped resource and retarget it to pick it up
                    super.try_to('Take');
                }
            }
        }
        super.try_to('Rest');//get the little shits out of the way
    }

    // work() {
    //     // console.log(this.creep);
    //     this.retarget_count = 0;
    //     var target = Game.getObjectById(this.creep.memory.target_id),
    //         action_name = this.creep.memory.action_name,
    //         action_function = this[action_name];

    //     // this.retarget();
    //     this.creep.say(action_name);
    //     // console.log(action_name, target);

    //     // if (auto_retarget) console.log('unstucking');
    //     // if (this.creep.ticksToLive < Globals.MIN_TICKS_TO_LIVE && action_name != 'renewing') {
    //     //     this.retarget();
    //     // } else 
    //     if (!target || !action_function) {
    //         this.retarget();
    //     }

    //     if (target && action_function) {
    //         // action_function(target);
    //         action_function.apply(this, [target]);
    //     }
    // }

    // static create(budget:number) {
    //     if (budget >= 50*10 + 50*3)
    //         return [
    //             CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
    //             MOVE, MOVE, MOVE,
    //         ];
    //     else
    //         return [
    //             CARRY, CARRY, CARRY, CARRY,
    //             MOVE, MOVE, 
    //         ];
    // }

    static creep_tiers = [
        {
            'cost': 50*10 + 50*3,
            'body': [
                MOVE, 
                CARRY, CARRY, 
                CARRY, CARRY, 
                CARRY, 
                MOVE, 
                CARRY, CARRY, CARRY, CARRY, CARRY,
                MOVE,
            ],
        },
        {
            'cost': 300,
            'body': [
                CARRY, CARRY, 
                MOVE, 
                CARRY, CARRY,
                MOVE, 
            ],
        },
    ];

}
CreepControllers['Courier'] = CourierCreep;