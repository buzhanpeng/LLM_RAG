# Standard imports
import os
import tiktoken
from dotenv import load_dotenv, find_dotenv
import torch
from langchain_community.chat_models import ChatSparkLLM
from langchain_ollama import OllamaLLM
from tiktoken import get_encoding

from langchain_openai import ChatOpenAI


from langchain.memory import ConversationSummaryMemory
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain.memory import ConversationBufferMemory
from langchain_core.runnables.history import RunnableWithMessageHistory

# Internal imports
from schemas.chat import Context
from prompts.prompts import summarize_prompt

os.environ["LANGSMITH_TRACING"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "https://api.smith.langchain.com"
os.environ["LANGCHAIN_API_KEY"] = "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"  # 从LangSmith获取
os.environ["LANGCHAIN_PROJECT"] = "RAG"  # 自定义项目名称
# 本地模型路径
local_model_path = "text-embedding-ada-002"
# 载入编码器
enc = tiktoken.encoding_for_model(local_model_path)

load_dotenv(find_dotenv())

MAX_TOKENS_HISTORY = 1000
memory = ConversationBufferMemory()


def count_tokens(memory) -> int:
    """
    Returns the number of tokens in the history. Number of tokens based on gpt-4 tokenizer.
    """
    print(memory)
    print(memory.buffer)
    len(enc.encode(memory.buffer))

def retrieve_memory():
    """
    Returns conversation memory
    """
    return memory

def retrieve_llm(LLM_Name:str):
    "Return the llm used"
    if LLM_Name == 'llama':
        llm = OllamaLLM(
            model="llama3.2:1b",  # 本地模型名称
            base_url="http://localhost:11434"  # Ollama 服务器地址（可选）
        )
    elif LLM_Name == 'qwen':
        llm = OllamaLLM(
            model="llama3.2:1b",  # 本地模型名称
            base_url="http://localhost:11434"  # Ollama 服务器地址（可选）
        )
    elif LLM_Name == 'DeepSeek':
        llm = OllamaLLM(
            model="deepseek-r1:1.5b",  # 本地模型名称
            base_url="http://localhost:11434"  # Ollama 服务器地址（可选）
        )
    elif LLM_Name == 'gemini':
        llm = OllamaLLM(
            model="gemma3:1b",  # 本地模型名称
            base_url="http://localhost:11434"  # Ollama 服务器地址（可选）
        )
    elif LLM_Name == 'hunyuan':
        llm = ChatOpenAI(
            openai_api_base="https://api.hunyuan.cloud.tencent.com/v1",
            openai_api_key="sk-ORrKOjAXKfQWvi0laXDHNswFbhkib7upaSUpdRBI6SyJGQNv",  # app_key
            model_name="hunyuan-lite",  # 模型名称
        )
    else:
        llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0,
            openai_api_key="",
            openai_api_base=""
        )
    return llm


def retrieve_summary_memory(LLM_Name:str):
    """
    Returns conversation memory summarized
    """
    llm = retrieve_llm(LLM_Name)
    return ConversationSummaryMemory(
        llm=llm,
        prompt=summarize_prompt,
        chat_memory=ChatMessageHistory().add_messages(memory)
    )