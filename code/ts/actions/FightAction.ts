/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseAction.ts" />
"use strict";
class FightAction extends BaseAction {
    public actor;
    public target;
    public action_name = 'Fight';

    constructor(actor) {
        super(actor);
    }

    getTargets() {
        let targets = this.actor.room.find(FIND_HOSTILE_CREEPS);
        return targets;
    }

    perform() {
        super.perform();

        let action;
        let my_pos = this.actor.pos;
        let is_ranged = this.actor.getActiveBodyparts(RANGED_ATTACK) > 0;

        let range = this.actor.pos.getRangeTo(this.target);

        // if (range > 3 && is_ranged) {
        //     let move = this.move();
        // }

        if (is_ranged) {
            action = this.actor.rangedAttack(this.target);
        } else {
            action = this.actor.attack(this.target);
        }

        // let hostiles = <Creep[]>this.actor.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
        // let hostile_directions = _.reduce(hostiles, (obj, hostile) => {
        //     let direction = my_pos.getDirectionTo(hostile);
        //     obj[direction] = obj[direction] == undefined ? 1 : obj[direction] + 1;
        //     return obj;
        // }, {});

        // debug.log(hostile_directions, _.max(hostile_directions));

        // if (is_ranged && hostiles.length) {
        //     // return this.actor.moveTo(getReverseDirection());
        //     console.log('kite');
        // } else 
        if (action == ERR_NOT_IN_RANGE) {
            this.move();
        } else if (action == ERR_BUSY) {//The creep is still being spawned.
            //just wait
        } else if (action == ERR_INVALID_TARGET) {
            return false;
        } else if (action != 0) {
            console.log('fighting error:', action);
            // return false;
        }
        return true;
    }

}
CreepActions['Fight'] = FightAction;