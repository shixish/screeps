/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseAction.ts" />
"use strict";
class BuildAction extends BaseAction {
    public actor;
    public target;
    public action_name = 'Build';

    constructor(actor) {
        super(actor);
    }

    getTargets() {
        let targets = this.actor.room.find(FIND_CONSTRUCTION_SITES/*, {
            filter: (obj:ConstructionSite) => { 
                return obj.structureType == STRUCTURE_RAMPART;
            }
        }*/);
        return targets;
    }

    perform() {
        super.perform();

        if (this.actor.carry.energy == 0) {//end condition:
            // this.actor.say('Built');
            return false;
        } else {
            let action = this.actor.build(this.target);
            if (action == ERR_NOT_IN_RANGE) {
                this.move();
            } else if (action == ERR_BUSY) {//The creep is still being spawned.
                //just wait
            }else if (action == ERR_INVALID_TARGET){
                return false; //building is finished, needs a new target.
            } else if (action != 0) {
                console.log('building error:', action);
            }
            return true;
        }
    }

}
CreepActions['Build'] = BuildAction;