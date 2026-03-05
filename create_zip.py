import zipfile
import os

files_to_include = [
    'app', 'components', 'lib', 'prisma', 'public', 'scripts',
    'package.json', 'next.config.js', 'tailwind.config.ts', 'tsconfig.json',
    'deploy.sh', 'docker-compose.prod.yml', 'Dockerfile', '.env'
]

dest_zip = '/Users/stalinkumar/Downloads/Wabot_BSP/grafty_clean.zip'
base_dir = '/Users/stalinkumar/Downloads/Wabot_BSP'

with zipfile.ZipFile(dest_zip, 'w', zipfile.ZIP_DEFLATED) as z:
    for item in files_to_include:
        item_path = os.path.join(base_dir, item)
        if os.path.isdir(item_path):
            for root, dirs, files in os.walk(item_path):
                if 'node_modules' in dirs: dirs.remove('node_modules')
                if '.next' in dirs: dirs.remove('.next')
                for f in files:
                    abs_path = os.path.join(root, f)
                    rel_path = os.path.relpath(abs_path, base_dir)
                    z.write(abs_path, rel_path)
        else:
            if os.path.exists(item_path):
                z.write(item_path, item)

print(f"Zip created: {dest_zip}")
