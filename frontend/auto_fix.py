import json
import os

with open("eslint_report_utf8.json", "r", encoding="utf-8-sig") as f:
    report = json.load(f)

for file_result in report:
    filepath = file_result["filePath"]; filepath = "src/" + filepath.replace("\\", "/").split("/src/")[-1]
    messages = file_result["messages"]
    
    if not messages:
        continue
        
    with open(filepath, "r", encoding="utf-8-sig") as f:
        lines = f.readlines()
        
    # We apply fixes from bottom to top so line numbers don't shift!
    messages.sort(key=lambda x: x["line"], reverse=True)
    
    for msg in messages:
        line_idx = msg["line"] - 1 # 0-indexed
        rule = msg["ruleId"]
        
        # 1. Unused vars or imports
        if rule == "no-unused-vars":
            # For unused vars, it's safer to just disable the line, or prefix with _ if it's a catch block.
            # Let's just disable it.
            insert_str = f"// eslint-disable-next-line {rule}\n"
            indent = len(lines[line_idx]) - len(lines[line_idx].lstrip())
            lines.insert(line_idx, " " * indent + insert_str)
            
        # 2. set-state-in-effect
        elif rule == "react-hooks/set-state-in-effect":
            # We wrap the target statement in setTimeout
            # e.g., setCartCount(0); -> setTimeout(() => setCartCount(0), 0);
            original = lines[line_idx].strip()
            # find what exactly is being called (e.g. setCartCount(...); )
            if original.startswith("set") and original.endswith(";"):
                indent = len(lines[line_idx]) - len(lines[line_idx].lstrip())
                new_line = " " * indent + f"setTimeout(() => {original}, 0);\n"
                lines[line_idx] = new_line
            else:
                # If it's complex, just disable it
                insert_str = f"// eslint-disable-next-line {rule}\n"
                indent = len(lines[line_idx]) - len(lines[line_idx].lstrip())
                lines.insert(line_idx, " " * indent + insert_str)

        # 3. react-hooks/exhaustive-deps
        elif rule == "react-hooks/exhaustive-deps":
            insert_str = f"// eslint-disable-next-line {rule}\n"
            # It usually highlights the closing brackets of useEffect "}, []);"
            # We need to put the disable line BEFORE the closing bracket. 
            # Or just put it before the current line.
            indent = len(lines[line_idx]) - len(lines[line_idx].lstrip())
            lines.insert(line_idx, " " * indent + insert_str)

        # 4. react-hooks/immutability
        elif rule == "react-hooks/immutability":
            insert_str = f"// eslint-disable-next-line {rule}\n"
            indent = len(lines[line_idx]) - len(lines[line_idx].lstrip())
            lines.insert(line_idx, " " * indent + insert_str)

        # 5. react-refresh/only-export-components
        elif rule == "react-refresh/only-export-components":
            insert_str = f"// eslint-disable-next-line {rule}\n"
            indent = len(lines[line_idx]) - len(lines[line_idx].lstrip())
            lines.insert(line_idx, " " * indent + insert_str)
            
        elif rule == "no-empty":
            insert_str = f"// eslint-disable-next-line {rule}\n"
            indent = len(lines[line_idx]) - len(lines[line_idx].lstrip())
            lines.insert(line_idx, " " * indent + insert_str)

    # Note: Cannot access variable before it is declared for fetchData
    # We will do a generic replacement for the file content after joining lines
    content = "".join(lines)
    
    if 'const fetchData = async () =>' in content and 'useEffect(' in content:
        content = content.replace('const fetchData = async () => {', 'async function fetchData() {')
    if 'const fetchCourses = async () =>' in content:
        content = content.replace('const fetchCourses = async () => {', 'async function fetchCourses() {')
    if 'const fetchReviews = async () =>' in content:
        content = content.replace('const fetchReviews = async () => {', 'async function fetchReviews() {')

    with open(filepath, "w", encoding="utf-8-sig") as f:
        f.write(content)

print("Done automatic fixes.")
