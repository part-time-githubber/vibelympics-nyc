from PIL import Image
import os

target_files = [
    'tulsi_pot_1770494129520.png',
    'mango_tree_1770494144009.png',
    'rangoli_design_1770494159591.png',
    'peacock_bird_1770494172864.png'
]

def make_transparent(file_path):
    try:
        img = Image.open(file_path)
        img = img.convert("RGBA")
        datas = img.getdata()

        new_data = []
        for item in datas:
            # Change all white (also shades of whites)
            # to transparent
            if item[0] > 220 and item[1] > 220 and item[2] > 220:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)

        img.putdata(new_data)
        img.save(file_path, "PNG")
        print(f"Processed {file_path}")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

for f in target_files:
    if os.path.exists(f):
        make_transparent(f)
    else:
        print(f"File not found: {f}")
