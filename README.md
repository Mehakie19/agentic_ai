#  Agentic AI Product Builder  
**AI Code Generation Platform using LangChain, LangGraph, GPT-OSS & Groq Cloud**

An **AI-powered agentic code generation platform** that converts **natural-language prompts** into **complete, production-ready web applications** using **multi-agent LLM workflows**.  
The system intelligently decomposes user prompts into frontend, backend, and configuration tasks and generates **multi-file project scaffolds automatically**.

---

##  Features

-  **Multi-Agent Architecture**  
  Uses agent-based reasoning to break down prompts into structured development tasks.

-  **Graph-Based Orchestration (LangGraph)**  
  Reliable execution flow for frontend, backend, and config generation.

-  **Ultra Low-Latency Inference**  
  Powered by **GPT-OSS models on Groq Cloud**, reducing scaffolding time by **~70%** compared to manual development.

-  **Multi-File Code Generation**  
  Generates structured, production-ready project layouts instead of single-file outputs.

-  **Extensible & Modular**  
  Easily extend agents, tools, or models for new frameworks and use cases.

---

##  Tech Stack

- **LangChain** – Agent and tool abstractions  
- **LangGraph** – Graph-based workflow orchestration  
- **GPT-OSS Models** – Open-source LLMs  
- **Groq Cloud** – High-performance inference  
- **Python** – Core orchestration logic  

---

##  Prerequisites

- **uv** installed  
  Follow installation instructions: https://docs.astral.sh/uv/

- **Groq Cloud Account**  
  Create an API key: https://console.groq.com/keys

---

##  Installation & Setup

 **Clone the repository**
   ```bash
   git clone https://github.com/Mehakie19/agentic_ai.git
   cd agentic_ai
   ```

 Create and activate a virtual environment
    ```
uv venv
source .venv/bin/activate  ```

Install dependencies
  ```bash
uv pip install -r pyproject.toml
  ```

Set up environment variables

Create a .env file and add GROK API Key

Start the application
  ```bash
python main.py
  ```
 ## Example Prompts

1 Try running the system with prompts like:
- Create a to-do list application using HTML, CSS, and JavaScript
- Create a simple calculator web application
- Create a simple blog API in FastAPI with a SQLite database
2. The platform will automatically:
- Analyze the prompt
- Decompose tasks using agents
- Generate frontend, backend, and configuration files. 



