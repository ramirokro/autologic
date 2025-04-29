from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ajusta para producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SHOPIFY_TOKEN = os.getenv("SHOPIFY_TOKEN")
SHOPIFY_URL = "https://autologic.myshopify.com/api/2023-10/graphql.json"  # Ajusta a tu tienda

class QueryInput(BaseModel):
    query: str

@app.post("/api/shopify-search")
async def buscar_producto(q: QueryInput):
    graphql_query = {
        "query": f"""
        query {{
          products(first: 3, query: "{q.query}") {{
            edges {{
              node {{
                title
                handle
                images(first: 1) {{ edges {{ node {{ originalSrc }} }} }}
                variants(first: 1) {{
                  edges {{ node {{ price {{ amount }} }} }}
                }}
              }}
            }}
          }}
        }}
        """
    }

    headers = {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_TOKEN,
    }

    response = requests.post(SHOPIFY_URL, json=graphql_query, headers=headers)
    data = response.json()

    productos = []
    for edge in data.get("data", {}).get("products", {}).get("edges", []):
        node = edge["node"]
        productos.append({
            "nombre": node["title"],
            "precio": node["variants"]["edges"][0]["node"]["price"]["amount"],
            "imagen": node["images"]["edges"][0]["node"]["originalSrc"] if node["images"]["edges"] else "",
            "url": f"https://autologic.mx/products/{node['handle']}"
        })

    return {"productos": productos}