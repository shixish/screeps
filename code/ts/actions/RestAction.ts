/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseAction.ts" />
"use strict";
class RestAction extends BaseAction {
    public actor;
    public target;
    public action_name = 'Rest';

    constructor(actor) {
        super(actor);
    }

    getTargets() {
        if (!this.actor.memory.target_id && Game.flags[this.actor.room.name + '_resting']) {
            return [Game.flags[this.actor.room.name + '_resting']];
        }
    }

    perform() {
        super.perform();
        return false;
    }

}
CreepActions['Rest'] = RestAction;