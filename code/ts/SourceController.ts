/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
"use strict";
var Globals = require('Globals'),
    Inventory = require('Inventory'),
    HarvesterCreep = require('HarvesterCreep');

declare var module: any;
(module).exports = class SourceController {
    source: Source;
    link: Link;

    constructor(source_id) {
        this.source = <Source>Game.getObjectById(source_id);
        if (!this.source) {
            console.log('Unable to find Source with ID', source_id);
            throw "Invalid Object ID";
        }
        var memory = this.source.room.memory.source[this.source.id];
        // console.log(this.source.room.memory.source[this.source.id].link);
        if (!memory.link) {
            var links = <Link[]>this.source.pos.findInRange(FIND_MY_STRUCTURES, 3, {
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
        // this.source.room.name;
        // var linkers = Inventory.creeps_by_role('linker');
        // for (var l in linkers) {
        //     console.log(linkers[l]);
        // }

        if (this.link){
            // console.log(Object.keys(this.source.room.memory.storage));
            // this.source.room.memory.storage[]
            var storage = <Storage>this.source.pos.findClosestByRange(FIND_MY_STRUCTURES, {
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