# Third-party imports
from langchain_community.vectorstores import VectorStore
from langchain.chains import ConversationChain
import spacy

# Internal imports
from prompts.strings import CHAT_PROMPT_TEMPLATE

from api.helpers.chat import count_tokens, retrieve_memory, retrieve_summary_memory, retrieve_llm

def chat_service(msg: str, model: str, vector_db: VectorStore) -> str:
    """
    Handles chat service
    """

    nlp = spacy.load("zh_core_web_sm")
    num_class = nlp(msg)
    token_length = len(list(num_class))
    print(f"消息复杂度：{token_length}")

    if token_length>=10:
        retrieved_docs = vector_db.similarity_search(
            query=msg,
            k=2
        )

    if token_length<10:
        retrieved_docs = vector_db.max_marginal_relevance_search(
            query=msg,
            k=2,  # 返回文档数量
            fetch_k=20,  # 初始候选文档数量
            lambda_mult=0.5  # 相关性和多样性的平衡参数
        )

    print(type(retrieved_docs))

    service = ConversationChain(
        llm=retrieve_llm(model),
        memory=retrieve_memory(),
    )

    input = CHAT_PROMPT_TEMPLATE.format(msg, '\n- '.join([doc.page_content for doc in retrieved_docs]))
    response = service(input)

    print(response)

    return response
