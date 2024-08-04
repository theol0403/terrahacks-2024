from flask import Flask, session, render_template, Response, request, request, url_for, flash, redirect, jsonify
import random
import os
import openai
import ast
import urllib
from PIL import Image
import io
import rembg
import traceback
import numpy as np

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True

os.environ["OPENAI_API_KEY"] = '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'
openai.api_key = os.getenv("OPENAI_API_KEY")

sampleAbility1 = '''{
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
}'''

sampleAbility2 = '''{
    name: "Eat Grass",
    description: "I am a herbivore, let me eat some grass to heal.",
    damage: 30,
    crit: 0,
    hit: 1,
    pp: 10,
    ppMax: 10,
    duration: 2000,
    strikes: 1,
    type: "heal",
    effect: "None"
}'''

abilityExplanation = '''
(string) name: the name of the ability;
(string) description: brief description of the ability;
(int) damage: damage that will be dealt if this is an attack, or amount to be healed if this is a healing ability, lower if multiple strikes. Weaker animals should have lower damage, strong animals should have higher, make it balanced;
(float) crit: critical chance, [0-1] float values only, 0 is 0%, 1 is 100%;
(float) hit: chance to hit the target, [0-1] float values only, 0 is 0%, 1 is 100%;
(int) pp: number of usages, powerful attacks have less, weak attacks have higher pp count;
(int) ppMax: set equal to pp in this case;
(int) duration: in miliseconds, how long the animation of this attack should be, pick a number between [1000-3000], higher if only one strike;
(int) strike: number of strikes, how many times this ability will be used in one turn, max 5. Heavier attacks should have less strikes, faster animals may have more strikes per attack at lower damage than average;
(string) type: pick only one from either "heal" or "attack", heal means this will heal the user, attack means it will deal damage to the enemy;
(string) effect: pick only one, and only from the list of "None", "Poison", "Slow", "Bleed", "Hasten", "Weaken", "Defend", or "Stun", each correspond to an effect that will be placed on the enemy, healing abilities will always be "None", "Hasten", "Weaken", or "Defend". Hasten indicates that this ability would increase the animal's speed in future turns, Weaken means it will reduce attack damage of enemy in future turns, and Defend will increase the animal's defense in future turns;
'''

statsExplanation = '''
(int) critBonus: How much additional damage/heal should a critical attack deal, or how much less if this value is negative. If multiplier is high, the decrease this raw bonus, and vice versa. A sneakier animal should have higher crit amount, and a more obvious animal should have lower;
(float) critMultiplier: A multiplier, 1 is default meaning no impact, of how much damage/heal a critical attack deals should be muliplied by for this animal;
(int) damageBonus = How much additional damage/heal should a normal attack deal, or how much less if this value is negative. If multiplier is high, the decrease this raw bonus, and vice versa. A larger/heavy-hitting animal should have higher raw damage amount, and a more smaller/nimble animal should have lower;
(float) damageMultiplier: A multiplier, 1 is default meaning no impact, of how much damage/heal a normal attack deals should be muliplied by for this animal;
(int) hitBonus: Additional if positive, or decreased if negative, of chance to hit target. Keep this between [0-0.3]. If multiplier is high, the decrease this raw bonus, and vice versa. A smarter animal should have higher hit bonus, and a dumber animal should have lower;
(float) hitMultiplier: A multiplier, 1 is default meaning no impact, of how much the animal's hit chance should be multiplied;
(int) healthEffect: On a per turn basis, how much HP should the animal heal (if positive), or lose (if negative). Most animals should have 0 for this value, except for a few with strong regenerative abilities that would have a number above 0;
(float) defenseBonus: How much damage taken should be negated, or how much more damage to take if this value is negative. If multiplier is high, the decrease this raw bonus, and vice versa. A larger/defensive animal should have higher defense amount, and a smaller/weaker animal should have lower;
(float) defenseMultiplier: A multiplier, 1 is default meaning no impact, of how much the animal's damage taken should be multiplied. Opposite to the other stats, having lower than 1 value in this stat means the animal would take less damage, and higher value than 1 would take more damage;
'''

statsSample = '''
var critBonus = 0;
var critMultiplier = 1.5;
var damageBonus = 0;
var damageMultiplier = 1;
var hitBonus = 0;
var hitMultiplier = 1;
var healthEffect = 0;
var defenseBonus = 0;
var DefenseMultiplier = 1;
'''

@app.route('/')
def index():
    try:
        animal = request.args.get('animal')
        if animal is None:
            raise Exception("Defaulting animal!")
    except:
        print(traceback.format_exc())
        animal = "Emerald Ash Borer" # Default Animal

    try:
        description = request.args.get('description')
        if description is None:
            raise Exception("Defaulting description!")
    except:
        print(traceback.format_exc())
        description = "Description not found!"

    try:
        environment = request.args.get('environment')
        if environment is None:
            raise Exception("Defaulting environment!")

        response = openai.images.generate(
            model="dall-e-3",
            prompt="Generate a 3d geological landscape. The arena should be tilted in an isometric way from the player." + str(environment).upper() + ", no borders visible, no text or numbers. Realistic, pastel colors. The zoom should be appropriate to place characters. Full screen arena. square aspect ratio. No background visible. White background.",
            size="1024x1024",
            quality="standard",
            n=1,
        )

        image_url = response.data[0].url

        with urllib.request.urlopen(image_url) as url:
            image_data = url.read()
        image = Image.open(io.BytesIO(image_data))

        # Convert the input image to a numpy array
        input_array = np.array(image)

        # Apply background removal using rembg
        output_array = rembg.remove(input_array)

        # Create a PIL Image from the output array
        output_image = Image.fromarray(output_array)

        output_image.save("static/img/background.png", format="PNG")

        environment = "SUCCESS!"
    except:
        print(traceback.format_exc())
        environment = "EMPTY!"

    animalProperties = openai.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You will help determine the stats of an animal, and return these information as a python-style list. DO NOT RETURN ANYTHING BUT THIS LIST, as it has to be passed later to the literal_eval() function. RETURN ALL STRING TYPE SURROUNDED BY QUOTATION MARKS."},
        {"role": "assistant", "content": "The format to return is a string containing different values separated by commas, in the format of [health, living environment/biome, type of animal]"},
        {"role": "user", "content": "Giving the animal: " + str(animal) + ". Return the following information about the animal: 1. [int] Animal health, as a singular integer, for reference the strongest animals has max health of 400, and weakest may have 40, should be at least 40. A dodo bird as an example has 100. Animals that have 300+ health must be very large, like elephants or whales; 2. [string] Where this animal is usually found, choose only onefrom the following: (ocean, land, underground, sky, arctics); 3. [list] What type of animal is it, choose from the following: (Poisonous, Invasive, Critically Endangered, Threatened, Endangered, Extinct, Herbivore, Carnivore, Omnivore, Predator, Prey, Pack Animal, Solitary Animal) can choose multiple for this one. RETURN ONLY THE LIST, DO NOT ADD ANYTHING ELSE TO THE LIST."}
    ]
    ).choices[0].message.content

    animalProperties = animalProperties.replace("```python", "").replace("```", "")

    animalPropertiesString = animalProperties
    print(animalProperties)
    animalProperties = ast.literal_eval(animalProperties)
    print(animalProperties)

    animalAbilities = openai.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You will help determine the abilities of an animal, and return these information as a python list. DO NOT RETURN ANYTHING BUT THIS LIST, as it has to be passed later to the literal_eval() function"},
        {"role": "assistant", "content": "The format to return is a list of dictionaries. Each dictionary represents an ability's stats, it's similar to how Pokemon abilities work. For context, here are what the different properties mean: " + abilityExplanation},
        {"role": "user", "content": "Giving the animal: " + str(animal) + ". Return a list of 4 abilities as a python list. As examples, here are two abilities for Dodos: 1. An attack ability: " + sampleAbility1 + "and 2. A healing ability: " + sampleAbility2 + ". Keep it balanced, as for example the Dodo bird only has a health of 100. Stronger animals should deal more damage. Animals such as Lionfish that are poisonous should have a potential poison effect to some of the abilities, heavy hitters may have stun or slow depends on how heavy, sharp claw attacks may have bleed, otherwise it has no additional effects."}
    ]
    ).choices[0].message.content

    animalAbilities = animalAbilities.replace("```python", "").replace("```", "")

    animalAbilitiesString = animalAbilities
    print(animalAbilities)
    animalAbilities = ast.literal_eval(animalAbilities)
    print(animalAbilities)

    animalStats = openai.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You will help determine the stats of an animal, and return these information as a python list. DO NOT RETURN ANYTHING BUT THIS LIST, as it has to be passed later to the literal_eval() function"},
        {"role": "assistant", "content": "The format to return is a string containing different values separated by commas, in the format of [critBonus, critMultiplier, damageBonus, damageMultiplier, hitBonus, hitMultiplier, healthEffect, defenseBonus, defenseMultiplier]"},
        {"role": "user", "content": "Giving the animal: " + str(animal) + ". Return the list of stats. The definition is as follows: " + statsExplanation + ". Keep things balanced, for example, a Dodo bird's stats are as follow: " + statsSample}
    ]
    ).choices[0].message.content

    animalStats = animalStats.replace("```python", "").replace("```", "")

    animalStatsString = animalStats
    print(animalStats)
    animalStats = ast.literal_eval(animalStats)
    print(animalStats)

    animalName = animal.upper()

    # Generate Animal Sprite
    response = openai.images.generate(
        model="dall-e-3",
        prompt=f"white background, of a SINGLE {animalName} facing the BOTTOM LEFT direction, detailed, realistic, FULL BODY, just the requested animal and nothing else. ALL LIMBS AND VISIBLE, FULL BODY VISIBLE. Full Color. The face of the animal is on the LEFT half of the screen. Only one animal. Square aspect ratio. Taken on a cannon sx740.",
        size="1024x1024",
        quality="standard",
        n=1,
    )

    image_url = response.data[0].url

    with urllib.request.urlopen(image_url) as url:
        image_data = url.read()
    image = Image.open(io.BytesIO(image_data))

    # Convert the input image to a numpy array
    input_array = np.array(image)

    # Apply background removal using rembg
    output_array = rembg.remove(input_array)

    # Create a PIL Image from the output array
    output_image = Image.fromarray(output_array)

    output_image.save("static/img/enemy_sprite.png", format="PNG")

    # Generate Animal Icon
    response = openai.images.generate(
        model="dall-e-3",
        prompt=f"a headshot picture of {animalName} facing the viewer, detailed, vibrant, HEAD ONLY, just the requested animal and nothing else. Background is relevant, e.g. trees for animals in the dogs, ocean for fishes, and sky for birds. square ratio image.",
        size="1024x1024",
        quality="standard",
        n=1,
    )

    image_url = response.data[0].url

    with urllib.request.urlopen(image_url) as url:
        image_data = url.read()
    image = Image.open(io.BytesIO(image_data))

    image.save("static/img/enemy_icon.png", format="PNG")

    # Generate Animal Base
    response = openai.images.generate(
        model="dall-e-3",
        prompt=f"a top down picture of the surface of {environment}, REALISTIC, REAL-LIFE PICTURE, no animals or creatures, just the environment.",
        size="1024x1024",
        quality="standard",
        n=1,
    )

    image_url = response.data[0].url

    with urllib.request.urlopen(image_url) as url:
        image_data = url.read()
    image = Image.open(io.BytesIO(image_data))

    image.save("static/img/enemy_base.png", format="PNG")

    return render_template('index.html', animal=animalName, animalProperties=animalProperties, animalAbilities=animalAbilities, animalStats=animalStats, description=description, environment=environment)

def getNarratorResponse(prompt, roleplaying):
    narratorResponse = openai.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "You will help determine the stats of an animal, and return these information as a python list"},
        {"role": "assistant", "content": "The format to return is a string containing different values separated by commas, in the format of [health, living environment/biome, type of animal]"},
        {"role": "user", "content": "Giving the animal: " + str(animal) + ". Return the following information about the animal: 1. [int] Animal health, as a singular integer; 2. [string] Where this animal is usually found, choose only onefrom the following: (ocean, land, underground, sky, arctics); 3. [list] What type of animal is it, choose from the following: (Poisonous, Invasive, Critically Endangered, Threatened, Endangered, Extinct, Herbivore, Carnivore, Omnivore, Predator, Prey, Pack Animal, Solitary Animal) can choose multiple for this one."}
    ]
    ).choices[0].message.content

    print(narratorResponse)
    response = narratorResponse

    try:
        response = re.findall('"(\D+)"', response)[0]
    except:
        response = response

    return response

@app.route('/get_response', methods=['GET'])
def get_response():
    if request.method == 'GET':
        rp = request.args["roleplaying"]
        prompt = request.args["msg"]
        print(prompt)
        print(rp)

        result = getNarratorResponse(prompt, rp)

        prompts.append(prompt)
        prompts.append(result)

        return jsonify(result)

def generateTTS(file_name, prompt):
    speech_file_path = f"./static/audio/{file_name}.mp3"
    print(speech_file_path)

    # TTS
    response = openai.audio.speech.create(
      model="tts-1",
      voice="alloy",
      input=prompt
    )

    #writes to file
    with open(speech_file_path, "wb") as f:
        f.write(response.content)

    return "Success in creating audio!"

@app.route('/get_tts', methods=['GET'])
def get_tts():
    if request.method == 'GET':
        prompt = request.args["msg"]
        file_name = request.args["filename"]
        result = generateTTS(file_name, prompt)

        return jsonify(result)

if __name__ == "__main__":
  app.run(debug=True)
