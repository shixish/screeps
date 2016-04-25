/// <reference path="../vars/Globals.ts" />
/// <reference path="../utils/Inventory.ts" />
/// <reference path="../creeps/HarvesterCreep.ts" />
"use strict";

class SourceController {
    public source: Source;
    public link: Link;
    public container: Container;

    constructor(source_id) {
        this.source = <Source>Game.getObjectById(source_id);
        if (!this.source) {
            console.log('Unable to find Source with ID', source_id);
            throw "Invalid Object ID";
        }
        var memory = this.source.room.memory.source[this.source.id];
        // console.log(this.source.room.memory.source[this.source.id].link);

        //Sometimes structures die, look if the thing still exists.
        if (memory.link) { 
            this.link = <Link>Game.getObjectById(memory.link);
            if (!this.link) delete memory.link;
        }

        if (memory.container) {
            this.container = <Container>Game.getObjectById(memory.container);
            if (!this.container) delete memory.container;
        }
        
        if (!memory.container && !memory.link) {
            //cant use FIND_MY_STRUCTURES to find containers
            var structures = <Structure[]>this.source.pos.findInRange(FIND_STRUCTURES, 3, {
                filter: function(obj) {
                    return obj.structureType == STRUCTURE_LINK || obj.structureType == STRUCTURE_CONTAINER;
                }
            });
            for (let s in structures) {
                let structure = structures[s];
                if (structure.structureType == STRUCTURE_LINK) {
                    memory.link = structure.id;
                    this.link = <Link>structure;
                } else { 
                    memory.container = structure.id;
                    this.container = <Container>structure;
                }
            }
        }

        // if (memory.container) {
        //     this.container = <Container>Game.getObjectById(memory.container);
        // }
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