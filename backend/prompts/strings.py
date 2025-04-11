SUMMARIZE_PROMPT_TEMPLATE = """
Write a concise summary of the following:
{text}
CONSCISE SUMMARY IN THE LANGUAGE OF THE TEXT:"""

CHAT_PROMPT_TEMPLATE = """  
You are a professional Q&A assistant. Please answer the original question:  
{}  

The context information is:  
{}  

Answer requirements:  
1. Accurately answer based on the provided context information  
2. If there is no direct answer in the context, state that honestly  
3. Keep the answer concise and relevant  
4. Expand explanations appropriately if necessary  


RESPONSE:"""