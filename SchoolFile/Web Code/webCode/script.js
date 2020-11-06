window.onload = function() {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        var uid = user.uid;
        var phoneNumber = user.phoneNumber;
        var displayName = user.displayName;
        
      }
   
});
//firebase.auth().settings.appVerificationDisabledForTesting = true;
//


window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier("btn-sign", {
      'size': 'invisible',
      'callback': function(response) {
        window.alert(response)
        // reCAPTCHA solved, allow signInWithPhoneNumber.
       onSignInSubmit()
      }
    });

recaptchaVerifier.render().then(function(widgetId) {
      window.recaptchaWidgetId = widgetId;
      updateSignInButtonUI();
    });

    document.getElementById("btn-sign").addEventListener("click",onSignInSubmit);
    document.getElementById('phoneNumber').addEventListener('change', updateSignInButtonUI);
    document.getElementById('phoneNumber').addEventListener('keyup', updateSignInButtonUI);
};

  function resetReCaptcha() {
    if (typeof grecaptcha !== 'undefined'
        && typeof window.recaptchaWidgetId !== 'undefined') {
      grecaptcha.reset(window.recaptchaWidgetId);
    }
  }

function onSignInSubmit() {
  if (isPhoneNumberValid()) {
      window.signingIn = true;
      updateSignInButtonUI();
      var phoneNumber = getPhoneNumberFromUserInput();
      var appVerifier = window.recaptchaVerifier;
      	      firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
          .then(function (confirmationResult) {
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).
            window.confirmationResult = confirmationResult;
            window.signingIn = false;
            updateSignInButtonUI();
              setUPVerificationFiled()
          }).catch(function (error) {
            // Error; SMS not sent
            console.error('Error during signInWithPhoneNumber', error);
            window.alert('Error during signInWithPhoneNumber:\n\n'
                + error.code + '\n\n' + error.message);
            window.signingIn = false;
            updateSignInButtonUI();
          });
    }
}

	  /**
   * Function called when clicking the "Verify Code" button.
   */
  function onVerifyCodeSubmit(e) {
    e.preventDefault();
    if (!!getCodeFromUserInput()) {
      window.verifyingCode = true;
      updateVerifyCodeButtonUI();
      var code = getCodeFromUserInput();
      confirmationResult.confirm(code).then(function (result) {
        // User signed in successfully.
        window.verifyingCode = false;
        window.confirmationResult = null;
        setUserName()
      }).catch(function (error) {
        // User couldn't sign in (bad verification code?)
        console.error('Error while checking the verification code', error);
        window.alert('Error while checking the verification code:\n\n'
            + error.code + '\n\n' + error.message);
        window.verifyingCode = false;
        updateSignInButtonUI();
        updateVerifyCodeButtonUI();
      });
    }
  }

  function setUPVerificationFiled(){
  document.getElementById('verifyingCodeSection').innerHTML = `
   <div style="margin: 20px 20px">
    <div class="form-group">
        <label for="exampleInputEmail1">Verification Code</label>
        <input type="email" class="form-control" id="verification-code" type="text" pattern="\+[0-9\s\-\(\)]+" id="" aria-describedby="emailHelp">
        <small id="emailHelp" class="form-text text-muted">Verify The Otp Send On Number</small>
      </div>
      <button type="submit" class="btn btn-primary " id="verify-code-button" disabled='true'>Verify</button>
    </div>
    </div>
    </div>
  `
    document.getElementById('verification-code').addEventListener('change', updateVerifyCodeButtonUI);
    document.getElementById('verification-code').addEventListener('keyup', updateVerifyCodeButtonUI);
    document.getElementById('verify-code-button').addEventListener('click', onVerifyCodeSubmit);
  }  

  function isPhoneNumberValid() {
    var pattern = /^\+[0-9\s\-\(\)]+$/;
    var phoneNumber = getPhoneNumberFromUserInput();
    return phoneNumber.search(pattern) !== -1;
  }


  function getCodeFromUserInput() {
    return document.getElementById('verification-code').value;
  }

  function getPhoneNumberFromUserInput() {
    return document.getElementById('phoneNumber').value;
  }

  function updateVerifyCodeButtonUI() {
    document.getElementById('verify-code-button').disabled =
        !!window.verifyingCode
        || !getCodeFromUserInput();
  }

  function updateSignInButtonUI() {
    document.getElementById('btn-sign').disabled =
        !isPhoneNumberValid()
        || !!window.signingIn;
  }


  function setUserName(){
    if (firebase.auth().currentUser != null){
        let uid = firebase.auth().currentUser.uid
        database.ref('users/' + uid).once('value').then(function(snapshot) {
        if (snapshot.val() == null) {
          setUpUsnameField();
        } else {
          setUpFileListing(snapshot.val());
        }
      });   
  }
}

function updateButtonUI(state){
 document.getElementById("inputGroupFileAddon01").disabled = state
}


function writeUserData(userId, name, phone, imageUrl) {
  updateButtonUI(true)
  database.ref('users/' + userId).set({
    Name: name,
    phone: phone,
    profile_picture : imageUrl
  },function(error) {
    if (error) {
      window.alert(error)
      // The write failed...
    } else {
       setUserName()
      // Data saved successfully!
    }
      updateButtonUI(false)
  });
}

function setUpUsnameField() {
 document.getElementById("contentID").innerHTML = `
    <div style="margin: 20px 20px">
      <div class="form-group">
        <label for="exampleInputEmail1">User Name</label>
        <input type="email" class="form-control" id="Name" type="text" aria-describedby="emailHelp">
        <small id="emailHelp" class="form-text text-muted">Enter your full Name</small>
      </div>
      <button type="submit" class="btn btn-primary " id="updateProfile">Set Up profile</button>
    </div>
 `;
 document.getElementById("updateProfile").addEventListener("click",saveUserData);
}

function saveUserData(){
   let filedName = document.getElementById('Name').value; 
   let user = firebase.auth().currentUser
   console.log(user)
   writeUserData(user.uid,filedName,user.phoneNumber,"")
}


function setUpFileListing(userData) {
   setUpProfileHeader(userData)
}


function setUpProfileHeader(data){
   document.getElementById("contentID").innerHTML = `
   <div class="card" style="max-width: 100%; margin: 20px 20px;">
   <div class="card-body">
    <h5 class="card-title">${data.Name}</h5>
    <p class="card-text"> phone Number: ${data.phone}</p>
  </div>
</div>
<div class="input-group mb-3" style="max-width: 87%; margin: 20px 20px;">
  <div class="input-group-prepend">
    <span class="input-group-text" id="inputGroupFileAddon01">Upload</span>
  </div>
  <div class="custom-file">
    <input type="file" class="custom-file-input" id="inputGroupFile01" aria-describedby="inputGroupFileAddon01">
    <label class="custom-file-label" for="inputGroupFile01">Choose file</label>
  </div>
 </div>
  <label id="progress" class="text-centre"></label>
  <div class='row'>
  <div class='col'>
  <div class="input-group-prepend" style="max-width: 97%; margin: 20px 20px;">
    <div class="input-group-text">
    <label for="Input" style="padding-top: 8px;padding-right: 12px;max-width: 100%;"> Type   </label>
    <select class="custom-select" id="Type" aria-label="Example select with button addon">
    <option selected value="private">Private</option>
    <option value="public">public</option>
    </select>
    </div>
  </div>
  </div>
  <div class='col' style="max-width: 97%; margin: 20px 20px;">
  <button type="button" class="btn btn-danger" onClick='onSignOutClick()'>Log Out</button>
  </div>
  </div>
  <div id="list" style="padding: 21px;">
  <div class="list-group" id="Public" style="margin-bottom: 10px;"></div>
  <div class="list-group" id="Private" style="margin-bottom: 10px;"></div> 
  </div>
   `
   document.getElementById("inputGroupFileAddon01").addEventListener("click",UploadAction)
   let uid = firebase.auth().currentUser.uid
   listData('Public','public')
   listData('Private','private/'+ uid)
}

function getFile(){
return document.querySelector('input[type="file"]').files[0];
}

function UploadAction(){
   let uid = firebase.auth().currentUser.uid;
   let file = getFile()
   let fileName = file.name;
   let metaType = { contentType: file.type }
   let upload =  storageRef.ref().child(`${uid}/${fileName}`).put(file,metaType); 
   upload.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
  function(snapshot) {
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    let element = document.getElementById('progress')
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    element.innerHTML = `uploaded ${progress}%`
    switch (snapshot.state) {
      case firebase.storage.TaskState.PAUSED: // or 'paused'
        console.log('Upload is paused');
        break;
      case firebase.storage.TaskState.RUNNING: // or 'running'
        console.log('Upload is running');
        break;
    }
    },function(error){
        window.alert(error)
    },function(){
        upload.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                  saveFileDatainBase(fileName,downloadURL)
        });
    })
}

function saveFileDatainBase(fileName,url){
   let type = document.getElementById('Type').value
   let userId = firebase.auth().currentUser.uid
   let ref = database.ref().child(`${type}/` + userId)
   if ("public" == type) {
     ref = database.ref().child(`public`)
   }
  let key = ref.push().key
   ref.child(key).set({
    name: fileName,
    url: url,
    created : Date.now()
  },function(error) {
    if (error) {
      window.alert(error)
      // The write failed...
    } else {
       setUserName()
      // Data saved successfully!
    }
      updateButtonUI(false)
  });
   
}

function listData(type,path){
 let list = document.getElementById(type)
 list.appendChild(listItem("#",type,"active"))
  var commentsRef = firebase.database().ref().child(path);
  commentsRef.on('child_added', function(data) {
         list.appendChild(listItem(data.val().url,data.val().name,""))  
  },function(error){
     window.alert(error)
   }); 
}

function listItem(link,text,isactive){
   var a = document.createElement("a");
   a.className = "list-group-item list-group-item-action " + isactive
   a.innerHTML = text
   a.setAttribute('href',link)
   return a
}

function onSignOutClick() {
    firebase.auth().signOut();
    document.getElementById("contentID").innerHTML = `
      <div style="margin: 20px 20px">
      <div class="form-group">
        <label for="exampleInputEmail1">Phone Number</label>
        <input type="email" class="form-control" id="phoneNumber" type="text" pattern="\+[0-9\s\-\(\)]+"  aria-describedby="emailHelp">
        <small id="emailHelp" class="form-text text-muted">Enter your phone number...</small>
      </div>
      <button type="submit" class="btn btn-primary " id="btn-sign">Send Code</button>
    </div>
    <div id="verifyingCodeSection"></div>`
  }