"use strict";

const hamburger = document.querySelector(".hamburger");
const navList =document.querySelector(".nav__list");
const links = navList.querySelectorAll("li");
const body = document.querySelector("body");
const header = document.querySelector(".header");
const nav = document.querySelector(".nav");
const logo = nav.querySelector(".nav__logo");

const windowWidth = window.innerWidth;


if (windowWidth <= 750) {
    navList.classList.add('closed');
}

window.addEventListener('resize', () => {
    if (window.innerWidth <= 750 && !navList.classList.contains("open")) {
        navList.classList.add('closed');
    } else {
        navList.classList.remove('closed');
    }
});

hamburger.addEventListener("click", () => {
    body.classList.toggle("non-scrollable");
    header.classList.toggle("open");
    nav.classList.toggle("open");

    // the mobile menu is opened
    if (navList.classList.contains("open")) {
        navList.classList.remove("open");
        hamburger.classList.remove("open");
        navList.classList.add("closed");

    // the mobile menu is closed
    } else {
        navList.classList.remove("closed");
        hamburger.classList.add("open");
        navList.classList.add("open");   
    }
})

links.forEach(link => {
    link.addEventListener("click", () => {
        if (navList.classList.contains("open")) {
            body.classList.toggle("non-scrollable");
            header.classList.toggle("open");
            nav.classList.toggle("open");
            navList.classList.remove("open");
            hamburger.classList.remove("open");
            navList.classList.add("closed");
        }
    })
})

