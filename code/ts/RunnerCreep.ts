/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
/// <reference path="Globals.ts" />
/// <reference path="Inventory.ts" />
/// <reference path="BaseCreep.ts" />
"use strict";

class RunnerCreep extends BaseCreep {
    public creep: Creep;
    public flag: Flag;

    constructor(creep: Creep) {
        super(creep);

        // console.log(this.creep, "exists already");
        if (!this.creep.memory.flag) {
            this.creep.memory.flag = this.creep.room.name + '_runner';
            this.flag = <Flag>Game.flags[this.creep.memory.flag];
        }else{
            this.flag = <Flag>Game.flags[this.creep.memory.flag];
        }
        // this.retarget();
    }

    retarget() {
        super.retarget();
        
        if (this.flag && this.creep.room.name != this.flag.pos.roomName) {
            // console.log(this.creep);
            if (Inventory.room_structure_count('storage', this.creep.room) > 0 && this.creep.carry.energy < this.creep.carryCapacity) {
                super.try_targeting('energizing');
            } else {
                this.creep.memory.target_id = this.flag.id;
                this.creep.memory.action_name = 'moving';
            }
        } else {
            // this.flag.remove();
            if (!super.try_targeting('claiming')) {
                if (this.creep.carry.energy > 0) {
                    if (!super.try_targeting('transferring')) {
                        if (!super.try_targeting('building')) {
                            if (!super.try_targeting('upgrading')) {
                                console.log('Creep is unable to spend energy!?');
                            }
                        }
                    }
                } else {
                    if (!super.try_targeting('picking')) {
                        if (!super.try_targeting('harvesting')) {

                        }
                    }
                }
            }
        }
    }

    static create(budget:number) {
        // if (budget >= 600 * 5 + 50 * 10)
        //     return [
        //         MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
        //         CLAIM, CLAIM, CLAIM, CLAIM, CLAIM
        //     ];

        // if (budget >= 100 * 10 + 50 * 10 + 50 * 10)// + 600)
        //     return [
        //         WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
        //         CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        //         MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
        //         // CLAIM, 
        //     ];
        if (budget >= 100 * 5 + 50 * 5 + 50 * 10)// + 600)
            return [
                WORK, WORK, WORK, WORK, WORK,
                CARRY, CARRY, CARRY, CARRY, CARRY,
                MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                CLAIM, 
            ];
        // else if (budget >= 100 * 2 + 50 * 4 + 50 * 2) // 500
        //     return [
        //         WORK, WORK,
        //         CARRY, CARRY, CARRY, CARRY,
        //         MOVE, MOVE,
        //     ];
        
        // return [
        //     // CLAIM, 
        //     WORK, WORK, 
        //     CARRY, CARRY, CARRY, CARRY, CARRY, 
        //     MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
        // ];
    }

}