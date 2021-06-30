if (!firebase.apps.length){
    console.log('INITIALIZED');
    const firebaseConfig = {
        apiKey: "AIzaSyA2t7hqYOtJ6wjCZR5KF3BLdTl3J5yzGTs",
        authDomain: "attend-bdba5.firebaseapp.com",
        databaseURL: "https://attend-bdba5-default-rtdb.firebaseio.com",
        projectId: "attend-bdba5",
        storageBucket: "attend-bdba5.appspot.com",
        messagingSenderId: "375220042404",
        appId: "1:375220042404:web:1378a5cfa7a3a6cd3a4431",
        measurementId: "G-M7JNTSCEEH"
      };
    firebase.initializeApp(firebaseConfig);
  }
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
  const db = firebase.database();
  const firestore = firebase.firestore();
  const storage = firebase.storage()
  const functions = firebase.functions();