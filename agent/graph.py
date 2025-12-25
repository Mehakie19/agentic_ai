from dotenv import load_dotenv
from langchain_core.globals import set_verbose, set_debug
from langchain_groq.chat_models import ChatGroq
from langgraph.constants import END
from langgraph.graph import StateGraph
from langgraph.prebuilt import create_react_agent

from agent.promt import *
from agent.states import *
from agent.tools import write_file, read_file, get_current_directory, list_files

_ = load_dotenv()

set_debug(True)
set_verbose(True)

llm = ChatGroq(model="openai/gpt-oss-120b")


def planner_agent(state: dict) -> dict:
    """Converts user prompt into a structured Plan."""
    user_prompt = state["user_prompt"]
    from langchain_core.output_parsers.json import SimpleJsonOutputParser
    
    prompt_text = planner_prompt(user_prompt)
    prompt_text += "\n\nRespond with a valid JSON object with these keys: name, description, techstack, features (array), files (array of objects with path and purpose)"
    
    try:
        # Try structured output first
        resp = llm.with_structured_output(Plan).invoke(prompt_text)
    except:
        # Fallback: use JSON parser
        try:
            parser = SimpleJsonOutputParser()
            chain = llm | parser
            resp_dict = chain.invoke(prompt_text)
            resp = Plan(**resp_dict)
        except Exception as e:
            print(f"Planning error: {e}")
            # Fallback with basic structure
            resp = Plan(
                name="Scientific Calculator",
                description="A colorful scientific calculator",
                techstack="html,css,javascript",
                features=["arithmetic", "scientific functions", "colorful UI"],
                files=[
                    {"path": "index.html", "purpose": "Main HTML structure"},
                    {"path": "styles.css", "purpose": "Styling and layout"},
                    {"path": "script.js", "purpose": "Calculator logic"}
                ]
            )
    
    if resp is None:
        raise ValueError("Planner did not return a valid response.")
    return {"plan": resp}


def architect_agent(state: dict) -> dict:
    """Creates TaskPlan from Plan."""
    plan: Plan = state["plan"]
    from langchain_core.output_parsers.json import SimpleJsonOutputParser
    
    prompt_text = architect_prompt(plan=plan.model_dump_json())
    prompt_text += "\n\nRespond with a valid JSON object with key 'implementation_steps' containing an array of tasks with 'filepath' and 'task_description'"
    
    try:
        resp = llm.with_structured_output(TaskPlan).invoke(prompt_text)
    except:
        try:
            parser = SimpleJsonOutputParser()
            chain = llm | parser
            resp_dict = chain.invoke(prompt_text)
            resp = TaskPlan(**resp_dict)
        except Exception as e:
            print(f"Architecture error: {e}")
            # Fallback task plan
            resp = TaskPlan(
                implementation_steps=[
                    {"filepath": "index.html", "task_description": "Create the HTML structure for a scientific calculator with display and button grid"},
                    {"filepath": "styles.css", "task_description": "Add gradient background, style the calculator layout, and create colorful buttons with hover effects"},
                    {"filepath": "script.js", "task_description": "Implement calculator logic with arithmetic and scientific functions"}
                ]
            )
    
    if resp is None:
        raise ValueError("Architect did not return a valid response.")

    resp.plan = plan
    return {"task_plan": resp}


def coder_agent(state: dict) -> dict:
    """LangGraph tool-using coder agent."""
    coder_state: CoderState = state.get("coder_state")
    if coder_state is None:
        coder_state = CoderState(task_plan=state["task_plan"], current_step_idx=0)

    steps = coder_state.task_plan.implementation_steps
    if coder_state.current_step_idx >= len(steps):
        return {"coder_state": coder_state, "status": "DONE"}

    current_task = steps[coder_state.current_step_idx]
    try:
        existing_content = read_file.invoke({"path": current_task.filepath})
    except:
        existing_content = ""

    system_prompt = coder_system_prompt()
    user_prompt = (
        f"Task: {current_task.task_description}\n"
        f"File: {current_task.filepath}\n"
        f"Existing content:\n{existing_content}\n"
        "IMPORTANT: Use the write_file tool to save your implementation!"
    )

    coder_tools = [write_file, read_file, list_files, get_current_directory]
    
    # Bind tools to LLM and force tool use
    llm_with_tools = llm.bind_tools(coder_tools, tool_choice="auto")
    react_agent = create_react_agent(llm_with_tools, coder_tools)

    try:
        result = react_agent.invoke({"messages": [{"role": "system", "content": system_prompt},
                                                   {"role": "user", "content": user_prompt}]})
    except Exception as e:
        print(f"Coder agent step {coder_state.current_step_idx}: {str(e)[:200]}")

    coder_state.current_step_idx += 1
    return {"coder_state": coder_state}


graph = StateGraph(dict)

graph.add_node("planner", planner_agent)
graph.add_node("architect", architect_agent)
graph.add_node("coder", coder_agent)

graph.add_edge("planner", "architect")
graph.add_edge("architect", "coder")
graph.add_conditional_edges(
    "coder",
    lambda s: "END" if s.get("status") == "DONE" else "coder",
    {"END": END, "coder": "coder"}
)

graph.set_entry_point("planner")
agent = graph.compile()
if __name__ == "__main__":
    result = agent.invoke({"user_prompt": "Create a simple, single-page weather app using HTML, CSS, and vanilla JavaScript. The app should have a search bar to enter a city name and a 'Get Weather' button. When clicked, it should fetch and display the current temperature, weather description, and a matching weather icon from the OpenWeatherMap API. Include basic CSS for a clean, centered card layout and ensure there is an error message if the city is not found"},
                          {"recursion_limit": 100})
    print("Final State:", result)