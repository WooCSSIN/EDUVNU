import hashlib
import hmac
import json
import urllib.request
import uuid
from django.conf import settings

class MoMoPayment:
    def __init__(self):
        # Thông tin kết nối sandbox
        self.endpoint = settings.MOMO_ENDPOINT
        self.partner_code = settings.MOMO_PARTNER_CODE
        self.access_key = settings.MOMO_ACCESS_KEY
        self.secret_key = settings.MOMO_SECRET_KEY
        self.redirect_url = "http://localhost:5173/payment-return"
        self.ipn_url = "http://localhost:8000/api/v1/orders/momo_ipn/"
    
    def create_payment_url(self, order_id, amount, order_info):
        request_id = str(uuid.uuid4())
        amount_str = str(int(amount))
        request_type = "captureWallet"
        extra_data = ""

        # Sắp xếp và format chuỗi theo chuẩn MoMo
        raw_signature = f"accessKey={self.access_key}&amount={amount_str}&extraData={extra_data}&ipnUrl={self.ipn_url}&orderId={order_id}&orderInfo={order_info}&partnerCode={self.partner_code}&redirectUrl={self.redirect_url}&requestId={request_id}&requestType={request_type}"

        # Hash SHA256 HMAC
        h = hmac.new(bytes(self.secret_key, 'ascii'), bytes(raw_signature, 'ascii'), hashlib.sha256)
        signature = h.hexdigest()

        data = {
            "partnerCode": self.partner_code,
            "partnerName": "EduVNU",
            "storeId": "EduStore",
            "requestId": request_id,
            "amount": int(amount),
            "orderId": order_id,
            "orderInfo": order_info,
            "redirectUrl": self.redirect_url,
            "ipnUrl": self.ipn_url,
            "lang": "vi",
            "extraData": extra_data,
            "requestType": request_type,
            "signature": signature
        }

        try:
            req = urllib.request.Request(self.endpoint, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
            response = urllib.request.urlopen(req)
            result = json.loads(response.read().decode('utf-8'))
            return result.get('payUrl')
        except Exception as e:
            print("MoMo SDK Error:", e)
            return None
