/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
"use strict";
// let _ = require('lodash'),
var Globals = require('Globals'),
    CourierCreep = require('CourierCreep'),
    HarvesterCreep = require('HarvesterCreep'),
    MinerCreep = require('MinerCreep'),
    LinkerCreep = require('LinkerCreep'),
    BuilderCreep = require('BuilderCreep'),
    GuardCreep = require('GuardCreep'),
    RangerCreep = require('RangerCreep'),
    RunnerCreep = require('RunnerCreep'),
    TowerController = require('TowerController'),
    SpawnController = require('SpawnController'),
    SourceController = require('SourceController'),
    Inventory = require('Inventory');
    // Harvester = require('harvester'),
    // Guard = require('guard'),
    // Builder = require('builder'),
    // Spawn = require('spawn');

// var USERNAME = 'ShiXish',
//     MIN_TICKS_TO_LIVE = 200,
//     MAX_UNITS_METRIC = 3,
//     MAX_HITS_REPAIR = 200000;

// interface Room {
//     storeSources();
//     sources();
// }

// Room.prototype.storeSources = function() {
//     let sources = this.find(FIND_SOURCES);
//     this.memory.sources = {};
//     for (let s in sources) {
//         let source = sources[s];
//         this.memory.sources[source.id] = {};
//         // console.log(source.id);
//     }
// }

// Room.prototype.sources = function() {
//     if (!this.memory.sources) this.storeSources();
//     // let sources = [];
//     // for (let s in this.memory.sources){
//     //     let source_id = this.memory.sources[s];
//     //     sources.push(Game.getObjectById(source_id));
//     // }
//     // return sources;
//     return this.memory.sources;
// }

declare var module: any;
let structure_controllers = {
    'tower': TowerController,
    'spawn': SpawnController,
};

let creep_controllers = {
    'courier': CourierCreep,
    'harvester': HarvesterCreep,
    'miner': MinerCreep,
    'linker': LinkerCreep,
    'builder': BuilderCreep,
    'guard': GuardCreep,
    'ranger': RangerCreep,
    'runner': RunnerCreep,
};

function run_structure(type:string, structure: Structure) {
    if (structure_controllers[type]) {
        let fn = structure_controllers[type];
        // console.log(type, fn)
    }
}

(module).exports.loop = function () {
    Inventory.update();

    for (let r in Game.rooms){
        let room = <Room>Game.rooms[r];
        let memory = Memory.rooms[room.name];

        if (memory.structures) {
            for (let type in memory.structures) {
                if (structure_controllers[type]) {
                    let structures = memory.structures[type];
                    let StructureController = structure_controllers[type];
                    for (let id in structures) {
                        try {
                            let controller = new StructureController(id);
                        } catch (e) {
                            if (e === "Invalid Object ID") {
                                delete memory.structures[type][id];
                            }else{
                                console.log(e);
                            }
                        }
                    }
                }
            }
        }

        if (memory.source) {
            for (let t in memory.source) {
                try {
                    let source = new SourceController(t);
                } catch (e) {
                    // if (e === "Invalid Object ID") {
                    //     delete memory.source[t];
                    // } else {
                    //     console.log(e);
                    // }
                }
            }
        }
    }
    
    for(let c in Game.creeps) {
       // console.log(c);
        let creep = Game.creeps[c];
        // Cache.add(creep);

        
        // console.log(courier.work);
        // courier.work();
        if (creep_controllers[creep.memory.role]) {
            let CreepController = creep_controllers[creep.memory.role];
            let ctrl = new CreepController(creep);
            ctrl.work();
        }else {
            console.log("Unknown creep role:", creep);
        }

        /*
        if (creep.memory.role == 'courier') {
            let courier = new CourierCreep(creep);
            courier.work();
        } else if(creep.memory.role == 'linker') {
            let linker = new LinkerCreep(creep);
            linker.work();
        } else if (creep.memory.role == 'harvester') {
            let harvester = new HarvesterCreep(creep);
            harvester.work();
        } else if (creep.memory.role == 'miner') {
            let miner = new MinerCreep(creep);
            miner.work();
        } else if (creep.memory.role == 'builder') {
            let builder = new BuilderCreep(creep);
            builder.work();
        } else if (creep.memory.role == 'guard') {
            let guard = new GuardCreep(creep);
            guard.work();
        } else if (creep.memory.role == 'ranger') {
            let ranger = new RangerCreep(creep);
            ranger.work();
        } else if (creep.memory.role == 'runner') {
            let runner = new RunnerCreep(creep);
            runner.work();
        } 
        */
    }
}