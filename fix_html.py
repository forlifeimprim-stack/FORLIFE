import re

file_path = r"d:\MINE\FORLIFE COM\forlife-com\a-propos.html"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    # Match pattern like "240:           </svg>"
    # We want to replace "240: " with ""
    new_line = re.sub(r'^\d+:\s', '', line)
    new_lines.append(new_line)

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)
    
print("Fixed a-propos.html")
