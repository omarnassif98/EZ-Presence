from flask import Flask, render_template, request
from qrManager import MakeQRCode
from threading import Thread

app = Flask(__name__)
@app.route("/")
def landing_page():
    return render_template('dashboard.html')

@app.route('/landing')
def TRASH():
    return render_template("landing_page.html")

@app.route('/room-create', methods=['POST'])
def GenerateRoomData():
    body = request.get_json()
    print(body)
    Thread(target=MakeQRCode, args=(body['teacher_id'], body['class_name'], body['long'], body['lat'])).start()
    return '', 200