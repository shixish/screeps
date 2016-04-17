/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseAction.ts" />
"use strict";
class GoOfficeAction extends BaseAction {
    public actor;
    public target;
    public action_name = 'GoOffice';

    constructor(actor) {
        super(actor);
    }

    getTargets() {
        if (this.actor.memory.flag && this.actor.memory.office && this.actor.room.name != this.actor.memory.office) {
            // BaseAction.getExit(this.actor.room, this.actor.memory.office);
            let flag = Game.flags[this.actor.memory.flag];
            if (flag && this.actor.room.name != flag.pos.roomName) {
                return [flag];
            }
        }
    }

    perform() {
        if (this.actor.room.name != this.actor.memory.office) {
            this.move();
        } else {
            return false;
        }
    }

}
CreepActions['GoOffice'] = GoOfficeAction;