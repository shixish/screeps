/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseAction.ts" />
/// <reference path="UpgradeAction.ts" />
"use strict";
class SustainAction extends UpgradeAction {
    public actor;
    public target;
    public action_name = 'Sustain';

    constructor(actor) {
        super(actor);
    }

    getTargets() {
        if (this.actor.room.controller && this.actor.room.controller.ticksToDowngrade < 30000) {
            return [this.actor.room.controller];
        }
    }

    perform() {
        if (this.target.ticksToDowngrade > 30000) { //don't bother with the controller once it's timer is reset
            return false;
        } else {
            return super.perform();
        }
    }
}
CreepActions['Sustain'] = SustainAction;