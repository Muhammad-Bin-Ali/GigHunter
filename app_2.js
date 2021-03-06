$(".profile-div").fadeOut(0);
$(".vendor-detail-wrapper").fadeOut(0);
$(".profile-div").fadeOut(0);
$(".map-page").fadeOut(0);
const Locations = [];
const Gigs = [];
document.addEventListener("DOMContentLoaded", event => {
   
    const app = firebase.app();
    const auth = firebase.auth();
    auth.onAuthStateChanged(user => {
        if (user) {
            $('.signOut').show();
            $('.googleAuth').hide();
            checkIfExistsorCreateProfile(user)
            getUserProfilePic(user);
        }
        else {
            $('.googleAuth').show();
            $('.signOut').hide();
        }
    })
    getVendors()
}); 

async function getVendors() {
  const vendLoc = [];
  await firebase.firestore().collection('vendors').get()
    .then(querySnapshot => {
      querySnapshot.docs.forEach(doc => {
      vendLoc.push(doc.data());
    });
  });
  console.log(vendLoc)
  for (var i = 0; i < vendLoc.length; i++){
    var Location = vendLoc[i].Location;
    Locations.push(Location);
    console.log(Location)
  }
  return vendLoc;
}

function googleSignIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
}

function googleSignOut() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signOut()
}

function checkIfExistsorCreateProfile(user) {
    const db = firebase.firestore();
    const userRef = db.collection('users').doc(user.email);

    userRef.get()
        .then(doc => {
            if (doc.exists) {
                var user_data = doc.data();

                $("#name-input").attr("value", user_data.userName);
                $("#phone-input").attr("value", user_data.Phone_Number);
                $("#ppl-input").attr("value", user_data.Number_of_People);
                $("#genre-input").attr("value", user_data.Genre);
                $("#desc-input").val(user_data.Description_of_act_offered);
                document.querySelector(".pf-email").innerText = user.email;
            }
            else {
                userRef.set({
                    UserID: user.uid,
                    userName: "",
                    Phone_Number: "",
                    Number_of_People: 0,
                    Genre: "",
                    Description_of_act_offered:"",
                })
            }
        })
}


function getUserProfilePic(user) {
    user.providerData.forEach(profile => {
        $('.pfp').attr('src', profile.photoURL)
    })
}

let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 12,
  });
}

document.querySelector('.save-btn').addEventListener('click', () => {
    const db = firebase.firestore();
    var user = firebase.auth().currentUser;
    db.collection('users').doc(user.email).set({
        userName: $("#name-input").val(),
        Phone_Number: $("#phone-input").val(),
        Number_of_People: parseInt($("#ppl-input").val()),
        Genre: $("#genre-input").val() ,
        Description_of_act_offered: $("#desc-input").val(),
    });
})


function initMap(Locationz, Range) {
    const service = new google.maps.DistanceMatrixService(); // instantiate Distance Matrix servic
    var origin1 = Locationz;
    for (var i = 0; i<Locations.length; i++){
      var destination1 = Locations[i];
      const matrixOptions = {
        origins: [origin1], // technician locations
        destinations: [destination1], // customer address
        travelMode: 'DRIVING',
        unitSystem: google.maps.UnitSystem.METRIC
      };
      // Call Distance Matrix service
      service.getDistanceMatrix(matrixOptions, callback);

      // Callback function used to process Distance Matrix response
      function callback(response, status) {
        if (status == 'OK') {
          var origins = response.originAddresses;
          var destinations = response.destinationAddresses;
          for (var i = 0; i < origins.length; i++) {
            var results = response.rows[i].elements;
            for (var j = 0; j < results.length; j++) {
              var element = results[j];
              var distance = element.distance.text;
              var from = origins[i];
              var to = destinations[j];
              console.log(distance);
              if (distance <= Range){
                Gigs.append(destination1);
                console.log(Gigs);
              }
            }
          }
        }
      }

    }
    
}