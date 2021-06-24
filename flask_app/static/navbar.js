var currentFocus = null;

window.addEventListener('load', () => {
    let nav = document.getElementById('navbar');
    console.log(nav);
    console.log([...nav.children]);
    [...nav.children].forEach(child => {
        console.log(child.classList);
        if(child.classList.contains('dropdown_field')){
            child.addEventListener('click', () => {
                let newFocus = child.querySelector('.dropdown_content');
                ChangeFocus(newFocus);
            });
        };
    });
});

function ChangeFocus(newFocus){
        if(currentFocus){
            currentFocus.style.display = 'none';
        }
        if(newFocus){
            newFocus.style.display = 'block';
        }
        currentFocus = newFocus;
}

firebase.auth().onAuthStateChanged((user) => {
    ChangeFocus(null);
    if (user) {
        document.getElementById('profile_name').innerHTML = user.email;
        document.getElementById('login_dropdown').style.display =  'none';
        document.getElementById('profile_dropdown').style.display =  'block';
    }else{
        document.getElementById('login_dropdown').style.display =  'block';
        document.getElementById('profile_dropdown').style.display =  'none';
    }
  });

function LogUserIn(loginWrapper){
    console.log(loginWrapper);
    let email = loginWrapper.querySelector('#Email').value;
    let pass = loginWrapper.querySelector('#Pass').value;
    ChangeFocus(null);
    firebase.auth().signInWithEmailAndPassword(email, pass);
}

function LogUserOut(){
    ChangeFocus(null);
    firebase.auth().signOut();
}


