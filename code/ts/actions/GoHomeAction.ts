/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseAction.ts" />
"use strict";
class GoHomeAction extends BaseAction {
    public actor;
    public target;
    public action_name = 'GoHome';

    constructor(actor) {
        super(actor);
    }

    getTargets() {
        if (this.actor.memory.office) {
            let flag = Game.flags[this.actor.memory.office];
            if (flag && this.actor.room.name != flag.pos.roomName) {
                return [flag];
            }
        }
    }

}
CreepActions['GoHome'] = GoHomeAction;