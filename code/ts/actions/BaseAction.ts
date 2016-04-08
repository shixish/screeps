/// <reference path="../vars/Globals.ts" />
"use strict";
class BaseAction{ //Abstract class
    public actor;
    public target;
    public action_name = 'Unknown';

    constructor(actor) {
        this.actor = actor;
        // console.log(this.actor);
        if (this.actor.memory.target_id)
            this.target = Game.getObjectById(this.actor.memory.target_id);
        // this.action_name = this.actor.memory.action_name;
    }

    getTargets() {

    }
    
    try() {
        let targets = this.getTargets();
        if (targets){
            return this.setTargets(targets);
        }
    }

    perform() {
        this.move();
    }

    getTargetRange(obj) {
        // if (obj.structureType && obj.structureType == STRUCTURE_CONTAINER) range = 0;
        return 1;
    }

    setTargets(targets) {
        if (!targets) return false;
        if (targets.length == undefined && typeof targets == "object") targets = [targets];

        // console.log('targets', targets, typeof targets, targets != undefined, targets != null, !!targets.length);
        // debug.log(targets);

        if (targets && targets.length > 0) {
            let target_obj = BaseAction.getClosestByPath(this.actor, targets, this.getTargetRange);
            if (target_obj.target) {
                this.actor.memory.target_id = target_obj.target.id;
                this.actor.memory.target_path = Room.serializePath(target_obj.path);
                this.actor.memory.action_name = this.action_name;
                this.actor.memory.target_x = target_obj.target.pos.x;
                this.actor.memory.target_y = target_obj.target.pos.y;
                return true;
            }
        }
        return false;
    }


    static getReverseDirection(direction) {
        switch (direction) {
            case TOP: return BOTTOM;
            case TOP_RIGHT: return BOTTOM_LEFT;
            case RIGHT: return LEFT;
            case BOTTOM_RIGHT: return TOP_LEFT;
            case BOTTOM: return TOP;
            case BOTTOM_LEFT: return TOP_RIGHT;
            case LEFT: return RIGHT;
            case TOP_LEFT: return BOTTOM_RIGHT;
        }
    }

    static getDirectionFrom(from, to) {
        var x = from.x
        var y = from.y
        // Node is to the left
        if (to.x < x) {
            // Node is to the top
            if (to.y < y) return TOP_LEFT;//8

            // Node is on the same level
            if (to.y == y) return LEFT;//7

            // Node is to the bottom
            if (to.y > y) return BOTTOM_LEFT;//6
        }

        if (to.x == x) {
            // Node is to the top
            if (to.y < y) return TOP;//1

            // Node is to the bottom
            if (to.y > y) return BOTTOM;//5
        }

        // Node is to the right
        if (to.x > x) {
            // Node is to the top
            if (to.y < y) return TOP_RIGHT;//2

            // Node is on the same level
            if (to.y == y) return RIGHT;//3

            // Node is to the bottom
            if (to.y > y) return BOTTOM_RIGHT;//4
        }
    }

    static getClosestByPath(actor, targets, range?:Function) {

        let target;
        let target_path = [];

        // range = range == undefined ? 1 : range;

        if (targets && targets.length > 0) {
            // let goals = _.map(targets, function(obj) {
            //     // We can't actually walk on sources-- set `range` to 1 so we path next to it.
            //     let range = 1;
            //     if (obj.structureType && obj.structureType == STRUCTURE_CONTAINER) range = 0;
            //     return { pos: obj.pos, range: range };
            // });
            let goals = _.map(targets, function(obj) {
                // We can't actually walk on sources-- set `range` to 1 so we path next to it.
                return { pos: obj.pos, range: range(obj) };
            });

            // debug.log(goals);

            // let pathfinder_obj = {
            //     // We need to set the defaults costs higher so that we
            //     // can set the road cost lower in `roomCallback`
            //     plainCost: 2,
            //     swampCost: 10,

            //     roomCallback: function(roomName) {
            //         let room = Game.rooms[roomName];
            //         // In this example `room` will always exist, but since PathFinder 
            //         // supports searches which span multiple rooms you should be careful!
            //         if (!room) return;
            //         let costs = new PathFinder.CostMatrix;
            //         room.find(FIND_STRUCTURES).forEach(function(structure:Structure) {
            //             if (structure.structureType === STRUCTURE_ROAD) {
            //                 // Favor roads over plain tiles
            //                 costs.set(structure.pos.x, structure.pos.y, 1);
            //             } else if (structure.structureType !== STRUCTURE_RAMPART || !structure.my) {
            //                 // Can't walk through buildings, except for our own ramparts
            //                 costs.set(structure.pos.x, structure.pos.y, 0xff);
            //             }
            //         });
            //         // Avoid creeps in the room
            //         room.find(FIND_CREEPS).forEach(function(creep:Creep) {
            //             costs.set(actor.pos.x, actor.pos.y, 0xff);
            //         });
            //         return costs;
            //     },
            // }

            let results = PathFinder.search(actor.pos, goals);
            // console.log(goals[0].pos, Object.keys(path), path.path, path.ops);

            if (results.path) {
                let parent = actor.pos;
                for (let step of results.path) {
                    let dx = step.x - parent.x;
                    let dy = step.y - parent.y;
                    let direction = this.getDirectionFrom(parent, step)
                    target_path.push({
                        'x': step.x,
                        'y': step.y,
                        'dx': dx,
                        'dy': dy,
                        'direction': direction
                    });
                    parent = step;
                }
                for (let i in targets) {
                    // console.log(parent.x, parent.y, targets[i].pos.x, targets[i].pos.y)
                    // console.log(i, targets[i], targets[i].pos.x, targets[i].pos.y)
                    if (Math.abs(parent.x - targets[i].pos.x) <= 1 && Math.abs(parent.y - targets[i].pos.y) <= 1) {
                        target = targets[i];
                        break;
                    }
                }
            }
        }

        return {
            target: target,
            path: target_path
        };
    }
    
    // moving() {
    //     // console.log(creep);
    //     // let action = this.experimental_move(this.target);
    //     // var path = this.actor.pos.findPathTo(this.target);
    //     // console.log(Object.keys(path[0]));
    //     // console.log(path[0].x, path[0].y, path[0].dx, path[0].dy, path[0].direction);
    //     if (this.target.pos.x == this.actor.pos.x && this.target.pos.y == this.actor.pos.y) return false;
    //     let action = this.move();
    //     if (action == ERR_TIRED) {
    //         this.actor.say('tired');
    //     } else if (action == ERR_BUSY) {
    //         //just wait
    //     } else if (action == ERR_NO_PATH) {
    //         console.log(this.actor.name, "unable to find a path to", this.target);
    //         // this.actor.move(this.actor.pos.getDirectionTo(this.target));
    //         // action = this.experimental_move(this.target);
    //         // if (action == ERR_TIRED) {
    //         //     this.actor.say('tired');
    //         // } else if (action == ERR_BUSY) {
    //         //     //just wait
    //         // } else if (action == ERR_NO_PATH) {
    //         //     console.log(this.actor.name, "unable to find a path to", target);
    //         // }else if (action != 0) {
    //         //     console.log('Error moving:', action);
    //         // }
    //     } else if (action != 0) {
    //         console.log('Error moving:', action);
    //         return false;
    //     }
    //     return false;
    //     // console.log(this.actor.name, 'moving', action);
    //     // return false;
    // }

    move() {
        // if (this.actor.name == 'Katherine')
        //     console.log(this.actor.name, this.actor.memory.role, this.actor.pos.x, this.actor.memory.target_x, ', ', this.actor.pos.y, this.actor.memory.target_y);


        if (this.target && this.actor && !this.actor.pos.inRangeTo(this.target, this.getTargetRange(this.target))) {
            let move = this.actor.moveTo(this.target);
            // console.log(move);
            return move;
        }
        return;

        // let p = this.actor.pos.findPathTo(this.target);
        // return this.actor.moveByPath(p);


        // this.retarget();
        // if (this.actor.memory.target_path){
        //     let path = Room.deserializePath(this.actor.memory.target_path);
        //     console.log(this.actor.memory.target_path, Object.keys(path[0]), path[0].x);
        // }

        //As long as the stored target object is the right target, and we have the stored target_path, try to use it.
        // if (this.target.id != this.actor.memory.target_id) {
        //     console.log('weirdo movement!?');
        //     this.retarget();
        // }

        let path;
        if (!this.actor.memory.target_path) {
            path = this.actor.pos.findPathTo(this.target);
            this.actor.memory.target_path = Room.serializePath(path);
        } else {
            path = Room.deserializePath(this.actor.memory.target_path);
        }

        let move = this.actor.moveByPath(path);
        if (move == ERR_NOT_FOUND) {
            var new_path = this.actor.pos.findPathTo(this.target);
            this.actor.memory.target_path = Room.serializePath(new_path);
            move = this.actor.moveByPath(path);
        }

        // if (move == ERR_TIRED) {
        //     this.actor.say('tired');
        // } else if (move == ERR_NOT_FOUND) {
        //     console.log(creep, 'Error finding path using serialization...');
        //     // debug.log(path);
        //     var new_path = this.actor.pos.findPathTo(this.target);
        //     this.actor.memory.target_path = Room.serializePath(new_path);



        //     // console.log('ERR_NOT_FOUND', Object.keys(path[0]), path[0].x, path[0].y);
        //     // var ezpath = this.actor.pos.findPathTo(this.target);
        //     // // if (ezpath.length) {
        //     // //     console.log('ERR_NOT_FOUND2', Object.keys(ezpath[0]), ezpath[0].x, ezpath[0].y);
        //     // // } else { 
        //     // //     console.log('no path found');
        //     // // }
        //     // move = this.actor.moveByPath(ezpath);
        //     // console.log('ezpath', move);
        //     // return this.actor.moveTo(this.target);
        // }else if (move == ERR_BUSY){
        //     //don't worry about it.
        // }else if (move != 0) {
        //     console.log(creep, 'generic path finding error:', move);
        // }
        return move;
    }


}