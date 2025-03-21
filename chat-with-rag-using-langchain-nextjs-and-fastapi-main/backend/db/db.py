# Standard imports
import os
import openai

# Third-party imports
from dotenv import load_dotenv, find_dotenv
from langchain_community.vectorstores.chroma import Chroma
from chromadb.utils.embedding_functions import ONNXMiniLM_L6_V2  # ✅ GPU-ready
from langchain_openai import OpenAIEmbeddings  # Optional, if fallback needed


class LangChainONNXMiniLM:
    def __init__(self):
        self.model = ONNXMiniLM_L6_V2()

    def embed_documents(self, texts):
        return self.model(texts)

    def embed_query(self, text):
        return self.model([text])[0]


# Load environment variables
load_dotenv(find_dotenv())
openai.api_key = os.getenv("OPENAI_API_KEY")

# Use ONNX embedding model that supports GPU
embedder = LangChainONNXMiniLM()  # Uses onnxruntime-gpu if installed


def get_db():
    db = Chroma(persist_directory="./chroma_db", embedding_function=embedder)
    print("ChromaDB instance:", db)
    try:
        yield db
    finally:
        del db
