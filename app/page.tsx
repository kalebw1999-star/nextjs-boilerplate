"use client";

import { useEffect, useMemo, useState } from "react";

type Scores = {
  decisionMaking: number;
  mapAwareness: number;
  teamIQ: number;
  objectiveIQ: number;
  gunfightIQ: number;
  adaptability: number;
};

type Answer = {
  text: string;
  scores: Partial<Scores>;
};

type Question = {
  mode: "HARDPOINT" | "SEARCH & DESTROY" | "OVERLOAD";
  situation: string;
  answers: Answer[];
};

type Attempt = {
  date: string;
  overall: number;
  recruitScore: number;
  archetype: string;
  scores: Scores;
};

type PlayerProfile = {
  name: string;
  createdAt: string;
  attempts: Attempt[];
  bestOverall: number;
  bestRecruitScore: number;
};

const STORAGE_KEY = "codiq-player-profile-v2";

const emptyScores = (): Scores => ({
  decisionMaking: 0,
  mapAwareness: 0,
  teamIQ: 0,
  objectiveIQ: 0,
  gunfightIQ: 0,
  adaptability: 0,
});

/* =========================================================
   30 BO7 RANKED SCENARIOS
   ========================================================= */

const questions: Question[] = [
  {
    mode: "HARDPOINT",
    situation:
      "Your team is holding the current Hardpoint with 18 seconds remaining. Two teammates are already moving toward the next hill while you and another teammate are still inside. The enemy has one player approaching from the next hill side. What is the strongest decision?",
    answers: [
      {
        text: "Leave immediately and chase the enemy toward the next hill.",
        scores: {
          decisionMaking: 1,
          mapAwareness: 2,
          objectiveIQ: 1,
        },
      },
      {
        text: "Help secure the remaining hill time while making sure the next rotation is not completely abandoned.",
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 5,
          objectiveIQ: 5,
          adaptability: 4,
        },
      },
      {
        text: "Ignore the next hill and focus entirely on farming kills on the current hill.",
        scores: {
          gunfightIQ: 4,
          objectiveIQ: -4,
          teamIQ: -3,
        },
      },
      {
        text: "Wait until the current hill is almost over before deciding where to go.",
        scores: {
          decisionMaking: -3,
          adaptability: -3,
          objectiveIQ: 1,
        },
      },
    ],
  },

  {
    mode: "SEARCH & DESTROY",
    situation:
      "You have a 3v2 advantage. One enemy was just spotted near the bomb site, while the second enemy has not been seen for several seconds. Your team has plenty of time. What should you prioritize?",
    answers: [
      {
        text: "Split apart so every possible route is covered.",
        scores: {
          mapAwareness: 1,
          teamIQ: -3,
          decisionMaking: -1,
        },
      },
      {
        text: "Immediately challenge the enemy who was spotted.",
        scores: {
          gunfightIQ: 4,
          decisionMaking: 1,
        },
      },
      {
        text: "Keep the numbers advantage and force the remaining enemies to make the difficult decision.",
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 5,
          objectiveIQ: 4,
          adaptability: 5,
        },
      },
      {
        text: "Push through the enemy's last known area as quickly as possible.",
        scores: {
          gunfightIQ: 5,
          decisionMaking: -2,
          teamIQ: -2,
        },
      },
    ],
  },

  {
    mode: "OVERLOAD",
    situation:
      "Your teammate is carrying the Overload Device and has reached the enemy side of the map. You are one of the closest teammates, but the carrier is approaching a choke point where the enemy is likely to defend. What should you do?",
    answers: [
      {
        text: "Move with the carrier and help create enough space for the carrier to reach the zone.",
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 5,
          objectiveIQ: 5,
          adaptability: 4,
        },
      },
      {
        text: "Run past the carrier and search for kills deeper in enemy territory.",
        scores: {
          gunfightIQ: 5,
          teamIQ: -4,
          objectiveIQ: -5,
        },
      },
      {
        text: "Stay far behind and wait to see whether the carrier survives.",
        scores: {
          teamIQ: 1,
          objectiveIQ: 2,
          decisionMaking: -1,
        },
      },
      {
        text: "Leave the carrier completely and return toward your own side.",
        scores: {
          objectiveIQ: -5,
          teamIQ: -4,
          decisionMaking: -3,
        },
      },
    ],
  },

  {
    mode: "HARDPOINT",
    situation:
      "The enemy has broken your Hardpoint setup twice through the same lane. You have noticed the pattern, but your teammate keeps holding the same position. What is the best adjustment?",
    answers: [
      {
        text: "Continue holding the exact same position and hope the next gunfight goes differently.",
        scores: {
          adaptability: -5,
          decisionMaking: -3,
        },
      },
      {
        text: "Push that lane alone every time so the enemy cannot use it.",
        scores: {
          gunfightIQ: 4,
          adaptability: 1,
          teamIQ: -2,
        },
      },
      {
        text: "Change the setup and communicate the repeated entry so the team can cover it differently.",
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 5,
          adaptability: 5,
        },
      },
      {
        text: "Ignore it because your team still has time to recover.",
        scores: {
          adaptability: -4,
          mapAwareness: -3,
        },
      },
    ],
  },

  {
    mode: "SEARCH & DESTROY",
    situation:
      "You are defending and your teammate gets an early elimination. The enemy has not revealed the rest of their positions. What should your team avoid doing?",
    answers: [
      {
        text: "Using the numbers advantage to control important areas.",
        scores: {
          teamIQ: 4,
          mapAwareness: 4,
          decisionMaking: 3,
        },
      },
      {
        text: "Keeping track of where the missing enemies could still be.",
        scores: {
          mapAwareness: 5,
          adaptability: 4,
        },
      },
      {
        text: "Immediately turning the advantage into several isolated solo pushes.",
        scores: {
          gunfightIQ: 4,
          teamIQ: -5,
          decisionMaking: -3,
        },
      },
      {
        text: "Using the extra player alive to make the enemy's options more limited.",
        scores: {
          teamIQ: 5,
          decisionMaking: 5,
          mapAwareness: 4,
        },
      },
    ],
  },

  {
    mode: "OVERLOAD",
    situation:
      "The Overload Device has been dropped near the middle of the map. Your team is closer, but the enemy is also rotating toward it. You have not yet won control of the surrounding area. What should you consider?",
    answers: [
      {
        text: "Whether your team can control the area before committing to the pickup.",
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 5,
          objectiveIQ: 5,
        },
      },
      {
        text: "Who can reach the Device first regardless of the surrounding enemies.",
        scores: {
          objectiveIQ: 3,
          decisionMaking: -3,
          mapAwareness: -3,
        },
      },
      {
        text: "Ignore the Device and hunt the enemy team.",
        scores: {
          gunfightIQ: 5,
          objectiveIQ: -5,
          teamIQ: -3,
        },
      },
      {
        text: "Have everyone stand directly on top of the Device.",
        scores: {
          objectiveIQ: 3,
          mapAwareness: -2,
          teamIQ: 1,
        },
      },
    ],
  },

  {
    mode: "HARDPOINT",
    situation:
      "Your team is down significantly in score, but you finally have a stable Hardpoint setup. The enemy is beginning to rotate early. What should determine whether you send players toward the next hill?",
    answers: [
      {
        text: "Whether you can gain useful time now without completely sacrificing the current setup.",
        scores: {
          decisionMaking: 5,
          objectiveIQ: 5,
          teamIQ: 5,
          adaptability: 4,
        },
      },
      {
        text: "The fact that the enemy is rotating means everyone should immediately leave.",
        scores: {
          objectiveIQ: -2,
          decisionMaking: -2,
        },
      },
      {
        text: "How many kills each player can get before rotating.",
        scores: {
          gunfightIQ: 4,
          objectiveIQ: -2,
        },
      },
      {
        text: "Whether one player can get information and pressure the next hill while the others maintain the current setup.",
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 5,
          objectiveIQ: 5,
        },
      },
    ],
  },

  {
    mode: "SEARCH & DESTROY",
    situation:
      "You are in a 2v2 and your teammate gets eliminated. You have not seen either remaining enemy. You still have enough time to play the round. What is the strongest mindset?",
    answers: [
      {
        text: "Take the first fight you can find before the enemies regroup.",
        scores: {
          gunfightIQ: 5,
          decisionMaking: -2,
        },
      },
      {
        text: "Use the objective, timing, and information you can gather to make the 1v2 manageable.",
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          objectiveIQ: 5,
          adaptability: 5,
        },
      },
      {
        text: "Run around the map until someone appears.",
        scores: {
          adaptability: 2,
          mapAwareness: -2,
          objectiveIQ: -2,
        },
      },
      {
        text: "Assume both enemies are together and challenge the most obvious area.",
        scores: {
          mapAwareness: -4,
          decisionMaking: -3,
          gunfightIQ: 3,
        },
      },
    ],
  },

  {
    mode: "OVERLOAD",
    situation:
      "Your team has pushed the Device deep into enemy territory, but the carrier is eliminated. Your teammates are split across the map. What is the biggest priority?",
    answers: [
      {
        text: "Recover the situation by deciding whether to contest the Device or reset your positioning based on where the enemy is.",
        scores: {
          decisionMaking: 5,
          adaptability: 5,
          mapAwareness: 5,
          teamIQ: 4,
          objectiveIQ: 5,
        },
      },
      {
        text: "Everyone sprint directly to where the Device was dropped.",
        scores: {
          objectiveIQ: 4,
          mapAwareness: -2,
          decisionMaking: -1,
        },
      },
      {
        text: "Forget the Device and hunt every enemy you can find.",
        scores: {
          gunfightIQ: 5,
          objectiveIQ: -5,
        },
      },
      {
        text: "Everyone return to spawn without considering the enemy's position.",
        scores: {
          decisionMaking: -4,
          adaptability: -3,
        },
      },
    ],
  },

  {
    mode: "HARDPOINT",
    situation:
      "You are anchoring a Hardpoint with one teammate. The enemy has shown pressure from two different routes. You hear gunfire from one side but cannot confirm where the other players are. What should you think about?",
    answers: [
      {
        text: "The unseen players still have possible routes into the hill and should affect your positioning.",
        scores: {
          mapAwareness: 5,
          decisionMaking: 5,
          teamIQ: 4,
          objectiveIQ: 5,
        },
      },
      {
        text: "Only the enemies you can currently see matter.",
        scores: {
          mapAwareness: -5,
          decisionMaking: -3,
        },
      },
      {
        text: "Push out toward the gunfire immediately.",
        scores: {
          gunfightIQ: 5,
          objectiveIQ: -2,
          decisionMaking: -1,
        },
      },
      {
        text: "Leave the Hardpoint completely so you cannot be trapped.",
        scores: {
          objectiveIQ: -5,
          teamIQ: -4,
        },
      },
    ],
  },

  {
    mode: "SEARCH & DESTROY",
    situation:
      "Your team has been aggressively attacking one side of the map for several rounds. The enemy has started stacking that side. What is the most valuable adjustment?",
    answers: [
      {
        text: "Attack the same side even harder.",
        scores: {
          gunfightIQ: 4,
          adaptability: -4,
          decisionMaking: -3,
        },
      },
      {
        text: "Change the timing or route so the enemy's preparation becomes less valuable.",
        scores: {
          adaptability: 5,
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 4,
        },
      },
      {
        text: "Stop moving and wait the entire round.",
        scores: {
          adaptability: -2,
          objectiveIQ: 1,
        },
      },
      {
        text: "Send everyone separately so the enemy cannot predict anyone.",
        scores: {
          mapAwareness: 2,
          teamIQ: -5,
          decisionMaking: -2,
        },
      },
    ],
  },

  {
    mode: "OVERLOAD",
    situation:
      "Your team is defending. The enemy carrier has crossed into your side, but their support players are not close enough to protect them. What is the smartest response?",
    answers: [
      {
        text: "Use the separation to pressure the carrier while avoiding unnecessary fights elsewhere.",
        scores: {
          decisionMaking: 5,
          objectiveIQ: 5,
          mapAwareness: 5,
          teamIQ: 4,
        },
      },
      {
        text: "Ignore the carrier and hunt the support players.",
        scores: {
          gunfightIQ: 5,
          objectiveIQ: -5,
          decisionMaking: -2,
        },
      },
      {
        text: "Everyone collapse onto the carrier from the same direction.",
        scores: {
          objectiveIQ: 4,
          teamIQ: 3,
          mapAwareness: -1,
        },
      },
      {
        text: "Fall back and allow the carrier to move closer before reacting.",
        scores: {
          objectiveIQ: -4,
          decisionMaking: -3,
        },
      },
    ],
  },

  {
    mode: "HARDPOINT",
    situation:
      "Your teammate wins a gunfight outside the Hardpoint and gets a second elimination. You are already holding the hill. What should you consider before leaving?",
    answers: [
      {
        text: "Whether leaving the hill creates more value than continuing to secure the objective.",
        scores: {
          decisionMaking: 5,
          objectiveIQ: 5,
          teamIQ: 4,
        },
      },
      {
        text: "Two kills means the enemy is weak, so you should always push.",
        scores: {
          gunfightIQ: 5,
          decisionMaking: -3,
          objectiveIQ: -3,
        },
      },
      {
        text: "Stay inside the hill regardless of everything happening outside.",
        scores: {
          objectiveIQ: 4,
          adaptability: -2,
        },
      },
      {
        text: "Move only if your teammate calls for help.",
        scores: {
          teamIQ: 3,
          decisionMaking: 1,
          adaptability: 1,
        },
      },
    ],
  },

  {
    mode: "SEARCH & DESTROY",
    situation:
      "You have information that strongly suggests an enemy is nearby, but you do not have a confirmed visual. Your teammate wants to swing the angle immediately. What should influence your choice?",
    answers: [
      {
        text: "The value of the information, the enemy's likely escape routes, and whether the fight is necessary.",
        scores: {
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 4,
          adaptability: 4,
        },
      },
      {
        text: "Take the swing because information means the enemy is probably weak.",
        scores: {
          gunfightIQ: 4,
          decisionMaking: -2,
        },
      },
      {
        text: "Never challenge without seeing the enemy first.",
        scores: {
          decisionMaking: 1,
          adaptability: -2,
        },
      },
      {
        text: "Have your teammate swing alone while you watch somewhere else.",
        scores: {
          teamIQ: -3,
          mapAwareness: 2,
          decisionMaking: -1,
        },
      },
    ],
  },

  {
    mode: "OVERLOAD",
    situation:
      "The Device is available and your team has won control of the center. One teammate wants to immediately take the Device while the rest of the team pushes forward. What should you consider?",
    answers: [
      {
        text: "Whether the team has enough protection around the carrier and enough control of the route to make the push sustainable.",
        scores: {
          decisionMaking: 5,
          teamIQ: 5,
          objectiveIQ: 5,
          mapAwareness: 5,
        },
      },
      {
        text: "The carrier should always sprint ahead alone to move faster.",
        scores: {
          objectiveIQ: 3,
          teamIQ: -5,
          decisionMaking: -3,
        },
      },
      {
        text: "Everyone should stop moving and stand directly around the carrier.",
        scores: {
          teamIQ: 1,
          objectiveIQ: 3,
          mapAwareness: -3,
        },
      },
      {
        text: "Ignore the Device until every enemy is eliminated.",
        scores: {
          gunfightIQ: 5,
          objectiveIQ: -5,
          decisionMaking: -4,
        },
      },
    ],
  },

  {
    mode: "HARDPOINT",
    situation:
      "The next Hardpoint is across the map. Your team has one player already moving toward it, while you have just spawned and two teammates are still near the old hill. What role should you consider taking?",
    answers: [
      {
        text: "Choose based on what the team is missing rather than automatically copying the player who already rotated.",
        scores: {
          decisionMaking: 5,
          teamIQ: 5,
          mapAwareness: 5,
          adaptability: 4,
        },
      },
      {
        text: "Everyone should rotate because the next hill is more important.",
        scores: {
          objectiveIQ: 4,
          teamIQ: -2,
          decisionMaking: -1,
        },
      },
      {
        text: "Go find an enemy spawn and look for kills.",
        scores: {
          gunfightIQ: 5,
          mapAwareness: 2,
          objectiveIQ: -3,
        },
      },
      {
        text: "Stay at the old hill until it disappears.",
        scores: {
          objectiveIQ: 3,
          adaptability: -3,
        },
      },
    ],
  },

  {
    mode: "SEARCH & DESTROY",
    situation:
      "Your team is down 2v3 late in the round. You have information on two enemies, but the third is unknown. What should you avoid?",
    answers: [
      {
        text: "Assuming the unknown enemy is irrelevant because two players have already been located.",
        scores: {
          mapAwareness: -5,
          decisionMaking: -4,
        },
      },
      {
        text: "Using the information to narrow down the enemy's possible positions.",
        scores: {
          mapAwareness: 5,
          decisionMaking: 4,
        },
      },
      {
        text: "Playing together so the numbers disadvantage is harder for the enemy to exploit.",
        scores: {
          teamIQ: 5,
          decisionMaking: 5,
        },
      },
      {
        text: "Forcing a fight before the enemy can use their numbers.",
        scores: {
          gunfightIQ: 4,
          decisionMaking: 1,
        },
      },
    ],
  },

  {
    mode: "HARDPOINT",
    situation:
      "You are contesting a Hardpoint while your team has two players rotating toward the next hill. The enemy has several players arriving. What is the biggest value of your position?",
    answers: [
      {
        text: "Making the enemy spend time and resources clearing you without giving them an easy elimination.",
        scores: {
          decisionMaking: 5,
          objectiveIQ: 5,
          adaptability: 4,
          mapAwareness: 4,
        },
      },
      {
        text: "Getting as many kills as possible even if you die immediately afterward.",
        scores: {
          gunfightIQ: 5,
          objectiveIQ: 1,
          decisionMaking: -2,
        },
      },
      {
        text: "Leaving immediately because the hill is already lost.",
        scores: {
          decisionMaking: -3,
          objectiveIQ: -2,
        },
      },
      {
        text: "Continuing the same challenge until the enemy finally loses the gunfight.",
        scores: {
          gunfightIQ: 4,
          adaptability: -4,
        },
      },
    ],
  },

  {
    mode: "OVERLOAD",
    situation:
      "Your team is pushing toward an enemy zone. The carrier is moving safely, but you notice the enemy is abandoning the front and appearing on a different route. What does that tell you?",
    answers: [
      {
        text: "The enemy may be trying to cut off the carrier farther ahead, so your team should adjust its spacing and route.",
        scores: {
          mapAwareness: 5,
          decisionMaking: 5,
          adaptability: 5,
          teamIQ: 5,
          objectiveIQ: 5,
        },
      },
      {
        text: "Nothing; keep doing exactly what you were doing.",
        scores: {
          adaptability: -4,
          mapAwareness: -3,
        },
      },
      {
        text: "Everyone should chase the enemies who moved away.",
        scores: {
          gunfightIQ: 4,
          objectiveIQ: -3,
          teamIQ: -2,
        },
      },
      {
        text: "The carrier should speed up and run ahead alone.",
        scores: {
          objectiveIQ: 2,
          teamIQ: -5,
          decisionMaking: -2,
        },
      },
    ],
  },

  {
    mode: "SEARCH & DESTROY",
    situation:
      "You are attacking and your team gets an early elimination. The enemy has not revealed the rest of their setup. Your teammate wants to immediately commit to the original route. What is the better question to ask?",
    answers: [
      {
        text: "Has the early elimination changed the information, timing, or space that makes our original plan good?",
        scores: {
          decisionMaking: 5,
          adaptability: 5,
          mapAwareness: 5,
          teamIQ: 4,
        },
      },
      {
        text: "Can we get another kill immediately?",
        scores: {
          gunfightIQ: 5,
          decisionMaking: -1,
        },
      },
      {
        text: "Should everyone split up now that we have an advantage?",
        scores: {
          teamIQ: -4,
          adaptability: 1,
        },
      },
      {
        text: "Should we stop moving entirely?",
        scores: {
          adaptability: -2,
          decisionMaking: -1,
        },
      },
    ],
  },

  {
    mode: "HARDPOINT",
    situation:
      "Your team is holding the hill, but you notice the enemy is consistently spawning closer to the next rotation than your teammates. What should that information influence?",
    answers: [
      {
        text: "Your team's rotation timing and positioning around the next hill.",
        scores: {
          mapAwareness: 5,
          decisionMaking: 5,
          objectiveIQ: 5,
          teamIQ: 4,
        },
      },
      {
        text: "Nothing until the next hill actually starts.",
        scores: {
          mapAwareness: -5,
          objectiveIQ: -2,
        },
      },
      {
        text: "Push deeper into the enemy side immediately.",
        scores: {
          gunfightIQ: 4,
          mapAwareness: 2,
          decisionMaking: -2,
        },
      },
      {
        text: "Have every teammate leave the current hill early.",
        scores: {
          objectiveIQ: -2,
          decisionMaking: -2,
          teamIQ: -1,
        },
      },
    ],
  },

  {
    mode: "OVERLOAD",
    situation:
      "The enemy has recovered the Overload Device after your team pushed it deep. Your team has three players near the enemy side and one player closer to home. What is the first thing you should recognize?",
    answers: [
      {
        text: "Your forward players may need to quickly reassess whether to pressure the enemy carrier or get back to defend the route.",
        scores: {
          decisionMaking: 5,
          adaptability: 5,
          mapAwareness: 5,
          objectiveIQ: 5,
        },
      },
      {
        text: "The three forward players should keep hunting kills.",
        scores: {
          gunfightIQ: 5,
          objectiveIQ: -5,
          teamIQ: -4,
        },
      },
      {
        text: "The player at home should handle everything alone.",
        scores: {
          teamIQ: -5,
          decisionMaking: -3,
        },
      },
      {
        text: "Everyone should immediately sprint backward without checking the situation.",
        scores: {
          adaptability: 2,
          decisionMaking: -2,
        },
      },
    ],
  },

  {
    mode: "HARDPOINT",
    situation:
      "You are in a close Hardpoint game. You have the opportunity to challenge an enemy outside the hill, but doing so would expose the route your teammate is using to rotate. What matters more than simply winning the gunfight?",
    answers: [
      {
        text: "Whether the challenge creates a larger advantage for your team than maintaining the current structure.",
        scores: {
          decisionMaking: 5,
          teamIQ: 5,
          objectiveIQ: 5,
          adaptability: 4,
        },
      },
      {
        text: "The fact that every possible kill is valuable.",
        scores: {
          gunfightIQ: 4,
          objectiveIQ: -2,
          decisionMaking: -2,
        },
      },
      {
        text: "Always stay on the hill no matter what.",
        scores: {
          objectiveIQ: 4,
          adaptability: -2,
        },
      },
      {
        text: "Challenge because refusing a gunfight makes you predictable.",
        scores: {
          gunfightIQ: 4,
          adaptability: 2,
          decisionMaking: -2,
        },
      },
    ],
  },

  {
    mode: "SEARCH & DESTROY",
    situation:
      "Your team has won two rounds in a row with a very fast opening strategy. The enemy has started anticipating it. What should a strong player recognize?",
    answers: [
      {
        text: "The enemy is adapting, so repeating the same timing may now have a different expected result.",
        scores: {
          adaptability: 5,
          decisionMaking: 5,
          mapAwareness: 5,
          teamIQ: 4,
        },
      },
      {
        text: "The strategy worked twice, so it should always work.",
        scores: {
          adaptability: -5,
          decisionMaking: -4,
        },
      },
      {
        text: "Speed up even more.",
        scores: {
          gunfightIQ: 5,
          adaptability: -2,
        },
      },
      {
        text: "Stop making any aggressive plays.",
        scores: {
          adaptability: -1,
          decisionMaking: -1,
        },
      },
    ],
  },

  {
    mode: "OVERLOAD",
    situation:
      "Your carrier is one push away from the enemy zone, but two teammates have been eliminated. You are alive nearby and the enemy has started collapsing on the carrier. What should you evaluate?",
    answers: [
      {
        text: "Whether you can create enough space for the carrier to finish without turning the situation into unnecessary solo fights.",
        scores: {
          decisionMaking: 5,
          teamIQ: 5,
          objectiveIQ: 5,
          mapAwareness: 5,
        },
      },
      {
        text: "Whether you can get the most kills before the carrier reaches the zone.",
        scores: {
          gunfightIQ: 5,
          objectiveIQ: -3,
        },
      },
      {
        text: "Whether the carrier should drop the Device and fight.",
        scores: {
          gunfightIQ: 3,
          objectiveIQ: -3,
          decisionMaking: -2,
        },
      },
      {
        text: "Whether you should abandon the push completely.",
        scores: {
          decisionMaking: -3,
          objectiveIQ: -4,
        },
      },
    ],
  },

  {
    mode: "HARDPOINT",
    situation:
      "Your team has a strong setup, but one teammate keeps leaving the hill to chase enemies. The team is still winning some gunfights, but the objective time is becoming inconsistent. What is the clearest diagnosis?",
    answers: [
      {
        text: "The player may be generating individual pressure while creating a structural problem for the team's objective setup.",
        scores: {
          teamIQ: 5,
          objectiveIQ: 5,
          decisionMaking: 5,
          mapAwareness: 4,
        },
      },
      {
        text: "The player is doing nothing useful because kills never matter.",
        scores: {
          objectiveIQ: 2,
          gunfightIQ: -2,
        },
      },
      {
        text: "The team should all leave the hill and chase kills too.",
        scores: {
          gunfightIQ: 5,
          objectiveIQ: -5,
          teamIQ: -5,
        },
      },
      {
        text: "The problem is only the player's aim.",
        scores: {
          gunfightIQ: 3,
          decisionMaking: -3,
          teamIQ: -3,
        },
      },
    ],
  },

  {
    mode: "SEARCH & DESTROY",
    situation:
      "You have reached the late part of a round with a numbers advantage. The enemy has not been forced to make an objective decision yet. What should your team value?",
    answers: [
      {
        text: "Preserving the advantage while using time and positioning to force the enemy into a bad choice.",
        scores: {
          decisionMaking: 5,
          teamIQ: 5,
          objectiveIQ: 5,
          mapAwareness: 5,
        },
      },
      {
        text: "Finding the last enemy as quickly as possible.",
        scores: {
          gunfightIQ: 4,
          decisionMaking: -1,
        },
      },
      {
        text: "Splitting up so the enemy has more angles to deal with.",
        scores: {
          teamIQ: -4,
          mapAwareness: 2,
          decisionMaking: -2,
        },
      },
      {
        text: "Holding completely still regardless of the objective.",
        scores: {
          objectiveIQ: 2,
          adaptability: -2,
        },
      },
    ],
  },

  {
    mode: "OVERLOAD",
    situation:
      "Your team has scored several points by repeatedly using the same route with the Device. The enemy has now started defending that route heavily. What should change?",
    answers: [
      {
        text: "Your team's route, timing, or pressure should change so the enemy cannot simply prepare for the same push.",
        scores: {
          adaptability: 5,
          decisionMaking: 5,
          mapAwareness: 5,
          objectiveIQ: 5,
        },
      },
      {
        text: "Send more players down the exact same route.",
        scores: {
          teamIQ: -3,
          adaptability: -4,
          objectiveIQ: 2,
        },
      },
      {
        text: "Give the Device to whoever has the best gunskill and let them run it.",
        scores: {
          gunfightIQ: 5,
          teamIQ: -3,
          objectiveIQ: -2,
        },
      },
      {
        text: "Stop attacking the objective until the enemy moves.",
        scores: {
          objectiveIQ: -2,
          adaptability: -2,
        },
      },
    ],
  },

  {
    mode: "HARDPOINT",
    situation:
      "Your team is down by a small amount with the next Hardpoint about to appear. You have a choice between taking a low-percentage fight for a kill or getting into a strong position for the next hill. What should guide the decision?",
    answers: [
      {
        text: "Which choice gives the team the better expected value for winning the next sequence.",
        scores: {
          decisionMaking: 5,
          objectiveIQ: 5,
          mapAwareness: 5,
          teamIQ: 4,
        },
      },
      {
        text: "Always take the gunfight because kills create momentum.",
        scores: {
          gunfightIQ: 5,
          decisionMaking: -3,
          objectiveIQ: -3,
        },
      },
      {
        text: "Always rotate regardless of the enemy's position.",
        scores: {
          objectiveIQ: 4,
          adaptability: -2,
        },
      },
      {
        text: "Avoid every fight until the hill starts.",
        scores: {
          decisionMaking: -2,
          gunfightIQ: -2,
        },
      },
    ],
  },

  {
    mode: "SEARCH & DESTROY",
    situation:
      "You notice an enemy repeatedly makes the same aggressive opening play. Your teammate wants to challenge it immediately every round. What is the more valuable long-term adjustment?",
    answers: [
      {
        text: "Use the repeated behavior as predictable information and build a response around it.",
        scores: {
          mapAwareness: 5,
          adaptability: 5,
          decisionMaking: 5,
          teamIQ: 4,
        },
      },
      {
        text: "Challenge them faster each round.",
        scores: {
          gunfightIQ: 5,
          adaptability: -2,
        },
      },
      {
        text: "Ignore the behavior because individual plays cannot be predicted.",
        scores: {
          mapAwareness: -5,
          decisionMaking: -3,
        },
      },
      {
        text: "Have the entire team chase that player.",
        scores: {
          teamIQ: -4,
          mapAwareness: 2,
          decisionMaking: -2,
        },
      },
    ],
  },

  {
    mode: "OVERLOAD",
    situation:
      "The score is close and your team is defending the final minutes of a half. The enemy has the Device, but their carrier is isolated from the rest of the team. What should be your priority?",
    answers: [
      {
        text: "Exploit the carrier's isolation while making sure the enemy cannot use the distraction to open another route.",
        scores: {
          decisionMaking: 5,
          objectiveIQ: 5,
          mapAwareness: 5,
          teamIQ: 5,
          adaptability: 5,
        },
      },
      {
        text: "Everyone should chase the carrier immediately.",
        scores: {
          objectiveIQ: 4,
          teamIQ: 2,
          mapAwareness: -1,
        },
      },
      {
        text: "Ignore the carrier and focus entirely on getting kills elsewhere.",
        scores: {
          gunfightIQ: 5,
          objectiveIQ: -5,
        },
      },
      {
        text: "Give the enemy space so your team can set up for the next play.",
        scores: {
          decisionMaking: 2,
          objectiveIQ: -2,
          adaptability: 1,
        },
      },
    ],
  },

  {
    mode: "HARDPOINT",
    situation:
      "You are the last teammate alive near the Hardpoint while your other three teammates are already rotating. The enemy is about to collapse on you. What is the best way to think about the situation?",
    answers: [
      {
        text: "Make your life as difficult to remove as possible while recognizing that the next hill is the larger team objective.",
        scores: {
          decisionMaking: 5,
          objectiveIQ: 5,
          mapAwareness: 5,
          adaptability: 5,
        },
      },
      {
        text: "Fight until you die because staying alive is always more important than rotating.",
        scores: {
          gunfightIQ: 4,
          objectiveIQ: -2,
          decisionMaking: -2,
        },
      },
      {
        text: "Immediately sprint to your teammates without considering whether you can delay the enemy.",
        scores: {
          teamIQ: 3,
          decisionMaking: 1,
          objectiveIQ: 2,
        },
      },
      {
        text: "Try to eliminate every enemy before leaving.",
        scores: {
          gunfightIQ: 5,
          adaptability: -3,
          decisionMaking: -3,
        },
      },
    ],
  },

  {
    mode: "SEARCH & DESTROY",
    situation:
      "Your team has one round left to win the match. The enemy has shown that they react heavily to your team's previous patterns. What should a high-IQ player think about before the round starts?",
    answers: [
      {
        text: "How the enemy expects us to play and whether changing our timing or setup can punish that expectation.",
        scores: {
          decisionMaking: 5,
          adaptability: 5,
          mapAwareness: 5,
          teamIQ: 5,
          objectiveIQ: 4,
        },
      },
      {
        text: "Use the exact strategy that won the previous round.",
        scores: {
          adaptability: -4,
          decisionMaking: -2,
        },
      },
      {
        text: "Take the biggest opening gunfight possible.",
        scores: {
          gunfightIQ: 5,
          decisionMaking: -1,
        },
      },
      {
        text: "Play extremely slowly regardless of the enemy's tendencies.",
        scores: {
          adaptability: -2,
          decisionMaking: -1,
        },
      },
    ],
  },
];

/* =========================================================
   GAME LOGIC
   ========================================================= */

function shuffle<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function calculateScores(raw: Scores): Scores {
  const result = emptyScores();

  (Object.keys(result) as (keyof Scores)[]).forEach((key) => {
    const normalized = ((raw[key] + 50) / 100) * 100;

    result[key] = Math.max(
      0,
      Math.min(100, Math.round(normalized))
    );
  });

  return result;
}

function calculateOverall(scores: Scores) {
  return Math.round(
    Object.values(scores).reduce(
      (sum, value) => sum + value,
      0
    ) / 6
  );
}

function calculateRecruitScore(scores: Scores) {
  return Math.round(
    scores.teamIQ * 0.22 +
      scores.decisionMaking * 0.21 +
      scores.objectiveIQ * 0.19 +
      scores.adaptability * 0.16 +
      scores.mapAwareness * 0.14 +
      scores.gunfightIQ * 0.08
  );
}

function getArchetype(scores: Scores) {
  if (
    scores.teamIQ >= 82 &&
    scores.objectiveIQ >= 80 &&
    scores.decisionMaking >= 78
  ) {
    return {
      name: "SYSTEM PLAYER",
      description:
        "You naturally think about the win condition, teammate positioning, and the larger state of the match.",
    };
  }

  if (
    scores.gunfightIQ >= 84 &&
    scores.decisionMaking >= 76 &&
    scores.adaptability >= 72
  ) {
    return {
      name: "AGGRESSIVE PLAYMAKER",
      description:
        "You create pressure through individual plays while still showing an ability to adjust when the match changes.",
    };
  }

  if (
    scores.mapAwareness >= 84 &&
    scores.adaptability >= 80
  ) {
    return {
      name: "TEMPO CONTROLLER",
      description:
        "You consistently recognize developing pressure and adjust your positioning before situations become obvious.",
    };
  }

  if (
    scores.objectiveIQ >= 84 &&
    scores.teamIQ >= 78
  ) {
    return {
      name: "OBJECTIVE ANCHOR",
      description:
        "You understand how individual decisions affect the objective and create stable situations for your team.",
    };
  }

  if (
    scores.gunfightIQ >= 88 &&
    scores.teamIQ < 72
  ) {
    return {
      name: "MECHANICAL CARRY",
      description:
        "Your strongest value comes from creating individual advantages. Team-oriented decision making is the largest development area.",
    };
  }

  if (
    scores.decisionMaking >= 84 &&
    scores.adaptability >= 84
  ) {
    return {
      name: "ADAPTIVE IGL",
      description:
        "You recognize changing situations quickly and alter your plan instead of forcing the same strategy.",
    };
  }

  return {
    name: "VERSATILE PLAYMAKER",
    description:
      "Your strengths are relatively balanced, suggesting you can contribute in several different ways depending on what the team needs.",
  };
}

function getRecruitLabel(score: number) {
  if (score >= 90) return "ELITE PROSPECT";
  if (score >= 82) return "HIGH PRIORITY PROSPECT";
  if (score >= 74) return "DEVELOPING PROSPECT";
  if (score >= 65) return "EMERGING PLAYER";

  return "EARLY DEVELOPMENT";
}

function getRatingText(score: number) {
  if (score >= 90) return "Elite";
  if (score >= 82) return "Advanced";
  if (score >= 74) return "Strong";
  if (score >= 65) return "Developing";

  return "Foundation";
}

function getScoreColor(score: number) {
  if (score >= 85) return "text-green-400";
  if (score >= 70) return "text-yellow-400";
  if (score >= 55) return "text-orange-400";

  return "text-red-400";
}

/* =========================================================
   COMPONENTS
   ========================================================= */

function StatCard({
  name,
  value,
  icon,
}: {
  name: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="bg-[#090909] border border-zinc-800 rounded-2xl p-5">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xl">{icon}</span>

        <span className={`text-2xl font-black ${getScoreColor(value)}`}>
          {value}
        </span>
      </div>

      <p className="text-sm text-gray-400 mb-3">
        {name}
      </p>

      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-red-600 transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>

      <p className="text-[10px] uppercase tracking-wider text-gray-700 mt-2">
        {getRatingText(value)}
      </p>
    </div>
  );
}

/* =========================================================
   MAIN APP
   ========================================================= */

export default function Home() {
  const [profile, setProfile] =
    useState<PlayerProfile | null>(null);

  const [nameInput, setNameInput] = useState("");

  const [view, setView] = useState<
    "home" | "assessment" | "results" | "profile" | "team" | "clip"
  >("home");

  const [current, setCurrent] = useState(0);

  const [quizQuestions, setQuizQuestions] =
    useState<Question[]>([]);

  const [rawScores, setRawScores] =
    useState<Scores>(emptyScores());

  const [latestScores, setLatestScores] =
    useState<Scores | null>(null);

  const [latestOverall, setLatestOverall] =
    useState(0);

  const [latestRecruitScore, setLatestRecruitScore] =
    useState(0);

  const [latestArchetype, setLatestArchetype] =
    useState("");

  const [clipFileName, setClipFileName] =
    useState("");

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(STORAGE_KEY);

      if (saved) {
        setProfile(JSON.parse(saved));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function saveProfile(updated: PlayerProfile) {
    setProfile(updated);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );
  }

  function createPlayer() {
    const cleanName =
      nameInput.trim();

    if (!cleanName) return;

    const newProfile: PlayerProfile = {
      name: cleanName,
      createdAt: new Date().toISOString(),
      attempts: [],
      bestOverall: 0,
      bestRecruitScore: 0,
    };

    saveProfile(newProfile);
    setView("home");
  }

  function startAssessment() {
    if (!profile) {
      setView("home");
      return;
    }

    const randomized =
      shuffle(
        questions.map((question) => ({
          ...question,
          answers: shuffle(
            question.answers
          ),
        }))
      );

    setQuizQuestions(randomized);
    setRawScores(emptyScores());
    setCurrent(0);
    setLatestScores(null);

    setView("assessment");
  }

  function answerQuestion(answer: Answer) {
    const updated = {
      ...rawScores,
    };

    (
      Object.keys(answer.scores) as
        (keyof Scores)[]
    ).forEach((key) => {
      updated[key] +=
        answer.scores[key] ?? 0;
    });

    if (
      current + 1 >=
      quizQuestions.length
    ) {
      const calculated =
        calculateScores(updated);

      const overall =
        calculateOverall(
          calculated
        );

      const recruitScore =
        calculateRecruitScore(
          calculated
        );

      const archetype =
        getArchetype(
          calculated
        );

      setLatestScores(
        calculated
      );

      setLatestOverall(
        overall
      );

      setLatestRecruitScore(
        recruitScore
      );

      setLatestArchetype(
        archetype.name
      );

      if (profile) {
        const attempt: Attempt = {
          date:
            new Date().toISOString(),
          overall,
          recruitScore,
          archetype:
            archetype.name,
          scores:
            calculated,
        };

        const updatedProfile: PlayerProfile =
          {
            ...profile,
            attempts: [
              ...profile.attempts,
              attempt,
            ],
            bestOverall:
              Math.max(
                profile.bestOverall,
                overall
              ),
            bestRecruitScore:
              Math.max(
                profile.bestRecruitScore,
                recruitScore
              ),
          };

        saveProfile(
          updatedProfile
        );
      }

      setView("results");
    } else {
      setRawScores(updated);
      setCurrent(
        current + 1
      );
    }
  }

  function resetPlayer() {
    localStorage.removeItem(
      STORAGE_KEY
    );

    setProfile(null);
    setLatestScores(null);
    setNameInput("");
    setView("home");
  }

  const stats = useMemo(() => {
    if (!latestScores)
      return [];

    return [
      [
        "Decision Making",
        latestScores.decisionMaking,
        "🧠",
      ],
      [
        "Map Awareness",
        latestScores.mapAwareness,
        "🗺️",
      ],
      [
        "Team IQ",
        latestScores.teamIQ,
        "🤝",
      ],
      [
        "Objective IQ",
        latestScores.objectiveIQ,
        "🎯",
      ],
      [
        "Gunfight IQ",
        latestScores.gunfightIQ,
        "⚡",
      ],
      [
        "Adaptability",
        latestScores.adaptability,
        "🔄",
      ],
    ] as const;
  }, [latestScores]);

  const strengths =
    [...stats]
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .slice(0, 2);

  const weakness =
    [...stats].sort(
      (a, b) =>
        a[1] - b[1]
    )[0];

  const archetype =
    latestScores
      ? getArchetype(
          latestScores
        )
      : null;

  function navButton(
    label: string,
    target: typeof view
  ) {
    return (
      <button
        onClick={() =>
          setView(target)
        }
        className={`px-3 py-2 rounded-lg text-xs font-bold transition ${
          view === target
            ? "bg-red-600 text-white"
            : "text-gray-500 hover:text-white hover:bg-zinc-900"
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">

      <div className="max-w-6xl mx-auto px-4 py-5 md:px-8">

        <header className="flex items-center justify-between border-b border-zinc-900 pb-5 mb-8">

          <button
            onClick={() =>
              setView("home")
            }
            className="font-black text-xl tracking-tight"
          >
            COD
            <span className="text-red-600">
              IQ
            </span>
          </button>

          {profile && (
            <nav className="flex gap-1 overflow-x-auto">
              {navButton(
                "TEST",
                "home"
              )}

              {navButton(
                "PROFILE",
                "profile"
              )}

              {navButton(
                "TEAM",
                "team"
              )}

              {navButton(
                "CLIP IQ",
                "clip"
              )}
            </nav>
          )}

        </header>

        {/* =================================================
            NEW PLAYER
           ================================================= */}

        {!profile &&
          view === "home" && (
            <section className="min-h-[75vh] flex items-center justify-center">

              <div className="w-full max-w-3xl text-center">

                <div className="inline-flex items-center gap-2 border border-red-500/20 bg-red-500/5 rounded-full px-4 py-2 mb-7">

                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />

                  <span className="text-xs font-bold tracking-[0.2em] text-red-500">
                    COMPETITIVE PLAYER ASSESSMENT
                  </span>

                </div>

                <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-5">
                  COD
                  <span className="text-red-600">
                    IQ
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-9">
                  Measure how you think,
                  adapt, communicate,
                  and make decisions
                  in competitive
                  Call of Duty situations.
                </p>

                <div className="max-w-md mx-auto">

                  <input
                    value={nameInput}
                    onChange={(e) =>
                      setNameInput(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key ===
                        "Enter"
                      ) {
                        createPlayer();
                      }
                    }}
                    placeholder="Enter player name"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-600 outline-none rounded-xl px-5 py-4 mb-3 text-center"
                  />

                  <button
                    onClick={
                      createPlayer
                    }
                    className="w-full bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl font-black transition"
                  >
                    CREATE PLAYER PROFILE
                  </button>

                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto mt-10">

                  {[
                    [
                      "🧠",
                      "Decision Making",
                    ],
                    [
                      "🗺️",
                      "Map Awareness",
                    ],
                    [
                      "🤝",
                      "Team IQ",
                    ],
                    [
                      "🎯",
                      "Objective IQ",
                    ],
                    [
                      "⚡",
                      "Gunfight IQ",
                    ],
                    [
                      "🔄",
                      "Adaptability",
                    ],
                  ].map(
                    ([icon, label]) => (
                      <div
                        key={label}
                        className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-left"
                      >
                        <div className="text-xl mb-2">
                          {icon}
                        </div>

                        <p className="text-xs text-gray-400 font-semibold">
                          {label}
                        </p>
                      </div>
                    )
                  )}

                </div>

              </div>

            </section>
          )}

        {/* =================================================
            HOME
           ================================================= */}

        {profile &&
          view === "home" && (
            <section className="max-w-5xl mx-auto">

              <div className="mb-10">

                <p className="text-xs uppercase tracking-[0.2em] text-red-500 font-bold">
                  PLAYER DASHBOARD
                </p>

                <h1 className="text-4xl md:text-6xl font-black mt-2">
                  {profile.name}
                </h1>

                <p className="text-gray-500 mt-3">
                  Build your competitive
                  profile through
                  scenario-based testing.
                </p>

              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-8">

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                  <p className="text-xs text-gray-600 uppercase tracking-wider">
                    Best Overall
                  </p>

                  <p className="text-4xl font-black mt-2">
                    {profile.bestOverall ||
                      "--"}
                  </p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                  <p className="text-xs text-gray-600 uppercase tracking-wider">
                    Recruit Score
                  </p>

                  <p className="text-4xl font-black text-red-500 mt-2">
                    {profile.bestRecruitScore ||
                      "--"}
                  </p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                  <p className="text-xs text-gray-600 uppercase tracking-wider">
                    Assessments
                  </p>

                  <p className="text-4xl font-black mt-2">
                    {
                      profile
                        .attempts
                        .length
                    }
                  </p>
                </div>

              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-7 md:p-10">

                <p className="text-red-500 text-xs font-bold tracking-[0.2em]">
                  RANKED PLAYER TEST
                </p>

                <h2 className="text-3xl md:text-4xl font-black mt-3">
                  30 scenarios.
                  One player profile.
                </h2>

                <p className="text-gray-500 mt-4 leading-relaxed max-w-2xl">
                  Each scenario presents a
                  competitive match state.
                  Your answers affect different
                  areas of your Player DNA,
                  so there is no single answer
                  pattern that can produce
                  a strong result.
                </p>

                <button
                  onClick={
                    startAssessment
                  }
                  className="mt-7 bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl font-black"
                >
                  START 30-SCENARIO TEST →
                </button>

              </div>

              <div className="grid md:grid-cols-3 gap-4 mt-4">

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
                  <p className="text-2xl mb-3">
                    📈
                  </p>

                  <h3 className="font-black">
                    Progress
                  </h3>

                  <p className="text-xs text-gray-600 mt-2">
                    Track assessment
                    scores and identify
                    changes in your
                    competitive profile.
                  </p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
                  <p className="text-2xl mb-3">
                    🏆
                  </p>

                  <h3 className="font-black">
                    Recruit Score
                  </h3>

                  <p className="text-xs text-gray-600 mt-2">
                    Summarizes the
                    decision-making traits
                    most valuable to a
                    coordinated team.
                  </p>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5">
                  <p className="text-2xl mb-3">
                    🎥
                  </p>

                  <h3 className="font-black">
                    Clip IQ
                  </h3>

                  <p className="text-xs text-gray-600 mt-2">
                    Review gameplay
                    situations by breaking
                    down intent, information,
                    decisions, and adjustments.
                  </p>
                </div>

              </div>

            </section>
          )}

        {/* =================================================
            ASSESSMENT
           ================================================= */}

        {profile &&
          view === "assessment" &&
          quizQuestions.length > 0 && (
            <section className="max-w-3xl mx-auto">

              <div className="flex justify-between items-end mb-3">

                <div>
                  <p className="text-xs font-bold tracking-[0.2em] text-red-500">
                    CODIQ ASSESSMENT
                  </p>

                  <p className="text-sm text-gray-600 mt-1">
                    {profile.name}
                  </p>
                </div>

                <p className="text-sm font-bold">
                  {current + 1}
                  <span className="text-gray-600">
                    {" "}
                    /{" "}
                    {
                      quizQuestions.length
                    }
                  </span>
                </p>

              </div>

              <div className="h-1 bg-zinc-900 rounded-full overflow-hidden mb-8">

                <div
                  className="h-full bg-red-600 transition-all"
                  style={{
                    width: `${
                      ((current + 1) /
                        quizQuestions.length) *
                      100
                    }%`,
                  }}
                />

              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden">

                <div className="px-6 py-5 border-b border-zinc-800 flex justify-between">

                  <span className="text-xs font-black tracking-[0.18em] text-red-500">
                    {
                      quizQuestions[
                        current
                      ].mode
                    }
                  </span>

                  <span className="text-xs text-gray-700">
                    Scenario{" "}
                    {current + 1}
                  </span>

                </div>

                <div className="p-6 md:p-9">

                  <h2 className="text-2xl md:text-3xl font-bold leading-snug mb-9">
                    {
                      quizQuestions[
                        current
                      ].situation
                    }
                  </h2>

                  <div className="space-y-3">

                    {quizQuestions[
                      current
                    ].answers.map(
                      (
                        answer,
                        index
                      ) => (
                        <button
                          key={
                            answer.text
                          }
                          onClick={() =>
                            answerQuestion(
                              answer
                            )
                          }
                          className="group w-full text-left bg-[#080808] border border-zinc-800 hover:border-red-500/60 hover:bg-zinc-900 rounded-2xl p-4 md:p-5 transition"
                        >
                          <div className="flex items-center gap-4">

                            <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-red-500/40 flex items-center justify-center text-sm font-black text-gray-500 group-hover:text-red-500">
                              {String.fromCharCode(
                                65 +
                                  index
                              )}
                            </span>

                            <span className="text-sm md:text-base text-gray-300 group-hover:text-white leading-relaxed">
                              {
                                answer.text
                              }
                            </span>

                            <span className="ml-auto text-gray-700 group-hover:text-red-500">
                              →
                            </span>

                          </div>
                        </button>
                      )
                    )}

                  </div>

                </div>

              </div>

            </section>
          )}

        {/* =================================================
            RESULTS
           ================================================= */}

        {profile &&
          view === "results" &&
          latestScores &&
          archetype && (
            <section className="max-w-5xl mx-auto pb-12">

              <div className="text-center mb-10">

                <p className="text-xs font-bold tracking-[0.25em] text-red-500 mb-4">
                  ASSESSMENT COMPLETE
                </p>

                <h1 className="text-5xl md:text-7xl font-black">
                  PLAYER DNA
                </h1>

                <p className="text-gray-600 mt-3">
                  {profile.name} • Assessment #
                  {
                    profile
                      .attempts
                      .length
                  }
                </p>

              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-5">

                <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-7 text-center">

                  <p className="text-xs text-gray-600 uppercase tracking-wider">
                    Overall IQ
                  </p>

                  <p className="text-6xl font-black mt-3">
                    {latestOverall}
                  </p>

                </div>

                <div className="bg-zinc-950 border border-red-900/30 rounded-3xl p-7 text-center">

                  <p className="text-xs text-gray-600 uppercase tracking-wider">
                    Recruit Score
                  </p>

                  <p className="text-6xl font-black text-red-500 mt-3">
                    {
                      latestRecruitScore
                    }
                  </p>

                  <p className="text-xs text-gray-600 mt-2">
                    {
                      getRecruitLabel(
                        latestRecruitScore
                      )
                    }
                  </p>

                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-7 text-center">

                  <p className="text-xs text-gray-600 uppercase tracking-wider">
                    Archetype
                  </p>

                  <p className="text-2xl font-black text-red-500 mt-5">
                    {
                      latestArchetype
                    }
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">

                {stats.map(
                  ([
                    name,
                    value,
                    icon,
                  ]) => (
                    <StatCard
                      key={name}
                      name={name}
                      value={value}
                      icon={icon}
                    />
                  )
                )}

              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-5">

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">

                  <p className="text-xs font-bold tracking-[0.2em] text-green-500">
                    CORE STRENGTHS
                  </p>

                  <div className="space-y-3 mt-5">

                    {strengths.map(
                      ([
                        name,
                        value,
                      ]) => (
                        <div
                          key={name}
                          className="flex justify-between bg-zinc-900 rounded-xl px-4 py-3"
                        >
                          <span className="text-sm">
                            {name}
                          </span>

                          <span className="font-black text-green-400">
                            {value}
                          </span>
                        </div>
                      )
                    )}

                  </div>

                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">

                  <p className="text-xs font-bold tracking-[0.2em] text-yellow-500">
                    DEVELOPMENT AREA
                  </p>

                  <div className="flex justify-between bg-zinc-900 rounded-xl px-4 py-3 mt-5">

                    <span className="text-sm">
                      {weakness[0]}
                    </span>

                    <span className="font-black text-yellow-400">
                      {weakness[1]}
                    </span>

                  </div>

                  <p className="text-xs text-gray-600 mt-4 leading-relaxed">
                    This is the lowest-scoring
                    area of the current
                    assessment. Repeated
                    assessments can show
                    whether this is a consistent
                    part of the player's profile.
                  </p>

                </div>

              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-7 mb-5">

                <p className="text-xs font-bold tracking-[0.2em] text-red-500">
                  PROFILE ANALYSIS
                </p>

                <h2 className="text-2xl font-black mt-3">
                  {archetype.name}
                </h2>

                <p className="text-gray-400 leading-relaxed mt-3">
                  {
                    archetype.description
                  }
                </p>

                <div className="mt-6 pt-5 border-t border-zinc-800">

                  <p className="text-xs text-gray-600 leading-relaxed">
                    Recruit Score weighs
                    decision quality, team
                    awareness, objective
                    understanding, adaptability,
                    and map awareness more
                    heavily than individual
                    gunfight performance.
                  </p>

                </div>

              </div>

              <div className="flex flex-col sm:flex-row gap-3">

                <button
                  onClick={
                    startAssessment
                  }
                  className="flex-1 bg-red-600 hover:bg-red-700 px-7 py-4 rounded-xl font-black"
                >
                  RETAKE ASSESSMENT
                </button>

                <button
                  onClick={() =>
                    setView(
                      "profile"
                    )
                  }
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-7 py-4 rounded-xl font-black"
                >
                  VIEW FULL PROFILE
                </button>

              </div>

            </section>
          )}

        {/* =================================================
            PROFILE
           ================================================= */}

        {profile &&
          view === "profile" && (
            <section className="max-w-5xl mx-auto">

              <div className="mb-8">

                <p className="text-xs font-bold tracking-[0.2em] text-red-500">
                  PLAYER PROFILE
                </p>

                <h1 className="text-5xl md:text-6xl font-black mt-2">
                  {profile.name}
                </h1>

                <p className="text-gray-600 mt-2">
                  Competitive DNA •{" "}
                  {
                    profile
                      .attempts
                      .length
                  }{" "}
                  assessments
                </p>

              </div>

              {profile.attempts
                .length === 0 ? (
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-10 text-center">

                  <p className="text-gray-500">
                    Complete your first
                    assessment to build
                    your profile.
                  </p>

                  <button
                    onClick={
                      startAssessment
                    }
                    className="mt-5 bg-red-600 px-7 py-3 rounded-xl font-black"
                  >
                    START ASSESSMENT
                  </button>

                </div>
              ) : (
                <>

                  <div className="grid md:grid-cols-3 gap-4 mb-5">

                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">

                      <p className="text-xs text-gray-600 uppercase">
                        Best Overall
                      </p>

                      <p className="text-5xl font-black mt-2">
                        {
                          profile.bestOverall
                        }
                      </p>

                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">

                      <p className="text-xs text-gray-600 uppercase">
                        Best Recruit
                      </p>

                      <p className="text-5xl font-black text-red-500 mt-2">
                        {
                          profile.bestRecruitScore
                        }
                      </p>

                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">

                      <p className="text-xs text-gray-600 uppercase">
                        Attempts
                      </p>

                      <p className="text-5xl font-black mt-2">
                        {
                          profile
                            .attempts
                            .length
                        }
                      </p>

                    </div>

                  </div>

                  <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">

                    <div className="p-6 border-b border-zinc-800">

                      <h2 className="font-black text-xl">
                        Assessment History
                      </h2>

                    </div>

                    <div className="divide-y divide-zinc-900">

                      {[
                        ...profile.attempts,
                      ]
                        .reverse()
                        .map(
                          (
                            attempt,
                            index
                          ) => (
                            <div
                              key={`${attempt.date}-${index}`}
                              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >

                              <div>

                                <p className="font-bold">
                                  Assessment #
                                  {
                                    profile
                                      .attempts
                                      .length -
                                      index
                                  }
                                </p>

                                <p className="text-xs text-gray-600 mt-1">
                                  {new Date(
                                    attempt.date
                                  ).toLocaleDateString()}
                                </p>

                              </div>

                              <div className="flex items-center gap-5">

                                <div>
                                  <p className="text-[10px] text-gray-600 uppercase">
                                    Overall
                                  </p>

                                  <p className="font-black">
                                    {
                                      attempt.overall
                                    }
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[10px] text-gray-600 uppercase">
                                    Recruit
                                  </p>

                                  <p className="font-black text-red-500">
                                    {
                                      attempt.recruitScore
                                    }
                                  </p>
                                </div>

                                <div className="hidden sm:block">

                                  <p className="text-[10px] text-gray-600 uppercase">
                                    Archetype
                                  </p>

                                  <p className="text-xs font-bold">
                                    {
                                      attempt.archetype
                                    }
                                  </p>

                                </div>

                              </div>

                            </div>
                          )
                        )}

                    </div>

                  </div>

                </>
              )}

              <button
                onClick={
                  resetPlayer
                }
                className="text-xs text-gray-700 hover:text-red-500 mt-8"
              >
                Reset local player profile
              </button>

            </section>
          )}

        {/* =================================================
            TEAM LAB
           ================================================= */}

        {profile &&
          view === "team" && (
            <section className="max-w-5xl mx-auto">

              <div className="mb-8">

                <p className="text-xs font-bold tracking-[0.2em] text-red-500">
                  TEAM LAB
                </p>

                <h1 className="text-5xl md:text-6xl font-black mt-2">
                  ROSTER VIEW
                </h1>

                <p className="text-gray-600 mt-3">
                  View the player's latest
                  competitive attributes,
                  role tendencies, and
                  recruiting profile.
                </p>

              </div>

              {profile.attempts
                .length === 0 ? (
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center">

                  <p className="text-gray-500">
                    Complete an assessment
                    to create a roster
                    profile.
                  </p>

                </div>
              ) : (
                <>
                  {(() => {
                    const latest =
                      profile.attempts[
                        profile
                          .attempts
                          .length -
                          1
                      ];

                    return (
                      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">

                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">

                          <div>

                            <p className="text-xs text-gray-600 uppercase">
                              Current Player
                            </p>

                            <h2 className="text-2xl font-black mt-1">
                              {
                                profile.name
                              }
                            </h2>

                          </div>

                          <div className="text-right">

                            <p className="text-3xl font-black text-red-500">
                              {
                                latest.recruitScore
                              }
                            </p>

                            <p className="text-[10px] text-gray-600 uppercase">
                              Recruit
                            </p>

                          </div>

                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-5">

                          {(
                            Object.entries(
                              latest.scores
                            ) as [
                              keyof Scores,
                              number
                            ][]
                          ).map(
                            ([
                              key,
                              value,
                            ]) => {

                              const labels: Record<
                                keyof Scores,
                                string
                              > = {
                                decisionMaking:
                                  "Decision Making",
                                mapAwareness:
                                  "Map Awareness",
                                teamIQ:
                                  "Team IQ",
                                objectiveIQ:
                                  "Objective IQ",
                                gunfightIQ:
                                  "Gunfight IQ",
                                adaptability:
                                  "Adaptability",
                              };

                              return (
                                <div
                                  key={key}
                                  className="bg-zinc-900 rounded-xl p-4"
                                >

                                  <p className="text-xs text-gray-600">
                                    {
                                      labels[
                                        key
                                      ]
                                    }
                                  </p>

                                  <p
                                    className={`text-2xl font-black mt-1 ${getScoreColor(
                                      value
                                    )}`}
                                  >
                                    {
                                      value
                                    }
                                  </p>

                                </div>
                              );
                            }
                          )}

                        </div>

                      </div>
                    );
                  })()}

                  <div className="grid md:grid-cols-3 gap-4 mt-5">

                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">

                      <p className="text-2xl mb-3">
                        🤝
                      </p>

                      <h3 className="font-black">
                        Team Fit
                      </h3>

                      <p className="text-xs text-gray-600 mt-2">
                        Highlights how a
                        player's decision
                        making and teamwork
                        profile fits a
                        coordinated roster.
                      </p>

                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">

                      <p className="text-2xl mb-3">
                        📊
                      </p>

                      <h3 className="font-black">
                        Roster Balance
                      </h3>

                      <p className="text-xs text-gray-600 mt-2">
                        Displays the six
                        core attributes used
                        to understand where
                        a player contributes
                        most.
                      </p>

                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">

                      <p className="text-2xl mb-3">
                        🏆
                      </p>

                      <h3 className="font-black">
                        Role Profile
                      </h3>

                      <p className="text-xs text-gray-600 mt-2">
                        Uses the player's
                        strongest attributes
                        to identify their
                        current competitive
                        archetype.
                      </p>

                    </div>

                  </div>

                </>
              )}

            </section>
          )}

        {/* =================================================
            CLIP IQ
           ================================================= */}

        {profile &&
          view === "clip" && (
            <section className="max-w-4xl mx-auto">

              <div className="mb-8">

                <p className="text-xs font-bold tracking-[0.2em] text-red-500">
                  CLIP IQ
                </p>

                <h1 className="text-5xl md:text-6xl font-black mt-2">
                  GAMEPLAY REVIEW
                </h1>

                <p className="text-gray-600 mt-3">
                  Break down real gameplay
                  moments by examining
                  information, intention,
                  decision quality, and
                  adaptation.
                </p>

              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-7 md:p-10">

                <div className="border border-dashed border-zinc-700 rounded-2xl p-10 text-center">

                  <div className="text-5xl mb-5">
                    🎥
                  </div>

                  <h2 className="text-2xl font-black">
                    Gameplay Clip
                  </h2>

                  <p className="text-sm text-gray-600 max-w-lg mx-auto mt-3">
                    Select a gameplay clip
                    to associate with a
                    player's review session.
                  </p>

                  <label className="inline-block mt-6 bg-red-600 hover:bg-red-700 px-7 py-3 rounded-xl font-black cursor-pointer">

                    SELECT CLIP

                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file =
                          e.target
                            .files?.[0];

                        if (file) {
                          setClipFileName(
                            file.name
                          );
                        }
                      }}
                    />

                  </label>

                  {clipFileName && (
                    <p className="text-sm text-green-400 mt-5">
                      Selected:{" "}
                      {
                        clipFileName
                      }
                    </p>
                  )}

                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-5">

                  <div className="bg-zinc-900 rounded-2xl p-6">

                    <p className="text-xl mb-3">
                      🧭
                    </p>

                    <h3 className="font-black">
                      Situation
                    </h3>

                    <p className="text-xs text-gray-600 mt-2">
                      Identify the match
                      state, objective,
                      teammate positions,
                      enemy information,
                      and available
                      options.
                    </p>

                  </div>

                  <div className="bg-zinc-900 rounded-2xl p-6">

                    <p className="text-xl mb-3">
                      🧠
                    </p>

                    <h3 className="font-black">
                      Intent
                    </h3>

                    <p className="text-xs text-gray-600 mt-2">
                      Explain what the
                      player was trying
                      to accomplish with
                      the decision.
                    </p>

                  </div>

                  <div className="bg-zinc-900 rounded-2xl p-6">

                    <p className="text-xl mb-3">
                      🎯
                    </p>

                    <h3 className="font-black">
                      Decision
                    </h3>

                    <p className="text-xs text-gray-600 mt-2">
                      Evaluate the choice
                      itself separately
                      from whether the
                      outcome was good
                      or bad.
                    </p>

                  </div>

                  <div className="bg-zinc-900 rounded-2xl p-6">

                    <p className="text-xl mb-3">
                      🔄
                    </p>

                    <h3 className="font-black">
                      Adaptation
                    </h3>

                    <p className="text-xs text-gray-600 mt-2">
                      Identify what
                      information should
                      change the player's
                      next decision.
                    </p>

                  </div>

                </div>

              </div>

            </section>
          )}

      </div>
    </main>
  );
}
