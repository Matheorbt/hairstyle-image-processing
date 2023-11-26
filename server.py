from flask import Flask, request, jsonify
import cv2
import numpy as np
import dlib

app = Flask(__name__)

def process_image(file):
    return file

@app.route('/api/process-image', methods=['POST'])
def process_image_route():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'})

    file = request.files['image']
    processed_data = process_image(file)
    return jsonify({'result': processed_data})

if __name__ == '__main__':
    app.run(debug=True)
