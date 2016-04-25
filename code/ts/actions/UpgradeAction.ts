/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseAction.ts" />
"use strict";
class UpgradeAction extends BaseAction {
    public actor;
    public target;
    public action_name = 'Upgrade';

    constructor(actor) {
        super(actor);
    }

    getTargets() {
        //notice: this.actor.room.controller.progress starts out undefined...
        // if (this.actor.room.controller && (!this.actor.room.controller.progress || this.actor.room.controller.progress < this.actor.room.controller.progressTotal || this.actor.room.controller.ticksToDowngrade < 80000)) {
        if (this.actor.room.controller && this.actor.room.controller.owner && this.actor.room.controller.owner.username == Globals.USERNAME) {
            return [this.actor.room.controller];
        }
    }

    perform() {
        super.perform();

        if (this.actor.carry.energy == 0) {//end condition:
            // this.actor.say('Built');
            return false;
        } else {
            let action = this.actor.upgradeController(this.target);
            if (action == ERR_NOT_IN_RANGE) {
                this.move();
            } else if (action == ERR_BUSY) {//The creep is still being spawned.
                //just wait
            }else if (action == ERR_INVALID_TARGET){
                console.log('upgrading invalid target:', this.target, this.actor.name, this.actor.room.name);
                return false;
            } else if (action != 0) {
                console.log('upgrading error:', action, this.actor.name, this.actor.room.name);
                return false;
            }
            return true;
        }
    }

}
CreepActions['Upgrade'] = UpgradeAction;