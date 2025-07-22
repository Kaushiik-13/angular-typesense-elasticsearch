# Angular + TypeSense + Elasticsearch: High-Performance Search Showcase

This project demonstrates a high-performance search engine interface built using **Angular** and powered by **TypeSense** and **Elasticsearch**, aimed at exploring fast filtering, faceting, and search capabilities on datasets with **millions to billions of records**.

---

## 🔍 Problem Statement

When working with large-scale product catalogs or datasets, traditional search systems often face performance issues—especially with:

- Full-text search  
- Faceted filtering  
- Instant response times  

This project tackles these challenges using two popular search engines:

- **TypeSense** (an in-memory typo-tolerant search engine)
- **Elasticsearch** (a distributed full-text search engine)

---

## ⚙️ Tech Stack

- **Frontend**: Angular  
- **Search Engines**: TypeSense, Elasticsearch  
- **Containerization & Testing**: Docker  
- **Designs**: Figma *(not used in this project)*  
- **Backend**: Not applicable *(only APIs of TypeSense and Elasticsearch were used directly)*  

---

## 📊 Dataset Overview

The dataset used contains **billions of records** for simulating real-world product listings.

<img width="1907" height="906" alt="image" src="https://github.com/user-attachments/assets/8ad0cd6c-e9bd-425b-b032-92733f7ad410" />

---

## ⚔️ TypeSense vs Elasticsearch: Observations

| Feature                      | TypeSense                          | Elasticsearch                     |
|-----------------------------|------------------------------------|-----------------------------------|
| **Response Time**           | Lightning fast (~ms latency)       | Slightly slower under high load   |
| **Faceted Filtering**       | Built-in and intuitive             | Requires manual aggregation setup |
| **Ease of Setup**           | Minimal config, Docker ready       | Complex setup with cluster tuning |
| **Memory Usage**            | Higher (in-memory index)           | Optimized for disk-based storage  |
| **Typo Tolerance**          | Built-in, excellent for fuzzy      | Requires tuning fuzziness levels  |
| **Joins/Relational Queries**| Not natively supported (tried workaround joins) | Better support via nested fields |
| **Use Case Fit**            | Ideal for product search, instant filtering | Good for logs, analytics, large document search |

---

## 🧪 Experimental Features

- ✅ Tried implementing **TypeSense-style joins** (even though not natively supported)
- ✅ Tested performance under **simulated production-scale data**
- ✅ Compared query performance, indexing time, and memory footprint between both engines

---

## 📘 Learnings: How TypeSense Works

- **In-Memory Indexing**: Keeps indexes in memory, making searches blazingly fast (in milliseconds)
- **Real-Time Updates**: Documents can be updated with very low latency, suitable for dynamic datasets
- **Faceted Search**: Built-in support for filters like category, price, rating — similar to Amazon’s sidebar
- **Typo-Tolerance**: Automatically accounts for small spelling mistakes in queries
- **Horizontal Scalability**: Can scale with multiple replicas and read nodes
- **Compression**: Keeps memory usage efficient despite large-scale indexing

---
