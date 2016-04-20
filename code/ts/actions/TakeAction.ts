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

        // let targets = this.actor.room.find(FIND_MY_STRUCTURES, {
        //     filter: function(obj) {
        //         return (
        //             obj.structureType == STRUCTURE_STORAGE
        //             && obj.store.energy > 0
        //         );
        //     }
        // });
        //notice: can't use "my" structures to find containers, as they are neutral...
        let targets = this.actor.room.find(FIND_STRUCTURES, {
            filter: function(obj) {
                if (obj.structureType == STRUCTURE_STORAGE || obj.structureType == STRUCTURE_CONTAINER) {
                    return obj.store.energy > 0; //needs to not be empty
                }
                return false;
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
        if (!this.target || fullness == this.actor.carryCapacity || this.target.energy == 0) {//end condition:
            // this.actor.say('Energized');
            return false;
        } else {
            if (this.target.energy > 0 || (this.target.store && this.target.store.energy > 0)) { //Storage uses .store, others don't
                //Notice: links do not offer the "transfer" method, only "transferEnergy" method.
                let action;
                //for some reason links have a transfer method but cant use it
                if (this.target.transfer && this.target.structureType != STRUCTURE_LINK) {
                    action = this.target.transfer(this.actor, RESOURCE_ENERGY);
                } else {
                    action = this.target.transferEnergy(this.actor);
                }

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