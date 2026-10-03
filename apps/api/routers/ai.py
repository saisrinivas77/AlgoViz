import os
import httpx
from fastapi import APIRouter, HTTPException
from schemas import AIExplanationRequest, AIExplanationResponse

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

@router.post("/explain", response_model=AIExplanationResponse)
async def explain_step(req: AIExplanationRequest):
    """
    AI Assistant explanation endpoint. Accepts execution step context and returns structured explainability metadata.
    Uses OpenAI compatible provider if key is provided, or a high-quality deterministic algorithmic reasoning fallback.
    """
    event_type = req.current_event.get("type", "step")
    vars_str = ", ".join(f"{k}={v}" for k, v in req.variables.items()) or "None"

    if OPENAI_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [
                            {"role": "system", "content": "You are AlgoViz AI Assistant. Respond in clean JSON with fields: summary, reasoning, key_variables, time_complexity, space_complexity."},
                            {"role": "user", "content": f"Explain line step in code:\n{req.source_code}\nEvent: {event_type}\nVars: {vars_str}"}
                        ],
                        "response_format": {"type": "json_object"}
                    }
                )
                if resp.status_code == 200:
                    data = resp.json()["choices"][0]["message"]["content"]
                    import json
                    parsed = json.loads(data)
                    return AIExplanationResponse(
                        summary=parsed.get("summary", "Step execution explanation."),
                        reasoning=parsed.get("reasoning", "The algorithm proceeds sequentially."),
                        key_variables=parsed.get("key_variables", list(req.variables.keys())),
                        time_complexity=parsed.get("time_complexity", "O(N)"),
                        space_complexity=parsed.get("space_complexity", "O(1)")
                    )
        except Exception:
            pass

    # Deterministic Algorithmic Explanation Fallback
    summary = f"Executing '{event_type}' on line step."
    reasoning = f"Current active scope variables: [{vars_str}]. The program evaluates the current expression and updates local frame state."

    if "swap" in event_type:
        summary = "Array element swap operation detected."
        reasoning = f"Two elements in array were swapped to restore order. Scope variables: [{vars_str}]."
    elif "access" in event_type or "compare" in event_type:
        summary = "Array index access / comparison."
        reasoning = f"Inspecting array element at current index pointer. Scope variables: [{vars_str}]."

    return AIExplanationResponse(
        summary=summary,
        reasoning=reasoning,
        key_variables=list(req.variables.keys()),
        time_complexity="O(N log N) - O(N²)",
        space_complexity="O(1) auxiliary"
    )
