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
    if(elem.trackViewUrl==match.trackViewUrl)
      duplFlag = false;
  })
  return duplFlag;
}

function getbestMatchesItunes(duplicatesIds){
  duplicatesIds.forEach((dupl)=>{
    itunesResponse.forEach((resp)=>{
      if(dupl.trackid==resp.trackId){
        if(ifMatchInBestMatchesItunes(resp)){
          bestMatchesItunes.push(resp);
        }
      }
    });
  });
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
     
function fillDescription(url){
  $.ajax({
    url: url,
    dataType: "xml",
    crossDomain: true
  }).then((xml)=>{
    var description = $(xml).find('rss').find('channel').find('itunes\\:summary').first().text();
    $(".podcast_description").text(description);
    });
}

function fillBestMatch(elem){
  $(".podcast_author").text(elem.artistName);
  $(".podcast_keywords").text(elem.genres);
  $(".podcast_title").text(elem.trackName);
  $(".podcast_link").attr("href", elem.trackViewUrl).text("link to the podcast in the platform");
  fillDescription(elem.feedUrl);
}

function* BestMatchGenerator(){
  var stop = bestMatchesItunes.length;
    for(var i=0;i<=stop;i++){
      if(i == stop){
        i = 0;
      }
      if (direction=="prev"){
        i=i-2;
        if(i == -1){
          i = stop-1;
        }
        if(i == -2 ){
          i = stop-2;
        }
        fillBestMatch(bestMatchesItunes[i]);
        var direction = yield bestMatchesItunes[i];
      }
      else{
        fillBestMatch(bestMatchesItunes[i]);
        var direction = yield bestMatchesItunes[i];
      }
    }
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function fillPictures(){
  for(var i=1; i<bestMatchesItunes.length; i++)
{
    $(".carousel-inner").append($(`<div class="carousel-item" data-interval=""><img class="d-block w-100" src="${bestMatchesItunes[i].artworkUrl600}" alt="First slide">`));
}
}

function getElsePodcasts(){
  shuffle(itunesResponse);
  $("#elseTitle").text("Similar to the Querry");
  var canvas = $(".else_podcasts");
  canvas.fadeTo( "slow" , 0.1, function() {
    canvas.empty();
    canvas.css("opacity", 1);
    var first10 = itunesResponse.splice(0,9);
    first10.forEach((elem)=>{
    canvas.append($(`<div class="d-flex flex-wrap my-2"><img class="else_picture" src="${elem.artworkUrl600}" height="150px"><div class="ml-2"><div class="elseTitle" id="${elem.trackId}">${elem.trackName}</div><h6>by:${elem.artistName}</h6><h6>keywords:</h6><p>${elem.genres}</p><button value="${elem.feedUrl}" class="get_description"><a target="_blank" href="${elem.trackViewUrl}">Get more</a></button></div></div><hr>`)
    );
  })
  });
}

function createNewPageForResult(){
  $(".optional_search_page").append($('<div class="result_podcasts"><div class="d-flex mx-0 mb-4"><img class="mr-3" src="logos/png-transparent-podcast-itunes-app-store-apple-purple-violet-magenta-removebg-preview.png" height="40px" width="40px"><h3>Itunes Podcasts the best match</h3></div><div class="result_container"><div id="carouselExampleInterval" class="carousel slide mt-4 ml-4" data-ride="carousel"><div class="carousel-inner"><div class="carousel-item active" data-interval=""><img class="d-block w-100" src="..." alt="First slide"></div></div><a class="carousel-control-prev ok" href="#carouselExampleInterval" role="button" data-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="sr-only">Previous</span></a><a class="carousel-control-next" href="#carouselExampleInterval" role="button" data-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span><span class="sr-only">Next</span></a></div><div class="description_area pl-4 pt-2"><h4 class="podcast_title mb-2"></h4><div class="d-flex"><h6>by:</h6><h6 class="ml-2 podcast_author"></h6></div><h6 id="description_title">Description:</h6><p class="podcast_description"></p><h6>link:</h6><a href="" class="ml-2 podcast_link" target="_blank"></a><h6>keywords:</h6><p class="ml-2 podcast_keywords"></h6></div></div><h3 id="elseTitle" class="my-2"></h3><div class="mt-3 else_podcasts"></div><div class="d-flex justify-content-center"><button class="getElseButton">Get else</button></div></div>'));
  $('.carousel').carousel({
    interval: false
  });
}
 
function setFailureCanvas(){
  $(".optional_search_page").append($('<div class="d-flex justify-content-center"><h3>Seems to be empty here... check out these podcasts or try to search again</h3></div><div class="mx-4"><div class="mt-3 else_podcasts"></div><div class="d-flex justify-content-center"><button  class="getElseButton">Get else</button></div></div>'));
}

function fillInfoInNewPage(){
  var matchGen = BestMatchGenerator();
  matchGen.next();
  $(".carousel-control-next").on("click", ()=>{
    matchGen.next("next");
  });
  $(".carousel-control-prev").on("click", ()=>{
    matchGen.next("prev");
  });
  $(".carousel-item").children().first().attr("src", bestMatchesItunes[0].artworkUrl600);
  fillPictures();
  setTimeout(()=>{
    $(".carousel-control-next").effect("shake");
    $(".carousel-control-prev").effect("shake");
  }, 1000);
}

function setListenerToElseButton(){
  $(".getElseButton").on("click", ()=>{
    getElsePodcasts();
    location.href = "#";
    location.href = "#elseTitle";
  });
}

function showItunesPodcasts(){
  if(bestMatchesItunes.length>0){
  createNewPageForResult();
  fillInfoInNewPage();
  setListenerToElseButton();
  }
  else{
    
    setFailureCanvas();
    getElsePodcasts();
    setListenerToElseButton();
  }
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

