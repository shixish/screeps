/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseAction.ts" />
"use strict";
class ClaimAction extends BaseAction {
    public actor;
    public target;
    public action_name = 'Claim';

    constructor(actor) {
        super(actor);
    }

    getTargets() {
        if (this.actor.getActiveBodyparts(CLAIM) > 0) {
            return this.actor.room.find(FIND_STRUCTURES, {
                filter: function(obj) {
                    return obj.structureType == STRUCTURE_CONTROLLER && (!obj.owner || obj.owner.username != Globals.USERNAME)
                }
            });
        }
    }

    perform() {
        super.perform();

        if ((<Controller>this.target).owner && (<Controller>this.target).owner.username == Globals.USERNAME) {
            return false;
        } else {
            let action = this.actor.claimController(this.target);
            // console.log('claiming', action);
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
                console.log('claimController error:', action);
                return false;
            }
            return true;
        }
    }

}
CreepActions['Claim'] = ClaimAction;