/// <reference path="../vars/Globals.ts" />
/// <reference path="../creeps/BaseCreep.ts" />
"use strict";

class HarvesterCreep extends BaseCreep {
    public creep: Creep;
    public source: Source;
    public link: Link;
    public container: Container;

    constructor(creep: Creep) {
        super(creep);
        var creep_name = this.creep.name;
        // console.log(creep_name, this.creep.memory.source, creep.room.memory.source[this.creep.memory.source].harvester);
        if (!creep.memory.source) {
            // console.log(creep.room.memory.source);
            for (var s in creep.room.memory.source) {
                // creep.room.memory.source[s].harvester = null;
                creep.room.memory.source[s].harvester
                var harvester_name = creep.room.memory.source[s].harvester;
                if (!harvester_name || (harvester_name && (!Game.creeps[harvester_name] || harvester_name == creep_name))) {
                    creep.room.memory.source[s].harvester = creep_name;
                    this.creep.memory.source = s;
                    break;
                }
            }
        }
        this.source = <Source>Game.getObjectById(creep.memory.source);
        // this.source.pos.findClosestByRange(FIND_MY_STRUCTURES, {
        //     filter: function(obj) {
        //         return obj.structureType == STRUCTURE_LINK;
        //     }
        // });
        // var source_memory = this.source.room.memory.source[this.source.id];
        // if (source_memory.link) {
        //     this.link = <Link>Game.getObjectById(source_memory.link);
        // }
        // console.log(this.link);
    }

    retarget() {
        super.retarget();
        if (!this.source) {//creep got screwed up somehow. Just make it into a generic builder class...
            // console.log(this.creep);
            this.creep.memory.role = "builder";
            this.creep.memory.target_id = this.creep.memory.action_name = null;
            return;
        }
        if (this.creep.carry.energy > 0) {
            var source_memory = this.source.room.memory.source[this.source.id];
            // if (source_memory.link) {
            //     this.link = <Link>Game.getObjectById(source_memory.link);
            // }
            if (source_memory.link) {
                this.creep.memory.target_id = source_memory.link;
                this.creep.memory.action_name = 'transferring';
            } else {
                if (!super.try_targeting('transferring')) { //Behave as a more generic creep if still in low infrastructure
                    if (!super.try_targeting('storing')) {
                        if (!super.try_targeting('building')) {
                            if (!super.try_targeting('upgrading')) {

                            }
                        }
                    }
                }
            }
        } else {
            this.creep.memory.target_id = this.source.id;
            this.creep.memory.action_name = 'harvesting';
        }
    }

    // work(is_retry) {
    //     var target = Game.getObjectById(this.creep.memory.target_id),
    //         action_name = this.creep.memory.action_name,
    //         action_function = this[action_name];

    //     this.creep.say(action_name);
    //     if (!this.creep.memory.obsolete && action_name !== "renewing" && this.creep.ticksToLive < Globals.MIN_TICKS_TO_LIVE) {
    //         target = this.creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
    //             filter: function(obj) {
    //                 return (
    //                     obj.structureType == STRUCTURE_SPAWN
    //                 );
    //             }
    //         });
    //         if (target) {
    //             action_function = this['renewing'];
    //             this.creep.memory.target_id = target.id;
    //             this.creep.memory.action_name = 'renewing';
    //             console.log('Renewing ' + this.creep.memory.role + ' creep ' + this.creep.name);
    //         } else {
    //             console.log('cannot renew. spawn is busy...');
    //         }
    //     }else if (!target || !action_function) {
    //         this.retarget();
    //     }
    //     // console.log(action_name, target, action_function);
    //     if (target && action_function) {
    //         if (!action_function.apply(this, [target]) && !is_retry) {
    //             //if not, try again. but only once.
    //             this.retarget();
    //             this.work(true);
    //         }
    //     }
    // }

    // work() {
    //     if (this.creep.carry.energy == this.creep.carryCapacity) {
    //         super.transferring(this.link);
    //     }
    //     super.harvesting(this.source);
    // }

    static create(budget: number) {
        if (budget >= 50 + 100*6 + 50*6) //950
            return [ //Linker creep
                MOVE,
                WORK, WORK, WORK, WORK, WORK, WORK,
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
            ];
        else if (budget >= 50*4 + 100*4 + 50*4) //800
            return [ //Walk Miner
                CARRY, CARRY, CARRY, CARRY,
                WORK, WORK, WORK, WORK,
                MOVE, MOVE, MOVE, MOVE,
            ];
        else if (budget >= 50*4 + 100*2 + 50*2) //500
            return [ //Walk Miner
                CARRY, CARRY, CARRY, CARRY, 
                WORK, WORK,
                MOVE, MOVE,
            ];
        else //Walk Miner
            return [
                CARRY,
                WORK, WORK,
                MOVE,
            ];
    }

}