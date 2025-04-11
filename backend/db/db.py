# Standard imports
import os
import openai
import chromadb.utils.embedding_functions as embedding_functions
from langchain_fireworks import FireworksEmbeddings
from langchain_ollama import OllamaEmbeddings
from langchain_community.embeddings import FakeEmbeddings
# Third-party imports
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_community.llms import Xinference
from langchain_cohere import CohereEmbeddings
import getpass
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

# openai.api_key = os.getenv("OPENAI_API_KEY")
# embeddings = OpenAIEmbeddings()
#
embedding_function = OllamaEmbeddings(model="nomic-embed-text")

def get_db():
    db = Chroma(embedding_function=embedding_function)
    try:
        yield db
    finally:
        del db