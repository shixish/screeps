/// <reference path="../vars/Globals.ts" />
/// <reference path="../creeps/BaseCreep.ts" />
"use strict";

class HealerCreep extends BaseCreep {
    public creep: Creep;
    public flag: Flag;

    constructor(creep: Creep) {
        super(creep);

        if (!this.creep.memory.flag) {
            this.creep.memory.flag = this.creep.room.name + '_attack';
            this.flag = <Flag>Game.flags[this.creep.memory.flag];
        } else {
            this.flag = <Flag>Game.flags[this.creep.memory.flag];
        }
        // console.log(this.creep, this.flag)
        // this.retarget();
    }

    retarget() {
        super.retarget();
        // this.flag.remove();
        // this.creep.room.memory.under_attack
        // if (!super.try_targeting('fighting')) {
        
        // if (!super.try_targeting('kiting')) {
        //     if (!super.try_targeting('sieging')) {
        //         if (this.flag) {
        //             this.creep.memory.target_id = this.flag.id;
        //             this.creep.memory.action_name = 'moving';
        //         }
        //     }
        // }
        if (!super.try_targeting('healing')) {
            if (!super.try_targeting('following')) {
                if (this.flag) {
                    super.set_target(this.flag);
                }
            }
        }
    }

    // static create(budget: number) {
    //     // if (budget >= 10*20 + 80*10 + 50*20)
    //     //     return [
    //     //         TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
    //     //         TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
    //     //         ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
    //     //         MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
    //     //         MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
    //     //     ];
    //     if (budget >= 10 * 10 + 80 * 5 + 50 * 10)
    //         return [
    //             TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
    //             ATTACK, ATTACK, ATTACK, ATTACK,
    //             MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
    //         ];
    //     if (budget >= 10*10 + 80*5 + 50*5)
    //         return [
    //             TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
    //             ATTACK, ATTACK, ATTACK, ATTACK,
    //             MOVE, MOVE, MOVE, MOVE, MOVE,
    //         ];
    //     if (budget >= 10*6 + 80*3 + 50*3)
    //         return [
    //             TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, //60
    //             ATTACK, ATTACK, ATTACK, //240
    //             MOVE, MOVE, MOVE, //150
    //         ];
    //     else
    //         return [
    //             TOUGH, TOUGH, TOUGH, TOUGH,
    //             ATTACK, ATTACK, 
    //             MOVE, MOVE, 
    //         ];
    // }

    static creep_tiers = [
        {
            'cost': 250 * 10 + 50 * 10,
            'body': [
                HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, //2500
                MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE  //500
            ],
        },
        {
            'cost': 250 * 5 + 50 * 5,
            'body': [
                HEAL, HEAL, HEAL, HEAL, HEAL,
                MOVE, MOVE, MOVE, MOVE, MOVE
            ],
        },
        {
            'cost': 250 * 2 + 50 * 2,
            'body': [
                HEAL, HEAL, //500
                MOVE, MOVE, //100
            ],
        },
        {
            'cost': 300,
            'body': [
                HEAL,
                MOVE, 
            ],
        },
    ];

}