import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_list_examples():
    response = client.get("/api/v1/examples")
    assert response.status_code == 200
    assert len(response.json()) >= 3

def test_create_execution_bubble_sort():
    payload = {
        "language": "python",
        "source": "nums = [3, 1, 2]\nfor i in range(len(nums)):\n    for j in range(len(nums)-i-1):\n        if nums[j] > nums[j+1]:\n            nums[j], nums[j+1] = nums[j+1], nums[j]"
    }
    response = client.post("/api/v1/executions", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "executionId" in data
    assert data["status"] == "COMPLETED"
    assert "events" in data["trace"]
