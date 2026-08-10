export type Scores = {
  decisionMaking: number;
  mapAwareness: number;
  teamIQ: number;
  objectiveIQ: number;
  gunfightIQ: number;
  adaptability: number;
};

export type Answer = {
  text: string;
  scores: Partial<Scores>;
  correct: boolean;
};

export type Question = {
  mode: "HARDPOINT" | "SEARCH & DESTROY";
  situation: string;
  answers: Answer[];
  explanation: string;
};

const score = (values: Partial<Scores>) => values;

export const questions: Question[] = [
  {
    mode: "HARDPOINT",
    situation: "Your team leads 214–198 with 22 seconds left on the current hill. You have two players inside, one teammate watching the main entry, and the enemy has a close spawn. The next hill is across the map. What is your priority?",
    answers: [
      { text: "Protect the current lead while keeping one player ready to begin the rotation when the timing is safe.", correct: true, scores: score({ decisionMaking: 4, objectiveIQ: 5, teamIQ: 4 }) },
      { text: "Send everyone toward the next hill immediately and give up the remaining time on the current one.", correct: false, scores: {} },
      { text: "Push their spawn alone because removing one enemy should make the next rotation automatic.", correct: false, scores: {} },
      { text: "Stack the hill with all four players so no enemy can touch it before time expires.", correct: false, scores: {} },
    ],
    explanation: "The score makes the remaining hill time valuable. You do not need a reckless full rotation or four-player stack; preserve the lead, keep coverage, and rotate when the tradeoff becomes favorable.",
  },
  {
    mode: "HARDPOINT",
    situation: "The hill has 35 seconds remaining. Your teammate has already reached the next hill and calls that it looks clear. You are currently in a safe power position on the old hill with another teammate. What should you do?",
    answers: [
      { text: "Hold the old hill briefly, then rotate on timing so the team gains remaining points without arriving late to the next setup.", correct: true, scores: score({ decisionMaking: 4, objectiveIQ: 5, mapAwareness: 4 }) },
      { text: "Leave immediately because the next hill is clear and every second away from it is wasted.", correct: false, scores: {} },
      { text: "Stay until the old hill ends completely because leaving an objective early is always a mistake.", correct: false, scores: {} },
      { text: "Push deep into enemy territory to force them away from the next hill before rotating.", correct: false, scores: {} },
    ],
    explanation: "A good rotation balances current points with future positioning. Since the next hill is already secured, you can collect useful time before leaving rather than abandoning guaranteed score too early.",
  },
  {
    mode: "HARDPOINT",
    situation: "Your team controls the hill. Two teammates are watching the same doorway while a third watches the opposite lane. You have a clear view of an unprotected flank route. Where should you position?",
    answers: [
      { text: "Cover the open flank so your team gains another source of information instead of duplicating an existing angle.", correct: true, scores: score({ mapAwareness: 5, teamIQ: 5, decisionMaking: 3 }) },
      { text: "Join the two teammates on the doorway because concentrated fire is safer than splitting your vision.", correct: false, scores: {} },
      { text: "Leave the hill and hunt for a player before the enemy can use the flank route.", correct: false, scores: {} },
      { text: "Stand directly on the hill because objective time matters more than watching an approach.", correct: false, scores: {} },
    ],
    explanation: "The duplicated doorway coverage gives diminishing value. Covering the unattended flank expands the team's information and makes the hill harder to collapse from an unexpected side.",
  },
  {
    mode: "HARDPOINT",
    situation: "Your team is down 172–190 with 28 seconds on the hill. You are the last player outside the objective, and two enemies are confirmed near the main entry. What is the strongest decision?",
    answers: [
      { text: "Take a controlled route toward the hill that creates a trade opportunity instead of sprinting into both enemies alone.", correct: true, scores: score({ decisionMaking: 5, objectiveIQ: 5, teamIQ: 4, gunfightIQ: 3 }) },
      { text: "Challenge both enemies immediately because the team needs kills more than it needs another route.", correct: false, scores: {} },
      { text: "Wait for the hill to end and then start preparing for the next one from spawn.", correct: false, scores: {} },
      { text: "Flank the entire map even if the hill expires before you can influence the fight.", correct: false, scores: {} },
    ],
    explanation: "You are behind, so the hill is the immediate win-condition pressure. A controlled route that can create a trade is more useful than a low-percentage two-player challenge or a flank that arrives too late.",
  },
  {
    mode: "HARDPOINT",
    situation: "You are first to the next hill with no enemy confirmed. Your teammates are four seconds behind you. The hill has two obvious entrances and one strong defensive head-glitch nearby. What should you prioritize?",
    answers: [
      { text: "Take the defensible position that gives you information while keeping an escape or trade route for your teammates.", correct: true, scores: score({ mapAwareness: 5, objectiveIQ: 4, teamIQ: 5 }) },
      { text: "Stand in the center of the hill so every entrance is equally visible from one spot.", correct: false, scores: {} },
      { text: "Push beyond the hill to find the enemy before they can reach the objective.", correct: false, scores: {} },
      { text: "Hide until teammates arrive because being first means you should avoid taking any information risk.", correct: false, scores: {} },
    ],
    explanation: "Being first is valuable because it lets you establish information and a defensible setup. A strong position also lets teammates trade you instead of leaving the first player isolated.",
  },
  {
    mode: "HARDPOINT",
    situation: "You are holding a lane when your teammate gets a kill and moves to cover a different approach. The lane they left is now completely open. The hill is still safe. What should you do?",
    answers: [
      { text: "Adjust your position to restore coverage rather than continuing to watch an angle that is already covered elsewhere.", correct: true, scores: score({ adaptability: 5, teamIQ: 5, mapAwareness: 4 }) },
      { text: "Follow your teammate to the new angle so two players can reinforce the same threat.", correct: false, scores: {} },
      { text: "Leave the hill because the enemy just lost a player and the map is temporarily safe.", correct: false, scores: {} },
      { text: "Keep the exact same position because changing after a teammate's kill creates unnecessary movement.", correct: false, scores: {} },
    ],
    explanation: "A teammate's movement changes the team's coverage. Good players continuously update the defensive shape instead of treating the original setup as permanent.",
  },
  {
    mode: "HARDPOINT",
    situation: "The enemy has 20 seconds left on the hill. Your team has a 12-point lead and three players alive near the next rotation. One enemy is isolated outside the hill. What should influence your choice to challenge them?",
    answers: [
      { text: "Whether the challenge helps secure the next setup without creating a death that gives the enemy an easier route back.", correct: true, scores: score({ decisionMaking: 5, adaptability: 4, objectiveIQ: 5 }) },
      { text: "Whether the isolated player has a weak weapon, because favorable gunfights should always be taken.", correct: false, scores: {} },
      { text: "Whether getting the kill would make the scoreboard look safer before the next hill.", correct: false, scores: {} },
      { text: "Whether your teammate can watch the old hill, because the isolated player should be challenged regardless.", correct: false, scores: {} },
    ],
    explanation: "The lead changes the risk calculation. A kill is useful only if its value outweighs the chance of losing positioning or giving the enemy a better route into the next hill.",
  },
  {
    mode: "HARDPOINT",
    situation: "Your team loses two players while defending. The enemy takes the hill, but you know one enemy is low and another is rotating early. Your two remaining teammates are close together. What is the best adjustment?",
    answers: [
      { text: "Use the information to decide which threat matters first and create a coordinated re-entry instead of two separate challenges.", correct: true, scores: score({ adaptability: 5, teamIQ: 5, decisionMaking: 5 }) },
      { text: "Have both teammates immediately challenge the hill from the same doorway to maximize speed.", correct: false, scores: {} },
      { text: "Ignore the rotation because the current hill is the only location that can score points.", correct: false, scores: {} },
      { text: "Chase the low enemy alone because removing a damaged player is always the highest priority.", correct: false, scores: {} },
    ],
    explanation: "The situation changed from a stable defense to a retake. The confirmed information should shape the re-entry timing, while grouping for a trade keeps the remaining players from becoming isolated.",
  },
  {
    mode: "HARDPOINT",
    situation: "The next hill is spawning soon. Your team has favorable map control, but the enemy is already moving toward the rotation. You can either hold your current safe position or contest a risky choke for earlier control. Which is better?",
    answers: [
      { text: "Take the choke only if it preserves your team's ability to regroup; otherwise keep the safer control and arrive together.", correct: true, scores: score({ decisionMaking: 5, mapAwareness: 5, teamIQ: 4 }) },
      { text: "Always contest the choke because earlier map control is worth any number of isolated deaths.", correct: false, scores: {} },
      { text: "Stay completely passive until the hill activates so no teammate can be caught outside the objective.", correct: false, scores: {} },
      { text: "Send the fastest player alone while the other three remain behind regardless of enemy pressure.", correct: false, scores: {} },
    ],
    explanation: "Early control matters, but not if it destroys the team's ability to trade and regroup. The best choice depends on whether the choke can be taken without splitting the roster into losing fights.",
  },
  {
    mode: "HARDPOINT",
    situation: "You hear an enemy called on one side of the hill, but your teammate's last position was on the opposite side. You have no visual confirmation and the minimap is briefly quiet. What should you do?",
    answers: [
      { text: "Use the call as a probability, keep your teammate's position in mind, and avoid exposing yourself to an unconfirmed route.", correct: true, scores: score({ mapAwareness: 5, decisionMaking: 5, adaptability: 4 }) },
      { text: "Assume the call means the entire enemy team is on that side and push the opposite lane.", correct: false, scores: {} },
      { text: "Ignore the call completely because information without a visual is never useful.", correct: false, scores: {} },
      { text: "Move into the open so you can react to either side at the same time.", correct: false, scores: {} },
    ],
    explanation: "A call should update your expectations without becoming certainty. Combining it with your teammate's known position gives you a better read than either piece of information alone.",
  },
  {
    mode: "HARDPOINT",
    situation: "Your team is down 40 points late in the game. The current hill is lost, but your best player has a clean route to the next hill while two enemies are chasing them. What should the rest of the team do?",
    answers: [
      { text: "Support the rotation and create trade pressure so the player reaching the next hill is not isolated.", correct: true, scores: score({ teamIQ: 5, objectiveIQ: 5, decisionMaking: 4 }) },
      { text: "Stay on the old hill until the timer ends because leaving before the enemy does gives up information.", correct: false, scores: {} },
      { text: "Chase the two enemies behind the rotation so the team can recover those kills first.", correct: false, scores: {} },
      { text: "Split into three different lanes so someone is guaranteed to find an enemy before the next hill.", correct: false, scores: {} },
    ],
    explanation: "When the old hill is no longer valuable, the next objective becomes the team's path back into the game. Supporting the rotation protects the player who already created the opening.",
  },
  {
    mode: "HARDPOINT",
    situation: "You are anchoring a spawn while your teammates hold the hill. The enemy has not appeared for several seconds, but the next hill favors a different side of the map. What should you watch for?",
    answers: [
      { text: "Maintain the useful spawn while staying alert to the timing that makes your position no longer worth the risk.", correct: true, scores: score({ mapAwareness: 5, decisionMaking: 5, adaptability: 5 }) },
      { text: "Keep the spawn forever because giving it up at any point automatically loses the next hill.", correct: false, scores: {} },
      { text: "Leave immediately and run to the hill even if the current spawn is helping your teammates.", correct: false, scores: {} },
      { text: "Push into the enemy side to force a spawn change before your teammates can rotate.", correct: false, scores: {} },
    ],
    explanation: "Spawn control is valuable because it affects future positioning, but its value changes with timing. A strong anchor recognizes when staying alive and preserving the spawn stops helping the next objective.",
  },
  {
    mode: "HARDPOINT",
    situation: "You are inside the hill with 12 seconds left. Your teammate calls that two enemies are coming from the same lane, while another teammate is rotating. What should you do?",
    answers: [
      { text: "Hold a tradeable defensive position and focus on surviving the final seconds while the rotating teammate prepares the next setup.", correct: true, scores: score({ objectiveIQ: 5, teamIQ: 5, decisionMaking: 4 }) },
      { text: "Leave the hill to fight both enemies outside because removing them is worth more than the final seconds.", correct: false, scores: {} },
      { text: "Stand in the open center so you can shoot either enemy before they enter.", correct: false, scores: {} },
      { text: "Push into their route alone because the rotating teammate can replace your position later.", correct: false, scores: {} },
    ],
    explanation: "With only 12 seconds remaining, survival and trades are the priority. You already have a teammate rotating, so leaving the hill to chase kills creates more risk than value.",
  },
  {
    mode: "SEARCH & DESTROY",
    situation: "It is round 8. Your team leads 5–2. You have first blood and a 4v3 advantage with 45 seconds left. The bomb is down in a safe location. What should guide the next play?",
    answers: [
      { text: "Protect the numbers advantage and bomb position, forcing the opponents to take the difficult decision instead of giving them a free fight.", correct: true, scores: score({ decisionMaking: 5, teamIQ: 5, objectiveIQ: 5 }) },
      { text: "Push every remaining enemy immediately because a 4v3 advantage is strongest when converted into more kills.", correct: false, scores: {} },
      { text: "Split all four players across the map so every possible flank can be challenged alone.", correct: false, scores: {} },
      { text: "Give up the bomb location and hunt the enemy spawn because the round lead makes risk irrelevant.", correct: false, scores: {} },
    ],
    explanation: "A 4v3 with the bomb secured is already a strong winning state. The correct play reduces unnecessary risk and makes the opponents break the setup rather than handing them isolated gunfights.",
  },
  {
    mode: "SEARCH & DESTROY",
    situation: "Your team is down 2v3 with 48 seconds left. You have the bomb and have not been spotted. One teammate wants to hit the closest site immediately, while another suggests taking map control first. What should you consider?",
    answers: [
      { text: "Whether the route creates a favorable first engagement and keeps enough time to plant rather than forcing a predictable 2v3 entry.", correct: true, scores: score({ decisionMaking: 5, mapAwareness: 5, objectiveIQ: 4 }) },
      { text: "The fastest possible plant regardless of enemy information because time remaining is the only important resource.", correct: false, scores: {} },
      { text: "Splitting up so each teammate can search a different bomb site before choosing where to plant.", correct: false, scores: {} },
      { text: "Waiting until the last ten seconds because the enemy cannot safely move once the clock is low.", correct: false, scores: {} },
    ],
    explanation: "A 2v3 needs a plan that can create a favorable first fight while preserving enough time for the objective. The best route balances information, timing, and the plant rather than blindly rushing.",
  },
  {
    mode: "SEARCH & DESTROY",
    situation: "You are in a 2v2. Your teammate gets a pick, making it 2v1, but then immediately starts chasing the last enemy. The bomb is still safe and you have strong site control. What should you do?",
    answers: [
      { text: "Keep the strong objective position and support the chase only when it does not give the last player an escape or timing advantage.", correct: true, scores: score({ decisionMaking: 5, objectiveIQ: 5, teamIQ: 4 }) },
      { text: "Sprint after the last enemy immediately because every Search and Destroy round should end with a final kill.", correct: false, scores: {} },
      { text: "Leave the site and guard your spawn because the bomb is already safe enough to ignore.", correct: false, scores: {} },
      { text: "Stop communicating so the last enemy cannot use your teammate's information against you.", correct: false, scores: {} },
    ],
    explanation: "The 2v1 is already highly favorable. Preserving the bomb and site control limits the opponent's options, while an unnecessary chase can turn a controlled round into a timing mistake.",
  },
  {
    mode: "SEARCH & DESTROY",
    situation: "Your team is on defense in a 3v3. You hear the bomb carrier near one site, but two enemies were last seen on the other side. You have 35 seconds left. How should you rotate?",
    answers: [
      { text: "Move with enough speed to support the threatened site while keeping a route that prevents an easy late flank.", correct: true, scores: score({ mapAwareness: 5, decisionMaking: 5, adaptability: 4 }) },
      { text: "Commit all three defenders to the bomb carrier's side immediately, regardless of where the other enemies were seen.", correct: false, scores: {} },
      { text: "Stay exactly where you are until the bomb is planted because moving early creates too much risk.", correct: false, scores: {} },
      { text: "Push the opposite side alone to catch the two players who were last seen there.", correct: false, scores: {} },
    ],
    explanation: "The bomb carrier is the immediate objective threat, but the other two players still matter. A controlled rotation keeps support available without opening an obvious flank or abandoning useful information.",
  },
  {
    mode: "SEARCH & DESTROY",
    situation: "You are attacking in a 3v3. Your teammate gets first blood, but the enemy immediately stops showing on the expected lane. You still have 70 seconds. What adjustment is strongest?",
    answers: [
      { text: "Slow the pace enough to gather new information and avoid giving the remaining defenders an easy trade.", correct: true, scores: score({ adaptability: 5, decisionMaking: 5, mapAwareness: 5 }) },
      { text: "Keep pushing the same lane because the first kill proves the original route is working.", correct: false, scores: {} },
      { text: "Send every player through the opposite lane without checking whether the defenders have rotated.", correct: false, scores: {} },
      { text: "Stop moving completely until the enemy reveals every remaining position.", correct: false, scores: {} },
    ],
    explanation: "The first kill changed the defensive shape. With plenty of time, you can exploit that uncertainty by collecting information instead of repeating the same entry and offering an easy trade.",
  },
  {
    mode: "SEARCH & DESTROY",
    situation: "You are defending a 2v2. One enemy is confirmed at the bomb site and the other has not been seen. Your teammate is holding a safe cross. What is your job?",
    answers: [
      { text: "Use the confirmed information to pressure the site while keeping your position connected to the teammate's cross.", correct: true, scores: score({ teamIQ: 5, mapAwareness: 5, decisionMaking: 4 }) },
      { text: "Push past the confirmed player alone so you can find the missing enemy before the plant begins.", correct: false, scores: {} },
      { text: "Leave the site and search the map because the missing player is more important than the bomb.", correct: false, scores: {} },
      { text: "Hold your original angle and refuse to move because the teammate already has a cross.", correct: false, scores: {} },
    ],
    explanation: "The confirmed site player is the immediate objective threat. Staying connected to the teammate's cross gives you a chance to pressure the plant without creating an isolated fight against the unknown player.",
  },
  {
    mode: "SEARCH & DESTROY",
    situation: "You are in a 1v2 with the bomb down and 32 seconds remaining. Both enemies know roughly where you are, but they have not entered together. What is the strongest goal?",
    answers: [
      { text: "Create separate fights and use the bomb timer to force the defenders to expose themselves instead of taking a fair 1v2.", correct: true, scores: score({ decisionMaking: 5, adaptability: 5, objectiveIQ: 5 }) },
      { text: "Challenge the first enemy you see immediately because waiting gives both players more time to coordinate.", correct: false, scores: {} },
      { text: "Run directly to the opposite side of the map and ignore the bomb until the enemies chase you.", correct: false, scores: {} },
      { text: "Stand still beside the bomb because the defenders must eventually walk into your crosshair.", correct: false, scores: {} },
    ],
    explanation: "The bomb is your leverage. A 1v2 becomes more manageable when you force the defenders to approach on different timings rather than accepting a clean two-player collapse.",
  },
  {
    mode: "SEARCH & DESTROY",
    situation: "Your team leads 3–1 in rounds. You are defending a 4v3 with 55 seconds left. An enemy is spotted far from the bomb sites. What should the team avoid?",
    answers: [
      { text: "Avoid turning the numbers advantage into isolated chases that give the attackers a chance to create equal trades.", correct: true, scores: score({ decisionMaking: 5, teamIQ: 5, adaptability: 4 }) },
      { text: "Avoid watching the bomb sites because the spotted player is guaranteed to be the bomb carrier.", correct: false, scores: {} },
      { text: "Avoid communicating because the attackers could learn your positions from repeated callouts.", correct: false, scores: {} },
      { text: "Avoid using cover because passive defense makes it impossible to finish the round quickly.", correct: false, scores: {} },
    ],
    explanation: "A 4v3 already gives the defense a strong margin. The main danger is allowing the attackers to isolate defenders one at a time while chasing a distant player.",
  },
  {
    mode: "SEARCH & DESTROY",
    situation: "You are attacking a site with a 3v2 advantage. Your entry player gets a kill but dies, leaving a 2v1. The bomb is still in your control. What should the remaining players do?",
    answers: [
      { text: "Use the numbers and bomb to force the last defender into a predictable response while staying close enough to trade.", correct: true, scores: score({ teamIQ: 5, objectiveIQ: 5, decisionMaking: 5 }) },
      { text: "Split to opposite corners so the last defender cannot see both players at once.", correct: false, scores: {} },
      { text: "Chase the last defender immediately because the entry death means the round is now fragile.", correct: false, scores: {} },
      { text: "Wait until the final seconds before planting because planting early removes your advantage.", correct: false, scores: {} },
    ],
    explanation: "The attackers still have the advantage and the bomb. Staying connected creates trade potential while the objective forces the final defender to act.",
  },
  {
    mode: "SEARCH & DESTROY",
    situation: "You are defending a 3v3 with 18 seconds left and the bomb is not planted. Your teammate hears a late sound cue near the opposite site. What is the best response?",
    answers: [
      { text: "Reposition toward the likely threat without abandoning the other site so the enemy cannot win through a single late rotation.", correct: true, scores: score({ mapAwareness: 5, adaptability: 5, objectiveIQ: 5 }) },
      { text: "Send everyone to the sound immediately because 18 seconds is too short for the attackers to change plans.", correct: false, scores: {} },
      { text: "Ignore the cue because late information is less reliable than the original defensive setup.", correct: false, scores: {} },
      { text: "Push the enemy spawn so the attackers cannot reach either site before the clock expires.", correct: false, scores: {} },
    ],
    explanation: "Late-round information is especially valuable because the attackers have little time left. The goal is to cover the likely threat while preserving enough site coverage to prevent a simple fake.",
  },
  {
    mode: "HARDPOINT",
    situation: "The score is 249–247 and the hill has 18 seconds remaining. Your teammate is on the hill while you have a clean angle on an enemy rotating toward the next one. What should you prioritize?",
    answers: [
      { text: "Protect the current two-point lead first, then take the rotation fight only if it does not expose the hill.", correct: true, scores: score({ objectiveIQ: 5, decisionMaking: 5, teamIQ: 4 }) },
      { text: "Chase the rotating enemy because stopping the next hill is more important than the current score.", correct: false, scores: {} },
      { text: "Leave your teammate alone on the hill so you can guarantee the enemy cannot rotate.", correct: false, scores: {} },
      { text: "Push into the enemy spawn because a final kill would make the winning position safer.", correct: false, scores: {} },
    ],
    explanation: "At 249–247, every remaining hill second is extremely valuable. The next hill matters, but not at the cost of abandoning the immediate win condition.",
  },
  {
    mode: "HARDPOINT",
    situation: "The score is 118–121. Your team has a two-player advantage on the hill, but the enemy has a favorable spawn. You are outside with a choice between contesting a strong angle or joining the hill. What matters most?",
    answers: [
      { text: "Whether your outside position protects the hill from the likely re-entry better than adding another body to an already-stable setup.", correct: true, scores: score({ decisionMaking: 5, objectiveIQ: 4, mapAwareness: 5 }) },
      { text: "Always join the hill because more players inside means the objective is automatically safer.", correct: false, scores: {} },
      { text: "Always challenge the enemy spawn because favorable spawns should never be respected.", correct: false, scores: {} },
      { text: "Leave the area and prepare the next hill even though the current hill is still contested.", correct: false, scores: {} },
    ],
    explanation: "Two players already have the hill. If your outside angle blocks or informs the likely re-entry, it may provide more value than adding a third player to the same space.",
  },
  {
    mode: "HARDPOINT",
    situation: "Your team is down 30 points. You have a 3v2 advantage around the current hill, but the enemy has one player already set up on the next rotation. What is the best team call?",
    answers: [
      { text: "Convert the current numbers advantage into hill time while one player begins pressuring the next setup when the timing is safe.", correct: true, scores: score({ objectiveIQ: 5, teamIQ: 5, decisionMaking: 5 }) },
      { text: "Send all three players to the next hill because being behind means every future second matters more.", correct: false, scores: {} },
      { text: "Keep all three players on the current hill until it ends because splitting attention always loses objectives.", correct: false, scores: {} },
      { text: "Ignore the next hill completely because the enemy has only one player there.", correct: false, scores: {} },
    ],
    explanation: "Being behind increases the value of efficient rotations, but you still need the current hill. The best split converts the present advantage while creating pressure on the next objective.",
  },
  {
    mode: "SEARCH & DESTROY",
    situation: "You are attacking in a 4v4. Your first player dies without getting a kill, but you now know the defender's exact angle. Your team has 65 seconds. What should happen next?",
    answers: [
      { text: "Use the information to change the entry timing or route so the death creates a useful opening instead of being repeated.", correct: true, scores: score({ adaptability: 5, decisionMaking: 5, mapAwareness: 4 }) },
      { text: "Send the next player through the same angle immediately because the defender has already fired their first shots.", correct: false, scores: {} },
      { text: "Ignore the information and switch sites without communicating why the first route failed.", correct: false, scores: {} },
      { text: "Wait until the final ten seconds so the defender cannot move away from the known angle.", correct: false, scores: {} },
    ],
    explanation: "The death still produced information. With 65 seconds, the team has time to adapt the entry and exploit the defender's known position instead of feeding another isolated challenge.",
  },
  {
    mode: "SEARCH & DESTROY",
    situation: "You have a 2v2 after planting the bomb. One teammate wants to hold the site while you take a long flank. The enemies are both unconfirmed. What is the safest structure?",
    answers: [
      { text: "Keep the players close enough to trade while using different lines of sight so the retake cannot clear both defenders with one fight.", correct: true, scores: score({ teamIQ: 5, objectiveIQ: 5, mapAwareness: 5 }) },
      { text: "Take the longest possible flank because the bomb timer gives you unlimited time to find the last players.", correct: false, scores: {} },
      { text: "Stack directly on the bomb so both players can shoot the same doorway at once.", correct: false, scores: {} },
      { text: "Leave the site entirely and hunt the enemy because the bomb will force them to chase you.", correct: false, scores: {} },
    ],
    explanation: "After the plant, the attackers can force the defenders to enter. Close tradeable positions with different lines of sight make the retake harder without creating an unnecessary solo flank.",
  },
  {
    mode: "HARDPOINT",
    situation: "You are holding a hill with one teammate. An enemy uses a stun to force you off your power position, but your teammate remains safe. What should your next decision be?",
    answers: [
      { text: "Recover to a tradeable position and use the changed spacing to regain control rather than immediately re-challenging alone.", correct: true, scores: score({ adaptability: 5, decisionMaking: 5, teamIQ: 4 }) },
      { text: "Re-challenge the same angle instantly because giving ground after a stun guarantees the hill is lost.", correct: false, scores: {} },
      { text: "Leave the hill completely because the enemy has already used a tactical and will expect another fight.", correct: false, scores: {} },
      { text: "Push past the enemy position so your teammate can stay inside without needing to move.", correct: false, scores: {} },
    ],
    explanation: "The tactical changed your immediate positioning, not the entire objective state. Recovering into a tradeable setup lets your teammate's survival remain valuable and avoids a predictable solo re-challenge.",
  },
  {
    mode: "SEARCH & DESTROY",
    situation: "You are in a 3v3 defense with the bomb still down. One enemy has been spotted on a long flank, while the other two have not been seen for several seconds. What should your team assume?",
    answers: [
      { text: "The flank is real information, but the other two players remain unknown and could still be positioned near either site.", correct: true, scores: score({ mapAwareness: 5, adaptability: 5, decisionMaking: 4 }) },
      { text: "The other two must be near the flanker because coordinated teams always move together.", correct: false, scores: {} },
      { text: "The two unseen players are definitely at the opposite site because the flank is confirmed.", correct: false, scores: {} },
      { text: "Ignore the flank because one player cannot affect the round while the bomb is still down.", correct: false, scores: {} },
    ],
    explanation: "One confirmed player narrows one part of the map but does not reveal the other two. Good information use means updating probabilities without turning an unknown into a certainty.",
  },
  {
    mode: "HARDPOINT",
    situation: "Your team has 38 seconds on the hill and a comfortable lead. An enemy appears on your minimap behind the team, but your teammates are already set for the front push. What should you communicate?",
    answers: [
      { text: "Call the rear threat clearly and adjust one player to cover it while keeping the main setup intact.", correct: true, scores: score({ teamIQ: 5, mapAwareness: 5, decisionMaking: 4 }) },
      { text: "Tell everyone to turn around because the rear enemy is now the only important threat.", correct: false, scores: {} },
      { text: "Ignore it because the team already has a favorable hill setup and should never change formation.", correct: false, scores: {} },
      { text: "Leave the hill yourself and chase the rear player so the rest of the team can keep pushing.", correct: false, scores: {} },
    ],
    explanation: "The rear player matters, but the front setup still has value. A concise call and one adjustment protects the weak side without destroying the team's existing structure.",
  },
  {
    mode: "SEARCH & DESTROY",
    situation: "You are in a 2v1 with the bomb planted and 20 seconds remaining. The last defender has not shown, and your teammate is holding a strong cross. What is the main mistake to avoid?",
    answers: [
      { text: "Avoid giving the last defender two separate isolated fights by pushing away from the teammate's cross without a reason.", correct: true, scores: score({ teamIQ: 5, decisionMaking: 5, objectiveIQ: 5 }) },
      { text: "Avoid watching the bomb because the timer already guarantees the round if nobody fights.", correct: false, scores: {} },
      { text: "Avoid communicating because the defender can hear every teammate call from across the map.", correct: false, scores: {} },
      { text: "Avoid using cover because the last defender will eventually need to challenge the open lane.", correct: false, scores: {} },
    ],
    explanation: "The 2v1 is strongest when the defenders cannot isolate one player. Staying connected to the cross keeps the final enemy's possible timing windows narrow.",
  },
  {
    mode: "HARDPOINT",
    situation: "The enemy breaks your hill setup with a coordinated three-player push. You survive while two teammates die. The hill has 10 seconds left and the next one is already open. What is the best adjustment?",
    answers: [
      { text: "Stop forcing the lost hill, preserve your life, and get into position to make the next hill a coordinated fight.", correct: true, scores: score({ adaptability: 5, objectiveIQ: 5, decisionMaking: 5 }) },
      { text: "Re-enter immediately alone because giving up the final ten seconds guarantees the next hill will be lost.", correct: false, scores: {} },
      { text: "Chase the three attackers after they leave the hill so they cannot rotate freely.", correct: false, scores: {} },
      { text: "Stay in the old hill area until the enemy leaves, even if the next objective is already active.", correct: false, scores: {} },
    ],
    explanation: "The hill is effectively lost and the next one is already active. Preserving your life turns the failed defense into a chance to contest the next objective with teammates instead of feeding another death.",
  },
  {
    mode: "SEARCH & DESTROY",
    situation: "You are defending a 3v2 with 25 seconds left. The bomb is still in the enemy spawn and both attackers are confirmed on the same side of the map. What should the defense do?",
    answers: [
      { text: "Keep a safe structure around the likely route to the bomb while avoiding unnecessary pushes that could split the numbers advantage.", correct: true, scores: score({ objectiveIQ: 5, decisionMaking: 5, teamIQ: 5 }) },
      { text: "Push all three players into the enemy side because the attackers have no bomb yet.", correct: false, scores: {} },
      { text: "Send one defender alone to collect the bomb because the enemy cannot reach it in time.", correct: false, scores: {} },
      { text: "Ignore the bomb and hunt kills because the attackers have already revealed their positions.", correct: false, scores: {} },
    ],
    explanation: "The defense has numbers and the bomb is far away. The safest winning state is to preserve the structure that blocks the attackers' route rather than creating unnecessary isolated fights.",
  },
  {
    mode: "HARDPOINT",
    situation: "Your teammate calls that the enemy is spawning behind you, but the minimap still shows your current setup as stable. The next hill is 15 seconds away. What should you do first?",
    answers: [
      { text: "Treat the call as a warning, check the likely route, and adjust only enough to protect the setup while confirming the threat.", correct: true, scores: score({ mapAwareness: 5, adaptability: 5, decisionMaking: 4 }) },
      { text: "Immediately abandon the hill because a spawn call means the entire enemy team is behind you.", correct: false, scores: {} },
      { text: "Ignore the call because the minimap is always more reliable than teammate information.", correct: false, scores: {} },
      { text: "Push into the suspected spawn so the enemy cannot reach the current hill from behind.", correct: false, scores: {} },
    ],
    explanation: "The call is useful information, but it is not a complete map. Checking the likely route and making a measured adjustment lets you protect the current setup without overreacting.",
  },
  {
    mode: "SEARCH & DESTROY",
    situation: "You are attacking a 3v3 with 40 seconds left. Your team has used most of its utility, while the defenders have several tactical pieces remaining. The bomb is still safe. What should affect your pace?",
    answers: [
      { text: "Play for information and favorable timing because forcing a fast entry gives the defenders more value from their remaining utility.", correct: true, scores: score({ decisionMaking: 5, adaptability: 5, mapAwareness: 4 }) },
      { text: "Rush immediately because unused utility becomes irrelevant once the first gunfight starts.", correct: false, scores: {} },
      { text: "Wait until the final five seconds because the defenders cannot use utility after the clock gets low.", correct: false, scores: {} },
      { text: "Split all three players across separate lanes so the defenders cannot use one tactical on everyone.", correct: false, scores: {} },
    ],
    explanation: "Your remaining resources and the defenders' resources both affect the value of timing. With the bomb safe, gathering information before the entry can reduce the impact of the defenders' utility advantage.",
  },
  {
    mode: "HARDPOINT",
    situation: "The score is 225–230. Your team has the current hill, but the next hill is expected to favor the enemy's side of the map. You have a clean chance to kill their anchor. What should you weigh?",
    answers: [
      { text: "Whether the kill improves the next rotation enough to justify leaving your current defensive responsibility for the moment.", correct: true, scores: score({ decisionMaking: 5, mapAwareness: 5, objectiveIQ: 4 }) },
      { text: "Whether the anchor has a high streak, because removing a streak player is always worth leaving the hill.", correct: false, scores: {} },
      { text: "Whether the enemy is alone, because an isolated player should always be chased before rotating.", correct: false, scores: {} },
      { text: "Whether you can get the kill without using a tactical, because saving equipment is more important than the hill.", correct: false, scores: {} },
    ],
    explanation: "The anchor matters because of future positioning, but the current hill still matters at 225–230. The decision should compare the immediate point value with the rotation advantage created by removing that player.",
  },
  {
    mode: "SEARCH & DESTROY",
    situation: "Your team is attacking a 2v2. You have the bomb and 52 seconds, but one teammate has low health after a gunfight. The defenders have not revealed their positions. What should you avoid?",
    answers: [
      { text: "Avoid forcing a dry entry that turns the low-health teammate into the first isolated fight before you have useful information.", correct: true, scores: score({ decisionMaking: 5, teamIQ: 5, adaptability: 4 }) },
      { text: "Avoid using the bomb because planting early would make the low-health player easier to find.", correct: false, scores: {} },
      { text: "Avoid moving together because two attackers in the same area are easier for defenders to predict.", correct: false, scores: {} },
      { text: "Avoid waiting for information because 52 seconds is too short to change the attack plan.", correct: false, scores: {} },
    ],
    explanation: "The low-health player changes the value of a blind entry. With 52 seconds, the team can gather information and choose a route that gives the damaged player a better chance to survive and trade.",
  },
];
