/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseAction.ts" />
/// <reference path="ExtractAction.ts" />
"use strict";
class HarvestAction extends BaseAction { //Abstract class
    public actor;
    public target;
    public action_name = 'Harvest';

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
        
        let total_carrying = _.sum(this.actor.carry);
        if (total_carrying == this.actor.carryCapacity) {
            // this.actor.say('Harvested');
            return false;
        } else {
            let action = this.actor.harvest(this.target);
            if (action == ERR_NOT_IN_RANGE) {
                this.move();
            } else if (action == ERR_BUSY) {//The creep is still being spawned.
                //just wait
            } else if (action == ERR_NOT_ENOUGH_RESOURCES) {
                // console.log('Depleted an energy source.');
                return false;
            } else if (action != 0) {
                console.log('harvesting error:', action, this.actor.name, this.actor.room, this.target);
                // return false;
            }
            return true;
        }
    }
}
CreepActions['Harvest'] = HarvestAction;