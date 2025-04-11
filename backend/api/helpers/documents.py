import os
import time

from dotenv import load_dotenv, find_dotenv
from pathlib import Path

# 添加tqdm进度条  
from tqdm import tqdm
import logging
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain_community.document_loaders.csv_loader import CSVLoader
from langchain_community.document_loaders import JSONLoader
from langchain_community.document_loaders import TextLoader
from langchain_community.document_loaders import BSHTMLLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.vectorstores import VectorStore

from schemas.document import Document
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv(find_dotenv())

TEMP_PATH = r"F:\browser\chat_rag\chat-with-rag-using-langchain-nextjs-and-fastapi-main"


def save_file(file: Document) -> str:
    """  
    保存文件并显示进度  
    """
    os.makedirs(TEMP_PATH, exist_ok=True)

    filepath = Path(TEMP_PATH) / file.filename

    # 使用tqdm包装文件写入  
    file_size = file.file.seek(0, os.SEEK_END)
    file.file.seek(0)
    with open(filepath, "wb+") as file_object, tqdm(
            total=file_size,
            unit='B',
            unit_scale=True,
            desc=f"保存 {file.filename}"
    ) as pbar:
        while chunk := file.file.read(8192):
            file_object.write(chunk)
            pbar.update(len(chunk))

    return filepath

def load_pdf(filepath, verbose=False):
    """
    加载PDF文件并显示进度

    Args:
        filepath (str): PDF文件路径
        verbose (bool): 是否显示详细信息

    Returns:
        loader (PyPDFLoader): PDF加载器
        pages (list): 加载的页面
    """
    try:
        file_size = os.path.getsize(filepath)
        with tqdm(total=file_size, unit='B', unit_scale=True, desc="加载PDF") as pbar:
            loader = PyPDFLoader(filepath)
            pages = loader.load()
            pbar.update(file_size)

        if verbose:
            logger.info(f"成功加载 PDF 文件: {filepath}")
            logger.info(f"总页数: {len(pages)}")

        return loader

    except Exception as e:
        logger.error(f"加载 PDF 文件 {filepath} 失败: {e}")
        return None


def load_txt(txt_path):
    """
    加载指定的TXT文件，支持字符串和Path对象路径

    Args:
        txt_path (str or Path): TXT文件路径

    Returns:
        loader (TextLoader): 文本文件加载器
    """
    try:
        # 将Path对象转换为字符串
        txt_path = str(txt_path)

        # 检查文件是否存在
        if not os.path.exists(txt_path):
            logger.error(f"文件不存在: {txt_path}")
            return None

            # 检查是否为txt文件
        if not txt_path.lower().endswith('.txt'):
            logger.error(f"非txt文件: {txt_path}")
            return None

            # 使用TextLoader加载文件
        loader = TextLoader(txt_path, encoding='utf-8')  # 增加编码参数

        logger.info(f"成功加载文件: {txt_path}")
        return loader

    except Exception as e:
        logger.error(f"加载文件 {txt_path} 失败: {e}")
        return None


def load_md(md_path: str, show_detailed_progress=True):
    """
    加载指定的Markdown文件

    Args:
        md_path (str): Markdown文件路径

    Returns:
        loader (TextLoader): Markdown文件加载器
    """
    try:
        # 检查文件是否存在
        if not os.path.exists(md_path):
            logger.error(f"文件不存在: {md_path}")
            return None

            # 检查是否为md文件
        if not md_path.lower().endswith('.md'):
            logger.error(f"非Markdown文件: {md_path}")
            return None

            # 使用TextLoader加载文件
        loader = TextLoader(md_path)

        logger.info(f"成功加载文件: {md_path}")
        return loader

    except Exception as e:
        logger.error(f"加载文件 {md_path} 失败: {e}")
        return None
def load_html(filepath):
    try:
        with tqdm(total=1, desc=f"加载HTML: {filepath}") as pbar:
            loader = BSHTMLLoader(file_path=filepath)
            pbar.update(1)
        return loader
    except Exception as e:
        print(f"加载HTML文件出错: {e}")
        return None

def load_CSV(filepath):
    try:
        with tqdm(total=1, desc=f"加载CSV: {filepath}") as pbar:
            loader = CSVLoader(file_path=filepath)
            pbar.update(1)
        return loader
    except Exception as e:
        print(f"加载CSV文件出错: {e}")
        return None

def load_json(filepath):
    try:
        with tqdm(total=1, desc=f"加载JSON: {filepath}") as pbar:
            loader = JSONLoader(
                file_path=filepath,
                jq_schema=".messages[].content",
                text_content=False
            )
            pbar.update(1)
        return loader
    except Exception as e:
        print(f"加载JSON文件出错: {e}")
        return None

def save_file_embedding(filepath: str, vector_db: VectorStore) -> list[str]:
    """  
    读取文档并索引到向量存储，同时显示进度
    """
    global loader
    FILE_TYPE_DICT = {
        # 文档类型
        'pdf': '文档文件',
        'txt': '文本文件',
        'md': 'markdown演示文稿',
        'json': 'json',
        'html': 'html',
        'csv': 'CSV数据文件'
    }
        # 提取后缀名
    ext = os.path.splitext(filepath)[1][1:].lower()

    if ext in FILE_TYPE_DICT:
        # 获取相应的加载器
        if ext == 'pdf':
            loader = load_pdf(filepath)
            print("start to load pdf from",filepath)
        elif ext == 'md':
            loader = load_md(filepath)
            print("start to load md from",filepath)
        elif ext == 'txt':
            loader = load_txt(filepath)
            print("start to load txt from",filepath)
        elif ext == 'json':
            loader = load_json(filepath)
            print("start to load json from",filepath)
        elif ext == 'html':
            loader = load_html(filepath)
            print("start to load html from",filepath)
        elif ext == 'csv':
            loader = load_CSV(filepath)
            print("start to load csv from",filepath)

    else:
        # 如果找不到，返回错误提示
        print("error：unknown file type！")

        # 文本分割进度
    splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    # 加载并分割文档
    print(splitter)
    pages = loader.load_and_split(splitter)
    # 使用 tqdm 显示添加文档的进度
    start_time = time.time()
    pages_ids = list(tqdm(vector_db.add_documents(pages), total=len(pages), desc="embedding："))
    end_time = time.time()
    total_time = end_time - start_time
    print(f"总时间: {total_time:.2f} 秒")
    # 返回添加的页面 ID 列表
    return pages_ids