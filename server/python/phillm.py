# Load model directly
from transformers import AutoTokenizer, AutoModelForCausalLM
from transformers import pipeline
import transformers, os, timeit, sys, torch, json

# Model Path
base_path = os.path.dirname(os.path.abspath(__file__))
saveDirectoryModel = os.path.join(base_path, "models/phi-4-mini/model")
saveDirectoryToken = os.path.join(base_path, "models/phi-4-mini/tokenizer")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

tokenizer = AutoTokenizer.from_pretrained(saveDirectoryToken, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(saveDirectoryModel, trust_remote_code=True).to(device)

pipeline = transformers.pipeline(
    "text-generation",
    model = model,
    model_kwargs = {"torch_dtype": "auto"},
    device_map = "auto",
    tokenizer = tokenizer
)

if len(sys.argv) < 2:
    print("Error: No file path provided")
    sys.exit(1)

tags = sys.argv[1]

# tags = """ PepsiCo. Inc. potato chips advertisement
# human face
# earrings
# PepsiCo. Inc. potato chips in glass bowl"""

messages = [
    {"role": "user", "content": f"""given the following advertisement description, extract and return only the name of the main product being advertised and its type.
Description:
{tags}"""
}
]


# messages = [
#     {"role": "user", "content": f"""given the following advertisement description, extract and return only the name of the main product being advertised and its type.
# Description:
# PepsiCo. Inc. potato chips advertisement
# human face
# earrings
# PepsiCo. Inc. potato chips in glass bowl"""
# }
# ]


outputs = pipeline(messages, max_new_tokens=2048)
product = outputs[0]["generated_text"][-1]["content"]



# messages = [ 
#       {"role": "user", "content": f"""Given that product and it's category and type are: {product} . Identify the demographic for {product}, including key characteristics such as age group, gender(if applicable), interests and lifestyle. Format the response like this:
# Age Group: [Enter Age Group]
# Gender: [Male/Female/All]
# Lifestyle: [Describe lifestyle]
# Interests: [List interests]
# Income Level: [Low / Medium/ High/ All]
# Location: [Urban / Suburban / Rural / Global / All / (or a combination of multiple)]
# """}
# ]
messages = [ 
      {"role": "user", "content": f"""Given that product and it's category is: {product}. Identify the demographic for {product}, including relevant key characteristics. 
       DO NOT INCLUDE THE HEADINGS, RETURN ONLY THE RESPONSE.     
       Format the response like this:
        Age Group | Gender(s) |  Lifestyle | List interests | Income Level | Location
       Make sure the lifestyle and interests are realistic for the product. DO NOT INCLUDE ANY CONTRADICTORY TRAITS.
       Provide only the response in this format with no extra text.
          
       """}
]

outputs = pipeline(messages, max_new_tokens=2048)

row = outputs[0]["generated_text"][-1]["content"].split("|")

print(json.dumps(row))
sys.stdout.flush()
sys.exit(0)


# Saveing the model

# model.save_pretrained(saveDirectoryModel)

# tokenizer.save_pretrained(saveDirectoryProc)