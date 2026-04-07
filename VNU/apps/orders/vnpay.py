"""
VNPAY 2.1.0 - Helper Module
Theo đúng source code demo chính thức VNPAY Python:
https://sandbox.vnpayment.vn/apis/vnpay-demo/code-demo-tích-hợp

Spec chuẩn VNPAY:
- Sort tham số theo thứ tự alphabet (A-Z)
- Cả hash string VÀ query string đều dùng urllib.parse.quote_plus
- Hash algorithm: HMAC-SHA512
"""
import hashlib
import hmac
import urllib.parse


class vnpay:
    def __init__(self):
        self.requestData = {}
        self.responseData = {}

    def get_payment_url(self, vnpay_url, hash_secret):
        """
        Tạo URL thanh toán theo đúng chuẩn VNPAY 2.1.0.
        Cả hash data lẫn query string đều dùng quote_plus.
        """
        inputData = sorted(self.requestData.items())
        queryString = ''
        hasData = ''
        seq = 0
        for key, val in inputData:
            if seq == 1:
                queryString += '&' + key + '=' + urllib.parse.quote_plus(str(val))
                hasData += '&' + key + '=' + urllib.parse.quote_plus(str(val))
            else:
                seq = 1
                queryString = key + '=' + urllib.parse.quote_plus(str(val))
                hasData = key + '=' + urllib.parse.quote_plus(str(val))

        hash_value = self._hmac_sha512(hash_secret, hasData)
        return f"{vnpay_url}?{queryString}&vnp_SecureHash={hash_value}"

    def validate_response(self, hash_secret):
        """
        Xác thực chữ ký số trả về từ VNPAY.
        """
        vnp_secure_hash = self.responseData.get('vnp_SecureHash', '')

        # Loại bỏ các tham số liên quan đến hash
        data = {k: v for k, v in self.responseData.items()
                if k not in ('vnp_SecureHash', 'vnp_SecureHashType')}

        inputData = sorted(data.items())
        hasData = ''
        seq = 0
        for key, val in inputData:
            if seq == 1:
                hasData += '&' + key + '=' + urllib.parse.quote_plus(str(val))
            else:
                seq = 1
                hasData = key + '=' + urllib.parse.quote_plus(str(val))

        calculated_hash = self._hmac_sha512(hash_secret, hasData)
        return calculated_hash.lower() == vnp_secure_hash.lower()

    def _hmac_sha512(self, key, data):
        return hmac.new(
            key.encode('utf-8'),
            data.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()
