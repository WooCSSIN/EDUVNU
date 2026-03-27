import hashlib
import hmac
import urllib.parse

class vnpay:
    requestData = {}
    responseData = {}

    def get_mac(self, secret_key):
        hasData = ''
        seq = 0
        for key, val in sorted(self.requestData.items()):
            if seq == 1:
                hasData = hasData + "&" + str(key) + '=' + urllib.parse.quote_plus(str(val))
            else:
                seq = 1
                hasData = str(key) + '=' + urllib.parse.quote_plus(str(val))
        hashValue = self.__md5(secret_key, hasData)
        return hashValue

    def get_payment_url(self, vnpay_payment_url, secret_key):
        signValue = self.get_mac(secret_key)
        url = vnpay_payment_url + "?"
        seq = 0
        for key, val in sorted(self.requestData.items()):
            if seq == 1:
                url = url + "&" + str(key) + '=' + urllib.parse.quote_plus(str(val))
            else:
                seq = 1
                url = url + str(key) + '=' + urllib.parse.quote_plus(str(val))
        url = url + '&vnp_SecureHash=' + signValue
        return url

    def validate_response(self, secret_key):
        vnp_SecureHash = self.responseData.get('vnp_SecureHash')
        if 'vnp_SecureHash' in self.responseData:
            self.responseData.pop('vnp_SecureHash')
        if 'vnp_SecureHashType' in self.responseData:
            self.responseData.pop('vnp_SecureHashType')
        
        hasData = ''
        seq = 0
        for key, val in sorted(self.responseData.items()):
            if str(key).startswith('vnp_'):
                if seq == 1:
                    hasData = hasData + "&" + str(key) + '=' + urllib.parse.quote_plus(str(val))
                else:
                    seq = 1
                    hasData = str(key) + '=' + urllib.parse.quote_plus(str(val))
        hashValue = self.__md5(secret_key, hasData)
        return vnp_SecureHash == hashValue

    @staticmethod
    def __md5(secret_key, data):
        data = data.encode('utf-8')
        secret_key = secret_key.encode('utf-8')
        return hmac.new(secret_key, data, hashlib.sha512).hexdigest()
