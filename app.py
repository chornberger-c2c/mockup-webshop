from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)
app.secret_key = "supersecretkey"

# Mock products
products = [
    {"id": 1, "name": "T-shirt", "price": 19.99},
    {"id": 2, "name": "Coffee Mug", "price": 9.99},
    {"id": 3, "name": "Notebook", "price": 4.99},
]

@app.route('/')
def index():
    return render_template("index.html", products=products)

@app.route('/buy/<int:product_id>', methods=['POST'])
def buy(product_id):
    product = next((p for p in products if p["id"] == product_id), None)
    if product:
        flash(f"Successfully bought {product['name']} for ${product['price']}!")
    else:
        flash("Product not found!")
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
