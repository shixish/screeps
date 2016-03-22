/// <reference path="../../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
var Globals = require('Globals'),
    Inventory = require('Inventory'),
    CourierCreep = require('CourierCreep'),
    LinkerCreep = require('LinkerCreep');

declare var module: any;
(module).exports = class SpawnController {
    structure: Spawn;

    constructor(structure_id) {
        this.structure = <Spawn>Game.getObjectById(structure_id);
        if (!this.structure) {
            console.log('Unable to find Spawn with ID', structure_id);
            throw "Invalid Object ID";
        }
        this.work();
    }

    work() {
        //These get set by the Inventory process
        var totalEnergy = this.structure.room.memory.energy;
        var totalCapacity = this.structure.room.memory.energyCapacity;

        if (totalEnergy == totalCapacity || totalEnergy >= Globals.MAX_COST) {
            var build_role = Inventory.creep_should_build();
            // console.log('attempting to build: ' + build_role);

            if (build_role){
                var creep_memory = {
                        role: build_role
                    },
                    creep_body = [MOVE],
                    cost = 50;
                function fillBody(bodyParts){
                    var costOfSet = 0, numOfParts = 0;
                    for (var b in bodyParts){
                        costOfSet += Globals.PART_COSTS[bodyParts[b]];
                        numOfParts++;
                    }
                    while (totalEnergy - (cost + costOfSet) > 0 && (creep_body.length + numOfParts) <= 50 && (cost + costOfSet) <= Globals.MAX_COST) {
                        for (var b in bodyParts){
                            creep_body.unshift(bodyParts[b]);
                        }
                        cost += costOfSet;
                    }
                }
                if (build_role == 'worker'){
                    fillBody([MOVE, CARRY, WORK]);
                    fillBody([CARRY, WORK]);
                    fillBody([CARRY]);
                }else if (build_role == 'guard'){
                    fillBody([MOVE, ATTACK, TOUGH, TOUGH]);
                    fillBody([ATTACK, TOUGH, TOUGH]);
                    fillBody([TOUGH]);
                }
                this.structure.room.memory.highest_creep_cost = Math.max(cost, this.structure.room.memory.highest_creep_cost);
                creep_memory['cost'] = cost;
                var response = this.structure.createCreep(creep_body, null, creep_memory);
                if (!(response < 0)){
                    console.log("Making a new " + build_role + " named "  + response + " that costs " + cost);
                }else if (response == ERR_BUSY){
                    //just wait
                }else{
                    console.log("Create creep response:", response);
                }
            } else if (Inventory.creeps_role_count('courier') < 2) {
                this.create_creep(CourierCreep.create(totalEnergy), {
                    role: 'courier'
                });
            } else if (Inventory.creeps_role_count('linker') < Inventory.source_count(this.structure.room)) {
                this.create_creep(LinkerCreep.create(totalEnergy), {
                    role: 'linker'
                });
            } else {
                // console.log('no build role');
            }
        }
    }

    create_creep(creep_body: string[], creep_memory) {
        var response = this.structure.createCreep(creep_body, null, creep_memory);
        if (!(response < 0)) {
            var name = response;
            console.log("Making a new " + creep_memory.role + " named " + name);
            Inventory.invNewCreep(creep_memory.role, name);
            return response;//new creep name
        } else if (response == ERR_BUSY) {
            //just wait
        } else {
            console.log("Create creep response:", response);
        }
    }
}