/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseAction.ts" />
"use strict";
class RepairAction extends BaseAction {
    public actor;
    public target;
    public action_name = 'Repair';

    constructor(actor) {
        super(actor);
    }

    getTargets() {
        let targets = this.actor.room.find(FIND_STRUCTURES, {
            filter: obj => (
                (
                    obj.structureType == STRUCTURE_ROAD || 
                    obj.structureType == STRUCTURE_CONTAINER ||
                    (obj.owner && obj.owner.username == Globals.USERNAME)
                ) && obj.hits < obj.hitsMax && obj.hits < obj.hitsMax
            ),
        });
        return targets;
    }

    perform() {
        super.perform();

        if (this.actor.carry.energy == 0 || this.target.hits == this.target.hitsMax) {//end condition:
            // this.actor.say('Built');
            return false;
        } else {
            let action = this.actor.repair(this.target);
            if (action == ERR_NOT_IN_RANGE) {
                this.move();
            } else if (action == ERR_BUSY) {//The creep is still being spawned.
                //just wait
            }else if (action == ERR_INVALID_TARGET){
                return false; //Repairing is finished, needs a new target.
            } else if (action != 0) {
                console.log('Repairing error:', action);
            }
            return true;
        }
    }

}
CreepActions['Repair'] = RepairAction;