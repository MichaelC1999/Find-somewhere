
let city="";

function gitHubAPI(){
  //function to get a list of users in the given city, using github API
  console.log('githubAPI-'+ city);
 
 /*
  var requestOptions = {
    method: 'GET',
    headers: {
      "Authorization": "token 0864d65c5300902f4a272d7a8efd9e3dee22bb9d"
    },
    redirect: 'follow'
  };
  */
  //requestOptions is authorization header

  /*NOTE When this file was pushed to github, the Authorization token was revoked. I have changed it to fetch results without the token, but unauthorized requests are limited to 60 requests/hour
  */

  const gitURL = 'https://api.github.com/search/users?q=location:' + city;
  //Add user input city to GET Url

  fetch(gitURL)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(userResponseJson => displayGit(userResponseJson))
    .catch(err => {
      $('#githubResults').text(`Something went wrong FETCHING github results: ${err.message}`);
      //Error message if Github API fails to return
    });
}

function displayGit(userResponseJson){
  //function to display Github return

  console.log(userResponseJson);
  let resultsMessage="";
  let maxResults=userResponseJson.items.length;
  //Variable to hold amount of users returned. Default is 30.
  //NOTE userResponseJson.total_count counts total users that match, but the API only returns a set of 30 by default. "total_count" gives the complete number of users in that location

  if(userResponseJson.total_count>=6000){
    resultsMessage= city + " is a hub for programmers! " + userResponseJson.total_count + " github users are located there. Here are some of the top profiles:";
  }

  if(userResponseJson.total_count<6000&&userResponseJson.total_count>=500){
    resultsMessage= city + " is a good place to meet other programmers. " + userResponseJson.total_count + " github users are located there. Here are some of the top profiles:";
  }

  if(userResponseJson.total_count<500&&userResponseJson.total_count>30){
    resultsMessage= city + " has some programmers. " + userResponseJson.total_count + " github users are located there. Here are some of the top profiles:";
  }

  if(userResponseJson.total_count<=30){
    resultsMessage= city + " doesn't seem to have many programmers. " + userResponseJson.total_count + " github users are located there. Perhaps try respelling, or try a larger city close by.";
  }

  

  $('#githubResults').html(startResultsHTML(resultsMessage));
  //Return a message saying how many users are in the area, and create the userList UL

  for(let i = 0; i<maxResults; ++i){
    githubProfile(userResponseJson, i);
    //Run function creating a list element for each user returned
  }

  let findMoreUsersURL = "https://github.com/search?q=location%3A"+city+'&type=Users';
  //Create URL to search for more users

  if(userResponseJson.total_count>30){
    $('#githubResults').append(userSearchOnSite(findMoreUsersURL));
    //Link to github search
  }

  if(userResponseJson.total_count>5){
    $('#githubResults').append(motivationMessage());
    //Message about ispiration for the program
  }
    
}

function motivationMessage(){
  return '<p class="noMobile">Message some of these users, and ask about the local tech scene in '+city+'. This is a good way to meet some locals who share your passion for programming. The idea for this API was how I made a connection to startups in Brazil. A shot in the dark email turned into an opportunity and a life-long friend.</p>';
}

function userSearchOnSite(findMoreUsersURL){
  return '<a href="'+findMoreUsersURL+'">Want to see more users in '+city+'? click here!</a>';
}

function startResultsHTML(resultsMessage){
  return '<p>'+ resultsMessage + '</p><ul id="userList"></ul>';
}

function githubProfile(userResponseJson, i){
  //function that produces HTML for each returned user

  let mobileHide="";

  if(i>=12){
    mobileHide='class="noMobile"';
    //After the 12th item, add the 'noMobile' class to hide for mobile users
  }

  $('#userList').append('<li '+mobileHide+'><img class="avatarPic" src ="'+userResponseJson.items[i].avatar_url+'"><a href="'+userResponseJson.items[i].html_url+'">'+userResponseJson.items[i].login+'</a><a href="'+userResponseJson.items[i].repos_url+'">Public repos</a></li>');
  //create HTML for each list element about a user 
}

function imagesAPI(){
  console.log('pixabayAPI-'+ city);


  
  const imagesURL= 'https://pixabay.com/api/?key=17971447-450f72e4f280ad5ec156b1653&q=' + city +'&image_type=photo&category=travel&order=latest';
  //URL to fetch photos from pixabay API

  fetch(imagesURL)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(imagesResponseJson => displayImages(imagesResponseJson))
    .catch(err => {
      $('#imagesResults').text(`No images found. Try a different location---${err.message}`);
      //Error Message if zero photos are returned
    });
}

function displayImages(imagesResponseJson){
  //Function to display images returned from fetch pixabay API
  console.log(imagesResponseJson);

  $('#imagesResults').html(imageSRC(imagesResponseJson.hits[0].webformatURL));
  //Start the 'displayImages' with the html of the first image, and append the following results after 
 
  if(imagesResponseJson.hits.length>=1&&imagesResponseJson.hits.length<=10){
    for(let i=1; i<imagesResponseJson.length; ++i){
      $('#imagesResults').append(imageSRC(imagesResponseJson.hits[i].webformatURL));
    }
  }
  //If between 1 and 10 images are returned, display the each photo

  if(imagesResponseJson.hits.length>10){
    for(let i=1; i<10; ++i){
      $('#imagesResults').append(imageSRC(imagesResponseJson.hits[i].webformatURL));
    }
  }
  //If more than 10 photos are returned, display 10 of them

}

function imageSRC(URL){
  return '<img src="' + URL + '">';
}

function submitForm(){
  $('#city-form').on("click", "#citySubmit", event =>{
    //First event, watch for click on go button
    event.preventDefault();
    
    $('.startImagesGroup').hide();
    $('h4').hide();
    //Hide unnecessary starting elements

    city = $('#search-city-input').val();
    //global variable city is equal to user text input
    
    city = city.charAt(0).toUpperCase() + city.slice(1);
    //capitalize first letter of 'city' for clean results return
    
    console.log(city);
    $('#githubResults').html('');
    //Clear githubResults ID
    $('#imagesResults').html('');
    //Clear imagesResults ID

    $('#githubResults').html('<h4 class="load">GITHUB RESULTS LOADING...</h4>');
    $('#imagesResults').html('<h4 class="load">IMAGE RESULTS LOADING...</h4>');
    //Loading API response from both sources

    gitHubAPI(city);
    imagesAPI(city);
    //Take string input, and search using that city    

  })
}

$(submitForm)
