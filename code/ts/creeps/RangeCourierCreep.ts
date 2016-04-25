/// <reference path="../vars/Globals.ts" />
/// <reference path="../creeps/BaseCreep.ts" />
"use strict";

class RangeCourierCreep extends BaseCreep {
    public creep: Creep;
    protected rejuvinate:boolean;

    constructor(creep: Creep) {
        super(creep);
        this.rejuvinate = this.creep.memory.home == this.creep.memory.office && this.creep.room.controller && this.creep.room.controller.owner && this.creep.room.controller.owner.username == Globals.USERNAME;
    }

    retarget() {
        super.retarget();
        if (_.sum(this.creep.carry) == this.creep.carryCapacity) {
            if (!(this.rejuvinate && super.try_to('Give'))) {
                if (!super.try_to('GoHome')) {
                    if (!super.try_to('Link')) {
                        super.try_to('Store');
                    }
                }
            }
        } else {
            if (!super.try_to('GoOffice')) {
                if (!this.creep.room.memory.under_attack) {
                    if (!super.try_to('Pickup')) {
                        super.try_to('Take');
                    }
                }
            }
        }
        super.try_to('Rest');
    }

    static creep_tiers = [
        {
            'cost': 800,
            'body': [
                MOVE,
                CARRY, CARRY, CARRY,
                MOVE,
                CARRY, CARRY, CARRY,
                MOVE,
                CARRY, CARRY, CARRY,
                MOVE,
                CARRY, CARRY, CARRY,
            ],
        },
        {
            'cost': 500,
            'body': [
                CARRY, CARRY,
                MOVE, 
                CARRY, CARRY,
                MOVE, 
                CARRY, CARRY, CARRY,
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