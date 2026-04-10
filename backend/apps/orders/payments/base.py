from abc import ABC, abstractmethod

class PaymentProvider(ABC):
    """
    Abstract Base Class for all payment providers.
    Following the Strategy Pattern.
    """
    @abstractmethod
    def create_payment(self, order, request):
        """Build payment URL or process direct payment."""
        pass

    @abstractmethod
    def verify_transaction(self, request):
        """Verify the transaction result from the gateway."""
        pass
