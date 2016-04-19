/// <reference path="../vars/Globals.ts" />
/// <reference path="BaseAction.ts" />
/// <reference path="FightAction.ts" />
"use strict";
class AttackAction extends FightAction {
    public actor;
    public target;
    public action_name = 'Attack';//formerly "assaulting"

    constructor(actor) {
        super(actor);
    }

    
    //This isn't working: It stops ranged attack creeps from finding a target...
    // getTargetRange(){
    //     return 3;
    // }

    getTargets() {
        var target;// = Game.getObjectById('56ff84af595eb14a422bc4d8');
        let targets = [];
        if (target) targets = [target];
        if (!targets.length) {
            targets = this.actor.room.find(FIND_HOSTILE_CREEPS, {
                filter: function(obj) {
                    let structure = <Structure>obj.pos.lookFor('structure');
                    return !(structure && structure.structureType == STRUCTURE_RAMPART);
                }
            });
            // console.log(targets);
        }

        // if (!targets.length){
        //     let ramparts = <Creep[]>this.actor.pos.findInRange(FIND_MY_STRUCTURES, 3, {
        //         filter: function(obj) {
        //             return obj.structureType == STRUCTURE_RAMPART;
        //         }
        //     });
        //     if (ramparts.length) {
        //         this.move(ramparts[0]);
        //     }
        // }

        // if (!targets) {
        //     targets = this.actor.room.find(FIND_HOSTILE_SPAWNS, {

        //     });
        // }
        // if (!targets) {
        //     targets = this.actor.room.find(FIND_HOSTILE_STRUCTURES, {
        //         filter: function(obj) {
        //             return obj.structureType == STRUCTURE_TOWER && obj.structureType != STRUCTURE_CONTROLLER;
        //         }
        //     });
        // }
        // if (!targets) {
        //     targets = this.actor.room.find(FIND_HOSTILE_STRUCTURES, {
        //         filter: function(obj) {
        //             return obj.structureType != STRUCTURE_RAMPART && obj.structureType != STRUCTURE_CONTROLLER;
        //         }
        //     });
        // }
        // if (!targets) {
        //     targets = this.actor.room.find(FIND_HOSTILE_STRUCTURES, {
        //         filter: function(obj) {
        //             return obj.structureType != STRUCTURE_CONTROLLER;
        //         }
        //     });
        // }
        return targets;
    }

    move(_target?) {
        if (_target) {
            return this.actor.moveTo(_target);
        }

        let target = _target || this.target;

        // Might implement some kind of flocking: https://en.wikipedia.org/wiki/Flocking_(behavior)

        //     let ramparts = <Creep[]>this.actor.pos.findInRange(FIND_MY_STRUCTURES, 3, {
        //         filter: function(obj) {
        //             return obj.structureType == STRUCTURE_RAMPART;
        //         }
        //     });
        //     if (ramparts.length) {
        //         target = ramparst[0];
        //     }
        
        if (target && this.actor && !this.actor.pos.inRangeTo(target, this.getTargetRange(target))) {
            let move = this.actor.moveTo(target);
            // console.log(move);
            return move;
        }
        return;

        // let path;
        // if (!this.actor.memory.target_path) {
        //     path = this.actor.pos.findPathTo(target);
        //     this.actor.memory.target_path = Room.serializePath(path);
        // } else {
        //     path = Room.deserializePath(this.actor.memory.target_path);
        // }

        // let move = this.actor.moveByPath(path);
        // if (move == ERR_NOT_FOUND) {
        //     var new_path = this.actor.pos.findPathTo(target);
        //     this.actor.memory.target_path = Room.serializePath(new_path);
        //     move = this.actor.moveByPath(path);
        // }
    }
}
CreepActions['Attack'] = AttackAction;