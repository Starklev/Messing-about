from flask import Flask, request, jsonify
from project import create_app

app = create_app()


@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Hello, World!'})

@app.route('/yo', methods=['GET'])
def yo():
    return jsonify({'message': 'Yo'})

if __name__ == '__main__':
    app.run(debug=True)
