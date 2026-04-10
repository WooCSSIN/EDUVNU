from .vnpay_provider import VNPAYProvider
from .stripe_provider import StripeProvider

class PaymentFactory:
    _providers = {
        'vnpay': VNPAYProvider(),
        'card': StripeProvider(),
        # Add momo, sepay etc here as needed
    }

    @classmethod
    def get_provider(cls, method_name):
        provider = cls._providers.get(method_name)
        if not provider:
            raise ValueError(f"Unsupported payment method: {method_name}")
        return provider
