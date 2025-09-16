import torch
from ultralytics import YOLO
import cv2
import os

# Load the trained YOLOv8 model
model_path = 'model/best.pt'  # Ganti dengan path model Anda
model = YOLO(model_path)

# Path ke folder gambar untuk diuji
test_images_folder = 'test/'  # Ganti dengan path gambar uji Anda

# Mendapatkan daftar semua file gambar dalam folder
test_images = [f for f in os.listdir(test_images_folder) if f.endswith(('jpg', 'png', 'jpeg'))]

# Menguji setiap gambar
for image_name in test_images:
    # Membaca gambar
    image_path = os.path.join(test_images_folder, image_name)
    image = cv2.imread(image_path)

    # Melakukan prediksi
    results = model(image)

    # Menggambar bounding box pada gambar
    annotated_image = results[0].plot()  # Menggambar hasil pada gambar

    # Menyimpan atau menampilkan hasil
    output_path = os.path.join('path/to/save/outputs', image_name)  # Ganti dengan path output Anda
    cv2.imwrite(output_path, annotated_image)
    cv2.imshow('Predicted Image', annotated_image)
    cv2.waitKey(0)  # Menunggu hingga tombol ditekan

cv2.destroyAllWindows()
