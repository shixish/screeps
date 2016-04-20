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
        if (this.actor.memory.home && this.actor.room.name != this.actor.memory.home) {
            // let exit = BaseAction.getExit(this.actor.room, this.actor.memory.home);
            // console.log(exit);
            
            let flag = Game.flags[this.actor.memory.home + '_Rest'];
            if (flag && this.actor.room.name != flag.pos.roomName) {
                return [flag];
            }
        }
    }

    perform() {
        if (this.actor.room.name != this.actor.memory.home) {
            this.move();
        } else {
            return false;
        }
    }
}
CreepActions['GoHome'] = GoHomeAction;