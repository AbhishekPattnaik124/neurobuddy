import os
import io
import PyPDF2
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import List, Dict

# In-memory store for documents (for demonstration purposes, this can be stored in MongoDB)
# Structure: { "uid": [{"chunk": "text data", "metadata": {}}] }
document_store: Dict[str, List[Dict]] = {}
vectorizers: Dict[str, TfidfVectorizer] = {}
tfidf_matrices: Dict[str, np.ndarray] = {}

def process_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF file bytes."""
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text

def chunk_text(text: str, chunk_size: int = 1000) -> List[str]:
    """Simple character-based chunking."""
    return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

def add_document_to_rag(uid: str, filename: str, content: str):
    """Add a document to the user's RAG memory."""
    if uid not in document_store:
        document_store[uid] = []
        
    chunks = chunk_text(content)
    for chunk in chunks:
        document_store[uid].append({
            "chunk": chunk,
            "filename": filename
        })
        
    # Rebuild TF-IDF index
    corpus = [doc["chunk"] for doc in document_store[uid]]
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(corpus)
    
    vectorizers[uid] = vectorizer
    tfidf_matrices[uid] = tfidf_matrix

def search_rag(uid: str, query: str, top_k: int = 3) -> str:
    """Search the user's documents for relevant context using TF-IDF."""
    if uid not in document_store or uid not in vectorizers:
        return ""
        
    vectorizer = vectorizers[uid]
    tfidf_matrix = tfidf_matrices[uid]
    
    query_vec = vectorizer.transform([query])
    similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()
    
    # Get top_k indices
    top_indices = similarities.argsort()[-top_k:][::-1]
    
    results = []
    for idx in top_indices:
        if similarities[idx] > 0.1: # Only include if somewhat relevant
            doc = document_store[uid][idx]
            results.append(f"[{doc['filename']}]: {doc['chunk']}")
            
    if not results:
        return ""
        
    return "\n\n".join(results)
