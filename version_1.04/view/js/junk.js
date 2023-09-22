workCard.addEventListener("mousemove", function rotate3DOnHover(event) {
    const divRect = workCard.getBoundingClientRect();
    const divCenterX = divRect.left + divRect.width / 2;
    const divCenterY = divRect.top + divRect.height / 2;
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      // Calculate the distance between the mouse pointer and the center of the div
      const distanceX = mouseX - divCenterX;
      const distanceY = mouseY - divCenterY;
      const maxDistanceX = Math.abs(divRect.left-divCenterX);
      const maxDistanceY = Math.abs(divRect.top-divCenterY);
      const ratioX = (distanceX / maxDistanceX) * -1;
      const ratioY = distanceY / maxDistanceY;
      // console.log(`distanceX: ${distanceX}, distanceY: ${distanceY}, maxDistanceX: ${maxDistanceX}, maxDistanceY: ${maxDistanceY}, ratioX: ${ratioX}, ratioY: ${ratioY}`);
      // Calculate the overall distance using the Pythagorean theorem
      const distanceFromCenter = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
      const maxDistanceFromCenter = Math.sqrt(maxDistanceX * maxDistanceX + maxDistanceY * maxDistanceY);

      // console.log('Distance from center:', distanceFromCenter, " max:"+ maxDistanceFromCenter);
  
      const maxRotation = 8; // Maximum rotation angle in degrees
      const minRotation = 0; // Minimum rotation angle in degrees
      const rotationRange = maxRotation - minRotation;
  
      const rotation = minRotation + (distanceFromCenter / maxDistanceFromCenter) * rotationRange;
      const maxShadowDepthX = Math.floor(ratioX*-2);
      const maxShadowDepthY = Math.floor(ratioY*2);
      const maxBoxShadowDepthX = Math.floor(ratioX*-8);
      const maxBoxShadowDepthY = Math.floor(ratioY*8);
      // console.log(maxBoxShadowDepthX,  maxBoxShadowDepthY);
      typeTag.style.transition = "none";
      stackTag.style.transition = "none";
      title.style.transition = "all 0.01s";
      details.style.transition = "all 0.01s";
      workCard.style.transition = "all 0.01s";
      // tagsContainer.style.transform = `translate(${}, ${})`;
      workCard.style.boxShadow = `${maxBoxShadowDepthX}px ${maxBoxShadowDepthY}px 10px rgba(0,0,0, 0.2)`;
      stackTag.style.boxShadow = `${maxBoxShadowDepthX}px ${maxBoxShadowDepthY}px 2px rgba(0,0,0, 0.2)`;
      typeTag.style.boxShadow = `${maxBoxShadowDepthX}px ${maxBoxShadowDepthY}px 2px rgba(0,0,0, 0.2)`;
      // title.style.textShadow = `${maxShadowDepthX}px ${maxShadowDepthY}px 0px rgba(0,0,0, 0.4)`;
      // details.style.textShadow = `${maxShadowDepthX}px ${maxShadowDepthY}px 0px rgba(0,0,0, 0.4)`;
      // console.log("rotation: "+ rotation);
      workCard.style.transform = `perspective(600px) rotate3d(${ratioY}, ${ratioX}, 0, ${rotation}deg)`;
    });
    workCard.addEventListener("mouseleave", function resetRotation() {
      workCard.style.transform = "none";
      workCard.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.2)";
      typeTag.style.boxShadow = "none";
      stackTag.style.boxShadow = "none";
      // title.style.textShadow = "none";
      // details.style.textShadow = "none";
    });