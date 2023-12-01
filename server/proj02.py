import numpy as np
import cv2 as cv
from sklearn import svm
from sklearn.model_selection import train_test_split
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import dlib
from math import sqrt
import os
import pickle

def bgr_to_rgb(img):
	#Due to the requirement that we do not use any openCV function
	#other than input and output functions, 
	#I implemented the native numpy equivalent of cv.cvtColor(img, cv.BGR2RGB)
	h = img.shape[0]
	w = img.shape[1]
	b,g,r = np.split(img, 3, 2)
	return np.stack([r,g,b], -1).reshape(h,w,3)


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


def seg_length(p1,p2):
	'''
	takes two tuple/arr of length 2, p1=(x1,y1) and p2=(x2,y2),
	returns the length between two
	'''
	x1,y1 = p1
	x2,y2 = p2
	return sqrt((x1-x2)**2 + (y1-y2)**2)


def preprocess_dataset(coords):
	'''
	Reference img for 68-point: https://miro.medium.com/v2/resize:fit:1400/format:webp/1*tn5D7BMcvq57-T8qy7_tUQ.png
	takes a np ndarr of shape (68,2),
	returns the ratio of length of lines against the standard line's length:
	  3-15 (central horizontal line): standard
	[0] 6-12 (lower lip line)
	[1] 18-27(eyebrow line)
	[2] 22,23-9 (midbrow-chin vertical line)
	'''
	std = seg_length(coords[2],coords[14])
	lower_lip = seg_length(coords[6],coords[10]) *4 / std
	eyebrow = seg_length(coords[17],coords[26]) *4 / std
	under_eye = seg_length(coords[0],coords[16]) *4 / std
	midbrow_point = (coords[21]+coords[22])/2
	brow_chin = seg_length(midbrow_point,coords[8]) *4 / std

	h1 = seg_length(coords[3],coords[13]) *4 / std
	h2 = seg_length(coords[5],coords[11]) *4 / std
	v1 = seg_length((coords[4]+coords[12])/2, coords[8]) *4 /std
	h3 = seg_length(coords[7],coords[9]) *4 / std

	return (lower_lip, eyebrow, under_eye, brow_chin, h1,h2,v1,h3)

def debug_output(shape, res): 
	#shape is output of dlib predictor, res is (image_x_size, image_y_size)
	coords = dlib_shp_to_np(shape)
		
	left_top, right_bottom = dlib_shp_to_bb(rect, shape, res)
	cv.rectangle(img, left_top, right_bottom, (0,255,0), 1)
	
	print(preprocess_dataset(coords))

	for (x, y) in coords:
		cv.circle(img, (x, y), 2, (0, 255, 0), -1)
	
	plt.imshow(bgr_to_rgb(img))
	plt.show()


def produce_data(common, export=False, export_name = None):
	
	if export and type(export_name) is not str:
		print('export is set to true, but export_name is bad!')
		return (None,None)

	heart = [common+'heart/'+f for f in os.listdir(common+'heart') if os.path.isfile(common+'heart/'+f)]     #0
	oblong = [common+'oblong/'+f for f in os.listdir(common+'oblong') if os.path.isfile(common+'oblong/'+f)] #1
	oval = [common+'oval/'+f for f in os.listdir(common+'oval') if os.path.isfile(common+'oval/'+f)]         #2
	rounds = [common+'round/'+f for f in os.listdir(common+'round') if os.path.isfile(common+'round/'+f)]    #3
	square = [common+'square/'+f for f in os.listdir(common+'square') if os.path.isfile(common+'square/'+f)] #4
	
	filelist = heart+oblong+oval+rounds+square
	
	
	data = []
	labels = [0]*len(heart) + [1]*len(oblong) + [2]*len(oval) + [3]*len(rounds) + [4]*len(square)
	for f in filelist:
		try:
			img = cv.imread(f)
			img = bgr_to_rgb(img)
			rect = detector(img, 0)
			rect = rect[0]
	
			shape = predictor(img, rect)
			coords = dlib_shp_to_np(shape)
	
			data.append(preprocess_dataset(coords))
		except Exception as e:
			#print(f'WARN: {f}: {repr(e)},  copy and pasting previous image\'s data!')
			#print(rect)
			data.append(data[-1])
			continue
	
	if export:
		with open(pickle_name, 'wb') as f:
			pickle.dump((data,labels), f)
		print(f'successfully picked data into {pickle_name}')

	return (data, labels)

def predict_faceshape(img):
	'''
	input: openCV's BGR format image; imread() / VideoCapture() then read().
	returns: int value for label:
		0=heart, 1=oblong, 2=oval, 3=rounds, 4=square
	'''
	detector = dlib.get_frontal_face_detector() #HOG + LinearSVM
	predictor = dlib.shape_predictor('shape_predictor_68_face_landmarks_GTX.dat')

	pickle_name = 'archive_dataset.pickle'

	data = None
	labels = None
	with open(pickle_name, 'rb') as f:
		data,labels = pickle.load(f)

	clf = svm.SVC()
	clf = clf.fit(data, labels)

	img = bgr_to_rgb(img)
	rects = detector(img, 0)

	if len(rects) < 1:
		raise IndexError

	shape = predictor(img, rects[0])
	coords = dlib_shp_to_np(shape)
	this = [preprocess_dataset(coords)]

	return clf.predict(this)[0]


# if __name__ == '__main__':
# 	#cap = cv.VideoCapture(0)
# 	#img = cap.read()[1]
# 	#cap.release()

# 	img = cv.imread('face.jpg')
	
# 	plt.imshow(bgr_to_rgb(img))
# 	plt.show()
	
# 	print(predict_faceshape(img))
