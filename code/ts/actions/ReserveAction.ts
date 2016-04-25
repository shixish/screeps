/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseAction.ts" />
"use strict";
class ReserveAction extends BaseAction {
    public actor;
    public target;
    public action_name = 'Reserve';
    protected min_ticks = 15000;

    constructor(actor) {
        super(actor);
    }

    getTargets() {
        if (this.actor.getActiveBodyparts(CLAIM) > 0) {
            return this.actor.room.find(FIND_STRUCTURES, {
                filter: obj => (
                    obj.structureType == STRUCTURE_CONTROLLER &&
                    (
                        (!obj.owner || obj.owner.username != Globals.USERNAME) ||
                        (<Controller>obj).ticksToDowngrade < this.min_ticks
                    )
                )
            });
            // .reservation.username
        }
    }

    perform() {
        super.perform();
        let controller_is_mine = (<Controller>this.target).owner && (<Controller>this.target).owner.username == Globals.USERNAME;
        if (controller_is_mine || (<Controller>this.target).ticksToDowngrade > this.min_ticks) {
            return false;
        } else {
            // let action = this.actor.ReserveController(this.target);
            let action = this.actor.reserveController(this.target);
            // console.log('Reserveing', action);
            if (action == ERR_NOT_IN_RANGE) {
                this.move();
            }else if (action == ERR_GCL_NOT_ENOUGH) {
                action = this.actor.reserveController(this.target);
                if (action == ERR_NOT_IN_RANGE) {
                    // this.move(); //should already be handled
                }else if (action != 0) {
                    console.log('reserveController error:', action);
                    return false;
                }
            } else if (action != 0) {
                console.log('reserveController error:', action);
                return false;
            }
            return true;
        }
    }

}
CreepActions['Reserve'] = ReserveAction;