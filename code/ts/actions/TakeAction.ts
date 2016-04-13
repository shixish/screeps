/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseAction.ts" />
"use strict";
class TakeAction extends BaseAction {
    public actor;
    public target;
    public action_name = 'Take'; //formerly "energizing"

    constructor(actor) {
        super(actor);
    }

    getTargets() {
        let targets = this.actor.room.find(FIND_MY_STRUCTURES, {
            filter: function(obj) {
                return (
                    obj.structureType == STRUCTURE_STORAGE
                    && obj.store.energy > 0
                );
            }
        });
        return targets;
    }

    //only works on storage tanks
    perform() {
        super.perform();
        // if (this.actor.name == 'Lucy')
        //     console.log('Take:', this.actor.name, this.actor.memory.role, this.actor.room);
        let fullness = _.sum(this.actor.carry); //creep can have multiple resources on board
        if (fullness == this.actor.carryCapacity || this.target.energy == 0) {//end condition:
            // this.actor.say('Energized');
            return false;
        } else {
            if (this.target.energy > 0 || (this.target.store && this.target.store.energy > 0)) { //Storage uses .store, others don't
                let action = this.target.transferEnergy(this.actor);
                // if (target.energy <= 5){
                //     this.retarget(this);
                // }
                if (action == ERR_NOT_IN_RANGE) {
                    this.move();
                } else if (action != 0) {
                    console.log('Take action error:', action, this.actor.name, this.actor.memory.role, this.actor.room);
                    // return false;
                }
            } else {
                return false;
            }
            return true;
        }
    }

}
CreepActions['Take'] = TakeAction;