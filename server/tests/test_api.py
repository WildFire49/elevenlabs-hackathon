import requests
import os

def test_process_video():
    # API endpoint
    url = "http://localhost:8000/process-video"
    
    # Create a small tests video file
    test_video_path = "test_video.txt"
    with open(test_video_path, "w") as f:
        f.write("This is a mock video file for testing")
    
    try:
        # Prepare the files and data
        files = {
            'video': ('test_video.txt', open(test_video_path, 'rb'), 'text/plain')
        }
        data = {
            'prompt': 'This is a tests prompt'
        }
        
        # Make the POST request
        response = requests.post(url, files=files, data=data)
        
        # Check the response
        print("Status Code:", response.status_code)
        print("Response:", response.json())
        
        # Assert the response
        assert response.status_code == 200
        assert response.json()['success'] == True
        
        print("Test passed successfully!")
        
    finally:
        # Cleanup: remove the tests file
        if os.path.exists(test_video_path):
            os.remove(test_video_path)

if __name__ == "__main__":
    test_process_video()
