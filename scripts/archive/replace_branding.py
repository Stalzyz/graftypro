import os

replacements = {
    "Grekam Academy": "Grafty Academy",
    "Grekam": "Grafty",
    "Wabot": "Grafty",
    "Wavo": "Grafty",
    "wabot": "grafty",
    "wavo": "grafty",
    "grekam.in": "grafty.pro"
}

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        for old, new in replacements.items():
            content = content.replace(old, new)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated: {filepath}")
    except Exception as e:
        print(f"Skipping {filepath}: {e}")

directories = ["app", "components", "lib"]
for directory in directories:
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith((".ts", ".tsx", ".js", ".jsx", ".md", ".css", ".html")):
                replace_in_file(os.path.join(root, file))
