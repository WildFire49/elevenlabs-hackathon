import os
import sys
import requests
import pytest

# Add parent directory to Python path to make utils module importable
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.db import get_db_cursor

@pytest.fixture
def cleanup_test_video():
    """Fixture to clean up test video from database after test"""
    yield
    with get_db_cursor() as cursor:
        cursor.execute("DELETE FROM videos WHERE video_id LIKE '%dplite2.mov%'")

def test_process_video(cleanup_test_video):
    # API endpoint
    url = "http://localhost:8000/process-video"
    test_video_path = os.path.join(os.path.dirname(__file__), "..", "samples", "dplite2.mov")
    
    try:
        # Prepare the files and data
        files = {
            'video': ('dplite2.mov', open(test_video_path, 'rb'), 'text/plain')
        }
        data = {
            'prompt': "This is a demo of Acceldata's new Data Plane v3 which is lightweight and best for pushdown use cases"
        }
        
        # Make the POST request
        response = requests.post(url, files=files, data=data)
        
        # Check the response
        print("Status Code:", response.status_code)
        print("Response:", response.json())
        
        # Assert the response
        assert response.status_code == 200
        assert response.json()['success'] == True
        
        # Verify video was stored in database
        with get_db_cursor() as cursor:
            cursor.execute("SELECT * FROM videos WHERE video_id = %s", (response.json()['result']['video_id'],))
            video_record = cursor.fetchone()
            assert video_record is not None, "Video record not found in database"
        
        print("Test passed successfully!")
    except Exception as e:
        print("Test failed:", str(e))
        raise

if __name__ == "__main__":
    pytest.main([__file__])
