module.exports = {
    work: function(creep){
        var targets = creep.room.find(FIND_HOSTILE_CREEPS);
    	if(targets.length) {
    		if(creep.attack(targets[0]) == ERR_NOT_IN_RANGE) {
    			creep.moveTo(targets[0]);
    		}
    	}
    	else{
        	creep.moveTo(Game.flags.attack)
    	   // creep.moveTo(creep.room.controller);
    	}
    },
    make: function(spawn){
        var memory = {
            role: "guard"
        }
        return spawn.createCreep([ATTACK, TOUGH, MOVE], null, memory);
    }
};