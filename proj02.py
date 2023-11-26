import numpy as np
import cv2 as cv
import matplotlib
matplotlib.use('TkAgg')
import matplotlib.pyplot as plt
import dlib

# https://github.com/PyImageSearch/imutils/blob/master/imutils/face_utils/helpers.py#L44
def dlib_shp_to_np(shape, dtype='int'):
	ndarr = np.zeros((shape.num_parts, 2), dtype=dtype)

	for i in range(shape.num_parts):
		ndarr[i] = (shape.part(i).x, shape.part(i).y)

	return ndarr

def dlib_shp_to_bb(rect, shape, res):
	min_x = res[0]
	min_y = res[1]
	max_x = 0
	max_y = 0
	for i in range(shape.num_parts):
		x = shape.part(i).x
		y = shape.part(i).y
		if min_x > x:
			min_x = x
		if min_y > y:
			min_y = y
		if max_x < x:
			max_x = x
		if max_y < y:
			max_y = y
	
	left_top = (min(rect.left(), min_x), min(rect.top(), min_y))
	right_bottom = (max(rect.right(), max_x), max(rect.bottom(), max_y))
	print( left_top, right_bottom )
	return (left_top, right_bottom)

detector = dlib.get_frontal_face_detector() #HOG + LinearSVM
predictor = dlib.shape_predictor('shape_predictor_68_face_landmarks_GTX.dat')

while True:
	cap = cv.VideoCapture(0)
	img = cap.read()[1]
	img_ = cv.cvtColor(img, cv.COLOR_BGR2RGB)
	cap.release()
	
	rects = detector(img, 0)

	for (i,rect) in enumerate(rects):
		shape = predictor(img_, rect)
		coords = dlib_shp_to_np(shape)
		
		left_top, right_bottom = dlib_shp_to_bb(rect, shape, (img.shape[1], img.shape[0]))
		cv.rectangle(img, left_top, right_bottom, (0,255,0), 1)
		
		for (x, y) in coords:
			cv.circle(img, (x, y), 2, (0, 255, 0), -1)
	
	plt.imshow(cv.cvtColor(img, cv.COLOR_BGR2RGB))
	plt.show()
