import cv2
import torch
import numpy as np
import json, time, os
import sys
from PIL import Image
from collections import OrderedDict
from transformers import AutoProcessor, AutoModelForCausalLM
from scenedetect import SceneManager, open_video, detect, ContentDetector


# --------------------------------------------------------------------------
# Florence Model



# if len(sys.argv) < 2:
#     print("Error: No file path provided")
#     sys.exit(1)

# image_path = sys.argv[1]

# device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# base_path = os.path.dirname(os.path.abspath(__file__))
# saveDirectoryModel = os.path.join(base_path, "models/florence2/model")
# saveDirectoryProc = os.path.join(base_path, "models/florence2/processor")

# model = AutoModelForCausalLM.from_pretrained(saveDirectoryModel, trust_remote_code=True).to(device)
# processor = AutoProcessor.from_pretrained(saveDirectoryProc, trust_remote_code=True)

# image = Image.open(image_path).convert("RGB")


# def runModel(task_prompt, image):
#     inputs = processor(text=task_prompt, images=image, return_tensors="pt").to(device)
#     generated_ids = model.generate(
#         input_ids=inputs["input_ids"],
#         pixel_values=inputs["pixel_values"],
#         max_new_tokens=1024,
#         early_stopping=False,
#         do_sample=False,
#         num_beams=3,
#     )
#     generated_text = processor.batch_decode(generated_ids, skip_special_tokens=False)[0]
#     parsed_answer = processor.post_process_generation(
#         generated_text,
#         task=task_prompt,
#         image_size=(image.width, image.height)
#     )
#     return parsed_answer

# dense_region_object = runModel(task_prompt='<DENSE_REGION_CAPTION>', image=image)


# combined_labels = dense_region_object["<DENSE_REGION_CAPTION>"]['labels'] 

# # classes = list(set(combined_labels))  
# classes = list(OrderedDict.fromkeys(combined_labels))


# print(json.dumps(classes))
# sys.stdout.flush()
# sys.exit(0)

# ----------------------------------------------------------------------
import datetime

base_path = os.path.dirname(os.path.abspath(__file__))
TEMP_FRAME_DIREC = os.path.join(base_path, "uploads/frames")
# os.makedirs(TEMP_FRAME_DIREC, exist_ok=True)


if len(sys.argv) < 2:
    print("Error: No file path provided")
    sys.exit(1)

videoPath = sys.argv[1]

cv2Video = cv2.VideoCapture(videoPath)
fps = cv2Video.get(cv2.CAP_PROP_FPS)
frames = int(cv2Video.get(cv2.CAP_PROP_FRAME_COUNT))

if fps > 0:
    duration = frames / fps
else:
    duration = 0

if duration < 5:
    startDecimal = 0
else:
    startDecimal = round((duration - 4) / duration, 2)


startingFrame = int(frames * startDecimal)

pySDVideo = open_video(videoPath)
scene_manager = SceneManager()
scene_manager.add_detector(ContentDetector(threshold=30))

pySDVideo.seek(startingFrame)
scene_manager.detect_scenes(pySDVideo)
sceneArray = scene_manager.get_scene_list()

sceneFrames = [scene[0].get_frames() for scene in sceneArray]

if len(sceneFrames) == 0 :
    sceneFrames.append(frames - 10)
elif sceneFrames[-1] < frames - 1:
    sceneFrames.append(frames - 10)

savedFrames = []
for i, frameNo in enumerate(sceneFrames):
    cv2Video.set(cv2.CAP_PROP_POS_FRAMES, frameNo)
    ret, frame = cv2Video.read()

    if ret:
        framePath = os.path.join(TEMP_FRAME_DIREC, f"frame{i}.jpg")
        cv2.imwrite(framePath, frame)
        savedFrames.append(framePath)
    
cv2Video.release()

# Florence Model

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


base_path = os.path.dirname(os.path.abspath(__file__))
saveDirectoryModel = os.path.join(base_path, "models/florence2/model")
saveDirectoryProc = os.path.join(base_path, "models/florence2/processor")

model = AutoModelForCausalLM.from_pretrained(saveDirectoryModel, trust_remote_code=True).to(device)
processor = AutoProcessor.from_pretrained(saveDirectoryProc, trust_remote_code=True)



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


combined_labels = []

for image_path in savedFrames:
    image = Image.open(image_path).convert("RGB")


    dense_region_object = runModel(task_prompt='<DENSE_REGION_CAPTION>', image=image)


    combined_labels += dense_region_object["<DENSE_REGION_CAPTION>"]['labels'] 
    
    image.close()



# classes = list(set(combined_labels))  
classes = list(OrderedDict.fromkeys(combined_labels))

for frame in savedFrames:
    os.remove(frame)



print(json.dumps(classes))
sys.stdout.flush()
sys.exit(0)


    



    




