# Standard imports
from pydantic import BaseModel

class Message(BaseModel):
    msg: str
    model: str = "hunyuan"

class Context(BaseModel):
    user_input: str
    bot_output: str