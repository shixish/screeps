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
        // if (this.flag && this.creep.room.name != this.flag.pos.roomName){
        //     super.set_target(this.flag); //set off on the journey
        // } else {
        //     if (!super.try_to('Claim')) {
        //     }
        // }

        if (!super.try_to('GoOffice')) {
            if (!super.try_to('Claim')) {

            }
        }
    }

    static creep_tiers = [
        {
            'cost': 50*3 + 600*1,
            'body': [
                MOVE, MOVE, MOVE,
                CLAIM,
            ],
        },
    ];

}
CreepControllers['Claim'] = ClaimCreep;