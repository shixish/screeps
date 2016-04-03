/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
/// <reference path="Globals.ts" />
/// <reference path="Inventory.ts" />
"use strict";

class TowerController {
    private structure: Tower;
    private max_repair_tiers = {
        3: 25000,//tower at 3
        4: 50000,
        5: 250000,
        6: 500000,
        7: 1000000,
        8: 1500000,
    };
    private max_repair;

    constructor(structure_id) {
        this.structure = <Tower>Game.getObjectById(structure_id);
        if (!this.structure) {
            console.log('Unable to find Tower with ID', structure_id);
            throw "Invalid Object ID";
        }
        let control_level = this.structure.room.controller.level;
        this.max_repair = this.max_repair_tiers[control_level];
        // console.log(this.structure.room, this.structure);
        this.work();
    }

    work(){
        let _this = this;
        var target;
        if (this.structure.energy > 0){
            target = this.structure.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (target){
                var action = this.structure.attack(target);
            }else{
                target = this.structure.pos.findClosestByRange(FIND_MY_CREEPS, {
                    filter: function(obj){
                        return obj.hits < obj.hitsMax
                    }
                });
                if (target){
                    var action = this.structure.heal(target);
                }else{
                    target = this.structure.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: obj =>(
                            (
                                obj.structureType == STRUCTURE_ROAD || 
                                obj.structureType == STRUCTURE_WALL || 
                                (obj.owner && obj.owner.username == Globals.USERNAME)
                            ) && obj.hits < obj.hitsMax && obj.hits < _this.max_repair //Globals.MAX_HITS_REPAIR
                        ),
                    });
                    if (target){
                        var action = this.structure.repair(target);
                    }
                }
            }
        }
    }
}