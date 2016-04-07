/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseAction.ts" />
/// <reference path="TakeAction.ts" />
"use strict";
class AskAction extends TakeAction { //Abstract class
    public actor;
    public target;
    public action_name = 'Ask';//formerly "tenergizing"

    constructor(actor) {
        super(actor);
    }

    getTargets() {
        let targets = this.actor.room.find(FIND_MY_STRUCTURES, {
            filter: function(obj: Storage) {
                return (
                    obj.structureType == STRUCTURE_STORAGE
                    && obj.store.energy > obj.storeCapacity * 0.25
                );
            }
        });
        return targets;
    }

}