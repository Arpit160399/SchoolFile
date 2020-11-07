window.onload = function() {
//firebase.auth().settings.appVerificationDisabledForTesting = true;

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
      window.webkit.messageHandlers.loading.postMessage("start");
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
               window.webkit.messageHandlers.loading.postMessage("stop");
          }).catch(function (error) {
            // Error; SMS not sent
            console.error('Error during signInWithPhoneNumber', error);
            window.alert('Error during signInWithPhoneNumber:\n\n'
                + error.code + '\n\n' + error.message);
            window.signingIn = false;
             window.webkit.messageHandlers.loading.postMessage("stop");
            updateSignInButtonUI();
          });
    }
}

	  /**
   * Function called when clicking the "Verify Code" button.
   */
  function onVerifyCodeSubmit(e) {
    e.preventDefault();
     window.webkit.messageHandlers.loading.postMessage("start");
    if (!!getCodeFromUserInput()) {
      window.verifyingCode = true;
      updateVerifyCodeButtonUI();
      var code = getCodeFromUserInput();
      confirmationResult.confirm(code).then(function (result) {
        // User signed in successfully.
        window.verifyingCode = false;
        window.confirmationResult = null;
        window.webkit.messageHandlers.loading.postMessage("stop");
        setUserName()
      }).catch(function (error) {
        // User couldn't sign in (bad verification code?)
         window.webkit.messageHandlers.loading.postMessage("stop");
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
    var phoneNumber = getPhoneNumberFromUserInput();
    return patternVaildater(phoneNumber)
  }

  function patternVaildater(phoneNumber){
     var pattern = /^\+[0-9\s\-\(\)]+$/;
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
     window.webkit.messageHandlers.loading.postMessage("start");
    if (firebase.auth().currentUser != null){
        let uid = firebase.auth().currentUser.uid
        database.ref('users/' + uid).once('value').then(function(snapshot) {
            window.webkit.messageHandlers.loading.postMessage("stop");
        if (snapshot.val() === null ||snapshot.val().name === "" || snapshot.val().profile_picture === "") {
           setUpUsnameField();
        } else {
          setUpFileListing(snapshot.val());
        }
      });   
  }
}

//// profile Set UP Section

function setUpUsnameField() {
 document.getElementById("contentID").innerHTML = `
    <div style="margin: 20px 20px">
      <div class="form-group">
       <input type="file" class="form-control" accept="image/*" name="image" id="file"  onchange="loadFile(event)" style="display: none;">
        <label for="file" style="cursor: pointer;">Upload Image</label>
        <img class="rounded-circle" id="output" width="200" height="200"/>
        <label for="exampleInputEmail1" style="margin-top: 10px;">User Name</label>
        <input type="email" class="form-control" id="Name" type="text" aria-describedby="emailHelp">
        <small id="emailHelp" class="form-text text-muted">Enter your full Name</small>
      </div>
      <button type="submit" class="btn btn-primary " id="updateProfile">Set Up profile</button>
    </div>
 `;
 document.getElementById("updateProfile").addEventListener("click",saveUserData);
}

function updateButtonUI(state){
 document.getElementById("updateProfile").disabled = state
}

function loadFile(event) {
	var image = document.getElementById('output');
	image.src = URL.createObjectURL(event.target.files[0]);
};

function writeUserData(userId, name, phone, imageUrl) {
  updateButtonUI(true)
  database.ref('users/' + userId).set({
    Name: name,
    phone: phone,
    profile_picture : imageUrl
  },function(error) {
     window.webkit.messageHandlers.loading.postMessage("stop");
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

function saveUserData(){
   let filedName = document.getElementById('Name').value; 
   let user = firebase.auth().currentUser
   let file = getFile()
   let metaType = { contentType: file.type }
   window.webkit.messageHandlers.loading.postMessage("start");
   storageRef.ref().child(`userProfile/${user.uid}`).put(file,metaType).then(function(snapshot){
        snapshot.ref.getDownloadURL().then(function(downloadURL) {
         writeUserData(user.uid,filedName,user.phoneNumber,downloadURL)
      });
   },function(error){
     window.alert(error)
   }); 
}


function setUpFileListing(userData) {
   window.webkit.messageHandlers.loading.postMessage("start");
   setUpProfileHeader(userData)
}


/// File Listing section

function setUpProfileHeader(data){
   document.getElementById("contentID").innerHTML = `
   <div class="card" style="max-width: 100%; margin: 20px 20px;">
   <div class="card-body">
   <div class="row">
    <div class="col">
    <img src="${data.profile_picture}" class="rounded-circle" width="85" height="85"/>
    </div>
    <div class="col">
    <h5 class="card-title">${data.Name}</h5>
    <p class="card-text"> phone Number: ${data.phone}</p>
    </div>
    </div>
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
  <label id="progress" style="text-align: center;"></label>
  <div class='row'>
  <div class='col'>
  <div class="input-group-prepend" style="max-width: 97%; margin: 20px 20px;">
    <div class="input-group-text">
    <label for="Input" style="padding-top: 8px;padding-right: 12px;max-width: 100%;"> Type   </label>
    <select class="custom-select" id="Type" aria-label="Example select with button addon">
    <option selected value="private">Private</option>
    <option value="public">Public</option>
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
  <div class="list-group" id="Shared" style="margin-bottom: 10px;"></div> 
  </div>
   `
   document.getElementById("inputGroupFileAddon01").addEventListener("click",UploadAction)
   let uid = firebase.auth().currentUser.uid
   listData('Public','public')
   listData('Private','private/'+ uid)
   listData('Shared','shared/'+ uid)
   window.webkit.messageHandlers.loading.postMessage("stop");
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
  });
   
}

function listData(type,path){
 let list = document.getElementById(type)
 list.appendChild(listItem("#",type,"active"))
  var commentsRef = firebase.database().ref().child(path);
  commentsRef.on('child_added', function(data) {
          if (type !== "Public") {
            list.appendChild(listItemPrivate(data.val().url,data.val().name)) 
          } else {      
          list.appendChild(listItem(data.val().url,data.val().name,""))  
        }
       },function(error){
     window.alert(error)
   }); 
}

function listItem(link,text,isactive){
   var a = document.createElement("li");
   a.style = 'display: grid;'
   a.className = "list-group-item list-group-item-action " + isactive
   a.innerHTML = text
  if (isactive === ""){
   let data = {link,text};
   a.appendChild(addActionButton("btn-secondary","Open",`openAction(${JSON.stringify(data)})`))
  }
   return a
}

function listItemPrivate(link,text){
   var a = document.createElement("li");
   a.style = 'display: grid;'
   a.className = "list-group-item"
   a.innerHTML = text
   let data = {link,text};
   a.appendChild(addActionButton("btn-secondary","Open",`openAction(${JSON.stringify(data)})`))
   a.appendChild(addActionButton("btn-info",'Share',`shareAction(${JSON.stringify(data)})`)) 
   return a
}

function addActionButton(className,title,Action){
  let button = document.createElement("button");
  button.style = "margin-top: 10px;";
  button.className = `btn ${className}`;
  button.innerHTML = title;
  button.setAttribute('onClick',Action);
  return button
}

  function shareAction(file){
    let phoneNumber = window.prompt("enter the phone Number to who you want to share file with");
       let userNumber = firebase.auth().currentUser.phoneNumber
    if (patternVaildater(phoneNumber)){
        if (phoneNumber !== userNumber ) {
       var Ref = firebase.database().ref().child('users');
        window.webkit.messageHandlers.loading.postMessage("start");
           Ref.orderByChild('phone').equalTo(phoneNumber).on('value', function(snapshot) {
              window.webkit.messageHandlers.loading.postMessage("stop");
             snapshot.forEach(function(data) {
              sendFileTo(data.key,file)
            });
         },function(error) {
          window.alert(error)
         })
        } else {
            window.alert("its your number")
        }
    } else {
      window.alert("invalid Number entered");
    }
  }

function sendFileTo(user,file){
 let ref = database.ref().child("shared/" + user)
  window.webkit.messageHandlers.loading.postMessage("start");
 let key = ref.push().key
   ref.child(key).set({
    name: file.text,
    url: file.link,
    created : Date.now()
  },function(error) {
    if (error) {
      window.alert(error)
      // The write failed...
    } else {
   
      // Data saved successfully!
    }
     window.webkit.messageHandlers.loading.postMessage("stop");
  });
}

function openAction(data){
    window.alert(data.text + " \ndownload: "+data.link)
    window.webkit.messageHandlers.openFile.postMessage(`${data.link}`);
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
