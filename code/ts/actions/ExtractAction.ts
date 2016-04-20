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
                return obj.energy > 0;// && obj.room.controller.owner && obj.room.controller.owner.username == Globals.USERNAME;
            }
        });
    }

    perform() {
        super.perform();

        let action = this.actor.harvest(this.target);
        if (action == ERR_NOT_IN_RANGE) {
            this.move();
        } else if (action == ERR_BUSY) {//The creep is still being spawned.
            //just wait
        } else if (action == ERR_NOT_ENOUGH_RESOURCES) {
            // console.log('Depleted an energy source.');
            return false;
        } else if (action != 0) {
            console.log('extracting error:', action, this.actor.name);
            // return false;
        }
        // if (action == 0) {
        //     let container = <Creep[]>this.actor.pos.findInRange(FIND_MY_STRUCTURES, 3, {
        //         filter: function(obj) {
        //             return obj.structureType == STRUCTURE_RAMPART;
        //         }
        //     });
        // }
        return true;
    }

    micro() {

    }
}
CreepActions['Extract'] = ExtractAction;