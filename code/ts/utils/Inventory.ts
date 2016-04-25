/// <reference path="../vars/Globals.ts" />
/// <reference path="../utils/Debug.ts" />
/// <reference path="../structures/SpawnController.ts" />
"use strict";

class Inventory {
    static update() {
        var invDiag = debug.diag('Inventory');
        
        Inventory.invFlags();

        Inventory.invCreeps();

        for (let r in Game.rooms) {
            let room = Game.rooms[r];
            // room.memory['energy'] = room.memory['energyCapacity'] = 0;


            if (!room.memory.source) Inventory.invRoomSources(room);
            if (!room.memory.mineral) Inventory.invRoomMinerals(room);

            let hostile_creeps = room.find(FIND_HOSTILE_CREEPS);
            // console.log(hostile_creeps);
            room.memory.under_attack = hostile_creeps.length;
            if (hostile_creeps.length > 0)
                room.memory.last_attack = Game.time;

            let construction_sites = room.find(FIND_MY_CONSTRUCTION_SITES);
            let construction_finished = false;
            if (construction_sites.length < room.memory.constructing) { //something finished building
                console.log('Some construction finished in room ', room.name);
                construction_finished = true;
            }

            room.memory.constructing = construction_sites.length;
            
            //Only update structure counts if need be.
            if (!room.memory.last_attack) room.memory.last_attack = Game.time;
            let attack_finished = room.memory.last_attack > room.memory.last_updated && Game.time - room.memory.last_attack > Globals.ALL_CLEAR_AFTER;
            let reload = Memory['reload'] || !room.memory.last_updated || attack_finished || construction_finished;
            // console.log(room.memory.last_attack > room.memory.last_updated, Game.time - room.memory.last_attack, room);
            if (reload) {
                console.log('Refreshing structure counts for room', room.name);
                Inventory.invRoomStructures(room);
                Inventory.invHighestCreepTiers(room);
                room.memory.last_updated = Game.time;
            }
            // Inventory.invHighestCreepTiers(room);
            
            // Inventory.generateMaxCreepCount(room);
            // Inventory.updateSpawnQueue(room);

            //Do this only once per room, not once per spawn:

            // SpawnController.generateMaxCreepCount(room);
            SpawnController.generateQueue(room);

            //Note: this should be run after generateMaxCreepCount
            Inventory.updateObsoleteCreeps(room);

            if (room.memory['structures']['storage'] && room.memory['structures']['storage'].length) {
                let storage = <Storage>Game.getObjectById(room.memory['structures']['storage'][0]);
                room.memory.storage = storage.store;
                if (!room.memory.storage.energy) room.memory.storage.energy = 0; //make sure it gets set
            } else {
                //we get "Cannot assign to read only property 'energy' of 0" if you try to set the value directly
                room.memory.storage = { energy: 0 };
            }
        }
        Memory['reload'] = false;//Reset the reload flag. This can be manually flipped to reload caches.
        invDiag.stop();
    }

    static invRoomSources(room:Room) {
        let sources = <Source[]>room.find(FIND_SOURCES);
        if (!room.memory['source']) room.memory['source'] = {};
        for (let s in sources) {
            let source = sources[s];
            if (!room.memory['source'][source.id])
                room.memory['source'][source.id] = {};
        }
    }
    static room_sources(room: Room): number {
        if (room.memory['source'])
            return Object.keys(room.memory['source']).length;
        else
            return 0;
    }

    static invRoomMinerals(room: Room) {
        let minerals = <Mineral[]>room.find(FIND_MINERALS);
        if (!room.memory['mineral']) room.memory['mineral'] = {};
        for (let s in minerals) {
            let mineral = minerals[s];
            if (!room.memory['mineral'][mineral.id])
                room.memory['mineral'][mineral.id] = {};
        }
    }
    static room_minerals(room: Room): number {
        if (room.memory['mineral'])
            return Object.keys(room.memory['mineral']).length;
        else
            return 0;
    }

    static invRoomStructures(room: Room) {
        let structures = <Structure[]>room.find(FIND_STRUCTURES);
        // room.memory.structures = {};
        let by_type = {};
        for (let s in structures) {
            let structure = structures[s];
            if (!by_type[structure.structureType]) by_type[structure.structureType] = [];
            by_type[structure.structureType].push(structure.id);

            // if (!by_type[structure.structureType][structure.id]) by_type[structure.structureType][structure.id] = {};

            // console.log(structure.structureType);

            // if (structure.structureType == 'spawn' || structure.structureType == 'extension') {
            //     room.memory['energy'] += (<Spawn>structure).energy;
            //     room.memory['energyCapacity'] += (<Spawn>structure).energyCapacity;
            // }
        }
        room.memory.structures = by_type;
    }
    static room_structure_count(type: string, room: Room): number {
        if (room.memory['structures'] && room.memory['structures'][type])
            return room.memory['structures'][type].length;
        else
            return 0;
    }

    static invFlags() {
        //garbage collect flags
        for (let f in Memory.flags) {
            if (!Game.flags[f]) {
                if (Memory.flags[f].room_name)
                    delete Memory.rooms[Memory.flags[f].room_name]['flags'][f];
                delete Memory.flags[f];
            } else if (Memory.flags[f].creeps) {
                for (let c in Memory.flags[f].creeps) {
                    if (!Game.creeps[Memory.flags[f].creeps[c]]) {
                        // delete Memory.flags[f].creeps[c]
                        Memory.flags[f].creeps.splice(c, 1);
                    }
                }
            }
        }

        for (let f in Game.flags) {
            let flag = <Flag>Game.flags[f],
                split_loc = flag.name.indexOf('_');

            if (!flag.memory.flag_type && split_loc != -1) {
                let room_name = flag.name.substr(0, split_loc),
                    flag_id = flag.name.substr(split_loc + 1),
                    flag_type = flag_id,
                    flag_num = 0;

                let id_split_loc = flag_id.indexOf('-');
                if (id_split_loc != -1) {
                    flag_type = flag_id.substr(0, id_split_loc);
                    flag_num = parseInt(flag_id.substr(id_split_loc + 1));
                }

                flag.memory.room_name = room_name;
                flag.memory.flag_type = flag_type;
                flag.memory.flag_num = flag_num;

            }

            if (flag.memory.room_name) {
                if (!Memory.rooms[flag.memory.room_name]) Memory.rooms[flag.memory.room_name] = {};
                if (!Memory.rooms[flag.memory.room_name]['flags']) Memory.rooms[flag.memory.room_name]['flags'] = {};
                Memory.rooms[flag.memory.room_name]['flags'][flag.name] = {}
            }

            // debug.log();
            // console.log(flag);

            // let attack_flag = Game.flags[`${this.structure.room.name}_attack`];
            // if (attack_flag) {
            //     values.guard += 2;
            //     values.healer += 2;
            //     values.ranger += 2;
            // }
        }
    }

    static invCreeps() {
        //Reset room creep counts:
        for (let r in Game.rooms) {
            let room = Game.rooms[r];
            // delete room.memory['creep_roles']; //needs to be rebuilt.
            room.memory['creeps'] = {}; //needs to be rebuilt.
        }

        //Clear out the old memory:
        for (let name in Memory.creeps) {
            if (!Game.creeps[name]) {
                console.log('Deleting ' + Memory.creeps[name].role + " creep " + name + " from memory.");
                delete Memory['creeps'][name];
            }
        }

        for (let c in Game.creeps) {
            let creep = <Creep>Game.creeps[c];
            Inventory.invCreepObj(creep);
        }
    }

    static room_creep_count(role: string, room: Room, target?:string): number {
        target = target || 'home';
        if (room.memory['creeps'] && room.memory['creeps'][target] && room.memory['creeps'][target][role])
            return room.memory['creeps'][target][role].length;
        else
            return 0;
    }

    //Shouldn't really be necessary anymore:
    static calculateCreepCost(creep) {
        console.log(creep);
        // return _.reduce(_.map(creep.body, (obj) => { return obj.type; }), (a, b) => { return a + BODYPART_COST[b] }, 0);
    }

    static invHighestCreepTiers(room: Room) {
        if (!room.memory['highest_creep_teir']) room.memory['highest_creep_teir'] = {};
        // let budget = room.energyAvailable;

        for (let role in CreepControllers) {
            let ctrl = CreepControllers[role];
            room.memory['highest_creep_teir'][role] = ctrl.get_heighest_tier(room);
            // for (let t in ctrl.creep_tiers) {
            //     let tier = ctrl.creep_tiers[t];
            //     if (tier.cost <= budget) {
            //         room.memory['highest_creep_teir'][role] = tier;
            //         break;
            //     }
            // }
        }
    }
    static getHighestCreepTier(room: Room, role: string) {
        return room.memory['highest_creep_teir'][role];
    }

    //Note: this should be run after generateMaxCreepCount
    //This doesn't work too good because it's not accounting for the creeps already marked as obsolete...
    static updateObsoleteCreeps(room: Room) {
        // for (let role in room.memory.creep_roles){
        //     let max_count = room.memory.max_creeps[role];
            
        //     //Note: this is only the non-obsolete creeps:
        //     let creeps = room.memory.creep_roles[role], count = creeps.length;

        //     // if (count > max_count) {
        //     // let non_obsolete = [];
        //     // _.forEach(room.memory.creep_roles[role], (name) => {
        //     //     // console.log(!Memory.creeps[name].obsolete);
        //     //     let creep = Game.creeps[name];
        //     //     if (!creep.memory.obsolete && creep.memory.office == creep.memory.home) { //not a foreign creep
        //     //         non_obsolete.push({
        //     //             name: name,
        //     //             time: creep.ticksToLive
        //     //         });
        //     //     }
        //     // });
        //     if (count > max_count) {
        //         let sorted = _.sortBy(creeps, (obj) => { 
        //             return obj.time; 
        //         });
        //         // console.log(`Too many ${role}s in ${room.name}, delete ${sorted.length - max_count}`);
        //         for (let i = 0; i < sorted.length - max_count; i++) {
        //             let name = sorted[i];
        //             // console.log(name);
        //             Memory.creeps[name].obsolete = true;
        //             console.log(`Making ${role} ${name} obsolete in room ${room.name}`);
        //         }
        //     }
        // }
    }

    static invCreepObj(creep: Creep) {
        // console.log(creep);
        let role: string = creep.memory.role,
            name: string = creep.name,
            home: string = creep.memory.home;

        // if (!creep.memory.home) home = creep.memory.home = creep.room.name;
        // if (!creep.memory.office) creep.memory.office = creep.room.name;

        let room: Room = Game.rooms[home];
        let target = creep.memory.flag ? creep.memory.flag : 'home';
        this.invCreep(room, target, role, name);

        // console.log('creeps', target, role, name);
        if (!creep.memory.obsolete && creep.memory.home == creep.room.name) { //room.controller.level < 8 && 
            let tier = Inventory.getHighestCreepTier(room, role);
            if (creep.memory.cost < tier.cost) {
                creep.memory.obsolete = true;
                console.log(`Detected obsolete ${creep.memory.role} creep named ${name} in room ${room.name}`);
            }
            // let ctrl = CreepControllers[role];
            // if (ctrl) {
            //     if (ctrl.creep_is_obsolete(creep, room) === true) {
            //         creep.memory.obsolete = true;
            //         console.log(`Detected obsolete ${creep.memory.role} creep named ${name} in room ${room.name}`);
            //     }
            // } else {
            //     console.log(`Inventory unable to find creep controller for ${creep}`);
            // }
        }
    }

    static invCreep(room:Room, target:string, role: string, name: string) {
        if (!room.memory['creeps'][target]) room.memory['creeps'][target] = {};
        if (!room.memory['creeps'][target][role]) room.memory['creeps'][target][role] = [];
        room.memory['creeps'][target][role].push(name);
    }

    static invNewCreep(role: string, name: string, room: Room) {
        // currently used by (role == "ranger" || role == "guard" || role == "runner") :
        let flag_name = `${room.name}_${role}`;
        let target = 'home';
        if (Game.flags[flag_name]) {
            if (!Game.flags[flag_name].memory.creeps) Game.flags[flag_name].memory.creeps = [];
            Game.flags[flag_name].memory.creeps.push(name);
            target = flag_name;
        }
        this.invCreep(room, target, role, name);
    }
}