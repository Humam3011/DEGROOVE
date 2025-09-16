import os                                                   # Untuk operasi sistem seperti membuat folder, mengatur path file.
import uuid                                                 # Untuk membuat nama file unik (UUID) agar tidak konflik saat menyimpan.
import sys                                                  # Untuk memodifikasi path sistem (sys.path.append) agar modul lokal dapat diakses.
import cv2                                                  # OpenCV, digunakan untuk membaca, memproses, dan menyimpan gambar.
import numpy as np                                          # Untuk manipulasi array dan operasi numerik yang efisien.
import torch                                                # Library PyTorch untuk loading model RetinaNet, normalisasi tensor, dll.
from collections import Counter                             # Untuk menghitung jumlah objek per label hasil deteksi.
from torchvision import transforms                          # Untuk preprocessing gambar jika diperlukan.
from fastapi import FastAPI, File, UploadFile, Form         # Untuk definisi API dan menangani upload file/form.
from fastapi.responses import JSONResponse                  # Untuk merespons dengan format JSON ke client.
from fastapi.staticfiles import StaticFiles                 # Untuk menyajikan file statis (gambar hasil deteksi).
from fastapi.middleware.cors import CORSMiddleware          # Untuk mengatur agar API dapat diakses dari domain lain (CORS).
from ultralytics import YOLO, RTDETR                        # Untuk memuat dan melakukan inferensi dengan model YOLOv8 dan RT-DETR.
from mmdet.apis import init_detector, inference_detector    # Untuk inisialisasi dan inferensi model MMDetection (RTMDet).
from mmdet.structures import DetDataSample                  # Struktur data untuk hasil deteksi MMDetection.
from mmdet.visualization import DetLocalVisualizer          # Untuk menampilkan/menyimpan hasil deteksi (bounding box).
from mmdet.visualization.palette import get_palette         # Untuk mengatur warna bounding box secara otomatis.
from PIL import Image, ImageDraw                            # Untuk memanipulasi gambar (Pillow), terutama dalam anotasi.
import tensorflow as tf                                     # Untuk load dan melakukan inferensi dengan model MobileNet, CenterNet, EfficientDet.

sys.path.append("models/research")
sys.path.append("models/research/slim")
from object_detection.utils import label_map_util, visualization_utils as viz_utils # type: ignore

sys.path.append("pytorch-retinanet")
from retinanet.dataloader import UnNormalizer # type: ignore

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model_folder = "model"
output_folder = "outputs"
os.makedirs(output_folder, exist_ok=True)

#lokasi model
model_paths = {
    "yolo": os.path.join(model_folder, "best_yolov8l_new.pt"),
    "rtdetr": os.path.join(model_folder, "best_rtdetr_new.pt"),
    "rtmdet": os.path.join(model_folder, "rtmdetnew_config.py"),
    "mobilenet": os.path.join(model_folder, "mobilenet_tf/saved_model"),
    "centernet": os.path.join(model_folder, "centernet_tf/saved_model"),
    "efficiendet": os.path.join(model_folder, "efficiendet_tf/saved_model"),
    "retinanet": os.path.join(model_folder, "model_retinanet_new.pt"),
}

loaded_models = {}
visualizer = None
device = "cuda" if torch.cuda.is_available() else "cpu"


#pemanggilan model
for model_name, model_path in model_paths.items():
    try:
        if model_name == "rtmdet":
            checkpoint_path = os.path.join(model_folder, "rtmdet_final_new.pth")
            loaded_models[model_name] = init_detector(model_path, checkpoint_path, device=device)
        elif model_name == "rtdetr":
            loaded_models[model_name] = RTDETR(model_path)
        elif model_name == "mobilenet":
            loaded_models[model_name] = tf.saved_model.load(model_path)
            print(f"✅ Loaded TensorFlow MobileNet model")
        elif model_name == "centernet":
            loaded_models[model_name] = tf.saved_model.load(model_path)
            print(f"✅ Loaded TensorFlow CenterNet model")
        elif model_name == "efficiendet":
            loaded_models[model_name] = tf.saved_model.load(model_path)
            print(f"✅ Loaded TensorFlow EfficientDet model")
        elif model_name == "retinanet":
            retinanet = torch.load(model_path)
            retinanet = retinanet.to(device)
            retinanet.eval()
            loaded_models[model_name] = retinanet
            print(f"✅ Loaded RetinaNet model")
        else:
            loaded_models[model_name] = YOLO(model_path)
            print(f"✅ Loaded model: {model_name}")
    except Exception as e:
        print(f"❌ Error loading model {model_name}: {e}")

if "rtmdet" in loaded_models:
    visualizer = DetLocalVisualizer()
    visualizer.dataset_meta = loaded_models["rtmdet"].dataset_meta
    num_classes = len(visualizer.dataset_meta["classes"])
    visualizer.dataset_meta["palette"] = get_palette("random", num_classes)

PATH_TO_LABELS = os.path.join(model_folder, "mobilenet_tf/label_map_center.pbtxt")
category_index = label_map_util.create_category_index_from_labelmap(PATH_TO_LABELS, use_display_name=True)
retinanet_label_names = ['Background', 'Nypa', 'Rhizophora', 'Avicennia']
unnormalize = UnNormalizer()

# Resize gambar agar sisi terpanjang menjadi max_side sambil mempertahankan rasio aspek
def resize_image(image, max_side=800):
    h, w = image.shape[:2]
    scale = max_side / max(h, w)
    new_h, new_w = int(h * scale), int(w * scale)
    resized = cv2.resize(image, (new_w, new_h))
    return resized, scale

# Normalisasi tensor gambar berdasarkan mean dan std dataset ImageNet (untuk PyTorch)
def normalize_tensor(tensor):
    mean = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1).to(tensor.device)
    std = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1).to(tensor.device)
    return (tensor - mean) / std

# Tambahkan teks label ke atas bounding box pada gambar
def draw_caption(image, box, caption):
    b = np.array(box).astype(int)
    cv2.putText(image, caption, (b[0], b[1] - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

PIXEL_AREA_TO_M2 = 0.0007095
CARBON_FRACTION = 0.47
CO2_CONVERSION = 3.67
ALLOMETRIC_PARAMS = {
    "Rhizophora": {"a": 0.251, "b": 1.21},
    "Avicennia": {"a": 0.184, "b": 1.29},
    "Nypa": {"a": 0.126, "b": 1.15}
}

# Hitung luas area bounding box (dalam m2), dikonversi dari piksel
def calculate_area_from_box(x, y, w, h):
    pixel_area = w * h
    return pixel_area * PIXEL_AREA_TO_M2, pixel_area

# Estimasi biomassa (B), karbon (C), dan CO2 setara (C_abs) berdasarkan genus
def estimate_carbon(area_m2, genus):
    if genus not in ALLOMETRIC_PARAMS:
        return 0, 0, 0
    a = ALLOMETRIC_PARAMS[genus]["a"]
    b = ALLOMETRIC_PARAMS[genus]["b"]
    B = a * (area_m2 ** b)
    C = B * CARBON_FRACTION
    C_abs = C * CO2_CONVERSION
    return B, C, C_abs

# Mapping label ke genus utama (Rhizophora, Avicennia, Nypa)
def get_genus_from_label(label: str) -> str:
    label_lower = label.lower()
    if "avicennia" in label_lower:
        return "Avicennia"
    elif "rhizophora" in label_lower:
        return "Rhizophora"
    elif "nypa" in label_lower:
        return "Nypa"
    else:
        return "Unknown"

# Hitung statistik karbon untuk setiap label:
# jumlah objek, luas area total, biomassa, karbon, dan CO2 per genus
def process_carbon_estimation(boxes, classes, scores, label_mapping):
    from collections import defaultdict
    result = defaultdict(lambda: {
        "count": 0, "areas": [], "biomass": 0, "carbon": 0, "co2": 0, "confidences": []
    })
    for box, cls, score in zip(boxes, classes, scores):
        x1, y1, x2, y2 = box
        w, h = x2 - x1, y2 - y1
        area_m2, _ = calculate_area_from_box(x1, y1, w, h)

        # Ambil label dari indeks kelas
        label = label_mapping.get(int(cls), str(cls)) if isinstance(label_mapping, dict) else str(cls)
        if isinstance(label, dict):
            label = label.get("name", str(cls))

        # Dapatkan genus dari label
        genus = get_genus_from_label(label)
        # Hitung estimasi karbon
        B, C, C_abs = estimate_carbon(area_m2, genus)
        # Tambahkan ke hasil
        result[label]["count"] += 1
        result[label]["areas"].append(area_m2)
        result[label]["biomass"] += B
        result[label]["carbon"] += C
        result[label]["co2"] += C_abs
        result[label]["confidences"].append(float(score))
    return result

#logika deteksi untuk masing masing model
@app.post("/detect/")
async def detect_objects(file: UploadFile = File(...), model_type: str = Form("yolo")):
    print(f"📌 Received request with model_type: {model_type}")

    if model_type not in loaded_models:
        return JSONResponse(content={"error": f"Model {model_type} not available"}, status_code=400)

    model = loaded_models[model_type]
    image_bytes = await file.read()
    image_np = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

    if image is None:
        return JSONResponse(content={"error": "Failed to decode image"}, status_code=400)

    unique_filename = f"{uuid.uuid4().hex}.jpg"
    output_path = os.path.join(output_folder, unique_filename)
    confidence_threshold = 0.3

    try:
        if model_type == "rtdetr":
            results = model(image)[0]
            boxes = results.boxes.xyxy.cpu().numpy()
            classes = results.boxes.cls.cpu().numpy()
            scores = results.boxes.conf.cpu().numpy()

            annotated_image = results.plot()
            cv2.imwrite(output_path, annotated_image)

            label_mapping = model.names
            detected_labels = [label_mapping[int(cls)] for cls in classes]
            detected_objects = dict(Counter(detected_labels))

            carbon_stats = process_carbon_estimation(boxes, classes, scores, label_mapping)

        elif model_type == "rtmdet":
            results = inference_detector(model, image)
            pred_instances = results.pred_instances
            valid = pred_instances.scores > confidence_threshold
            filtered_labels = pred_instances.labels[valid].cpu().numpy()
            label_names = [model.dataset_meta["classes"][int(cls)] for cls in filtered_labels]
            detected_objects = dict(Counter(label_names))

            data_sample = DetDataSample()
            data_sample.pred_instances = pred_instances[valid]
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            visualizer.add_datasample(
                name="result",
                image=image_rgb,
                data_sample=data_sample,
                draw_gt=False,
                draw_pred=True,
                show=False,
                out_file=output_path,
            )

            boxes = pred_instances.bboxes[valid].cpu().numpy()
            classes = pred_instances.labels[valid].cpu().numpy()
            scores = pred_instances.scores[valid].cpu().numpy()

            # Buat mapping label index ke dict {"name": label}
            label_mapping = {i: {"name": name} for i, name in enumerate(model.dataset_meta["classes"])}
            carbon_stats = process_carbon_estimation(boxes, classes, scores, label_mapping)



        elif model_type == "mobilenet":
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            input_tensor = tf.convert_to_tensor(image_rgb)
            input_tensor = input_tensor[tf.newaxis, ...]
            infer = model.signatures["serving_default"]
            detections = infer(input_tensor)

            num_detections = int(detections.pop('num_detections'))
            detections = {k: v[0, :num_detections].numpy() for k, v in detections.items()}
            detections['num_detections'] = num_detections
            detections['detection_classes'] = detections['detection_classes'].astype(np.int64)

            image_with_detections = image_rgb.copy()
            viz_utils.visualize_boxes_and_labels_on_image_array(
                image_with_detections,
                detections['detection_boxes'],
                detections['detection_classes'],
                detections['detection_scores'],
                category_index,
                use_normalized_coordinates=True,
                max_boxes_to_draw=20,
                min_score_thresh=confidence_threshold
            )

            detected_classes = detections["detection_classes"]
            scores = detections["detection_scores"]
            detected_labels = [
                category_index.get(cls, {"name": str(cls)})["name"]
                for cls, score in zip(detected_classes, scores)
                if score >= confidence_threshold
            ]

            h, w, _ = image_rgb.shape  # <= pindahkan ini ke sini
            boxes = detections["detection_boxes"]
            classes = detections["detection_classes"]
            scores = detections["detection_scores"]

            filtered_boxes = []
            filtered_classes = []
            filtered_scores = []

            for box, cls, score in zip(boxes, classes, scores):
                if score >= confidence_threshold:
                    y1, x1, y2, x2 = box
                    x1_pixel, y1_pixel, x2_pixel, y2_pixel = x1 * w, y1 * h, x2 * w, y2 * h
                    filtered_boxes.append([x1_pixel, y1_pixel, x2_pixel, y2_pixel])
                    filtered_classes.append(cls)
                    filtered_scores.append(score)

            # Lanjutkan proses hanya dengan yang sudah difilter
            carbon_stats = process_carbon_estimation(
                filtered_boxes, filtered_classes, filtered_scores, category_index
            )

            # Hitung label dari filtered_classes
            detected_labels = [
                category_index.get(cls, {"name": str(cls)})["name"]
                for cls in filtered_classes
            ]
            detected_objects = dict(Counter(detected_labels))

            detected_objects = dict(Counter(detected_labels))

            cv2.imwrite(output_path, cv2.cvtColor(image_with_detections, cv2.COLOR_RGB2BGR))

        elif model_type == "centernet":
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            input_tensor = tf.convert_to_tensor(image_rgb)
            input_tensor = input_tensor[tf.newaxis, ...]
            infer = model.signatures["serving_default"]
            detections = infer(input_tensor)

            num_detections = int(detections.pop('num_detections'))
            detections = {k: v[0, :num_detections].numpy() for k, v in detections.items()}
            detections['num_detections'] = num_detections
            detections['detection_classes'] = detections['detection_classes'].astype(np.int64)

            image_with_detections = image_rgb.copy()
            viz_utils.visualize_boxes_and_labels_on_image_array(
                image_with_detections,
                detections['detection_boxes'],
                detections['detection_classes'],
                detections['detection_scores'],
                category_index,
                use_normalized_coordinates=True,
                max_boxes_to_draw=20,
                min_score_thresh=confidence_threshold
            )

            detected_classes = detections["detection_classes"]
            scores = detections["detection_scores"]
            detected_labels = [
                category_index.get(cls, {"name": str(cls)})["name"]
                for cls, score in zip(detected_classes, scores)
                if score >= confidence_threshold
            ]

            h, w, _ = image_rgb.shape  # <= pindahkan ini ke sini
            boxes = detections["detection_boxes"]
            classes = detections["detection_classes"]
            scores = detections["detection_scores"]

            filtered_boxes = []
            filtered_classes = []
            filtered_scores = []

            for box, cls, score in zip(boxes, classes, scores):
                if score >= confidence_threshold:
                    y1, x1, y2, x2 = box
                    x1_pixel, y1_pixel, x2_pixel, y2_pixel = x1 * w, y1 * h, x2 * w, y2 * h
                    filtered_boxes.append([x1_pixel, y1_pixel, x2_pixel, y2_pixel])
                    filtered_classes.append(cls)
                    filtered_scores.append(score)

            # Lanjutkan proses hanya dengan yang sudah difilter
            carbon_stats = process_carbon_estimation(
                filtered_boxes, filtered_classes, filtered_scores, category_index
            )

            # Hitung label dari filtered_classes
            detected_labels = [
                category_index.get(cls, {"name": str(cls)})["name"]
                for cls in filtered_classes
            ]
            detected_objects = dict(Counter(detected_labels))

            detected_objects = dict(Counter(detected_labels))

            cv2.imwrite(output_path, cv2.cvtColor(image_with_detections, cv2.COLOR_RGB2BGR))

        elif model_type == "efficiendet":
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            input_tensor = tf.convert_to_tensor(image_rgb)
            input_tensor = input_tensor[tf.newaxis, ...]
            infer = model.signatures["serving_default"]
            detections = infer(input_tensor)

            num_detections = int(detections.pop('num_detections'))
            detections = {k: v[0, :num_detections].numpy() for k, v in detections.items()}
            detections['num_detections'] = num_detections
            detections['detection_classes'] = detections['detection_classes'].astype(np.int64)

            image_with_detections = image_rgb.copy()
            viz_utils.visualize_boxes_and_labels_on_image_array(
                image_with_detections,
                detections['detection_boxes'],
                detections['detection_classes'],
                detections['detection_scores'],
                category_index,
                use_normalized_coordinates=True,
                max_boxes_to_draw=20,
                min_score_thresh=confidence_threshold
            )

            detected_classes = detections["detection_classes"]
            scores = detections["detection_scores"]
            detected_labels = [
                category_index.get(cls, {"name": str(cls)})["name"]
                for cls, score in zip(detected_classes, scores)
                if score >= confidence_threshold
            ]

            h, w, _ = image_rgb.shape  # <= pindahkan ini ke sini
            boxes = detections["detection_boxes"]
            classes = detections["detection_classes"]
            scores = detections["detection_scores"]

            filtered_boxes = []
            filtered_classes = []
            filtered_scores = []

            for box, cls, score in zip(boxes, classes, scores):
                if score >= confidence_threshold:
                    y1, x1, y2, x2 = box
                    x1_pixel, y1_pixel, x2_pixel, y2_pixel = x1 * w, y1 * h, x2 * w, y2 * h
                    filtered_boxes.append([x1_pixel, y1_pixel, x2_pixel, y2_pixel])
                    filtered_classes.append(cls)
                    filtered_scores.append(score)

            # Lanjutkan proses hanya dengan yang sudah difilter
            carbon_stats = process_carbon_estimation(
                filtered_boxes, filtered_classes, filtered_scores, category_index
            )

            # Hitung label dari filtered_classes
            detected_labels = [
                category_index.get(cls, {"name": str(cls)})["name"]
                for cls in filtered_classes
            ]
            detected_objects = dict(Counter(detected_labels))

            detected_objects = dict(Counter(detected_labels))

            cv2.imwrite(output_path, cv2.cvtColor(image_with_detections, cv2.COLOR_RGB2BGR))



        elif model_type == "retinanet":
            # RetinaNet inference
            orig_image_bgr = image
            orig_image_rgb = cv2.cvtColor(orig_image_bgr, cv2.COLOR_BGR2RGB)

            resized_img, scale = resize_image(orig_image_rgb.astype(np.float32) / 255.0)
            img_tensor = torch.from_numpy(resized_img.transpose(2, 0, 1)).float()
            img_tensor = normalize_tensor(img_tensor)
            img_tensor = img_tensor.unsqueeze(0).to(device)

            with torch.no_grad():
                scores, classifications, transformed_anchors = model(img_tensor)

            scores = scores.cpu()
            classifications = classifications.cpu()
            transformed_anchors = transformed_anchors.cpu()

            idxs = torch.where(scores > confidence_threshold)[0]

            img_to_show = orig_image_bgr.copy()
            detected_labels = []

            for i in idxs:
                bbox = transformed_anchors[i].numpy()
                bbox /= scale
                x1, y1, x2, y2 = bbox.astype(int)
                score = scores[i].item()
                label_idx = int(classifications[i].item())
                label_name = retinanet_label_names[label_idx] if label_idx < len(
                    retinanet_label_names) else f'Class {label_idx}'

                caption = f"{label_name}: {score:.2f}"
                draw_caption(img_to_show, (x1, y1, x2, y2), caption)
                cv2.rectangle(img_to_show, (x1, y1), (x2, y2), (255, 0, 0), 2)

                detected_labels.append(label_name)

            detected_objects = dict(Counter(detected_labels))
            cv2.imwrite(output_path, img_to_show)

            boxes_np = []
            for i in idxs:
                box = transformed_anchors[i].numpy()
                box /= scale
                boxes_np.append(box)

            classes = classifications[idxs].numpy()
            scores = scores[idxs].numpy()

            carbon_stats = process_carbon_estimation(boxes_np, classes, scores, retinanet_label_names)

        else:
            results = model(image)
            detected_labels = [model.names[int(cls)] for cls in results[0].boxes.cls.tolist()]
            detected_objects = dict(Counter(detected_labels))
            annotated_image = results[0].plot()
            cv2.imwrite(output_path, annotated_image)
            boxes = results[0].boxes.xyxy.cpu().numpy()
            classes = results[0].boxes.cls.cpu().numpy()
            scores = results[0].boxes.conf.cpu().numpy()

            carbon_stats = process_carbon_estimation(boxes, classes, scores, model.names)

        print(f"✅ Detection finished. Output saved to {output_path}")
        return JSONResponse(content={
            "detected_objects": detected_objects,
            "carbon_estimation": carbon_stats,
            "image_url": f"/outputs/{unique_filename}"
        })

    except Exception as e:
        print(f"❌ Error during detection: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

app.mount("/outputs", StaticFiles(directory=output_folder), name="outputs")
