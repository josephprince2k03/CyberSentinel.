from PIL import Image
import os

png_path = r"e:\OSINT\frontend\public\logo.png"
ico_path = r"e:\OSINT\RakHack.ico"

try:
    img = Image.open(png_path)
    # Resize to standard icon sizes
    img.save(ico_path, format='ICO', sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])
    print(f"Successfully created icon at {ico_path}")
except Exception as e:
    print(f"Failed to create icon: {e}")
