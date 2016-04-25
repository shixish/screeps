/// <reference path="../vars/Globals.ts" />
/// <reference path="../actions/BaseAction.ts" />
/// <reference path="../actions/AskAction.ts" />
/// <reference path="../actions/AttackAction.ts" />
/// <reference path="../actions/BuildAction.ts" />
/// <reference path="../actions/ClaimAction.ts" />
/// <reference path="../actions/ExtractAction.ts" />
/// <reference path="../actions/FightAction.ts" />
/// <reference path="../actions/GiveAction.ts" />
/// <reference path="../actions/HarvestAction.ts" />
/// <reference path="../actions/HealAction.ts" />
/// <reference path="../actions/MineAction.ts" />
/// <reference path="../actions/PickupAction.ts" />
/// <reference path="../actions/RenewAction.ts" />
/// <reference path="../actions/StoreAction.ts" />
/// <reference path="../actions/TakeAction.ts" />
/// <reference path="../actions/UpgradeAction.ts" />

"use strict";
class BaseCreep { //Abstract class
    public creep: Creep;
        //Note: this was a bad idea, it needs to find out if the target changed right before doing the work:
    // protected target;
    // protected action_name;
    protected flag: Flag;

    constructor(creep: Creep) {
        this.creep = creep;
        /*if (this.creep.memory.office) {
            this.flag = Game.flags[this.creep.memory.office];
        }*/
        if (this.creep.memory.flag) {
            this.flag = Game.flags[this.creep.memory.flag];
        }
    }

    // setTarget(target_obj, action_name) {
    //     if (target_obj.target) {
    //         this.creep.memory.target_id = target_obj.target.id;
    //         this.creep.memory.target_path = Room.serializePath(target_obj.path);
    //         this.creep.memory.action_name = action_name;
    //         this.creep.memory.target_x = target_obj.target.pos.x;
    //         this.creep.memory.target_y = target_obj.target.pos.y;

    //         target = target_obj.target;
    //         action_name = action_name;
    //         return true;
    //     }
    // }

    //This should be extended...
    static creep_tiers = [
        {
            'cost': 50,
            'body': [MOVE],
        },
    ];

    // static get_creep_flag(creep: Creep){
    //     if (!creep.memory.flag) {
    //         //if not set, initialize the creep's flag based on it's room of birth.
    //         creep.memory.flag = creep.room.name + '_runner';
    //         return <Flag>Game.flags[creep.memory.flag];
    //     }else{
    //         return <Flag>Game.flags[creep.memory.flag];
    //     }
    // }

    // //this is no longer necessary:
    // static creep_is_obsolete(creep:Creep){
    //     if (this.creep_tiers && this.creep_tiers[0].cost > creep.memory.cost && creep.room.energyCapacityAvailable > creep.memory.cost) {
    //         //If it's not the highest tier creep and the room budget supports a higher tier:
    //         console.log('obsolete creep costs: ', creep.memory.cost, 'T1 costs', this.creep_tiers[0].cost);
    //         return true;
    //     }
    //     //  else {
    //     //     let role = creep.memory.role;
    //     //     // console.log(creep.room.memory.max_creeps[role]);
    //     //     if (Inventory.room_creep_count(role, room) > creep.room.memory.max_creeps[role]) {
    //     //         return true;
    //     //     }
    //     // }
    //     return false;
    // }

    //could be cached i think...
    static get_heighest_tier(room:Room){
        let budget = room.energyCapacityAvailable;
        for (let t in this.creep_tiers) {
            let tier = this.creep_tiers[t];
            // console.log(tier, tier.cost, room.energyCapacityAvailable);
            if (tier.cost <= budget){
                return tier;
            }
        }
    }

    static get_affordable_tier(room: Room) {
        let budget = room.energyAvailable;
        for (let t in this.creep_tiers) {
            let tier = this.creep_tiers[t];
            // console.log(tier, tier.cost, room.energyAvailable);
            if (tier.cost <= budget) {
                return tier;
            }
        }
    }

    // static produce_new(room:Room){
    //     if (this.creep_tiers) {
    //         return this.get_heighest_tier(room);
    //         // return this.get_affordable_tier(room);
    //     }
    //     // else if (this.create){
    //     //     let body = this.create(room.energyCapacityAvailable);
    //     //     return {
    //     //         'cost': _.reduce(body, (a,b) => { return a+BODYPART_COST[b] }, 0),
    //     //         'body': body,
    //     //     }
    //     // }
    // }

    is_at_home() {
        return this.creep.memory.home == this.creep.pos.roomName;
    }

    is_at_office() {
        return this.creep.memory.office == this.creep.pos.roomName;
    }

    retarget() {
        //Note: This function needs to be extended by child classes
        this.creep.memory.target_id = null;
        this.creep.memory.action_name = null;
    }

    set_target(targets, action?:string) {
        action = action || 'Move';
        if (CreepActions[action]) {
            let ctrl = new CreepActions[action](this.creep);
            return ctrl.setTargets(targets);
        } else {
            console.log('couldn\'t find action', action);
            return false;
        }
    }
    
    try_to(action:string) {
        if (CreepActions[action]) {
            let ctrl = new CreepActions[action](this.creep);
            return ctrl.try();
        } else {
            console.log('couldn\'t find action', action);
            return false;
        }
    }

    // try_to(type: string) {
    //     let targets = this.find_targets(type);
    //     return this.set_target(targets, type);
    // }

    // find_targets(type: string) {
    //     if (CreepActions[type]){
    //         // console.log('found', type);
    //         let ctrl = new CreepActions[type](this.creep);
    //         return ctrl.getTargets();
    //     }else{
    //         console.log('couldn\'t find', type);
    //     }
    // }

    work(is_retry?) {
        let target = Game.getObjectById(this.creep.memory.target_id),
            action_name = this.creep.memory.action_name;
        
        if (this.creep.memory.action_name !== "Renew" && !this.creep.room.memory.under_attack && !this.creep.memory.obsolete && this.creep.ticksToLive < Globals.MIN_TICKS_TO_LIVE) {
            this.try_to('Renew');
        }

        if (CreepActions[action_name]) {
            if (action_name) this.creep.say(action_name);
            else this.creep.say(this.creep.memory.role + ' idle');

            let ctrl = new CreepActions[action_name](this.creep);
            let ret = ctrl.perform();
            if (!ret) {
                this.retarget();
            }
        } else {
            this.retarget();
        }
    }
}