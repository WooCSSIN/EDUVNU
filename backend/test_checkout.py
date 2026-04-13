import requests

baseURL = 'http://localhost:8000/api/v1'

def run():
    # Login as student
    r = requests.post(f"{baseURL}/accounts/login/", json={
        "username": "aaa",
        "password": "123456Aa@"
    })
    
    if r.status_code != 200:
        print("Login failed:", r.status_code, r.text)
        return
        
    access = r.json()['access']
    headers = {"Authorization": f"Bearer {access}"}

    # Add to cart
    print("Adding to cart...")
    r = requests.post(f"{baseURL}/cart/add_item/", headers=headers, json={"course_id": 429})
    print("Add to cart response:", r.status_code, r.text.encode('ascii', 'ignore').decode('ascii'))
    
    # Check cart
    r = requests.get(f"{baseURL}/cart/my_cart/", headers=headers)
    print("Cart contents length:", len(r.json().get('items', [])))
    
    # Checkout
    print("Checking out...")
    r = requests.post(f"{baseURL}/orders/checkout/", headers=headers, json={"payment_method": "vnpay"})
    print("Checkout response:", r.status_code, r.text.encode('ascii', 'ignore').decode('ascii'))

if __name__ == "__main__":
    run()
