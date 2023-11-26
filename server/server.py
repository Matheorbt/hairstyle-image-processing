import numpy as np
from flask_cors import CORS
from utils.dlib_shp_to_np import dlib_shp_to_np, dlib_shp_to_bb
import dlib
import matplotlib.pyplot as plt
from flask import Flask, request, jsonify
import cv2 as cv
import matplotlib
matplotlib.use('Agg')
app = Flask(__name__)
CORS(app)
from flask import send_file

detector = dlib.get_frontal_face_detector()  # HOG + LinearSVM
predictor = dlib.shape_predictor('shape_predictor_68_face_landmarks_GTX.dat')


def process_image(img):
    img_ = cv.cvtColor(img, cv.COLOR_BGR2RGB)
    rects = detector(img_, 1)

    for (i, rect) in enumerate(rects):
        shape = predictor(img_, rect)
        coords = dlib_shp_to_np(shape)

        left_top, right_bottom = dlib_shp_to_bb(
            rect, shape, (img.shape[1], img.shape[0]))
        cv.rectangle(img, left_top, right_bottom, (0, 255, 0), 1)

        for (x, y) in coords:
            cv.circle(img, (x, y), 2, (0, 255, 0), -1)

    plt.imshow(cv.cvtColor(img, cv.COLOR_BGR2RGB))
    plt.savefig('result.png')
    return 'result.png'


@app.route('/api/process-image', methods=['POST'])
def process_image_route():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'})

    file = request.files['image']

    # Ensure that the file is an image (you might want to add more validation)
    if file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        img = cv.imdecode(np.frombuffer(
            file.read(), np.uint8), cv.IMREAD_COLOR)
        processed_data = process_image(img)
        return jsonify({'result': processed_data})
    else:
        return jsonify({'error': 'Invalid image format'})
    
@app.route('/api/get-result-image', methods=['GET'])
def get_result_image():
    return send_file('result.png', mimetype='image/png')


if __name__ == '__main__':
    app.run(debug=True)
