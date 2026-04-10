import stripe
from django.conf import settings
from .base import PaymentProvider

class StripeProvider(PaymentProvider):
    def create_payment(self, order, request):
        stripe.api_key = settings.STRIPE_SECRET_KEY
        payment_method_id = request.data.get('stripe_payment_method_id')

        if not payment_method_id:
            return {'error': 'Missing stripe_payment_method_id'}

        intent = stripe.PaymentIntent.create(
            amount=int(order.total_price) * 100,
            currency='vnd',
            payment_method=payment_method_id,
            confirm=True,
            automatic_payment_methods={'enabled': True, 'allow_redirects': 'never'},
            metadata={'order_id': str(order.id)},
        )

        if intent.status == 'succeeded':
            return {'status': 'success', 'transaction_id': intent.id}
        elif intent.status == 'requires_action':
            return {'status': 'requires_action', 'client_secret': intent.client_secret}
        else:
            return {'status': 'error', 'message': f'Stripe status: {intent.status}'}

    def verify_transaction(self, request):
        # Stripe usually uses webhooks or direct response during creation
        pass
