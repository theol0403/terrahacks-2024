const mainMenu = document.getElementById("menu-main");
const actionMenu = document.getElementById("menu-action");
const itemMenu = document.getElementById("menu-item");

var abilityList = [-1, -1, -1, -1];
var enemyAbilityList = animalAbilities;

// Player stats
var critBonus = 0;
var critMultiplier = 1.5;
var damageBonus = 0;
var damageMultiplier = 1;
var hitBonus = 0;
var hitMultiplier = 1;
var healthEffect = 0;
var defenseBonus = 0;
var DefenseMultiplier = 1;

var playerHealth = 100;
var playerHealthMax = playerHealth;

// Enemy stats
var enemyCritBonus = animalStats[0];
var enemyCritMultiplier = animalStats[1];
var enemyDamageBonus = animalStats[2];
var enemyDamageMultiplier = animalStats[3];
var enemyHitBonus = animalStats[4];
var enemyHitMultiplier = animalStats[5];
var enemyHealthEffect = animalStats[6];
var enemyDefenseBonus = animalStats[7];
var enemyDefenseMultiplier = animalStats[8];

var enemyHealth = animalProperties[0];
var enemyHealthMax = enemyHealth;

// Game general settings
var playerMove = true;
var enemyMove = true;
var timeLeft = 60;
var turn = 1;
var playerActed = false;
var enemyActed = false;

var friendlyTags = 0;
var enemyTags = 0;

var pause = false;

window.onload = function() {
  // Get JS Status
  console.log("JS Running");

  // Add game elements
  addTags("friendly", ["Extinct", "Prey", "Pack Animal"]);
  addTags("enemy", animalProperties[2]);

  // Setup bottom right menus
  actionMenu.style.display = "none";
  itemMenu.style.display = "none";

  // Add abilities for player
  addAbility({
    name: "Peck",
    description: "Peck the enemy. Fast attack.",
    damage: 20,
    crit: 0.2,
    hit: 0.6,
    pp: 30,
    ppMax: 30,
    duration: 1000,
    strikes: 1,
    type: "attack",
    effect: "None"
  }, 1);

  addAbility({
    name: "Feather Blast",
    description: "Feather blast the enemy with a rain of just straight up feathers.",
    damage: 10,
    crit: 0.8,
    hit: 0.4,
    pp: 5,
    ppMax: 5,
    duration: 300,
    strikes: 3,
    type: "attack",
    effect: "None"
  }, 2);

  addAbility({
    name: "Eat Grass",
    description: "I am a herbivore, let me eat some grass to heal.",
    damage: 30,
    crit: 0,
    hit: 1,
    pp: 20,
    ppMax: 20,
    duration: 2000,
    strikes: 1,
    type: "heal",
    effect: "None"
  }, 3);

  addAbility({
    name: "Flap Wings",
    description: "Flap wings fast to deal minimal damage, but sigif.",
    damage: 2,
    crit: 0.3,
    hit: 0.6,
    pp: 10,
    ppMax: 10,
    duration: 500,
    strikes: 5,
    type: "attack",
    effect: "Weaken"
  }, 4);

  // Setting game
  if (environment != "EMPTY!") {
    document.body.style.backgroundImage = "url('/static/img/background.png')";
    document.getElementById("default-game-background").style.display = "none";
  }
  refreshHealth();

  // Game main
  loadIntro();
  // gameLoop();
}

function loadIntro() {
  for (let i = 0; i < enemyAbilityList.length; i++) {
    var elm = document.createElement("p");
    elm.innerHTML = "<u style='cursor: pointer;'><strong>" + String(enemyAbilityList[i].name) + "</strong></u>: " + String(enemyAbilityList[i].description);
    elm.style.color = "white";

    document.getElementById("intro-abilities").append(elm);
  }
  var br = document.createElement("br");
  document.getElementById("intro-abilities").append(br);
}

function startGame() {
  document.getElementById("intro").className = "hidden-animation";
  setTimeout(() => {
    document.getElementById("intro").style.display = "none";
    gameLoop();
  }, 2000);
}

function exitGame() {
  if (confirm("Exit Battle?")) {
    window.close();
  }
}

var now = Date.now();
var last = 0;
function gameLoop(){
  // Winning / Losing
  if(pause) return;
  window.requestAnimationFrame(gameLoop);
  if (playerHealth <= 0) {
    loseGame();
  } else if (enemyHealth <= 0) {
    winGame();
  }

  // Turns
  if (turn == 1 && !playerActed && playerHealth > 0 && enemyHealth > 0) {
    now = Date.now();
    if(!last || now - last >= 1000 && !playerActed && turn != 2) {
      last = now;
      // timeLeft--;
      if (timeLeft <= 0) {
        turn = 2;
        playerActed = true;
        disableActions();
        timeLeft = 60;
        refreshHealth();
      }
      refreshHealth();
    }
  } else if (turn == 2 && playerActed && !enemyActed && playerHealth > 0 && enemyHealth > 0) {
    activateAI();
  }
}

function winGame() {
  pause = true;
  newLog("friendly", String(animal) + " has fainted! You won!");
  document.getElementById("animal-sprite-enemy").className += " hidden-animation";

  setTimeout(() => {
    document.getElementById("outro").style.display = "block";
    document.getElementById("outro").className += " fade-in-image";
  }, 2000);
}

function loseGame() {
  pause = true;
  newLog("enemy", "DIDI BIRD has fainted! You lost!");
  document.getElementById("animal-sprite-friendly").className += " hidden-animation";

  setTimeout(() => {
    document.getElementById("outro").style.display = "block";
    document.getElementById("outro-pic").style.backgroundImage = "url('/static/img/defeat.png')";
    document.getElementById("outro-btn").className = "btn btn-danger";
    document.getElementById("outro").className += " fade-in-image";
  }, 2000);
}

function getSum(list) {
  var sum = 0;
  for (let i = 0; i < list.length; i++) {
    sum += list[i];
  }
  return sum;
}

function shuffle(obj1, obj2) {
  var index = obj1.length;
  var rnd, tmp1, tmp2;

  while (index) {
    rnd = Math.floor(Math.random() * index);
    index -= 1;
    tmp1 = obj1[index];
    tmp2 = obj2[index];
    obj1[index] = obj1[rnd];
    obj2[index] = obj2[rnd];
    obj1[rnd] = tmp1;
    obj2[rnd] = tmp2;
  }
}

function activateAI() {
  disableActions();
  enemyActed = true;
  setTimeout(() => {
    var defaultProbabilities = [0, 0, 0, 0];
    for (let i = 0; i < defaultProbabilities.length; i++) {
      if (getSum(defaultProbabilities) >= 1) continue;
      var probability = Math.random() * (1 - getSum(defaultProbabilities) - 0) + 0;
      defaultProbabilities[i] = probability;
    }
    defaultProbabilities[defaultProbabilities.length-1] = 1 - getSum(defaultProbabilities.slice(0, 3));
    console.log(defaultProbabilities);

    var randList = [1, 2, 3, 4];
    console.log(randList);

    shuffle(defaultProbabilities, randList);
    console.log(defaultProbabilities);
    console.log(randList);

    var chosen = 4;
    for (let i = 0; i < defaultProbabilities.length; i++) {
      var probabilityPercent = Math.ceil(defaultProbabilities[i] * 100);
      if (Math.random() * 100 + 1 <= probabilityPercent) {
        chosen = randList[i];
        break;
      }
    }
    console.log(chosen);
    console.log(enemyAbilityList[chosen-1]);

    var currAbility = enemyAbilityList[chosen-1];
    newLog("enemy", String(animal) + " has used <u style='cursor: pointer;' title='" + String(currAbility.description) + "'><b>" + String(currAbility.name) + "</b></u>!");

    if (currAbility.type == "heal") {
      document.getElementById("animal-sprite-enemy").style.animation = "blink_long " + String(currAbility.duration * currAbility.strikes / 1000) + "s";
      document.getElementById("hit-animation").style.top = "22vh";
      document.getElementById("hit-animation").style.right = "19vw";
      document.getElementById("hit-animation").style.backgroundImage = "url('/static/img/heal.gif')";
      
      document.getElementById("hit-animation").style.display = "block";
      setTimeout(() => {
        document.getElementById("hit-animation").style.display = "none";
  
        // Check crit
        var critChance = Math.min(Math.ceil((currAbility.crit) * 100), 100);
        var critDamage = 0;
        var critHit = false;
        if (Math.random() * 100 + 1 <= critChance) {
          critDamage = currAbility.damage * Math.max(enemyCritMultiplier - 1, 0) + enemyCritBonus;
          critHit = true;
          newLog("enemy", String(animal) + " rolled CRITICAL DAMAGE!");
  
          document.getElementById("crit-indicator").style.top = "19vh";
          document.getElementById("crit-indicator").style.right = "16vw";
          document.getElementById("crit-indicator").style.animation = "drop 1s";
          document.getElementById("crit-indicator").style.display = "block";
          document.getElementById("crit-indicator").style.animation = "neon 1s";
        }
  
        // Check hit
        for (let i = 0; i < currAbility.strikes; i++) {
          disableActions();
          (function(index) {
            document.getElementById("animal-sprite-enemy").style.animation = "none";
            setTimeout(function() {
              var hitChance = Math.min(Math.ceil((currAbility.hit + enemyHitBonus) * enemyHitMultiplier * 100), 100);
              var hit = true;
      
              if (hitChance != 100) {
                if (Math.random() * 100 + 1 > hitChance) hit = false;
                if (critHit) hit = true;
              }
      
              if (hit) {
                var damage = Math.ceil((currAbility.damage) + critDamage);
                newLog("enemy", String(animal) + " recovered " + String(damage) + " HP.");
      
                document.getElementById("damage-indicator").innerHTML = "+" + String(damage) + " HP";
                enemyHealth = Math.min(enemyHealthMax, enemyHealth + damage);
                // document.getElementById("animal-sprite-enemy").style.animation = "hurt " + String(currAbility.duration / 1000) + "s";
              } else {
                document.getElementById("damage-indicator").innerHTML = "MISSED!";
                newLog("enemy", String(animal) + " has MISSED!");
                // document.getElementById("animal-sprite-enemy").style.animation = "blink " + String(currAbility.duration / 1000) + "s";
              }
      
              document.getElementById("damage-indicator").style.top = String(24 + 2*i) + "vh";
              document.getElementById("damage-indicator").style.right = String(16 - i) + "vw";
              document.getElementById("damage-indicator").style.display = "block";
  
              refreshHealth();
            }, currAbility.duration * i);
          })(i);
        }
        setTimeout(() => {
          document.getElementById("crit-indicator").style.display = "none";
          document.getElementById("damage-indicator").style.display = "none";
          document.getElementById("animal-sprite-friendly").style.animation = "breathing 5s ease-out infinite normal";
          document.getElementById("animal-sprite-enemy").style.animation = "breathing 5s ease-out infinite normal";
  
          turn = 1;
          enableActions();
          enemyActed = false;
          timeLeft = 60;
          refreshHealth();
        }, 2000);
      }, currAbility.duration * currAbility.strikes);
    } else if (currAbility.type == "attack") {
      document.getElementById("animal-sprite-friendly").style.animation = "shake " + String(currAbility.duration * currAbility.strikes / 1000) + "s";
  
      document.getElementById("hit-animation").style.backgroundImage = "url('/static/img/attack_rapid.gif')";
      document.getElementById("hit-animation").style.top = "48vh";
      document.getElementById("hit-animation").style.right = "64vw";
      document.getElementById("hit-animation").style.display = "block";
      setTimeout(() => {
        document.getElementById("hit-animation").style.display = "none";
  
        // Check crit
        var critChance = Math.min(Math.ceil((currAbility.crit) * 100), 100);
        var critDamage = 0;
        var critHit = false;
        if (Math.random() * 100 + 1 <= critChance) {
          critDamage = currAbility.damage * Math.max(enemyCritMultiplier - 1, 0) * defenseMultiplier + enemyCritBonus;
          critHit = true;
          newLog("enemy", String(animal) + " rolled CRITICAL DAMAGE!");
  
          document.getElementById("crit-indicator").style.top = "43vh";
          document.getElementById("crit-indicator").style.right = "57vw";
          document.getElementById("crit-indicator").style.animation = "drop 1s";
          document.getElementById("crit-indicator").style.display = "block";
          document.getElementById("crit-indicator").style.animation = "neon 1s";
        }
  
        // Check hit
        for (let i = 0; i < currAbility.strikes; i++) {
          disableActions();
          (function(index) {
            document.getElementById("animal-sprite-enemy").style.animation = "none";
            setTimeout(function() {
              var hitChance = Math.min(Math.ceil((currAbility.hit + enemyHitBonus - defenseBonus) * enemyHitMultiplier * 100), 100);
              var hit = true;
      
              if (hitChance != 100) {
                if (Math.random() * 100 + 1 > hitChance) hit = false;
                if (critHit) hit = true;
              }
      
              if (hit) {
                var damage = Math.ceil((currAbility.damage + enemyDamageBonus - defenseBonus) * enemyDamageMultiplier * enemyDefenseMultiplier + critDamage);
                if (damage < 0) damage = 0;

                if (playerHealth > 0) {
                  newLog("enemy", String(animal) + " dealt " + String(damage) + " HP of damage to DIDI BIRD.");
                }

                document.getElementById("damage-indicator").innerHTML = "-" + String(damage) + " HP";
                playerHealth = Math.max(0, playerHealth - damage);
                // document.getElementById("animal-sprite-enemy").style.animation = "hurt " + String(currAbility.duration / 1000) + "s";
              } else {
                newLog("enemy", String(animal) + " has MISSED!");
                document.getElementById("damage-indicator").innerHTML = "MISSED!";
                // document.getElementById("animal-sprite-enemy").style.animation = "blink " + String(currAbility.duration / 1000) + "s";
              }
      
              document.getElementById("damage-indicator").style.top = String(48 + 2*i) + "vh";
              document.getElementById("damage-indicator").style.right = String(57 - i) + "vw";
              document.getElementById("damage-indicator").style.display = "block";
  
              refreshHealth();
            }, currAbility.duration * i);
          })(i);
        }
        setTimeout(() => {
          document.getElementById("crit-indicator").style.display = "none";
          document.getElementById("damage-indicator").style.display = "none";
          document.getElementById("animal-sprite-friendly").style.animation = "breathing 5s ease-out infinite normal";
          document.getElementById("animal-sprite-enemy").style.animation = "breathing 5s ease-out infinite normal";
  
          turn = 1;
          enableActions();
          enemyActed = false;
          timeLeft = 60;
          refreshHealth();
        }, 2000);
      }, currAbility.duration * currAbility.strikes);
    }

    turn = 1;
    playerActed = false;
  }, 2000);
}

function useMenuOption(elm) {

  if (elm.innerHTML.includes("Fight")) {
    mainMenu.style.display = "none";
    itemMenu.style.display = "none";

    actionMenu.style.display = "grid";
  } else if (elm.innerHTML.includes("Items")) {

  } else if (elm.innerHTML.includes("Help")) {

  } else if (elm.innerHTML.includes("Escape")) {

  } else if (elm.innerHTML.includes("Return")) {
    actionMenu.style.display = "none";
    itemMenu.style.display = "none";

    mainMenu.style.display = "grid";
  } else {
    return -1;
  }
}

var tagsListName = ["Poisonous", "Invasive", "Critically Endangered", "Threatened", "Endangered", "Extinct", "Herbivore", "Carnivore", "Omnivore", "Predator", "Prey", "Pack Animal", "Solitary Animal"]
var tagsListDescription = ["This animal is poisonous!", "This is an invasive species, not native to the land it is in.", "This animal is critically endangered, near extinction.", "This animal is not endangered, but is threatened population-wise.", "This species is endangered.", "This animal already went extinct...", "This animal only eats plants.", "This animal only eats meats.", "This animal eats both plants and meats.", "This animal is predatory, it hunts down preys.", "This animal is a prey, it has predators that hunts it down.", "This species like to live and act together.", "This species is full of loners."]

function newTagElm(tagName, tagDescription) {
  var tagElm = document.createElement("div");
  tagElm.className = "tag";
  tagElm.title = tagDescription;
  tagElm.style.backgroundImage = "url('/static/img/" + String(tagName).replace(" ", "_") + ".png')";

  return tagElm;
}

function addTags(side, properties) {
  for (let i = 0; i < properties.length; i++) {
    var tagElm = newTagElm(properties[i], tagsListDescription[tagsListName.indexOf(properties[i])]);

    if (side == "friendly") {
      tagElm.style.bottom = "20px";
      tagElm.style.left = "calc(30vw + 20px + " + String(10 + i*45) + "px)";
      tagElm.style.width = "40px";
      tagElm.style.height = "40px";
      friendlyTags++;
    } else {
      tagElm.style.top = "20px";
      tagElm.style.right = "calc(22.5vw + 20px + " + String(7.5 + i*(33.75)) + "px)";
      tagElm.style.width = "30px";
      tagElm.style.height = "30px";
      enemyTags++;
    }

    document.getElementById("battle-game").append(tagElm);
  }
}

function newLog(side, content) {
  var logElm = document.createElement("p");
  logElm.innerHTML = "[" + String(new Date()).substring(0, 25) + "] " + content;
  logElm.style.margin = 0;
  
  if (side != "friendly") {
    logElm.style.color = "crimson";
  }

  document.getElementById("logs").append(logElm);
  document.getElementById("logs").scrollTop = document.getElementById("logs").scrollHeight;
}

function addAbility(ability, slot) {
  abilityList[slot-1] = ability;

  document.getElementById("menu-action").children[slot-1].innerHTML = "<strong>" + String(ability.name).toUpperCase() + "</strong></br>PP: " + String(ability.pp) + " / " + String(ability.ppMax);
  document.getElementById("menu-action").children[slot-1].className = document.getElementById("menu-action").children[slot-1].className.replace("btn-secondary", "btn-light border-dark");
}

function refreshAbility() {
  for (let i = 0; i < 4; i++) {
    if (abilityList[i] == -1) continue;

    document.getElementById("menu-action").children[i].innerHTML = "<strong>" + String(abilityList[i].name).toUpperCase() + "</strong></br>PP: " + String(abilityList[i].pp) + " / " + String(abilityList[i].ppMax);
    if (abilityList[i].pp > 0) {
      document.getElementById("menu-action").children[i].className = document.getElementById("menu-action").children[i].className.replace("btn-secondary", "btn-light border-dark");
    } else {
      document.getElementById("menu-action").children[i].className = document.getElementById("menu-action").children[i].className.replace("btn-secondary", "btn-danger border-dark");
      document.getElementById("menu-action").children[i].disabled = true;
    }
  }
}

function useAbility(num) {
  if (document.getElementById("menu-action").children[num-1].innerHTML == "NONE") return -1;
  if (document.getElementById("menu-action").children[num-1].disabled) {
    alert("Unable to use this ability: PP is all used up!");
    return -1;
  }

  disableActions();
  var currAbility = abilityList[num-1];
  currAbility.pp -= 1;
  refreshAbility();
  useMenuOption(document.getElementById("action-return"));
  hideAbilityDescription();

  newLog("friendly", "DIDI BIRD has used <u style='cursor: pointer;' title='" + String(currAbility.description) + "'><b>" + String(currAbility.name) + "</b></u>!");

  // Run animation
  if (currAbility.type == "heal") {
    document.getElementById("animal-sprite-friendly").style.animation = "blink_long " + String(currAbility.duration * currAbility.strikes / 1000) + "s";

    document.getElementById("hit-animation").style.backgroundImage = "url('/static/img/heal.gif')";
    document.getElementById("hit-animation").style.top = "45vh";
    document.getElementById("hit-animation").style.right = "55vw";
    document.getElementById("hit-animation").style.display = "block";
    setTimeout(() => {
      document.getElementById("hit-animation").style.display = "none";

      // Check crit
      var critChance = Math.min(Math.ceil((currAbility.crit) * 100), 100);
      var critDamage = 0;
      var critHit = false;
      if (Math.random() * 100 + 1 <= critChance) {
        critDamage = currAbility.damage * Math.max(critMultiplier - 1, 0) + critBonus;
        critHit = true;
        newLog("friendly", "DIDI BIRD rolled CRITICAL DAMAGE!");

        document.getElementById("crit-indicator").style.top = "43vh";
        document.getElementById("crit-indicator").style.right = "57vw";
        document.getElementById("crit-indicator").style.animation = "drop 1s";
        document.getElementById("crit-indicator").style.display = "block";
        document.getElementById("crit-indicator").style.animation = "neon 1s";
      }

      // Check hit
      for (let i = 0; i < currAbility.strikes; i++) {
        disableActions();
        (function(index) {
          document.getElementById("animal-sprite-enemy").style.animation = "none";
          setTimeout(function() {
            var hitChance = Math.min(Math.ceil((currAbility.hit + hitBonus) * hitMultiplier * 100), 100);
            var hit = true;
    
            if (hitChance != 100) {
              if (Math.random() * 100 + 1 > hitChance) hit = false;
              if (critHit) hit = true;
            }
    
            if (hit) {
              var damage = Math.ceil((currAbility.damage) + critDamage);

              newLog("friendly", "DIDI BIRD recovered " + String(damage) + " HP.");
    
              document.getElementById("damage-indicator").innerHTML = "+" + String(damage) + " HP";
              playerHealth = Math.min(playerHealthMax, playerHealth + damage);
              // document.getElementById("animal-sprite-enemy").style.animation = "hurt " + String(currAbility.duration / 1000) + "s";
            } else {
              document.getElementById("damage-indicator").innerHTML = "MISSED!";
              newLog("friendly", "DIDI BIRD has MISSED!");
              // document.getElementById("animal-sprite-enemy").style.animation = "blink " + String(currAbility.duration / 1000) + "s";
            }
    
            document.getElementById("damage-indicator").style.top = String(48 + 2*i) + "vh";
            document.getElementById("damage-indicator").style.right = String(57 - i) + "vw";
            document.getElementById("damage-indicator").style.display = "block";

            refreshHealth();
          }, currAbility.duration * i);
        })(i);
      }
      setTimeout(() => {
        document.getElementById("crit-indicator").style.display = "none";
        document.getElementById("damage-indicator").style.display = "none";
        document.getElementById("animal-sprite-friendly").style.animation = "breathing 5s ease-out infinite normal";
        document.getElementById("animal-sprite-enemy").style.animation = "breathing 5s ease-out infinite normal";

        turn = 2;
        timeLeft = 60;
        refreshHealth();
      }, 2000);
    }, currAbility.duration * currAbility.strikes);
  } else if (currAbility.type == "attack") {
    document.getElementById("animal-sprite-enemy").style.animation = "shake " + String(currAbility.duration * currAbility.strikes / 1000) + "s";

    document.getElementById("hit-animation").style.backgroundImage = "url('/static/img/attack_rapid.gif')";
    document.getElementById("hit-animation").style.top = "19vh";
    document.getElementById("hit-animation").style.right = "20vw";
    document.getElementById("hit-animation").style.display = "block";
    setTimeout(() => {
      document.getElementById("hit-animation").style.display = "none";

      // Check crit
      var critChance = Math.min(Math.ceil((currAbility.crit) * 100), 100);
      var critDamage = 0;
      var critHit = false;
      if (Math.random() * 100 + 1 <= critChance) {
        critDamage = currAbility.damage * Math.max(critMultiplier - 1, 0) * enemyDefenseMultiplier + critBonus;
        critHit = true;
        newLog("friendly", "DIDI BIRD rolled CRITICAL DAMAGE!");

        document.getElementById("crit-indicator").style.top = "19vh";
        document.getElementById("crit-indicator").style.right = "16vw";
        document.getElementById("crit-indicator").style.animation = "drop 1s";
        document.getElementById("crit-indicator").style.display = "block";
        document.getElementById("crit-indicator").style.animation = "neon 1s";
      }

      // Check hit
      for (let i = 0; i < currAbility.strikes; i++) {
        disableActions();
        (function(index) {
          document.getElementById("animal-sprite-enemy").style.animation = "none";
          setTimeout(function() {
            var hitChance = Math.min(Math.ceil((currAbility.hit + hitBonus - enemyDefenseBonus) * hitMultiplier * 100), 100);
            var hit = true;
    
            if (hitChance != 100) {
              if (Math.random() * 100 + 1 > hitChance) hit = false;
              if (critHit) hit = true;
            }
    
            if (hit) {
              var damage = Math.ceil((currAbility.damage + damageBonus - enemyDefenseBonus) * damageMultiplier * enemyDefenseMultiplier + critDamage);
              if (damage < 0) damage = 0;

              if (enemyHealth > 0) {
                newLog("friendly", "DIDI BIRD dealt " + String(damage) + " HP of damage to " + String(animal) + ".");
              }

              document.getElementById("damage-indicator").innerHTML = "-" + String(damage) + " HP";
              enemyHealth = Math.max(0, enemyHealth - damage);
              // document.getElementById("animal-sprite-enemy").style.animation = "hurt " + String(currAbility.duration / 1000) + "s";
            } else {
              document.getElementById("damage-indicator").innerHTML = "MISSED!";
              newLog("friendly", "DIDI BIRD has MISSED!");
              // document.getElementById("animal-sprite-enemy").style.animation = "blink " + String(currAbility.duration / 1000) + "s";
            }
    
            document.getElementById("damage-indicator").style.top = String(24 + 2*i) + "vh";
            document.getElementById("damage-indicator").style.right = String(16 - i) + "vw";
            document.getElementById("damage-indicator").style.display = "block";

            refreshHealth();
          }, currAbility.duration * i);
        })(i);
      }
      setTimeout(() => {
        document.getElementById("crit-indicator").style.display = "none";
        document.getElementById("damage-indicator").style.display = "none";
        document.getElementById("animal-sprite-friendly").style.animation = "breathing 5s ease-out infinite normal";
        document.getElementById("animal-sprite-enemy").style.animation = "breathing 5s ease-out infinite normal";

        turn = 2;
        timeLeft = 60;
        refreshHealth();
      }, 2000);
    }, currAbility.duration * currAbility.strikes);
  } else {
    alert("ERROR INVALID ABILITY TYPE!");
    return -1;
  }
}

function showAbilityDescription(num) {
  if (document.getElementById("menu-action").children[num-1].innerHTML == "NONE") return -1;
  document.getElementById("description-box-ability").style.display = "block";

  document.getElementById("description-box-ability").children[0].innerHTML = abilityList[num-1].name.toUpperCase();
  document.getElementById("description-box-ability").children[1].innerHTML = abilityList[num-1].description;
}

function hideAbilityDescription() {
  document.getElementById("description-box-ability").style.display = "none";
}

function disableActions() {
  for (let i = 0; i < 4; i++) {
    document.getElementById("menu-main").children[i].disabled = true;
  }
  playerActed = true;
}

function enableActions() {
  for (let i = 0; i < 4; i++) {
    document.getElementById("menu-main").children[i].disabled = false;
  }
  playerActed = false;
}

function refreshHealth() {
  document.getElementById("healthbar-friendly-health").innerHTML = String(playerHealth) + " / " + String(playerHealthMax);
  document.getElementById("healthbar-friendly-health").setAttribute("aria-valuenow", String(playerHealth));
  document.getElementById("healthbar-friendly-health").setAttribute("aria-valuemax", String(playerHealthMax));
  document.getElementById("healthbar-friendly-health").style.width = String(Math.ceil(playerHealth / playerHealthMax * 100)) + "%";

  document.getElementById("healthbar-friendly-time").innerHTML = String(timeLeft) + " seconds";
  document.getElementById("healthbar-friendly-time").style.width = String(Math.floor(timeLeft / 60 * 100)) + "%";

  document.getElementById("healthbar-enemy-health").innerHTML = String(enemyHealth) + " / " + String(enemyHealthMax);
  document.getElementById("healthbar-enemy-health").setAttribute("aria-valuenow", String(enemyHealth));
  document.getElementById("healthbar-enemy-health").setAttribute("aria-valuemax", String(enemyHealthMax));
  document.getElementById("healthbar-enemy-health").style.width = String(Math.ceil(enemyHealth / enemyHealthMax * 100)) + "%";
}

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

function textToSpeech(elm) {
  var msg = elm.getElementsByClassName("text-bubble-txt")[0].children[1].innerHTML;
  var filename = makeid(8);

  var url = "/get_tts?" + new URLSearchParams({filename, msg});
  fetch(url, {
    "method": "GET"
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
    new Audio('/static/audio/' + filename + '.mp3').play();
  });
}

// function postMessage(text, char, img, align, textspace) {
//   var elm;
//   var textSpace = document.getElementById(textspace);

//   if (align == "left") {
//     elm = document.getElementById("default-text-bubble-left").cloneNode(true);
//     elm.children[1].children[0].innerHTML = char;
//     elm.children[1].children[1].innerHTML = text;

//     //IMG HERE
//   } else if (align == "right") {
//     elm = document.getElementById("default-text-bubble-right").cloneNode(true);
//     elm.children[0].children[0].innerHTML = char;
//     elm.children[0].children[1].innerHTML = text;

//     //IMG HERE
//   }

//   textSpace.appendChild(elm);
//   elm.style.display = "block";

//   textSpace.scrollTop = textSpace.scrollHeight;

//   return elm;
// }

// function sendMessage() {
//   var textSpace = document.getElementById("textspace");
//   var msg = document.getElementById("send-area").value;
//   if (msg.replace(" ", "") == "") {
//     return;
//   }

//   document.getElementById("send-area").value = "";
//   postMessage(msg, "Me", -1, "right", "textspace");
//   textSpace.scrollTop = textSpace.scrollHeight;

//   var roleplaying = "Will Smith";
//   var url = "/get_response?" + new URLSearchParams({roleplaying, msg})
//   fetch(url, {
//     "method": "GET"
//   })
//   .then(response => response.json())
//   .then(data => {
//     console.log(data.json);
//     var elm = postMessage(data, "Mr. Krabs", -1, "left", "textspace");
//     textToSpeech(elm);
//     textSpace.scrollTop = textSpace.scrollHeight;
//   });
// }
