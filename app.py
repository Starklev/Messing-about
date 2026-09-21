from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/', methods=['GET'])
def hello():
    return jsonify(message='Hello, World!')

@app.route('/yo', methods=['GET'])
def yo():
    return jsonify(message='THIS IS A TEST MESSAGE, DO NOT PANIC!!!!')

if __name__ == '__main__':
    app.run(debug=True)