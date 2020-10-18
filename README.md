######this exercise is created by: Ken McGrady. Below you can find my own notation(Tim)

# Musicologist Assignment

In this assignment, you will make up your own "method" of determining a user's music interests and build a playlist of songs to recommend the user.

## What is already there?

The website currently is a form that allows the user to enter their music interests. Currently any text is legal, so they could enter tracks, albums, artists, or just gibberish. The website also takes the content and displays it in a list. The content is also stored in an array.

## What do you need to do?

Your goal is to generate some recommended playlist for them. To do this, you will need use of an API to get information about music. I recommend taking a look at iTunes search.

https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api/#searching

You are welcome to display the playlist in any way you like. Apple provides some images that might be of use in building your page. You can also reset the list or add any features to the page you like.

## How should I generate the recommendations?

Any way you like! You can generate a list of the most annoying songs if you like as long as you use an API. This is a fun and interesting engineering challenge that we will not get right (Think Apple, Pandora, and Spotify invest a lot into figuring this out), but it's interesting to develop a "theory" that might help. It could be as simple as any/all of the following:

* Find popular songs by the artists in the list.
* Find songs with the same keywords in the titles.
* Find songs in the same genre.
* Consult other APIs to determine beats per minute bpm or some similar stats.


#######TIM BORISOW
## My real goals
This is an study exercise for practicing in making promises in JS.
i'm really keen on podcasts. It's been always a struggle to me to find a good one. So i've decided to make a simple app for selection of json queries with different podcasts. For a better result this app supposed to use requests with synonyms of requested by client tags.