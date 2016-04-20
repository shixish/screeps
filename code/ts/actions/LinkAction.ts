/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseAction.ts" />
/// <reference path="GiveAction.ts" />
"use strict";
class LinkAction extends GiveAction {
    public actor;
    public target;
    public action_name = 'Link';

    constructor(actor) {
        super(actor);
    }

    getTargets() {
        let targets = this.actor.room.find(FIND_MY_STRUCTURES, {
            filter: function(obj) {
                return (
                    obj.structureType == STRUCTURE_LINK && obj.energy < obj.energyCapacity
                );
            }
        });
        return targets;
    }
}
CreepActions['Link'] = LinkAction;