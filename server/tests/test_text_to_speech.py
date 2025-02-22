import requests
from elevenlabs import play


def test_text_to_speech():
    # API endpoint
    url = "http://localhost:8000/text-to-speech"

    try:
        # Prepare the data
        data = {
            'text': "This is a test for the text-to-speech endpoint."
        }

        # Make the POST request
        response = requests.post(url, data=data)

        # Print detailed response info for debugging
        print("Status Code:", response.status_code)
        print("Response Headers:", response.headers)
        print("Response Content Type:", response.headers.get('Content-Type'))
        print("Response Content Length:", len(response.content))

        # Assert the response status
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

        # Check if we got a response with content
        assert len(response.content) > 0, "Response content is empty"

        # Check if the content type is audio/mpeg
        content_type = response.headers.get('Content-Type')
        assert content_type == 'audio/mpeg', f"Expected content type audio/mpeg, got {content_type}"

        # Try to play the audio
        try:
            play(response.content)
            print("Audio played successfully!")
        except Exception as play_error:
            print("Warning: Could not play audio:", str(play_error))

        print("Text-to-speech test passed successfully!")
    except AssertionError as ae:
        print("Test failed with assertion error:", str(ae))
    except Exception as e:
        print("Test failed with error:", str(e))
        print("Error type:", type(e).__name__)


if __name__ == "__main__":
    test_text_to_speech()