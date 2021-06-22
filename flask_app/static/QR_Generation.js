const baseURL = window.origin;
window.onload = function(){
    console.log('Loaded');
}

function ValidateInput(val, button){
    button.disabled = (val.length == 0);
}

function GenerateSession(sessionTitle){
    navigator.geolocation.getCurrentPosition(function(pos){
        console.log(pos);
        let req = new XMLHttpRequest();
        req.open('POST', baseURL + '/room-create');
        req.setRequestHeader('Content-Type', 'application/json');
        req.send(JSON.stringify({'teacher_id':firebase.auth().currentUser.uid,'class_name' : sessionTitle, 'lat':pos.coords.latitude, 'long':pos.coords.longitude}))
        req.onreadystatechange = function(){
            if(req.readyState===XMLHttpRequest.DONE){
                console.log('Atleast its ready');
            }
        }
    });
}

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
       db.ref('user_roles/' + user.uid).get().then(function(role){
            if (role.val() == 'professor'){
                db.ref('classes/' + user.uid).get().then(function(classes){
                    let class_area = document.getElementById('class_collection');
                    classes.forEach(function(class_listing){
                            let wrapperButton = document.createElement('div');
                            wrapperButton.classList.add('class_wrapper');
                            let class_title = document.createElement('h3');
                            class_title.innerHTML = class_listing.key;
                            wrapperButton.appendChild(class_title);
                            class_area.appendChild(wrapperButton);
                            wrapperButton.addEventListener('click', function(){
                                GenerateSession(class_listing.key);
                                document.getElementById('session_view').children[0].innerHTML = class_listing.key;
                                document.getElementById('session_view').style.display = 'block';
                                document.getElementById('session_creation').style.display = 'none';
                            });
                        });
                        document.getElementById('session_creation').style.display = 'block';
                        document.getElementById('login_notice').style.display = 'none';                    
                }).then(function(){
                    firestore.collection('classes').doc(user.uid).onSnapshot((snap) => {
                        storage.ref(user.uid + '/' + snap.data()['session_ID'] + '.png').getDownloadURL().then(function(url){
                            let codeWrapper = document.getElementById('session_code');
                            codeWrapper.children[0].style.display = 'none';
                            let qrImage = document.createElement('img');
                            qrImage.src = url;
                            codeWrapper.appendChild(qrImage);
                        });
                    });
                });
            }else{
                document.getElementById('login_notice').children[0].innerHTML = 'Only professors have permission to began class sessions';
            }
        });
        
    }else{
        document.getElementById('login_notice').style.display =  'block';
        document.getElementById('session_creation').style.display =  'none';
    }
  });