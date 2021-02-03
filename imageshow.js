"use strict";

const carousel = document.querySelector(".carousel");
const imgWrapper = document.querySelector('.carousel__img-wrapper');
const images = Array.from(imgWrapper.children);
const dotsNav = document.querySelector(".carousel__nav");
const dots = Array.from(dotsNav.children);

let auto = true;
const intervalTime = 3000;
let slideInterval;


const showImage = (currentImage, targetImage) => {
  currentImage.classList.remove('current-image');
  targetImage.classList.add('current-image');
}

const updateDots = (currentDot, targetDot) => {
  currentDot.classList.remove("current-image");
  targetDot.classList.add("current-image");
}

function nextImage(){
  const currentImage = imgWrapper.querySelector('.current-image');
  const nextImage = currentImage.nextElementSibling;
  const currentDot = dotsNav.querySelector('.current-image');
  const nextDot = currentDot.nextElementSibling;

  if (nextImage === null) {
    clearInterval(slideInterval);
    auto = false;
    return;
  }

  showImage(currentImage, nextImage);
  updateDots(currentDot, nextDot);
}


//nav indicators
dotsNav.addEventListener("click", e => {
  const targetDot = e.target.closest("button");
  // if the div has been clicked tragetDot === null
  if (!targetDot) return;

  const currentImage = imgWrapper.querySelector(".current-image");
  const currentDot = dotsNav.querySelector(".current-image");
  const targetIndex = dots.findIndex(dot => dot === targetDot);
  const targetImage = images[targetIndex];

  showImage(currentImage, targetImage);
  updateDots(currentDot, targetDot);
})

// Auto slide
if (auto) {
  slideInterval = setInterval(nextImage, intervalTime);

  carousel.addEventListener("click", () => {
    clearInterval(slideInterval);
    auto = false;
  })
}

