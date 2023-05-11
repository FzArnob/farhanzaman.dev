const skillTags = [
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "PHP",
  "SpringBoot",
  "ReactJS",
  "MongoDB",
  "NodeJS",
  "MySQL",
  "NoSQL",
  "GraphQL",
  "Selenium",
  "OOD",
  "Redux",
  "jQuery",
  "Photoshop",
  "Illustrator",
  "Excel",
  "PowerPoint"
];
var radius;
if (window.innerWidth <= 800){
  radius = window.innerWidth/2;
} else {
  radius = window.innerWidth/4;
  if(radius > 400 ) radius = 400;
}
var tagCloud = TagCloud(".skillTags", skillTags, {
  // radius in px
  radius: radius,

  // animation speed
  // slow, normal, fast
  maxSpeed: "fast",
  initSpeed: "normal",

  // 0 = top
  // 90 = left
  // 135 = right-bottom
  direction: 135,

  // interact with cursor move on mouse out
  keep: true,
});
var textSize = Math.floor(20*radius/300);
// console.log(radius,"--" ,Math.floor(20*radius/300));
document.getElementById("skill-canvas").firstChild.style.fontSize =  textSize + "px";
// console.log(document.getElementById("skill-canvas").firstChild.style.fontSize);

//To change the color of text randomly
// var colors = ["#34A853", "#FBBC05", "#4285F4", "#7FBC00", "FFBA01", "01A6F0"];
// var random_color = colors[Math.floor(Math.random() * colors.length)];
// document.querySelector(".content").style.color = random_color;
