import hmac
import hashlib

order_id = "order_QjVIlhOhzJXgao"
payment_id = "pay_QjUXAbCdEfGH"
secret = "fVAs8GBL4CqIEnIzmKfSgnue"

generated_signature = hmac.new(
    secret.encode(),
    f"{order_id}|{payment_id}".encode(),
    hashlib.sha256
).hexdigest()

print("Signature:", generated_signature)
