#!/bin/sh
# Télécharge les modèles de visages d'OpenCV Zoo (YuNet : MIT, SFace : Apache-2.0).
set -e
cd "$(dirname "$0")"
BASE="https://media.githubusercontent.com/media/opencv/opencv_zoo/main/models"
curl -fL -o face_detection_yunet_2023mar.onnx "$BASE/face_detection_yunet/face_detection_yunet_2023mar.onnx"
curl -fL -o face_recognition_sface_2021dec.onnx "$BASE/face_recognition_sface/face_recognition_sface_2021dec.onnx"
shasum -a 256 -c <<SUMS
8f2383e4dd3cfbb4553ea8718107fc0423210dc964f9f4280604804ed2552fa4  face_detection_yunet_2023mar.onnx
0ba9fbfa01b5270c96627c4ef784da859931e02f04419c829e83484087c34e79  face_recognition_sface_2021dec.onnx
SUMS
