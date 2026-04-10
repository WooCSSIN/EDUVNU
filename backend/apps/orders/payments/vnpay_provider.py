from django.conf import settings
from django.utils import timezone
from .base import PaymentProvider
from ..vnpay import vnpay as VnpayHelper

class VNPAYProvider(PaymentProvider):
    def create_payment(self, order, request):
        vnp = VnpayHelper()
        x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        ip_addr = x_forwarded.split(',')[0] if x_forwarded else request.META.get('REMOTE_ADDR', '127.0.0.1')

        vnp.requestData = {
            'vnp_Version':    '2.1.0',
            'vnp_Command':    'pay',
            'vnp_TmnCode':    settings.VNPAY_TMN_CODE,
            'vnp_Amount':     str(int(order.total_price) * 100),
            'vnp_CurrCode':   'VND',
            'vnp_TxnRef':     str(order.id),
            'vnp_OrderInfo':  f'Thanh toan don hang EduVNU {order.id}',
            'vnp_OrderType':  'billpayment',
            'vnp_Locale':     'vn',
            'vnp_ReturnUrl':  settings.VNPAY_RETURN_URL,
            'vnp_IpAddr':     ip_addr,
            'vnp_CreateDate': timezone.now().strftime('%Y%m%d%H%M%S'),
        }
        payment_url = vnp.get_payment_url(settings.VNPAY_PAYMENT_URL, settings.VNPAY_HASH_SECRET)
        return {'payment_url': payment_url}

    def verify_transaction(self, request):
        vnp = VnpayHelper()
        vnp.responseData = request.GET.dict()
        is_valid = vnp.validate_response(settings.VNPAY_HASH_SECRET)
        if not is_valid:
            return {'status': 'error', 'message': 'Invalid Signature'}
        
        response_code = request.GET.get('vnp_ResponseCode')
        if response_code == '00':
            return {
                'status': 'success',
                'transaction_id': request.GET.get('vnp_TransactionNo'),
                'amount': int(request.GET.get('vnp_Amount', 0)) // 100
            }
        return {'status': 'error', 'message': f'VNPAY Error Code: {response_code}'}
