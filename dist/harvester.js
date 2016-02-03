// var energy = require('energy');
module.exports = {
    transfer: function(creep, target){
        if (creep.carry.energy == 0){
            creep.say('Transfered');
            this.retarget(creep);
            this.work(creep);
        }else{
            var transferring = Math.min(target.energyCapacity - target.energy, creep.carry.energy);
            if (transferring > 0){
                var action = creep.transfer(target, RESOURCE_ENERGY, transferring);
                if(action == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }else if (action != 0){
                    console.log('harvester transfer error:', action);
                    this.retarget(creep);
                }
            }else{
                this.retarget(creep);
            }
        }
    },
    harvest: function(creep, target){
        // console.log(target);
        if (creep.carry.energy == creep.carryCapacity){
            creep.say('Harvested');
            this.retarget(creep);
            this.work(creep);
        }else{
            var action = creep.harvest(target);
            if(action == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }else if (action == ERR_BUSY){//The creep is still being spawned.
                //just wait
            }else if (action != 0){
                console.log('harvesting error:', action);
                this.retarget(creep);
            }
        }
    },
    move: function(creep, target){
        creep.moveTo(target);
        this.retarget(creep);
    },

    // }
    //     if (!target.pos.isNearTo(this.pos)) {
    //         return C.ERR_NOT_IN_RANGE;
    //     }
    retarget: function(creep){
        // console.log('INFO: Harvester ' + creep.name + ' retargeting');
        this.retarget_count++;
        if (this.retarget_count > 3){
            console.log('CRITICAL: harvester unable to find a new target');
            return;
        }
        creep.memory.target_id = null;
        creep.memory.action_name = null;
        if (creep.carry.energy < creep.carryCapacity){
            var target = creep.pos.findClosestByPath(FIND_SOURCES, {
                maxOps: 500,
                // filter: { owner: { username: 'Invader' } }
            });
            // console.log('target', target);
            if (target){
                creep.memory.target_id = target.id;
                creep.memory.action_name = 'harvest';
            }else{
                if (Game.flags.resting){
                    creep.memory.target_id = Game.flags.resting.id;
                    creep.memory.action_name = 'move';
                }
                console.log('unable to find a new harvest target');
            }
        }else{
            // var spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
            // console.log('new target:', target);
            // var extensions = Game.spawns.Spawn1.room.find(FIND_MY_STRUCTURES, {
            //     filter: { structureType: STRUCTURE_EXTENSION }
            // });
            
            // var target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            //     filter: function(obj){
            //         // if (obj.structureType == STRUCTURE_EXTENSION){
            //         //     console.log(obj.energy, obj.energyCapacity);
            //         // }
            //         return (
            //             obj.structureType == STRUCTURE_SPAWN
            //             //|| (obj.structureType == STRUCTURE_EXTENSION && obj.energy < obj.energyCapacity)
            //         );
            //         // console.log(a, b, c, d);
            //         // structureType: STRUCTURE_EXTENSION
            //     }
            // });
            
            var target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: function(obj){
                    return (
                        (obj.structureType == STRUCTURE_SPAWN || obj.structureType == STRUCTURE_EXTENSION)
                        && obj.energy < obj.energyCapacity
                    );
                }
            });
            if (target){
                creep.memory.target_id = target.id;
                creep.memory.action_name = 'transfer';
            }else{
                if (Game.flags.resting){
                    creep.memory.target_id = Game.flags.resting.id;
                    creep.memory.action_name = 'move';
                }
                console.log('unable to find a new transfer target');
            }
        }
        // this.work(creep);
    },
    work: function(creep){
        this.retarget_count = 0;
        // this.retarget(creep);
        var target = Game.getObjectById(creep.memory.target_id),
            action_name = creep.memory.action_name,
            action_function = this[action_name];
        
        // creep.say(action_name);
        if (target && action_function){
            // action_function(creep, target);
            action_function.apply(this, [creep, target])
        }else{
            // console.log('unknown harvester action:', action_name);
            this.retarget(creep);
        }
        
//         // console.log(creep.carry.energy);
//         if (creep.carry.energy < creep.carryCapacity){
//             var target = creep.pos.findClosestByPath(FIND_SOURCES, {
//                 // filter: { owner: { username: 'Invader' } }
//             });
//         // var sources = creep.room.find(FIND_SOURCES),
//         //     target = sources[1];
            
//          if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
//              creep.moveTo(target);
//          }
//      }else{
//          var spawns = creep.room.find(FIND_MY_SPAWNS),
//              spawn = spawns[0];
            
//             // var spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS, {
//             //     filter: { owner: { username: 'ShiXish' } }
//             // });
            
//          var action = creep.transfer(spawn, RESOURCE_ENERGY, creep.carry.energy);
//          if(action == ERR_NOT_IN_RANGE) {
//              creep.moveTo(spawn);
//          }else if (action != 0){
//              console.log('build error:', action);
//          }
//      }
    },
    make: function(spawn){
        var memory = {
                role: "harvester"
            },
            body = [WORK, WORK, WORK, CARRY, MOVE];
        //simple:
        body = [WORK, WORK, CARRY, MOVE];
        return spawn.createCreep(body, null, memory);
    }
};