/// <reference path="../vars/Globals.ts" />
/// <reference path="../creeps/BaseCreep.ts" />
"use strict";

class RangeCourierCreep extends BaseCreep {
    public creep: Creep;
    protected rejuvinate:boolean;

    constructor(creep: Creep) {
        super(creep);
        this.rejuvinate = this.creep.room.controller && this.creep.room.controller.owner && this.creep.room.controller.owner.username == Globals.USERNAME;
    }

    retarget() {
        super.retarget();
        if (_.sum(this.creep.carry) > 0) {
            if (!(this.rejuvinate && super.try_to('Give'))) {
                if (!super.try_to('GoHome')) {
                    if (!super.try_to('Link')) {
                        super.try_to('Store');
                    }
                }
            }
        } else {
            if (!super.try_to('GoOffice')) {
                super.try_to('Take');
            }
        }
        super.try_to('Rest');
    }

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
CreepControllers['RangeCourier'] = RangeCourierCreep;