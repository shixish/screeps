/// <reference path="../vars/Globals.ts" />
/// <reference path="../utils/Inventory.ts" />
"use strict";

class SpawnController {
    structure: Spawn;
    controller_level: number;

    constructor(structure_id) {
        this.structure = <Spawn>Game.getObjectById(structure_id);
        if (!this.structure) {
            console.log('Unable to find Spawn with ID', structure_id);
            throw "Invalid Object ID";
        }
        if (this.structure.isActive()) {//this can happen on the test realm especially.
            this.work();
        }
        // console.log(this.structure.isActive);
    }

    static getMaxCreepCount(room: Room) {
        //There may not be a controller in the room.
        if (!room.controller || !room.controller.owner || room.controller.owner.username != Globals.USERNAME) return;

        let sources = Inventory.room_sources(room),
            // minerals = Inventory.room_minerals(room),
            spawns = Inventory.room_structure_count('spawn', room),
            storage = Inventory.room_structure_count('storage', room),
            towers = Inventory.room_structure_count('tower', room),
            links = Inventory.room_structure_count('link', room),
            extensions = Inventory.room_structure_count('extension', room),
            extractors = Inventory.room_structure_count('extractor', room);

        // console.log(flagCreeps['runner'])
        let max_creeps = {
            'Harvester': sources,
            'Courier': storage > 0 ? Math.ceil(towers / 1.5) : 0,
            'Linker': links > 0 ? storage : 0,
            'Guard': 0,
            'Healer': 0,
            'Ranger': 0,
            'Builder': 1 + (room.controller.level < 8 ? 1 : 0),//(storage ? 1 : 0), //
            'Miner': 0, //storage > 0 ? minerals : 0,
            'Runner': 0,
        }

        if (storage && extractors) {
            let storage = <Storage>Game.getObjectById(room.memory['structures']['storage'][0]);
            if (_.sum(storage.store) - storage.store[RESOURCE_ENERGY] < storage.storeCapacity * Globals.MAX_MINERALS_IN_STORE) {
                max_creeps.Miner = 1;
            }
        }

        let under_attack_by = room.memory.under_attack;
        if (room.memory.under_attack >= 2) {
            max_creeps.Courier += Math.floor(under_attack_by / 3);
            // max_creeps.Healer += Math.floor(under_attack_by / 2);
            // max_creeps.Guard += Math.ceil(under_attack_by / 4);
            max_creeps.Ranger += Math.ceil(under_attack_by);
        }

        return max_creeps;

        // room.memory['max_creeps'] = max_creeps;
        // room.memory['max_creeps']['home'] = home_creeps;
    }

    // static maxFlagCreeps(room: Room) {
    //     let max_creeps = {

    //     };

    //     if (room.memory.flags) {
    //         for (let f in room.memory.flags) {
    //             let flag = <Flag>Game.flags[f],
    //                 target_room_name = flag.pos.roomName,
    //                 target_room = Game.rooms[target_room_name];

    //             let flag_creeps = {};
    //             if (flag.memory.flag_type == 'harvest') {
    //                 // if (!target_room) { // || target_room.controller [claim timer is low]
    //                 //     flag_creeps['Claim'] = 1;
    //                 // } else {
    //                 //     flag_creeps['Harvester'] = Inventory.room_sources(target_room);
    //                 //     flag_creeps['Builder'] = target_room.memory.constructing > 0 ? 1 : 0;
    //                 //     // flag_creeps['Courier'] = Inventory.room_sources(target_room) * 4;
    //                 // }
    //             }
    //             max_creeps[flag.name] = flag_creeps;
    //             flag.memory.max_creeps = flag_creeps;
    //         }
    //     }
    //     return max_creeps;
    // }

    static generateQueue(room: Room) {

        // room.memory['max_creeps'];

        //don't rebuild the queue unless it's empty or we're under attack...
        // if (!room.memory['spawn_queue'] || !room.memory['spawn_queue'].length || room.memory.under_attack){
        // let home_creeps = SpawnController.getMaxCreepCount(room);
            // var flag_creeps = SpawnController.maxFlagCreeps(room);

            // let spawn_queue = {};
            // let target = 'home', home_queue = [];
            // for (let role in home_creeps) {
            //     let current_creeps = Inventory.room_creep_count(role, room);
            //     if (current_creeps < home_creeps[role]) {
            //         home_queue.push(role);
            //         // current_creeps++;
            //     } else if (current_creeps > home_creeps[role]) {
            //         //should obsolete some existing creeps...
            //     }
            // }

            let max_creeps = {
                home: SpawnController.getMaxCreepCount(room),
            }

            if (room.memory.flags) {
                for (let f in room.memory.flags) {
                    let flag = <Flag>Game.flags[f],
                        flag_type = flag.memory.flag_type,
                        target_room_name = flag.pos.roomName,
                        target_room = Game.rooms[target_room_name];

                    let FlagController = FlagTypes[flag_type];
                    if (FlagController) {
                        let ctrl = new FlagController(flag);
                        max_creeps[flag.name] = ctrl.getMaxCreepCount();
                    }
                }
            }

            let spawn_queue = {};
            for (let target in max_creeps){
                let queue = [];
                for (let role in max_creeps[target]) {
                    let current_creeps,
                        max = max_creeps[target][role];
                    
                    try {
                        current_creeps = room.memory['creeps'][target][role].length;//Inventory.room_creep_count(role, room),
                    }catch (e) {
                        current_creeps = 0;
                    }

                    if (current_creeps < max) {
                        queue.push(role);
                        // current_creeps++;
                    } else if (current_creeps > max) {
                        //should obsolete some existing creeps...
                    }
                }
                spawn_queue[target] = queue;
            }

            

            // for (let target in max_creeps){
            //     let queue = [];
            //     for (let role in max_creeps[target]) {
            //         let current_creeps = Inventory.room_creep_count(role, room);
            //         if (current_creeps < max_creeps[target][role]) {
            //             queue.push(role);
            //             // current_creeps++;
            //         } else if (current_creeps > max_creeps[target][role]) {
            //             //should obsolete some existing creeps...
            //         }
            //     }
            //     spawn_queue[target] = queue;
            // }
            // if (room.memory.flags) {
            //     for (let f in room.memory.flags) {
            //         let flag = <Flag>Game.flags[f];
            //         // debug.log(flag.memory);
            //         if (flag.memory.flag_type == 'harvest'){

            //         }
            //     }
            // }
            room.memory['spawn_queue'] = spawn_queue;
            room.memory['max_creeps'] = max_creeps;
        // }
    }

    work() {
        // if (this.structure.name == 'Spawn4') return;

        //These get set by the Inventory process
        let room = this.structure.room;
        let repairable = [];
        // if (room.memory.storage.energy > 1000){
            repairable = this.structure.pos.findInRange(FIND_MY_CREEPS, 1, {
                filter: function(obj: Creep) {
                    return !obj.memory.obsolete && obj.ticksToLive < 1400
                }
            });
        // }
        // if (room.name == 'W18S29') {
        //     let max_creeps = this.max_creeps();
        //     console.log(this.structure.room.name);
        //     for (let i in max_creeps) {
        //         console.log(i, max_creeps[i]);
        //     }
        // }
        if (repairable.length) {
            let lowest_creep = _.min(repairable, function(obj) {
                return obj.ticksToLive;
            });
            let highest_creep = _.max(repairable, function(obj) {
                return obj.ticksToLive;
            });
            let target_creep = lowest_creep < 10 ? lowest_creep : highest_creep;

            // console.log('renewing ', lowest_creep);
            let action = this.structure.renewCreep(target_creep);
            if (action == ERR_NOT_IN_RANGE) {
                //it's ok
            } else if (action == ERR_FULL) {
                //no problem
            } else if (action == ERR_BUSY) {//The spawn is busy
                //just wait
            } else if (action == ERR_NOT_ENOUGH_ENERGY) {
                // let creep_total = 0;
                // //Get total number of creeps in this room.
                // for (let l in room.memory.creep_roles) {
                //     creep_total += Object.keys(room.memory.creep_roles[l]).length;
                // }

                // //if all of the creeps are trying to renew themselves and nobody is actually working, just make them all live out their last breaths.
                // // console.log(repairable.length, creep_total);
                // if (repairable.length == creep_total) {
                //     for (let r in repairable) {
                //         (<Creep>repairable[r]).memory.obsolete = true;
                //     }
                //     console.log(`Room ${room.name} is on it's last breaths.`);
                // }
            } else if (action == ERR_INVALID_TARGET) {
                //ok i guess
            } else if (action != 0) {
                console.log('renewing error:', action);
            }
            //notice: energyAvailable can be more than energyCapacityAvailable if the controller gets downgraded (test realm).
        } else if (!this.structure.spawning) {
            // console.log(room.memory['spawn_queue']);
            // for (let remote_name in room.memory['spawn_queue']) {
            //     let queue = room.memory['spawn_queue'][remote_name];
            //     if (queue.length) { 
            //         let name = this.create_creep(queue[0], remote_name, room);
            //         // console.log('new creep name:', name);
            //         if (name != undefined && typeof name == 'string') {
            //             room.memory['spawn_queue'][remote_name].shift(); //creep was created...
            //             break; //don't keep trying to make more on this tick.
            //         }
            //     }
            // }

            for (let remote_name in room.memory['spawn_queue']) {
                let queue = room.memory['spawn_queue'][remote_name];
                if (queue.length) {
                    let name = this.create_creep(queue[0], remote_name, room);
                    // console.log('new creep name:', name);
                    if (name != undefined && typeof name == 'string') {
                        room.memory['spawn_queue'][remote_name].shift(); //creep was created...
                        break; //don't keep trying to make more on this tick.
                    }
                }
            }

            // if (room.energyAvailable >= room.energyCapacityAvailable || room.energyAvailable >= Globals.MAX_COST || !room.memory.creep_roles) {
                // let max_creeps = this.max_creeps();
                // let min_role = null, min_count = null;
                // // console.log(Object.keys(max_creeps));

                // for (let role in max_creeps) {
                //     let count = Inventory.room_creep_count(role, room);
                //     if (count < max_creeps[role] && (min_count == null || count < min_count)) {
                //         min_count = count;
                //         min_role = role;
                //     }
                // }

                // if (min_role) {
                //     var response = this.create_creep(min_role, room);
                //     if (response !== false) {

                //     }
                // }
            // }
        }

        // console.log('working', room.energyAvailable, room.energyCapacityAvailable);
    }

    create_creep(role: string, remote_name:string, room: Room) {
        // if (this.structure.room.name == 'W18S29')
        //     console.log(this.structure.room.name, role, totalEnergy);
        // if (role) {
        // if (role == "guard") {
        //     console.log('trying to build a ', role);
        // }
        if (role && CreepControllers[role]) {
            let ctrl = CreepControllers[role];
            // let tier = ctrl.produce_new(room);
            let tier = Inventory.getHighestCreepTier(room, role);
            // tier = ctrl.get_heighest_tier(room);

            // if (role == "guard") {
            //     console.log(tier, ctrl);
            // }
            if (tier) {
                let memory = tier.memory ? tier.memory : {};
                memory.role = role;
                memory.cost = tier.cost;
                memory.home = room.name;
                if (remote_name != 'home') {
                    memory.flag = remote_name;
                    memory.office = Game.flags[remote_name].pos.roomName;
                    memory.obsolete = true;
                } else {
                    memory.office = room.name;
                }

                if (_.indexOf(tier.body, CLAIM) !== -1) {
                    memory.obsolete = true; //can't repair claim creeps.
                }
                let response: any = this.structure.createCreep(tier.body, null, memory);
                if (!(response < 0)) {
                    let name: string = response;
                    console.log("Making a new " + role + " named " + name + " in room " + room.name);
                    Inventory.invNewCreep(role, name, room);
                    return response;//new creep name
                } else if (response == ERR_BUSY) {
                    //just wait
                    console.log("Spawn is busy");
                } else if (response == ERR_NOT_ENOUGH_ENERGY) {
                    //the base was likely attacked...
                    // console.log(this.structure.room.name, 'is dead.');
                    // console.log("Spawn doesn't have enough energy");
                } else {
                    console.log(this.structure.room.name, this.structure, "create creep error:", response);
                }
            } else {
                console.log(`No creep tier found for ${role} in room ${room}`)
            }
        } else {
            console.log(`Spawn detected invalid creep role ${role}!`);
        }
        return false;


        // let fn = this.creep_creators[role];
        // let creep_body = fn(room.energyCapacityAvailable);
        // let creep_memory = {
        //     role: role
        // };
        // if (_.indexOf(creep_body, CLAIM) !== -1) {
        //     creep_memory['obsolete'] = true; //can't repair claim creeps.
        // }
        // //TODO:: USE : creep.getActiveBodyparts
        // let response:any = this.structure.createCreep(creep_body, null, creep_memory);
        // if (!(response < 0)) {
        //     let name:string = response;
        //     console.log("Making a new " + creep_memory.role + " named " + name + " in room " + room.name);
        //     Inventory.invNewCreep(creep_memory.role, name, room);
        //     return response;//new creep name
        // } else if (response == ERR_BUSY) {
        //     //just wait
        // } else {
        //     console.log(this.structure.room.name, this.structure, "create creep error:", response);
        // }
    // } else {
    //     console.log(`Unable to create ${role} creep`);
    // }
    }

    // create_creep(creep_body: string[], creep_memory) {
    //     var response = this.structure.createCreep(creep_body, null, creep_memory);
    //     if (!(response < 0)) {
    //         var name = response;
    //         console.log("Making a new " + creep_memory.role + " named " + name);
    //         Inventory.invNewCreep(creep_memory.role, name);
    //         return response;//new creep name
    //     } else if (response == ERR_BUSY) {
    //         //just wait
    //     } else {
    //         console.log("Create creep response:", response);
    //     }
    // }
}