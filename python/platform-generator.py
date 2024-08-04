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
    prompt=f"Generate a 3d geological landscape. The arena should be tilted in an isometric way from the player. NATURE PARK, no borders visible, no text or numbers. Realistic, pastel colors. The zoom should be appropriate to place characters. Full screen arena. square aspect ratio. No background visible. White background.",
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

output_image.save("platform.png", format="PNG")
