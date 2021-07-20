const baseURL = window.origin;
var loadTimestamp = new Date();
window.onload = function(){
    console.log('Loaded');
}

function ValidateInput(val, button){
    button.disabled = (val.length == 0);
}

function GenerateSession(class_title, session_title){
    navigator.geolocation.getCurrentPosition(function(pos){
        console.log(pos);
        let req = new XMLHttpRequest();
        req.open('POST', baseURL + '/room-create');
        req.setRequestHeader('Content-Type', 'application/json');
        req.send(JSON.stringify({'teacher_id':firebase.auth().currentUser.uid,'class_name' : class_title, 'lat':pos.coords.latitude, 'long':pos.coords.longitude, 'session_title':session_title}))
    });
}

function ListenForSession(user, classID){
    let sessionCodeListener = firestore.collection('classes').doc(user.uid).onSnapshot((snap) => {
        console.log('Appropriate session found: ');

        console.log(snap.data()['time_created'].toDate() > loadTimestamp);
        if(snap.data()['time_created'].toDate() > loadTimestamp){
            storage.ref(user.uid + '/' + snap.data()['current_session'] + '.png').getDownloadURL().then(function(url){
                let codeWrapper = document.getElementById('session_code');
                codeWrapper.children[0].style.display = 'none';
                let qrImage = document.createElement('img');
                qrImage.src = url;
                qrImage.id = 'qr_image';
                codeWrapper.appendChild(qrImage);
                ListenForAttendance(user, classID, snap.data()['current_session']);
                document.getElementById('roster_divider').style.display = 'block';
                sessionCodeListener();
            });
        }
        
    });
}

function ListenForAttendance(user, classID, sessionID){

    let studentAttendanceRecords = [];
    var rosterHolder;
    db.ref('classes/' + user.uid + '/' + classID + '/sessions/' + sessionID + '/status').get().then(initialConfig => {
        document.getElementById('session_view').appendChild(document.createElement('hr'))
        rosterHolder = document.getElementById('roster_container')
        initialConfig.forEach(function(studentConfig){
            let studentUID = studentConfig.key;
            let studentName = studentConfig.val().name;
            let studentWrapper = document.createElement('div');
            studentWrapper.classList.add('roster_slot');
            let studentStatus = document.createElement('span')
            studentStatus.classList.add('student_status');
            studentStatus.innerHTML = studentName + ' : <span style="color:red">ABSENT</span>';
            studentStatus.setAttribute('presence', false);
            studentAttendanceRecords[studentUID] = studentStatus;
            studentWrapper.appendChild(studentStatus);
            studentWrapper.addEventListener('click', function(){
                db.ref('classes/' + user.uid + '/' + classID + '/sessions/' + sessionID + '/status/' + studentUID + '/present').set(!(studentStatus.getAttribute('presence') == "true"));
                
            })
            rosterHolder.appendChild(studentWrapper);
        })
    })
    let attendanceListener = db.ref('classes/' + user.uid + '/' + classID + '/sessions/' + sessionID).on('child_changed', changedVal => {
        if(changedVal.key == 'status'){
            changedVal.forEach(function(studentConfig){
                let studentUID = studentConfig.key;
                let studentName = studentConfig.val().name;
                let presence = studentConfig.val().present;
                studentAttendanceRecords[studentUID].setAttribute('presence',presence);
                studentAttendanceRecords[studentUID].innerHTML = studentName + ' : ' + (presence?'<span style="color:green">PRESENT</span>':'<span style="color:red">ABSENT</span>');
            });
        }
    });

    document.getElementById('terminate_session_button').disabled = false;
    document.getElementById('terminate_session_button').addEventListener('click', function() {
        db.ref('classes/' + user.uid + '/' + classID + '/sessions/' + sessionID).off('child_changed', attendanceListener);
        document.getElementById('roster_divider').style.display = 'none';
        document.getElementById('qr_image').remove();
        document.getElementById('session_code').children[0].style.display = 'block';
        document.getElementById('session_view').style.display = 'none'
    })
}


function ShowClassDetails(user, class_title, class_details){

    document.getElementById('session_start_button').addEventListener('click',function(){
        let currentTime = new Date();
        let date = currentTime.toDateString().split(' ');
        let sessionID = `Session of ${date[0]}, ${date[2]} ${date[1]}`
        GenerateSession(class_title, sessionID + ` (${currentTime.getHours()%12}:${(currentTime.getMinutes() < 10)? ('0' + currentTime.getMinutes()):currentTime.getMinutes()} ${(currentTime.getHours() < 12)?'AM':'PM'})`);
        ListenForSession(user, class_title);
        document.getElementById('session_title').innerHTML = class_title + ' with ' + user.displayName;
        document.getElementById('session_subtitle').innerHTML = sessionID;
        document.getElementById('session_view').style.display = 'block';
        document.getElementById('class_details').style.display = 'none';


    });
    
    
    document.getElementById('class_title_details').innerHTML = class_title;
    let prevStudentRecords = {}
    class_details.child('roster').forEach(function(student){
        prevStudentRecords[student.key] = {'name':student.val(), 'abscences':0}
    })
    
    let selection_pane = document.getElementById('past_sessions_select');
    class_details.child('sessions').forEach(function(session){
        let new_option = document.createElement('option');
        new_option.value = session.key;
        new_option.innerHTML = session.child('title').val();
        selection_pane.insertBefore(new_option, selection_pane.firstChild);
        session.child('status').forEach(function(record){
            if(record.child('present') == false){
                prevStudentRecords[record.key].abscences += 1;
            }
        })
    })
    
    let studentHealthWrapper = document.getElementById('student_health');
    for(let student of Object.values(prevStudentRecords)){
        let attendance_holder = document.createElement('div');
        attendance_holder.classList.add('previous_record')
        let attendance_record = document.createElement('span');
        let attendance_verdict = document.createElement('span');
        attendance_verdict.innerHTML = student.abscences;
        attendance_verdict.style.color = (student.abscences > 0)?'green':'red';
        attendance_record.innerHTML = student.name + " : " + attendance_verdict.outerHTML;
        attendance_holder.appendChild(attendance_record);
        studentHealthWrapper.appendChild(attendance_holder);
    }
    
    
    let pastView = document.getElementById('past_session_attendance_data');
    selection_pane.addEventListener('change', (e) => {
        console.log(e.target.value);
        while(pastView.children.length > 0){
            pastView.removeChild(pastView.firstChild);
        }
        class_details.child('sessions').child(e.target.value).child('status').forEach(function(record){
            let attendance_holder = document.createElement('div');
            attendance_holder.classList.add('previous_record')
            let attendance_record = document.createElement('span');
            let attendance_verdict = document.createElement('span');
            console.log([record.val()['name'], record.val()['present']]);
            attendance_verdict.innerHTML = (record.val()['present'])?'Present':'Absent';
            attendance_verdict.style.color = (record.val()['present'])?'green':'red';
            attendance_record.innerHTML = record.val()['name'] + " : " + attendance_verdict.outerHTML;
            attendance_holder.appendChild(attendance_record);
            pastView.appendChild(attendance_holder);
        })
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
                                ShowClassDetails(user, classID, class_listing);
                                document.getElementById('class_selection').style.display = 'none';
                                document.getElementById('class_details').style.display = 'block';
                            });
                        });
                        document.getElementById('professor_view').style.display = 'block';
                        document.getElementById('login_notice').style.display = 'none';                    
                })
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