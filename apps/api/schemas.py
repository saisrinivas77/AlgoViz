from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ExecutionRequest(BaseModel):
    language: str = Field(default="python", example="python")
    source: str = Field(..., description="Source code to execute and visualize")
    max_steps: Optional[int] = Field(default=50000)

class ExecutionResponse(BaseModel):
    executionId: str
    status: str
    trace: Dict[str, Any]

class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    language: str = "python"
    source_code: str
    is_public: bool = True

class ProjectResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    language: str
    source_code: str
    is_public: bool
    created_at: str

class AIExplanationRequest(BaseModel):
    source_code: str
    step_index: int
    current_event: Dict[str, Any]
    variables: Dict[str, Any]
    user_question: Optional[str] = None

class AIExplanationResponse(BaseModel):
    summary: str
    reasoning: str
    key_variables: List[str]
    time_complexity: str
    space_complexity: str
