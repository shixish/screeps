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
        if (!this.actor.memory.target_id) { //if nothing else
            let flag_name = this.actor.room.name + '_Rest',
                flag = Game.flags[flag_name];

            if (!flag) {
                this.actor.room.createFlag(this.actor.room.controller, flag_name);
                flag = Game.flags[flag_name];
            }
            if (flag) {
                return [Game.flags[flag_name]];
            }
        }
    }

    perform() {
        super.perform();
        return false;
    }

}
CreepActions['Rest'] = RestAction;