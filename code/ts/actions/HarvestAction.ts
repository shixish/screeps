/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseAction.ts" />
/// <reference path="ExtractAction.ts" />
"use strict";
class HarvestAction extends ExtractAction { //Abstract class
    public actor;
    public target;
    public action_name = 'Harvest';

    constructor(actor) {
        super(actor);
    }

    perform() {
        let total_carrying = _.sum(this.actor.carry);
        if (total_carrying == this.actor.carryCapacity) {
            // this.actor.say('Harvested');
            return false;
        } else {
            return super.perform();
        }
    }
}
CreepActions['Harvest'] = HarvestAction;