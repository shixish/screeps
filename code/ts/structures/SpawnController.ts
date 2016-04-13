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

    static generateMaxCreepCount(room: Room) {
        if (!room.controller.owner || room.controller.owner.username != Globals.USERNAME) return;

        let sources = Inventory.room_sources(room),
            // minerals = Inventory.room_minerals(room),
            spawns = Inventory.room_structure_count('spawn', room),
            storage = Inventory.room_structure_count('storage', room),
            towers = Inventory.room_structure_count('tower', room),
            links = Inventory.room_structure_count('link', room),
            extensions = Inventory.room_structure_count('extension', room),
            extractors = Inventory.room_structure_count('extractor', room);

        // console.log(flagCreeps['runner'])
        let home_creeps = {
            'Harvester': sources,
            'Courier': storage > 0 ? Math.ceil(towers / 1.5) : 0,
            'Linker': links > 0 ? storage : 0,
            'Guard': 0,
            'Healer': 0,
            'Ranger': 0,
            'Builder': 1 + (storage ? 1 : 0), //(room.controller.level < 8 ? 1 : 0)
            'Miner': 0, //storage > 0 ? minerals : 0,
            'Runner': 0,
        }

        if (storage && extractors) {
            let storage = <Storage>Game.getObjectById(room.memory['structures']['storage'][0]);
            if (_.sum(storage.store) - storage.store[RESOURCE_ENERGY] < storage.storeCapacity * Globals.MAX_MINERALS_IN_STORE) {
                home_creeps.Miner = 1;
            }
        }

        let under_attack_by = room.memory.under_attack;
        if (room.memory.under_attack > 4){
            home_creeps.Courier += Math.floor(under_attack_by / 3);
            home_creeps.Healer += Math.floor(under_attack_by / 2);
            home_creeps.Guard += Math.ceil(under_attack_by / 4);
            home_creeps.Ranger += Math.ceil(under_attack_by);
        }

        let max_creeps = {
            home: home_creeps,
        };

        // room.memory['max_creeps'] = {
        //     home: home_creeps,
        // };

        if (room.memory.flags) {
            for (let f in room.memory.flags) {
                let flag = <Flag>Game.flags[f],
                    target_room_name = flag.pos.roomName,
                    target_room = Game.rooms[target_room_name];

                let flag_creeps = {};
                // if (!target_room) { // || target_room.controller [claim timer is low]
                //     flag_creeps['Claim'] = 1;
                // } else {
                //     // console.log('target_room', target_room, flag.memory.flag_type);
                    
                //     if (flag.memory.flag_type == 'harvest') {
                //         flag_creeps['Harvester'] = Inventory.room_sources(target_room);
                //         flag_creeps['Builder'] = target_room.memory.constructing > 0 ? 1 : 0;
                //         flag_creeps['Courier'] = Inventory.room_sources(target_room)*4;
                //     }
                // }
                max_creeps[flag.name] = flag_creeps;
            }
        }

        room.memory['max_creeps'] = max_creeps;
        // room.memory['max_creeps']['home'] = home_creeps;
    }

    static generateQueue(room: Room) {
        //don't rebuild the queue unless it's empty or we're under attack...
        if (!room.memory['spawn_queue'] || !room.memory['spawn_queue'].length || room.memory.under_attack){
            let max_creeps = room.memory['max_creeps'];
            let spawn_queue = {};
            for (let target in max_creeps){
                let queue = [];
                for (let role in max_creeps[target]) {
                    let current_creeps = Inventory.room_creep_count(role, room);
                    if (current_creeps < max_creeps[target][role]) {
                        queue.push(role);
                        // current_creeps++;
                    } else if (current_creeps > max_creeps[target][role]) {
                        //should obsolete some existing creeps...
                    }
                }
                spawn_queue[target] = queue;
            }
            // if (room.memory.flags) {
            //     for (let f in room.memory.flags) {
            //         let flag = <Flag>Game.flags[f];
            //         // debug.log(flag.memory);
            //         if (flag.memory.flag_type == 'harvest'){

            //         }
            //     }
            // }
            room.memory['spawn_queue'] = spawn_queue;
        }
    }

    // max_creeps() {
    //     let sources = Inventory.room_sources(this.structure.room),
    //         minerals = Inventory.room_minerals(this.structure.room),
    //         spawns = Inventory.room_structure_count('spawn', this.structure.room),
    //         storage = Inventory.room_structure_count('storage', this.structure.room),
    //         towers = Inventory.room_structure_count('tower', this.structure.room),
    //         links = Inventory.room_structure_count('link', this.structure.room),
    //         extensions = Inventory.room_structure_count('extension', this.structure.room);

    //     let flagCreeps = {
    //         'guard': 0, 
    //         'ranger': 0, 
    //         'runner': 0
    //     };

    //     for (let name in flagCreeps) {
    //         // let obj = flagCreeps[c];
    //         let flag = Game.flags[`${this.structure.room.name}_${name}`];
    //         if (flag) {
    //             if (!flag.memory.creeps || flag.memory.creeps == "") {
    //                 flagCreeps[name] = 1;
    //             }else if (flag.memory.max_creeps > 0 && flag.memory.creeps.length < flag.memory.max_creeps){
    //                 flagCreeps[name] = flag.memory.max_creeps - flag.memory.creeps.length;
    //             }
    //         }
    //     }

    //     // console.log(flagCreeps['runner'])
    //     let values = {
    //         'builder': (this.controller_level < 8 ? 1 : 0) + (storage ? 1 : 0),
    //         'harvester': sources,
    //         'linker': links > 0 ? storage : 0,
    //         'courier': storage > 0 ? Math.ceil(towers / 2) : 0,
    //         'miner': 0, //storage > 0 ? minerals : 0,
    //         'guard': flagCreeps['guard'],
    //         'ranger': flagCreeps['ranger'],
    //         'runner': flagCreeps['runner'],
    //         'healer': 0,
    //     }

    //     // if (this.structure.name == "Spawn6")
    //     //     debug.log(this.structure.name, values, this.structure.room.energyAvailable, this.structure.room.energyCapacityAvailable);

    //     let attack_flag = Game.flags[`${this.structure.room.name}_attack`];
    //     if (attack_flag) {
    //         values.guard += 2;
    //         values.healer += 2;
    //         values.ranger += 2;
    //     }

        
    //     let under_attack_by = this.structure.room.memory.under_attack;
    //     if (this.structure.room.memory.under_attack > 0){
    //         values.courier += Math.floor(under_attack_by / 3);
    //         values.healer += Math.floor(under_attack_by / 2);
    //         values.guard += Math.ceil(under_attack_by / 4);
    //         values.ranger += Math.ceil(under_attack_by);
    //     }
    //     //Need to make these obsolete... ^
    //     return values;
    // }


    work() {
        // if (this.structure.name == 'Spawn4') return;

        //These get set by the Inventory process
        let room = this.structure.room;
        let repairable = [];
        if (room.memory.storage > 1000){
            repairable = this.structure.pos.findInRange(FIND_MY_CREEPS, 1, {
                filter: function(obj: Creep) {
                    return !obj.memory.obsolete && obj.ticksToLive < 1400
                }
            });
        }
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
                let creep_total = 0;
                //Get total number of creeps in this room.
                for (let l in room.memory.creep_roles) {
                    creep_total += Object.keys(room.memory.creep_roles[l]).length;
                }

                //if all of the creeps are trying to renew themselves and nobody is actually working, just make them all live out their last breaths.
                // console.log(repairable.length, creep_total);
                if (repairable.length == creep_total) {
                    for (let r in repairable) {
                        (<Creep>repairable[r]).memory.obsolete = true;
                    }
                    console.log(`Room ${room.name} is on it's last breaths.`);
                }
            } else if (action == ERR_INVALID_TARGET) {
                //ok i guess
            } else if (action != 0) {
                console.log('renewing error:', action);
            }
            //notice: energyAvailable can be more than energyCapacityAvailable if the controller gets downgraded (test realm).
        } else if (!this.structure.spawning) {
            // console.log(room.memory['spawn_queue']);
            for (let target_name in room.memory['spawn_queue']) {
                let queue = room.memory['spawn_queue'][target_name];
                if (queue.length) { 
                    let name = this.create_creep(queue[0], target_name, room);
                    // console.log('new creep name:', name);
                    if (name != undefined && typeof name == 'string') {
                        room.memory['spawn_queue'][target_name].shift(); //creep was created...
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

    create_creep(role: string, target_name:string, room: Room) {
        // if (this.structure.room.name == 'W18S29')
        //     console.log(this.structure.room.name, role, totalEnergy);
        // if (role) {
        // if (role == "guard") {
        //     console.log('trying to build a ', role);
        // }
        if (role && CreepControllers[role]) {
            let ctrl = CreepControllers[role];
            let tier = ctrl.produce_new(room);
            // if (role == "guard") {
            //     console.log(tier, ctrl);
            // }
            if (tier) {
                let memory = tier.memory ? tier.memory : {};
                memory.role = role;
                memory.cost = tier.cost;
                if (target_name != 'home')
                    memory.office = target_name;

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