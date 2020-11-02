const myInterests = [];
var engineSuggestions = [];
var itunesResponse = [];

function removeItemFromInterests(info, $item){
  $item.remove();
  for(i = 0; i < myInterests.length; i++){
    if(myInterests[i] == info)
      myInterests.splice(i,1);
    }
  renderList();
}

function renderList(){
  if(myInterests.length==1 && $('#interests_title').length==0){
    $("#my_intersts_title").append($("<h3 id='interests_title'>My interests:</h3>"));
  }
  $('.info').empty();
  for (const info of myInterests) {
    const $item = $('<div class="item"></div>').text(info);
    $item.on('click', ()=>removeItemFromInterests(info, $item))
    $('.info').append($item)
  }
}

function addToMyIntersts(info){
  if(checkIfItemInInterests(info)){
  myInterests.push(info);
  renderList();
  }
  else
    throw "Element is already added";
}

function addTagFromField(){
  return new Promise((resolve, reject)=>{
    const info = $('#tagsField').eq(0).val();
    if(info.length > 2){
      addToMyIntersts(info);
      $('#tagsField').eq(0).val('');
      return resolve(info);
    }
    else{

      return reject("error");
    }
});
}

function addButtonMoreTags(){
  $("#getMoreTags").remove();
  if(synonymsArray.length>1){
    $("#search_field").after($('<div class="row my-1"><div class="col col-xs-12 text-center"><button id="getMoreTags" class="btn btn-light btn-lg">More suggestions +</button></div></div>'));
    $("#getMoreTags").on("click",()=>{
      fill30synonyms(synonymsArray);
    })
  }
}

function deleteElementFromSuggestions(elem){
  elem.remove();
  for(i = 0; i < engineSuggestions.length; i++){
  if(engineSuggestions[i].word == elem.text())
    engineSuggestions.splice(i,1);
  }
}

function addSuggestionToMyInterests(elem){
  deleteElementFromSuggestions(elem);
  addToMyIntersts(elem.text());
}

function fill30synonyms(synonymsArray){
  var first30 = synonymsArray.splice(0,29);
  engineSuggestions = engineSuggestions.concat(first30);
  $(".engine").empty();
  engineSuggestions.forEach((elem)=>{
  var suggestion = $('<div class="suggestion"></div>').text(elem.word);
  suggestion.on("click", function(){addSuggestionToMyInterests($(this))})
    $(".engine").append(suggestion);
});
  addButtonMoreTags();
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
    else{
      addButtonMoreTags();
    }
  })

}

function fillSuggestions(){
  const newtagpromise = addTagFromField();
  newtagpromise
  .then((info)=>{callForSynonyms(info);})
  .catch((err)=>{console.log(err)});
}

function checkIfItemInInterests(item){
  var state = true;
  myInterests.forEach((element)=>{
    if(element==item){
      state = false;
    }
  })
  return state;
}

function filterSimilarPodcasts(){
  console.log(itunesResponse);
}


function* ajaxItunes(){
  for(var i=0; i<myInterests.length; i++){
    yield $.get(`https://itunes.apple.com/search?term=${myInterests[i]}&limit=200&media=podcast&entity=podcast`).then((response)=>{
       response = JSON.parse(response);
       itunesResponse = itunesResponse.concat(response.results);
     });
   }
 }


function requestToItunes(){
Promise.all(ajaxItunes()).then(()=>{filterSimilarPodcasts()});
}

$('#addButton').on('click', ()=>{fillSuggestions()})

$('#tagsField').keyup(function(event) {
  if (event.which == 13) {
    fillSuggestions();
  }
});

$('#getPlaylistBtn').click(function (event) {
  requestToItunes();
});
