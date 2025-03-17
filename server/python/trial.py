# # Load model directly
# from transformers import AutoTokenizer, AutoModelForCausalLM
# import ssl

# import requests
# from huggingface_hub import configure_http_backend

# def backend_factory() -> requests.Session:
#     session = requests.Session()
#     session.verify = False
#     return session

# configure_http_backend(backend_factory=backend_factory)
# ssl._create_default_https_context = ssl._create_unverified_context

# # tokenizer = AutoTokenizer.from_pretrained("nroggendorff/smallama-it")
# # model = AutoModelForCausalLM.from_pretrained("nroggendorff/smallama-it")

# # prompt = "Hey, are you conscious? Can you talk to me?"
# # inputs = tokenizer(prompt, return_tensors="pt")

# # generate_ids = model.generate(inputs.input_ids, max_length=30)
# # print(tokenizer.batch_decode(generate_ids, skip_special_tokens=True, clean_up_tokenization_spaces=False)[0])

# model = AutoModelForCausalLM.from_pretrained("gpt2")
# tokenizer = AutoTokenizer.from_pretrained("gpt2")

# raw_prompt = "Hey, what's up?"


# formatted_prompt = tokenizer.apply_chat_template(raw_prompt, tokenize=False, add_generation_prompt=True)

# inputs = tokenizer(formatted_prompt, return_tensors="pt", padding=True)

# attention_mask = inputs["attention_mask"]

# outputs = model.generate(
#   inputs['input_ids'], 
#   attention_mask=attention_mask,
#   pad_token_id=tokenizer.eos_token_id
# )


# from transformers import GPT2Tokenizer, GPT2LMHeadModel

# tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
# model = GPT2LMHeadModel.from_pretrained('gpt2', pad_token_id=tokenizer.eos_token_id)

# question = """Identify the product being advertised?  Coca-Cola advertisement city skyline
# high-rise building with crane on roof at sunset
# skyscraper
# white building with red roof and balconies
# skyscrapers
# skyscyscraper"""


# sentence = f'Q: {question}\nA'
# numeric_ids = tokenizer.encode(sentence, return_tensors = 'pt')



# result = model.generate(numeric_ids, max_length = 100, num_beams=5, no_repeat_ngram_size=2, early_stopping=True)

# generated_text = tokenizer.decode(result[0], skip_special_tokens=True)
# print(generated_text)



from transformers import T5Tokenizer, T5ForConditionalGeneration

tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-small")
model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-small")

input_text = """given the following advertisement description, extract and return only the name of the main product being advertised and its type.
Description:
PepsiCo. Inc. potato chips advertisement
human face
earrings
PepsiCo. Inc. potato chips in glass bow"""
input_ids = tokenizer(input_text, return_tensors="pt").input_ids

outputs = model.generate(input_ids)
print(tokenizer.decode(outputs[0]))
