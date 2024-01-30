<!-- IconRenderer.svelte -->
<script>
  export let collection;
  let col = null;
  const drawingIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-square-drawing.svg" />';
  const stopMotionIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-square-animation.svg" />';
  const AudioIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-square-music.svg.svg" />';
  const videoIcon =
    '<img class="icon" src="assets/SHB/svg/AW-icon-play.svg" />';
  const animalChallengeIcon = '<img class="icon" src="/assets/svg/apps/animalChallenge-icon.svg" />';
  const flowerChallengeIcon = '<img class="icon" src="/assets/svg/apps/flowerChallenge-icon.svg" />';
console.log('collection prop', collection);
  let icon;
  if (collection === 'drawing') {
    icon = drawingIcon;
  } else if (collection === 'stopmotion') {
    icon = stopMotionIcon;
  } else if (collection === 'audio') {
    icon = AudioIcon;
  } else if (collection === 'video') {
    icon = videoIcon;
  } else if (collection === 'animalchallenge') {
    icon = animalChallengeIcon;
  } else if (collection === 'flowerchallenge') {
    icon = flowerChallengeIcon;
  }
  console.log('icon', icon);
</script>

{@html icon}