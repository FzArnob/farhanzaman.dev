// Gallery Library
function createGallery(imageUrls, boxSize) {
    const container = document.createElement('div');
    container.classList.add('gallery-container');
  
    // Create and append images
    imageUrls.forEach((url) => {
      const image = document.createElement('img');
      image.src = url;
      image.classList.add('gallery-image');
  
      // Crop and center images
      image.style.objectFit = 'cover';
      image.style.width = boxSize + 'px';
      image.style.height = boxSize + 'px';
  
      
  
      // Add fullscreen view on click
      const zoomIcon = document.createElement('div');
      zoomIcon.classList.add('zoom-icon');
      zoomIcon.classList.add('material-symbols-outlined');
      zoomIcon.classList.add('c-theme');
      zoomIcon.style.fontSize = '50px';
      zoomIcon.innerHTML = 'add_circle';
      zoomIcon.addEventListener('click', () => {
        image.classList.toggle('fullscreen');
      });
      const background = document.createElement('div');
      background.classList.add('gallery-image-back');
  
      // Append image and zoom icon to container
      const imageContainer = document.createElement('div');
      imageContainer.style.width = boxSize + 'px';
      imageContainer.style.height = boxSize + 'px';
      // Add zoom effect on hover
      imageContainer.addEventListener('mouseover', () => {
        image.classList.add('zoomed');
        zoomIcon.style.display = 'block';
        background.style.display = 'block';
      });
  
      imageContainer.addEventListener('mouseout', () => {
        image.classList.remove('zoomed');
        zoomIcon.style.display = 'none';
        background.style.display = 'none';
      });
      imageContainer.classList.add('image-container');
      imageContainer.appendChild(image);
      imageContainer.appendChild(background);
      imageContainer.appendChild(zoomIcon);
      container.appendChild(imageContainer);
    });
  
    return container;
  }
  
  // Usage
  const imageUrls = [
    "https://drive.google.com/uc?export=view&id=1uTNMfmAJ37-eT0bTfvlEbBOkV_o9xAN2",
    "https://drive.google.com/uc?export=view&id=1kk5XwFs6rpB-025pSz5rLFanuUm6-Q4t",
    "https://drive.google.com/uc?export=view&id=1kaUC67zGqKIVqo_cqNnFmYhRh-aArxmu",
    "https://drive.google.com/uc?export=view&id=1kSWSM9_6WkFeP9dZJcCqTMv3m6hAiG7O",
    "https://drive.google.com/uc?export=view&id=1keL-fGWtm-P8RILuG-E5aFxpVDXId6h8",
    "https://drive.google.com/uc?export=view&id=1kbcW8RN7Q6twRR6aes5CfY7e1t_2SFGy",
    "https://drive.google.com/uc?export=view&id=1knnF-6NKTCiVBJU07D-O67vRJsx-2Y_H",
    "https://drive.google.com/uc?export=view&id=1kx9Oy4gTXmTg8zK4UPWPcXhT4501sIsM",
    "https://drive.google.com/uc?export=view&id=1l59pamuCF42zd7_SpjYXA0VYPNfdPGXw",
    "https://drive.google.com/uc?export=view&id=1WELGHhoSQQgZ__fpWe2cWurGe7AO4E2T",
    "https://drive.google.com/uc?export=view&id=1l4V0H-iNS44j5vC3cHEMILm4jyOVFr9T",
    "https://drive.google.com/uc?export=view&id=1hlMVSou2MAYMAy91Fv9xjeIbRfJrgDJM",
    "https://drive.google.com/uc?export=view&id=1k_KetgeWDZxnxZ8Np5RRbMHGIA4cNrgQ",
    "https://drive.google.com/uc?export=view&id=1kUnFaDjnYAAK69K32dQJTklUf_qruPcd",
    "https://drive.google.com/uc?export=view&id=1kJyB6wsATY-gGq0Z658hZm0Rt52i8KAM",
    "https://drive.google.com/uc?export=view&id=1kjKMfW4LBqux3x_5xK3fXgX9qiel4dYl",
    "https://drive.google.com/uc?export=view&id=1lFQVFW868garosNk17RgVgRq-2l-F3q1",
    "https://drive.google.com/uc?export=view&id=1lD_0RMbcd0NhwsITCLfb2bm2i7bjOuKa",
    "https://drive.google.com/uc?export=view&id=1kTWK3N0JFUyRdCjku0leRiy7Cq-bxfGT"
    // Add more image URLs as needed
  ];

  var imageSide = (window.innerWidth/(window.innerWidth/300))-3;

  if(window.innerWidth < 800) imageSide = (window.innerWidth/(window.innerWidth/300))-3;
  else imageSide = (window.innerWidth/(window.innerWidth/400))-3;

  const gallery = createGallery(imageUrls, imageSide);
  document.getElementById('gallery').appendChild(gallery);
  