import av, sys, os
import numpy as np
import torch, json

from transformers import VivitImageProcessor, VivitForVideoClassification
from huggingface_hub import hf_hub_download

np.random.seed(0)


def read_video_pyav(container, indices):
    '''
    Decode the video with PyAV decoder.
    Args:
        container (`av.container.input.InputContainer`): PyAV container.
        indices (`List[int]`): List of frame indices to decode.
    Returns:
        result (np.ndarray): np array of decoded frames of shape (num_frames, height, width, 3).
    '''
    frames = []
    container.seek(0)
    start_index = indices[0]
    end_index = indices[-1]
    for i, frame in enumerate(container.decode(video=0)):
        if i > end_index:
            break
        if i >= start_index and i in indices:
            frames.append(frame)
    return np.stack([x.to_ndarray(format="rgb24") for x in frames])


def sample_frame_indices(clip_len, frame_sample_rate, seg_len):
    '''
    Sample a given number of frame indices from the video.
    Args:
        clip_len (`int`): Total number of frames to sample.
        frame_sample_rate (`int`): Sample every n-th frame.
        seg_len (`int`): Maximum allowed index of sample's last frame.
    Returns:
        indices (`List[int]`): List of sampled frame indices
    '''
    converted_len = int(clip_len * frame_sample_rate)
    end_idx = np.random.randint(converted_len, seg_len)
    start_idx = end_idx - converted_len
    indices = np.linspace(start_idx, end_idx, num=clip_len)
    indices = np.clip(indices, start_idx, end_idx - 1).astype(np.int64)
    return indices


if len(sys.argv) < 2:
    print("Error: No file path provided")
    sys.exit(1)

file_path = sys.argv[1]

# video clip consists of 300 frames (10 seconds at 30 FPS)
# file_path = "key.mp4"
container = av.open(file_path)

import cv2
cap = cv2.VideoCapture(file_path)
length = int(cap.get(cv2. CAP_PROP_FRAME_COUNT))


# sample 32 frames
indices = sample_frame_indices(clip_len=32, frame_sample_rate=4, seg_len=length)
video = read_video_pyav(container=container, indices=indices)

base_path = os.path.dirname(os.path.abspath(__file__))

processorPath = os.path.join(base_path, "models/vivit/processor")
ModelPath = os.path.join(base_path, "models/vivit/model")

model = VivitForVideoClassification.from_pretrained(ModelPath)
image_processor = VivitImageProcessor.from_pretrained(processorPath)

inputs = image_processor(list(video), return_tensors="pt")

with torch.no_grad():
    outputs = model(**inputs)
    logits = outputs.logits



# For the Labels
labels_path = os.path.join(base_path, "kinetics400.txt")
with open(labels_path, 'r') as file:
    classes = file.readlines()

classes = [line.strip() for line in classes]



# model predicts one of the 400 Kinetics-400 classes
predicted_label = logits.argmax(-1).item()
print(json.dumps([classes[predicted_label]] ))
sys.stdout.flush()
sys.exit(0)
      
# print(model.config.id2label[predicted_label])

# model.save_pretrained("./models/vivit/model")

# image_processor.save_pretrained("./models/vivit/processor")