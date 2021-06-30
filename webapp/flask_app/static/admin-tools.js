var currentToolFocus;
let professor_buttons = {}
let student_buttons = {}

var focusedProfessor = null;
var focusedStudents = {};
window.onload = function(){
    currentToolFocus = document.getElementById('user_create');
}

function addProfessorButton(uid, name){
    let professor_carousel = document.getElementById('professor_selection');
    let wrapperButton = document.createElement('div');
    wrapperButton.setAttribute('selected', false);
    wrapperButton.classList.add('selection_button');
    wrapperButton.addEventListener('click', function(){
        console.log('clicked on it');
        if(wrapperButton.getAttribute('selected') == 'true'){
            focusedProfessor = null;
            wrapperButton.setAttribute('selected', false);
            wrapperButton.style.backgroundColor = 'honeydew';
        }else{
            try{
                let old_focus_button = professor_buttons[focusedProfessor];
                old_focus_button.setAttribute('selected',false);
                old_focus_button.style.backgroundColor = 'honeydew';
            }catch(e){}
            focusedProfessor = uid;
            wrapperButton.setAttribute('selected', true);
            wrapperButton.style.backgroundColor = 'lightsteelblue';
        }
    })
    let textInButton = document.createElement('span');
    textInButton.innerHTML = name;
    textInButton.style.fontSize = '14px';
    wrapperButton.appendChild(textInButton);
    professor_carousel.appendChild(wrapperButton);
    professor_buttons[uid] = wrapperButton;
}

function addStudentButton(uid, name){
    let student_carousel = document.getElementById('student_selection');
    let wrapperButton = document.createElement('div');
    wrapperButton.setAttribute('selected', false);
    wrapperButton.classList.add('selection_button');
    wrapperButton.addEventListener('click', function(){
        if(wrapperButton.getAttribute('selected') == 'true'){
            delete focusedStudents[uid];
            wrapperButton.setAttribute('selected', false);
            wrapperButton.style.backgroundColor = 'honeydew';
        }else{
            focusedStudents[uid] = name;
            wrapperButton.setAttribute('selected', true);
            wrapperButton.style.backgroundColor = 'lightsteelblue'
        }
    })
    let textInButton = document.createElement('span');
    textInButton.innerHTML = name;
    textInButton.style.fontSize = '14px';
    wrapperButton.appendChild(textInButton);
    student_carousel.appendChild(wrapperButton);
    student_buttons[uid] = wrapperButton;
}

function populateCarousels(){
    firestore.collection('professor_users').get().then(snapshot =>{
        snapshot.forEach(doc => {
            let data = doc.data();
            addProfessorButton(doc.id, data.fname)
        })
    })

    firestore.collection('student_users').get().then(snapshot =>{
        snapshot.forEach(doc => {
            let data = doc.data();
            addStudentButton(doc.id, data.fname)
        })
    })
}

firebase.auth().onAuthStateChanged((user) => {
    let login_notice = document.getElementById('login_notice');
    let tool_display = document.getElementById('admin_tools');
    if (user) {
        user.getIdTokenResult().then(records =>
            {
                console.log(records.claims.role);
                if(records.claims.role == 'admin'){
                    switchVisability(login_notice, tool_display, 'flow-root');
                    populateCarousels();
                }
            });
    }else{
        switchVisability(tool_display, login_notice);
    }
});

function switchToolFocus(newFocus){
    console.log(newFocus);
    let newToolFocus = document.getElementById(newFocus);
    switchVisability(currentToolFocus, newToolFocus, 'flex');
    currentToolFocus = newToolFocus;
}

function switchVisability(currently_visible_object, currently_invisible_object, new_display_type = 'block'){
    currently_visible_object.style.display = 'none';
    currently_invisible_object.style.display = new_display_type;
}

function CreateUserAccount(){
    let elements = document.getElementById('user_create').querySelectorAll('input, select');
    user_parameters = {};
    for(var i = 0; i < elements.length; i++){
        let inputField = elements[i];
        let fieldName = inputField.name.split('_')[2];
        let val = inputField.value;
        user_parameters[fieldName] = val;
        if(val == ""){
            console.error('YO WHAT THE HELL, INVALID ' + fieldName);
            return;
        }
    }
    console.log(user_parameters);
    let creationFunction = functions.httpsCallable('createUser');
    creationFunction(user_parameters).then((result) => {
        console.log(result.data);
        if (result.data.new_user_uid){
            alert('Created user: ' + user_parameters.fname);
            firestore.collection(`${user_parameters.role}_users`).doc(result.data.new_user_uid).set({fname:user_parameters.fname, classes:[]})
        }
        switch (user_parameters.role) {
            case 'student':
                addStudentButton(result.data.new_user_uid, user_parameters.fname);
                break;
            case 'professor':
                addProfessorButton(result.data.new_user_uid, user_parameters.fname);
                break;
        }
    });
}

function CreateClass(){
    let class_name = document.querySelector('input[name="class_create_name"]').value;
    db.ref('classes/' + focusedProfessor + '/' + class_name + '/roster').set(focusedStudents).then(() => {
        alert('Class created');
    })
}