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
    f"Tu es un expert international en cybersécurité et en audit de code sécurisé. "
    f"Tu es un auditeur de cybersécurité très strict, tu dois détecter toute vulnérabilité, même minime. "
    f"Ta mission est d’effectuer une **analyse professionnelle, rigoureuse et exhaustive** du code source suivant, écrit en langage {lang}.\n\n"

    f"🎯 Objectif : Identifier et corriger **toutes les vulnérabilités de sécurité**, **toutes les erreurs de syntaxe ou d’exécution**, "
    f"et générer une version du code **100 % sécurisée**, **100 % fonctionnelle**, **100 % propre** — sans jamais modifier son comportement ou sa logique.\n\n"

    f"⚙️ Ta réponse doit obligatoirement être structurée en **exactement quatre sections TITRÉES** dans l’ordre suivant. Aucune déviation n’est autorisée :\n\n"

    f"1. ✅ Liste des **vulnérabilités de sécurité détectées** :\n"
    f"   - Identifie **toutes les vulnérabilités potentielles**, y compris :\n"
    f"     - Injection de commande (`os.system`, `Runtime.exec`, `system()`, `subprocess`, etc.)\n"
    f"     - Désérialisation non sécurisée (`pickle.load`, `ObjectInputStream`, `readObject`, etc.)\n"
    f"     - Traversée de répertoire (`../`, chemins relatifs non filtrés, etc.)\n"
    f"     - Exécution de code arbitraire (`eval`, `exec`, `Function`, réflexion Java, etc.)\n"
    f"     - Entrées utilisateur non filtrées (`input()`, `Scanner`, `cin`, etc.)\n"
    f"     - Secrets codés en dur, fonctions dangereuses, cryptographie faible, débordements mémoire, etc.\n"
    f"   - Numérote chaque vulnérabilité (1., 2., 3., etc.)\n"
    f"   - Aucune vulnérabilité ne doit être oubliée, même si elle est théorique, rare ou de faible impact.\n\n"

    f"2. 🛠️ Liste des **erreurs de syntaxe ou d’exécution détectées** :\n"
    f"   - Liste uniquement les erreurs **réelles et vérifiables** (bugs, crashs, exécutions incorrectes) :\n"
    f"     - Imports manquants, appels API invalides, incohérences logiques, code inaccessible, etc.\n"
    f"     - Oublis de `try/except` sur fichiers ou entrées utilisateurs\n"
    f"   - Numérote chaque erreur (1., 2., 3., etc.)\n"
    f"   - Ne jamais inventer ou supposer — signale uniquement ce qui est réellement présent.\n\n"

    f"3. 💡 Corrections suggérées :\n"
    f"   - Propose une **correction minimale et précise** pour chaque problème détecté\n"
    f"   - Ne change jamais la logique métier ni les noms des fonctions sauf si c’est absolument nécessaire pour la sécurité\n"
    f"   - Si un appel est fondamentalement dangereux et impossible à sécuriser, désactive-le avec : `raise Exception(\"[RAISON EXPLICITE]\")`\n"
    f"   - Remplace `os.system`, `Runtime.exec`, etc. par `subprocess.run([...], shell=False)` si les entrées sont strictement validées\n"
    f"   - Entoure toute opération fichier ou désérialisation avec un `try/except` strict\n"
    f"   - Valide systématiquement toutes les entrées utilisateur avec des règles strictes (listes blanches)\n"
    f"   - Pour protéger contre les attaques de traversée de répertoire, compare toujours les chemins absolus à un dossier de base autorisé\n\n"

    f"4. 🔧 Code corrigé :\n"
    f"   - Donne la version **définitive, corrigée et sécurisée du code**, dans un bloc Markdown : ```{lang} ... ```\n"
    f"   - Applique uniquement les corrections listées ci-dessus — ni plus, ni moins\n"
    f"   - N’ajoute aucun commentaire, explication, ou modification inutile\n\n"

    f"⚠️ Recommandation pour la protection contre la traversée de répertoires (en Python) :\n"
    f"```python\n"
    f"chemin_absolu = os.path.abspath(file_path)\n"
    f"if not chemin_absolu.startswith(os.path.abspath(authorized_folder) + os.sep):\n"
    f"    raise Exception(\"Path traversal detected\")\n"
    f"```\n"
    f"- ❌ À ne jamais faire : `if folder in path`, filtrage naïf, comparaison partielle\n"
    f"- ✅ À toujours faire : comparaison stricte de chemins absolus avec dossier autorisé\n\n"

    f"📌 Tu dois TOUJOURS renvoyer les **quatre sections** obligatoires dans l’ordre exact.\n"
    f"⛔️ Interdictions strictes :\n"
    f"   - Ne jamais renommer, fusionner, ignorer, séparer ou réordonner les sections\n"
    f"   - Ne jamais ajouter de résumé ou cinquième section\n"
    f"   - Ne jamais modifier la logique du code hors sécurité stricte\n"
)



    # Si des instructions personnalisées sont données, les inclure
    if instructions:
        prompt = f"{instructions}\n\n{prompt}"

    # Ajouter le code à analyser à la fin
    prompt += f"Code :\n{code}"

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
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
