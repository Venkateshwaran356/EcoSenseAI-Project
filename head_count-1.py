"""
Head Count + Object Detection System
--------------------------------------
Detects and counts PEOPLE (heads) AND other objects (car, dog, chair, etc.)
in an IMAGE, a VIDEO file, or a live CAMERA feed.

Setup (run once in your terminal / VS Code terminal):
    python -m pip install ultralytics opencv-python

How to run:
    Image mode:
        python head_count.py --mode image --source path/to/photo.jpg

    Video mode:
        python head_count.py --mode video --source path/to/video.mp4

    Camera mode (webcam):
        python head_count.py --mode camera --source 0

Press 'q' to quit the video/camera window.
First run will download the yolov8n.pt model automatically (~6MB).
"""

import argparse
import cv2
from ultralytics import YOLO

# ---------------------------------------------------------
# STEP 1: Load the pretrained YOLOv8 model
# ---------------------------------------------------------
# yolov8n.pt is trained on the COCO dataset, which has 80 object classes
# (person, car, dog, chair, bottle, etc.) - not just people.
MODEL = YOLO("yolov8n.pt")

# In the COCO dataset, class ID 0 = "person". We treat that as "head count".
PERSON_CLASS_ID = 0

# Minimum confidence score to accept a detection (0 to 1).
CONFIDENCE_THRESHOLD = 0.4


def count_and_detect(frame):
    """
    Runs YOLOv8 on a single frame and returns:
        - the frame with boxes + labels drawn on it
        - head_count (number of people)
        - object_counts (dictionary of {object_name: count} for everything else)
    """
    results = MODEL(frame, verbose=False)[0]

    head_count = 0
    object_counts = {}

    for box in results.boxes:
        class_id = int(box.cls[0])
        confidence = float(box.conf[0])
        class_name = MODEL.names[class_id]

        if confidence < CONFIDENCE_THRESHOLD:
            continue

        # Get box coordinates
        x1, y1, x2, y2 = box.xyxy[0]
        x1 = int(x1)
        y1 = int(y1)
        x2 = int(x2)
        y2 = int(y2)

        if class_id == PERSON_CLASS_ID:
            head_count = head_count + 1
            box_color = (0, 255, 0)      # green for people
            label = "Person"
        else:
            if class_name in object_counts:
                object_counts[class_name] = object_counts[class_name] + 1
            else:
                object_counts[class_name] = 1
            box_color = (255, 150, 0)    # blue-ish for other objects
            label = class_name

        cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, 2)
        cv2.putText(
            frame,
            label,
            (x1, y1 - 8),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            box_color,
            2,
        )

    # ---------------------------------------------------------
    # Draw a summary panel in the top-left corner
    # ---------------------------------------------------------
    line_y = 30
    cv2.putText(
        frame,
        "Head Count: " + str(head_count),
        (20, line_y),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 0, 255),
        2,
    )

    line_y = line_y + 30
    for object_name in object_counts:
        text = object_name + ": " + str(object_counts[object_name])
        cv2.putText(
            frame,
            text,
            (20, line_y),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 0, 255),
            2,
        )
        line_y = line_y + 25

    return frame, head_count, object_counts


def print_summary(head_count, object_counts):
    """Prints a clean text summary to the terminal."""
    print("Total heads (people) detected:", head_count)

    if len(object_counts) == 0:
        print("No other objects detected.")
    else:
        print("Other objects detected:")
        for object_name in object_counts:
            print(" -", object_name, ":", object_counts[object_name])


def run_on_image(image_path):
    """Handles detection for a single image file."""
    frame = cv2.imread(image_path)

    if frame is None:
        print("Error: could not open image at", image_path)
        return

    frame, head_count, object_counts = count_and_detect(frame)
    print_summary(head_count, object_counts)

    cv2.imshow("Head Count + Object Detection - Image", frame)
    print("Press any key on the image window to close it.")
    cv2.waitKey(0)
    cv2.destroyAllWindows()


def run_on_video_or_camera(source):
    """
    Handles detection for a video file or a live camera.
    'source' is either a file path (video) or an integer (camera index, e.g. 0).
    """
    cap = cv2.VideoCapture(source)

    if not cap.isOpened():
        print("Error: could not open video source:", source)
        return

    print("Press 'q' to quit.")

    while True:
        success, frame = cap.read()

        if success == False:
            print("End of video or camera disconnected.")
            break

        frame, head_count, object_counts = count_and_detect(frame)

        cv2.imshow("Head Count + Object Detection - Live", frame)

        # Press 'q' to exit the loop
        key = cv2.waitKey(1) & 0xFF
        if key == ord("q"):
            print_summary(head_count, object_counts)
            break

    cap.release()
    cv2.destroyAllWindows()


def main():
    parser = argparse.ArgumentParser(description="Head Count + Object Detection System")
    parser.add_argument(
        "--mode",
        required=True,
        choices=["image", "video", "camera"],
        help="Choose 'image', 'video', or 'camera'",
    )
    parser.add_argument(
        "--source",
        required=True,
        help="Image/video file path, OR camera index (e.g. 0) if mode is 'camera'",
    )

    args = parser.parse_args()

    if args.mode == "image":
        run_on_image(args.source)

    elif args.mode == "video":
        run_on_video_or_camera(args.source)

    elif args.mode == "camera":
        # Convert source to an integer camera index (e.g. "0" -> 0)
        camera_index = int(args.source)
        run_on_video_or_camera(camera_index)


if __name__ == "__main__":
    main()
