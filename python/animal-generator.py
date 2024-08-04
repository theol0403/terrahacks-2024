from openai import OpenAI
from matplotlib import pyplot as plt
import urllib
from PIL import Image
import io
import rembg
import numpy as np


client = OpenAI(
    api_key="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"
)

animal = "monkey"


response = client.images.generate(
    model="dall-e-3",
    prompt=f"white background, of a SINGLE {animal} facing the BOTTOM LEFT direction, detailed, realistic, FULL BODY, just the requested animal and nothing else. ALL LIMBS AND VISIBLE, FULL BODY VISIBLE. Full Color. The face of the animal is on the LEFT half of the screen. Only one animal. Square aspect ratio. Taken on a cannon sx740.",
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

plt.imshow(output_image)
plt.axis("off")
plt.show()

output_image.save("input_image.png", format="PNG")
