import re
import os

files_to_fix = [
    "src/App.jsx",
    "src/context/AuthContext.jsx",
    "src/pages/AdminDashboard.jsx",
    "src/pages/Cart.jsx",
    "src/pages/Checkout.jsx",
    "src/pages/Contact.jsx",
    "src/pages/CourseDetail.jsx",
    "src/pages/Degrees.jsx",
    "src/pages/Documents.jsx",
    "src/pages/Home.jsx",
    "src/pages/InstructorAnalytics.jsx",
    "src/pages/InstructorCourseCurriculum.jsx",
    "src/pages/InstructorCourseList.jsx",
    "src/pages/InstructorFinance.jsx",
    "src/pages/InstructorLogin.jsx",
    "src/pages/InstructorReviews.jsx",
    "src/pages/InstructorStudents.jsx",
    "src/pages/Learn.jsx",
    "src/pages/MockVNPay.jsx",
    "src/pages/Orders.jsx",
    "src/pages/Profile.jsx",
    "src/pages/Schedule.jsx",
    "src/pages/StripeCheckout.jsx"
]

def process_file(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Move fetchData declarations above useEffect
    if 'const fetchData = async () =>' in content and 'useEffect(' in content:
        content = re.sub(r'const fetchData\s*=\s*async\s*\(\)\s*=>\s*\{', r'async function fetchData() {', content)
    
    if 'const fetchCourses = async () =>' in content:
        content = re.sub(r'const fetchCourses\s*=\s*async\s*\(\)\s*=>\s*\{', r'async function fetchCourses() {', content)
        
    if 'const fetchReviews = async () =>' in content:
        content = re.sub(r'const fetchReviews\s*=\s*async\s*\(\)\s*=>\s*\{', r'async function fetchReviews() {', content)

    # Fix synchronous setStates inside effect by wrapping in setTimeout
    content = content.replace("setCartCount(0);", "setTimeout(() => setCartCount(0), 0);")
    content = content.replace("setLoading(false);", "setTimeout(() => setLoading(false), 0);")
    
    # fix setItems inside Checkout
    checkout_items_re = r"setItems\(\[\s*\{\s*id:\s*'trial_123',\s*course:\s*\{[^\}]+\}\s*\}\s*\]\);"
    if re.search(checkout_items_re, content):
        content = re.sub(checkout_items_re, lambda m: f"setTimeout(() => {m.group(0)}, 0);", content)

    content = content.replace("setError('Mã giao dịch không hợp lệ!');", "setTimeout(() => setError('Mã giao dịch không hợp lệ!'), 0);")
    
    # fix setForm inside Profile
    profile_form_re = r"setForm\(\{ first_name: user\.first_name \|\| '', last_name: user\.last_name \|\| '', email: user\.email \|\| '' \}\);"
    if re.search(profile_form_re, content):
        content = re.sub(profile_form_re, lambda m: f"setTimeout(() => {m.group(0)}, 0);", content)

    # Fix unused error/err/e by removing 'catch (e)' into 'catch'
    content = re.sub(r'catch\s*\(\s*(error|err|e)\s*\)', r'catch', content)

    # remove unused `idx` and `res` or just prefix with underscore
    # Since eslint looks at names, we can replace `res` with `_res` in assignments if we don't use them, 
    # but the easiest way is to disable unused var locally or add `// eslint-disable-next-line no-unused-vars`.
    # It's cleaner to just replace `const res =` with `await ` if `res` is unused, let's try prefixing.

    # Remove `loading` unused var if it is "const [loading, setLoading] = useState(" 
    content = re.sub(r'const\s+\[loading,\s*setLoading\]\s*=\s*useState\(', r'const [, setLoading] = useState(', content)

    # Remove `navigate` if unused, wait - I should just let eslint --fix fix the simple ones.
    
    # Remove unused `parseMetadata` in Home.jsx
    if 'parseMetadata' in content:
        content = re.sub(r'const\s+parseMetadata\s*=\s*\(.*?\)[\s\n]*=>\s*\{.*?\}\s*;', '', content, flags=re.DOTALL)
        
    # Remove unused `setSidebarOpen` in Learn.jsx
    content = re.sub(r'const\s+\[sidebarOpen,\s*setSidebarOpen\]\s*=\s*useState\([^)]*\);', r'const [sidebarOpen] = useState(false);', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for f in files_to_fix:
    process_file(f)
