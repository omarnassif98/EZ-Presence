var currentPrompt = document.getElementById('login_notice');
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        user.getIdTokenResult().then(records =>
            {
                switch (records.claims.role) {
                    case 'professor':
                        document.getElementById('professor_prompt').querySelector('span').innerHTML = user.displayName;
                        switchPrompt(document.getElementById('professor_prompt'));
                        break;
                    case 'admin':
                        document.getElementById('admin_prompt').querySelector('span').innerHTML = user.displayName;
                        switchPrompt(document.getElementById('admin_prompt'));
                        break;
                }
            });
    }else{
        switchPrompt(document.getElementById('login_prompt'));
        }
});

function switchPrompt(newPrompt){
    try{
    currentPrompt.style.display = 'none';
    }catch(err){}
    newPrompt.style.display = 'block';
    currentPrompt = newPrompt;
}
