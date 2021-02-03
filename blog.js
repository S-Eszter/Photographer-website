"use strict";

// BLOGGER API
var blogID = "7929328601062461135";
var apiKey = "AIzaSyBwp5IW_S5SGLLYjhxFGB4ghR1iQDXXmNw";

// GLOBAL VARIABLES
var gallery = document.querySelector(".gallery");

var nextPageToken;
var fetchLink;
var displayCounter = 0;
var posts;
var loadedImageNumber = 0;
var numberOfOpenedPosts = 0;


// INTERSECTION OBSERVER
// to fetch the next ten posts' data

function activateObserver() {
  const gallery = document.querySelector(".gallery");

  // to find the sixth post counting from the back
  // if it is in the viewport we fetch the data of the next ten posts
  const length = gallery.childNodes.length - 6;
  const fifthElement = gallery.childNodes[length];

  const options = {
    root: null, 
    treshold: 0, 
    rootMargin: "0px"
  }

  var observer = new IntersectionObserver(function(entries) {
    if (!entries[0].isIntersecting) return; 
    loadMore(nextPageToken);
    observer.unobserve(entries[0].target);
    
  }, options);

  
  observer.observe(fifthElement);
}



/********************************************************************/

// CLOSING THE MODAL WITH THE BROWSER'S BACK BUTTON
// HISTORY API
function goBackInState(event){

  closePost();

  // if it's null, it means only one post was opened
  // if it is 1 or more, it means a new post / posts has / have been displayed in the opened modal
  // the user clicks the browser's back button, we close the modal and go back to null state
  if (event.state) { //  we in this state AFTER clicking the back button!!
    const numberOfAddedStates = event.state.numOfOpenedPosts;
    const delta = -1 * numberOfAddedStates;
    history.go(delta);
  }

  numberOfOpenedPosts = 0;
}

// CLOSING THE POST
function closePost() {
  const postContainer = document.querySelector(".post-container");
  postContainer.classList.remove("visible");
  postContainer.innerHTML = "";
  const overlay = document.querySelector("#overlay");
  overlay.classList.remove("active");
  const body = document.querySelector("body");
  body.classList.remove("non-scrollable");
  loadedImageNumber = 0;

  // remove it before history.back() would trigger it again (?)
  window.removeEventListener("popstate", goBackInState)
}


// CHECKING THE SIZE OF THE TEXT OF THE OPENED POST ITEM
// AFTER THE IMAGES HAS BEEN LOADED AND RENDERED

function checkPostTextSize() {
  const postTextCont = document.querySelector(".post-text-cont");
  const postGridCont = document.querySelector(".post-grid-cont");
  const images = postGridCont.querySelectorAll("img");
  const imagesArray = Array.from(images);
  
  // to find the smallest image height => grid-auto-row height 
  const heights = imagesArray.map(image => image.height);
  heights.sort((a, b) => a - b);
  const smallestImageHeight = heights[0];

  // the height of the text container relative to the smallest image height
  const textContHeightRatio = postTextCont.clientHeight / smallestImageHeight;
  const roundedRatio = Math.ceil(textContHeightRatio);

  // ezen még van mit javítani...
  switch (roundedRatio) {
    case 2:
      postTextCont.classList.add("medium-text");
      break;
    case 3:
      postTextCont.classList.add("large-text");
      break;
    case 4:
      postTextCont.classList.add("extra-large-text");
      break;
    case 5:
      postTextCont.classList.add("extra-large2-text");
      break;
    case 6:
      postTextCont.classList.add("extra-large3-text");
      break;
    case 7:
      postTextCont.classList.add("extra-large4-text");
      break;
    case 8:
      postTextCont.classList.add("extra-large5-text");
      break;
    case 9:
      postTextCont.classList.add("extra-large6-text");
      break;
    case 10:
      postTextCont.classList.add("extra-large7-text");
      break;
    case 11:
      postTextCont.classList.add("extra-large8-text");
      break;
    default:
      console.log("más a mérte");
  }
}

// CHECKING THE SIZE OF IMAGES OF THE OPENED POST ITEM
function checkPostImgSize(postImgCont, smallImgUrls, loadedImageNumber) {
  const height = postImgCont.childNodes[0].childNodes[0].naturalHeight;
  const width = postImgCont.childNodes[0].childNodes[0].naturalWidth;

  if (height > width) {
    postImgCont.classList.add("tall-image");
  }

  // checking the post text size after all images have been loaded
  if (loadedImageNumber === smallImgUrls.length) {
    checkPostTextSize();
  }
}

// EXTRACTING THE PATH TO AN OTHER POST
function extractPostPath(e){
  const path = e.target.dataset.postPath;
  fetchInnerPost(path);
}

// EXTRACTING THE POST URL FROM THE EVENT TARGET
function extractPostUrl(post) {
  const postUrl = post.dataset.postLink;
  fetchPost(postUrl);
}

// ADDING EVENT LISTENERS TO THE NEWLY DISPLAYED POST ITEMS
function addEventLisToPosts(displayCounter) {
  let posts = document.querySelectorAll(`.display-${displayCounter}`);
  posts.forEach((post) => {
    post.addEventListener("click", () => {
      extractPostUrl(post);
    });
  });
}

// CHECKING THE SIZE OF GALLERY IMAGES
function checkImageSize(galleryImg) {
  const height = galleryImg.childNodes[1].childNodes[0].naturalHeight;
  const width = galleryImg.childNodes[1].childNodes[0].naturalWidth;
  if (height > width) {
    galleryImg.classList.add("tall-image");
  }
}

/******************************************************************************/
// FUNCTIONS DISPLAYING THE DATA

// DISPLAYING THE SELECTED POST
function displayPostItem(
  published,
  title,
  text,
  originalImgUrls,
  smallImgUrls
) {
  const postContainer = document.querySelector(".post-container");
  postContainer.innerHTML = "";
  postContainer.classList.add("visible");

  const postGridCont = document.createElement("div");
  postGridCont.classList.add("post-grid-cont");
  postContainer.appendChild(postGridCont);

  // adding images to the post
  originalImgUrls.forEach((url) => {
    const imgCont = document.createElement("div");
    imgCont.classList.add("post-img-cont");
    const originalImgLink = document.createElement("a");
    originalImgLink.setAttribute("href", url);
    originalImgLink.setAttribute("target", "_blank");
    originalImgLink.classList.add("post-img-link");
    imgCont.appendChild(originalImgLink);
    postGridCont.appendChild(imgCont);
  });

  const imageLinks = document.querySelectorAll(".post-img-link");

  smallImgUrls.forEach((url, index, smallImgUrls) => {
    const imgTag = document.createElement("img");
    imgTag.setAttribute("src", url);

    // assigning the small image to the right large image link
    imageLinks[index].appendChild(imgTag);

    const postImgCont = imageLinks[index].parentNode;

    // check the size of the image after loaded
    imgTag.addEventListener("load", () => {
      loadedImageNumber++;
      checkPostImgSize(postImgCont, smallImgUrls, loadedImageNumber);
    });
  });

  // adding texts to the post
  const textContainer = document.createElement("div");
  textContainer.classList.add("post-text-cont");

  const publishedP = document.createElement("p");
  publishedP.innerHTML = published;
  publishedP.classList.add("pub-date");
  textContainer.appendChild(publishedP);

  const titleH = document.createElement("h3");
  titleH.innerHTML = title;
  textContainer.appendChild(titleH);

  text.forEach((p) => {
    const paragraph = document.createElement("p");
    paragraph.classList.add("post-p");
    paragraph.innerHTML = p;
    textContainer.appendChild(paragraph);
  });

  postGridCont.appendChild(textContainer);


  // adding the close button to the post
  const backWrapper = document.createElement("div");
  backWrapper.classList.add("back-wrapper");
  const backButton = document.createElement("button");
  backButton.classList.add("button");
  backButton.classList.add("button--dark");
  backButton.setAttribute("id", "back");
  backButton.innerHTML = "Vissza";
  backWrapper.appendChild(backButton);
  postContainer.appendChild(backWrapper);


  // the background of the post
  const overlay = document.querySelector("#overlay");
  overlay.classList.add("active");
  const body = document.querySelector("body");
  body.classList.add("non-scrollable");


  // external links open in new tab
  const externalLinks = textContainer.querySelectorAll("a");
  externalLinks.forEach((link) => {
    link.setAttribute("target", "_blank");
  })

  // adding event listener to post links
  // they are inside the appended paragraghs
  const postSpans = document.querySelectorAll(".post-link");
  postSpans.forEach((span) => {
    span.addEventListener("click", (e) => {
      loadedImageNumber = 0;
      extractPostPath(e);
    })
  }) 

  // adding event listeners for closing the post
  backButton.addEventListener("click", (event) => {
    closePost(event);
  });

  // closing with esc
  document.addEventListener("keydown", (event) => {
    if (event.keyCode === 27) {
      closePost(event);
    }
  });

  // closing the modal with the browser's back button
  window.addEventListener('popstate', goBackInState);

}


// DISPLAYING THE POSTS IN THE GALLERY (10 ITEMS PER FETCH)
function displayPostImages(postInfos) {
  displayCounter++;

  postInfos.forEach((postInfo) => {
    const galleryImg = document.createElement("div");
    galleryImg.classList.add("blog-img-div");
    galleryImg.innerHTML = `<p>${postInfo.postTitle}</p><div class="post display-${displayCounter}" data-post-link=${postInfo.postLink}><img class="blog-image" src=${postInfo.postImageUrl}></img></div>`;
    gallery.appendChild(galleryImg);

    // checking the size of the images
    const img = galleryImg.childNodes[1].childNodes[0];
    img.addEventListener("load", () => {
      checkImageSize(galleryImg);
    });
  });

  addEventLisToPosts(displayCounter);
}


/*******************************************************************/
// FETCHED DATA HANDLING FUNCTIONS

// HANDLES THE DATA OF THE SELECTED AND FETCHED POST
function handlePostData(postData) {

  let published = postData.published.slice(0, 10);
  let title = postData.title;
  let content = postData.content;

  // regular expressions (inkább majd az adott helyre berakni!)
  const regexpLineBreaks = /\n/g;
  const regexpPara = /<p[>| ][^&].+?>?.+?<\/p>/g; // /<p[>| ][^<&].+?>?.+?<\/p>/g ez volt!!!!!!!!!!
  const regexpWhiteSpace = /&nbsp;/g;
  const regexpBlogLinks = /<a href=\"https?:\/\/fenykoto.blogspot.com\/.+?>.+?<\/a>/g;
  const regexpPostPath = /\/20.+?.html/g;
  const regexpLinkText = />.+?</g;
  const regexp1 = />/g;
  const regexp2 = /</g;
  const regexpBr = /<br \/>/g;
  const regexpClosingP = /<\/p>/g;
  const regexpOpeningP = /<p>/g;
  const regexpOpeningPLong = /<p.+?>/g;
  const regexpOriginalImage = /<a href=\"https?:\/\/[1-9].bp.blogspot.com.+?>/g;
  const regexpRawOrImgUrl = /"https?:\/\/.+?"/g;
  const regexpQuotes = /\"/g;
  const regexpSmallImage = /<img.+?\/>/g;
  const regexpRawSmallImgUrl = /"http.+?"/g;

  // clearing the content from line breaks
  let clearedContent = content.replace(regexpLineBreaks, "");


  // CHECKING AND CHANGING THE ORIGINAL POST LINKS FOR FURTHER USAGE

  let blogPostLinks = Array.from(clearedContent.matchAll(regexpBlogLinks), (m) => m[0]);

  let blogPostPaths =[];
  let linkTexts =[];

  // if there is a post link in the text, extracts the path and the inner text
  if (blogPostLinks.length > 0){

    // extracting the post path
    blogPostLinks.forEach((postLink) => {
      let postPath = postLink.match(regexpPostPath);
      blogPostPaths.push(postPath);
    })

    // extracting the text from the link
    blogPostLinks.forEach((postLink) => {
      let rawLinkTextArray = postLink.match(regexpLinkText);
      let rawLinkTextString = rawLinkTextArray[0];
      let rawLinkText2 = rawLinkTextString.replace(regexp1, "");
      let linkText = rawLinkText2.replace(regexp2, "");
      linkTexts.push(linkText);
    })
  }
  
  function replacer(match){
    let postPath = match.match(regexpPostPath).join();
    let rawLinkText = match.match(regexpLinkText).join();
    let rawLinkText2 = rawLinkText.replace(regexp1, "");
    let linkText = rawLinkText2.replace(regexp2, "");
    let linkReplacer = `<span data-post-path=${postPath} class="post-link">${linkText}</span>`
    return linkReplacer;
  }

  let textWithPostLinks = clearedContent.replace(regexpBlogLinks, replacer);


  // EXTRACTING THE "REAL" TEXT FROM THE CONTENT
  
  // extracting the paragraphs

  let rawTexts = Array.from(textWithPostLinks.matchAll(regexpPara), (m) => m[0]);

  let text = [];

  rawTexts.forEach((rawText) => {
    let text1 = rawText.replace(regexpWhiteSpace, "");
    let text2 = text1.replace(regexpBr, "");
    let text3 = text2.replace(regexpClosingP, "");
    let text4 = text3.replace(regexpOpeningP, "");
    let text5 = text4.replace(regexpOpeningPLong, "");
    let text6 = text5.trim(); // kell ez???
    text.push(text6);
  });

  console.log(text);


  // DEALING WITH THE LARGE IMAGE LINKS

  let rawOriginalImages = Array.from(
    clearedContent.matchAll(regexpOriginalImage),
    (m) => m[0]
  );

  let originalImgUrls = [];

  rawOriginalImages.forEach((rawOriginalImage) => {
    let rawOrImgUrl = rawOriginalImage.match(regexpRawOrImgUrl);
    let finalOrImgUrl = rawOrImgUrl[0].replace(regexpQuotes, "");
    originalImgUrls.push(finalOrImgUrl);
  });


  // DEALING WITH THE SMALL IMAGE LINKS

  let rawSmallImages = Array.from(
    clearedContent.matchAll(regexpSmallImage),
    (m) => m[0]
  );

  let smallImgUrls = [];

  rawSmallImages.forEach((rawSmallImage) => {
    let rawSmallImgUrl = rawSmallImage.match(regexpRawSmallImgUrl);
    let finalSmallImgUrl = rawSmallImgUrl[0].replace(regexpQuotes, "");
    smallImgUrls.push(finalSmallImgUrl);
  });

  displayPostItem(published, title, text, originalImgUrls, smallImgUrls);
}


// HANDLES THE DATA OF 10 POST ITEMS
function handlePostItems(data) {
  let postInfos = [];

  // extracting the necessary information and creating an array of objects from them
  for (let {
    images: [{ url: postImageUrl }],
    selfLink: postLink,
    title: postTitle,
  } of data.items) {
    let postInfo = {
      postImageUrl: postImageUrl,
      postLink: `${postLink}?key=${apiKey}&fetchImages=True`,
      postTitle: postTitle,
    };
    postInfos.push(postInfo);
  }

  displayPostImages(postInfos);
}

/***************************************************************************/

function updateNextPageToken(data) {
  nextPageToken = data.nextPageToken;
  return nextPageToken;
}

/*****************************************************************************/
// FETCH FUNCTIONS

// FETCHING A POST ITEM AFTER CLICKING A POST LINK
async function fetchInnerPost(path) {
  fetchLink = `https://www.googleapis.com/blogger/v3/blogs/7929328601062461135/posts/bypath?path=${path}&key=${apiKey}&fetchImages=True`
  const postData = await fetchApi(fetchLink);

  // History API
  numberOfOpenedPosts++;
  const stateObject = {numOfOpenedPosts: numberOfOpenedPosts};
  history.pushState(stateObject, "");

  handlePostData(postData);
}

// FETCHING A SINGLE POST ITEM
async function fetchPost(postUrl) {

  const postData = await fetchApi(postUrl);

  // History API
  numberOfOpenedPosts++;
  const stateObject = {numOfOpenedPosts: numberOfOpenedPosts};
  history.pushState(stateObject, "");

  handlePostData(postData);
}

// FETCHING THE NEXT TEN POST ITEMS
async function loadMore(nextPageToken) {
  fetchLink = `https://www.googleapis.com/blogger/v3/blogs/${blogID}/posts?key=${apiKey}&fetchImages=True&pageToken=${nextPageToken}`;
  const data = await fetchApi(fetchLink);
  handlePostItems(data);
  updateNextPageToken(data);
  activateObserver();
}

// FETCHING THE FIRST 10 POSTS
async function fetchPosts() {
  fetchLink = `https://www.googleapis.com/blogger/v3/blogs/${blogID}/posts?key=${apiKey}&fetchImages=True`;
  const data = await fetchApi(fetchLink);
  handlePostItems(data);
  updateNextPageToken(data);
  activateObserver();
}

// THE GENERAL FETCH FUNCTION
async function fetchApi(url) {
  const dataFetch = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: apiKey,
    },
  });
  const data = await dataFetch.json();
  return data;
}

fetchPosts();
