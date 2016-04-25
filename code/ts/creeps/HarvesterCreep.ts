/// <reference path="../vars/Globals.ts" />
/// <reference path="../creeps/BaseCreep.ts" />
/// <reference path="../utils/Inventory.ts" />
"use strict";

class HarvesterCreep extends BaseCreep {
    public creep: Creep;
    public source: Source;
    public link: Link;
    public container: Container;

    constructor(creep: Creep) {
        super(creep);
        var creep_name = this.creep.name;
        // console.log(creep_name, this.creep.memory.source, creep.room.memory.source[this.creep.memory.source].harvester);
        if (!creep.memory.source && this.is_at_office()) {
            // console.log(creep.room.memory.source);
            for (var s in creep.room.memory.source) {
                var harvester_name = creep.room.memory.source[s].harvester;
                if (!harvester_name || (harvester_name && (!Game.creeps[harvester_name] || harvester_name == creep_name))) {
                    creep.room.memory.source[s].harvester = creep_name;
                    this.creep.memory.source = s;
                    break;
                }
            }
        }
        this.source = <Source>Game.getObjectById(creep.memory.source);
        if (this.source) {
            var source_memory = this.source.room.memory.source[this.source.id];
            this.link = <Link>Game.getObjectById(source_memory.link);
            this.container = <Container>Game.getObjectById(source_memory.container);
        }
    }

    retarget() {
        super.retarget();
        // if (!this.source) {//creep got screwed up somehow. Just make it into a generic builder class...
        //     // console.log(this.creep);
        //     this.creep.memory.role = "builder";
        //     this.creep.memory.target_id = this.creep.memory.action_name = null;
        //     return;
        // }
        // console.log(this.link);
        if (!super.try_to('GoOffice')) {
            if (this.creep.carry.energy > 0) {
                // var source_memory = this.source.room.memory.source[this.source.id];
                // if (source_memory.link) {
                //     this.link = <Link>Game.getObjectById(source_memory.link);
                // }
                if (Inventory.room_creep_count('Courier', this.creep.room) > 0 && this.link && this.link.energy < this.link.energyCapacity * 0.90) { //mostly full, links slowly lose energy while they sit...
                    super.set_target(this.link, 'Give');
                } else {
                    if (!super.try_to('Give')) { //Behave as a more generic creep if still in low infrastructure
                        if (!super.try_to('Store')) {
                            if (!super.try_to('Build')) {
                                if (!super.try_to('Upgrade')) {

                                }
                            }
                        }
                    }
                }
            } else {
                super.set_target(this.source, 'Harvest');
            }
        }
    }

    static creep_tiers = [
        {
            'cost': 50*2 + 100 * 6 + 50 * 6, //950
            'body': [
                MOVE, MOVE,
                WORK, WORK, WORK, WORK, WORK, WORK,
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
            ],
        },
        {
            'cost': 50 * 4 + 100 * 4 + 50 * 4, //800
            'body': [
                CARRY, CARRY, CARRY, CARRY,
                WORK, WORK, WORK, WORK,
                MOVE, MOVE, MOVE, MOVE,
            ],
        },
        {
            'cost': 50 * 4 + 100 * 2 + 50 * 2, //500
            'body': [
                CARRY, CARRY, CARRY, CARRY,
                WORK, WORK,
                MOVE, MOVE,
            ],
        },
        {
            'cost': 300,
            'body': [
                CARRY,
                WORK, WORK,
                MOVE,
            ],
        },
    ];

}
CreepControllers['Harvester'] = HarvesterCreep;