import os
import json
import numpy as np
import subprocess
import tempfile
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.optimizers import Adam
from openai import OpenAI
import pickle
import warnings
import re
from dotenv import load_dotenv

warnings.filterwarnings("ignore")
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(CURRENT_DIR, "cnn_language_model.h5")
TOKENIZER_PATH = os.path.join(CURRENT_DIR, "cnn_tokenizer.pkl")
model_cnn = load_model(MODEL_PATH, compile=False)
model_cnn.compile(optimizer=Adam(), loss="categorical_crossentropy", metrics=["accuracy"])
with open(TOKENIZER_PATH, "rb") as f:
    tokenizer_text = pickle.load(f)
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def gpt_vulnerability_analysis(code_input, lang):
    # Séparer instructions + code si "Code :" est utilisé
    if "Code :" in code_input:
        parts = code_input.split("Code :")
        instructions = parts[0].strip()
        code = parts[1].strip()
    else:
        instructions = ""
        code = code_input.strip()

    # Prompt principal renforcé
    prompt = (
        f"Tu es un expert en sécurité et en correction de code. Analyse uniquement le code suivant en {lang}.\n"
        f"Donne :\n"
        f"1. Une liste des vulnérabilités SI elles existent (comme injection, XSS, path traversal, etc.)\n"
        f"2. Une liste des erreurs de syntaxe ou d'exécution (comme variable non définie, appel de fonction incorrect, etc.)\n"
        f"3. Des suggestions de correction **sans jamais ajouter de nouvelles fonctionnalités** qui ne sont pas dans le code.\n"
        f"4. Le code corrigé à la fin, en conservant le comportement initial.\n\n"
        f"⚠️ IMPORTANT : Si tu corriges un path traversal, tu dois vérifier le chemin absolu et utiliser `startswith` avec `os.path.abspath(dossier_autorise) + os.sep`. "
        f"N’utilise jamais `if dossier_autorise in chemin_absolu`, car cela est incorrect et vulnérable.\n\n"
    )

    # Si des instructions personnalisées sont données, les inclure
    if instructions:
        prompt = f"{instructions}\n\n{prompt}"

    # Ajouter le code à analyser à la fin
    prompt += f"Code :\n{code}"

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "Tu es un assistant expert qui aide à sécuriser et corriger le code sans extrapoler.",
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.0
        )
        return format_ai_response(response.choices[0].message.content.strip())
    except Exception as e:
        return "❌ OpenAI Error: " + str(e)



def format_ai_response(text):
    text = re.sub(r"^###\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"(\d+\.\s+\w+ :)\s+\1", r"\1", text)

    lines = text.split("\n")
    numbered = []
    counter = 1
    for line in lines:
        if re.match(r"^\s*[-*]\s+", line):
            line = re.sub(r"^(\s*)[-*]\s+", lambda m: f"{m.group(1)}{counter}. ", line)
            counter += 1
        else:
            counter = 1
        numbered.append(line)

    cleaned = []
    seen = set()
    for line in numbered:
        if line not in seen:
            cleaned.append(line)
            seen.add(line)
    return "\n".join(cleaned)


def analyse_code_input(code):
    seq = tokenizer_text.texts_to_sequences([code])
    padded = pad_sequences(seq, maxlen=200)
    pred = model_cnn.predict(padded, verbose=0)
    possible_langs = ["python", "java", "cpp"]
    lang_index = int(np.argmax(pred))
    lang = possible_langs[lang_index] if lang_index < len(possible_langs) else "unknown"
    ext_map = {"python": "py", "java": "java", "cpp": "cpp"}
    ext = ext_map.get(lang, "txt")
    suggestion = gpt_vulnerability_analysis(code, lang)
    result = {
        "language_detected": lang,
        "gpt_suggestion": suggestion
    }
    return result


def safe_input(prompt=""):
    try:
        return input(prompt)
    except UnicodeEncodeError:
        return input(prompt.encode("utf-8", "ignore").decode("utf-8"))
