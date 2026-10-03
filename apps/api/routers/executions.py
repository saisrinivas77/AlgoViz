import sys
import os
import uuid
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

# Add execution-worker directory to sys.path
WORKER_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../services/execution-worker"))
if WORKER_DIR not in sys.path:
    sys.path.insert(0, WORKER_DIR)

from sandbox import execute_in_sandbox, SecurityError
from database import get_db
from models import Execution
from schemas import ExecutionRequest, ExecutionResponse

router = APIRouter(prefix="/api/v1/executions", tags=["executions"])

@router.post("", response_model=ExecutionResponse)
def create_execution(req: ExecutionRequest, db: Session = Depends(get_db)):
    if req.language.lower() != "python":
        raise HTTPException(status_code=400, detail="Only Python execution is currently supported.")

    execution_id = f"ex_{uuid.uuid4().hex[:12]}"

    try:
        trace = execute_in_sandbox(req.source, execution_id=execution_id, max_steps=req.max_steps or 50000)
    except SecurityError as sec_err:
        raise HTTPException(status_code=400, detail=str(sec_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Execution error: {str(e)}")

    # Store metadata in DB
    db_exec = Execution(
        id=execution_id,
        language=req.language,
        step_count=trace.get("summary", {}).get("totalSteps", 0),
        duration_ms=trace.get("summary", {}).get("durationMs", 0),
        trace_data=trace
    )
    db.add(db_exec)
    db.commit()

    return ExecutionResponse(
        executionId=execution_id,
        status="COMPLETED",
        trace=trace
    )

@router.get("/{execution_id}")
def get_execution(execution_id: str, db: Session = Depends(get_db)):
    db_exec = db.query(Execution).filter(Execution.id == execution_id).first()
    if not db_exec:
        raise HTTPException(status_code=404, detail="Execution trace not found")
    return db_exec.trace_data
