const baseURL = window.origin;
var loadTimestamp = new Date();
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
    });
}

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        var classID=null;
        user.getIdTokenResult().then(records => {
                console.log(records.claims.role);
                if(records.claims.role == 'professor'){
                db.ref('classes/' + user.uid).get().then(function(classes){
                    let class_area = document.getElementById('class_collection');
                    classes.forEach(function(class_listing){
                        classID = class_listing.key;
                            let wrapperButton = document.createElement('div');
                            wrapperButton.classList.add('class_wrapper');
                            let class_title = document.createElement('h3');
                            class_title.innerHTML = classID;
                            wrapperButton.appendChild(class_title);
                            class_area.appendChild(wrapperButton);
                            wrapperButton.addEventListener('click', function(){
                                GenerateSession(classID);
                                let date = (new Date()).toDateString().split(' ')
                                document.getElementById('session_title').innerHTML = classID + ' with ' + user.displayName;
                                document.getElementById('session_subtitle').innerHTML = `Session of ${date[0]}, ${date[2]} ${date[1]}`;
                                document.getElementById('session_view').style.display = 'block';
                                document.getElementById('session_creation').style.display = 'none';
                            });
                        });
                        document.getElementById('session_creation').style.display = 'block';
                        document.getElementById('login_notice').style.display = 'none';                    
                }).then(function(){
                    firestore.collection('classes').doc(user.uid).onSnapshot((snap) => {

                        console.log('Appropriate session found: ' + snap.data()['time_created'].toDate() > loadTimestamp);

                        if(snap.data()['time_created'].toDate() > loadTimestamp){
                            storage.ref(user.uid + '/' + snap.data()['current_session'] + '.png').getDownloadURL().then(function(url){
                                let codeWrapper = document.getElementById('session_code');
                                codeWrapper.children[0].style.display = 'none';
                                let qrImage = document.createElement('img');
                                qrImage.src = url;
                                codeWrapper.appendChild(qrImage);
                                console.log('classes/' + user.uid + '/' + classID + '/sessions/' + snap.data()['current_session']);
                                let studentAttendanceRecords = [];
                                var rosterHolder;
                                db.ref('classes/' + user.uid + '/' + classID + '/sessions/' + snap.data()['current_session'] + '/status').get().then(initialConfig => {
                                    document.getElementById('session_view').appendChild(document.createElement('hr'))
                                    rosterHolder = document.getElementById('session_view').appendChild(document.createElement('div'))
                                    rosterHolder.classList.add('roster_holder')
                                    initialConfig.forEach(function(studentConfig){
                                        let studentUID = studentConfig.key;
                                        let studentName = studentConfig.val().name;
                                        let studentWrapper = document.createElement('div');
                                        studentWrapper.classList.add('roster_slot');
                                        let studentStatus = document.createElement('span')
                                        studentStatus.classList.add('student_status');
                                        studentStatus.innerHTML = studentName + ' : <span style="color:red">ABSENT</span>';
                                        studentAttendanceRecords[studentUID] = studentStatus;
                                        studentWrapper.appendChild(studentStatus);
                                        rosterHolder.appendChild(studentWrapper);
                                    })
                                })

                                db.ref('classes/' + user.uid + '/' + classID + '/sessions/' + snap.data()['current_session']).on('child_changed', changedVal => {
                                    if(changedVal.key == 'status'){
                                        changedVal.forEach(function(studentConfig){
                                            let studentUID = studentConfig.key;
                                            let studentName = studentConfig.val().name;
                                            let presence = studentConfig.val().present;
                                            studentAttendanceRecords[studentUID].innerHTML = studentName + ' : ' + (presence?'<span style="color:green">PRESENT</span>':'<span style="color:red">ABSENT</span>');
                                        });
                                    }
                                });


                            });
                        }
                    });
                });
            }else{
                console.log('yoo');
                document.getElementById('login_notice').children[0].innerHTML = 'Only professors have permission to began class sessions';
            }
        });
        
    }else{
        document.getElementById('login_notice').style.display =  'block';
        document.getElementById('session_creation').style.display =  'none';
    }
  });