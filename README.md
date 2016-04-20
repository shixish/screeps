Screeps
===
This is my super-secret code that powers my [Screeps](https://screeps.com/). It's getting complex enough now that I probably should stop sharing it... Wouldn't want to help the competition too much. ;)


Brief overview of my progress:
---

- I **started** the game back in **January of 2016** when I started poking around with the tutorial, etc. I created this repo once I figured out I could deploy code changes using a [Gulp script](https://github.com/shixish/screeps/blob/fb2cbd9f38a847a1aea7036ee1719dac7178c497/gulpfile.js) that made things a lot easier.
- I decided to convert everything over to **TypeScript** back in [March](https://github.com/shixish/screeps/commit/a9623aae1a38ded658adc81ca27e15f64ae11c31). This is when I started using classes to break up the core functionality.
- I discovered that the Screeps game would accept **ES6** code, so I [switched my output](https://github.com/shixish/screeps/commit/e96de71e9f3df3524ec0aefff78c34ab00b00378) to use the native ES6 stuff soon there after.
- Refactored the code to [output one giant file](https://github.com/shixish/screeps/commit/4a6108f647f720f127522c510b00ab09639d52a8) instead of relying on require() statements (which limits you to 15 "module" files). This approach allowed me to really take advantage of class inheritance to further diversify my creep types, etc.
- By the end of March I had managed to get [3 rooms up and running](https://github.com/shixish/screeps/commit/56401efee2425c71c0a71bc7b139dd2cd792c9ce).
- Around this time I started having some conflict with my neighbor who was highly ranked on the ladder. He took out one of my new bases, so it was starting to become a problem. He had neglected his big level 8 base near me. His rampart was down and his four towers were unpowered, so on April 1st I managed to take out his base by sending in some ranged attack minions. His code did put up a decent fight regardless, hiding his ranged attack creeps under ramparts. Once he was cleared out, I was sitting pretty.
- The next day I (luckily) noticed that he had sent a retaliation force from one of his nearby bases. It was pretty rough. It taught me two things: First, healers are epic good, and second, you can use a buff worker creep to tear down enemy structures using dismantle(). It's more effective than attacking it. I managed to hold him off (or really just slow him down) by massing up a swell of ranged attack minions (I actually made too many and nearly bankrupted myself). Lucky for me, he hadn't sent any attacking minions (silly as that sounds), so I managed to stay alive by the skin of my teeth. I think the retaliation force may have just been an automated response, not something he planned specifically. Pretty cool.
- Added a simple [diagnostic profiler](https://github.com/shixish/screeps/commit/cc77620948ffba6fef3b04c6043d2af57654a806) in April to start having a look at where my CPU is being spent.
- Figured out how to use the PTR (private test realm) server for testing new code sometime mid April.
- Managed to finally get remote mining working on [April 18th](https://github.com/shixish/screeps/commit/c6695d18751bb2fe8ca6fe48d073f577ef7da7f3) after figuring out a better way to manage creep spawning and inventory across rooms.


Notes
---
I've been showing up in the [IRC channel](https://webchat.freenode.net/?channels=#screeps) and associated Slack group. It's an interesting group of folks. You can often get some helpful responses if you've got questions about the game, and a few of them have shared code snippets with me here and there.


The code has been coming along... The game has an interesting addictive quality because it gives you a constant sense of urgency. The game is always in motion, there's no pause button. So when your code is broken (basically always), you feel a certain compulsion to fix it, otherwise your little guys will just bash their heads against the wall indefinitely. If you can keep everything moving smoothly then your level continues to rise on it's own, etc. So if you can just get that one cool new feature humming along, then all of your little guys will benefit, and the more area you start to manage, the bigger effect a small change can have. I think this is the best game I've seen for newbies trying to learn programming, while at the same time, it's able to provide an interesting challenge to seasoned programming veterans.

There's still so many things my code has yet to tackle. I've seen some nice micro mechanics out of ranged attack creeps that will back away from approaching melee attackers while firing, and hide away behind rampart bunkers, etc. I haven't started mineral boosting my creeps. I haven't mined any Power. My attack and defense mechanics are still super thin. I'm still just sort of crossing my fingers that nobody starts eyeballing my territory. It would be cool if there were more diplomatic features to the game, more incentive to get along... Right now it seems rather cutthroat.