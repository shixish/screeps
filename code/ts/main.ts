/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
// var _ = require('lodash'),
var Globals = require('Globals'),
    CreepController = require('CreepController'),
    CreepCache = require('CreepCache');
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
    
    var Cache = new CreepCache();
    
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

    
    //Clear out the old memory:
    for (var c in Memory.creeps){
        // Game.getObjectById()
        if (!Game.creeps[c]){
            Memory.creeps[c].cost
            console.log('Deleting creep ' + c + " from memory. Cost(" + Memory.creeps[c].cost + ")");
            delete Memory.creeps[c];
        }
    }

    for (var r in Game.rooms){
        // console.log(Game.rooms[r]);
        var room = Game.rooms[r];
        // console.log(room.sources());
        // var sources = room.sources();
        // for (var s in sources){
        //     var source = sources[s];
        //     // console.log(source.memory);
        // }
        // console.log(r);

        var towers = <Tower[]>room.find(FIND_MY_STRUCTURES, {
            filter: function(obj){
                return (
                    obj.structureType == STRUCTURE_TOWER
                );
            }
        });

        for (var t in towers){
            var tower = towers[t];
            var target;
            // console.log(tower.id);

            // var action = tower.repair(repair_target);
            // console.log(repair_target, action);
            if (tower.energy > 0){
                // target = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
                //     filter: function(obj){
                //         return obj.memory.action_name == 'building'
                //     }
                // });
                // if (target){
                //     var transferring = Math.min(target.carryCapacity - target.carry.energy, tower.energy);
                //     console.log(target.carryCapacity - target.carry.energy, tower.energy, transferring);
                //     if (transferring > 0){
                //         var action = tower.transferEnergy(target, transferring);
                //         console.log(target, action, transferring);
                //     }
                // }

                target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (target){
                    var action = tower.attack(target);
                }else{
                    target = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
                        filter: function(obj){
                            return obj.hits < obj.hitsMax
                        }
                    });
                    if (target){
                        var action = tower.heal(target);
                    }else{
                        target = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: function(obj){
                                // if (obj.structureType == STRUCTURE_ROAD){
                                //     console.log(obj.hits, obj.hitsMax, obj.hitsMax*3/4);
                                // }
                                return (
                                    (obj.structureType == STRUCTURE_ROAD ||
                                        (obj.owner && obj.owner.username == Globals.USERNAME))// ||  obj.structureType == STRUCTURE_WALL)
                                    && obj.hits < obj.hitsMax && obj.hits < Globals.MAX_HITS_REPAIR
                                );
                            }
                        });
                        if (target){
                            var action = tower.repair(target);
                        }
                    }
                }
                
            }
        }
    }
    
    for(var c in Game.creeps) {
       // console.log(c);
        var creep = Game.creeps[c];
        Cache.add(creep);

        var cc = new CreepController(creep);

        // if(creep.memory.role == 'guard') {
        //     Guard.work(creep);
        // }else{
        //     creep.work();
        // }
        cc.work();

        // var drone = <Drone>creep;
    }

    for (var s in Game.spawns){
        var spawn = Game.spawns[s];
        var totalEnergy = spawn.energy;
        var totalCapacity = spawn.energyCapacity;

        var extensions = <Extension[]>spawn.room.find(FIND_MY_STRUCTURES, {
            filter: function(obj){
                return obj.structureType == STRUCTURE_EXTENSION;
            }
        });
        for (var e in extensions){
            var extension = extensions[e];
            totalEnergy += extension.energy;
            totalCapacity += extension.energyCapacity;
        }
        if (totalEnergy == totalCapacity){
            var build_role = Cache.should_build();
            // console.log('attempting to build: ' + build_role);
            if (build_role){
                
                var memory = {
                        role: build_role
                    },
                    body = [MOVE],
                    cost = 50;

                function fillBody(bodyParts){
                    var costOfSet = 0, numOfParts = 0;
                    for (var b in bodyParts){
                        costOfSet += PartCosts[bodyParts[b]];
                        numOfParts++;
                    }
                    while(totalEnergy - (cost + costOfSet) > 0 && body.length+numOfParts <= 50){
                        for (var b in bodyParts){
                            body.unshift(bodyParts[b]);
                        }
                        cost += costOfSet;
                    }
                }
                if (build_role == 'worker'){
                    // var partCost = 100 + 50 + 50, parts = 3;
                    // body = fillBody(body, [WORK, CARRY, MOVE], 100 + 50 + 50);
                    // while(totalEnergy - (cost + partCost) >= 0){ //limit the amount of move parts
                    //     body.unshift(MOVE); //50
                    //     body.unshift(CARRY); //50
                    //     body.unshift(WORK); //100
                    //     cost += partCost;
                    // }
                    // partCost = 100 + 50; parts = 2;
                    // while(totalEnergy - (cost + partCost) >= 0){
                    //     body.unshift(CARRY); //50
                    //     body.unshift(WORK); //100
                    //     cost += partCost;
                    // }
                    // partCost = 50; parts = 1;
                    // while(totalEnergy - (cost + partCost) >= 0){
                    //     body.unshift(CARRY); //50
                    //     cost += partCost;
                    // }
                    fillBody([MOVE, CARRY, WORK]);
                    fillBody([CARRY, WORK]);
                    fillBody([CARRY]);
                }else if (build_role == 'guard'){
                    // var partCost = 80 + 10 + 10 + 50, parts = 4;
                    // while(totalEnergy - (cost + partCost) >= 0){ //limit the amount of move parts
                    //     body.unshift(MOVE); //50
                    //     body.unshift(ATTACK); //80
                    //     body.unshift(TOUGH); //10
                    //     body.unshift(TOUGH); //10
                    //     cost += partCost;
                    // }
                    // partCost = 80 + 10 + 10;
                    // while(totalEnergy - (cost + partCost) >= 0){
                    //     body.unshift(ATTACK); //80
                    //     body.unshift(TOUGH); //10
                    //     body.unshift(TOUGH); //10
                    //     cost += partCost;
                    // }
                    // partCost = 10;
                    // while(totalEnergy - (cost + partCost) >= 0){
                    //     body.unshift(TOUGH); //10
                    //     cost += partCost;
                    // }
                    fillBody([MOVE, ATTACK, TOUGH, TOUGH]);
                    fillBody([ATTACK, TOUGH, TOUGH]);
                    fillBody([TOUGH]);
                }
                spawn.room.memory.highest_creep_cost = Math.max(cost, spawn.room.memory.highest_creep_cost);
                memory['cost'] = cost;
                var response = spawn.createCreep(body, null, memory);
                if (!(response < 0)){
                    console.log("Making a new " + build_role + " named "  + response + " that costs " + cost);
                }else if (response == ERR_BUSY){
                    //just wait
                }else{
                    console.log("Create creep response:", response);
                }
            }else{
                // console.log('no build role');
            }
        }
    }
}