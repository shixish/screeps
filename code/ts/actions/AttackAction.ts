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

    getTargets() {
        var target = Game.getObjectById('56ff84af595eb14a422bc4d8');
        let targets;
        if (!target) {
            targets = this.actor.room.find(FIND_HOSTILE_CREEPS, {
                filter: function(obj) {
                    let structure = <Structure>obj.pos.lookFor('structure');
                    return !(structure && structure.structureType == STRUCTURE_RAMPART);
                }
            });
        }
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

}
CreepActions['Attack'] = AttackAction;