module.exports = {
    work: function(creep){
        var targets = creep.room.find(FIND_HOSTILE_CREEPS);
        if(targets.length) {
            var target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {
                // filter: function(obj){
                //     return (
                //         (obj.structureType == STRUCTURE_SPAWN || obj.structureType == STRUCTURE_EXTENSION)
                //         && obj.energy < obj.energyCapacity
                //     );
                // }
            });
            if(target) {
                if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
        }
        else{
            if (Game.flags.attack){
                creep.memory.target_id = Game.flags.attack.id;
                creep.memory.action_name = 'move';
                creep.moveTo(Game.flags.attack);
            }
            // creep.moveTo(Game.flags.attack)
            // creep.moveTo(creep.room.controller);
        }
    },
    make: function(spawn){
        var memory = {
                role: "guard"
            }
            body = [ATTACK, TOUGH, ATTACK, TOUGH, MOVE, MOVE];
        //simple:
        // body = [ATTACK, TOUGH, MOVE];
        return spawn.createCreep([ATTACK, TOUGH, MOVE], null, memory);
    }
};