"""FLask Server - Forever"""
import webbrowser

from flask import Flask, send_from_directory

app = Flask(__name__)

# Specify the folder you want to serve
folder_to_serve = "D:/Self_Projects/BetWorks"


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_folder(path):
    """Determine which folder to ser on localhost"""
    if not path:
        # Serve index.html if no specific file is requested
        path = 'index.html'
    return send_from_directory(folder_to_serve, path)


if __name__ == '__main__':
    print("Serving folder at http://localhost:5000/")
    # Open the default browser with the server URL
    webbrowser.open_new_tab("http://localhost:5000/")
    app.run()  # Start the Flask development server
