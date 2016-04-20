/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseAction.ts" />
"use strict";
class StoreAction extends BaseAction {
    public actor;
    public target;
    public action_name = 'Store';

    constructor(actor) {
        super(actor);
    }

    getTargets() {
        // let storage = <Storage>Game.getObjectById(room.memory['structures']['storage'][0]);
        // if (_.sum(storage.store) - storage.store[RESOURCE_ENERGY] < storage.storeCapacity * Globals.MAX_MINERALS_IN_STORE) {
        //    
        // }
        //notice: can't use "my" structures to find containers, as they are neutral...
        let targets = this.actor.room.find(FIND_STRUCTURES, {
            filter: function(obj) {
                if (obj.structureType == STRUCTURE_STORAGE || obj.structureType == STRUCTURE_CONTAINER) {
                    let fullness = _.sum(obj.store);
                    return fullness < obj.storeCapacity; //needs to not be totally full
                }
                return false;
            }
        });
        return targets;
    }

    //This works for energy and minerals
    perform() {
        super.perform();

        let total_carrying = _.sum(this.actor.carry);
        if (total_carrying == 0) {
            // this.actor.say('Stored');
            return false;
        } else {
            let transferring, transfer_type;
            let capacity = (<Storage>this.target).storeCapacity, fullness = _.sum((<Storage>this.target).store);
            let empty_space = capacity - fullness;
            for (let t in this.actor.carry) {
                let amount = this.actor.carry[t];
                if (amount > 0) {
                    amount = Math.min(empty_space, amount);
                    if (amount > 0) {
                        transferring = amount;
                        transfer_type = t;
                        break;
                    }
                }
            }
            ////This makes the creeps get stuck trying to get rid of their minerals:
            // if (transfer_type != RESOURCE_ENERGY && this.target.store[transfer_type] >= capacity * Globals.MAX_MINERALS_IN_STORE) {
            //     //don't overfill the storage...
            //     return false;
            // }
            if (transferring > 0) {
                let action = this.actor.transfer(this.target, transfer_type, transferring);
                // if (transfer_type != RESOURCE_ENERGY)
                //     console.log(this.actor.name + ' transferring ' + transferring + ' ' + transfer_type + ' to ' + this.target);
                if (action == ERR_NOT_IN_RANGE) {
                    this.move();
                } else if (action != 0) {
                    console.log('storing error:', action);
                    // return false;
                }
            } else {
                return false;
            }
            return true;
        }
    }

}
CreepActions['Store'] = StoreAction;