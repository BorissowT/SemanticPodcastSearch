const myInterests = [];
var engineSuggestions = [];
var itunesResponse = [];
var bestMatchesItunes = [];

function removeItemFromInterests(info, $item){
  $item.remove();
  for(i = 0; i < myInterests.length; i++){
    if(myInterests[i] == info)
      myInterests.splice(i,1);
    }
  renderList();
}

function disableGetPodcastsButton(){
  $("#getPlaylistBtn").attr("disabled","");
}

function enableGetPodcastsButton(){
  $("#getPlaylistBtn").removeAttr("disabled");
}

function renderList(){
  if(myInterests.length==1 && $('#interests_title').length==0){
    $("#my_intersts_title").append($("<h3 id='interests_title'>My interests:</h3>"));
  }
  if(myInterests.length==0){
    disableGetPodcastsButton();
  }
  if(myInterests.length>0){
    enableGetPodcastsButton();
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

function ifMatchInBestMatchesItunes(elem){
  var duplFlag = true;
  bestMatchesItunes.forEach((match)=>{
    if(elem.trackId==match.trackId)
      duplFlag = false;
  })
  return duplFlag;
}

function getbestMatchesItunes(duplicatesIds){
  duplicatesIds.forEach((dupl)=>{
    itunesResponse.forEach((resp)=>{
      if(dupl.trackid==resp.trackId){
        if(ifMatchInBestMatchesItunes(resp))
          bestMatchesItunes.push(resp);
      }
    });
  });
 console.log(bestMatchesItunes);
}

function count_duplicates(idlist){
 let counts = {};
 var duplicates = [];
 for(let i =0; i < idlist.length; i++){ 
     if (counts[idlist[i]]){
     counts[idlist[i]] += 1;
     } else {
     counts[idlist[i]] = 1;
     }
    }  
    for (let prop in counts){
        if (counts[prop] >= 2){
          duplicates.push({"trackid":prop,"counts":counts[prop]})
        }
    }
    duplicates.sort(function(a, b){return b.counts-a.counts});
    return duplicates;  
}

function filterSimilarPodcasts(){
  var podcastsArray = []
  var bestMatchPodcasts = []
  itunesResponse.forEach((elem)=>{
   podcastsArray.push(elem.trackId)
  });
  getbestMatchesItunes(count_duplicates(podcastsArray));
}

function clearSearchField(){
  $(".optional_search_page").empty();
}
          
function showItunesPodcasts(){
$(".optional_search_page").append($('<div class="result_podcasts"><div class="d-flex mx-0 mb-4"><img class="mr-3" src="logos/png-transparent-podcast-itunes-app-store-apple-purple-violet-magenta-removebg-preview.png" height="40px" width="40px"><h3>Itunes Podcasts the best match</h3></div><div class="result_container"><div id="carouselExampleInterval" class="carousel slide" data-ride="carousel"><div class="carousel-inner"><div class="carousel-item active" data-interval=""></div></div><a class="carousel-control-prev" href="#carouselExampleInterval" role="button" data-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="sr-only">Previous</span></a><a class="carousel-control-next" href="#carouselExampleInterval" role="button" data-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span><span class="sr-only">Next</span></a></div><div class="description_area pl-4 pt-2"><h6 class="podcast_title "></h6><div class="d-flex"><h6>by:</h6><h6 class="ml-2 podcast_author"></h6></div><h6 >Description:</h6><p class="podcast_description"></p><div class="d-flex"><h6>genres:</h6><h6 class="ml-2 podcast_genres"></h6></div></div></div></div>'));
$('.carousel').carousel({
  interval: false
});
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
Promise.all(ajaxItunes())
  .then(()=>{filterSimilarPodcasts()})
  .then(()=>{showItunesPodcasts()});
}

$('#addButton').on('click', ()=>{fillSuggestions()})

$('#tagsField').keyup(function(event) {
  if (event.which == 13) {
    fillSuggestions();
  }
});

$('#getPlaylistBtn').click(function (event) {
  clearSearchField();
  requestToItunes();
});

