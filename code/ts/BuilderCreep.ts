/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
/// <reference path="BaseCreep.ts" />
var Globals = require('Globals'),
    BaseCreep = require('BaseCreep');

declare var module: any;
(module).exports = class BuilderCreep extends BaseCreep {
    public creep: Creep;

    constructor(creep: Creep) {
        super(creep);
    }

    retarget() {
        super.retarget();
        // this.creep.memory.target_id = this.creep.memory.action_name = null;
        if (this.creep.carry.energy > 0) {
            if (!super.try_targeting('building')) {
                if (!super.try_targeting('upgrading')) {
                    console.log('Creep is unable to spend energy!?');
                }
            }
        } else {
            if (!super.try_targeting('tenergizing')) {
                if (!super.try_targeting('harvesting')) {
                    if (Game.flags['resting']) {
                        this.creep.memory.target_id = Game.flags['resting'].id;
                        this.creep.memory.action_name = 'moving';
                    }
                }
            }
        }
        
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
    //         action_function.apply(this, [target]);
    //     }
    // }

    static create(budget: number) {
        if (budget >= 50*10 + 100*10 + 50*20) //2500
            return [
                MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, 
                WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
            ];
        else if (budget >= 50*5 + 100 * 5 + 50 * 10)
            return [
                MOVE, MOVE, MOVE, MOVE, MOVE,
                WORK, WORK, WORK, WORK, WORK,
                CARRY, CARRY, CARRY, CARRY, CARRY,
                CARRY, CARRY, CARRY, CARRY, CARRY,
            ];
        else
            return [MOVE, WORK, CARRY, CARRY, CARRY];
    }

}