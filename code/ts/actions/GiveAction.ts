/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseAction.ts" />
"use strict";
class GiveAction extends BaseAction {
    public actor;
    public target;
    public action_name = 'Give';//formerly "transferring"

    constructor(actor) {
        super(actor);
    }

    getTargets() {
        let targets = [];
        if (this.actor.room.memory.under_attack) {
            let towerdiag = debug.diag('STRUCTURE_TOWER');
            targets = this.actor.room.find(FIND_MY_STRUCTURES, {
                filter: obj => {
                    return obj.structureType == STRUCTURE_TOWER;
                }
            });
            towerdiag.log();
        }
        if (!targets.length) {
            targets = this.actor.room.find(FIND_MY_STRUCTURES, {
                filter: function(obj) {
                    return (
                        (
                            obj.structureType == STRUCTURE_SPAWN ||
                            obj.structureType == STRUCTURE_EXTENSION
                        )
                        && obj.energy < obj.energyCapacity
                    );
                }
            });
        }
        if (!targets.length) {
            targets = this.actor.room.find(FIND_MY_STRUCTURES, {
                filter: function(obj) {
                    return (
                        (
                            (
                                obj.structureType == STRUCTURE_TOWER ||
                                obj.structureType == STRUCTURE_LAB
                            )
                            && obj.energy < obj.energyCapacity
                        ) || (
                            obj.structureType == STRUCTURE_TERMINAL
                            && obj.store.energy < obj.storeCapacity * 0.1
                        )
                    );
                }
            });
        }
        return targets;
    }

    //This only transfers energy, not minerals
    perform() {
        super.perform();

        if (this.actor.carry.energy == 0) {
            return false;
        } else {
            let transferring;
            if ((<Storage>this.target).store) {
                transferring = Math.min(this.target.storeCapacity - _.sum(this.target.store), this.actor.carry.energy);
            } else {
                transferring = Math.min(this.target.energyCapacity - this.target.energy, this.actor.carry.energy);
            }
            if (transferring > 0) {
                let action = this.actor.transfer(this.target, RESOURCE_ENERGY, transferring);
                if (action == ERR_NOT_IN_RANGE) {
                    this.move();
                } else if (action != 0) {
                    console.log('Give action error:', action, "trying to give:", transferring, 'to:', this.target);
                    // return false;
                }
            } else {
                return false;
            }
            return true;
        }
    }

}
CreepActions['Give'] = GiveAction;