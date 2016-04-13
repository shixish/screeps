/// <reference path="../vars/Globals.ts" />
/// <reference path="../creeps/BaseCreep.ts" />
"use strict";

class ClaimCreep extends BaseCreep {
    public creep: Creep;
    public flag: Flag;

    constructor(creep: Creep) {
        super(creep);
        // this.retarget();
    }

    retarget() {
        super.retarget();
        if (this.flag && this.creep.room.name != this.flag.pos.roomName){
            super.set_target(this.flag); //set off on the journey
        } else {
            if (!super.try_to('Claim')) {
            }
        }
        // if (_.sum(this.creep.carry) > this.creep.carryCapacity/2) {
        //     if (this.creep.carry.energy > 0) {
        //         super.try_to('Give');
        //     } else { //if it's not energy, it needs to be put into storage.
        //         super.try_to('Store');
        //     }
        // } else {
        //     if (!super.try_to('Pickup')) { //picking isn't smart enough, it makes the screeps behave stupidly. chasing everything down... 
        //     //todo: Can make a routine that looks for nearest CARRY creep nearby the dropped resource and retarget it to pick it up
        //         super.try_to('Take');
        //     }
        // }
        super.try_to('Rest');//get the little shits out of the way
    }

    static creep_tiers = [
        {
            'cost': 50*5 + 600*1,
            'body': [
                MOVE, MOVE, MOVE, MOVE, MOVE,
                CLAIM,
            ],
        },
    ];

}
CreepControllers['Claim'] = ClaimCreep;