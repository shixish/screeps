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
(module).exports.loop = function () {
    Inventory.update();

    for (let r in Game.rooms){
        let room = <Room>Game.rooms[r];
        let memory = Memory.rooms[room.name];

        if (memory.tower) {
            for (let t in memory.tower) {
                // let t_obj = memory.tower[t];
                try {
                    let tower = new TowerController(t);
                } catch (e) {
                    if (e === "Invalid Object ID") {
                        // console.log('remove tower with id:', t);
                        // delete t_obj; //Doesn't work
                        delete memory.tower[t];
                    }else{
                        console.log(e);
                    }
                }
            }
        }


        if (memory.spawn) {
            for (let t in memory.spawn) {
                try {
                    let spawn = new SpawnController(t);
                } catch (e) {
                    if (e === "Invalid Object ID") {
                        // console.log('remove spawn with id:', t);
                        // delete t_obj; //Doesn't work
                        delete memory.spawn[t];
                    } else {
                        console.log(e);
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
        } else if (creep.memory.role == 'runner') {
            let runner = new RunnerCreep(creep);
            runner.work();
        } else {
            console.log("Unknown creep role:", creep);
        }
    }
}