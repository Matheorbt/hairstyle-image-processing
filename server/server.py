import matplotlib
matplotlib.use('Agg')
import base64
import io
import numpy as np
from flask_cors import CORS
from utils.dlib_shp_to_np import dlib_shp_to_np, dlib_shp_to_bb
import dlib
import matplotlib.pyplot as plt
from flask import Flask, request, jsonify, url_for
import cv2 as cv
app = Flask(__name__)
CORS(app, origins=['http://localhost:3000/', 'https://melius-capillus.vercel.app/', 'http://localhost:3000', 'http://localhost:5001/'])
from flask import send_file
from proj02 import *
import os

detector = dlib.get_frontal_face_detector()  # HOG + LinearSVM
predictor = dlib.shape_predictor('shape_predictor_68_face_landmarks_GTX.dat')

def classify_face_type(img):
    # get here the number of the face type
    # 0 = heart
    # 1 = oblong
    # 2 = oval
    # 3 = round
    # 4 = square
    faceType = predict_faceshape(img)
    
    # send text face type
    if faceType == 0:
        return 'heart'
    elif faceType == 1:
        return 'oblong'
    elif faceType == 2:
        return 'oval'
    elif faceType == 3:
        return 'round'
    elif faceType == 4:
        return 'square'
    else:
        return 'unknown'

def process_image(img, show_points=True):
    img_ = cv.cvtColor(img, cv.COLOR_BGR2RGB)
    rects = detector(img_, 1)

    for (i, rect) in enumerate(rects):
        shape = predictor(img_, rect)
        coords = dlib_shp_to_np(shape)

        if show_points:
            left_top, right_bottom = dlib_shp_to_bb(rect, shape, (img.shape[1], img.shape[0]))
            cv.rectangle(img, left_top, right_bottom, (0, 255, 0), 1)
            for (x, y) in coords:
                cv.circle(img, (x, y), 2, (0, 255, 0), -1)

    plt.imshow(cv.cvtColor(img, cv.COLOR_BGR2RGB))
    plt.axis('off')  # Hide the axis
    plt.savefig('result.png', bbox_inches='tight', pad_inches=0)
    plt.close(fig='all')
    return 'result.png', classify_face_type(img), coords

@app.route('/api/process-image', methods=['POST'])
def process_image_route():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'})

    file = request.files['image']

    if file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        img = cv.imdecode(np.frombuffer(file.read(), np.uint8), cv.IMREAD_COLOR)

        processed_data_path, face_type, landmarks = process_image(img, show_points=True)

        return jsonify({'result': processed_data_path, 'faceType': face_type})
    else:
        return jsonify({'error': 'Invalid image format'})
    
@app.route('/api/get-result-image', methods=['GET'])
def get_result_image():
    return send_file('result.png', mimetype='image/png')

def encode_image_to_base64(image):
    image_buffer = io.BytesIO()
    cv.imwrite(image_buffer, image, [int(cv.IMWRITE_PNG_COMPRESSION), 9])
    image_buffer.seek(0)
    image_data = image_buffer.read()
    return base64.b64encode(image_data).decode('utf-8')


@app.route('/api/upload-haircut', methods=['POST'])
def upload_haircut():
    if 'face_image' not in request.files:
        return jsonify({'error': 'No face image provided'}), 400
    
    if 'haircut_image' not in request.files:
        return jsonify({'error': 'No haircut image provided'}), 400
    
    face_file = request.files['face_image']
    haircut_file = request.files['haircut_image']

    face_image = cv.imdecode(np.frombuffer(face_file.read(), np.uint8), cv.IMREAD_UNCHANGED)
    haircut_image = cv.imdecode(np.frombuffer(haircut_file.read(), np.uint8), cv.IMREAD_UNCHANGED)

    if face_image is None or haircut_image is None:
        return jsonify({'error': 'Invalid image format'}), 400

    _, _, landmarks = process_image(face_image, show_points=False)

    if landmarks is None or len(landmarks) == 0:
        return jsonify({'error': 'No face landmarks detected'}), 500

    result_image = superpose_haircut(face_image, haircut_image, landmarks)
    if result_image is None:
        return jsonify({'error': 'Failed to process images'}), 500

    cv.imwrite('haircut_preview.png', result_image)

    return send_file('haircut_preview.png', mimetype='image/png')

def superpose_haircut(face_image, haircut_image, landmarks):
    left_ear_point = landmarks[0]
    right_ear_point = landmarks[16]

    ear_width = np.linalg.norm(right_ear_point - left_ear_point)

    scale_factor = (1.5 * ear_width) / haircut_image.shape[1]

    haircut_height = int(haircut_image.shape[0] * scale_factor)
    haircut_resized = cv.resize(haircut_image, (int(1.5* ear_width), haircut_height))

    top_left_x = int(left_ear_point[0] - ear_width / 4) 
    top_left_y = int(left_ear_point[1] - haircut_height / 2) 

    result_image = np.copy(face_image)

    for i in range(haircut_resized.shape[0]):
        for j in range(haircut_resized.shape[1]):
            x_pos = top_left_x + j
            y_pos = top_left_y + i

            if 0 <= x_pos < face_image.shape[1] and 0 <= y_pos < face_image.shape[0]:
                alpha = haircut_resized[i, j, 3] / 255.0 if haircut_resized.shape[2] == 4 else 1
                if alpha > 0:
                    result_image[y_pos, x_pos] = (1 - alpha) * result_image[y_pos, x_pos] + alpha * haircut_resized[i, j, :3]

    return result_image

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=os.environ.get('PORT', 5001), debug=True)
