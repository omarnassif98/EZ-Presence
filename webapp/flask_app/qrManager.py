import qrcode
import firebase_admin
from firebase_admin import credentials, storage, firestore, db
from io import BytesIO
from os import path

firebase_cred = credentials.Certificate(path.join(path.dirname(__file__), 'firebase_admin_object.json'))

firebase_admin.initialize_app(
    firebase_cred,
    {
        'storageBucket':'attend-bdba5.appspot.com',
        'databaseURL':'https://attend-bdba5-default-rtdb.firebaseio.com/'
    }
    )

storage_bucket = storage.bucket()
firestore_client = firestore.client()

def MakeQRCode(tID, className, sessionTitle, long, lat):
    class_roster = db.reference('classes/' + tID + '/' + className + '/roster').get()
    rosterStatus = {}
    for key, val in class_roster.items():
        rosterStatus[key] = {'present':False, 'name':val}
    sessionID = db.reference('classes/' + tID + '/' + className + '/sessions').push({'in_session':True, 'title':sessionTitle, 'status':rosterStatus}).key
    blob = storage_bucket.blob(tID + '/' + sessionID + '.png')
    img = BytesIO()
    qrcode.make("{0}|{1}|{2}".format(tID, className, lat)).save(img, format='png')
    blob.upload_from_string(img.getvalue(), 'image/png')

    firestore_client.collection(u'classes').document(tID).set({'current_session':sessionID, 'time_created':firestore.firestore.SERVER_TIMESTAMP})
    print('GENERATED')

