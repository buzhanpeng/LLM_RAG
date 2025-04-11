# Third-party imports
import uvicorn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# Internal imports
from api.routes import chat
from api.routes import documents

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有 HTTP 方法
    allow_headers=["*"],  # 允许所有请求头
)


app.include_router(chat.router)
print("app.include_router(chat.router)-----------")
app.include_router(documents.router)
print("app.include_router(documents.router)-----------")

if __name__ == '__main__':
    uvicorn.run(
        app=app,
        host="127.0.0.1",
        port=8000
    )