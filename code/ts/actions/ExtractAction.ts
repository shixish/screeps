/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseAction.ts" />
"use strict";
class ExtractAction extends BaseAction {
    public actor;
    public target;
    public action_name = 'Extract';

    constructor(actor) {
        super(actor);
    }

    getTargets() {
        return this.actor.room.find(FIND_SOURCES, {
            filter: function(obj: Source) {
                return obj.energy > 0 && obj.room.controller.owner && obj.room.controller.owner.username == Globals.USERNAME;
            }
        });
    }

    perform() {
        let action = this.actor.harvest(this.target);
        if (action == ERR_NOT_IN_RANGE) {
            this.move();
        } else if (action == ERR_BUSY) {//The creep is still being spawned.
            //just wait
        } else if (action == ERR_NOT_ENOUGH_RESOURCES) {
            // console.log('Depleted an energy source.');
            return false;
        } else if (action != 0) {
            console.log('harvesting error:', action, this.actor.name);
            // return false;
        }
        return true;
    }

}