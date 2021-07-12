const PRE = "SAN"
const SUF = "MEET"
var room_id;
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var local_stream;
var user_name;

//Load the file containing the chat log
function loadLog(){     
    $.ajax({
        url: "log.html",
        cache: false,
        success: function(html){        
            $("#chatbox").html(html); //Insert chat log into the #chatbox div               
        },
    });
}

function sendmessage(){
    var clientmsg = $("#usermsg").val();
    let myuser_name = document.getElementById('User-name').value;
    
    $.post("post.php", { text: clientmsg, name:myuser_name});
    $("#usermsg").val("");
    loadLog();
    return false;
}


function createRoom(){
    console.log("Creating Room")
    let room = document.getElementById("room-input").value;
    let user_name = document.getElementById('User-name').value;
        if(room == " " || room == "")   {
        alert("Please enter room number")
        return;
    }
    if(user_name == " " || user_name == ""){
        alert("Please enter your Name")
        return;
    }
    $("#meet-area").css("display", "block");
    $("#entry-modal").css("display", "none")
    room_id = PRE+room+SUF;
    let peer = new Peer(room_id)
    peer.on('open', (id)=>{
        console.log("Peer Connected with ID: ", id)
        hideModal()
        getUserMedia({video: true, audio: true}, (stream)=>{
            local_stream = stream;
            setLocalStream(local_stream)
        },(err)=>{
            console.log(err)
        })
        notify("Waiting for peer to join.")
    })
    peer.on('call',(call)=>{
        call.answer(local_stream);
        call.on('stream',(stream)=>{
            setRemoteStream(stream)
        })
    })
}

function setLocalStream(stream){
    
    let video = document.getElementById("local-video");
    video.srcObject = stream;
    video.muted = true;
    video.play();

}
function setRemoteStream(stream){
   
    let video = document.getElementById("remote-video");
    video.srcObject = stream;
    video.play();

}

function hideModal(){
    document.getElementById("entry-modal").hidden = true
}

function notify(msg){
    let notification = document.getElementById("notification")
    notification.innerHTML = msg
    notification.hidden = false
    setTimeout(()=>{
        notification.hidden = true;
    }, 3000)
}

function joinRoom(){
    console.log("Joining Room")
    let room = document.getElementById("room-input").value;
    user_name = document.getElementById('User-name');
    if(room == " " || room == "")   {
        alert("Please enter room number")
        return;
    }
    if(user_name == " " || user_name == "")   {
        alert("Please enter your Name")
        return;
    }
    $("#meet-area").css("display", "block");
    $("#entry-modal").css("display", "none")

    room_id = PRE+room+SUF;
    hideModal()
    let peer = new Peer()
    peer.on('open', (id)=>{
        console.log("Connected with Id: "+id)
        getUserMedia({video: true, audio: true}, (stream)=>{
            local_stream = stream;
            setLocalStream(local_stream)
            notify("Joining peer")
            let call = peer.call(room_id, stream)
            call.on('stream', (stream)=>{
                setRemoteStream(stream);
            })
        }, (err)=>{
            console.log(err)
        })

    })
}

let isAudio=true;
function muteAudio(){
    isAudio=!isAudio;
    local_stream.getAudioTracks()[0].enabled = isAudio;
    $('#sanmic').removeClass();
    if(!isAudio){
        $('#sanmic').addClass('fa fa-microphone-slash');
        $('#sanmic').css({"left": "150px"}); 
    }
        else{
        $('#sanmic').addClass('fa fa-microphone');
        $('#sanmic').css({"left": "150px"}); 
    }
}


let isVideo=true;
function muteVideo(){
    isVideo=!isVideo;
    local_stream.getVideoTracks()[0].enabled = isVideo;
    $('#sanvideospan').removeClass();

    if(!isVideo){
        $('#sanvideospan').addClass('badge  badge-danger');
       // $('#sanvideo').css({"font-size" :"16px","left": "100px"}); 
    }
        
    else{
        $('#sanvideospan').addClass('badge  badge-secondary');
        //$('#sanvideo').addClass('fa fa-video-camera');
        //$('#sanvideo').css({"font-size" :"16px","left": "100px"}); 

    }
}

function showchat()
{
    $('#mychatbox').css('display','block');
}

$(document).ready(function () {
    setInterval (loadLog, 2500);
});

