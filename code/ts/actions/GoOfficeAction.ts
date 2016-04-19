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
        if (this.actor.memory.flag && this.actor.memory.office) {
            // BaseAction.getExit(this.actor.room, this.actor.memory.office);
             // && this.actor.room.name != this.actor.memory.office
            let flag = Game.flags[this.actor.memory.flag];
            if (flag && (this.actor.room.name != flag.pos.roomName || flag.memory.hold)) {
                return [flag];
            }
        }
    }

    perform() {
        let x = this.actor.pos.x, y = this.actor.pos.y;
        // console.log(this.target.memory.hold);
        if (this.actor.room.name != this.actor.memory.office || (this.target.memory && this.target.memory.hold)) {
            this.move();
        } else {
            if (x == 0 || y == 0 || x == 49 || y == 49){//get out of the door, or it'll just go back and forth
                this.move();
            }else{
                return false;
            }
        }
    }

}
CreepActions['GoOffice'] = GoOfficeAction;