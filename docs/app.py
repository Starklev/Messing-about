from flask import Flask, request, jsonify, render_template, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required, current_user
from project import create_app, db
from project.models import User, Find

app = create_app()


@app.route('/', methods=['GET'])
def home():
    return render_template('index2.html')

@app.route('/about', methods=['GET'])
def about():
    return jsonify({'message': 'About Us'})

@app.route('/contact', methods=['GET'])
def contact():
    return jsonify({'message': 'Contact Us'})

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username'].strip()
        email = request.form['email'].strip().lower()
        password = request.form['password']

        if not username or not email or not password:
            flash('All fields are required.')
            return render_template('register.html')

        existing = User.query.filter(
            (User.username == username) | (User.email == email)
        ).first()
        if existing:
            flash('That username or email is already in use.')
            return render_template('register.html')

        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username'].strip()
        password = request.form['password']

        user = User.query.filter_by(username=username).first()
        if user is None or not user.check_password(password):
            flash('Invalid username or password.')
            return render_template('login.html')

        login_user(user)
        return redirect(url_for('home'))

    return render_template('login.html')


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('home'))

@app.route('/api/finds', methods=['GET'])
def get_finds():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Login required'}), 401

    finds = Find.query.filter_by(user_id=current_user.id).order_by(Find.id.desc()).all()
    return jsonify([
        {'id': f.id, 'latitude': float(f.latitude),
         'longitude': float(f.longitude), 'label': f.label}
        for f in finds
    ])


@app.route('/api/finds', methods=['POST'])
def add_find():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Login required'}), 401

    data = request.get_json(silent=True) or {}
    try:
        lat = float(data['latitude'])
        lon = float(data['longitude'])
    except (KeyError, TypeError, ValueError):
        return jsonify({'error': 'Latitude and longitude must be numbers.'}), 400

    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        return jsonify({'error': 'Coordinates out of range.'}), 400

    label = (data.get('label') or '').strip()[:200]
    find = Find(user_id=current_user.id, latitude=lat, longitude=lon, label=label or None)
    db.session.add(find)
    db.session.commit()
    return jsonify({'id': find.id, 'latitude': lat, 'longitude': lon}), 201

if __name__ == '__main__':
    app.run(debug=True)
