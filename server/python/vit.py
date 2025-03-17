import torch
import torchvision.transforms as transforms
from torchvision.models.vision_transformer import vit_b_32
from PIL import Image
import ssl, json, urllib.request, sys
import json


if len(sys.argv) < 2:
    print("Error: No file path provided")
    sys.exit(1)

# COmmand line arg
image_path = sys.argv[1]  

ssl._create_default_https_context = ssl._create_unverified_context

model = vit_b_32(weights="IMAGENET1K_V1")
model.eval()

url = "https://storage.googleapis.com/download.tensorflow.org/data/imagenet_class_index.json"
class_index = json.load(urllib.request.urlopen(url))
idx_to_label = {int(k): v[1] for k, v in class_index.items()}

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])

image = Image.open(image_path).convert('RGB')
input_tensor = transform(image).unsqueeze(0)

with torch.no_grad():
    output = model(input_tensor)



# Model results
probabilities = torch.nn.functional.softmax(output[0], dim=0)
top5prob, top5class = torch.topk(probabilities, 5)

classes = []
for i in range(5):
    classID = top5class[i].item()
    label = idx_to_label[classID]
    classes.append(label)

print(json.dumps(classes))
sys.stdout.flush