/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
"use strict";
// let _ = require('lodash'),
var Globals = require('Globals'),
    CreepController = require('CreepController'),
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

interface Room {
    storeSources();
    sources();
}

Room.prototype.storeSources = function() {
    let sources = this.find(FIND_SOURCES);
    this.memory.sources = {};
    for (let s in sources) {
        let source = sources[s];
        this.memory.sources[source.id] = {};
        // console.log(source.id);
    }
}

Room.prototype.sources = function() {
    if (!this.memory.sources) this.storeSources();
    // let sources = [];
    // for (let s in this.memory.sources){
    //     let source_id = this.memory.sources[s];
    //     sources.push(Game.getObjectById(source_id));
    // }
    // return sources;
    return this.memory.sources;
}

// let RoomCache = function(){
//     Memory.creep_cache = {};
//     Memory.creep_cache_length = {};
    
//     this.addCreep = function(creep){
//         let role = creep.memory.role;
//         // console.log('caching:', creep, role);
//         if (role && name){
//             if (!Memory.creep_roles.hasOwnProperty(role)){
//                 Memory.creep_roles[role] = [];
//             }
//             Memory.creep_roles[role] = 1;
//         }else{
//             console.log("unable to cache:", creep)
//         }
//     }
    
//     this.role_count = function(role){
//         return creep_role_count[role] || 0;
//     }

//     this.reset = function(){
//         Memory.creep_role_count = {};
//     }
    
//     this.weighted_lengths = function(){
//         return { 
//             worker: (1 + this.role_count('worker'))/2.0,
//             guard: (1 + this.role_count('guard'))*2.0
//         };
//     }

//     this.should_build = function(){
//         let weights = this.weighted_lengths();
//         let build_value, build_role;
//         for (let i in weights){
//             let value = weights[i];
//             if (build_value == undefined || value < build_value){
//                 build_value = value;
//                 build_role = i;
//             }
//         }
//         if (build_value <= MAX_UNITS_METRIC)
//             return build_role;
//     }
// }

declare var module: any;
(module).exports.loop = function () {
    // console.log('tick');
    Inventory.update();
    // console.log(Inventory);
    // let Cache = new CreepCache();
    
    // let creep_cache = {};
    // let creep_cache_length = {};
    // let cache_creep = function(creep){
    //     let role = creep.memory.role,
    //         name = creep.name;
        
    //     // console.log('caching:', creep, role);
    //     if (role && name){
    //         if (!creep_cache.hasOwnProperty(role)){
    //             creep_cache[role] = {};
    //             creep_cache_length[role] = 0;
    //         }
            
    //         creep_cache[role][name] = creep;
    //         creep_cache_length[role] += 1;
    //     }else{
    //         console.log("unable to cache:", creep)
    //     }
    // }

    
    // //Clear out the old memory:
    // for (let c in Memory.creeps){
    //     // Game.getObjectById()
    //     if (!Game.creeps[c]){
    //         console.log('Deleting creep ' + c + " from memory. Cost(" + Memory.creeps[c].cost + ")");
    //         delete Memory.creeps[c];
    //     }
    // }

    for (let r in Game.rooms){
        // console.log('room', Game.rooms[r]);
        let room = <Room>Game.rooms[r];
        let memory = Memory.rooms[room.name];
        // console.log('room', room.name);
        // let sources = room.sources();
        // for (let s in sources){
        //     let source = sources[s];
        //     // console.log(source);

        // }
        // console.log(r);

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
            let cc = new CreepController(creep);
            cc.work();
        }


        // let drone = <Drone>creep;
    }

    // for (let s in Game.spawns){
    //     let spawn = Game.spawns[s];
    //     let totalEnergy = spawn.energy;
    //     let totalCapacity = spawn.energyCapacity;

    //     let extensions = <Extension[]>spawn.room.find(FIND_MY_STRUCTURES, {
    //         filter: function(obj){
    //             return obj.structureType == STRUCTURE_EXTENSION;
    //         }
    //     });
    //     for (let e in extensions){
    //         let extension = extensions[e];
    //         totalEnergy += extension.energy;
    //         totalCapacity += extension.energyCapacity;
    //     }
    //     if (totalEnergy == totalCapacity || totalEnergy >= Globals.MAX_COST) {
    //         let build_role = Cache.should_build();
    //         // console.log('attempting to build: ' + build_role);
    //         if (build_role){
                
    //             let creep_memory = {
    //                     role: build_role
    //                 },
    //                 body = [MOVE],
    //                 cost = 50;

    //             function fillBody(bodyParts){
    //                 let costOfSet = 0, numOfParts = 0;
    //                 for (let b in bodyParts){
    //                     costOfSet += Globals.PART_COSTS[bodyParts[b]];
    //                     numOfParts++;
    //                 }
    //                 while (totalEnergy - (cost + costOfSet) > 0 && (body.length + numOfParts) <= 50 && (cost + costOfSet) <= Globals.MAX_COST) {
    //                     for (let b in bodyParts){
    //                         body.unshift(bodyParts[b]);
    //                     }
    //                     cost += costOfSet;
    //                 }
    //             }
    //             if (build_role == 'worker'){
    //                 fillBody([MOVE, CARRY, WORK]);
    //                 fillBody([CARRY, WORK]);
    //                 fillBody([CARRY]);
    //             }else if (build_role == 'guard'){
    //                 fillBody([MOVE, ATTACK, TOUGH, TOUGH]);
    //                 fillBody([ATTACK, TOUGH, TOUGH]);
    //                 fillBody([TOUGH]);
    //             }
    //             spawn.room.memory.highest_creep_cost = Math.max(cost, spawn.room.memory.highest_creep_cost);
    //             creep_memory['cost'] = cost;
    //             let response = spawn.createCreep(body, null, creep_memory);
    //             if (!(response < 0)){
    //                 console.log("Making a new " + build_role + " named "  + response + " that costs " + cost);
    //             }else if (response == ERR_BUSY){
    //                 //just wait
    //             }else{
    //                 console.log("Create creep response:", response);
    //             }
    //         }else{
    //             // console.log('no build role');
    //         }
    //     }
    // }
}