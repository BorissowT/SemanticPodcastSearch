const podcastInfo = [];
var engineSuggestions = [];

function addTagFromField() {
  return new Promise((resolve, reject)=>{
    const info = $('#tagsField').eq(0).val();
   
    if(info.length > 2){
      podcastInfo.push(info);
      renderList();
      $('#tagsField').eq(0).val('');
      return resolve(info);
    }
    else{

      return reject("error");
    }
});
}

function fill30synonyms(synonymsArray){
  var first30 = synonymsArray.splice(0,29);
  engineSuggestions = engineSuggestions.concat(first30);
  $(".engine").empty();
  engineSuggestions.forEach((elem)=>$(".engine").append($('<div class="item"></div>').text(elem.word)));
  $("#getMoreTags").remove();
  if(synonymsArray.length>1){
    $("#search_field").after($('<div class="row my-1"><div class="col col-xs-12 text-center"><button id="getMoreTags" class="btn btn-light btn-lg">More suggestions +</button></div></div>'));
    $("#getMoreTags").on("click",()=>{
      fill30synonyms(synonymsArray);
    })
  }

}

function getSynonymsArrayFromRespond(data){
  var finalArray = [];
  data.forEach((element)=>{
    finalArray.push({"word":element.word,"score":element.score});
  });
  return finalArray;
} 

function callForSynonyms(info){
  $.getJSON(`https://api.datamuse.com/words?ml=${info}`,(data)=>{
    synonymsArray = getSynonymsArrayFromRespond(data);
    if($(".engine").children().length == 0){
        $("#engine_suggestion").append($("<h4>Engine's suggestions:</h4>"));
        fill30synonyms(synonymsArray);
    }
  })

};

$('#addButton').click(()=>{
  const newtagpromise = addTagFromField();
  newtagpromise.then((info)=>{callForSynonyms(info);}).catch((err)=>{console.log(err)});
});
$('#tagsField').keyup(function(event) {
  if (event.which == 13) {
    const newtagpromise = addTagFromField();
    newtagpromise.then((info)=>{callForSynonyms(info);}).catch((err)=>{console.log(err)});
  }
});

function renderList() {
  if(podcastInfo.length==1){
    $("#my_intersts_title").append($("<h3>My interests:</h3>"));
  }
  $('.info').empty();
  for (const info of podcastInfo) {
    const $item = $('<div class="item"></div>').text(info);
    $('.info').append($item)
  }
}

$('#getPlaylistBtn').click(function (event) {
  // TODO: Display a list of music.
  // You may use anything from musicInfo.
  console.log('Testing Music Call');
});


