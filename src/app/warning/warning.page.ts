import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder,NativeGeocoderOptions,NativeGeocoderResult } from '@ionic-native/native-geocoder/ngx';
import { SMS } from '@ionic-native/sms/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { detailsservice } from '../shared/details.service';
import * as firebase from 'firebase';
import { AlertController } from '@ionic/angular';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { NavController, ModalController } from '@ionic/angular';
import { AuthenticateService } from '../services/authentication.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireAuth } from "@angular/fire/auth";

@Component({
  selector: 'app-warning',
  templateUrl: './warning.page.html',
  styleUrls: ['./warning.page.scss'],
})

export class WarningPage implements OnInit {

  geoLatitude: number;
  geoLongitude: number;
  geoAccuracy:number;
  geoAddress: string;

  changed_geoLatitude: number;
  changed_geoLongitude: number;

  watchLocationUpdates:any; 
  loading:any;
  isWatching:boolean;
  profile_url:string;
  count:number;
  user_name:string;
  //Geocoder configuration
  geoencoderOptions: NativeGeocoderOptions = {
    useLocale: true,
    maxResults: 5
  };
  constructor(
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
    private sms: SMS,
    private navCtrl: NavController,
    private authService: AuthenticateService,
    private http: HttpClient,
    private androidPermissions: AndroidPermissions,
    private aptservice:detailsservice,
    public afAuth: AngularFireAuth

  ) {
    
    
    if (!localStorage.getItem('uid')) {
      this.navCtrl.navigateForward('');
    }else{
      if(localStorage.getItem('profile_url')){
        this.profile_url=localStorage.getItem('profile_url');
      }
      else{
        this.profile_url="../../assets/ubold/layouts/light/assets/images/man.png";
      }
      console.log('profile_url',this.profile_url)
    }
  }
  
  ngOnInit() {
    if(localStorage.getItem('profile_url')){
      this.profile_url=localStorage.getItem('profile_url');
    }
    else{
      this.profile_url="../../assets/ubold/layouts/light/assets/images/man.png";
    }
    this.count=3;
    this.afAuth.authState.subscribe(user => {
      if(user.emailVerified){
          document.getElementById('warn_emailverify').remove();
          this.count=this.count-1;
      }
      var key = localStorage.getItem('uid');
      var ref= firebase.database().ref('users/'+key);
      ref.once('value',res=>{
        this.user_name=res.val().name;
          if(res.val().numberverfied==1){
            document.getElementById('phoneverify').remove();
            this.count=this.count-1;
          }
      });
    });
    var isMobile = {
      Android: function() {
          return navigator.userAgent.match(/Android/i);
      },
      BlackBerry: function() {
          return navigator.userAgent.match(/BlackBerry/i);
      },
      iOS: function() {
          return navigator.userAgent.match(/iPhone|iPad|iPod/i);
      },
      Opera: function() {
          return navigator.userAgent.match(/Opera Mini/i);
      },
      Windows: function() {
          return navigator.userAgent.match(/IEMobile/i);
      },
      any: function() {
          return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
      }
  };
    if( isMobile.any() ){
      document.getElementById('warn_leftbar').style.left="-270px";
    }else{
      document.getElementById('warn_leftbar').style.left="0px";
    }
  }
  checkSMSPermission() {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.SEND_SMS).then(
      result => console.log('Has permission?', result.hasPermission),
      err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.SEND_SMS)
    );
  }
  requestSMSPermission() {
    // tslint:disable-next-line: max-line-length
    this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.SEND_SMS, this.androidPermissions.PERMISSION.BROADCAST_SMS]);
  }
 
  truncate(n) {
    return n > 0 ? Math.floor(n) : Math.ceil(n);
  }

 getDMS(dd, longOrLat) {
    let hemisphere = /^[WE]|(?:lon)/i.test(longOrLat)
    ? dd < 0
      ? "W"
      : "E"
    : dd < 0
      ? "S"
      : "N";
    
    const absDD = Math.abs(dd);
    const degrees = this.truncate(absDD);
    const minutes = this.truncate((absDD - degrees) * 60);
    const seconds = ((absDD - degrees - minutes / 60) * Math.pow(60, 2)).toFixed(2);
    
    let dmsArray = [degrees, minutes, seconds, hemisphere];
    return `${dmsArray[0]}°${dmsArray[1]}'${dmsArray[2]}"${dmsArray[3]}`;
}
opt(){
  this.aptservice.getnumber();
}
home(){
  this.navCtrl.navigateForward('/dashboard');
}
askhelp(){
  this.navCtrl.navigateForward('/neighbour');
}
chatbot(){
  this.navCtrl.navigateForward('/chat-ivr');
}
redirect_warning(){
  this.navCtrl.navigateForward('/warning');
}
blog(){
  this.navCtrl.navigateForward('/safety-measures');
}

logout() {
  console.log('logout')
  this.authService.logoutUser()
  .then(res => {
    console.log(res);
    localStorage.removeItem('uid');
    localStorage.removeItem('profile_url');
    this.navCtrl.navigateBack('');
  })
  .catch(error => {
    console.log(error);
  })
}

  showleft(){
    if(document.getElementById('warn_leftbar').style.left=="-270px"){
      document.getElementById('warn_leftbar').style.left="0px";
    }else{
      document.getElementById('warn_leftbar').style.left="-270px";
    }
  }
  hideleft(){
    if(document.getElementById('warn_leftbar').style.left=="0px"){
      document.getElementById('warn_leftbar').style.left="-270px";
    }
}
  




goToProlfilePage() {
  this.navCtrl.navigateForward('/my-profile');
}




  send(){
    this.checkSMSPermission();
    var options={
    replaceLineBreaks: false, // true to replace \n by a new line, false by default
    android: {
         intent: 'INTENT'  // Opens Default sms app
        //intent: '' // Sends sms without opening default sms app
      }
  }
  let latDMS = this.getDMS(this.geoLatitude, 'lat'); 
  let lonDMS = this.getDMS(this.geoLongitude, 'long');
  
  this.http.get('https://pickle-dilophosaurus.glitch.me/send?map=https://www.google.com/maps/place/' + latDMS + ',' + lonDMS + '&name='+'USER'+'&Present_Latitude='+this.geoLatitude+'&Present_geoLongitude='+this.geoLongitude+'&Adress='+this.geoAddress).toPromise().then(res=>{
    console.log("sent");
  });
  var key = localStorage.getItem('uid');
  var ref= firebase.database().ref('users/'+key);
  ref.once('value',res=>{
    var parentnumber=res.val().father_mobile_number;
    this.sms.send(parentnumber, 'https://www.google.com/maps/@' + this.geoLatitude + ',' + this.geoLongitude + ',17z',options)
    .then(()=>{
      console.log("success");
    },()=>{
    console.log("failed");
    }); 
  });
  
  }

    //Get current coordinates of device
    getGeolocation(){
      this.geolocation.getCurrentPosition().then((resp) => {
        this.geoLatitude = resp.coords.latitude;
        this.geoLongitude = resp.coords.longitude; 
       console.log(this.geoLatitude,this.geoLongitude);
    //  console.log("getgei"+this.geoLatitude);
       this.watchLocation();
        var obj={
          lat:resp.coords.latitude,
          long:resp.coords.longitude
        }
        this.aptservice.uploadgeo(obj).then(res=>{
          this.send();
        }).catch(error=> console.log(error));
        this.geoAccuracy = resp.coords.accuracy; 
        this.getGeoencoder(this.geoLatitude,this.geoLongitude);
       }).catch((error) => {
         console.log('Error getting location'+ JSON.stringify(error));
       });
    }
    //geocoder method to fetch address from coordinates passed as arguments
    getGeoencoder(latitude,longitude){
      this.nativeGeocoder.reverseGeocode(latitude, longitude, this.geoencoderOptions)
      .then((result: NativeGeocoderResult[]) => {
        this.geoAddress = this.generateAddress(result[0]);
      })
      .catch((error: any) => {
        console.log('Error getting location'+ JSON.stringify(error));
      });
    }
  
    //Return Comma saperated address
    generateAddress(addressObj){
        let obj = [];
        let address = "";
        for (let key in addressObj) {
          obj.push(addressObj[key]);
        }
        obj.reverse();
        for (let val in obj) {
          if(obj[val].length)
          address += obj[val]+', ';
        }
      return address.slice(0, -2);
    }
    Deg2Rad( deg ) {
      return deg * Math.PI / 180;
   }
  
    //Start location update watch
    watchLocation(){
      var latDiff,lonDiff;
      this.isWatching = true;
      this.watchLocationUpdates = this.geolocation.watchPosition();
      this.watchLocationUpdates.subscribe((resp) => {
        this.changed_geoLatitude = resp.coords.latitude;
        this.changed_geoLongitude = resp.coords.longitude; 
        this.getGeoencoder(this.changed_geoLatitude,this.changed_geoLongitude);
      //   this.changed_geoLatitude = 11.0204299;
      // this.changed_geoLongitude = 77.0095472;
      // console.log(this.geoLatitude);
      // console.log(this.geoLongitude);

        latDiff = this.Deg2Rad(this.changed_geoLatitude-this.geoLatitude);
        lonDiff = this.Deg2Rad(this.changed_geoLongitude-this.geoLongitude);
        // console.log("diff "+latDiff+"long"+lonDiff);
        var R = 6371; // k.metres
        var φ1 = this.Deg2Rad(this.geoLatitude);
        var φ2 = this.Deg2Rad(this.changed_geoLatitude);
        var Δφ = latDiff;
        var Δλ = lonDiff;

        var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        var d = R * c;
        //console.log('d: ' + d);

        var dist = Math.acos( Math.sin(φ1)*Math.sin(φ2) + Math.cos(φ1)*Math.cos(φ2) * Math.cos(Δλ) ) * R;
        //console.log('dist: ' + dist);

        if(dist > 2){
          
          // console.log("beforelat"+this.geoLatitude);
          // console.log("beforelong"+this.geoLongitude);
          // console.log("after"+this.changed_geoLatitude);
          // console.log("afterlong"+this.changed_geoLongitude);
          this.geoLatitude=this.changed_geoLatitude;
          this.geoLongitude=this.changed_geoLongitude;

          // console.log("swaplat"+this.geoLatitude);
          // console.log("swaplong"+this.geoLongitude);
          // console.log(dist);
          var obj={
            lat:this.geoLatitude,
            long:this.geoLongitude
          }
          this.aptservice.uploadgeo(obj).then(res=>{
            //console.log('wtu');
            this.send();
          }).catch(error=> console.log(error));
        }else{
          console.log("current"+dist);
        }
      });
    }
  
    //Stop location update watch
    stopLocationWatch(){
      this.isWatching = false;
      this.watchLocationUpdates.unsubscribe();
    }
}
 