/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
var Globals = require('Globals'),
    Inventory = require('Inventory'),
    HarvesterCreep = require('HarvesterCreep');

declare var module: any;
(module).exports = class MineralController {
    mineral: Mineral;
    link: Link;

    constructor(mineral_id) {
        this.mineral = <Mineral>Game.getObjectById(mineral_id);
        if (!this.mineral) {
            console.log('Unable to find Mineral with ID', mineral_id);
            throw "Invalid Object ID";
        }
        var memory = this.mineral.room.memory.mineral[this.mineral.id];
        // console.log(this.mineral.room.memory.mineral[this.mineral.id].link);
        if (!memory.link) {
            var links = <Link[]>this.mineral.pos.findInRange(FIND_MY_STRUCTURES, 3, {
                filter: function(obj) {
                    return obj.structureType == STRUCTURE_LINK;
                }
            });
            if (links.length) {
                var link = links.pop();
                memory.link = link.id;
                this.link = link;
            }
        } else { 
            this.link = <Link>Game.getObjectById(memory.link);
        }
        this.work();
    }

    work() {
        // this.mineral.room.name;
        // var linkers = Inventory.creeps_by_role('linker');
        // for (var l in linkers) {
        //     console.log(linkers[l]);
        // }

        if (this.link){
            // console.log(Object.keys(this.mineral.room.memory.storage));
            // this.mineral.room.memory.storage[]
            var storage = <Storage>this.mineral.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: function(obj) {
                    return obj.structureType == STRUCTURE_STORAGE;
                }
            });
            var links = <Link[]>storage.pos.findInRange(FIND_MY_STRUCTURES, 3, {
                filter: function(obj) {
                    return obj.structureType == STRUCTURE_LINK;
                }
            });
            if (links.length) {
                var foreign_link = links.pop();
                this.link.transferEnergy(foreign_link)
            }
        }
    }
}