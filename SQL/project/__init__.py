from flask import Flask, request, jsonify, url_for, render_template
import urllib.parse
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, current_user
import logging
import os
from dotenv import load_dotenv


db = SQLAlchemy()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)

    load_dotenv()

    app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST')
    app.config['MYSQL_USER'] = os.getenv('MYSQL_USER')
    app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD')
    app.config['MYSQL_DATABASE'] = os.getenv('MYSQL_DATABASE')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://' + urllib.parse.quote_plus(os.getenv('MYSQL_USER')) + ':' + urllib.parse.quote_plus(os.getenv('MYSQL_PASSWORD')) + '@' + os.getenv('MYSQL_HOST') + '/' + urllib.parse.quote_plus(os.getenv('MYSQL_DATABASE'))
    #print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")  # Debugging line

    db.init_app(app)

    with app.app_context():
        from .models import User

        db.create_all()

        return app
