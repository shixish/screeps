/// <reference path="../vars/Globals.ts" />
/// <reference path="../creeps/BaseCreep.ts" />
"use strict";

class LinkerCreep extends BaseCreep {
    public creep: Creep;
    public storage: Storage;
    public link: Link;

    constructor(creep: Creep) {
        super(creep);
        var creep_name = this.creep.name;
        if (!creep.memory.storage) {
            // console.log(creep.room.memory.structures.storage);
            for (var s in creep.room.memory.structures.storage) {
                // creep.room.memory.structures.storage[s].linker = null;
                creep.room.memory.structures.storage[s].linker
                var linker_name = creep.room.memory.structures.storage[s].linker;
                if (!linker_name || (linker_name && (!Game.creeps[linker_name] || linker_name == creep_name))) {
                    creep.room.memory.structures.storage[s].linker = creep_name;
                    this.creep.memory.storage = s;
                    break;
                }
            }
        }
        this.storage = <Storage>Game.getObjectById(creep.memory.storage);
        if (this.storage) {
            if (!this.creep.memory.link) {
                var links = <Link[]>this.storage.pos.findInRange(FIND_MY_STRUCTURES, 3, {
                    filter: function(obj) {
                        return obj.structureType == STRUCTURE_LINK;
                    }
                });
                if (links.length) {
                    var link = links.pop();
                    this.creep.memory.link = link.id;
                    this.link = link;
                }
            } else {
                this.link = <Link>Game.getObjectById(this.creep.memory.link);
            }
        }
    }

    retarget() {
        super.retarget();
        // if (this.creep.carry.energy > 0) {
        //     if (!super.try_targeting('transferring')) {

        //     }
        // } else {
        //     if (!super.try_targeting('picking')) {
        //         if (!super.try_targeting('energizing')) {

        //         }
        //     }
        // }

        if (this.creep.carry.energy > 0) {
            this.creep.memory.target_id = this.storage.id;
            this.creep.memory.action_name = 'transferring';
        } else {
            this.creep.memory.target_id = this.link.id;
            this.creep.memory.action_name = 'energizing';
        }
    }

    // work() {
    //     var target = Game.getObjectById(this.creep.memory.target_id),
    //         action_name = this.creep.memory.action_name,
    //         action_function = this[action_name];

    //     // this.creep.say(action_name);
    //     // console.log(action_name, target);
    //     if (!target || !action_function) {
    //         this.retarget();
    //     }

    //     if (target && action_function) {
    //         action_function.apply(this, [target]);
    //     }
    // }

    static create(budget: number) {
        if (budget >= 50 + 50 * 8)
            return [
                MOVE,
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
            ];
        else
            return [MOVE, CARRY, CARRY, CARRY, CARRY, CARRY];
    }

}