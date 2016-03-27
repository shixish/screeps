/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
// var _ = require('lodash'),
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
    // CreepCache = require('CreepCache'),
    Inventory = require('Inventory');
    // Harvester = require('harvester'),
    // Guard = require('guard'),
    // Builder = require('builder'),
    // Spawn = require('spawn');

// var USERNAME = 'ShiXish',
//     MIN_TICKS_TO_LIVE = 200,
//     MAX_UNITS_METRIC = 3,
//     MAX_HITS_REPAIR = 200000;



// var CreepCache = Game['CreepCache'] = new CreepCache();

interface Room {
    storeSources();
    sources();
}

Room.prototype.storeSources = function() {
    var sources = this.find(FIND_SOURCES);
    this.memory.sources = {};
    for (var s in sources) {
        var source = sources[s];
        this.memory.sources[source.id] = {};
        // console.log(source.id);
    }
}

Room.prototype.sources = function() {
    if (!this.memory.sources) this.storeSources();
    // var sources = [];
    // for (var s in this.memory.sources){
    //     var source_id = this.memory.sources[s];
    //     sources.push(Game.getObjectById(source_id));
    // }
    // return sources;
    return this.memory.sources;
}

// var RoomCache = function(){
//     Memory.creep_cache = {};
//     Memory.creep_cache_length = {};
    
//     this.addCreep = function(creep){
//         var role = creep.memory.role;
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
//         var weights = this.weighted_lengths();
//         var build_value, build_role;
//         for (var i in weights){
//             var value = weights[i];
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
    // var Cache = new CreepCache();
    
    // var creep_cache = {};
    // var creep_cache_length = {};
    // var cache_creep = function(creep){
    //     var role = creep.memory.role,
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
    // for (var c in Memory.creeps){
    //     // Game.getObjectById()
    //     if (!Game.creeps[c]){
    //         console.log('Deleting creep ' + c + " from memory. Cost(" + Memory.creeps[c].cost + ")");
    //         delete Memory.creeps[c];
    //     }
    // }

    for (var r in Game.rooms){
        // console.log('room', Game.rooms[r]);
        var room = <Room>Game.rooms[r];
        var memory = Memory.rooms[room.name];
        // console.log('room', room.name);
        // var sources = room.sources();
        // for (var s in sources){
        //     var source = sources[s];
        //     // console.log(source);

        // }
        // console.log(r);

        if (memory.tower) {
            for (var t in memory.tower) {
                // var t_obj = memory.tower[t];
                try {
                    var tower = new TowerController(t);
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
            for (var t in memory.spawn) {
                try {
                    var spawn = new SpawnController(t);
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
            for (var t in memory.source) {
                try {
                    var source = new SourceController(t);
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
    
    for(var c in Game.creeps) {
       // console.log(c);
        var creep = Game.creeps[c];
        // Cache.add(creep);

        
        // console.log(courier.work);
        // courier.work();

        if (creep.memory.role == 'courier') {
            var courier = new CourierCreep(creep);
            courier.work();
        } else if(creep.memory.role == 'linker') {
            var linker = new LinkerCreep(creep);
            linker.work();
        } else if (creep.memory.role == 'harvester') {
            console.log(creep.name);
            var harvester = new HarvesterCreep(creep);
            harvester.work();
        } else if (creep.memory.role == 'miner') {
            var miner = new MinerCreep(creep);
            miner.work();
        } else if (creep.memory.role == 'builder') {
            var builder = new BuilderCreep(creep);
            builder.work();
        } else if (creep.memory.role == 'guard') {
            var guard = new GuardCreep(creep);
            guard.work();
        } else if (creep.memory.role == 'runner') {
            var runner = new RunnerCreep(creep);
            runner.work();
        } else {
            var cc = new CreepController(creep);
            cc.work();
        }


        // var drone = <Drone>creep;
    }

    // for (var s in Game.spawns){
    //     var spawn = Game.spawns[s];
    //     var totalEnergy = spawn.energy;
    //     var totalCapacity = spawn.energyCapacity;

    //     var extensions = <Extension[]>spawn.room.find(FIND_MY_STRUCTURES, {
    //         filter: function(obj){
    //             return obj.structureType == STRUCTURE_EXTENSION;
    //         }
    //     });
    //     for (var e in extensions){
    //         var extension = extensions[e];
    //         totalEnergy += extension.energy;
    //         totalCapacity += extension.energyCapacity;
    //     }
    //     if (totalEnergy == totalCapacity || totalEnergy >= Globals.MAX_COST) {
    //         var build_role = Cache.should_build();
    //         // console.log('attempting to build: ' + build_role);
    //         if (build_role){
                
    //             var creep_memory = {
    //                     role: build_role
    //                 },
    //                 body = [MOVE],
    //                 cost = 50;

    //             function fillBody(bodyParts){
    //                 var costOfSet = 0, numOfParts = 0;
    //                 for (var b in bodyParts){
    //                     costOfSet += Globals.PART_COSTS[bodyParts[b]];
    //                     numOfParts++;
    //                 }
    //                 while (totalEnergy - (cost + costOfSet) > 0 && (body.length + numOfParts) <= 50 && (cost + costOfSet) <= Globals.MAX_COST) {
    //                     for (var b in bodyParts){
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
    //             var response = spawn.createCreep(body, null, creep_memory);
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