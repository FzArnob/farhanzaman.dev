/** Maps a 0-100 skill percentage onto the label shown at the end of a skill bar. */
export function getExpertiseLevel(percentage: number | string): string {
  const value = Number(percentage);
  if (value >= 0 && value < 16) {
    return 'Novice';
  } else if (value >= 16 && value < 31) {
    return 'Fundamental';
  } else if (value >= 31 && value < 46) {
    return 'Intermediate';
  } else if (value >= 46 && value < 61) {
    return 'Competent';
  } else if (value >= 61 && value < 76) {
    return 'Advanced';
  } else if (value >= 76 && value <= 91) {
    return 'Expert';
  } else {
    return 'Mastery';
  }
}
