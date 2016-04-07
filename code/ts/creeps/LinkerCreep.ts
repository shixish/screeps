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
            if (creep.room.memory.structures.storage.length) {
                this.creep.memory.storage = creep.room.memory.structures.storage[0];//there can only be one storage tank.
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
        if (this.creep.carry.energy > 0) {
            super.set_target(this.storage, 'Give');
        } else {
            super.set_target(this.link, 'Take');
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

    // static create(budget: number) {
    //     if (budget >= 50 + 50 * 8)
    //         return [
    //             MOVE,
    //             CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
    //         ];
    //     else
    //         return [MOVE, CARRY, CARRY, CARRY, CARRY, CARRY];
    // }

    static creep_tiers = [
        {
            'cost': 50 * 8 + 50,
            'body': [
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                MOVE,
            ],
        },
        {
            'cost': 300,
            'body': [
                CARRY, CARRY, CARRY, CARRY, CARRY,
                MOVE,
            ],
        },
    ];
}
CreepControllers['Linker'] = LinkerCreep;