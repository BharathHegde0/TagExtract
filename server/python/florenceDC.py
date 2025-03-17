import cv2
import torch
import numpy as np
import json, time, os
import sys
from PIL import Image
from collections import OrderedDict
from transformers import AutoProcessor, AutoModelForCausalLM


if len(sys.argv) < 2:
    print("Error: No file path provided")
    sys.exit(1)

image_path = sys.argv[1]

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


base_path = os.path.dirname(os.path.abspath(__file__))
saveDirectoryModel = os.path.join(base_path, "models/florence2/model")
saveDirectoryProc = os.path.join(base_path, "models/florence2/processor")

model = AutoModelForCausalLM.from_pretrained(saveDirectoryModel, trust_remote_code=True).to(device)
processor = AutoProcessor.from_pretrained(saveDirectoryProc, trust_remote_code=True)

image = Image.open(image_path).convert("RGB")


def runModel(task_prompt, image):
    inputs = processor(text=task_prompt, images=image, return_tensors="pt").to(device)
    generated_ids = model.generate(
        input_ids=inputs["input_ids"],
        pixel_values=inputs["pixel_values"],
        max_new_tokens=1024,
        early_stopping=False,
        do_sample=False,
        num_beams=3,
    )
    generated_text = processor.batch_decode(generated_ids, skip_special_tokens=False)[0]
    parsed_answer = processor.post_process_generation(
        generated_text,
        task=task_prompt,
        image_size=(image.width, image.height)
    )
    return parsed_answer

dense_region_object = runModel(task_prompt='<DENSE_REGION_CAPTION>', image=image)
# object_det_object = runModel(task_prompt='<OD>', image=image)


combined_labels = dense_region_object["<DENSE_REGION_CAPTION>"]['labels'] 
#+ object_det_object["<OD>"]["labels"]

# classes = list(set(combined_labels))  
classes = list(OrderedDict.fromkeys(combined_labels))


print(json.dumps(classes))
sys.stdout.flush()
sys.exit(0)




# Saveing the model
# model.save_pretrained(saveDirectoryModel)

# processor.save_pretrained(saveDirectoryProc)

