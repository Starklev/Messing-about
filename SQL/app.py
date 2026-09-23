from flask import Flask, request, jsonify, render_template, redirect, url_for
from project import create_app

app = create_app()


@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/about', methods=['GET'])
def about():
    return jsonify({'message': 'About Us'})

@app.route('/contact', methods=['GET'])
def contact():
    return jsonify({'message': 'Contact Us'})

if __name__ == '__main__':
    app.run(debug=True)
