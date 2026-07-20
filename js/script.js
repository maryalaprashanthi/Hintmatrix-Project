const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");
const next = document.querySelector(".next");
const prev = document.querySelector(".prev");

let currentSlide = 0;

// Show Slide
function showSlide(index){

    slides.forEach((slide)=>{
        slide.classList.remove("active");
    });

    dots.forEach((dot)=>{
        dot.classList.remove("active");
    });

    slides[index].classList.add("active");
    dots[index].classList.add("active");
}

// Next Button
next.addEventListener("click",()=>{

    currentSlide++;

    if(currentSlide >= slides.length){
        currentSlide = 0;
    }

    showSlide(currentSlide);

});

// Previous Button
prev.addEventListener("click",()=>{

    currentSlide--;

    if(currentSlide < 0){
        currentSlide = slides.length - 1;
    }

    showSlide(currentSlide);

});

// Dot Navigation
dots.forEach((dot,index)=>{

    dot.addEventListener("click",()=>{

        currentSlide = index;
        showSlide(currentSlide);

    });

});

// Auto Slide
setInterval(()=>{

    currentSlide++;

    if(currentSlide >= slides.length){
        currentSlide = 0;
    }

    showSlide(currentSlide);

},4000);
const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.querySelector(".nav-menu");

menuToggle.addEventListener("click", () => {

    navMenu.classList.toggle("active");

});