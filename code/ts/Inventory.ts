/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
var Globals = require('Globals');

declare var module: any;
(module).exports = class Inventory {
    static flush() {
        for (var r in Game.rooms) {
            var room = Game.rooms[r];
            room.memory['energy'] = room.memory['energyCapacity'] = 0;

            if (!room.memory.source) Inventory.invRoomSources(room);

            Inventory.invRoomStructures(room);
        }
        Inventory.invCreeps();
    }

    static update() {
        for (var r in Game.rooms) {
            var room = Game.rooms[r];
            room.memory['energy'] = room.memory['energyCapacity'] = 0;

            if (!room.memory.source) Inventory.invRoomSources(room);

            Inventory.invRoomStructures(room);
        }
        Inventory.invCreeps();
    }

    static invRoomSources(room:Room) {
        var sources = <Source[]>room.find(FIND_SOURCES);
        room.memory['source'] = {};
        for (var s in sources) {
            var source = sources[s];
            room.memory['source'][source.id] = {};
        }
    }

    // invRoomSpawns(room: Room) {
    //     var spawns = <Spawn[]>room.find(FIND_MY_SPAWNS);
    //     room.memory.spawns = {};
    //     for (var s in spawns) {
    //         var spawn = spawns[s];
    //         room.memory.spawns[spawn.id] = {};
    //     }
    // }

    static invRoomStructures(room: Room) {
        var structures = <Structure[]>room.find(FIND_STRUCTURES);
        // room.memory.structures = {};
        for (var s in structures) {
            var structure = structures[s];
            if (!room.memory[structure.structureType])
                room.memory[structure.structureType] = {};

            if (!room.memory[structure.structureType][structure.id])
                room.memory[structure.structureType][structure.id] = {};
            // console.log(structure.structureType);

            if (structure.structureType == 'spawn' || structure.structureType == 'extension') {
                room.memory['energy'] += (<Spawn>structure).energy;
                room.memory['energyCapacity'] += (<Spawn>structure).energyCapacity;
            }
        }
    }

    static invCreeps() {
        if (!Memory['creep_roles']) Memory['creep_roles'] = {};

        //Clear out the old memory:
        for (var name in Memory.creeps) {
            // Game.getObjectById()
            if (!Game.creeps[name]) {
                console.log('Deleting ' + Memory.creeps[name].role + " creep " + name + " from memory. Cost(" + Memory.creeps[name].cost + ")");
                if (Memory['creep_roles'][Memory.creeps[name].role] && Memory['creep_roles'][Memory.creeps[name].role][name])
                    delete Memory['creep_roles'][Memory.creeps[name].role][name];
                delete Memory['creeps'][name];
            }
        }

        for (var c in Game.creeps) {
            // console.log(c);
            var creep = <Creep>Game.creeps[c];
            var role = creep.memory.role,
                name = creep.name;
            if (!Memory['creep_roles'][role]) Memory['creep_roles'][role] = {};
            Memory['creep_roles'][role][name] = {};
        }
    }

    static invNewCreep(role, name) {
        Memory['creep_roles'][role][name] = {};
    }

    static creeps_by_role(role) {
        if (Memory['creep_roles'] && Memory['creep_roles'][role])
            return Object.keys(Memory['creep_roles'][role]);
    }

    static creeps_role_count(role) {
        if (Memory['creep_roles'] && Memory['creep_roles'][role])
            return Object.keys(Memory['creep_roles'][role]).length;
        else
            return 0;
    }

    static creep_weights() {
        return {
            worker: (1 + Inventory.creeps_role_count('worker')),
            guard: (1 + Inventory.creeps_role_count('guard')) * 2
        };
    }

    static creep_should_build() {
        var weights = Inventory.creep_weights();
        var build_value, build_role;
        for (var i in weights) {
            var value = weights[i];
            if (build_value == undefined || value < build_value) {
                build_value = value;
                build_role = i;
            }
        }
        if (build_value <= Globals.MAX_UNITS_METRIC)
            return build_role;
    }
}