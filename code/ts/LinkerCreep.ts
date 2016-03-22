/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
/// <reference path="BaseCreep.ts" />
var Globals = require('Globals'),
    BaseCreep = require('BaseCreep');

declare var module: any;
(module).exports = class LinkerCreep extends BaseCreep {
    public creep: Creep;
    public retarget_count: number;

    constructor(creep: Creep) {
        super(creep);
    }

    retarget() {
        // if (this.creep.carry.energy > 0) {
        //     if (!super.try_targeting('transferring')) {

        //     }
        // } else {
        //     if (!super.try_targeting('picking')) {
        //         if (!super.try_targeting('energizing')) {

        //         }
        //     }
        // }
    }

    work() {
        // console.log(this.creep);
        this.retarget_count = 0;
        var target = Game.getObjectById(this.creep.memory.target_id),
            action_name = this.creep.memory.action_name,
            action_function = this[action_name];

        // this.retarget();
        this.creep.say(action_name);
        // console.log(action_name, target);

        // if (auto_retarget) console.log('unstucking');
        // if (this.creep.ticksToLive < Globals.MIN_TICKS_TO_LIVE && action_name != 'renewing') {
        //     this.retarget();
        // } else 
        if (!target || !action_function) {
            this.retarget();
        }

        if (target && action_function) {
            // action_function(target);
            action_function.apply(this, [target]);
        }
    }

    static create(budget: number) {
        if (budget >= 50 + 50 * 16) //850
            return [
                MOVE,
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
            ];
        else
            return [MOVE, CARRY, CARRY, CARRY, CARRY, CARRY];
    }

}