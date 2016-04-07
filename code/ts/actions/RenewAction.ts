/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseAction.ts" />
"use strict";
class RenewAction extends BaseAction {
    public actor;
    public target;
    public action_name = 'Renew';

    constructor(actor) {
        super(actor);
    }

    getTargets() {
        let targets = this.actor.room.find(FIND_MY_STRUCTURES, {
            filter: function(obj) {
                return (
                    obj.structureType == STRUCTURE_SPAWN
                );
            }
        });
        // if (targets.length) {
        //     console.log('Renewing ' + this.actor.memory.role + ' creep ' + this.actor.name);
        // }
        return targets;
    }

    perform() {
        if (this.actor.ticksToLive < 1400) {
            if (this.actor.carry.energy > 0) {
                let action = this.actor.transfer(this.target, RESOURCE_ENERGY);
                if (action != 0) {
                    this.move();
                }
            } else {
                this.move();
            }
            // let action = target.renewCreep(creep);
            // if (action == ERR_NOT_IN_RANGE) {
            //     this.move();
            // } else if (action == ERR_BUSY) {//The spawn is busy
            //     //just wait
            // } else if (action != 0) {
            //     console.log('renewing error:', action);
            // return false;
            // }
            return true;
        } else {
            return false;
        }
    }

}