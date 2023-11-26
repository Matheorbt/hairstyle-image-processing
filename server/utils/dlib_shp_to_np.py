import numpy as np


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
    print(left_top, right_bottom)
    return (left_top, right_bottom)
