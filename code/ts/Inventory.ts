/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
"use strict";
var Globals = require('Globals');

declare var module: any;
(module).exports = class Inventory {
    // static flush() {
    //     for (let r in Game.rooms) {
    //         let room = Game.rooms[r];
    //         room.memory['energy'] = room.memory['energyCapacity'] = 0;

    //         Inventory.invRoomSources(room);
    //         Inventory.invRoomMinerals(room);
    //         Inventory.invRoomStructures(room);


    //         // FIND_CONSTRUCTION_SITES
    //     }
    //     Inventory.invCreeps();
    // }
    static update() {
        for (let r in Game.rooms) {
            let room = Game.rooms[r];
            // room.memory['energy'] = room.memory['energyCapacity'] = 0;
            delete room.memory['creep_roles']; //needs to be rebuilt.

            if (!room.memory.source) Inventory.invRoomSources(room);
            if (!room.memory.mineral) Inventory.invRoomMinerals(room);

            Inventory.invRoomStructures(room);
        }
        Inventory.invCreeps();
    }

    static room_count(type: string, room: Room): number {
        if (room.memory[type])
            return Object.keys(room.memory[type]).length;
        else
            return 0;
    }

    static room_count_creeps(role: string, room: Room): number {
        if (room.memory['creep_roles'] && room.memory['creep_roles'][role])
            return Object.keys(room.memory['creep_roles'][role]).length;
        else
            return 0;
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

    static invRoomMinerals(room: Room) {
        let minerals = <Mineral[]>room.find(FIND_MINERALS);
        if (!room.memory['mineral']) room.memory['mineral'] = {};
        for (let s in minerals) {
            let mineral = minerals[s];
            if (!room.memory['mineral'][mineral.id])
                room.memory['mineral'][mineral.id] = {};
        }
    }

    // invRoomSpawns(room: Room) {
    //     let spawns = <Spawn[]>room.find(FIND_MY_SPAWNS);
    //     room.memory.spawns = {};
    //     for (let s in spawns) {
    //         let spawn = spawns[s];
    //         room.memory.spawns[spawn.id] = {};
    //     }
    // }

    static invRoomStructures(room: Room) {
        let structures = <Structure[]>room.find(FIND_STRUCTURES);
        // room.memory.structures = {};
        for (let s in structures) {
            let structure = structures[s];
            if (!room.memory[structure.structureType])
                room.memory[structure.structureType] = {};

            if (!room.memory[structure.structureType][structure.id])
                room.memory[structure.structureType][structure.id] = {};
            // console.log(structure.structureType);

            // if (structure.structureType == 'spawn' || structure.structureType == 'extension') {
            //     room.memory['energy'] += (<Spawn>structure).energy;
            //     room.memory['energyCapacity'] += (<Spawn>structure).energyCapacity;
            // }
        }
    }

    static invCreeps() {
        // if (!Memory['creep_roles']) Memory['creep_roles'] = {};

        //Clear out the old memory:
        for (let name in Memory.creeps) {
            // Game.getObjectById()
            if (!Game.creeps[name]) {
                console.log('Deleting ' + Memory.creeps[name].role + " creep " + name + " from memory. Cost(" + Memory.creeps[name].cost + ")");
                // if (Memory['creep_roles'][Memory.creeps[name].role] && Memory['creep_roles'][Memory.creeps[name].role][name])
                //     delete Memory['creep_roles'][Memory.creeps[name].role][name];
                delete Memory['creeps'][name];
            }
        }

        for (let c in Game.creeps) {
            // console.log(c);
            let creep = <Creep>Game.creeps[c];
            // let role = creep.memory.role,
            //     name = creep.name;
            // if (!Memory['creep_roles'][role]) Memory['creep_roles'][role] = {};
            // Memory['creep_roles'][role][name] = {};
            Inventory.invCreepObj(creep);
        }
    }

    // static invCreep(creep:Creep) {
    //     if (typeof role == "object") {
    //         name = role.name;
    //         role = <Creep>role.memory.role;
    //     }

    //     if (!Memory['creep_roles'][role]) Memory['creep_roles'][role] = {}
    //     Memory['creep_roles'][role][name] = {};
    // }

    // static invCreep(role: any, name?: string) {
    //     // let role: string, name: string;
    //     if (typeof(role) == "object") {
    //         name = (<Creep>role).name;
    //         role = (<Creep>role).memory.role;
    //     }

    //     if (!Memory['creep_roles'][role]) Memory['creep_roles'][role] = {}
    //     Memory['creep_roles'][role][name] = {};
    //     this.creep_cache[]
    // }
    static invCreepObj(creep: Creep) {
        let role: string = creep.memory.role,
            name: string = creep.name,
            room: Room = creep.room;

        this.invCreep(role, name, room);
    }

    static invCreep(role: string, name: string, room: Room) {
        if (!room.memory['creep_roles']) room.memory['creep_roles'] = {};
        if (!room.memory['creep_roles'][role]) room.memory['creep_roles'][role] = {};
        room.memory['creep_roles'][role][name] = {};

        // if (!Memory['creep_roles'][role]) Memory['creep_roles'][role] = {}
        // Memory['creep_roles'][role][name] = {};
    }


    // static creeps_by_role(role) {
    //     if (Memory['creep_roles'] && Memory['creep_roles'][role])
    //         return Object.keys(Memory['creep_roles'][role]);
    // }

    // static creeps_role_count(role):number {
    //     if (Memory['creep_roles'] && Memory['creep_roles'][role])
    //         return Object.keys(Memory['creep_roles'][role]).length;
    //     else
    //         return 0;
    // }

    // static creep_weights() {
    //     return {
    //         worker: (1 + Inventory.creeps_role_count('worker')),
    //         guard: (1 + Inventory.creeps_role_count('guard')) * 2
    //     };
    // }

    // static creep_should_build() {
    //     let weights = Inventory.creep_weights();
    //     let build_value, build_role;
    //     for (let i in weights) {
    //         let value = weights[i];
    //         if (build_value == undefined || value < build_value) {
    //             build_value = value;
    //             build_role = i;
    //         }
    //     }
    //     if (build_value <= Globals.MAX_UNITS_METRIC)
    //         return build_role;
    // }
}