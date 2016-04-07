/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseAction.ts" />
"use strict";
class HealAction extends BaseAction {
    public actor;
    public target;
    public action_name = 'Heal';

    constructor(actor) {
        super(actor);
    }

    getTargets() {
        let targets = this.actor.room.find(FIND_MY_CREEPS, {
            filter: function(obj) {
                return obj.hits < obj.hitsMax
            }
        });
        return targets;
    }

    perform() {
        super.perform();

        let action;
        if (this.actor.getActiveBodyparts(HEAL) > 0) {
            action = this.actor.rangedHeal(this.target);
        } else {
            return false
        }
        if (action == ERR_NOT_IN_RANGE) {
            this.move();
        } else if (action == ERR_BUSY) {//The creep is still being spawned.
            //just wait
        } else if (action == ERR_INVALID_TARGET) {
            return false;
        } else if (action != 0) {
            console.log('healing error:', action);
            // return false;
        }
        return true;
    }

}
CreepActions['Heal'] = HealAction;