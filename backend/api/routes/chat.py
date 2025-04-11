# Third-party imports
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from langchain_community.vectorstores import VectorStore
from langchain_community.vectorstores import Chroma
# 有许多嵌入模型
# Internal imports
from api.services.chat import chat_service

from schemas.chat import Message
from db.db import get_db

router = APIRouter(
    prefix="/chat",
)

@router.post("")
async def chat(
    msg: Message,
    vector_db: VectorStore = Depends(get_db)
) -> JSONResponse:
    """
    Handles Chat Endpoint
    """
    try:
        print("Received message:", msg.msg)  # print the message that received
        print(f"Requested model: {msg.model}")
        result = chat_service(msg.msg, msg.model, vector_db)
        return JSONResponse(
            status_code=200,
            content={"result": result}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500, 
            content={"message": "Error on chat: {}".format(e)}
        )
