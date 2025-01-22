import requests

rag_url = "http://213.139.208.158:8000/search"

def retrieve_related_chunks(query: str) -> dict:
    url = rag_url
    #print("Process query:", query)
    params = {
        "query": query,
        "search_type": "embedding"  # or "fulltext" if preferred
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        chunks = response.json()[:3]
        #print(len(chunks))
        #print(chunks)
        return {"chunks": chunks}
    else:
        return {"error": f"API request failed with status code {response.status_code}"}


if __name__ == '__main__':
    retrieve_related_chunks('Поле битвы с рекой посередине карты и горами сверху')
