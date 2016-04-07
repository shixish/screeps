/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseAction.ts" />
"use strict";
class PickupAction extends BaseAction {
    public actor;
    public target;
    public action_name = 'Pickup';

    constructor(actor) {
        super(actor);
    }

    getTargets() {
        if (!this.actor.room.memory.under_attack) {
            return this.actor.room.find(FIND_DROPPED_RESOURCES, {
                filter: (obj) => {
                    return true;// return obj.amount <= free_space;
                }
            });
        }
    }

    perform() {
        let action = this.actor.pickup(this.target);
        if (action == ERR_NOT_IN_RANGE) {
            this.move();
        } else if (action == ERR_BUSY) {//The creep is still being spawned.
            //just wait
        } else if (action == ERR_INVALID_TARGET) {
            return false;
        } else if (action == ERR_FULL) {
            return false;
        } else if (action != 0) {
            console.log('picking error:', action);
            // return false;
        }
        return true;
    }

}