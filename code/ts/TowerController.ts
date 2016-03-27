/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
var Globals = require('Globals'),
    Inventory = require('Inventory');

declare var module: any;
(module).exports = class TowerController {
    structure: Tower;

    constructor(structure_id) {
        this.structure = <Tower>Game.getObjectById(structure_id);
        if (!this.structure) {
            console.log('Unable to find Tower with ID', structure_id);
            throw "Invalid Object ID";
        }
        this.work();
    }

    work(){
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
                        filter: function(obj){
                            // if (obj.structureType == STRUCTURE_ROAD){
                            //     console.log(obj.hits, obj.hitsMax, obj.hitsMax*3/4);
                            // }
                            return (
                                (
                                    obj.structureType == STRUCTURE_ROAD || 
                                    obj.structureType == STRUCTURE_WALL || 
                                    (obj.owner && obj.owner.username == Globals.USERNAME)
                                )&& obj.hits < obj.hitsMax && obj.hits < Globals.MAX_HITS_REPAIR
                            );
                        }
                    });
                    if (target){
                        var action = this.structure.repair(target);
                    }
                }
            }
        }
    }
}