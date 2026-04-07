export const LOCAL_COURSE_IMAGES = [
  "0_0KRgUt89FqQzWjtc.jpg",
  "4269692_edc2_2.webp",
  "Cybersecurity_analyst.webp",
  "GettyImages-1093461000.jpg",
  "GettyImages-689291632_optimized.jpg",
  "GettyImages-755651077.jpg",
  "SJULTRA-Cybersecurity-Certifications-featured-image.png",
  "Specialization-logo.png",
  "Spreadsheet-folder-computer-laptop-scaled.jpg",
  "clf-badge-resized.2fdbed6fe7b39cf6cef5063f283ddd689cc78caa.png",
  "coding-man_1098-18084.avif",
  "computer-programmer_.jpg",
  "cyber-analyst.jpg",
  "images.jpg",
  "istockphoto-2156385097-612x612.jpg",
  "istockphoto-2182250916-612x612.jpg",
  "laptop-typing-office-workstation-computer.jpg",
  "paratime.vn-groups-04.jpg",
  "ph-pic-black-businesswoman-working-desk-laptop-2109768191-ne.avif",
  "young-adult-asian-male-female-600nw-2575721373.webp"
];

export const getCourseThumbnail = (course) => {
  // If the course explicitly has an image from the API, we try to use it
  if (course.thumbnail || course.thumbnail_url || course.image) {
    return course.thumbnail || course.thumbnail_url || course.image;
  }
  
  // Otherwise, deterministically pick an image from the local folder based on course ID
  if (course.id) {
    const index = parseInt(course.id) % LOCAL_COURSE_IMAGES.length;
    return `/course_images/${LOCAL_COURSE_IMAGES[index]}`;
  }
  
  // Fallback to the first image if no ID
  return `/course_images/${LOCAL_COURSE_IMAGES[0]}`;
};
